import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient, isMockMode } from "@/lib/supabase/server";
import {
  encrypt,
  decrypt,
  decryptConversationKey,
  hashContent,
} from "@/lib/encryption";
import type { SendMessageRequest, DecryptedMessage } from "@/types/messages";

// Demo messages for mock mode
const DEMO_MESSAGES: DecryptedMessage[] = [
  {
    id: "msg-1",
    conversation_id: "conv-1",
    sender_id: "demo-user-123",
    content: "Hi, I wanted to follow up on our conversation about the divorce proceedings.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    sender: { id: "demo-user-123", full_name: "Demo User", avatar_url: null, role: "client" },
    read_receipts: [{ user_id: "lawyer-1", read_at: new Date(Date.now() - 55 * 60000).toISOString() }],
  },
  {
    id: "msg-2",
    conversation_id: "conv-1",
    sender_id: "lawyer-1",
    content: "Hello! Of course. I've been reviewing your case and have some updates to share with you.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 58 * 60000).toISOString(),
    sender: { id: "lawyer-1", full_name: "Jennifer Martinez", avatar_url: null, role: "lawyer" },
    read_receipts: [{ user_id: "demo-user-123", read_at: new Date(Date.now() - 50 * 60000).toISOString() }],
  },
  {
    id: "msg-3",
    conversation_id: "conv-1",
    sender_id: "lawyer-1",
    content: "I've drafted the initial petition and attached it for your review. Please let me know if you have any questions or concerns.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 55 * 60000).toISOString(),
    sender: { id: "lawyer-1", full_name: "Jennifer Martinez", avatar_url: null, role: "lawyer" },
    read_receipts: [{ user_id: "demo-user-123", read_at: new Date(Date.now() - 50 * 60000).toISOString() }],
  },
  {
    id: "msg-4",
    conversation_id: "conv-1",
    sender_id: "demo-user-123",
    content: "Thank you! I'll take a look at it today. How long does this process usually take?",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    sender: { id: "demo-user-123", full_name: "Demo User", avatar_url: null, role: "client" },
    read_receipts: [{ user_id: "lawyer-1", read_at: new Date(Date.now() - 40 * 60000).toISOString() }],
  },
  {
    id: "msg-5",
    conversation_id: "conv-1",
    sender_id: "lawyer-1",
    content: "In Arizona, an uncontested divorce typically takes 60-90 days after filing. Given your situation, I anticipate we can finalize within that timeframe.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 42 * 60000).toISOString(),
    sender: { id: "lawyer-1", full_name: "Jennifer Martinez", avatar_url: null, role: "lawyer" },
    read_receipts: [{ user_id: "demo-user-123", read_at: new Date(Date.now() - 35 * 60000).toISOString() }],
  },
  {
    id: "msg-6",
    conversation_id: "conv-1",
    sender_id: "demo-user-123",
    content: "That's good to know. I've reviewed the documents you sent and everything looks accurate.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    sender: { id: "demo-user-123", full_name: "Demo User", avatar_url: null, role: "client" },
    read_receipts: [{ user_id: "lawyer-1", read_at: new Date(Date.now() - 15 * 60000).toISOString() }],
  },
  {
    id: "msg-7",
    conversation_id: "conv-1",
    sender_id: "lawyer-1",
    content: "I've drafted the initial petition and attached it for your review.",
    message_type: "text",
    reply_to_id: null,
    metadata: {},
    status: "sent",
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    sender: { id: "lawyer-1", full_name: "Jennifer Martinez", avatar_url: null, role: "lawyer" },
    read_receipts: [],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  // Handle mock mode
  if (isMockMode()) {
    const messages = DEMO_MESSAGES.filter((m) => m.conversation_id === conversationId);
    return NextResponse.json({ messages, hasMore: false });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const before = searchParams.get("before");

  // Verify user is participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get encryption key
  const { data: keyData } = await supabase
    .from("encryption_keys")
    .select("key_encrypted, key_iv")
    .eq("conversation_id", conversationId)
    .eq("status", "active")
    .single();

  if (!keyData) {
    return NextResponse.json({ error: "Encryption key not found" }, { status: 500 });
  }

  const conversationKey = decryptConversationKey({
    ciphertext: keyData.key_encrypted,
    iv: keyData.key_iv,
    tag: keyData.key_iv, // Using IV as tag placeholder - in production, store tag separately
  });

  // Get messages
  let query = supabase
    .from("direct_messages")
    .select(`
      id,
      sender_id,
      content_encrypted,
      content_iv,
      content_tag,
      message_type,
      reply_to_id,
      metadata,
      status,
      created_at,
      sender:profiles(id, full_name, avatar_url, role),
      attachments:message_attachments(id, file_name_encrypted, file_type, file_size),
      read_receipts:message_read_receipts(user_id, read_at)
    `)
    .eq("conversation_id", conversationId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Decrypt messages
  const decryptedMessages: DecryptedMessage[] =
    messages?.map((msg: Record<string, string>) => {
      try {
        const decryptedContent = decrypt(
          {
            ciphertext: msg.content_encrypted,
            iv: msg.content_iv,
            tag: msg.content_tag,
          },
          conversationKey
        );

        return {
          id: msg.id,
          conversation_id: conversationId,
          sender_id: msg.sender_id,
          content: decryptedContent,
          message_type: msg.message_type,
          reply_to_id: msg.reply_to_id,
          metadata: msg.metadata || {},
          status: msg.status,
          created_at: msg.created_at,
          sender: msg.sender as any,
          attachments: msg.attachments as any,
          read_receipts: msg.read_receipts as any,
        };
      } catch {
        return {
          id: msg.id,
          conversation_id: conversationId,
          sender_id: msg.sender_id,
          content: "[Decryption error]",
          message_type: msg.message_type,
          reply_to_id: msg.reply_to_id,
          metadata: msg.metadata || {},
          status: msg.status,
          created_at: msg.created_at,
          sender: msg.sender as any,
          attachments: msg.attachments as any,
          read_receipts: msg.read_receipts as any,
        };
      }
    }) || [];

  return NextResponse.json({
    messages: decryptedMessages.reverse(), // Return in chronological order
    hasMore: messages?.length === limit,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  // Handle mock mode
  if (isMockMode()) {
    const body: SendMessageRequest = await request.json();
    const newMessage: DecryptedMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: "demo-user-123",
      content: body.content,
      message_type: body.message_type || "text",
      reply_to_id: body.reply_to_id || null,
      metadata: body.metadata || {},
      status: "sent",
      created_at: new Date().toISOString(),
      sender: { id: "demo-user-123", full_name: "Demo User", avatar_url: null, role: "client" },
      read_receipts: [],
    };
    return NextResponse.json({ message: newMessage }, { status: 201 });
  }

  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: SendMessageRequest = await request.json();
  const { content, message_type = "text", reply_to_id, metadata } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Verify user is participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get encryption key
  const { data: keyData } = await supabase
    .from("encryption_keys")
    .select("key_encrypted, key_iv")
    .eq("conversation_id", conversationId)
    .eq("status", "active")
    .single();

  if (!keyData) {
    return NextResponse.json({ error: "Encryption key not found" }, { status: 500 });
  }

  const conversationKey = decryptConversationKey({
    ciphertext: keyData.key_encrypted,
    iv: keyData.key_iv,
    tag: keyData.key_iv,
  });

  // Encrypt content
  const encryptedContent = encrypt(content, conversationKey);
  const contentHash = hashContent(content);

  // Insert message using admin client to bypass RLS for insert
  const { data: message, error } = await adminClient
    .from("direct_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content_encrypted: encryptedContent.ciphertext,
      content_iv: encryptedContent.iv,
      content_tag: encryptedContent.tag,
      content_hash: contentHash,
      message_type,
      reply_to_id: reply_to_id || null,
      metadata: metadata || {},
    })
    .select(`
      id,
      sender_id,
      message_type,
      reply_to_id,
      metadata,
      status,
      created_at,
      sender:profiles(id, full_name, avatar_url, role)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return with decrypted content
  return NextResponse.json(
    {
      message: {
        ...message,
        conversation_id: conversationId,
        content, // Return original content to sender
        attachments: [],
        read_receipts: [],
      },
    },
    { status: 201 }
  );
}
