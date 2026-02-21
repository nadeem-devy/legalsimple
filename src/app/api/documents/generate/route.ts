import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDocument } from "@/lib/documents/generator";
import { getDocumentTypeName } from "@/config/practice-areas";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { caseId, documentType } = body;

    if (!caseId || !documentType) {
      return NextResponse.json(
        { error: "Case ID and document type are required" },
        { status: 400 }
      );
    }

    // Get the case data
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("client_id", user.id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Generate the document
    const content = await generateDocument(caseData, documentType);

    // Save the document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        case_id: caseId,
        document_type: documentType,
        title: getDocumentTypeName(documentType),
        content,
        status: "draft",
        version: 1,
        generated_by: "ai",
      })
      .select()
      .single();

    if (docError) {
      console.error("Error saving document:", docError);
      return NextResponse.json(
        { error: "Failed to save document" },
        { status: 500 }
      );
    }

    // Update case status if it was in intake
    if (caseData.status === "intake" || caseData.status === "pending_review") {
      await supabase
        .from("cases")
        .update({ status: "document_ready" })
        .eq("id", caseId);
    }

    return NextResponse.json({
      content,
      document,
    });
  } catch (error) {
    console.error("Document generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
