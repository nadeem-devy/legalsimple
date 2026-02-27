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
// MECHANICAL PARAGRAPH SPLITTING — no AI, exact text preserved
// ============================================================
interface RawParagraph {
  id: string;
  text: string;
  isHeader: boolean;
}

function splitIntoParagraphs(rawText: string): RawParagraph[] {
  const paragraphs: RawParagraph[] = [];
  const lines = rawText.split("\n");

  // Patterns for section headers
  const headerPatterns = [
    /^(THE COURT (?:FINDS|ORDERS|FURTHER ORDERS|DECREES|FURTHER DECREES)):?\s*$/i,
    /^(IT IS (?:ORDERED|FURTHER ORDERED|DECREED|FURTHER DECREED)):?\s*$/i,
    /^(FINDINGS?(?:\s+OF\s+FACT)?):?\s*$/i,
    /^(CONCLUSIONS?\s+OF\s+LAW):?\s*$/i,
    /^(DECREE|ORDER|JUDGMENT):?\s*$/i,
  ];

  // Pattern for numbered paragraphs: "1.", "2.", "3.A", "6.B.", "IV.", etc.
  const numberedPattern = /^(\d+(?:\.\s*[A-Za-z])?\.?)\s+(.+)/;
  const romanPattern = /^((?:I{1,3}|IV|V|VI{0,3}|IX|X{0,3})\.)\s+(.+)/;
  const letterPattern = /^([A-Z]\.)\s+(.+)/;

  let currentParagraph: { id: string; lines: string[]; isHeader: boolean } | null = null;

  function flushParagraph() {
    if (currentParagraph && currentParagraph.lines.length > 0) {
      const text = currentParagraph.lines.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 0) {
        paragraphs.push({
          id: currentParagraph.id,
          text,
          isHeader: currentParagraph.isHeader,
        });
      }
    }
    currentParagraph = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      // Blank line — might separate paragraphs
      if (currentParagraph && !currentParagraph.isHeader) {
        // Only flush if we have substantial content
        if (currentParagraph.lines.join(" ").trim().length > 10) {
          flushParagraph();
        }
      }
      continue;
    }

    // Check for section headers
    let isHeader = false;
    for (const pattern of headerPatterns) {
      if (pattern.test(line)) {
        flushParagraph();
        paragraphs.push({
          id: `header-${paragraphs.length}`,
          text: line,
          isHeader: true,
        });
        isHeader = true;
        break;
      }
    }
    if (isHeader) continue;

    // Check for numbered paragraph start
    const numMatch = line.match(numberedPattern);
    const romanMatch = line.match(romanPattern);
    const letterMatch = line.match(letterPattern);
    const match = numMatch || romanMatch || letterMatch;

    if (match) {
      flushParagraph();
      const id = match[1].replace(/\.$/, "").trim();
      currentParagraph = { id, lines: [match[2]], isHeader: false };
      continue;
    }

    // Continuation of current paragraph
    if (currentParagraph) {
      currentParagraph.lines.push(line);
    } else {
      // Start a new unnumbered paragraph
      currentParagraph = {
        id: `p-${paragraphs.length}`,
        lines: [line],
        isHeader: false,
      };
    }
  }

  flushParagraph();
  return paragraphs;
}

// ============================================================
// AI PROMPT — Only metadata + section classification
// ============================================================
const EXTRACTION_PROMPT = `You are analyzing the text of an Arizona family court order. Extract metadata and identify which paragraphs relate to specific topics.

You are given:
1. The full text of the court order
2. A list of paragraph IDs extracted from the document

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
  "paragraphClassifications": {
    "PARAGRAPH_ID": "legal_decision_making or parenting_time or child_support or property or spousal_maintenance or other"
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
  ],
  "confidence": "high or medium or low"
}

RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine.
- In paragraphClassifications: map each paragraph ID to its topic. Use "other" for general/unrelated paragraphs.
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
    // STEP 1: Extract raw text using pdf-parse
    // ========================================================
    let rawText: string | null = null;
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      rawText = textResult.text;
      await parser.destroy();
    } catch (parseError) {
      console.error("pdf-parse extraction failed:", parseError);
    }

    if (!rawText || rawText.trim().length < 50) {
      // pdf-parse failed or scanned PDF — fall back to GPT-4o direct reading
      return await handleDirectPdfExtraction(buffer, file.name, user.id);
    }

    // ========================================================
    // STEP 2: Mechanically split into paragraphs (no AI)
    // ========================================================
    const rawParagraphs = splitIntoParagraphs(rawText);

    // Build a summary of paragraph IDs for the AI
    const paragraphSummary = rawParagraphs
      .filter((p) => !p.isHeader)
      .map((p) => `[${p.id}]: ${p.text.substring(0, 120)}...`)
      .join("\n");

    // ========================================================
    // STEP 3: Single AI call — metadata + classification
    // ========================================================
    const openai = getOpenAI();
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Here is the full text of the court order:\n\n${rawText}\n\n---\n\nHere are the paragraph IDs extracted from the document:\n${paragraphSummary}`,
        },
      ],
    });

    const aiText = aiResponse.choices[0]?.message?.content?.trim() || "";
    const aiJson = extractJson(aiText);
    const aiData = JSON.parse(aiJson);

    // ========================================================
    // STEP 4: Build fullOrderContent from mechanical paragraphs + AI classifications
    // ========================================================
    const classifications: Record<string, string> = aiData.paragraphClassifications || {};
    const fullOrderContent = rawParagraphs.map((p) => ({
      paragraphId: p.isHeader ? "header" : p.id,
      heading: null,
      text: p.text,
      sectionGroup: p.isHeader ? "other" : "orders",
      type: classifications[p.id] || "other",
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
    "paragraphId": "string or 'header'",
    "heading": null,
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
