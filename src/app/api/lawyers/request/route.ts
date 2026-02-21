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
 * GET /api/lawyers/request?lawyer_id=xxx
 * Check if the current user has any pending/accepted requests with a lawyer
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

    const lawyerId = request.nextUrl.searchParams.get("lawyer_id");
    if (!lawyerId) {
      return NextResponse.json(
        { error: "lawyer_id is required" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Find the most recent request from this user's cases to this lawyer
    const { data: userCases } = await adminClient
      .from("cases")
      .select("id")
      .eq("client_id", user.id);

    if (!userCases || userCases.length === 0) {
      return NextResponse.json({ request: null });
    }

    const caseIds = userCases.map((c: { id: string }) => c.id);

    const { data: requests } = await adminClient
      .from("lawyer_requests")
      .select("id, case_id, status, created_at")
      .eq("lawyer_id", lawyerId)
      .in("case_id", caseIds)
      .order("created_at", { ascending: false })
      .limit(1);

    const latestRequest = requests?.[0] || null;

    // If there's an accepted request, also get the case status
    let caseStatus: string | null = null;
    if (latestRequest) {
      const { data: caseData } = await adminClient
        .from("cases")
        .select("status")
        .eq("id", latestRequest.case_id)
        .single();
      caseStatus = caseData?.status || null;
    }

    return NextResponse.json({
      request: latestRequest,
      case_status: caseStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
    const { case_id, lawyer_id, client_message } = body;

    if (!case_id || !lawyer_id) {
      return NextResponse.json(
        { error: "case_id and lawyer_id are required" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Verify the case belongs to this user
    const { data: caseData } = await adminClient
      .from("cases")
      .select("id, client_id")
      .eq("id", case_id)
      .eq("client_id", user.id)
      .single();

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Create the lawyer request (use admin client to bypass missing INSERT RLS policy)
    const { data: lawyerRequest, error } = await adminClient
      .from("lawyer_requests")
      .insert({
        case_id,
        lawyer_id,
        client_message: client_message || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lawyer request:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Assign the lawyer and update case status
    await adminClient
      .from("cases")
      .update({ status: "lawyer_requested", lawyer_id: lawyer_id })
      .eq("id", case_id);

    return NextResponse.json({ request: lawyerRequest });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
