import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

const EXTRACTION_SYSTEM_PROMPT = `You are analyzing an Arizona family court order document. Your job is to extract specific structured information from the document.

Extract the following information and return ONLY valid JSON (no markdown, no code fences, no explanation):

{
  "caseNumber": "the case number (e.g., FC2024-001234) or null",
  "petitionerName": "full legal name of the petitioner/plaintiff or null",
  "respondentName": "full legal name of the respondent/defendant or null",
  "courtName": "full name of the court (e.g., Maricopa County Superior Court) or null",
  "children": [
    { "name": "child's full legal name", "dateOfBirth": "MM/DD/YYYY or null" }
  ],
  "sections": [
    {
      "type": "legal_decision_making or parenting_time or child_support or other",
      "pageNumber": "page number as a string or null",
      "paragraphNumber": "paragraph number as a string or null",
      "orderDate": "MM/DD/YYYY or null",
      "summary": "brief 1-2 sentence summary of what this section of the order says",
      "verbatimText": "the EXACT word-for-word text of this section as it appears in the order"
    }
  ],
  "confidence": "high or medium or low"
}

RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine from the document.
- For children, include all minor children mentioned in the orders.
- For sections, identify all distinct order sections related to: legal decision making (custody), parenting time (visitation), and child support.
- The "type" field should classify each section as one of: "legal_decision_making", "parenting_time", "child_support", or "other".
- Page numbers should be the actual page number in the document where the section appears.
- Paragraph numbers should be the paragraph/section number as written in the order.
- IMPORTANT: For "verbatimText", copy the EXACT text of each section/paragraph from the court order word-for-word. Include the complete paragraph text as written in the document. This is critical for the modification petition to reference the original order language.
- Set confidence to "high" if the document is clearly a court order with readable text, "medium" if some fields are uncertain, "low" if the text is largely unreadable or not a court order.`;

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
      max_tokens: 8192,
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
