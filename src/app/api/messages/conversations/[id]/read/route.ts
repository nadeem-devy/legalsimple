import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient, isMockMode } from "@/lib/supabase/server";
import type { MarkAsReadRequest } from "@/types/messages";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

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

  const body: MarkAsReadRequest = await request.json();
  const { message_ids } = body;

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

  // Create read receipts for all specified messages
  if (message_ids?.length) {
    const readReceipts = message_ids.map((messageId) => ({
      message_id: messageId,
      user_id: user.id,
    }));

    // Use upsert to avoid duplicate errors
    await adminClient
      .from("message_read_receipts")
      .upsert(readReceipts, { onConflict: "message_id,user_id" });
  }

  // Reset unread count for this participant
  await adminClient
    .from("conversation_participants")
    .update({
      unread_count: 0,
      last_read_at: new Date().toISOString(),
      last_read_message_id: message_ids?.[message_ids.length - 1] || null,
    })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
