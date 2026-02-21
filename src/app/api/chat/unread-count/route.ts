import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/chat/unread-count
 * Returns total unread message count across all conversations for the current user.
 * Unread = messages from other users after the current user's last sent message per conversation.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = getAdminClient();

    const { data: allMessages } = await adminClient
      .from("chat_messages")
      .select("sender_id, created_at, metadata")
      .or(
        `sender_id.eq.${user.id},metadata->>conversation_key.ilike.%${user.id}%`
      )
      .not("metadata->>conversation_key", "is", null)
      .order("created_at", { ascending: false });

    // Group by conversation and compute unread
    const conversations = new Map<
      string,
      { userLastSent: string | null; othersAfter: number }
    >();

    for (const msg of allMessages || []) {
      const metadata = msg.metadata as Record<string, string> | null;
      const convKey = metadata?.conversation_key;
      if (!convKey || !convKey.includes(user.id)) continue;

      if (!conversations.has(convKey)) {
        conversations.set(convKey, { userLastSent: null, othersAfter: 0 });
      }

      const conv = conversations.get(convKey)!;

      if (msg.sender_id === user.id && !conv.userLastSent) {
        // First (most recent) message from user in this conversation
        conv.userLastSent = msg.created_at;
      }
    }

    // Second pass: count messages from others after user's last sent
    let totalUnread = 0;
    for (const msg of allMessages || []) {
      const metadata = msg.metadata as Record<string, string> | null;
      const convKey = metadata?.conversation_key;
      if (!convKey || !convKey.includes(user.id)) continue;
      if (msg.sender_id === user.id) continue;

      const conv = conversations.get(convKey)!;
      if (
        !conv.userLastSent ||
        new Date(msg.created_at) > new Date(conv.userLastSent)
      ) {
        totalUnread++;
      }
    }

    return NextResponse.json({ count: totalUnread });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
