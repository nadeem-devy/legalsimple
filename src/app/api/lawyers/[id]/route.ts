import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try database first
    const { data: lawyer, error } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !lawyer) {
      return NextResponse.json({ error: "Lawyer not found" }, { status: 404 });
    }

    // Use service role client to bypass RLS (profiles table restricts to own row)
    const adminClient = createRawClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", lawyer.user_id)
      .single();

    // Normalize numeric fields (Supabase may return DECIMAL as string)
    const normalizedLawyer = {
      ...lawyer,
      rating: Number(lawyer.rating) || 0,
      hourly_rate: lawyer.hourly_rate ? Number(lawyer.hourly_rate) : null,
      total_cases: Number(lawyer.total_cases) || 0,
      years_experience: lawyer.years_experience ? Number(lawyer.years_experience) : null,
      // Assign a cover gradient for real lawyers
      cover_gradient: lawyer.cover_gradient || "from-emerald-600 via-teal-600 to-cyan-700",
      profile: profile
        ? {
            full_name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
          }
        : null,
    };

    return NextResponse.json({ lawyer: normalizedLawyer });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
