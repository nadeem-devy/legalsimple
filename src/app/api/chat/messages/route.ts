import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

// Service role client bypasses RLS (chat_messages RLS only allows case-bound messages)
function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Validate that the user is part of the conversation
function isUserInConversation(conversationKey: string, userId: string): boolean {
  // Conversation key format: "direct:<id1>:<id2>" where ids are sorted
  const parts = conversationKey.split(":");
  if (parts[0] !== "direct" || parts.length !== 3) return false;
  return parts[1] === userId || parts[2] === userId;
}

/**
 * GET /api/chat/messages?conversation_key=direct:xxx:yyy
 * Load messages for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationKey = request.nextUrl.searchParams.get("conversation_key");
    if (!conversationKey) {
      return NextResponse.json(
        { error: "conversation_key is required" },
        { status: 400 }
      );
    }

    // Ensure user is part of this conversation
    if (!isUserInConversation(conversationKey, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = getAdminClient();
    const { data: messages, error } = await adminClient
      .from("chat_messages")
      .select("id, sender_id, sender_type, content, created_at, metadata")
      .eq("metadata->>conversation_key", conversationKey)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return NextResponse.json(
        { error: "Failed to load messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/messages
 * Send a new direct message
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversation_key, content, sender_type, lawyer_user_id, lawyer_name, attachments } = body as {
      conversation_key: string;
      content: string;
      sender_type: "user" | "lawyer";
      lawyer_user_id?: string;
      lawyer_name?: string;
      attachments?: Array<{
        storage_path: string;
        url: string;
        file_name: string;
        file_type: string;
        file_size: number;
      }>;
    };

    const hasAttachments = attachments && attachments.length > 0;
    if (!conversation_key || (!content?.trim() && !hasAttachments)) {
      return NextResponse.json(
        { error: "conversation_key and either content or attachments are required" },
        { status: 400 }
      );
    }

    // Ensure user is part of this conversation
    if (!isUserInConversation(conversation_key, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = getAdminClient();
    const metadata: Record<string, unknown> = {
      conversation_key,
      conversation_type: "direct",
    };
    if (lawyer_user_id) metadata.lawyer_user_id = lawyer_user_id;
    if (lawyer_name) metadata.lawyer_name = lawyer_name;
    if (hasAttachments) metadata.attachments = attachments;

    const messageContent = content?.trim() || `Sent ${attachments!.length} file(s)`;

    const { data: message, error } = await adminClient
      .from("chat_messages")
      .insert({
        sender_id: user.id,
        sender_type: sender_type || "user",
        content: messageContent,
        metadata,
      })
      .select("id, sender_id, sender_type, content, created_at, metadata")
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
