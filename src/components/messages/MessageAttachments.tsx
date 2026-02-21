"use client";

import { useState } from "react";
import { FileText, Download, Image as ImageIcon } from "lucide-react";

export interface AttachmentData {
  storage_path: string;
  url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(type: string): boolean {
  return type.startsWith("image/");
}

function RefreshableImage({
  attachment,
  conversationKey,
}: {
  attachment: AttachmentData;
  conversationKey?: string;
}) {
  const [src, setSrc] = useState(attachment.url);
  const [failed, setFailed] = useState(false);

  const handleError = async () => {
    if (failed) return; // Only retry once
    setFailed(true);

    if (!conversationKey) return;

    try {
      const res = await fetch(
        `/api/chat/upload/signed-url?storage_path=${encodeURIComponent(attachment.storage_path)}&conversation_key=${encodeURIComponent(conversationKey)}`
      );
      if (res.ok) {
        const { url } = await res.json();
        setSrc(url);
        setFailed(false);
      }
    } catch {
      // Could not refresh
    }
  };

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={src}
        alt={attachment.file_name}
        onError={handleError}
        className="max-w-[240px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
      />
    </a>
  );
}

export function MessageAttachments({
  attachments,
  isOwn,
  conversationKey,
}: {
  attachments: AttachmentData[];
  isOwn: boolean;
  conversationKey?: string;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-2">
      {attachments.map((att, idx) =>
        isImage(att.file_type) ? (
          <RefreshableImage
            key={idx}
            attachment={att}
            conversationKey={conversationKey}
          />
        ) : (
          <a
            key={idx}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isOwn
                ? "bg-white/15 hover:bg-white/25"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          >
            <FileText
              className={`h-5 w-5 flex-shrink-0 ${isOwn ? "text-white/70" : "text-slate-500"}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${isOwn ? "text-white" : "text-slate-700"}`}
              >
                {att.file_name}
              </p>
              <p
                className={`text-xs ${isOwn ? "text-white/60" : "text-slate-400"}`}
              >
                {formatFileSize(att.file_size)}
              </p>
            </div>
            <Download
              className={`h-4 w-4 flex-shrink-0 ${isOwn ? "text-white/70" : "text-slate-400"}`}
            />
          </a>
        )
      )}
    </div>
  );
}
