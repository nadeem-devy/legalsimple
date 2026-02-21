import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant in this conversation
    const { data: participation } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (!participation) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    // Get the conversation to find case_id
    const { data: conversation } = await supabase
      .from("conversations")
      .select("case_id")
      .eq("id", conversationId)
      .single();

    // Fetch messages for this conversation
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("id, case_id, sender_type, sender_id, content, created_at")
      .eq("case_id", conversation?.case_id || conversationId)
      .order("created_at", { ascending: true });

    // Transform messages to the expected format
    const transformedMessages = (messages || []).map((m: {
      id: string;
      case_id: string;
      sender_type: string;
      sender_id: string | null;
      content: string;
      created_at: string;
    }) => ({
      id: m.id,
      conversation_id: conversationId,
      sender_id: m.sender_id || "",
      sender_type: m.sender_type === "lawyer" ? "lawyer" : "client",
      content: m.content,
      created_at: m.created_at,
    }));

    // Mark messages as read
    await supabase
      .from("conversation_participants")
      .update({
        unread_count: 0,
        last_read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    return NextResponse.json({ messages: transformedMessages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
