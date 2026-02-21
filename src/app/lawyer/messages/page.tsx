import { createClient, isMockMode } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { MessagesClient } from "./messages-client";

export interface ConversationData {
  id: string;
  conversation_key: string;
  client_name: string;
  client_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

// Demo data for mock mode
const DEMO_CONVERSATIONS: ConversationData[] = [
  {
    id: "conv-1",
    conversation_key: "demo-key-1",
    client_name: "Sarah Johnson",
    client_id: "c1",
    last_message: "Thank you for the update on my case.",
    last_message_at: new Date(Date.now() - 120000).toISOString(),
    unread_count: 0,
  },
];

export default async function MessagesPage() {
  if (isMockMode()) {
    return (
      <MessagesClient
        conversations={DEMO_CONVERSATIONS}
        lawyerId="demo-lawyer-123"
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <MessagesClient conversations={[]} lawyerId="" />;
  }

  // Use service role client to fetch messages and profiles (bypasses RLS)
  const adminClient = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find all chat_messages in conversations that include this lawyer
  const { data: allMessages } = await adminClient
    .from("chat_messages")
    .select("*")
    .or(`sender_id.eq.${user.id},metadata->>conversation_key.ilike.%${user.id}%`)
    .not("metadata->>conversation_key", "is", null)
    .order("created_at", { ascending: false });

  // Group messages by conversation_key
  const conversationMap = new Map<string, {
    messages: typeof allMessages;
    clientIds: Set<string>;
    userLastSentAt: string | null;
    messagesFromOthers: string[];
  }>();

  for (const msg of allMessages || []) {
    const convKey = (msg.metadata as Record<string, string>)?.conversation_key;
    if (!convKey) continue;

    if (!conversationMap.has(convKey)) {
      conversationMap.set(convKey, { messages: [], clientIds: new Set(), userLastSentAt: null, messagesFromOthers: [] });
    }
    const conv = conversationMap.get(convKey)!;
    conv.messages!.push(msg);

    // Track user's last sent and others' messages for unread count
    if (msg.sender_id === user.id) {
      if (!conv.userLastSentAt) {
        conv.userLastSentAt = msg.created_at;
      }
    } else {
      conv.clientIds.add(msg.sender_id);
      conv.messagesFromOthers.push(msg.created_at);
    }
  }

  // Get all unique client IDs for name lookup
  const allClientIds = new Set<string>();
  for (const conv of conversationMap.values()) {
    for (const cid of conv.clientIds) {
      allClientIds.add(cid);
    }
  }

  // Fetch client names from profiles
  const clientNameMap = new Map<string, string>();
  if (allClientIds.size > 0) {
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(allClientIds));

    for (const p of profiles || []) {
      clientNameMap.set(p.id, p.full_name || "Unknown Client");
    }
  }

  // Build conversation list
  const conversations: ConversationData[] = [];
  for (const [convKey, data] of conversationMap.entries()) {
    const msgs = data.messages || [];
    const lastMsg = msgs[0]; // Already sorted desc
    const clientId = Array.from(data.clientIds)[0] || "";

    // Count unread: messages from others after lawyer's last sent message
    const unreadCount = data.userLastSentAt
      ? data.messagesFromOthers.filter(
          (ts) => new Date(ts) > new Date(data.userLastSentAt!)
        ).length
      : data.messagesFromOthers.length;

    conversations.push({
      id: convKey,
      conversation_key: convKey,
      client_name: clientNameMap.get(clientId) || "Unknown Client",
      client_id: clientId,
      last_message: lastMsg?.content || "No messages yet",
      last_message_at: lastMsg?.created_at || new Date().toISOString(),
      unread_count: unreadCount,
    });
  }

  // Sort by most recent message
  conversations.sort((a, b) =>
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );

  return (
    <MessagesClient
      conversations={conversations}
      lawyerId={user.id}
    />
  );
}
