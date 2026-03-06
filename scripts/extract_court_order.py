#!/usr/bin/env python3
"""
Fast Court Order PDF Extraction Script
Extracts case info, parties, children, and classified sections from
Arizona family court order PDFs in under 30 seconds.

Uses: PyMuPDF (fitz) for PDF extraction + Mistral AI for classification.

Usage:
  python extract_court_order.py <path_to_pdf>
  python extract_court_order.py --serve  # Run as FastAPI microservice

Requirements:
  pip install pymupdf httpx python-dotenv
  pip install fastapi uvicorn python-multipart  # only for --serve mode
"""

import sys
import os
import json
import time
import re
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import httpx
from dotenv import load_dotenv

# Load .env.local from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
MISTRAL_MODEL = "mistral-small-latest"
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"

# ============================================================
# PDF Text Extraction (PyMuPDF — 10-50x faster than pdfjs-dist)
# ============================================================

def extract_pdf_text(pdf_path: str) -> tuple[list[dict], str]:
    """Extract text from PDF, returning (pages, full_text).
    Each page = { num, lines, text, item_count }
    """
    doc = fitz.open(pdf_path)
    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        # Extract text blocks with position info
        # flags: TEXT_PRESERVE_WHITESPACE | TEXT_PRESERVE_LIGATURES
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

        lines = []
        for block in blocks:
            if block["type"] != 0:  # Skip image blocks
                continue
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                line_text = "".join(s["text"] for s in spans).strip()
                if line_text:
                    lines.append(line_text)

        pages.append({
            "num": page_num + 1,
            "lines": lines,
            "text": "\n".join(lines),
            "item_count": len(lines),
        })

    doc.close()
    full_text = "\n\n".join(p["text"] for p in pages)
    return pages, full_text


def extract_pdf_text_from_bytes(pdf_bytes: bytes) -> tuple[list[dict], str]:
    """Same as extract_pdf_text but from bytes (for API mode)."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

        lines = []
        for block in blocks:
            if block["type"] != 0:
                continue
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                line_text = "".join(s["text"] for s in spans).strip()
                if line_text:
                    lines.append(line_text)

        pages.append({
            "num": page_num + 1,
            "lines": lines,
            "text": "\n".join(lines),
            "item_count": len(lines),
        })

    doc.close()
    full_text = "\n\n".join(p["text"] for p in pages)
    return pages, full_text


# ============================================================
# Build blocks from pages (each line = one block)
# ============================================================

def build_blocks(pages: list[dict]) -> list[dict]:
    """Convert pages into flat list of text blocks with IDs."""
    blocks = []
    for page in pages:
        for line in page["lines"]:
            if line.strip():
                blocks.append({
                    "id": f"b-{len(blocks)}",
                    "text": line.strip(),
                    "page_num": page["num"],
                })
    return blocks


# ============================================================
# AI Classification via Mistral
# ============================================================

EXTRACTION_PROMPT = """You are analyzing an Arizona family court order. Extract metadata and classify text blocks by topic.

You receive:
1. Full text of the court order
2. Block IDs with page numbers and text previews

Return ONLY valid JSON (no markdown, no code fences):

{
  "caseNumber": "e.g. FC2024-001234 or null",
  "petitionerName": "full name or null",
  "respondentName": "full name or null",
  "courtName": "full court name or null",
  "orderDate": "MM/DD/YYYY or null",
  "orderTitle": "title of the order or null",
  "judgeName": "judge name or null",
  "children": [{"name": "full name", "dateOfBirth": "MM/DD/YYYY or null"}],
  "blockClassifications": {"BLOCK_ID": "legal_decision_making|parenting_time|child_support|other"},
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
- blockClassifications: map each block ID to its topic. Use "other" for unrelated blocks.
- sections: Only include legal_decision_making, parenting_time, child_support sections.

PAGE NUMBERS: Each block shows "(page N)". Set section pageNumber to the page where that section STARTS.

PARAGRAPH NUMBERS: Look for "7.", "VII.", "A.", "(a)", "Section 3", etc. Use the specific paragraph number where the topic begins. Use null if unclear.

VERBATIM TEXT: Use exact content from the order but fix PDF formatting issues:
- Fix broken words split across lines (e.g., "par- enting" -> "parenting")
- Remove stray margin line numbers
- Fix irregular spacing
- Join fragments into proper paragraphs
- Preserve numbered structure and legal citations exactly"""


def classify_with_mistral(
    full_text: str,
    blocks: list[dict],
    timeout: float = 60.0,
) -> dict:
    """Send text + blocks to Mistral for classification."""
    if not MISTRAL_API_KEY:
        raise ValueError("MISTRAL_API_KEY not set in environment")

    # Cap blocks at 400 for token limits
    blocks_for_summary = blocks[:400]
    block_summary = "\n".join(
        f"[{b['id']}] (page {b['page_num']}): {b['text'][:200]}{'...' if len(b['text']) > 200 else ''}"
        for b in blocks_for_summary
    )

    # Cap full text at 80K chars
    text_for_ai = full_text[:80000]
    if len(full_text) > 80000:
        text_for_ai += "\n\n[...truncated...]"

    user_content = (
        f"Here is the full text of the court order:\n\n{text_for_ai}\n\n"
        f"---\n\nBlock IDs:\n{block_summary}"
    )

    payload = {
        "model": MISTRAL_MODEL,
        "max_tokens": 8192,
        "messages": [
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": user_content},
        ],
    }

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    resp = httpx.post(
        MISTRAL_URL,
        json=payload,
        headers=headers,
        timeout=timeout,
    )
    resp.raise_for_status()
    data = resp.json()

    ai_text = data["choices"][0]["message"]["content"].strip()
    # Strip markdown code fences if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", ai_text)
    json_str = match.group(1).strip() if match else ai_text

    return json.loads(json_str)


# ============================================================
# Main extraction pipeline
# ============================================================

def extract_court_order(
    pdf_path: Optional[str] = None,
    pdf_bytes: Optional[bytes] = None,
) -> dict:
    """Full extraction pipeline. Returns structured court order data."""
    t0 = time.time()

    # Step 1: Extract text from PDF
    t1 = time.time()
    if pdf_path:
        pages, full_text = extract_pdf_text(pdf_path)
    elif pdf_bytes:
        pages, full_text = extract_pdf_text_from_bytes(pdf_bytes)
    else:
        raise ValueError("Provide either pdf_path or pdf_bytes")
    t_extract = time.time() - t1

    total_lines = sum(p["item_count"] for p in pages)
    print(
        f"[extract] PDF: {len(pages)} pages, {total_lines} lines, "
        f"{len(full_text)} chars ({t_extract:.2f}s)"
    )

    if not full_text or len(full_text.strip()) < 50:
        raise ValueError("PDF contains too little text — may be scanned/image-only")

    # Step 2: Build blocks
    blocks = build_blocks(pages)
    print(f"[extract] {len(blocks)} blocks built")

    # Step 3: AI classification
    t2 = time.time()
    ai_data = classify_with_mistral(full_text, blocks)
    t_classify = time.time() - t2
    print(f"[extract] AI classification done ({t_classify:.2f}s)")

    # Step 4: Build full order content
    classifications = ai_data.get("blockClassifications", {})
    full_order_content = [
        {
            "paragraphId": b["id"],
            "heading": None,
            "text": b["text"],
            "sectionGroup": "orders",
            "type": classifications.get(b["id"], "other"),
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
            "totalPages": len(pages),
            "totalBlocks": len(blocks),
            "totalChars": len(full_text),
            "linesPerPage": [p["item_count"] for p in pages],
            "timings": {
                "pdfExtraction": round(t_extract, 3),
                "aiClassification": round(t_classify, 3),
                "total": round(time.time() - t0, 3),
            },
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

    app = FastAPI(title="Court Order Extractor")
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
        print("EXTRACTION RESULTS")
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
