import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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

const EXTRACTION_SYSTEM_PROMPT = `You are analyzing an Arizona family court order document. Extract key metadata and specific sections to help pre-fill a Petition to Modify form.

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
      "verbatimText": "exact verbatim text of this specific section from the order"
    }
  ],
  "confidence": "high or medium or low"
}

CRITICAL RULES:
- Return ONLY the JSON object. No other text.
- Use null for any field you cannot determine from the document.
- SECTIONS array: Only include sections related to legal_decision_making, parenting_time, and child_support. These are used for pre-filling form fields.
- For verbatimText: copy the EXACT word-for-word text of each relevant section. This will be quoted in the petition.
- Do NOT attempt to extract the full order content. Only extract the metadata and specific sections listed above.`;

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
      max_tokens: 4096,
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

    // Store the original PDF in Supabase storage for reference
    let storagePath: string | null = null;
    try {
      const adminClient = getAdminClient();
      await adminClient.storage.createBucket("court-orders", {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
      });

      const timestamp = Date.now();
      const safeName = (file.name || "court-order.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
      storagePath = `${user.id}/${timestamp}-${safeName}`;

      await adminClient.storage
        .from("court-orders")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: false,
        });
    } catch (storageError) {
      // Non-critical — extraction still succeeds even if storage fails
      console.error("PDF storage error:", storageError);
    }

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
