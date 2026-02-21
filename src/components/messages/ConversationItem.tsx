"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OnlineStatus } from "./OnlineStatus";
import type { ConversationWithDetails, PresenceStatus } from "@/types/messages";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isSelected: boolean;
  onClick: () => void;
  participantPresence?: Record<string, PresenceStatus>;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  participantPresence = {},
}: ConversationItemProps) {
  const mainParticipant = conversation.participants[0];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case "lawyer":
        return "bg-violet-500";
      case "admin":
        return "bg-emerald-500";
      default:
        return "bg-emerald-500";
    }
  };

  const participantStatus = mainParticipant
    ? participantPresence[mainParticipant.id] || "offline"
    : "offline";

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-violet-50 border border-violet-200"
          : "hover:bg-slate-50"
      }`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={`${
              mainParticipant ? getAvatarColor(mainParticipant.role) : "bg-slate-400"
            } text-white text-sm`}
          >
            {mainParticipant ? getInitials(mainParticipant.full_name) : "?"}
          </AvatarFallback>
        </Avatar>
        {participantStatus !== "offline" && (
          <div className="absolute bottom-0 right-0 border-2 border-white rounded-full">
            <OnlineStatus status={participantStatus} size="sm" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-900 text-sm truncate">
            {mainParticipant?.full_name || conversation.title || "Unknown"}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatTimestamp(conversation.last_message_at)}
          </span>
        </div>

        {mainParticipant?.role === "lawyer" && (
          <p className="text-xs text-violet-600 font-medium">Attorney</p>
        )}

        {conversation.last_message && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {conversation.last_message.content}
          </p>
        )}

        {conversation.case_id && (
          <Badge variant="outline" className="text-xs mt-1 font-normal">
            Case linked
          </Badge>
        )}
      </div>

      {conversation.unread_count > 0 && (
        <Badge className="bg-violet-500 text-white h-5 min-w-[20px] p-0 flex items-center justify-center text-xs">
          {conversation.unread_count}
        </Badge>
      )}
    </div>
  );
}
