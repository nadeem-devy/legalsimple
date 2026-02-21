"use client";

import type { PresenceStatus } from "@/types/messages";

interface OnlineStatusProps {
  status: PresenceStatus;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusColors: Record<PresenceStatus, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  busy: "bg-red-500",
  offline: "bg-slate-400",
};

const statusLabels: Record<PresenceStatus, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function OnlineStatus({
  status,
  showText = false,
  size = "md",
}: OnlineStatusProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ${
          status === "online" ? "animate-pulse" : ""
        }`}
      />
      {showText && (
        <span className="text-xs text-slate-500">{statusLabels[status]}</span>
      )}
    </div>
  );
}
