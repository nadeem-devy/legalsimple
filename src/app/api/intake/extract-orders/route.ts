import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

const EXTRACTION_SYSTEM_PROMPT = `You are analyzing an Arizona family court order document. Your job is to extract the COMPLETE content of the court order as structured data.

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
      "verbatimText": "exact text of this section"
    }
  ],
  "fullOrderContent": [
    {
      "paragraphId": "the paragraph number/letter as written (e.g., '1', '6.B', 'E')",
      "heading": "bold heading text if any (e.g., 'CHILD CUSTODY', 'CHILD SUPPORT') or null",
      "text": "the EXACT word-for-word verbatim text of this paragraph/section including all sub-content",
      "sectionGroup": "findings or orders or declarations or other",
      "type": "legal_decision_making or parenting_time or child_support or property or spousal_maintenance or other"
    }
  ],
  "confidence": "high or medium or low"
}

CRITICAL RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine from the document.

SECTIONS array: Only include sections related to legal decision making, parenting time, and child support. This is used for pre-filling form fields.

FULL ORDER CONTENT array - THIS IS THE MOST IMPORTANT PART:
- Extract EVERY paragraph from the court order in document order.
- Include ALL content from the "THE COURT FINDS:", "THE COURT FURTHER FINDS THAT:", "THE COURT ORDERS:" sections and any similar sections.
- Copy each paragraph EXACTLY word-for-word as written in the document.
- Include sub-sections as separate entries (e.g., if paragraph 6 has sub-sections A, B, C, include "6" as the main entry and "6.A", "6.B", "6.C" as separate entries).
- For "sectionGroup": use "findings" for "THE COURT FINDS" paragraphs, "orders" for "THE COURT ORDERS" paragraphs, "declarations" for declarations/waivers, "other" for everything else.
- For "type": classify as "legal_decision_making" (custody), "parenting_time" (visitation schedule), "child_support", "property", "spousal_maintenance", or "other".
- Include section group headers (like "THE COURT FINDS:", "THE COURT ORDERS:") as separate entries with paragraphId "header" and the header text.
- Do NOT include exhibits, signature pages, or oath/affirmation pages.
- The goal is to capture the complete operative court order so it can be reproduced with specific paragraphs modified.`;

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

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    // Convert PDF to base64 and send directly to OpenAI
    // This handles both text-based and scanned/image-based PDFs
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const fileDataUrl = `data:application/pdf;base64,${base64}`;

    // Send PDF directly to OpenAI GPT-4o for extraction
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 16384,
      messages: [
        {
          role: "system",
          content: EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: file.name || "court-order.pdf",
                file_data: fileDataUrl,
              },
            },
            {
              type: "text",
              text: "Extract the structured information from this court order document.",
            },
          ],
        },
      ],
    });

    const responseText = response.choices[0]?.message?.content?.trim() || "";

    if (!responseText) {
      return NextResponse.json(
        {
          error:
            "Could not analyze the document. Please enter your information manually.",
        },
        { status: 422 }
      );
    }

    // Parse the JSON response
    // Try to extract JSON from the response (handle if wrapped in markdown)
    let jsonText = responseText;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    const extractedData = JSON.parse(jsonText);

    return NextResponse.json({ extractedData });
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
