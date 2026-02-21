import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { profile, lawyer_profile } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify the user is updating their own profile
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update profiles table
    if (profile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", userId);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    // Update lawyer_profiles table
    if (lawyer_profile) {
      const { error: lawyerError } = await supabase
        .from("lawyer_profiles")
        .update({
          bar_number: lawyer_profile.bar_number,
          bar_state: lawyer_profile.bar_state,
          practice_areas: lawyer_profile.practice_areas,
          states_licensed: lawyer_profile.states_licensed,
          hourly_rate: lawyer_profile.hourly_rate,
          years_experience: lawyer_profile.years_experience,
          bio: lawyer_profile.bio,
          availability_status: lawyer_profile.availability_status,
        })
        .eq("user_id", userId);

      if (lawyerError) {
        return NextResponse.json({ error: lawyerError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
