import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

// Allow up to 120 seconds for OCR + AI processing
export const maxDuration = 120;

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!;
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";
const MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// Mistral OCR 3 — extract text from PDF (handles scanned PDFs too)
// ============================================================
interface OcrPage {
  index: number;
  markdown: string;
}

async function extractWithMistralOcr(buffer: Buffer): Promise<OcrPage[]> {
  const base64 = buffer.toString("base64");
  const dataUrl = `data:application/pdf;base64,${base64}`;

  const resp = await fetch(MISTRAL_OCR_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        document_url: dataUrl,
      },
      include_image_base64: false,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Mistral OCR failed (${resp.status}): ${errText}`);
  }

  const data = await resp.json();
  return data.pages || [];
}

// ============================================================
// AI PROMPT — metadata + section classification from OCR markdown
// ============================================================
const EXTRACTION_PROMPT = `You are analyzing an Arizona family court order. The OCR-extracted text (markdown) is provided with page markers.

Extract metadata and classify content by topic. Return ONLY valid JSON (no markdown, no code fences):

{
  "caseNumber": "e.g. FC2024-001234 or null",
  "petitionerName": "full legal name or null",
  "respondentName": "full legal name or null",
  "courtName": "full court name or null",
  "orderDate": "MM/DD/YYYY or null",
  "orderTitle": "title of the order or null",
  "judgeName": "judge name or null",
  "children": [{"name": "full name", "dateOfBirth": "MM/DD/YYYY or null"}],
  "sections": [
    {
      "type": "legal_decision_making or parenting_time or child_support",
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

PAGE NUMBERS: Use the "--- PAGE N ---" markers to determine page numbers for each section.

PARAGRAPH NUMBERS: Look for "7.", "VII.", "A.", "(a)", "Section 3", etc. Use the specific paragraph number where the topic begins. Use null if unclear.

VERBATIM TEXT: Use exact content but fix OCR formatting issues:
  * Fix broken words split across lines (e.g., "par- enting" -> "parenting")
  * Remove stray margin line numbers
  * Fix irregular spacing
  * Join fragments into proper paragraphs
  * Preserve numbered structure and legal citations exactly (e.g., "A.R.S. §25-403")`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ========================================================
    // STEP 1: Mistral OCR 3 — extract text from PDF
    // Handles both digital and scanned PDFs (no fallback needed)
    // ========================================================
    console.log("[extract-orders] Starting Mistral OCR 3 extraction...");
    let ocrPages: OcrPage[];
    try {
      ocrPages = await Promise.race([
        extractWithMistralOcr(buffer),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("OCR timed out")), 60000)
        ),
      ]);
    } catch (ocrError) {
      console.error("[extract-orders] Mistral OCR failed:", ocrError);
      return NextResponse.json(
        { error: "Could not read the PDF document. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    const totalChars = ocrPages.reduce((sum, p) => sum + (p.markdown?.length || 0), 0);
    console.log(`[extract-orders] OCR: ${ocrPages.length} pages, ${totalChars} chars`);

    if (!ocrPages.length || totalChars < 50) {
      return NextResponse.json(
        { error: "Could not extract text from the document. The PDF may be empty or corrupted." },
        { status: 422 }
      );
    }

    // ========================================================
    // STEP 2: Build blocks from OCR markdown (for fullOrderContent)
    // ========================================================
    interface TextBlock {
      id: string;
      text: string;
      pageNum: number;
    }

    const blocks: TextBlock[] = [];
    for (const page of ocrPages) {
      const pageNum = (page.index || 0) + 1;
      const lines = (page.markdown || "").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          blocks.push({
            id: `b-${blocks.length}`,
            text: trimmed,
            pageNum,
          });
        }
      }
    }

    console.log(`[extract-orders] ${blocks.length} blocks from OCR`);

    // ========================================================
    // STEP 3: AI classification via Mistral chat
    // ========================================================
    // Build page-annotated text for the AI
    let annotatedText = "";
    for (const page of ocrPages) {
      const pageNum = (page.index || 0) + 1;
      annotatedText += `\n--- PAGE ${pageNum} ---\n${page.markdown || ""}\n`;
    }

    // Cap at 80K chars
    if (annotatedText.length > 80000) {
      annotatedText = annotatedText.substring(0, 80000) + "\n\n[...truncated...]";
    }

    const classifyResp = await fetch(MISTRAL_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        max_tokens: 8192,
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: annotatedText },
        ],
      }),
    });

    if (!classifyResp.ok) {
      const errText = await classifyResp.text();
      console.error("[extract-orders] Classification failed:", errText);
      return NextResponse.json(
        { error: "AI could not analyze the document. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    const classifyData = await classifyResp.json();
    const aiText = classifyData.choices?.[0]?.message?.content?.trim() || "";
    if (!aiText) {
      return NextResponse.json(
        { error: "AI could not analyze the document. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    const aiJson = extractJson(aiText);
    let aiData;
    try {
      aiData = JSON.parse(aiJson);
    } catch {
      console.error("[extract-orders] AI JSON parse failed:", aiText.substring(0, 500));
      return NextResponse.json(
        { error: "Could not parse the document structure. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    if (!aiData || typeof aiData !== "object") {
      return NextResponse.json(
        { error: "Could not analyze the document structure. Please enter information manually." },
        { status: 422 }
      );
    }

    // ========================================================
    // STEP 4: Build fullOrderContent from blocks
    // ========================================================
    const fullOrderContent = blocks.map((b) => ({
      paragraphId: b.id,
      heading: null,
      text: b.text,
      sectionGroup: "orders" as const,
      type: "other" as
        | "legal_decision_making"
        | "parenting_time"
        | "child_support"
        | "property"
        | "spousal_maintenance"
        | "other",
      pageNum: b.pageNum,
    }));

    const extractedData = {
      caseNumber: aiData.caseNumber,
      petitionerName: aiData.petitionerName,
      respondentName: aiData.respondentName,
      courtName: aiData.courtName,
      orderDate: aiData.orderDate,
      orderTitle: aiData.orderTitle,
      judgeName: aiData.judgeName,
      children: aiData.children || [],
      sections: aiData.sections || [],
      fullOrderContent,
      confidence: "high" as const,
    };

    // ========================================================
    // STEP 5: Store original PDF in Supabase
    // ========================================================
    const storagePath = await storePdf(buffer, file.name, user.id);

    console.log(
      `[extract-orders] Result: ${fullOrderContent.length} content blocks, ${ocrPages.length} pages`
    );

    return NextResponse.json({
      extractedData,
      storagePath,
      _debug: {
        totalPages: ocrPages.length,
        totalBlocks: blocks.length,
        totalChars,
        linesPerPage: ocrPages.map((p) => (p.markdown || "").split("\n").filter((l: string) => l.trim()).length),
        engine: "mistral-ocr-3",
      },
    });
  } catch (error) {
    console.error("Order extraction error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Could not parse the document structure. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    if (message.includes("timeout") || message.includes("timed out")) {
      return NextResponse.json(
        { error: "Document processing took too long. Please try a smaller PDF or enter information manually." },
        { status: 504 }
      );
    }

    if (message.includes("rate_limit") || message.includes("429")) {
      return NextResponse.json(
        { error: "Our AI service is temporarily busy. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract data from the document. Please try again or enter information manually." },
      { status: 500 }
    );
  }
}

// Extract JSON from response text (handles markdown fencing)
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text;
}

// Store PDF in Supabase storage
async function storePdf(
  buffer: Buffer,
  fileName: string,
  userId: string
): Promise<string | null> {
  try {
    const adminClient = getAdminClient();
    await adminClient.storage.createBucket("court-orders", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });

    const timestamp = Date.now();
    const safeName = (fileName || "court-order.pdf").replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
    const storagePath = `${userId}/${timestamp}-${safeName}`;

    await adminClient.storage.from("court-orders").upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

    return storagePath;
  } catch (storageError) {
    console.error("PDF storage error:", storageError);
    return null;
  }
}
