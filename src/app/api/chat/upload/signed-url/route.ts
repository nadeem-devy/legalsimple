import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isUserInConversation(conversationKey: string, userId: string): boolean {
  const parts = conversationKey.split(":");
  if (parts[0] !== "direct" || parts.length !== 3) return false;
  return parts[1] === userId || parts[2] === userId;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storagePath = request.nextUrl.searchParams.get("storage_path");
    const conversationKey = request.nextUrl.searchParams.get("conversation_key");

    if (!storagePath || !conversationKey) {
      return NextResponse.json(
        { error: "storage_path and conversation_key are required" },
        { status: 400 }
      );
    }

    if (!isUserInConversation(conversationKey, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = getAdminClient();
    const { data, error } = await adminClient.storage
      .from("chat-attachments")
      .createSignedUrl(storagePath, 3600);

    if (error) {
      return NextResponse.json(
        { error: "Failed to generate URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
