import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { case_id, lawyer_id } = body;

    if (!case_id || !lawyer_id) {
      return NextResponse.json(
        { error: "case_id and lawyer_id are required" },
        { status: 400 }
      );
    }

    // Verify the requesting user is the lawyer
    if (user.id !== lawyer_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the lawyer is verified
    const { data: lawyerProfile } = await supabase
      .from("lawyer_profiles")
      .select("verified")
      .eq("user_id", lawyer_id)
      .single();

    if (!lawyerProfile?.verified) {
      return NextResponse.json(
        { error: "Only verified lawyers can request cases" },
        { status: 403 }
      );
    }

    // Create the lawyer request
    const { data: lawyerRequest, error } = await supabase
      .from("lawyer_requests")
      .insert({
        case_id,
        lawyer_id,
        status: "pending",
        lawyer_response: "Interested in taking this case.",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: lawyerRequest, success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
