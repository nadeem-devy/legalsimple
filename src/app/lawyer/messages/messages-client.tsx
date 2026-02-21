"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  MessageSquare,
  CheckCheck,
  Loader2,
  CheckCircle2,
  Clock,
  Trophy,
  Paperclip,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TypingIndicator } from "@/components/messages/TypingIndicator";
import { MessageAttachments, type AttachmentData } from "@/components/messages/MessageAttachments";
import { useFileUpload, type UploadedFile } from "@/hooks/useFileUpload";

interface ConversationData {
  id: string;
  conversation_key: string;
  client_name: string;
  client_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface MessageData {
  id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

const avatarColors = [
  "bg-rose-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString();
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessagesClient({
  conversations: initialConversations,
  lawyerId,
}: {
  conversations: ConversationData[];
  lawyerId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [caseStatus, setCaseStatus] = useState<{
    status: string | null;
    case_number: string | null;
    case_type: string | null;
  }>({ status: null, case_number: null, case_type: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const {
    pendingFiles,
    uploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    fileInputRef,
    triggerFileSelect,
  } = useFileUpload();

  const filteredConversations = conversations.filter((conv) =>
    conv.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unread_count, 0);

  // Load messages via API
  const loadMessages = useCallback(
    async (convKey: string) => {
      try {
        const res = await fetch(
          `/api/chat/messages?conversation_key=${encodeURIComponent(convKey)}`
        );
        if (!res.ok) return;
        const { messages: msgs } = await res.json();
        setMessages(
          (msgs || []).map((m: Record<string, unknown>) => ({
            id: m.id as string,
            sender_id: m.sender_id as string,
            sender_type: m.sender_type as string,
            content: m.content as string,
            created_at: m.created_at as string,
            metadata: m.metadata as Record<string, unknown> | undefined,
          }))
        );
      } catch {
        setMessages([]);
      }
    },
    []
  );

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!selectedConversation) return;

    setLoadingMessages(true);
    loadMessages(selectedConversation.conversation_key).finally(() => {
      setLoadingMessages(false);
    });
  }, [selectedConversation?.conversation_key, loadMessages]);

  // Fetch case status when conversation changes
  useEffect(() => {
    if (!selectedConversation?.client_id) {
      setCaseStatus({ status: null, case_number: null, case_type: null });
      return;
    }

    const fetchCaseStatus = async () => {
      try {
        const res = await fetch(
          `/api/chat/case-status?other_user_id=${encodeURIComponent(selectedConversation.client_id)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setCaseStatus({
          status: data.case_status || null,
          case_number: data.case_number || null,
          case_type: data.case_type || null,
        });
      } catch {
        setCaseStatus({ status: null, case_number: null, case_type: null });
      }
    };

    fetchCaseStatus();
  }, [selectedConversation?.client_id]);

  // Send typing status to API (throttled — at most once per 2s)
  const sendTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!selectedConversation) return;
      const now = Date.now();
      if (isTyping && now - lastTypingSentRef.current < 2000) return;
      lastTypingSentRef.current = now;

      try {
        await fetch("/api/messages/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_key: selectedConversation.conversation_key,
            is_typing: isTyping,
          }),
        });
      } catch {
        // Silently fail — non-critical
      }
    },
    [selectedConversation]
  );

  // Handle input change — send typing event + auto-stop after 3s idle
  const handleTyping = useCallback(() => {
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  }, [sendTypingStatus]);

  // Clear typing on conversation switch
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedConversation?.conversation_key]);

  // Poll for new messages and typing status every 2 seconds
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(async () => {
      loadMessages(selectedConversation.conversation_key);

      // Poll typing status of the other user
      try {
        const res = await fetch(
          `/api/messages/typing?conversation_key=${encodeURIComponent(selectedConversation.conversation_key)}`
        );
        if (res.ok) {
          const { typing_users } = await res.json();
          setIsOtherTyping(typing_users.length > 0);
        }
      } catch {
        // Silently fail
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation?.conversation_key, loadMessages]);

  // Scroll to bottom on new messages or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  async function handleSend() {
    if ((!newMessage.trim() && pendingFiles.length === 0) || !selectedConversation) return;

    const content = newMessage.trim();
    let uploadedAttachments: UploadedFile[] = [];

    // Upload files first if any
    if (pendingFiles.length > 0) {
      setSending(true);
      try {
        uploadedAttachments = await uploadFiles(selectedConversation.conversation_key);
      } catch {
        toast.error("Failed to upload files. Please try again.");
        setSending(false);
        return;
      }
    }

    setNewMessage("");
    clearFiles();
    setSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: MessageData = {
      id: tempId,
      sender_id: lawyerId,
      sender_type: "lawyer",
      content: content || `Sent ${uploadedAttachments.length} file(s)`,
      created_at: new Date().toISOString(),
      metadata: uploadedAttachments.length > 0 ? { attachments: uploadedAttachments } : undefined,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Stop our own typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTypingStatus(false);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_key: selectedConversation.conversation_key,
          content: content || "",
          sender_type: "lawyer",
          lawyer_user_id: lawyerId,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        }),
      });

      if (res.ok) {
        const { message: data } = await res.json();
        if (data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    id: data.id,
                    sender_id: data.sender_id,
                    sender_type: data.sender_type,
                    content: data.content,
                    created_at: data.created_at,
                    metadata: data.metadata,
                  }
                : m
            )
          );
        }
      } else {
        console.error("Error sending message:", await res.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-violet-500" />
            Messages
            {totalUnread > 0 && <Badge className="bg-red-500 text-white">{totalUnread}</Badge>}
          </h1>
          <p className="text-slate-600 mt-1">Communicate with your clients securely</p>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No conversations yet</div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        // Mark as read locally
                        if (conversation.unread_count > 0) {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c.id === conversation.id ? { ...c, unread_count: 0 } : c
                            )
                          );
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? "bg-violet-50 border border-violet-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={`${getAvatarColor(conversation.client_name)} text-white text-sm`}
                        >
                          {getInitials(conversation.client_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 text-sm">
                            {conversation.client_name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-violet-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b py-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={`${getAvatarColor(selectedConversation.client_name)} text-white`}
                    >
                      {getInitials(selectedConversation.client_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedConversation.client_name}
                    </h3>
                    <p className="text-xs text-slate-500">Direct message</p>
                  </div>
                </div>
              </CardHeader>

              {/* Case Status Banner */}
              {caseStatus.status && (
                <div
                  className={`px-4 py-2.5 text-sm flex items-center gap-2 border-b ${
                    caseStatus.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : caseStatus.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : caseStatus.status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : ""
                  }`}
                >
                  {caseStatus.status === "active" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Case Active</span>
                      {caseStatus.case_number && (
                        <span className="text-xs opacity-75">— {caseStatus.case_number}</span>
                      )}
                    </>
                  ) : caseStatus.status === "pending" ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Case Pending Review</span>
                      <span className="text-xs opacity-75">
                        — {selectedConversation.client_name} submitted a case
                      </span>
                    </>
                  ) : caseStatus.status === "completed" ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">Case Completed</span>
                      {caseStatus.case_number && (
                        <span className="text-xs opacity-75">— {caseStatus.case_number}</span>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === lawyerId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            message.sender_id === lawyerId
                              ? "bg-violet-500 text-white rounded-br-md"
                              : "bg-slate-100 text-slate-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {(message.metadata?.attachments as AttachmentData[] | undefined)?.length ? (
                            <MessageAttachments
                              attachments={message.metadata!.attachments as AttachmentData[]}
                              isOwn={message.sender_id === lawyerId}
                              conversationKey={selectedConversation.conversation_key}
                            />
                          ) : null}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              message.sender_id === lawyerId ? "text-violet-200" : "text-slate-400"
                            }`}
                          >
                            <span className="text-xs">{formatMessageTime(message.created_at)}</span>
                            {message.sender_id === lawyerId && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isOtherTyping && (
                      <TypingIndicator
                        name={selectedConversation.client_name}
                        avatarColor={getAvatarColor(selectedConversation.client_name)}
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t flex-shrink-0">
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 mb-2 bg-slate-50 rounded-lg">
                    {pendingFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border text-sm"
                      >
                        <Paperclip className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[150px] text-slate-700">{file.name}</span>
                        <span className="text-slate-400 text-xs">
                          ({formatFileSize(file.size)})
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={triggerFileSelect}
                    disabled={sending || uploading}
                    className="text-slate-400 hover:text-violet-600"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    className="gap-2"
                    onClick={handleSend}
                    disabled={sending || uploading || (!newMessage.trim() && pendingFiles.length === 0)}
                  >
                    {sending || uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {uploading ? "Uploading..." : "Send"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Select a conversation</h3>
                <p className="text-slate-500">Choose a client to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
