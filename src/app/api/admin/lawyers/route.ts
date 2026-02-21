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

    // Fetch lawyer_profiles joined with profiles for name/email/phone
    const { data: lawyerProfiles, error: lawyersError } = await adminClient
      .from("lawyer_profiles")
      .select("*, profiles!lawyer_profiles_user_id_fkey(full_name, email, phone)")
      .order("created_at", { ascending: false });

    if (lawyersError) {
      return NextResponse.json(
        { error: lawyersError.message },
        { status: 500 }
      );
    }

    // Map to a clean response shape
    const lawyers = (lawyerProfiles || []).map(
      (lp: {
        id: string;
        user_id: string;
        bar_number: string;
        bar_state: string;
        verified: boolean;
        practice_areas: string[] | null;
        states_licensed: string[] | null;
        hourly_rate: number | null;
        bio: string | null;
        years_experience: number | null;
        availability_status: string | null;
        rating: number | null;
        total_cases: number | null;
        created_at: string;
        profiles?: {
          full_name: string;
          email: string;
          phone: string | null;
        } | null;
      }) => ({
        id: lp.id,
        user_id: lp.user_id,
        full_name: lp.profiles?.full_name || "Unknown",
        email: lp.profiles?.email || "",
        phone: lp.profiles?.phone || null,
        bar_number: lp.bar_number,
        bar_state: lp.bar_state,
        verified: lp.verified,
        practice_areas: lp.practice_areas || [],
        states_licensed: lp.states_licensed || [],
        hourly_rate: lp.hourly_rate || null,
        bio: lp.bio || null,
        years_experience: lp.years_experience || null,
        availability_status: lp.availability_status || "unavailable",
        rating: lp.rating || 0,
        total_cases: lp.total_cases || 0,
        created_at: lp.created_at,
      })
    );

    return NextResponse.json({ lawyers });
  } catch (error) {
    console.error("Admin lawyers GET error:", error);
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
    const { lawyerId, action, value } = body;

    if (!lawyerId || !action) {
      return NextResponse.json(
        { error: "Missing lawyerId or action" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    if (action === "verify") {
      const approve = value === true;

      const { error } = await adminClient
        .from("lawyer_profiles")
        .update({ verified: approve })
        .eq("id", lawyerId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: approve ? "Lawyer verified" : "Lawyer verification rejected",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin lawyers PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
