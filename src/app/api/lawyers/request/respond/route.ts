import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { case_id, action } = body as {
      case_id: string;
      action: "accept" | "reject";
    };

    if (!case_id || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "case_id and action (accept/reject) are required" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Verify the case is assigned to this lawyer
    const { data: caseData } = await adminClient
      .from("cases")
      .select("id, lawyer_id, status")
      .eq("id", case_id)
      .eq("lawyer_id", user.id)
      .single();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (action === "accept") {
      // Update case to in_progress
      await adminClient
        .from("cases")
        .update({ status: "in_progress" })
        .eq("id", case_id);

      // Update lawyer_requests status
      await adminClient
        .from("lawyer_requests")
        .update({ status: "accepted" })
        .eq("case_id", case_id)
        .eq("lawyer_id", user.id);

      return NextResponse.json({ success: true, status: "accepted" });
    } else {
      // Reject: unassign lawyer and revert case status
      await adminClient
        .from("cases")
        .update({ status: "pending_review", lawyer_id: null })
        .eq("id", case_id);

      // Update lawyer_requests status
      await adminClient
        .from("lawyer_requests")
        .update({ status: "rejected" })
        .eq("case_id", case_id)
        .eq("lawyer_id", user.id);

      return NextResponse.json({ success: true, status: "rejected" });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
