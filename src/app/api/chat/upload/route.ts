import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const conversationKey = formData.get("conversation_key") as string;

    if (!conversationKey) {
      return NextResponse.json(
        { error: "conversation_key is required" },
        { status: 400 }
      );
    }

    if (!isUserInConversation(conversationKey, user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 files per upload" },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // Ensure bucket exists (idempotent)
    await adminClient.storage.createBucket("chat-attachments", {
      public: false,
      fileSizeLimit: MAX_FILE_SIZE,
    });

    const uploaded: Array<{
      storage_path: string;
      url: string;
      file_name: string;
      file_type: string;
      file_size: number;
    }> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (max 10MB)` },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const safeName = sanitizeFilename(file.name);
      const storagePath = `${conversationKey}/${timestamp}-${safeName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await adminClient.storage
        .from("chat-attachments")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload: ${file.name}` },
          { status: 500 }
        );
      }

      const { data: signedUrlData } = await adminClient.storage
        .from("chat-attachments")
        .createSignedUrl(storagePath, 3600);

      uploaded.push({
        storage_path: storagePath,
        url: signedUrlData?.signedUrl || "",
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      });
    }

    return NextResponse.json({ files: uploaded });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
