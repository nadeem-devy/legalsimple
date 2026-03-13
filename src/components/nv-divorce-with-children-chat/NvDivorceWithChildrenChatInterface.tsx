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
  Home,
  Car,
  PiggyBank,
  Search,
  Undo2,
  Users,
  Scale,
  Sparkles,
  Loader2,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { ChatMessage, QuestionType } from "@/lib/nv-divorce-with-children-chat/types";
import {
  ChatState,
  startChat,
  processAnswer,
  processCurrentQuestion,
} from "@/lib/nv-divorce-with-children-chat/engine";
import { getQuestionById, NV_DIVORCE_WITH_CHILDREN_QUESTIONS } from "@/lib/nv-divorce-with-children-chat/questions";

interface NvDivorceWithChildrenChatInterfaceProps {
  caseId?: string;
  onComplete?: (data: ChatState["data"]) => void;
}

// Format phone number as (XXX) XXX-XXXX
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

// Validate phone number
function isValidPhone(value: string): boolean {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.length === 10;
}

// Validate email address
function isValidEmail(value: string): boolean {
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return false;
  }

  // Check for dummy/fake email patterns
  const lowerValue = value.toLowerCase();
  const dummyPatterns = [
    /^test@/,
    /^fake@/,
    /^dummy@/,
    /^example@/,
    /^sample@/,
    /^temp@/,
    /^abc@/,
    /^123@/,
    /^asdf@/,
    /^qwerty@/,
    /^admin@test/,
    /^user@test/,
    /^a@a\./,
    /^aa@aa\./,
    /^aaa@aaa\./,
    /@test\.com$/,
    /@example\.com$/,
    /@fake\.com$/,
    /@dummy\.com$/,
    /@temp\.com$/,
    /@mailinator\.com$/,
    /@guerrillamail\./,
    /@10minutemail\./,
    /@throwaway\./,
  ];

  for (const pattern of dummyPatterns) {
    if (pattern.test(lowerValue)) {
      return false;
    }
  }

  // Check if email contains only numbers before @
  const localPart = value.split("@")[0];
  if (/^\d+$/.test(localPart)) {
    return false;
  }

  // Check minimum length for local part (at least 2 characters)
  if (localPart.length < 2) {
    return false;
  }

  // Check domain has valid TLD (at least 2 characters)
  const domainPart = value.split("@")[1];
  const tld = domainPart.split(".").pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  return true;
}

// Validate date of birth (must be in the past, person must be at least 18)
function validateDateOfBirth(date: Date, questionId: string): { valid: boolean; error?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (date > today) {
    return { valid: false, error: "Date of birth cannot be in the future." };
  }

  // Check if it's a child's DOB (for children questions) - children must be under 18
  if (questionId.includes("child") && questionId.includes("dob")) {
    const age = calculateAge(date);
    if (age >= 18) {
      return { valid: false, error: "Child must be under 18 years old (minor)." };
    }
    if (age < 0) {
      return { valid: false, error: "Invalid date of birth." };
    }
    return { valid: true };
  }

  // For petitioner/respondent DOB - must be at least 18 years old
  const age = calculateAge(date);
  if (age < 18) {
    return { valid: false, error: "You must be at least 18 years old to file for divorce." };
  }
  if (age > 120) {
    return { valid: false, error: "Please enter a valid date of birth." };
  }

  return { valid: true };
}

// Validate date of marriage
function validateDateOfMarriage(date: Date, petitionerDOB?: Date): { valid: boolean; error?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (date > today) {
    return { valid: false, error: "Date of marriage cannot be in the future." };
  }

  // Marriage must be at least 1 day ago (can't divorce same day as marriage)
  const oneDayAgo = new Date(today);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  if (date > oneDayAgo) {
    return { valid: false, error: "Marriage date must be at least one day in the past." };
  }

  // Check if marriage date is too old (reasonable limit of 100 years)
  const hundredYearsAgo = new Date(today);
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  if (date < hundredYearsAgo) {
    return { valid: false, error: "Please enter a valid marriage date." };
  }

  // If we have petitioner's DOB, check they were at least 16 at marriage (US minimum with parental consent)
  if (petitionerDOB) {
    const ageAtMarriage = calculateAgeAtDate(petitionerDOB, date);
    if (ageAtMarriage < 16) {
      return { valid: false, error: "Marriage date is invalid. Person must have been at least 16 years old at time of marriage." };
    }
  }

  return { valid: true };
}

// Validate date of separation
function validateDateOfSeparation(date: Date, marriageDate?: Date): { valid: boolean; error?: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (date > today) {
    return { valid: false, error: "Date of separation cannot be in the future." };
  }

  // If we have marriage date, separation must be after marriage
  if (marriageDate && date < marriageDate) {
    return { valid: false, error: "Date of separation must be after date of marriage." };
  }

  return { valid: true };
}

// Calculate age from date of birth
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Calculate age at a specific date
function calculateAgeAtDate(birthDate: Date, atDate: Date): number {
  let age = atDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = atDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Format currency
function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function NvDivorceWithChildrenChatInterface({
  caseId,
  onComplete,
}: NvDivorceWithChildrenChatInterfaceProps) {
  const router = useRouter();
  const storageKey = `legalsimple_nv_divorce_with_children_chat_${caseId || 'draft'}`;
  const historyKey = `${storageKey}_history`;

  const [chatState, setChatState] = useState<ChatState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate currentQuestionId still exists (prevents stale state after question changes)
        if (parsed.currentQuestionId && !getQuestionById(parsed.currentQuestionId) && parsed.currentQuestionId !== 'complete') {
          localStorage.removeItem(storageKey);
          localStorage.removeItem(historyKey);
          return startChat();
        }
        parsed.messages = parsed.messages.map((m: ChatMessage) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        return parsed as ChatState;
      }
    } catch { /* ignore */ }
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
    } catch { /* ignore */ }
    return [];
  });

  // Persist chat state to localStorage (clear on completion/stop)
  useEffect(() => {
    if (chatState.isComplete || chatState.isStopped) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(historyKey);
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(chatState));
      localStorage.setItem(historyKey, JSON.stringify(stateHistory));
    } catch { /* ignore quota errors */ }
  }, [chatState, stateHistory, storageKey, historyKey]);
  const [currentInput, setCurrentInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
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

  // Show 100% when complete, otherwise estimate based on typical flow
  // The form has many conditional branches, so we estimate ~60-80 questions for a typical path
  const estimatedTotalQuestions = 70;
  const progressPercent = chatState.isComplete
    ? 100
    : Math.min(Math.round((answeredQuestions / estimatedTotalQuestions) * 100), 99);

  // Calculate stats from collected data
  const stats = {
    children: chatState.data.children?.length || 0,
    properties: chatState.data.homes?.length || 0,
    vehicles: chatState.data.vehicles?.length || 0,
    retirement: chatState.data.retirementAccounts?.length || 0,
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  // Focus input when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.type !== "info" && currentQuestion.type !== "stop") {
      inputRef.current?.focus();
    }
  }, [currentQuestion]);

  // Save function — defined before handleSubmit so it can be called from retry button too
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveIntakeData = async (data?: any) => {
    const intakeData = data || chatState.data;
    setIsSubmitting(true);
    setSaveFailed(false);
    try {
      const response = await fetch("/api/cases/save-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          intakeType: "nv_divorce_with_children_chat",
          data: intakeData,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.error("Save intake failed:", response.status, errorBody);
        throw new Error(`Failed to save intake data (${response.status})`);
      }

      const result = await response.json();
      localStorage.removeItem(storageKey);
      localStorage.removeItem(historyKey);
      const resolvedCaseId = result.caseId || caseId;
      setSavedCaseId(resolvedCaseId);
      toast.success("Questionnaire completed successfully!");

      if (onComplete) {
        onComplete(intakeData);
      } else {
        router.push(`/cases/${resolvedCaseId}?generate=true`);
      }
    } catch (error) {
      console.error("Error saving intake:", error);
      setSaveFailed(true);
      toast.error("Failed to save your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion) return;

    let answer = "";

    // Clear any previous validation error
    setValidationError(null);

    // Handle different input types
    if (currentQuestion.type === "info") {
      // Save current state to history
      setStateHistory(prev => [...prev, chatState]);
      const infoState = processAnswer(chatState, "continue");
      setChatState(processCurrentQuestion(infoState));
      if (infoState.isComplete) {
        saveIntakeData(infoState.data);
      }
      return;
    }

    if (currentQuestion.type === "date") {
      if (!dateValue) {
        setValidationError("Please select a date");
        return;
      }

      // Validate date based on question type
      const questionId = currentQuestion.id.toLowerCase();

      // Date of birth validation
      if (questionId.includes("dob") || questionId.includes("date_of_birth") || questionId.includes("birth")) {
        const validation = validateDateOfBirth(dateValue, currentQuestion.id);
        if (!validation.valid) {
          setValidationError(validation.error || "Invalid date");
          return;
        }
      }

      // Date of marriage validation
      if (questionId.includes("marriage") && (questionId.includes("date") || questionId.includes("married"))) {
        // Try to get petitioner DOB from collected data for age-at-marriage validation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const petitionerDOBStr = (chatState.data as any).petitionerDateOfBirth;
        let petitionerDOB: Date | undefined;
        if (petitionerDOBStr) {
          petitionerDOB = new Date(petitionerDOBStr);
        }
        const validation = validateDateOfMarriage(dateValue, petitionerDOB);
        if (!validation.valid) {
          setValidationError(validation.error || "Invalid date");
          return;
        }
      }

      // Date of separation validation
      if (questionId.includes("separation") && questionId.includes("date")) {
        // Try to get marriage date from collected data
        const marriageDateStr = chatState.data.dateOfMarriage;
        let marriageDate: Date | undefined;
        if (marriageDateStr) {
          marriageDate = new Date(marriageDateStr);
        }
        const validation = validateDateOfSeparation(dateValue, marriageDate);
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
    } else if (currentQuestion.type === "yesno" || currentQuestion.type === "select") {
      answer = currentInput;
    } else if (currentQuestion.type === "phone") {
      if (currentQuestion.required && !isValidPhone(currentInput)) {
        setValidationError("Please enter a valid 10-digit phone number");
        return;
      }
      answer = currentInput;
    } else if (currentQuestion.type === "address") {
      const trimmed = currentInput.trim();
      if (currentQuestion.required && !trimmed) {
        setValidationError("Please enter your address.");
        return;
      }
      if (trimmed && !trimmed.includes(",")) {
        setValidationError("Please include city, state, and zip code separated by commas (e.g., 123 Main St, Phoenix, AZ 85001).");
        return;
      }
      if (trimmed && !/\b\d{5}(-\d{4})?\b/.test(trimmed)) {
        setValidationError("Please include a zip code in your address (e.g., 123 Main St, Phoenix, AZ 85001).");
        return;
      }
      answer = currentInput;
    } else if (currentQuestion.type === "email") {
      // Validate email if provided (even if not required)
      if (currentInput.trim() && !isValidEmail(currentInput)) {
        setValidationError("Please enter a valid email address. Temporary or test emails are not accepted.");
        return;
      }
      answer = currentInput;
    } else {
      answer = currentInput;
    }

    // Full name validation (first + last name required)
    if (
      (currentQuestion.id === "full_name" || currentQuestion.id === "spouse_full_name" || currentQuestion.id === "child_name") &&
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
    setStateHistory(prev => [...prev, chatState]);

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
      saveIntakeData(newState.data);
    }
  }, [chatState, currentQuestion, currentInput, selectedOptions, dateValue, caseId, onComplete, router]);

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

    // Get the previous state
    const previousState = stateHistory[stateHistory.length - 1];

    // Remove the last state from history
    setStateHistory(prev => prev.slice(0, -1));

    // Restore the previous state
    setChatState(previousState);

    // Reset inputs
    setCurrentInput("");
    setSelectedOptions([]);
    setDateValue(undefined);
    setSearchFilter("");

    toast.success("Previous answer removed. Please answer again.");
  }, [stateHistory]);

  const handleOptionSelect = (value: string) => {
    setCurrentInput(value);
    if (currentQuestion?.type === "yesno" || currentQuestion?.type === "select") {
      // Save current state to history
      setStateHistory(prev => [...prev, chatState]);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCurrentInput(formatted);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCurrentInput(value);
  };

  const renderTooltip = () => {
    if (!currentQuestion?.tooltip) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm hover:shadow-md transition-all flex-shrink-0 mt-1">
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          className="w-72 p-0 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5">
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-base font-medium shadow-lg"
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        );

      case "address":
        return (
          <div className="flex gap-3">
            <AddressAutocomplete
              value={currentInput}
              onChange={setCurrentInput}
              placeholder={currentQuestion.placeholder || "123 Main Street, Phoenix, AZ 85001"}
              onKeyPress={handleKeyPress}
            />
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !currentInput.trim()}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      case "stop":
        return (
          <div className="space-y-3">
            {/* Show redirect to Divorce Without Children if stopped due to not having children */}
            {(currentQuestion.id === "without_children_redirect" || currentQuestion.id === "without_children_redirect_2") && (
              <Button
                onClick={() => router.push("/intake/divorce-chat")}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Divorce Without Children Form
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/chat")}
              className="w-full h-12"
            >
              Talk to AI Assistant
            </Button>
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

      case "select":
        const hasSearch = (currentQuestion.options?.length || 0) > 5;
        const filteredOptions = hasSearch && searchFilter
          ? currentQuestion.options?.filter(option =>
              option.label.toLowerCase().includes(searchFilter.toLowerCase())
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
                  className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <p className="font-medium text-slate-900">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                  )}
                </button>
              ))}
              {filteredOptions?.length === 0 && (
                <p className="text-center text-slate-500 py-4">No results found</p>
              )}
            </div>
          </div>
        );

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
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  )}
                  style={{ animationDelay: `${idx * 75}ms` }}
                >
                  <Checkbox
                    checked={selectedOptions.includes(option.value)}
                    onCheckedChange={() => handleMultiSelectToggle(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                className="resize-none text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
              <button
                type="button"
                onClick={handleRefineText}
                disabled={isRefining || !currentInput.trim()}
                className={cn(
                  "absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border z-10",
                  isRefining
                    ? "opacity-60 cursor-not-allowed border-blue-200 bg-blue-50 text-blue-600"
                    : !currentInput.trim()
                      ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 active:scale-[0.97]"
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
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Type your answer, then tap <span className="font-semibold">AI Assist</span> to refine it for your court filing.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !currentInput.trim()}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                  {dateValue ? format(dateValue, "MMMM d, yyyy") : "Select date..."}
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
                  defaultMonth={
                    currentQuestion?.id === 'date_of_birth' || currentQuestion?.id === 'spouse_date_of_birth'
                      ? new Date(1990, 0)
                      : currentQuestion?.id === 'child_dob'
                      ? new Date(new Date().getFullYear() - 5, 0)
                      : undefined
                  }
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleSubmit}
              disabled={!dateValue}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      case "currency":
        return (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium">
                $
              </span>
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentInput ? formatCurrency(currentInput) : ""}
                onChange={handleCurrencyChange}
                onKeyPress={handleKeyPress}
                placeholder="0"
                className="pl-8 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!currentInput}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      case "phone":
        return (
          <div className="flex gap-3">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="tel"
              value={currentInput}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
              placeholder="(555) 555-5555"
              maxLength={14}
              className={cn(
                "flex-1 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl",
                currentInput && !isValidPhone(currentInput) && "border-amber-400 focus:border-amber-500"
              )}
            />
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !isValidPhone(currentInput)}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      case "email":
        return (
          <div className="flex gap-3">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="email"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentQuestion.placeholder || "email@example.com"}
              className="flex-1 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              disabled={currentQuestion.required && !currentInput}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      case "ssn4":
        return (
          <div className="flex gap-3">
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={currentInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setCurrentInput(val);
              }}
              onKeyPress={handleKeyPress}
              placeholder="XXXX"
              maxLength={4}
              className="flex-1 h-12 text-base text-center tracking-[0.5em] font-mono border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              disabled={currentInput.length !== 4}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        );

      default: {
        const isNameField = ["full_name", "spouse_full_name", "maiden_name_input", "child_full_name"].includes(currentQuestion.id);
        return (
          <div className="space-y-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder || "Type your answer..."}
                  spellCheck={true}
                  className={cn(
                    "h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl w-full",
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
                        ? "opacity-60 cursor-not-allowed border-blue-200 bg-blue-50 text-blue-600"
                        : !currentInput.trim()
                          ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 active:scale-[0.97]"
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
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {!isNameField && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Use <span className="font-semibold">AI Assist</span> to refine your answer for your court filing.
              </p>
            )}
          </div>
        );
      }
    }
  };

  // Get display label for user answer
  const getAnswerDisplay = (message: ChatMessage) => {
    const question = message.questionId ? getQuestionById(message.questionId) : null;
    if (!question) return message.content;

    if (question.type === "yesno") {
      return message.content.toLowerCase() === "yes" ? "Yes" : "No";
    }

    if (question.type === "select" && question.options) {
      const option = question.options.find(o => o.value === message.content);
      return option?.label || message.content;
    }

    return message.content;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header with Progress */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Questionnaire Progress</h3>
            <p className="text-xs text-slate-500">{answeredQuestions} questions answered</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />

        {/* Case Statistics */}
        {(stats.children > 0 || stats.properties > 0 || stats.vehicles > 0 || stats.retirement > 0) && (
          <div className="flex flex-wrap gap-3 mt-4 animate-in fade-in-0 slide-in-from-left-4 duration-500">
            {stats.children > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                {stats.children} {stats.children === 1 ? "Child" : "Children"}
              </div>
            )}
            {stats.properties > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <Home className="h-3.5 w-3.5 text-indigo-500" />
                {stats.properties} {stats.properties === 1 ? "Property" : "Properties"}
              </div>
            )}
            {stats.vehicles > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <Car className="h-3.5 w-3.5 text-green-500" />
                {stats.vehicles} {stats.vehicles === 1 ? "Vehicle" : "Vehicles"}
              </div>
            )}
            {stats.retirement > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                <PiggyBank className="h-3.5 w-3.5 text-amber-500" />
                {stats.retirement} Retirement
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
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <LogoIcon size="sm" darkMode />
              </div>
            )}
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl py-3",
                  message.type === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md px-6"
                    : message.type === "system"
                    ? "bg-amber-50 border border-amber-200 text-amber-900 px-4"
                    : message.id === chatState.messages[chatState.messages.length - 1]?.id
                    ? "bg-slate-100 text-slate-800 px-4 border-2 border-emerald-400 animate-emerald-glow"
                    : "bg-slate-100 text-slate-800 px-4"
                )}
              >
                <p className={cn(
                  "whitespace-pre-wrap leading-relaxed",
                  message.type === "user"
                    ? "text-sm"
                    : "text-base font-semibold"
                )}>
                  {message.type === "user" ? getAnswerDisplay(message) : message.content}
                </p>
              </div>
              {message.type === "assistant" &&
               message.id === chatState.messages[chatState.messages.length - 1]?.id &&
               currentQuestion?.tooltip && (
                renderTooltip()
              )}
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
            <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br ${saveFailed ? 'from-red-500 to-red-600' : isSubmitting ? 'from-yellow-500 to-yellow-600' : 'from-green-500 to-green-600'} flex items-center justify-center shadow-md`}>
              {saveFailed ? <AlertTriangle className="h-4 w-4 text-white" /> : isSubmitting ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-white" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${saveFailed ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              {isSubmitting ? (
                <>
                  <p className="text-sm font-semibold text-yellow-800 mb-2">Saving your responses...</p>
                  <p className="text-sm text-yellow-700 leading-relaxed">Please wait while we save your case.</p>
                </>
              ) : saveFailed ? (
                <>
                  <p className="text-sm font-semibold text-red-800 mb-2">Failed to save your responses</p>
                  <p className="text-sm text-red-700 leading-relaxed mb-4">There was an error saving your case. Please try again.</p>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 h-11 px-5 rounded-lg justify-start"
                    onClick={() => saveIntakeData()}
                  >
                    Retry Save
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    Questionnaire Complete!
                  </p>
                  <p className="text-sm text-green-700 leading-relaxed mb-4">
                    Your responses have been saved. Choose an option below:
                  </p>
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 h-11 px-5 rounded-lg justify-start"
                      disabled={!savedCaseId}
                      onClick={() => router.push(`/cases/${savedCaseId}?generate=true`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Documents
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-11 px-5 rounded-lg justify-start border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                      disabled={!savedCaseId}
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/cases/${savedCaseId}/request-lawyer`, {
                            method: "POST",
                          });
                          if (response.ok) {
                            toast.success("Your case has been forwarded for lawyer review!");
                            router.push(`/cases/${savedCaseId}`);
                          } else {
                            toast.error("Failed to forward case. Please try again.");
                          }
                        } catch {
                          toast.error("Failed to forward case. Please try again.");
                        }
                      }}
                    >
                      <Scale className="h-4 w-4 mr-2" />
                      Forward to Lawyer Review
                    </Button>
                  </div>
                </>
              )}
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
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
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
              onClick={() => router.push("/chat")}
              className="w-full h-12 rounded-xl"
            >
              Talk to AI Assistant
            </Button>
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
