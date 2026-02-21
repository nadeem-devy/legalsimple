"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Send,
  FileUp,
  Loader2,
  MessageCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface QuickChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId: string;
  lawyerUserId: string;
  lawyerName: string;
  lawyerAvatar?: string | null;
  lawyerVerified?: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_type: string;
  is_own: boolean;
  created_at: string;
}

// Build a deterministic conversation key from two user IDs
function getConversationKey(userA: string, userB: string): string {
  const sorted = [userA, userB].sort();
  return `direct:${sorted[0]}:${sorted[1]}`;
}

export function QuickChatSheet({
  open,
  onOpenChange,
  lawyerId,
  lawyerUserId,
  lawyerName,
  lawyerAvatar,
  lawyerVerified = true,
}: QuickChatSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationKey, setConversationKey] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Case submission state
  const [showSubmitCase, setShowSubmitCase] = useState(false);
  const [userCases, setUserCases] = useState<
    { id: string; case_number: string; case_type: string; status: string }[]
  >([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseMessage, setCaseMessage] = useState("");
  const [submittingCase, setSubmittingCase] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedCaseStatus, setSubmittedCaseStatus] = useState<string | null>(null);
  const [loadingCases, setLoadingCases] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // Load user cases when submit panel opens
  useEffect(() => {
    if (!showSubmitCase) return;
    setLoadingCases(true);
    setSelectedCaseId("");
    setCaseMessage("");
    setSubmitSuccess(false);

    const loadCases = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("cases")
            .select("id, case_number, case_type, status")
            .eq("client_id", user.id)
            .order("created_at", { ascending: false });
          setUserCases(
            (data as { id: string; case_number: string; case_type: string; status: string }[]) || []
          );
        }
      } catch (error) {
        console.error("Error loading cases:", error);
      } finally {
        setLoadingCases(false);
      }
    };
    loadCases();
  }, [showSubmitCase]);

  const handleSubmitCase = async () => {
    if (!selectedCaseId) return;
    setSubmittingCase(true);
    try {
      const response = await fetch("/api/lawyers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: selectedCaseId,
          lawyer_id: lawyerUserId,
          client_message: caseMessage || null,
        }),
      });
      if (response.ok) {
        setSubmitSuccess(true);
        setSubmittedCaseStatus("pending");
      }
    } catch (error) {
      console.error("Error submitting case:", error);
    } finally {
      setSubmittingCase(false);
    }
  };

  function getPracticeAreaName(code: string) {
    return (
      PRACTICE_AREAS[code as keyof typeof PRACTICE_AREAS]?.name ||
      code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  // Load messages via API
  const loadMessages = useCallback(
    async (userId: string, convKey: string) => {
      try {
        const res = await fetch(
          `/api/chat/messages?conversation_key=${encodeURIComponent(convKey)}`
        );
        if (!res.ok) return;
        const { messages: msgs } = await res.json();
        if (msgs) {
          setMessages(
            msgs.map((m: Record<string, string>) => ({
              id: m.id,
              content: m.content,
              sender_id: m.sender_id,
              sender_type: m.sender_type,
              is_own: m.sender_id === userId,
              created_at: m.created_at,
            }))
          );
          scrollToBottom();
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    },
    [scrollToBottom]
  );

  // Check if there's an existing case request with this lawyer
  const checkRequestStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/lawyers/request?lawyer_id=${encodeURIComponent(lawyerUserId)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.request) {
        // Map to a user-friendly status
        if (data.request.status === "accepted" || data.case_status === "in_progress") {
          setSubmittedCaseStatus("active");
        } else if (data.request.status === "pending") {
          setSubmittedCaseStatus("pending");
        } else if (data.request.status === "rejected") {
          setSubmittedCaseStatus("rejected");
        }
      }
    } catch {
      // Ignore errors
    }
  }, [lawyerUserId]);

  // Initialize: get current user, load messages, check request status
  useEffect(() => {
    if (!open) return;

    const supabase = createClient();

    const init = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        setCurrentUserId(user.id);
        const convKey = getConversationKey(user.id, lawyerUserId);
        setConversationKey(convKey);

        await loadMessages(user.id, convKey);
        await checkRequestStatus();
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [open, lawyerUserId, loadMessages, checkRequestStatus]);

  // Poll for new messages and case status every 3 seconds while sheet is open
  useEffect(() => {
    if (!open || !currentUserId || !conversationKey) return;

    const interval = setInterval(() => {
      loadMessages(currentUserId, conversationKey);
      if (submittedCaseStatus === "pending") {
        checkRequestStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, currentUserId, conversationKey, loadMessages, submittedCaseStatus, checkRequestStatus]);

  const handleSend = async () => {
    if (!inputValue.trim() || !currentUserId || !conversationKey) return;

    const content = inputValue.trim();
    setInputValue("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      content,
      sender_id: currentUserId,
      sender_type: "user",
      is_own: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_key: conversationKey,
          content,
          sender_type: "user",
          lawyer_user_id: lawyerUserId,
          lawyer_name: lawyerName,
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
                    content: data.content,
                    sender_id: data.sender_id,
                    sender_type: data.sender_type,
                    is_own: true,
                    created_at: data.created_at,
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
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const chatReady = !!currentUserId && !!conversationKey;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            {lawyerAvatar ? (
              <img
                src={lawyerAvatar}
                alt={lawyerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                {lawyerName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base flex items-center gap-1.5">
                {lawyerName}
                {lawyerVerified && (
                  <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Available to chat
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Case Status Banner */}
        {submittedCaseStatus && (
          <div
            className={cn(
              "px-4 py-2.5 text-sm flex items-center gap-2 border-b",
              submittedCaseStatus === "active"
                ? "bg-emerald-50 text-emerald-700"
                : submittedCaseStatus === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
            )}
          >
            {submittedCaseStatus === "active" ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Case Active</span>
                <span className="text-xs opacity-75">— {lawyerName} accepted your case</span>
              </>
            ) : submittedCaseStatus === "pending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Case Under Review</span>
                <span className="text-xs opacity-75">— Waiting for {lawyerName} to accept</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                <span className="font-medium">Case Declined</span>
                <span className="text-xs opacity-75">— You can submit to another lawyer</span>
              </>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                Start a conversation
              </p>
              <p className="text-xs text-slate-400 max-w-[200px]">
                Send a message to {lawyerName} about your legal needs
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.is_own ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5",
                      msg.is_own
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-900 rounded-bl-md"
                    )}
                  >
                    {!msg.is_own && (
                      <p className="text-[10px] font-medium text-emerald-600 mb-0.5">
                        {lawyerName}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] mt-1 text-right",
                        msg.is_own ? "text-emerald-200" : "text-slate-400"
                      )}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Submit Case Panel (slides up inline) */}
        {showSubmitCase && (
          <div className="border-t bg-gradient-to-b from-slate-50 to-white px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <FileUp className="h-3.5 w-3.5 text-emerald-600" />
                Submit Case for Review
              </h4>
              <button
                onClick={() => setShowSubmitCase(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submittedCaseStatus === "active" || submittedCaseStatus === "pending" ? (
              <div className="text-center py-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2",
                    submittedCaseStatus === "active" ? "bg-emerald-100" : "bg-amber-100"
                  )}
                >
                  {submittedCaseStatus === "active" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                  )}
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {submittedCaseStatus === "active"
                    ? "Case Active"
                    : "Case Under Review"}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  {submittedCaseStatus === "active"
                    ? `You already have an active case with ${lawyerName}.`
                    : `Your case is pending review by ${lawyerName}. You\u2019ll be notified when they respond.`}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
                  onClick={() => setShowSubmitCase(false)}
                >
                  Back to Chat
                </Button>
              </div>
            ) : submitSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  Case Submitted!
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  {lawyerName} will review and respond within 24 hours.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs"
                  onClick={() => setShowSubmitCase(false)}
                >
                  Back to Chat
                </Button>
              </div>
            ) : loadingCases ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
              </div>
            ) : (
              <>
                <div>
                  <Select
                    value={selectedCaseId}
                    onValueChange={setSelectedCaseId}
                  >
                    <SelectTrigger className="rounded-lg text-sm h-9">
                      <SelectValue placeholder="Select a case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userCases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.case_number} — {getPracticeAreaName(c.case_type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userCases.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      No cases found. Start a case first.
                    </p>
                  )}
                </div>

                <Textarea
                  className="rounded-lg text-sm min-h-[60px]"
                  placeholder="Add a note for the lawyer (optional)..."
                  value={caseMessage}
                  onChange={(e) => setCaseMessage(e.target.value)}
                  rows={2}
                />

                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-1.5 text-xs h-8"
                  disabled={!selectedCaseId || submittingCase}
                  onClick={handleSubmitCase}
                >
                  {submittingCase ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileUp className="h-3.5 w-3.5" />
                  )}
                  {submittingCase ? "Submitting..." : "Submit for Review"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t bg-white">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "rounded-xl h-9 w-9 shrink-0",
                showSubmitCase
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-400 hover:text-emerald-600"
              )}
              onClick={() => setShowSubmitCase(!showSubmitCase)}
              title="Submit case for review"
            >
              <FileUp className="h-4 w-4" />
            </Button>
            <Input
              placeholder={`Message ${lawyerName}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || !chatReady}
              className="flex-1 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !inputValue.trim() || !chatReady}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-9 w-9 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
