#!/usr/bin/env python3
"""
Fast Court Order PDF Extraction — Mistral OCR 3
Extracts case info, parties, children, and classified sections from
Arizona family court order PDFs using Mistral OCR 3 + structured annotation.

Usage:
  python extract_court_order.py <path_to_pdf>
  python extract_court_order.py --serve  # Run as FastAPI microservice

Requirements:
  pip install httpx python-dotenv
  pip install fastapi uvicorn python-multipart  # only for --serve mode
"""

import sys
import os
import json
import time
import re
import base64
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

# Load .env.local from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr"
MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_FILES_URL = "https://api.mistral.ai/v1/files"

HEADERS = {
    "Authorization": f"Bearer {MISTRAL_API_KEY}",
}

# ============================================================
# Structured extraction prompt for classification step
# ============================================================

EXTRACTION_PROMPT = """You are analyzing an Arizona family court order. The OCR text (markdown) is provided below.

Extract metadata and classify content by topic. Return ONLY valid JSON (no markdown, no code fences):

{
  "caseNumber": "e.g. FC2024-001234 or null",
  "petitionerName": "full name or null",
  "respondentName": "full name or null",
  "courtName": "full court name or null",
  "orderDate": "MM/DD/YYYY or null",
  "orderTitle": "title of the order or null",
  "judgeName": "judge name or null",
  "children": [{"name": "full name", "dateOfBirth": "MM/DD/YYYY or null"}],
  "sections": [
    {
      "type": "legal_decision_making|parenting_time|child_support",
      "pageNumber": "page number string or null",
      "paragraphNumber": "paragraph/section number or null",
      "orderDate": "MM/DD/YYYY or null",
      "summary": "1-2 sentence summary",
      "verbatimText": "cleaned verbatim text from the order"
    }
  ]
}

RULES:
- Return ONLY JSON. No other text.
- Use null for unknown fields.
- sections: Only include legal_decision_making, parenting_time, child_support sections.
- pageNumber: Use the page number where the section starts (from page markers in the OCR text).
- paragraphNumber: Look for "7.", "VII.", "A.", "(a)", "Section 3", etc.
- verbatimText: Use exact content but fix OCR artifacts (broken words, stray line numbers, spacing)."""


# ============================================================
# Step 1: Upload PDF to Mistral Files API
# ============================================================

def upload_file(pdf_bytes: bytes, filename: str = "court-order.pdf") -> str:
    """Upload PDF to Mistral Files API, return file_id."""
    resp = httpx.post(
        MISTRAL_FILES_URL,
        headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"},
        files={"file": (filename, pdf_bytes, "application/pdf")},
        data={"purpose": "ocr"},
        timeout=30.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["id"]


# ============================================================
# Step 2: Mistral OCR 3 — extract text with structure
# ============================================================

def ocr_extract(file_id: str) -> list[dict]:
    """Call Mistral OCR 3 API with uploaded file. Returns list of pages."""
    payload = {
        "model": "mistral-ocr-latest",
        "document": {
            "type": "file_id",
            "file_id": file_id,
        },
        "include_image_base64": False,
    }

    resp = httpx.post(
        MISTRAL_OCR_URL,
        headers={**HEADERS, "Content-Type": "application/json"},
        json=payload,
        timeout=60.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("pages", [])


def ocr_extract_base64(pdf_bytes: bytes) -> list[dict]:
    """Call Mistral OCR 3 with base64-encoded PDF (no file upload needed)."""
    b64 = base64.b64encode(pdf_bytes).decode("utf-8")
    data_url = f"data:application/pdf;base64,{b64}"

    payload = {
        "model": "mistral-ocr-latest",
        "document": {
            "type": "document_url",
            "document_url": data_url,
        },
        "include_image_base64": False,
    }

    resp = httpx.post(
        MISTRAL_OCR_URL,
        headers={**HEADERS, "Content-Type": "application/json"},
        json=payload,
        timeout=60.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("pages", [])


# ============================================================
# Step 3: Classify with Mistral chat (mistral-small)
# ============================================================

def classify_sections(full_text: str, pages_data: list[dict]) -> dict:
    """Send OCR text to Mistral for structured classification."""
    # Build page-annotated text for the AI
    annotated_text = ""
    for page in pages_data:
        page_num = page.get("index", 0) + 1
        markdown = page.get("markdown", "")
        annotated_text += f"\n--- PAGE {page_num} ---\n{markdown}\n"

    # Cap at 80K chars
    if len(annotated_text) > 80000:
        annotated_text = annotated_text[:80000] + "\n\n[...truncated...]"

    payload = {
        "model": "mistral-small-latest",
        "max_tokens": 8192,
        "messages": [
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": annotated_text},
        ],
    }

    resp = httpx.post(
        MISTRAL_CHAT_URL,
        headers={**HEADERS, "Content-Type": "application/json"},
        json=payload,
        timeout=60.0,
    )
    resp.raise_for_status()
    data = resp.json()

    ai_text = data["choices"][0]["message"]["content"].strip()
    # Strip markdown code fences if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", ai_text)
    json_str = match.group(1).strip() if match else ai_text

    return json.loads(json_str)


# ============================================================
# Build blocks from OCR pages (for fullOrderContent compatibility)
# ============================================================

def build_blocks_from_ocr(pages_data: list[dict]) -> list[dict]:
    """Convert OCR pages into flat blocks with IDs."""
    blocks = []
    for page in pages_data:
        page_num = page.get("index", 0) + 1
        markdown = page.get("markdown", "")
        for line in markdown.split("\n"):
            text = line.strip()
            if text:
                blocks.append({
                    "id": f"b-{len(blocks)}",
                    "text": text,
                    "page_num": page_num,
                })
    return blocks


# ============================================================
# Main extraction pipeline — Mistral OCR 3
# ============================================================

def extract_court_order(
    pdf_path: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
) -> dict:
    """Full extraction pipeline using Mistral OCR 3."""
    t0 = time.time()

    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY not set in environment")

    # Read PDF bytes
    if pdf_path:
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
    elif pdf_bytes is None:
        raise ValueError("Provide either pdf_path or pdf_bytes")

    # Step 1: OCR via Mistral OCR 3 (base64 — no upload step needed)
    t1 = time.time()
    pages_data = ocr_extract_base64(pdf_bytes)
    t_ocr = time.time() - t1

    total_chars = sum(len(p.get("markdown", "")) for p in pages_data)
    print(
        f"[extract] OCR: {len(pages_data)} pages, {total_chars} chars ({t_ocr:.2f}s)"
    )

    if not pages_data or total_chars < 50:
        raise ValueError("OCR extracted too little text — document may be empty or corrupted")

    # Step 2: Build blocks from OCR output
    blocks = build_blocks_from_ocr(pages_data)
    print(f"[extract] {len(blocks)} blocks built from OCR")

    # Step 3: AI classification
    t2 = time.time()
    ai_data = classify_sections(
        "\n".join(p.get("markdown", "") for p in pages_data),
        pages_data,
    )
    t_classify = time.time() - t2
    print(f"[extract] AI classification done ({t_classify:.2f}s)")

    # Step 4: Build fullOrderContent (compatible with existing app format)
    full_order_content = [
        {
            "paragraphId": b["id"],
            "heading": None,
            "text": b["text"],
            "sectionGroup": "orders",
            "type": "other",
            "pageNum": b["page_num"],
        }
        for b in blocks
    ]

    result = {
        "extractedData": {
            "caseNumber": ai_data.get("caseNumber"),
            "petitionerName": ai_data.get("petitionerName"),
            "respondentName": ai_data.get("respondentName"),
            "courtName": ai_data.get("courtName"),
            "orderDate": ai_data.get("orderDate"),
            "orderTitle": ai_data.get("orderTitle"),
            "judgeName": ai_data.get("judgeName"),
            "children": ai_data.get("children", []),
            "sections": ai_data.get("sections", []),
            "fullOrderContent": full_order_content,
            "confidence": "high",
        },
        "_debug": {
            "totalPages": len(pages_data),
            "totalBlocks": len(blocks),
            "totalChars": total_chars,
            "linesPerPage": [
                len(p.get("markdown", "").split("\n")) for p in pages_data
            ],
            "timings": {
                "ocrExtraction": round(t_ocr, 3),
                "aiClassification": round(t_classify, 3),
                "total": round(time.time() - t0, 3),
            },
            "engine": "mistral-ocr-3",
        },
    }

    total_time = time.time() - t0
    print(
        f"[extract] Done: {len(full_order_content)} content blocks, "
        f"{len(ai_data.get('sections', []))} sections, "
        f"{total_time:.1f}s total"
    )

    return result


# ============================================================
# FastAPI microservice mode
# ============================================================

def run_server(host: str = "0.0.0.0", port: int = 8100):
    """Run as a FastAPI microservice."""
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn

    app = FastAPI(title="Court Order Extractor (Mistral OCR 3)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["POST"],
        allow_headers=["*"],
    )

    @app.post("/extract")
    async def extract_endpoint(file: UploadFile = File(...)):
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files accepted")

        pdf_bytes = await file.read()
        if len(pdf_bytes) > 10 * 1024 * 1024:
            raise HTTPException(400, "File must be under 10MB")

        try:
            result = extract_court_order(pdf_bytes=pdf_bytes)
            return result
        except ValueError as e:
            raise HTTPException(422, str(e))
        except Exception as e:
            raise HTTPException(500, f"Extraction failed: {e}")

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    print(f"Starting extraction server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)


# ============================================================
# CLI entry point
# ============================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print(f"  python {sys.argv[0]} <path_to_pdf>")
        print(f"  python {sys.argv[0]} --serve [--port 8100]")
        sys.exit(1)

    if sys.argv[1] == "--serve":
        port = 8100
        if "--port" in sys.argv:
            port = int(sys.argv[sys.argv.index("--port") + 1])
        run_server(port=port)
    else:
        pdf_file = sys.argv[1]
        if not os.path.exists(pdf_file):
            print(f"File not found: {pdf_file}")
            sys.exit(1)

        result = extract_court_order(pdf_path=pdf_file)

        # Print summary
        data = result["extractedData"]
        debug = result["_debug"]
        print("\n" + "=" * 60)
        print("EXTRACTION RESULTS (Mistral OCR 3)")
        print("=" * 60)
        print(f"Case Number:  {data['caseNumber']}")
        print(f"Court:        {data['courtName']}")
        print(f"Order Title:  {data['orderTitle']}")
        print(f"Order Date:   {data['orderDate']}")
        print(f"Judge:        {data['judgeName']}")
        print(f"Petitioner:   {data['petitionerName']}")
        print(f"Respondent:   {data['respondentName']}")
        print(f"Children:     {len(data['children'])}")
        for child in data["children"]:
            print(f"  - {child['name']} (DOB: {child.get('dateOfBirth', 'N/A')})")
        print(f"\nSections found: {len(data['sections'])}")
        for sec in data["sections"]:
            pg = f"p.{sec.get('pageNumber', '?')}" if sec.get("pageNumber") else ""
            para = f" {sec.get('paragraphNumber', '')}" if sec.get("paragraphNumber") else ""
            print(f"  [{sec['type']}] {pg}{para} — {sec.get('summary', '')[:80]}")
        print(f"\nTimings: {debug['timings']}")

        # Save full JSON
        out_path = pdf_file.rsplit(".", 1)[0] + "_extracted.json"
        with open(out_path, "w") as f:
            json.dump(result, f, indent=2)
        print(f"\nFull JSON saved to: {out_path}")
