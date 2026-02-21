import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Auth check: ensure user is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = await createAdminClient();

    // Fetch all cases with client and lawyer profile names
    const { data: cases, error: casesError } = await adminClient
      .from("cases")
      .select(
        "*, client:profiles!cases_client_id_fkey(full_name, email), lawyer:profiles!cases_lawyer_id_fkey(full_name)"
      )
      .order("created_at", { ascending: false });

    if (casesError) {
      return NextResponse.json(
        { error: casesError.message },
        { status: 500 }
      );
    }

    // Map to clean response
    const mappedCases = (cases || []).map(
      (c: {
        id: string;
        case_number: string;
        client_id: string;
        lawyer_id: string | null;
        status: string;
        case_type: string;
        state: string;
        county: string;
        plaintiff_name: string | null;
        defendant_name: string | null;
        complexity_score: number | null;
        ai_summary: string | null;
        urgency: string | null;
        created_at: string;
        updated_at: string;
        client?: { full_name: string; email: string } | null;
        lawyer?: { full_name: string } | null;
      }) => ({
        id: c.id,
        case_number: c.case_number,
        client_name: c.client?.full_name || c.plaintiff_name || "Unknown",
        client_email: c.client?.email || "",
        lawyer_name: c.lawyer?.full_name || null,
        status: c.status,
        case_type: c.case_type,
        state: c.state,
        county: c.county || "",
        plaintiff_name: c.plaintiff_name,
        defendant_name: c.defendant_name,
        complexity_score: c.complexity_score || 0,
        ai_summary: c.ai_summary || null,
        urgency: c.urgency || "normal",
        created_at: c.created_at,
        updated_at: c.updated_at,
      })
    );

    return NextResponse.json({ cases: mappedCases });
  } catch (error) {
    console.error("Admin cases GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { caseId, action, value } = body;

    if (!caseId || !action) {
      return NextResponse.json(
        { error: "Missing caseId or action" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    if (action === "change_status") {
      const validStatuses = [
        "intake",
        "pending_review",
        "lawyer_requested",
        "lawyer_assigned",
        "in_progress",
        "document_ready",
        "filed",
        "closed",
        "escalated",
      ];

      if (!validStatuses.includes(value)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const { error } = await adminClient
        .from("cases")
        .update({ status: value, updated_at: new Date().toISOString() })
        .eq("id", caseId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Case status updated to ${value}`,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin cases PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
