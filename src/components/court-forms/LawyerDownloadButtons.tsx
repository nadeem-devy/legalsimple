"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Scale,
  ShieldAlert,
  Send,
  Ban,
  CreditCard,
  HeartPulse,
  Users,
} from "lucide-react";

type PDFFormat =
  | "pleading"
  | "petition"
  | "sensitive_data"
  | "summons"
  | "preliminary_injunction"
  | "notice_creditors"
  | "health_insurance"
  | "parent_info_program"
  | "modification_petition";

interface LawyerDownloadButtonsProps {
  caseId: string;
  caseName: string;
  caseSubType?: string;
  caseState?: string;
}

export function LawyerDownloadButtons({
  caseId,
  caseName,
  caseSubType,
  caseState,
}: LawyerDownloadButtonsProps) {
  const hasChildren = caseSubType === "divorce_with_children" || caseSubType === "establish_paternity";
  const isPaternity = caseSubType === "establish_paternity";
  const isModification = caseSubType === "modification";
  const isNevada = caseState === "NV";
  const [isLoading, setIsLoading] = useState<PDFFormat | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const downloadPdf = async (format: PDFFormat) => {
    setIsLoading(format);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/court-forms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, format }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filenameMap: Record<PDFFormat, string> = {
        pleading: `petition-pleading-${caseName}.pdf`,
        petition: `paternity-petition-${caseName}.pdf`,
        sensitive_data: `sensitive-data-coversheet-${caseName}.pdf`,
        summons: `summons-${caseName}.pdf`,
        preliminary_injunction: `preliminary-injunction-${caseName}.pdf`,
        notice_creditors: `notice-regarding-creditors-${caseName}.pdf`,
        health_insurance: `health-insurance-notice-${caseName}.pdf`,
        parent_info_program: `parent-info-program-${caseName}.pdf`,
        modification_petition: `petition-to-modify-${caseName}.pdf`,
      };
      link.download = filenameMap[format];
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to download"
      );
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsLoading(null);
    }
  };

  const forms: {
    format: PDFFormat;
    label: string;
    icon: React.ReactNode;
    style: string;
    title: string;
    childrenOnly?: boolean;
    divorceOnly?: boolean;
    hideForModification?: boolean;
    azOnly?: boolean;
  }[] = [
    {
      format: isModification ? "modification_petition" : isPaternity ? "petition" : isNevada ? "petition" : "pleading",
      label: isModification ? "Petition to Modify" : isNevada ? "Complaint" : "Petitions",
      icon: <Scale className="h-4 w-4" />,
      style: "bg-violet-600 hover:bg-violet-700 text-white",
      title: isModification ? "Petition to Modify Existing Court Orders" : isPaternity ? "Petition to Establish Paternity" : isNevada ? "Complaint for Divorce (Nevada)" : "Petition for Dissolution with line numbers",
    },
    {
      format: "sensitive_data",
      label: "Sensitive Data",
      icon: <ShieldAlert className="h-4 w-4" />,
      style: "border-amber-300 text-amber-700 hover:bg-amber-50",
      title: "Confidential sensitive data coversheet",
      azOnly: true,
    },
    {
      format: "summons",
      label: "Summons",
      icon: <Send className="h-4 w-4" />,
      style: "border-blue-300 text-blue-700 hover:bg-blue-50",
      title: "Official court summons",
      azOnly: true,
    },
    {
      format: "notice_creditors",
      label: "Creditors",
      icon: <CreditCard className="h-4 w-4" />,
      style: "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
      title: "Notice Regarding Creditors",
      divorceOnly: true,
      hideForModification: true,
      azOnly: true,
    },
    {
      format: "health_insurance",
      label: "Health Insurance",
      icon: <HeartPulse className="h-4 w-4" />,
      style: "border-teal-300 text-teal-700 hover:bg-teal-50",
      title: "Notice of Rights About Health Insurance",
      divorceOnly: true,
      hideForModification: true,
      azOnly: true,
    },
    {
      format: "preliminary_injunction",
      label: "Injunction",
      icon: <Ban className="h-4 w-4" />,
      style: "border-red-300 text-red-700 hover:bg-red-50",
      title: "Preliminary Injunction per A.R.S. §25-315",
      hideForModification: true,
      azOnly: true,
    },
    {
      format: "parent_info_program",
      label: "Parent Program",
      icon: <Users className="h-4 w-4" />,
      style: "border-orange-300 text-orange-700 hover:bg-orange-50",
      title: "Parent Information Program Order",
      childrenOnly: true,
      hideForModification: true,
      azOnly: true,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {forms
          .filter((f) => (!f.childrenOnly || hasChildren) && (!f.divorceOnly || !isPaternity) && (!f.hideForModification || !isModification) && (!f.azOnly || !isNevada))
          .map((form) => (
            <Button
              key={form.format}
              onClick={() => downloadPdf(form.format)}
              disabled={isLoading !== null}
              variant={form.format === "pleading" || form.format === "petition" || form.format === "modification_petition" ? "default" : "outline"}
              size="sm"
              className={`gap-1.5 ${form.format === "pleading" || form.format === "petition" || form.format === "modification_petition" ? form.style : ""}`}
              title={form.title}
            >
              {isLoading === form.format ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {form.icon}
                  {form.label}
                </>
              )}
            </Button>
          ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            forms
              .filter((f) => (!f.childrenOnly || hasChildren) && (!f.divorceOnly || !isPaternity) && (!f.hideForModification || !isModification) && (!f.azOnly || !isNevada))
              .forEach((f, i) => {
                setTimeout(() => downloadPdf(f.format), i * 1500);
              });
          }}
          disabled={isLoading !== null}
          variant="outline"
          size="sm"
          className="gap-1.5 text-violet-700 border-violet-300 hover:bg-violet-50"
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>

        {status === "success" && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Downloaded
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
