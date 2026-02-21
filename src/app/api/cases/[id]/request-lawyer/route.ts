import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the case belongs to the user
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("id, status, client_id")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    if (caseData.client_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if lawyer has already been requested
    if (["lawyer_requested", "lawyer_assigned"].includes(caseData.status)) {
      return NextResponse.json(
        { error: "Lawyer has already been requested for this case" },
        { status: 400 }
      );
    }

    // Update the case status to lawyer_requested
    const { error: updateError } = await supabase
      .from("cases")
      .update({
        status: "lawyer_requested",
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId);

    if (updateError) {
      console.error("Error updating case status:", updateError);
      return NextResponse.json(
        { error: "Failed to update case status" },
        { status: 500 }
      );
    }

    // Optionally: Create a notification or task for admin/lawyers
    // This can be expanded later to send emails, create tasks, etc.

    return NextResponse.json({
      success: true,
      message: "Case has been forwarded for lawyer review",
    });
  } catch (error) {
    console.error("Error in request-lawyer API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
