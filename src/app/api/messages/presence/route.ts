import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient, isMockMode } from "@/lib/supabase/server";
import type { UpdatePresenceRequest, UserPresence } from "@/types/messages";

// Demo presence data
const DEMO_PRESENCE: Record<string, UserPresence> = {
  "lawyer-1": {
    user_id: "lawyer-1",
    status: "online",
    last_seen_at: new Date().toISOString(),
    current_conversation_id: null,
    is_typing: false,
    typing_started_at: null,
    device_type: "web",
    updated_at: new Date().toISOString(),
  },
  "lawyer-2": {
    user_id: "lawyer-2",
    status: "away",
    last_seen_at: new Date(Date.now() - 15 * 60000).toISOString(),
    current_conversation_id: null,
    is_typing: false,
    typing_started_at: null,
    device_type: "web",
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userIds = searchParams.get("user_ids")?.split(",") || [];

  // Handle mock mode
  if (isMockMode()) {
    const presence = userIds
      .map((id) => DEMO_PRESENCE[id])
      .filter(Boolean);
    return NextResponse.json({ presence });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!userIds.length) {
    return NextResponse.json({ presence: [] });
  }

  const { data: presence, error } = await supabase
    .from("user_presence")
    .select("*")
    .in("user_id", userIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ presence: presence || [] });
}

export async function POST(request: NextRequest) {
  // Handle mock mode
  if (isMockMode()) {
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: UpdatePresenceRequest = await request.json();
  const { status, current_conversation_id } = body;

  // Upsert presence
  const { error } = await adminClient
    .from("user_presence")
    .upsert({
      user_id: user.id,
      status,
      last_seen_at: new Date().toISOString(),
      current_conversation_id: current_conversation_id || null,
      is_typing: false,
      device_type: "web",
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Handle beacon requests for offline status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Handle mock mode
    if (isMockMode()) {
      return NextResponse.json({ success: true });
    }

    const adminClient = await createAdminClient();

    await adminClient
      .from("user_presence")
      .upsert({
        user_id: userId,
        status: status || "offline",
        last_seen_at: new Date().toISOString(),
        is_typing: false,
      });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
