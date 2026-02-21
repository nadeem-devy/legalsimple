"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { format } from "date-fns";
import { LogoIcon } from "@/components/ui/logo";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-3xl",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-emerald-600" : "bg-slate-100")}>
        <AvatarFallback className={isUser ? "bg-emerald-600 text-white" : "bg-slate-100"}>
          {isUser ? <User className="h-4 w-4" /> : <LogoIcon size="sm" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "rounded-2xl px-4 py-2 max-w-[85%]",
          isUser
            ? "bg-emerald-600 text-white rounded-br-md"
            : "bg-slate-100 text-slate-900 rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.createdAt && (
          <p
            className={cn(
              "text-xs mt-1",
              isUser ? "text-emerald-200" : "text-slate-400"
            )}
          >
            {format(message.createdAt, "h:mm a")}
          </p>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-3xl">
      <Avatar className="h-8 w-8 shrink-0 bg-slate-100">
        <AvatarFallback className="bg-slate-100">
          <LogoIcon size="sm" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
