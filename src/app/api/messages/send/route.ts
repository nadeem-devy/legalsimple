import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, content, sender_id } = body;

    if (!conversation_id || !content || !sender_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== sender_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the conversation to find the case_id
    const { data: conversation } = await supabase
      .from("conversations")
      .select("case_id")
      .eq("id", conversation_id)
      .single();

    // Insert message into chat_messages (using the case-based messaging)
    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        case_id: conversation?.case_id || conversation_id,
        sender_type: "lawyer",
        sender_id: sender_id,
        content: content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversation_id);

    return NextResponse.json({ message, success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
