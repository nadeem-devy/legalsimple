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

    // Fetch documents joined with case info and client name
    const { data: documents, error: docsError } = await adminClient
      .from("documents")
      .select(
        "*, cases!documents_case_id_fkey(case_number, case_type, sub_type, state, county, client_id, profiles!cases_client_id_fkey(full_name, email))"
      )
      .order("created_at", { ascending: false });

    if (docsError) {
      // Fallback: try simpler query without deep join
      const { data: simpleDocs, error: simpleError } = await adminClient
        .from("documents")
        .select("*, cases!documents_case_id_fkey(case_number, case_type, state)")
        .order("created_at", { ascending: false });

      if (simpleError) {
        return NextResponse.json(
          { error: simpleError.message },
          { status: 500 }
        );
      }

      const mapped = (simpleDocs || []).map(
        (doc: {
          id: string;
          case_id: string;
          document_type: string;
          title: string;
          content: string | null;
          file_url: string | null;
          status: string;
          version: number;
          generated_by: string | null;
          created_at: string;
          updated_at: string;
          cases?: {
            case_number: string;
            case_type: string;
            state: string;
          } | null;
        }) => ({
          id: doc.id,
          case_id: doc.case_id,
          document_type: doc.document_type,
          title: doc.title,
          has_content: !!doc.content,
          file_url: doc.file_url || null,
          status: doc.status,
          version: doc.version,
          generated_by: doc.generated_by || "ai",
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          case_number: doc.cases?.case_number || "Unknown",
          case_type: doc.cases?.case_type || "",
          state: doc.cases?.state || "",
          client_name: "Unknown",
          client_email: "",
        })
      );

      return NextResponse.json({ documents: mapped });
    }

    const mapped = (documents || []).map(
      (doc: {
        id: string;
        case_id: string;
        document_type: string;
        title: string;
        content: string | null;
        file_url: string | null;
        status: string;
        version: number;
        generated_by: string | null;
        created_at: string;
        updated_at: string;
        cases?: {
          case_number: string;
          case_type: string;
          sub_type: string | null;
          state: string;
          county: string | null;
          client_id: string;
          profiles?: {
            full_name: string;
            email: string;
          } | null;
        } | null;
      }) => ({
        id: doc.id,
        case_id: doc.case_id,
        document_type: doc.document_type,
        title: doc.title,
        has_content: !!doc.content,
        file_url: doc.file_url || null,
        status: doc.status,
        version: doc.version,
        generated_by: doc.generated_by || "ai",
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        case_number: doc.cases?.case_number || "Unknown",
        case_type: doc.cases?.case_type || "",
        sub_type: doc.cases?.sub_type || null,
        state: doc.cases?.state || "",
        county: doc.cases?.county || "",
        client_name: doc.cases?.profiles?.full_name || "Unknown",
        client_email: doc.cases?.profiles?.email || "",
      })
    );

    return NextResponse.json({ documents: mapped });
  } catch (error) {
    console.error("Admin documents GET error:", error);
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
    const { documentId, action, value } = body;

    if (!documentId || !action) {
      return NextResponse.json(
        { error: "Missing documentId or action" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    if (action === "change_status") {
      if (!["draft", "final", "filed"].includes(value)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const { error } = await adminClient
        .from("documents")
        .update({ status: value, updated_at: new Date().toISOString() })
        .eq("id", documentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Document status updated to ${value}`,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin documents PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
