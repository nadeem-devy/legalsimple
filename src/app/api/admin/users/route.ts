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

    // Use admin client to bypass RLS
    const adminClient = await createAdminClient();

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    // Fetch case counts per client
    const { data: caseCounts, error: caseError } = await adminClient
      .from("cases")
      .select("client_id");

    const caseCountMap: Record<string, number> = {};
    if (caseCounts && !caseError) {
      for (const c of caseCounts) {
        caseCountMap[c.client_id] = (caseCountMap[c.client_id] || 0) + 1;
      }
    }

    // Try to get auth user metadata (last_sign_in) via admin API
    let authUsersMap: Record<
      string,
      { last_sign_in_at: string | null; banned_until: string | null }
    > = {};
    try {
      const {
        data: { users: authUsers },
      } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      if (authUsers) {
        for (const au of authUsers) {
          authUsersMap[au.id] = {
            last_sign_in_at: au.last_sign_in_at || null,
            banned_until: au.banned_until
              ? String(au.banned_until)
              : null,
          };
        }
      }
    } catch {
      // Auth admin API may not be available in mock mode
    }

    // Merge data
    const users = (profiles || []).map(
      (p: {
        id: string;
        email: string;
        full_name: string;
        phone?: string;
        role: string;
        state?: string;
        avatar_url?: string;
        created_at: string;
        updated_at?: string;
      }) => {
        const authData = authUsersMap[p.id];
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          phone: p.phone || null,
          role: p.role,
          state: p.state || null,
          avatar_url: p.avatar_url || null,
          created_at: p.created_at,
          last_sign_in: authData?.last_sign_in_at || null,
          total_cases: caseCountMap[p.id] || 0,
          status: authData?.banned_until ? "suspended" : "active",
        };
      }
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);
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
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing userId or action" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    if (action === "change_role") {
      if (!["client", "lawyer", "admin"].includes(value)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      const { error } = await adminClient
        .from("profiles")
        .update({ role: value })
        .eq("id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Role updated to ${value}` });
    }

    if (action === "toggle_status") {
      // Ban or unban user via Supabase auth admin API
      try {
        if (value === "suspend") {
          await adminClient.auth.admin.updateUserById(userId, {
            ban_duration: "876000h", // ~100 years = effectively permanent
          });
        } else {
          await adminClient.auth.admin.updateUserById(userId, {
            ban_duration: "none",
          });
        }
        return NextResponse.json({
          success: true,
          message: value === "suspend" ? "User suspended" : "User reactivated",
        });
      } catch {
        return NextResponse.json(
          { error: "Failed to update user status" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
