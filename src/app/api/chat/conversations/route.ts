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
 * GET /api/chat/conversations
 * Returns all direct-message conversations for the current user
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

    // Find all chat_messages where this user is the sender or mentioned in conversation_key
    const { data: allMessages } = await adminClient
      .from("chat_messages")
      .select("id, sender_id, sender_type, content, created_at, metadata")
      .or(`sender_id.eq.${user.id},metadata->>conversation_key.ilike.%${user.id}%`)
      .not("metadata->>conversation_key", "is", null)
      .order("created_at", { ascending: false });

    // Group messages by conversation_key and compute unread counts
    const conversationMap = new Map<
      string,
      {
        lastMessage: NonNullable<typeof allMessages>[0];
        lawyerIds: Set<string>;
        lawyerName: string | null;
        userLastSentAt: string | null;
        messagesFromOthers: string[];
      }
    >();

    for (const msg of allMessages || []) {
      const metadata = msg.metadata as Record<string, string> | null;
      const convKey = metadata?.conversation_key;
      if (!convKey) continue;

      // Only include conversations this user is part of
      if (!convKey.includes(user.id)) continue;

      if (!conversationMap.has(convKey)) {
        conversationMap.set(convKey, {
          lastMessage: msg,
          lawyerIds: new Set(),
          lawyerName: metadata?.lawyer_name || null,
          userLastSentAt: null,
          messagesFromOthers: [],
        });
      }

      const conv = conversationMap.get(convKey)!;

      // Track user's last sent message and messages from others for unread count
      if (msg.sender_id === user.id) {
        if (!conv.userLastSentAt) {
          conv.userLastSentAt = msg.created_at;
        }
      } else {
        conv.messagesFromOthers.push(msg.created_at);
      }

      // Track lawyer IDs (non-current-user participants)
      if (msg.sender_id !== user.id) {
        conv.lawyerIds.add(msg.sender_id);
      }
      // Also check metadata for lawyer_user_id
      if (metadata?.lawyer_user_id && metadata.lawyer_user_id !== user.id) {
        conv.lawyerIds.add(metadata.lawyer_user_id);
      }
      // Capture lawyer name from metadata if available
      if (!conv.lawyerName && metadata?.lawyer_name) {
        conv.lawyerName = metadata.lawyer_name;
      }
    }

    // Get all unique lawyer IDs for name lookup
    const allLawyerIds = new Set<string>();
    for (const conv of conversationMap.values()) {
      for (const id of conv.lawyerIds) {
        allLawyerIds.add(id);
      }
    }

    // Fetch lawyer names from profiles
    const nameMap = new Map<string, string>();
    if (allLawyerIds.size > 0) {
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(allLawyerIds));

      for (const p of profiles || []) {
        nameMap.set(p.id, p.full_name || "Unknown");
      }
    }

    // Build conversation list
    const conversations = [];
    for (const [convKey, data] of conversationMap.entries()) {
      const lawyerId = Array.from(data.lawyerIds)[0] || "";
      const lawyerName =
        nameMap.get(lawyerId) || data.lawyerName || "Unknown Lawyer";

      // Count unread: messages from others after user's last sent message
      const unreadCount = data.userLastSentAt
        ? data.messagesFromOthers.filter(
            (ts) => new Date(ts) > new Date(data.userLastSentAt!)
          ).length
        : data.messagesFromOthers.length;

      conversations.push({
        id: convKey,
        conversation_key: convKey,
        lawyer_name: lawyerName,
        lawyer_id: lawyerId,
        last_message: data.lastMessage?.content || "",
        last_message_at: data.lastMessage?.created_at || new Date().toISOString(),
        unread_count: unreadCount,
      });
    }

    // Sort by most recent message
    conversations.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    );

    return NextResponse.json({ conversations, userId: user.id });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
