"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MessageBubble, TypingIndicator, Message } from "./MessageBubble";
import { Send, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { StateCode } from "@/config/states";
import { PracticeAreaCode } from "@/config/practice-areas";
import { CaseData } from "@/lib/ai/chat-engine";

interface ChatInterfaceProps {
  caseId?: string;
  userState?: StateCode;
  practiceArea?: PracticeAreaCode;
  initialMessages?: Message[];
  onCaseDataReady?: (caseData: CaseData) => void;
  onGenerateDocument?: () => void;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm LegalSimple. I'll help you create a court-ready legal document.\n\nJust explain your situation in normal words. What happened?",
  createdAt: new Date(),
};

export function ChatInterface({
  caseId,
  userState,
  practiceArea,
  initialMessages = [],
  onCaseDataReady,
  onGenerateDocument,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [WELCOME_MESSAGE]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      // Prepare messages for API (excluding welcome message metadata)
      const apiMessages = [...messages.filter(m => m.id !== "welcome"), userMessage].map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          caseId,
          userState,
          practiceArea,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullMessage = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                fullMessage += data.chunk;
                setStreamingMessage(fullMessage);
              }

              if (data.done) {
                // Remove JSON block from display message
                const cleanMessage = fullMessage.replace(/```json\n[\s\S]*?\n```/, "").trim();

                const assistantMessage: Message = {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  content: cleanMessage || fullMessage,
                  createdAt: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingMessage("");

                if (data.caseData) {
                  setCaseData(data.caseData);
                  onCaseDataReady?.(data.caseData);
                }
              }

              if (data.error) {
                toast.error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isStreaming && streamingMessage && (
            <MessageBubble
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingMessage,
              }}
            />
          )}

          {isLoading && !streamingMessage && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* Case Data Ready Banner */}
      {caseData && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">
                Ready to generate your document!
              </span>
            </div>
            <Button
              size="sm"
              onClick={onGenerateDocument}
              className="bg-green-600 hover:bg-green-700"
            >
              Generate Document
            </Button>
          </div>
          {caseData.lawyer_recommended && (
            <div className="flex items-center gap-2 mt-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">
                Due to complexity, we recommend consulting with a lawyer.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">
          I&apos;m not a lawyer, but I help prepare legal documents.
        </p>
      </div>
    </Card>
  );
}
