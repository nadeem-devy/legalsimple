"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle, Scale, ShieldAlert, Send, Ban, CreditCard, HeartPulse, Users, FileText } from "lucide-react";
import { SignaturePad } from "./SignaturePad";

type PDFFormat = 'summary' | 'pleading' | 'sensitive_data' | 'summons' | 'preliminary_injunction' | 'notice_creditors' | 'health_insurance' | 'parent_info_program' | 'petition' | 'modification_petition' | 'original_order';

interface DownloadButtonProps {
  caseId: string;
  caseName: string;
  petitionerName?: string;
  caseSubType?: string;
  caseState?: string;
  wantsInjunction?: boolean;
}

// Key for storing signature in localStorage
const SIGNATURE_STORAGE_KEY = "legalsimple_petitioner_signature";

export function DownloadButton({ caseId, caseName, petitionerName = "Petitioner", caseSubType, caseState, wantsInjunction = true }: DownloadButtonProps) {
  const hasChildren = caseSubType === 'divorce_with_children' || caseSubType === 'establish_paternity';
  const isPaternity = caseSubType === 'establish_paternity';
  const isModification = caseSubType === 'modification';
  const isNevada = caseState === 'NV';
  const [isLoading, setIsLoading] = useState<PDFFormat | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [pendingFormat, setPendingFormat] = useState<PDFFormat>('summary');

  // Load existing signature on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (stored) {
      setSavedSignature(stored);
    }
  }, []);

  const handleDownloadClick = (format: PDFFormat) => {
    setPendingFormat(format);
    if (format === 'sensitive_data' || format === 'summons' || format === 'preliminary_injunction' || format === 'notice_creditors' || format === 'health_insurance' || format === 'parent_info_program' || format === 'petition' || format === 'original_order') {
      // These forms don't need a signature
      downloadPdf('', format);
    } else {
      // Show signature pad before downloading
      setShowSignaturePad(true);
    }
  };

  const handleSignatureClose = () => {
    setShowSignaturePad(false);
  };

  const handleSignatureSave = async (signatureDataUrl: string) => {
    // Save signature for future use
    localStorage.setItem(SIGNATURE_STORAGE_KEY, signatureDataUrl);
    setSavedSignature(signatureDataUrl);
    setShowSignaturePad(false);

    // Now proceed with PDF download
    await downloadPdf(signatureDataUrl, pendingFormat);
  };

  const downloadPdf = async (signatureDataUrl: string, format: PDFFormat) => {
    setIsLoading(format);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/court-forms/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId,
          signature: signatureDataUrl,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filenameMap: Record<PDFFormat, string> = {
        summary: `petition-summary-${caseName}.pdf`,
        pleading: `petition-pleading-${caseName}.pdf`,
        petition: `paternity-petition-${caseName}.pdf`,
        sensitive_data: `sensitive-data-coversheet-${caseName}.pdf`,
        summons: `summons-${caseName}.pdf`,
        preliminary_injunction: `preliminary-injunction-${caseName}.pdf`,
        notice_creditors: `notice-regarding-creditors-${caseName}.pdf`,
        health_insurance: `health-insurance-notice-${caseName}.pdf`,
        parent_info_program: `parent-info-program-${caseName}.pdf`,
        modification_petition: `petition-to-modify-${caseName}.pdf`,
        original_order: `original-court-order-${caseName}.pdf`,
      };
      link.download = filenameMap[format];
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to download");

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap gap-2 justify-end">
          {/* Petitions / Complaint Format Button */}
          <Button
            onClick={() => handleDownloadClick(isModification ? 'modification_petition' : isPaternity ? 'petition' : isNevada ? 'petition' : 'pleading')}
            disabled={isLoading !== null}
            variant="default"
            size="sm"
            className="gap-1.5"
            title={isModification ? "Petition to Modify Existing Court Orders" : isPaternity ? "Petition to Establish Paternity" : isNevada ? "Complaint for Divorce (Nevada)" : "Petition for Dissolution with line numbers"}
          >
            {(isLoading === 'pleading' || isLoading === 'petition' || isLoading === 'modification_petition') ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">{isModification ? 'Petition to Modify' : isNevada ? 'Complaint' : 'Petitions'}</span>
              </>
            )}
          </Button>

          {/* Preliminary Injunction Button - AZ only, only show if user selected injunction, not for modification */}
          {wantsInjunction && !isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('preliminary_injunction')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
              title="Preliminary Injunction per A.R.S. §25-315"
            >
              {isLoading === 'preliminary_injunction' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  <span className="hidden sm:inline">Injunction</span>
                </>
              )}
            </Button>
          )}

          {/* Original Court Order Button - Modification only */}
          {isModification && (
            <Button
              onClick={() => handleDownloadClick('original_order')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              title="Download the original uploaded court order"
            >
              {isLoading === 'original_order' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Original Order</span>
                </>
              )}
            </Button>
          )}

          {/* Sensitive Data Coversheet Button - AZ only, Not for Modification */}
          {!isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('sensitive_data')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
              title="Confidential sensitive data coversheet for the court"
            >
              {isLoading === 'sensitive_data' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  <span className="hidden sm:inline">Sensitive Data</span>
                </>
              )}
            </Button>
          )}

          {/* Summons Button - AZ only, Not for Modification */}
          {!isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('summons')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50"
              title="Official court summons to serve on the other party"
            >
              {isLoading === 'summons' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Summons</span>
                </>
              )}
            </Button>
          )}

          {/* Notice Regarding Creditors Button - AZ Divorce only */}
          {!isPaternity && !isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('notice_creditors')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              title="Notice Regarding Creditors per ARS § 25-318(H)"
            >
              {isLoading === 'notice_creditors' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Creditors</span>
                </>
              )}
            </Button>
          )}

          {/* Health Insurance Notice Button - AZ Divorce only */}
          {!isPaternity && !isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('health_insurance')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50"
              title="Notice of Rights About Health Insurance Coverage (A.R.S. §20-1377)"
            >
              {isLoading === 'health_insurance' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <HeartPulse className="h-4 w-4" />
                  <span className="hidden sm:inline">Health Insurance</span>
                </>
              )}
            </Button>
          )}

          {/* Parent Info Program Button - AZ only, Only for Divorce with Children or Paternity */}
          {hasChildren && !isModification && !isNevada && (
            <Button
              onClick={() => handleDownloadClick('parent_info_program')}
              disabled={isLoading !== null}
              variant="outline"
              size="sm"
              className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
              title="Order and Notice to Attend Parent Information Program Class"
            >
              {isLoading === 'parent_info_program' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Parent Program</span>
                </>
              )}
            </Button>
          )}

        </div>

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

        {savedSignature && status === "idle" && isLoading === null && (
          <p className="text-xs text-slate-500">Signature saved</p>
        )}
      </div>

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={handleSignatureClose}
        onSave={handleSignatureSave}
        existingSignature={savedSignature}
        petitionerName={petitionerName}
      />
    </>
  );
}
