"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckCheck, Paperclip } from "lucide-react";
import type { DecryptedMessage } from "@/types/messages";

interface MessageItemProps {
  message: DecryptedMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  currentUserId?: string;
}

export function MessageItem({
  message,
  isOwn,
  showAvatar = true,
  currentUserId,
}: MessageItemProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isRead = message.read_receipts?.some(
    (r) => r.user_id !== message.sender_id
  );

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
        {showAvatar && !isOwn && message.sender && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-violet-500 text-white text-xs">
              {getInitials(message.sender.full_name)}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "bg-violet-500 text-white rounded-br-md"
              : "bg-slate-100 text-slate-900 rounded-bl-md"
          }`}
        >
          {!isOwn && message.sender && (
            <p className={`text-xs font-medium mb-1 ${isOwn ? "text-violet-200" : "text-violet-600"}`}>
              {message.sender.full_name}
            </p>
          )}

          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    isOwn ? "bg-violet-600" : "bg-slate-200"
                  }`}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="text-xs truncate">{attachment.file_name}</span>
                </div>
              ))}
            </div>
          )}

          <div
            className={`flex items-center justify-end gap-1 mt-1 ${
              isOwn ? "text-violet-200" : "text-slate-400"
            }`}
          >
            <span className="text-xs">{formatTime(message.created_at)}</span>
            {isOwn && (
              isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
