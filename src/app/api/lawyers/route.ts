import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch verified lawyer profiles from DB
    const { data: lawyers, error } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("verified", true)
      .order("rating", { ascending: false });

    let enrichedLawyers: Record<string, unknown>[] = [];

    if (!error && lawyers && lawyers.length > 0) {
      // Fetch profile data (name, email, avatar) for each real lawyer
      const lawyerUserIds = lawyers.map(
        (l: { user_id: string }) => l.user_id
      );

      // Use service role client to bypass RLS (profiles table restricts to own row)
      // Note: createAdminClient from SSR still picks up cookie auth, so we use raw supabase-js
      const adminClient = createRawClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("*")
        .in("id", lawyerUserIds);

      enrichedLawyers = lawyers.map(
        (lawyer: Record<string, unknown>) => {
          const profile = (profiles || []).find(
            (p: { id: string }) => p.id === lawyer.user_id
          );
          return {
            ...lawyer,
            // Normalize numeric fields (Supabase may return DECIMAL as string)
            rating: Number(lawyer.rating) || 0,
            hourly_rate: lawyer.hourly_rate ? Number(lawyer.hourly_rate) : null,
            total_cases: Number(lawyer.total_cases) || 0,
            years_experience: lawyer.years_experience ? Number(lawyer.years_experience) : null,
            // Assign a cover gradient for real lawyers
            cover_gradient: lawyer.cover_gradient || "from-emerald-600 via-teal-600 to-cyan-700",
            profile: profile
              ? {
                  full_name: (profile as Record<string, unknown>).full_name,
                  email: (profile as Record<string, unknown>).email,
                  avatar_url: (profile as Record<string, unknown>).avatar_url,
                }
              : null,
          };
        }
      );
    }

    return NextResponse.json({ lawyers: enrichedLawyers });
  } catch {
    return NextResponse.json({ lawyers: [] });
  }
}
