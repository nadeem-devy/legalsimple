import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

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

// Step 1: AI extracts metadata + classifies sections from the raw text
const METADATA_PROMPT = `You are analyzing the text of an Arizona family court order. Extract metadata and identify specific sections.

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
  "sections": [
    {
      "type": "legal_decision_making or parenting_time or child_support or other",
      "pageNumber": "page number as a string or null",
      "paragraphNumber": "paragraph number as a string or null",
      "orderDate": "MM/DD/YYYY or null",
      "summary": "brief 1-2 sentence summary",
      "verbatimText": "exact verbatim text of this section from the order"
    }
  ],
  "confidence": "high or medium or low"
}

RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine.
- SECTIONS: Only include sections about legal_decision_making, parenting_time, and child_support.
- For verbatimText: copy the EXACT text from the provided content for each relevant section.`;

// Step 2: AI structures the full text into ordered paragraphs
const STRUCTURE_PROMPT = `You are structuring the full text of an Arizona family court order into an ordered array of paragraphs.

The text has already been extracted from a PDF. Your job is to identify each paragraph/section and classify it.

Return ONLY a valid JSON array (no markdown, no code fences, no explanation):

[
  {
    "paragraphId": "the paragraph number/letter as written (e.g., '1', '6.B', 'E') or 'header' for section headers",
    "heading": "bold heading text if any (e.g., 'CHILD CUSTODY', 'CHILD SUPPORT') or null",
    "text": "the EXACT text of this paragraph/section",
    "sectionGroup": "findings or orders or declarations or other",
    "type": "legal_decision_making or parenting_time or child_support or property or spousal_maintenance or other"
  }
]

RULES:
- Return ONLY the JSON array. No other text.
- Include EVERY paragraph from the court order in document order.
- Include section headers (like "THE COURT FINDS:", "THE COURT ORDERS:") as entries with paragraphId "header".
- For sectionGroup: "findings" for "THE COURT FINDS" paragraphs, "orders" for "THE COURT ORDERS" paragraphs, "declarations" for declarations/waivers, "other" for everything else.
- For type: classify as "legal_decision_making" (custody), "parenting_time" (visitation/schedule), "child_support", "property", "spousal_maintenance", or "other".
- Include sub-sections as separate entries (e.g., "6.A", "6.B").
- Do NOT include exhibits, signature pages, or oath/affirmation pages.
- Preserve the EXACT text — do not summarize or paraphrase.`;

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
    // STEP 1: Extract raw text using pdf-parse (no AI, no token limits)
    // ========================================================
    let rawText: string;
    try {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      rawText = textResult.text;
      await parser.destroy();
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      // Fallback: send PDF directly to GPT-4o for scanned/image PDFs
      return await handleScannedPdf(buffer, file.name, user.id);
    }

    if (!rawText || rawText.trim().length < 50) {
      // Too little text — likely a scanned/image PDF
      return await handleScannedPdf(buffer, file.name, user.id);
    }

    // ========================================================
    // STEP 2: AI extracts metadata from the raw text
    // ========================================================
    const openai = getOpenAI();

    const [metadataResponse, structureResponse] = await Promise.all([
      // Metadata extraction
      openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 4096,
        messages: [
          { role: "system", content: METADATA_PROMPT },
          { role: "user", content: `Here is the full text of the court order:\n\n${rawText}` },
        ],
      }),
      // Full text structuring
      openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 16384,
        messages: [
          { role: "system", content: STRUCTURE_PROMPT },
          { role: "user", content: `Here is the full text of the court order. Structure it into ordered paragraphs:\n\n${rawText}` },
        ],
      }),
    ]);

    // Parse metadata
    const metadataText = metadataResponse.choices[0]?.message?.content?.trim() || "";
    const metadataJson = extractJson(metadataText);
    const extractedData = JSON.parse(metadataJson);

    // Parse full order structure
    const structureText = structureResponse.choices[0]?.message?.content?.trim() || "";
    const structureJson = extractJson(structureText);
    const fullOrderContent = JSON.parse(structureJson);

    // Attach fullOrderContent to extractedData
    extractedData.fullOrderContent = fullOrderContent;

    // ========================================================
    // STEP 3: Store original PDF in Supabase
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

// Fallback for scanned/image PDFs — send the PDF directly to GPT-4o
async function handleScannedPdf(buffer: Buffer, fileName: string, userId: string) {
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
    "paragraphId": "string or 'header'",
    "heading": "string or null",
    "text": "exact verbatim text",
    "sectionGroup": "findings or orders or declarations or other",
    "type": "legal_decision_making or parenting_time or child_support or property or spousal_maintenance or other"
  }],
  "confidence": "high or medium or low"
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
            file: { filename: fileName || "court-order.pdf", file_data: fileDataUrl },
          },
          { type: "text", text: "Extract all structured information from this court order." },
        ],
      },
    ],
  });

  const responseText = response.choices[0]?.message?.content?.trim() || "";
  if (!responseText) {
    return NextResponse.json(
      { error: "Could not analyze the document. Please enter your information manually." },
      { status: 422 }
    );
  }

  const extractedData = JSON.parse(extractJson(responseText));
  const storagePath = await storePdf(buffer, fileName, userId);

  return NextResponse.json({ extractedData, storagePath });
}

// Store PDF in Supabase storage
async function storePdf(buffer: Buffer, fileName: string, userId: string): Promise<string | null> {
  try {
    const adminClient = getAdminClient();
    await adminClient.storage.createBucket("court-orders", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });

    const timestamp = Date.now();
    const safeName = (fileName || "court-order.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${userId}/${timestamp}-${safeName}`;

    await adminClient.storage
      .from("court-orders")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    return storagePath;
  } catch (storageError) {
    console.error("PDF storage error:", storageError);
    return null;
  }
}
