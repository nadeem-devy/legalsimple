import { createClient as createRawClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Get total unread message count for a user across all conversations.
 * Unread = messages from others after user's last sent message per conversation.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const adminClient = getAdminClient();

  const { data: allMessages } = await adminClient
    .from("chat_messages")
    .select("sender_id, created_at, metadata")
    .or(
      `sender_id.eq.${userId},metadata->>conversation_key.ilike.%${userId}%`
    )
    .not("metadata->>conversation_key", "is", null)
    .order("created_at", { ascending: false });

  // Group by conversation and find user's last sent message
  const conversations = new Map<
    string,
    { userLastSentAt: string | null; othersTimestamps: string[] }
  >();

  for (const msg of allMessages || []) {
    const metadata = msg.metadata as Record<string, string> | null;
    const convKey = metadata?.conversation_key;
    if (!convKey || !convKey.includes(userId)) continue;

    if (!conversations.has(convKey)) {
      conversations.set(convKey, { userLastSentAt: null, othersTimestamps: [] });
    }

    const conv = conversations.get(convKey)!;

    if (msg.sender_id === userId) {
      if (!conv.userLastSentAt) {
        conv.userLastSentAt = msg.created_at;
      }
    } else {
      conv.othersTimestamps.push(msg.created_at);
    }
  }

  let total = 0;
  for (const conv of conversations.values()) {
    if (conv.userLastSentAt) {
      total += conv.othersTimestamps.filter(
        (ts) => new Date(ts) > new Date(conv.userLastSentAt!)
      ).length;
    } else {
      total += conv.othersTimestamps.length;
    }
  }

  return total;
}
