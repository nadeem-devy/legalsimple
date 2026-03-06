import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Allow up to 120 seconds for PDF extraction + AI processing (large PDFs need more time)
export const maxDuration = 120;

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

function getMistral() {
  return new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY!,
    baseURL: "https://api.mistral.ai/v1",
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
// Each line of text becomes its own entry — maximum fidelity
// ============================================================
interface ExtractedPage {
  num: number;
  lines: string[];
  text: string;
  itemCount: number;
}

async function extractPdfPages(
  buffer: Buffer
): Promise<{ pages: ExtractedPage[]; fullText: string }> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true })
    .promise;

  const pages: ExtractedPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // Filter to actual text items
    const items = content.items.filter(
      (item): item is typeof item & { str: string; transform: number[]; width: number; height: number } =>
        "str" in item && "transform" in item
    );

    if (items.length === 0) {
      pages.push({ num: i, lines: [], text: "", itemCount: 0 });
      continue;
    }

    // Sort by y descending (top first), then x ascending (left first)
    const sorted = [...items].sort((a, b) => {
      const yA = a.transform[5];
      const yB = b.transform[5];
      // Use a small threshold for "same line" detection during sort
      if (Math.abs(yA - yB) > 1.5) return yB - yA; // higher y = higher on page
      return a.transform[4] - b.transform[4]; // left to right
    });

    // Group items into lines by y-coordinate proximity
    // Two items are on the same line if their y-coords are within 2 units
    const lines: string[] = [];
    let lineItems: typeof sorted = [sorted[0]];

    for (let j = 1; j < sorted.length; j++) {
      const prev = lineItems[lineItems.length - 1];
      const curr = sorted[j];
      const yDiff = Math.abs(curr.transform[5] - prev.transform[5]);

      if (yDiff <= 2) {
        // Same line
        lineItems.push(curr);
      } else {
        // Flush current line
        // Sort line items by x to ensure left-to-right order
        lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
        const lineText = buildLineText(lineItems);
        if (lineText.trim()) {
          lines.push(lineText.trim());
        }
        lineItems = [curr];
      }
    }
    // Flush last line
    if (lineItems.length > 0) {
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
      const lineText = buildLineText(lineItems);
      if (lineText.trim()) {
        lines.push(lineText.trim());
      }
    }

    const text = lines.join("\n");
    pages.push({ num: i, lines, text, itemCount: items.length });
  }

  const fullText = pages.map((p) => p.text).join("\n\n");
  return { pages, fullText };
}

// Build line text from sorted items, inserting spaces where needed
function buildLineText(
  items: Array<{ str: string; transform: number[]; width: number }>
): string {
  if (items.length === 0) return "";
  let result = items[0].str;

  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1];
    const curr = items[i];
    // Check gap between end of previous item and start of current
    const prevEnd = prev.transform[4] + (prev.width || 0);
    const currStart = curr.transform[4];
    const gap = currStart - prevEnd;

    // If there's a visible gap and the previous item doesn't end with space
    // and current doesn't start with space, insert a space
    if (gap > 1 && !result.endsWith(" ") && !curr.str.startsWith(" ")) {
      result += " ";
    }
    result += curr.str;
  }
  return result;
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
      "verbatimText": "the text of this section, properly formatted for court documents"
    }
  ]
}

RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine.
- In blockClassifications: map each block ID to its topic. Use "other" for general/unrelated blocks.
- Only classify blocks that are clearly about legal_decision_making, parenting_time, or child_support. Everything else is "other".
- SECTIONS: Only include sections about legal_decision_making, parenting_time, and child_support.

PAGE NUMBER DETECTION (CRITICAL):
- Each block ID includes its page number in parentheses, e.g. "[b-42] (page 3): ..."
- For each section, set "pageNumber" to the page where that section STARTS based on the block page numbers.
- If a section spans multiple pages, use the FIRST page number where the section heading or content begins.
- Look at the blocks you classified for each section type — the page number of the first block in that section is the pageNumber.

PARAGRAPH NUMBER DETECTION (CRITICAL):
- Court orders use numbered paragraphs. Look for patterns like: "7.", "VII.", "A.", "(a)", "Section 3", "¶ 4", "Paragraph 5", etc.
- The paragraphNumber should be the SPECIFIC paragraph or section number in the original document where that topic begins.
- For example, if legal decision making starts at paragraph "7." on page 4, set pageNumber: "4" and paragraphNumber: "7".
- If the document uses nested numbering like "IV.A.3", include the full reference (e.g., "IV.A.3").
- If the document uses headings with Roman numerals like "VII. LEGAL DECISION-MAKING", use "VII".
- If no clear paragraph number exists, use null — do NOT guess or make one up.

- For verbatimText: Use the EXACT content from the order — do NOT add, remove, or change any substantive words, facts, dates, names, or legal terms. However, you MUST clean up formatting issues caused by PDF extraction:
  * Fix broken words that were split across lines (e.g., "par- enting" → "parenting")
  * Remove stray line numbers from pleading margins (e.g., leading "8 " or "12 ")
  * Fix irregular spacing (double spaces, missing spaces after punctuation)
  * Ensure proper sentence capitalization and punctuation
  * Join sentence fragments that were split across PDF lines into proper flowing paragraphs
  * Preserve numbered paragraph structure (e.g., "1. ...", "a. ...", "(A) ...")
  * Keep legal citations exactly as they appear (e.g., "A.R.S. §25-403")
  The goal is court-acceptable formatting of the SAME content — readable, properly punctuated paragraphs instead of raw OCR line fragments.`;

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
      // Timeout pdfjs extraction at 30s to leave time for AI processing
      pdfData = await Promise.race([
        extractPdfPages(buffer),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("PDF text extraction timed out")), 30000)
        ),
      ]);
    } catch (parseError) {
      console.error("pdfjs-dist extraction failed:", parseError);
      // Fallback for scanned/image PDFs
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    // Check extraction quality — if too little text, fall back to direct PDF approach
    const totalLines = pdfData.pages.reduce((sum, p) => sum + p.lines.length, 0);
    const avgLinesPerPage = totalLines / Math.max(pdfData.pages.length, 1);
    console.log(
      `[extract-orders] Extraction check: ${pdfData.fullText.length} chars, ` +
      `${totalLines} lines, ${avgLinesPerPage.toFixed(1)} avg lines/page, ` +
      `${pdfData.pages.length} pages`
    );

    if (
      !pdfData.fullText ||
      pdfData.fullText.trim().length < 50 ||
      (pdfData.pages.length > 2 && avgLinesPerPage < 3)
    ) {
      console.log("[extract-orders] Text extraction insufficient, using direct PDF approach");
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    // ========================================================
    // STEP 2: Each line becomes a block — maximum fidelity
    // ========================================================
    interface TextBlock {
      id: string;
      text: string;
      pageNum: number;
    }

    const blocks: TextBlock[] = [];
    for (const page of pdfData.pages) {
      for (const line of page.lines) {
        if (line.trim()) {
          blocks.push({
            id: `b-${blocks.length}`,
            text: line.trim(),
            pageNum: page.num,
          });
        }
      }
    }

    console.log(
      `[extract-orders] PDF: ${pdfData.pages.length} pages, ` +
      `${blocks.length} blocks, ` +
      `${pdfData.fullText.length} chars total. ` +
      `Items per page: ${pdfData.pages.map((p) => p.itemCount).join(",")}`
    );

    // ========================================================
    // STEP 3: Single AI call — metadata + classification
    // ========================================================
    // Truncate block summary to ~400 blocks to stay within AI token limits
    const blocksForSummary = blocks.length > 400 ? blocks.slice(0, 400) : blocks;
    const blockSummary = blocksForSummary
      .map(
        (b) =>
          `[${b.id}] (page ${b.pageNum}): ${b.text.substring(0, 200)}${b.text.length > 200 ? "..." : ""}`
      )
      .join("\n");
    // Also truncate full text if extremely long (>80K chars)
    const fullTextForAI = pdfData.fullText.length > 80000
      ? pdfData.fullText.substring(0, 80000) + "\n\n[...truncated for processing...]"
      : pdfData.fullText;

    const mistral = getMistral();
    const aiResponse = await mistral.chat.completions.create({
      model: "mistral-small-latest",
      max_tokens: 8192,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Here is the full text of the court order:\n\n${fullTextForAI}\n\n---\n\nHere are the block IDs extracted from the document:\n${blockSummary}`,
        },
      ],
    });

    const aiText = aiResponse.choices[0]?.message?.content?.trim() || "";
    if (!aiText) {
      console.error("[extract-orders] AI returned empty response");
      return NextResponse.json(
        { error: "AI could not analyze the document. Please try again or enter information manually." },
        { status: 422 }
      );
    }
    const aiJson = extractJson(aiText);
    let aiData;
    try {
      aiData = JSON.parse(aiJson);
    } catch (parseError) {
      console.error("[extract-orders] AI JSON parse failed:", aiText.substring(0, 500));
      return NextResponse.json(
        { error: "Could not parse the document structure. Please try again or enter information manually." },
        { status: 422 }
      );
    }

    if (!aiData || typeof aiData !== 'object') {
      console.error("[extract-orders] AI returned non-object:", typeof aiData);
      return NextResponse.json(
        { error: "Could not analyze the document structure. Please enter information manually." },
        { status: 422 }
      );
    }

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

    console.log(
      `[extract-orders] Result: ${fullOrderContent.length} content blocks, ` +
      `${pdfData.pages.length} pages`
    );

    return NextResponse.json({
      extractedData,
      storagePath,
      _debug: {
        totalPages: pdfData.pages.length,
        totalBlocks: blocks.length,
        totalChars: pdfData.fullText.length,
        itemsPerPage: pdfData.pages.map((p) => p.itemCount),
        linesPerPage: pdfData.pages.map((p) => p.lines.length),
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

// Fallback: send PDF directly to GPT-4o for scanned/image PDFs
// Two-step approach:
//   1. GPT-4o extracts raw text (every line, every page)
//   2. Feed through same block-building + classification pipeline as primary path
async function handleDirectPdfExtraction(
  buffer: Buffer,
  fileName: string,
  userId: string
) {
  const base64 = buffer.toString("base64");
  const fileDataUrl = `data:application/pdf;base64,${base64}`;
  const openai = getOpenAI();

  // ========================================================
  // STEP 1: Extract raw text from every page via GPT-4o vision
  // ========================================================
  const textExtractionPrompt = `You are a document OCR tool. Extract ALL text from this court order PDF.

OUTPUT FORMAT: Return the text exactly as it appears in the document. Separate pages with a line containing only "---PAGE_BREAK---". Include EVERY line of text. Do NOT summarize, paraphrase, or skip any content. Copy the text VERBATIM.

Rules:
- Include headers, footers, page numbers, signatures, everything
- Preserve paragraph breaks as blank lines
- Do NOT add any commentary or explanation
- Do NOT wrap in code fences or JSON
- Just output the raw text, page by page`;

  console.log("[extract-orders] Fallback: extracting text via GPT-4.1-mini vision...");

  const textResponse = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    max_tokens: 16384,
    messages: [
      { role: "system", content: textExtractionPrompt },
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
            text: "Extract ALL text from every page of this document. Do not skip anything.",
          },
        ],
      },
    ],
  });

  const rawText = textResponse.choices[0]?.message?.content?.trim() || "";
  if (!rawText || rawText.length < 50) {
    return NextResponse.json(
      { error: "Could not extract text from the document. Please enter your information manually." },
      { status: 422 }
    );
  }

  // ========================================================
  // STEP 2: Parse extracted text into pages and blocks
  // ========================================================
  const pageTexts = rawText.split(/---PAGE_BREAK---/i);
  interface TextBlock {
    id: string;
    text: string;
    pageNum: number;
  }
  const blocks: TextBlock[] = [];

  for (let pageIdx = 0; pageIdx < pageTexts.length; pageIdx++) {
    const pageText = pageTexts[pageIdx];
    const lines = pageText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    for (const line of lines) {
      blocks.push({
        id: `b-${blocks.length}`,
        text: line,
        pageNum: pageIdx + 1,
      });
    }
  }

  console.log(
    `[extract-orders] Fallback OCR: ${pageTexts.length} pages, ${blocks.length} blocks, ${rawText.length} chars`
  );

  // ========================================================
  // STEP 3: AI classification — same as primary path
  // ========================================================
  const fullText = blocks.map((b) => b.text).join("\n");
  const blockSummary = blocks
    .map((b) => `[${b.id}] (page ${b.pageNum}): ${b.text.substring(0, 200)}${b.text.length > 200 ? "..." : ""}`)
    .join("\n");

  const mistral = getMistral();
  const aiResponse = await mistral.chat.completions.create({
    model: "mistral-small-latest",
    max_tokens: 8192,
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      {
        role: "user",
        content: `Here is the full text of the court order:\n\n${fullText}\n\n---\n\nHere are the block IDs extracted from the document:\n${blockSummary}`,
      },
    ],
  });

  const aiText = aiResponse.choices[0]?.message?.content?.trim() || "";
  if (!aiText) {
    console.error("[extract-orders] Fallback: AI returned empty response");
    return NextResponse.json(
      { error: "AI could not analyze the document. Please try again or enter information manually." },
      { status: 422 }
    );
  }
  const aiJson = extractJson(aiText);
  let aiData;
  try {
    aiData = JSON.parse(aiJson);
  } catch (parseError) {
    console.error("[extract-orders] Fallback: AI JSON parse failed:", aiText.substring(0, 500));
    return NextResponse.json(
      { error: "Could not parse the document structure. Please try again or enter information manually." },
      { status: 422 }
    );
  }

  if (!aiData || typeof aiData !== 'object') {
    return NextResponse.json(
      { error: "Could not analyze the document structure. Please enter information manually." },
      { status: 422 }
    );
  }

  // ========================================================
  // STEP 4: Build fullOrderContent from blocks + AI classifications
  // ========================================================
  const classifications: Record<string, string> = aiData.blockClassifications || {};
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

  const storagePath = await storePdf(buffer, fileName, userId);

  console.log(
    `[extract-orders] Fallback result: ${fullOrderContent.length} content blocks, ${pageTexts.length} pages`
  );

  return NextResponse.json({
    extractedData,
    storagePath,
    _debug: {
      totalPages: pageTexts.length,
      totalBlocks: blocks.length,
      totalChars: rawText.length,
      itemsPerPage: pageTexts.map((p) => p.split("\n").filter((l) => l.trim()).length),
      linesPerPage: pageTexts.map((p) => p.split("\n").filter((l) => l.trim()).length),
      fallback: true,
    },
  });
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
