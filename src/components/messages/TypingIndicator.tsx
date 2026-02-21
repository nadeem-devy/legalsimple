"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TypingIndicatorProps {
  name?: string;
  avatarColor?: string;
}

export function TypingIndicator({ name, avatarColor = "bg-violet-500" }: TypingIndicatorProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex justify-start animate-in fade-in-0 slide-in-from-left-2 duration-300">
      <div className="flex gap-2 max-w-[70%]">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className={`${avatarColor} text-white text-xs`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="bg-slate-100 rounded-2xl rounded-bl-md px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
