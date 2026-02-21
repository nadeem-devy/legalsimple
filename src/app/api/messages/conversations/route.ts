import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient, isMockMode } from "@/lib/supabase/server";
import {
  generateConversationKey,
  encryptConversationKey,
} from "@/lib/encryption";
import type { CreateConversationRequest, ConversationWithDetails } from "@/types/messages";

// Demo data for mock mode
const DEMO_CONVERSATIONS: ConversationWithDetails[] = [
  {
    id: "conv-1",
    type: "direct",
    case_id: null,
    title: null,
    status: "active",
    created_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 10 * 60000).toISOString(),
    unread_count: 1,
    last_read_at: new Date(Date.now() - 30 * 60000).toISOString(),
    participants: [
      { id: "lawyer-1", full_name: "Jennifer Martinez", avatar_url: null, role: "lawyer" },
    ],
    last_message: {
      content: "I've drafted the initial petition and attached it for your review.",
      sender_id: "lawyer-1",
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  },
  {
    id: "conv-2",
    type: "case",
    case_id: "case-1",
    title: "Divorce Case Discussion",
    status: "active",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    last_message_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    unread_count: 0,
    last_read_at: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
    participants: [
      { id: "lawyer-2", full_name: "Robert Chen", avatar_url: null, role: "lawyer" },
    ],
    last_message: {
      content: "Your trust documents are ready for signing.",
      sender_id: "lawyer-2",
      created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  },
];

export async function GET(request: NextRequest) {
  // Handle mock mode
  if (isMockMode()) {
    return NextResponse.json({ conversations: DEMO_CONVERSATIONS });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's conversations with unread count
  const { data: participations, error } = await supabase
    .from("conversation_participants")
    .select(`
      unread_count,
      last_read_at,
      conversation:conversations(
        id,
        type,
        title,
        case_id,
        status,
        last_message_at,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("conversation(last_message_at)", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get conversation IDs
  const conversationIds = participations
    ?.map((p: Record<string, Record<string, string>>) => p.conversation?.id)
    .filter(Boolean) as string[];

  if (!conversationIds.length) {
    return NextResponse.json({ conversations: [] });
  }

  // Get other participants for each conversation
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      user:profiles(id, full_name, avatar_url, role)
    `)
    .in("conversation_id", conversationIds)
    .eq("status", "active")
    .neq("user_id", user.id);

  // Build response
  const conversations: ConversationWithDetails[] = participations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.filter((p: any) => p.conversation)
    .map((p: any) => ({
      id: p.conversation!.id,
      type: p.conversation!.type,
      case_id: p.conversation!.case_id,
      title: p.conversation!.title,
      status: p.conversation!.status,
      created_at: p.conversation!.created_at,
      last_message_at: p.conversation!.last_message_at,
      unread_count: p.unread_count,
      last_read_at: p.last_read_at,
      participants:
        allParticipants
          ?.filter((ap: any) => ap.conversation_id === p.conversation!.id)
          .map((ap: any) => ap.user as any) || [],
    })) || [];

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  // Handle mock mode
  if (isMockMode()) {
    const newConversation: ConversationWithDetails = {
      id: `conv-${Date.now()}`,
      type: "direct",
      case_id: null,
      title: null,
      status: "active",
      created_at: new Date().toISOString(),
      last_message_at: null,
      unread_count: 0,
      last_read_at: null,
      participants: [],
    };
    return NextResponse.json({ conversation: newConversation }, { status: 201 });
  }

  const supabase = await createClient();
  const adminClient = await createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: CreateConversationRequest = await request.json();
  const { type, participant_ids, case_id, title } = body;

  // Validate request
  if (!type || !participant_ids || !Array.isArray(participant_ids)) {
    return NextResponse.json(
      { error: "type and participant_ids are required" },
      { status: 400 }
    );
  }

  // Ensure creator is in participants
  const allParticipantIds = [...new Set([...participant_ids, user.id])];

  // Check if direct conversation already exists between these users
  if (type === "direct" && allParticipantIds.length === 2) {
    const { data: existingConv } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", allParticipantIds[0])
      .eq("status", "active");

    if (existingConv?.length) {
      for (const conv of existingConv) {
        const { data: otherParticipant } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("conversation_id", conv.conversation_id)
          .eq("user_id", allParticipantIds[1])
          .eq("status", "active")
          .single();

        if (otherParticipant) {
          // Conversation already exists
          const { data: existingConversation } = await supabase
            .from("conversations")
            .select("*")
            .eq("id", conv.conversation_id)
            .eq("type", "direct")
            .single();

          if (existingConversation) {
            return NextResponse.json(
              { conversation: existingConversation, existing: true },
              { status: 200 }
            );
          }
        }
      }
    }
  }

  // Generate encryption key
  const conversationKey = generateConversationKey();
  const encryptedKey = encryptConversationKey(conversationKey);

  // Create conversation using admin client to bypass RLS
  const { data: conversation, error: convError } = await adminClient
    .from("conversations")
    .insert({
      type,
      case_id: case_id || null,
      title: title || null,
      created_by: user.id,
      encryption_enabled: true,
    })
    .select()
    .single();

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  // Store encryption key
  await adminClient.from("encryption_keys").insert({
    conversation_id: conversation.id,
    key_encrypted: encryptedKey.ciphertext,
    key_iv: encryptedKey.iv,
  });

  // Get participant profiles for role information
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role")
    .in("id", allParticipantIds);

  // Add participants
  const participantRecords =
    profiles?.map((p: any) => ({
      conversation_id: conversation.id,
      user_id: p.id,
      role: p.role,
    })) || [];

  await adminClient.from("conversation_participants").insert(participantRecords);

  return NextResponse.json({ conversation }, { status: 201 });
}
