"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Send,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  ArrowRight,
  CalendarIcon,
  Search,
  Undo2,
  Users,
  Scale,
  FileEdit,
  Sparkles,
  Loader2,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";
import { ChatMessage, QuestionType } from "@/lib/modification-chat/types";
import {
  ChatState,
  startChat,
  processAnswer,
  processCurrentQuestion,
} from "@/lib/modification-chat/engine";
import {
  getQuestionById,
  MODIFICATION_QUESTIONS,
} from "@/lib/modification-chat/questions";

interface ModificationChatInterfaceProps {
  caseId?: string;
  onComplete?: (data: ChatState["data"]) => void;
}

// Validate date of birth for children - must be under 18
function validateChildDOB(date: Date): { valid: boolean; error?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return { valid: false, error: "Date of birth cannot be in the future." };
  }

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age--;
  }

  if (age >= 18) {
    return {
      valid: false,
      error: "Child must be under 18 years old (minor).",
    };
  }
  if (age < 0) {
    return { valid: false, error: "Invalid date of birth." };
  }

  return { valid: true };
}

export function ModificationChatInterface({
  caseId,
  onComplete,
}: ModificationChatInterfaceProps) {
  const router = useRouter();
  const storageKey = `legalsimple_modification_chat_${caseId || "draft"}`;
  const historyKey = `${storageKey}_history`;

  const [chatState, setChatState] = useState<ChatState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.messages = parsed.messages.map((m: ChatMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        return parsed as ChatState;
      }
    } catch {
      /* ignore */
    }
    return startChat();
  });

  const [stateHistory, setStateHistory] = useState<ChatState[]>(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((state: ChatState) => ({
          ...state,
          messages: state.messages.map((m: ChatMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
      }
    } catch {
      /* ignore */
    }
    return [];
  });

  // Persist chat state to localStorage
  useEffect(() => {
    if (chatState.isComplete) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(chatState));
      localStorage.setItem(historyKey, JSON.stringify(stateHistory));
    } catch {
      /* ignore quota errors */
    }
  }, [chatState, stateHistory, storageKey, historyKey]);

  const [currentInput, setCurrentInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current question details
  const currentQuestion = chatState.currentQuestionId
    ? getQuestionById(chatState.currentQuestionId)
    : null;

  // Calculate progress
  const answeredQuestions = chatState.messages.filter(
    (m) => m.type === "user"
  ).length;

  const estimatedTotalQuestions = 30;
  const progressPercent = chatState.isComplete
    ? 100
    : Math.min(
        Math.round((answeredQuestions / estimatedTotalQuestions) * 100),
        99
      );

  // Calculate stats from collected data
  const stats = {
    children: chatState.data.children?.length || 0,
    modifications: chatState.data.modificationsSelected?.length || 0,
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // Focus input when question changes
  useEffect(() => {
    if (
      currentQuestion &&
      currentQuestion.type !== "info" &&
      currentQuestion.type !== "stop"
    ) {
      inputRef.current?.focus();
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;

    let answer = "";

    // Clear any previous validation error
    setValidationError(null);

    // Handle different input types
    if (currentQuestion.type === "info") {
      setStateHistory((prev) => [...prev, chatState]);
      const newState = processAnswer(chatState, "continue");
      setChatState(processCurrentQuestion(newState));
      return;
    }

    if (currentQuestion.type === "date") {
      if (!dateValue) {
        setValidationError("Please select a date");
        return;
      }

      // Validate child DOB
      if (currentQuestion.id === "child_dob") {
        const validation = validateChildDOB(dateValue);
        if (!validation.valid) {
          setValidationError(validation.error || "Invalid date");
          return;
        }
      }

      answer = format(dateValue, "MM/dd/yyyy");
    } else if (currentQuestion.type === "multiselect") {
      if (selectedOptions.length === 0) {
        setValidationError("Please select at least one option");
        return;
      }
      answer = selectedOptions.join(", ");
    } else if (
      currentQuestion.type === "yesno" ||
      currentQuestion.type === "select"
    ) {
      answer = currentInput;
    } else if (currentQuestion.type === "address") {
      const trimmed = currentInput.trim();
      if (currentQuestion.required && !trimmed) {
        setValidationError("Please enter your address.");
        return;
      }
      if (trimmed && !trimmed.includes(",")) {
        setValidationError(
          "Please include city, state, and zip code separated by commas (e.g., 123 Main St, Phoenix, AZ 85001)."
        );
        return;
      }
      answer = currentInput;
    } else {
      answer = currentInput;
    }

    // Full name validation (first + last name required)
    if (
      (currentQuestion.id === "full_name" ||
        currentQuestion.id === "other_party_name" ||
        currentQuestion.id === "child_name") &&
      answer.trim().split(/\s+/).length < 2
    ) {
      setValidationError("Please enter a full name (first and last name)");
      return;
    }

    // Validate required fields
    if (currentQuestion.required && !answer.trim()) {
      setValidationError("Please provide an answer to continue.");
      return;
    }

    // Save current state to history before processing
    setStateHistory((prev) => [...prev, chatState]);

    // Create user message and process answer
    const newState = processAnswer(chatState, answer);

    // Reset inputs
    setCurrentInput("");
    setSelectedOptions([]);
    setDateValue(undefined);
    setSearchFilter("");
    setValidationError(null);

    // Process next question
    setChatState(processCurrentQuestion(newState));

    // Check if complete
    if (newState.isComplete) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/cases/save-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId,
            intakeType: "modification_chat",
            data: newState.data,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save intake data");
        }

        const result = await response.json();
        // Clear persisted state on successful completion
        localStorage.removeItem(storageKey);
        localStorage.removeItem(historyKey);
        toast.success("Questionnaire completed successfully!");

        // Store the returned caseId for use in completion buttons
        if (result.caseId) {
          setSavedCaseId(result.caseId);
        }

        if (onComplete) {
          onComplete(newState.data);
        } else {
          const targetCaseId = result.caseId || caseId;
          if (targetCaseId) {
            router.push(`/cases/${targetCaseId}?generate=true`);
          } else {
            router.push('/court-forms');
          }
        }
      } catch (error) {
        console.error("Error saving intake:", error);
        toast.error("Failed to save your responses. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    chatState,
    currentQuestion,
    currentInput,
    selectedOptions,
    dateValue,
    caseId,
    onComplete,
    router,
    storageKey,
    historyKey,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRefineText = useCallback(async () => {
    if (!currentInput.trim() || !currentQuestion || isRefining) return;

    setIsRefining(true);
    try {
      const response = await fetch("/api/intake/refine-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: currentInput,
          questionText: currentQuestion.question,
          questionId: currentQuestion.id,
          placeholder: currentQuestion.placeholder,
          tooltip: currentQuestion.tooltip,
        }),
      });

      if (!response.ok) throw new Error("Refinement failed");

      const { refinedText } = await response.json();
      if (refinedText) setCurrentInput(refinedText);
    } catch (error) {
      console.error("Refine text error:", error);
      toast.error("Could not refine text. Please try again.");
    } finally {
      setIsRefining(false);
    }
  }, [currentInput, currentQuestion, isRefining]);

  const handleUndo = useCallback(() => {
    if (stateHistory.length === 0) return;

    const previousState = stateHistory[stateHistory.length - 1];
    setStateHistory((prev) => prev.slice(0, -1));
    setChatState(previousState);

    setCurrentInput("");
    setSelectedOptions([]);
    setDateValue(undefined);
    setSearchFilter("");

    toast.success("Previous answer removed. Please answer again.");
  }, [stateHistory]);

  const handleOptionSelect = (value: string) => {
    setCurrentInput(value);
    if (
      currentQuestion?.type === "yesno" ||
      currentQuestion?.type === "select"
    ) {
      setStateHistory((prev) => [...prev, chatState]);
      setTimeout(() => {
        const newState = processAnswer(chatState, value);
        setCurrentInput("");
        setChatState(processCurrentQuestion(newState));
      }, 300);
    }
  };

  const handleMultiSelectToggle = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const renderTooltip = () => {
    if (!currentQuestion?.tooltip) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm hover:shadow-md transition-all flex-shrink-0 mt-1">
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          className="w-72 p-0 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-2.5">
            <p className="text-white font-medium text-xs flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Why we ask this
            </p>
          </div>
          <div className="p-3 bg-white">
            <p className="text-slate-700 text-xs leading-relaxed font-semibold">
              {currentQuestion.tooltip}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderInputField = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "info":
        return (
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12 text-base font-medium shadow-lg"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        );

      case "stop":
        return (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full h-12"
            >
              Return to Dashboard
            </Button>
          </div>
        );

      case "yesno":
        return (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOptionSelect("yes")}
              className={cn(
                "flex items-center justify-center h-14 rounded-xl border-2 font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                currentInput === "yes"
                  ? "border-green-500 bg-green-50 text-green-700 shadow-md"
                  : "border-slate-200 hover:border-green-300 hover:bg-green-50/50 text-slate-700"
              )}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Yes
            </button>
            <button
              onClick={() => handleOptionSelect("no")}
              className={cn(
                "flex items-center justify-center h-14 rounded-xl border-2 font-medium text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
                currentInput === "no"
                  ? "border-red-400 bg-red-50 text-red-700 shadow-md"
                  : "border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-slate-700"
              )}
            >
              No
            </button>
          </div>
        );

      case "select": {
        const hasSearch = (currentQuestion.options?.length || 0) > 5;
        const filteredOptions =
          hasSearch && searchFilter
            ? currentQuestion.options?.filter((option) =>
                option.label
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase())
              )
            : currentQuestion.options;

        return (
          <div className="space-y-3">
            {hasSearch && (
              <div className="relative animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                />
              </div>
            )}
            <div className="max-h-[280px] overflow-y-auto space-y-2">
              {filteredOptions?.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleOptionSelect(option.value);
                    setSearchFilter("");
                  }}
                  className={cn(
                    "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] animate-in fade-in-0 slide-in-from-bottom-2",
                    currentInput === option.value
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-slate-200 hover:border-amber-300 hover:bg-slate-50"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <p className="font-medium text-slate-900">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {option.description}
                    </p>
                  )}
                </button>
              ))}
              {filteredOptions?.length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No results found
                </p>
              )}
            </div>
          </div>
        );
      }

      case "multiselect":
        return (
          <div className="space-y-3">
            <div className="max-h-[250px] overflow-y-auto space-y-3">
              {currentQuestion.options?.map((option, idx) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] animate-in fade-in-0 slide-in-from-bottom-2",
                    selectedOptions.includes(option.value)
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200 hover:border-amber-300 hover:bg-slate-50"
                  )}
                  style={{ animationDelay: `${idx * 75}ms` }}
                >
                  <Checkbox
                    checked={selectedOptions.includes(option.value)}
                    onCheckedChange={() =>
                      handleMultiSelectToggle(option.value)
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={4}
                spellCheck={true}
                className="resize-none text-base border-slate-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
              />
              <button
                type="button"
                onClick={handleRefineText}
                disabled={isRefining || !currentInput.trim()}
                className={cn(
                  "absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border z-10",
                  isRefining
                    ? "opacity-60 cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600"
                    : !currentInput.trim()
                      ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 active:scale-[0.97]"
                )}
              >
                {isRefining ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <LogoIcon size="sm" className="h-3.5 w-3.5" />
                )}
                {isRefining ? "Refining..." : "AI Assist"}
              </button>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !currentInput.trim()}
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case "date":
        return (
          <div className="flex gap-3">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 h-12 justify-start text-left font-normal rounded-xl border-slate-200",
                    !dateValue && "text-slate-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-slate-400" />
                  {dateValue
                    ? format(dateValue, "MMMM d, yyyy")
                    : "Select date..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => {
                    setDateValue(date);
                    setDateOpen(false);
                  }}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleSubmit}
              disabled={!dateValue}
              className="h-12 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      default: {
        const isNameField = ["full_name", "spouse_full_name", "child_full_name"].includes(currentQuestion.id);
        return (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentQuestion.placeholder || "Type your answer..."
                }
                spellCheck={true}
                className={cn(
                  "h-12 text-base border-slate-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl w-full",
                  !isNameField && "pr-[90px]"
                )}
              />
              {!isNameField && (
                <button
                  type="button"
                  onClick={handleRefineText}
                  disabled={isRefining || !currentInput.trim()}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border",
                    isRefining
                      ? "opacity-60 cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600"
                      : !currentInput.trim()
                        ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 active:scale-[0.97]"
                  )}
                >
                  {isRefining ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <LogoIcon size="sm" className="h-3.5 w-3.5" />
                  )}
                  {isRefining ? "Refining..." : "AI Assist"}
                </button>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !currentInput.trim()}
              className="h-12 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );
      }
    }
  };

  // Get display label for user answer
  const getAnswerDisplay = (message: ChatMessage) => {
    const question = message.questionId
      ? getQuestionById(message.questionId)
      : null;
    if (!question) return message.content;

    if (question.type === "yesno") {
      return message.content.toLowerCase() === "yes" ? "Yes" : "No";
    }

    if (question.type === "select" && question.options) {
      const roleLabel =
        chatState.data.role === "petitioner" ? "Petitioner" : "Respondent";
      const option = question.options.find((o) => o.value === message.content);
      return option?.label.replace(/\{roleLabel\}/g, roleLabel) || message.content;
    }

    if (question.type === "multiselect" && question.options) {
      const values = message.content.split(", ");
      return values
        .map((v) => {
          const option = question.options?.find((o) => o.value === v.trim());
          return option?.label || v;
        })
        .join(", ");
    }

    return message.content;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header with Progress */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-amber-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Questionnaire Progress
            </h3>
            <p className="text-xs text-slate-500">
              {answeredQuestions} questions answered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {progressPercent}%
            </span>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />

        {/* Case Statistics */}
        {(stats.children > 0 || stats.modifications > 0) && (
          <div className="flex flex-wrap gap-3 mt-4 animate-in fade-in-0 slide-in-from-left-4 duration-500">
            {stats.children > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <Users className="h-3.5 w-3.5 text-amber-500" />
                {stats.children}{" "}
                {stats.children === 1 ? "Child" : "Children"}
              </div>
            )}
            {stats.modifications > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <FileEdit className="h-3.5 w-3.5 text-orange-500" />
                {stats.modifications}{" "}
                {stats.modifications === 1
                  ? "Modification"
                  : "Modifications"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white">
        {chatState.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-in fade-in-0 duration-300 ease-out",
              message.type === "user"
                ? "justify-end slide-in-from-right-4"
                : "justify-start slide-in-from-left-4"
            )}
          >
            {message.type === "assistant" && (
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <LogoIcon size="sm" darkMode />
              </div>
            )}
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl py-3",
                  message.type === "user"
                    ? "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md px-6"
                    : message.type === "system"
                    ? "bg-amber-50 border border-amber-200 text-amber-900 px-4"
                    : message.id ===
                      chatState.messages[chatState.messages.length - 1]?.id
                    ? "bg-slate-100 text-slate-800 px-4 border-2 border-amber-400"
                    : "bg-slate-100 text-slate-800 px-4"
                )}
              >
                <p
                  className={cn(
                    "whitespace-pre-wrap leading-relaxed",
                    message.type === "user" ? "text-sm" : "text-base font-semibold"
                  )}
                >
                  {message.type === "user"
                    ? getAnswerDisplay(message)
                    : message.content}
                </p>
              </div>
              {message.type === "assistant" &&
                message.id ===
                  chatState.messages[chatState.messages.length - 1]?.id &&
                currentQuestion?.tooltip &&
                renderTooltip()}
            </div>
            {message.type === "user" && (
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Stop State */}
        {chatState.isStopped && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-red-50 border border-red-200">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-red-800">
                {chatState.stopReason}
              </p>
            </div>
          </div>
        )}

        {/* Completion State */}
        {chatState.isComplete && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">
                Questionnaire Complete!
              </p>
              <p className="text-sm text-green-700 leading-relaxed mb-4">
                Your responses have been saved. Choose an option below:
              </p>
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 h-11 px-5 rounded-lg justify-start"
                  onClick={() => {
                    const targetCaseId = savedCaseId || caseId;
                    if (targetCaseId) {
                      router.push(`/cases/${targetCaseId}?generate=true`);
                    } else {
                      router.push('/court-forms');
                    }
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 px-5 rounded-lg justify-start border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  onClick={async () => {
                    const targetCaseId = savedCaseId || caseId;
                    if (!targetCaseId) {
                      toast.error("Case ID not found. Please go to Court Forms to download your documents.");
                      router.push('/court-forms');
                      return;
                    }
                    try {
                      const response = await fetch(
                        `/api/cases/${targetCaseId}/request-lawyer`,
                        {
                          method: "POST",
                        }
                      );
                      if (response.ok) {
                        toast.success(
                          "Your case has been forwarded for lawyer review!"
                        );
                        router.push(`/cases/${targetCaseId}`);
                      } else {
                        toast.error(
                          "Failed to forward case. Please try again."
                        );
                      }
                    } catch {
                      toast.error(
                        "Failed to forward case. Please try again."
                      );
                    }
                  }}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Forward to Lawyer Review
                </Button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!chatState.isStopped && !chatState.isComplete && currentQuestion && (
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Undo button */}
          {stateHistory.length > 0 && (
            <div className="flex justify-start mb-3">
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors"
              >
                <Undo2 className="h-4 w-4" />
                Undo last answer
              </button>
            </div>
          )}
          {/* Validation Error Display */}
          {validationError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}
          {renderInputField()}
        </div>
      )}

      {/* Stopped State Actions */}
      {chatState.isStopped && (
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full h-12 rounded-xl"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
