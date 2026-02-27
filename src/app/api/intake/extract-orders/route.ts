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
    // STEP 1: Extract text PER PAGE using pdf-parse
    // ========================================================
    interface PageText { num: number; text: string }
    let pages: PageText[] = [];
    let fullText = "";

    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      fullText = textResult.text;
      pages = textResult.pages || [];
      await parser.destroy();
    } catch (parseError) {
      console.error("pdf-parse extraction failed:", parseError);
    }

    if (!fullText || fullText.trim().length < 50) {
      // pdf-parse failed or scanned PDF — fall back to GPT-4o direct reading
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    // ========================================================
    // STEP 2: Split each page's text into blocks (simple: by blank lines)
    // ========================================================
    interface TextBlock {
      id: string;
      text: string;
      pageNum: number;
    }

    const blocks: TextBlock[] = [];

    if (pages.length > 0) {
      // Per-page splitting
      for (const page of pages) {
        const chunks = page.text
          .split(/\n\s*\n/)
          .map((c) => c.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
          .filter((c) => c.length > 0);

        for (const chunk of chunks) {
          blocks.push({
            id: `b-${blocks.length}`,
            text: chunk,
            pageNum: page.num,
          });
        }
      }
    } else {
      // Fallback: no per-page info, split full text by blank lines
      const chunks = fullText
        .split(/\n\s*\n/)
        .map((c) => c.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
        .filter((c) => c.length > 0);

      for (const chunk of chunks) {
        blocks.push({
          id: `b-${blocks.length}`,
          text: chunk,
          pageNum: 0,
        });
      }
    }

    // ========================================================
    // STEP 3: Single AI call — metadata + classification
    // ========================================================
    const blockSummary = blocks
      .map((b) => `[${b.id}] (page ${b.pageNum}): ${b.text.substring(0, 150)}${b.text.length > 150 ? "..." : ""}`)
      .join("\n");

    const openai = getOpenAI();
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Here is the full text of the court order:\n\n${fullText}\n\n---\n\nHere are the block IDs extracted from the document:\n${blockSummary}`,
        },
      ],
    });

    const aiText = aiResponse.choices[0]?.message?.content?.trim() || "";
    const aiJson = extractJson(aiText);
    const aiData = JSON.parse(aiJson);

    // ========================================================
    // STEP 4: Build fullOrderContent from blocks + AI classifications
    // ========================================================
    const classifications: Record<string, string> = aiData.blockClassifications || {};
    const fullOrderContent = blocks.map((b) => ({
      paragraphId: b.id,
      heading: null,
      text: b.text,
      sectionGroup: "orders" as const,
      type: (classifications[b.id] || "other") as "legal_decision_making" | "parenting_time" | "child_support" | "property" | "spousal_maintenance" | "other",
      pageNum: b.pageNum,
    }));

    // Build final extracted data
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
