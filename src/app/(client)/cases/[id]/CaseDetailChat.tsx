"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { Message } from "@/components/chat/MessageBubble";
import { StateCode } from "@/config/states";
import { PracticeAreaCode } from "@/config/practice-areas";

interface CaseDetailChatProps {
  caseId: string;
  initialMessages: Array<{
    id: string;
    sender_type: string;
    content: string;
    created_at: string;
  }>;
  userState: StateCode;
  practiceArea: PracticeAreaCode;
}

export function CaseDetailChat({
  caseId,
  initialMessages,
  userState,
  practiceArea,
}: CaseDetailChatProps) {
  // Convert database messages to chat interface format
  const messages: Message[] = initialMessages.map((msg) => ({
    id: msg.id,
    role: msg.sender_type === "user" ? "user" : "assistant",
    content: msg.content,
    createdAt: new Date(msg.created_at),
  }));

  // Add welcome message if no messages exist
  if (messages.length === 0) {
    messages.push({
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm LegalSimple. I'll help you with your case.\n\nFeel free to continue our conversation or ask any questions about your legal matter.",
      createdAt: new Date(),
    });
  }

  return (
    <ChatInterface
      caseId={caseId}
      userState={userState}
      practiceArea={practiceArea}
      initialMessages={messages}
    />
  );
}
