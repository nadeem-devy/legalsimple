import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Allow up to 60 seconds for PDF extraction + AI processing
export const maxDuration = 60;

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ============================================================
// Extract text per page using pdfjs-dist legacy (no worker needed)
// Uses position data to detect lines and paragraph breaks
// ============================================================
interface ExtractedLine {
  text: string;
  y: number;
  fontSize: number;
}

interface ExtractedPage {
  num: number;
  lines: string[];
  text: string;
}

async function extractPdfPages(
  buffer: Buffer
): Promise<{ pages: ExtractedPage[]; fullText: string }> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true })
    .promise;

  const pages: ExtractedPage[] = [];
  const allText: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // Group text items into lines using y-coordinate
    const items = content.items.filter(
      (item): item is typeof item & { str: string; transform: number[]; height: number } =>
        "str" in item && "transform" in item
    );

    if (items.length === 0) {
      pages.push({ num: i, lines: [], text: "" });
      continue;
    }

    // Sort by y (descending = top to bottom) then x (left to right)
    const sorted = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5]; // y descending (top first)
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4]; // x ascending (left first)
    });

    // Group into lines — items within 3 units of y are same line
    const rawLines: ExtractedLine[] = [];
    let currentLineY = sorted[0].transform[5];
    let currentLineText: string[] = [];
    let currentFontSize = sorted[0].height || 12;

    for (const item of sorted) {
      const y = item.transform[5];
      if (Math.abs(y - currentLineY) > 3) {
        // New line
        const lineText = currentLineText.join("").trim();
        if (lineText) {
          rawLines.push({ text: lineText, y: currentLineY, fontSize: currentFontSize });
        }
        currentLineY = y;
        currentLineText = [item.str];
        currentFontSize = item.height || 12;
      } else {
        currentLineText.push(item.str);
      }
    }
    // Flush last line
    const lastText = currentLineText.join("").trim();
    if (lastText) {
      rawLines.push({ text: lastText, y: currentLineY, fontSize: currentFontSize });
    }

    // Convert to string lines with paragraph breaks detected by larger gaps
    const lines: string[] = [];
    for (let j = 0; j < rawLines.length; j++) {
      const line = rawLines[j];
      if (j > 0) {
        const prevY = rawLines[j - 1].y;
        const gap = prevY - line.y; // gap between lines (y decreases going down)
        const avgFontSize = (rawLines[j - 1].fontSize + line.fontSize) / 2;
        // If gap is > 1.8x font size, treat as paragraph break
        if (gap > avgFontSize * 1.8) {
          lines.push(""); // Empty line = paragraph break
        }
      }
      lines.push(line.text);
    }

    const pageText = lines.join("\n");
    pages.push({ num: i, lines, text: pageText });
    allText.push(pageText);
  }

  return { pages, fullText: allText.join("\n\n") };
}

// ============================================================
// AI PROMPT — Only metadata + section classification
// ============================================================
const EXTRACTION_PROMPT = `You are analyzing the text of an Arizona family court order. Extract metadata and identify which block IDs relate to specific topics.

You are given:
1. The full text of the court order
2. A list of block IDs with text previews

Return ONLY valid JSON (no markdown, no code fences, no explanation):

{
  "caseNumber": "the case number (e.g., FC2024-001234) or null",
  "petitionerName": "full legal name of the petitioner/plaintiff or null",
  "respondentName": "full legal name of the respondent/defendant or null",
  "courtName": "full name of the court (e.g., Maricopa County Superior Court) or null",
  "orderDate": "the date the order was signed/entered (MM/DD/YYYY) or null",
  "orderTitle": "the title of the order (e.g., CONSENT DECREE OF DISSOLUTION OF MARRIAGE) or null",
  "judgeName": "the name of the judge or null",
  "children": [
    { "name": "child's full legal name", "dateOfBirth": "MM/DD/YYYY or null" }
  ],
  "blockClassifications": {
    "BLOCK_ID": "legal_decision_making or parenting_time or child_support or other"
  },
  "sections": [
    {
      "type": "legal_decision_making or parenting_time or child_support or other",
      "pageNumber": "page number as a string or null",
      "paragraphNumber": "paragraph number as a string or null",
      "orderDate": "MM/DD/YYYY or null",
      "summary": "brief 1-2 sentence summary",
      "verbatimText": "exact verbatim text of this section from the order"
    }
  ]
}

RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine.
- In blockClassifications: map each block ID to its topic. Use "other" for general/unrelated blocks.
- Only classify blocks that are clearly about legal_decision_making, parenting_time, or child_support. Everything else is "other".
- SECTIONS: Only include sections about legal_decision_making, parenting_time, and child_support.
- For verbatimText: copy the EXACT text from the provided content for each relevant section.`;

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
    // STEP 1: Extract text per page using pdfjs-dist (no worker)
    // ========================================================
    let pdfData: { pages: ExtractedPage[]; fullText: string };
    try {
      pdfData = await extractPdfPages(buffer);
    } catch (parseError) {
      console.error("pdfjs-dist extraction failed:", parseError);
      // Fallback for scanned/image PDFs
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    if (!pdfData.fullText || pdfData.fullText.trim().length < 50) {
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    // ========================================================
    // STEP 2: Split into blocks — each paragraph is a block
    // ========================================================
    interface TextBlock {
      id: string;
      text: string;
      pageNum: number;
    }

    const blocks: TextBlock[] = [];
    for (const page of pdfData.pages) {
      // Split page text by blank lines (paragraph breaks detected by position)
      const paragraphs = page.text
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
        .filter((p) => p.length > 0);

      if (paragraphs.length === 0 && page.text.trim()) {
        // No paragraph breaks — use each line as a block
        for (const line of page.lines) {
          if (line.trim()) {
            blocks.push({
              id: `b-${blocks.length}`,
              text: line.trim(),
              pageNum: page.num,
            });
          }
        }
      } else {
        for (const para of paragraphs) {
          blocks.push({
            id: `b-${blocks.length}`,
            text: para,
            pageNum: page.num,
          });
        }
      }
    }

    // ========================================================
    // STEP 3: Single AI call — metadata + classification
    // ========================================================
    const blockSummary = blocks
      .map(
        (b) =>
          `[${b.id}] (page ${b.pageNum}): ${b.text.substring(0, 150)}${b.text.length > 150 ? "..." : ""}`
      )
      .join("\n");

    const openai = getOpenAI();
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Here is the full text of the court order:\n\n${pdfData.fullText}\n\n---\n\nHere are the block IDs extracted from the document:\n${blockSummary}`,
        },
      ],
    });

    const aiText = aiResponse.choices[0]?.message?.content?.trim() || "";
    const aiJson = extractJson(aiText);
    const aiData = JSON.parse(aiJson);

    // ========================================================
    // STEP 4: Build fullOrderContent from blocks + AI classifications
    // ========================================================
    const classifications: Record<string, string> =
      aiData.blockClassifications || {};
    const fullOrderContent = blocks.map((b) => ({
      paragraphId: b.id,
      heading: null,
      text: b.text,
      sectionGroup: "orders" as const,
      type: (classifications[b.id] || "other") as
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

    return NextResponse.json({ extractedData, storagePath });
  } catch (error) {
    console.error("Order extraction error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            "Could not parse the document structure. Please enter your information manually.",
        },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to extract data from the document: ${message}` },
      { status: 500 }
    );
  }
}

// Extract JSON from response text (handles markdown fencing)
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text;
}

// Fallback: send PDF directly to GPT-4o for scanned/image PDFs
async function handleDirectPdfExtraction(
  buffer: Buffer,
  fileName: string,
  userId: string
) {
  const base64 = buffer.toString("base64");
  const fileDataUrl = `data:application/pdf;base64,${base64}`;

  const combinedPrompt = `You are analyzing an Arizona family court order document. Extract ALL information as structured data.

Return ONLY valid JSON (no markdown, no code fences):
{
  "caseNumber": "string or null",
  "petitionerName": "string or null",
  "respondentName": "string or null",
  "courtName": "string or null",
  "orderDate": "MM/DD/YYYY or null",
  "orderTitle": "string or null",
  "judgeName": "string or null",
  "children": [{ "name": "string", "dateOfBirth": "MM/DD/YYYY or null" }],
  "sections": [{
    "type": "legal_decision_making or parenting_time or child_support or other",
    "pageNumber": "string or null",
    "paragraphNumber": "string or null",
    "orderDate": "MM/DD/YYYY or null",
    "summary": "brief summary",
    "verbatimText": "exact text"
  }],
  "fullOrderContent": [{
    "paragraphId": "string",
    "heading": null,
    "text": "exact verbatim text",
    "sectionGroup": "orders",
    "type": "legal_decision_making or parenting_time or child_support or property or spousal_maintenance or other"
  }],
  "confidence": "high"
}

Extract EVERY paragraph in order. Copy text EXACTLY. Do not summarize. Do not skip paragraphs.`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    max_tokens: 16384,
    messages: [
      { role: "system", content: combinedPrompt },
      {
        role: "user",
        content: [
          {
            type: "file",
            file: {
              filename: fileName || "court-order.pdf",
              file_data: fileDataUrl,
            },
          },
          {
            type: "text",
            text: "Extract all structured information from this court order.",
          },
        ],
      },
    ],
  });

  const responseText =
    response.choices[0]?.message?.content?.trim() || "";
  if (!responseText) {
    return NextResponse.json(
      {
        error:
          "Could not analyze the document. Please enter your information manually.",
      },
      { status: 422 }
    );
  }

  const extractedData = JSON.parse(extractJson(responseText));
  const storagePath = await storePdf(buffer, fileName, userId);

  return NextResponse.json({ extractedData, storagePath });
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
