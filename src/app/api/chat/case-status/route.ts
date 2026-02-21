import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/case-status?other_user_id=xxx
 * Returns the case status between the current user and another user.
 * Works for both client and lawyer sides.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const otherUserId = request.nextUrl.searchParams.get("other_user_id");
    if (!otherUserId) {
      return NextResponse.json(
        { error: "other_user_id is required" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Check cases where current user is client and other is lawyer
    const { data: clientCases } = await adminClient
      .from("cases")
      .select("id, status, case_number, case_type")
      .eq("client_id", user.id)
      .eq("lawyer_id", otherUserId)
      .order("updated_at", { ascending: false })
      .limit(1);

    // Check cases where current user is lawyer and other is client
    const { data: lawyerCases } = await adminClient
      .from("cases")
      .select("id, status, case_number, case_type")
      .eq("lawyer_id", user.id)
      .eq("client_id", otherUserId)
      .order("updated_at", { ascending: false })
      .limit(1);

    const activeCase = clientCases?.[0] || lawyerCases?.[0] || null;

    if (!activeCase) {
      return NextResponse.json({ case_status: null });
    }

    // Map case status to a simpler status for display
    let displayStatus: "active" | "pending" | "completed" | null = null;
    if (["in_progress", "document_ready", "document_reviewed", "lawyer_assigned"].includes(activeCase.status)) {
      displayStatus = "active";
    } else if (["lawyer_requested", "pending_review"].includes(activeCase.status)) {
      displayStatus = "pending";
    } else if (["filed", "closed"].includes(activeCase.status)) {
      displayStatus = "completed";
    }

    return NextResponse.json({
      case_status: displayStatus,
      case_number: activeCase.case_number,
      case_type: activeCase.case_type,
      raw_status: activeCase.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
