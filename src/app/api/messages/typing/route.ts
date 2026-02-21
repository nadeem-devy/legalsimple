import { NextRequest, NextResponse } from "next/server";
import { createClient, isMockMode } from "@/lib/supabase/server";

// Typing status expires after this many seconds of no updates
const TYPING_EXPIRY_SECONDS = 5;

// In-memory typing status store (no database table needed)
// Key: `${userId}:${conversationKey}`, Value: timestamp when typing started
const typingStore = new Map<string, number>();

// Clean expired entries periodically
function cleanExpired() {
  const now = Date.now();
  for (const [key, timestamp] of typingStore.entries()) {
    if (now - timestamp > TYPING_EXPIRY_SECONDS * 1000) {
      typingStore.delete(key);
    }
  }
}

// Extract the other user's ID from a conversation_key like "direct:uuid1:uuid2"
function getOtherUserId(
  conversationKey: string,
  currentUserId: string
): string | null {
  const parts = conversationKey.split(":");
  if (parts.length !== 3 || parts[0] !== "direct") return null;
  return parts[1] === currentUserId ? parts[2] : parts[1];
}

export async function POST(request: NextRequest) {
  if (isMockMode()) {
    return NextResponse.json({ success: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversation_key, is_typing } = await request.json();

  if (!conversation_key) {
    return NextResponse.json(
      { error: "conversation_key required" },
      { status: 400 }
    );
  }

  const storeKey = `${user.id}:${conversation_key}`;

  if (is_typing) {
    typingStore.set(storeKey, Date.now());
  } else {
    typingStore.delete(storeKey);
  }

  // Clean up expired entries
  cleanExpired();

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const conversationKey = searchParams.get("conversation_key");

  if (isMockMode()) {
    return NextResponse.json({ typing_users: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!conversationKey) {
    return NextResponse.json({ typing_users: [] });
  }

  // Get the other participant's ID from the conversation key
  const otherUserId = getOtherUserId(conversationKey, user.id);
  if (!otherUserId) {
    return NextResponse.json({ typing_users: [] });
  }

  // Check if the other user is currently typing in this conversation
  const storeKey = `${otherUserId}:${conversationKey}`;
  const typingTimestamp = typingStore.get(storeKey);

  const typingUsers: string[] = [];
  if (typingTimestamp && Date.now() - typingTimestamp < TYPING_EXPIRY_SECONDS * 1000) {
    typingUsers.push(otherUserId);
  } else if (typingTimestamp) {
    // Expired, clean it up
    typingStore.delete(storeKey);
  }

  return NextResponse.json({ typing_users: typingUsers });
}
