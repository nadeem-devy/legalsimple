"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StateCode, STATE_OPTIONS } from "@/config/states";
import {
  Users,
  FileText,
  ArrowRight,
  ArrowLeft,
  Heart,
  Baby,
  Gavel,
  Building,
  ScrollText,
  Scale,
  FileCheck,
} from "lucide-react";
import { DivorceChatInterface } from "@/components/divorce-chat";
import { DivorceWithChildrenChatInterface } from "@/components/divorce-with-children-chat";
import { NvDivorceWithChildrenChatInterface } from "@/components/nv-divorce-with-children-chat";
import { PaternityChatInterface } from "@/components/paternity-chat";
import { ModificationChatInterface } from "@/components/modification-chat";

type PracticeAreaCode = "family_law" | "business_formation" | "estate_planning";

interface SubTypeOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  formType: "chat" | "ai" | "coming_soon";
}

interface PracticeAreaOption {
  value: PracticeAreaCode;
  label: string;
  description: string;
  icon: React.ReactNode;
  subTypes: SubTypeOption[];
}

const PRACTICE_AREAS: PracticeAreaOption[] = [
  {
    value: "family_law",
    label: "Family Law",
    description: "Divorce, custody, child support, and more",
    icon: <Users className="h-8 w-8" />,
    subTypes: [
      {
        value: "divorce_no_children",
        label: "Divorce (No Children)",
        description: "Petition for dissolution of marriage without minor children",
        icon: <Heart className="h-6 w-6" />,
        available: true,
        formType: "chat",
      },
      {
        value: "divorce_with_children",
        label: "Divorce (With Children)",
        description: "Divorce with custody, child support, and parenting arrangements",
        icon: <Baby className="h-6 w-6" />,
        available: true,
        formType: "chat",
      },
      {
        value: "child_custody",
        label: "Establishing First Court Orders",
        description: "Establish paternity, custody, child support, and parenting time",
        icon: <Baby className="h-6 w-6" />,
        available: true,
        formType: "chat",
      },
      {
        value: "modification",
        label: "Modification of Existing Court Orders",
        description: "Modify legal decision making, parenting time, or child support orders",
        icon: <Gavel className="h-6 w-6" />,
        available: true,
        formType: "chat",
      },
    ],
  },
  {
    value: "business_formation",
    label: "Business Formation",
    description: "LLC formation, corporation setup, partnership agreements",
    icon: <Building className="h-8 w-8" />,
    subTypes: [
      {
        value: "llc",
        label: "LLC Formation",
        description: "Limited Liability Company setup and operating agreement",
        icon: <Building className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
      {
        value: "corporation",
        label: "Corporation",
        description: "C-Corp or S-Corp formation documents",
        icon: <Building className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
      {
        value: "partnership",
        label: "Partnership",
        description: "General or Limited Partnership agreements",
        icon: <Scale className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
      {
        value: "nonprofit",
        label: "Nonprofit Organization",
        description: "501(c)(3) and other nonprofit entity formation",
        icon: <FileCheck className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
    ],
  },
  {
    value: "estate_planning",
    label: "Estate Planning",
    description: "Wills, trusts, power of attorney",
    icon: <FileText className="h-8 w-8" />,
    subTypes: [
      {
        value: "will",
        label: "Last Will & Testament",
        description: "Create a legally binding will",
        icon: <ScrollText className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
      {
        value: "living_trust",
        label: "Living Trust",
        description: "Revocable living trust documents",
        icon: <Scale className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
      {
        value: "power_of_attorney",
        label: "Power of Attorney",
        description: "Durable and healthcare power of attorney",
        icon: <FileCheck className="h-6 w-6" />,
        available: false,
        formType: "coming_soon",
      },
    ],
  },
];

type Step = "state" | "practice_area" | "sub_type" | "form";

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("state");
  const [selectedState, setSelectedState] = useState<StateCode | undefined>();
  const [selectedArea, setSelectedArea] = useState<PracticeAreaCode | undefined>();
  const [selectedSubType, setSelectedSubType] = useState<string | undefined>();
  const [caseId, setCaseId] = useState<string | null>(null);

  const selectedPracticeArea = PRACTICE_AREAS.find((a) => a.value === selectedArea);
  const selectedSubTypeOption = selectedPracticeArea?.subTypes.find(
    (s) => s.value === selectedSubType
  );

  const handleStateSelect = (state: StateCode) => {
    setSelectedState(state);
  };

  const handleAreaSelect = (area: PracticeAreaCode) => {
    setSelectedArea(area);
    setSelectedSubType(undefined);
  };

  const handleSubTypeSelect = (subType: string) => {
    setSelectedSubType(subType);
  };

  const handleNext = () => {
    if (step === "state" && selectedState) {
      setStep("practice_area");
    } else if (step === "practice_area" && selectedArea) {
      setStep("sub_type");
    } else if (step === "sub_type" && selectedSubType) {
      const subTypeOpt = selectedPracticeArea?.subTypes.find(
        (s) => s.value === selectedSubType
      );
      if (subTypeOpt?.available) {
        setStep("form");
      } else {
        toast.info("This form is coming soon!");
      }
    }
  };

  const handleBack = () => {
    if (step === "practice_area") {
      setStep("state");
    } else if (step === "sub_type") {
      setStep("practice_area");
      setSelectedSubType(undefined);
    } else if (step === "form") {
      setStep("sub_type");
    }
  };

  const canProceed = () => {
    switch (step) {
      case "state":
        return !!selectedState;
      case "practice_area":
        return !!selectedArea;
      case "sub_type":
        return !!selectedSubType && selectedSubTypeOption?.available;
      default:
        return false;
    }
  };

  // Render the actual form based on selection
  if (step === "form") {
    // Divorce without children - use the chat interface
    if (selectedSubType === "divorce_no_children") {
      return (
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Divorce Petition (No Children) - Arizona
            </h1>
            <p className="text-slate-600">
              Answer questions one at a time to complete your divorce petition.
            </p>
          </div>
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <DivorceChatInterface caseId={caseId || undefined} />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Divorce with children - use state-specific chat interface
    if (selectedSubType === "divorce_with_children") {
      const isNevada = selectedState === "NV";
      return (
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {isNevada
                ? "Complaint for Divorce (With Children) - Nevada"
                : "Divorce Petition (With Children) - Arizona"}
            </h1>
            <p className="text-slate-600">
              {isNevada
                ? "Answer questions one at a time to complete your Nevada divorce complaint with custody, child support, and UCCJEA declaration."
                : "Answer questions one at a time to complete your divorce petition with custody and support arrangements."}
            </p>
          </div>
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {isNevada ? (
                <NvDivorceWithChildrenChatInterface caseId={caseId || undefined} />
              ) : (
                <DivorceWithChildrenChatInterface caseId={caseId || undefined} />
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Establishing First Court Orders (Paternity) - use the paternity chat interface
    if (selectedSubType === "child_custody") {
      return (
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Establish Paternity, Legal Decision Making, Parenting Time &amp; Child Support - Arizona
            </h1>
            <p className="text-slate-600">
              Answer questions one at a time to complete your petition to establish paternity.
            </p>
          </div>
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <PaternityChatInterface caseId={caseId || undefined} />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Modification of Existing Court Orders
    if (selectedSubType === "modification") {
      return (
        <div className="max-w-5xl lg:max-w-7xl mx-auto">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Selection
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Petition to Modify Existing Court Orders - Arizona
            </h1>
            <p className="text-slate-600">
              Answer questions one at a time to complete your petition to modify existing court orders.
            </p>
          </div>
          <Card className="border-slate-200 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <ModificationChatInterface caseId={caseId || undefined} />
            </CardContent>
          </Card>
        </div>
      );
    }

    // Other forms would go here
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-slate-500">This form is not yet available.</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Start a New Case</h1>
        <p className="text-slate-600">
          {step === "state" && "First, tell us where you're located."}
          {step === "practice_area" && "What type of legal matter is this?"}
          {step === "sub_type" && "Select the specific form you need."}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2">
        {["state", "practice_area", "sub_type"].map((s, i) => (
          <div
            key={s}
            className={`h-2 w-16 rounded-full transition-colors ${
              step === s
                ? "bg-emerald-600"
                : ["state", "practice_area", "sub_type"].indexOf(step) > i
                ? "bg-green-500"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: State Selection */}
      {step === "state" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Where are you located?</CardTitle>
            <CardDescription>
              We need to know your state to generate the correct court documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedState}
              onValueChange={(value) => handleStateSelect(value as StateCode)}
            >
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedState && selectedState !== "AZ" && selectedState !== "NV" && (
              <p className="mt-4 text-sm text-amber-600">
                Note: Currently, only Arizona and Nevada forms are available. More states coming soon!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Practice Area Selection */}
      {step === "practice_area" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What type of legal matter is this?</CardTitle>
            <CardDescription>Select the category that best fits your situation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {PRACTICE_AREAS.map((area) => (
                <button
                  key={area.value}
                  onClick={() => handleAreaSelect(area.value)}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    selectedArea === area.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedArea === area.value
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{area.label}</h3>
                    <p className="text-sm text-slate-500 mt-1">{area.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Sub-type Selection */}
      {step === "sub_type" && selectedPracticeArea && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {selectedPracticeArea.icon}
              {selectedPracticeArea.label}
            </CardTitle>
            <CardDescription>Select the specific form you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {selectedPracticeArea.subTypes.map((subType) => (
                <button
                  key={subType.value}
                  onClick={() => subType.available && handleSubTypeSelect(subType.value)}
                  disabled={!subType.available}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                    !subType.available
                      ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                      : selectedSubType === subType.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedSubType === subType.value
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {subType.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{subType.label}</h3>
                      {!subType.available && (
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                      {subType.available && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{subType.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === "state"}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
          {step === "sub_type" ? "Start Form" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
