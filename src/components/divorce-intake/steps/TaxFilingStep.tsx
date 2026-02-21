"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, HelpCircle, FileText, Users, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaxFilingStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function TaxFilingStep({ data, updateData }: TaxFilingStepProps) {
  const updateTaxFiling = (field: string, value: string) => {
    updateData({
      taxFiling: {
        ...data.taxFiling,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Receipt className="h-5 w-5 text-slate-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
              Tax Filing Preferences
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      This determines how you&apos;ll handle tax filing during the divorce
                      process. Your filing status for any year depends on your marital
                      status on December 31st of that year.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              How would you prefer to handle tax filing for the current tax year?
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          How do you want to handle taxes?
        </h3>
      </div>

      <RadioGroup
        value={data.taxFiling.filingPreference}
        onValueChange={(value) =>
          updateTaxFiling(
            "filingPreference",
            value as "file_separately" | "file_jointly_final_year" | "undecided"
          )
        }
        className="grid gap-4"
      >
        <Label
          htmlFor="file-separately"
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.taxFiling.filingPreference === "file_separately"
              ? "border-emerald-600 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <RadioGroupItem
            value="file_separately"
            id="file-separately"
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User
                className={`h-5 w-5 ${
                  data.taxFiling.filingPreference === "file_separately"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              <span className="font-semibold text-slate-900">
                File Separately (Married Filing Separately)
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-7">
              Each spouse files their own tax return. This is common during divorce
              proceedings. You&apos;re only responsible for your own return.
            </p>
          </div>
        </Label>

        <Label
          htmlFor="file-jointly"
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.taxFiling.filingPreference === "file_jointly_final_year"
              ? "border-green-600 bg-green-50"
              : "border-slate-200 hover:border-green-300"
          }`}
        >
          <RadioGroupItem
            value="file_jointly_final_year"
            id="file-jointly"
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Users
                className={`h-5 w-5 ${
                  data.taxFiling.filingPreference === "file_jointly_final_year"
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              />
              <span className="font-semibold text-slate-900">
                File Jointly (Married Filing Jointly)
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-7">
              Both spouses file one return together. May result in lower taxes but
              requires cooperation. Both spouses are responsible for the return.
            </p>
          </div>
        </Label>

        <Label
          htmlFor="undecided"
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.taxFiling.filingPreference === "undecided"
              ? "border-amber-600 bg-amber-50"
              : "border-slate-200 hover:border-amber-300"
          }`}
        >
          <RadioGroupItem value="undecided" id="undecided" className="mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <FileText
                className={`h-5 w-5 ${
                  data.taxFiling.filingPreference === "undecided"
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              />
              <span className="font-semibold text-slate-900">
                Undecided / Will Discuss Later
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 ml-7">
              You haven&apos;t decided yet. This can be negotiated as part of the
              divorce settlement.
            </p>
          </div>
        </Label>
      </RadioGroup>

      {/* If filing jointly, ask about deductions */}
      {data.taxFiling.filingPreference === "file_jointly_final_year" && (
        <div className="space-y-4 pt-4">
          <Label className="text-base">
            If you receive a refund, who should it go to?
          </Label>
          <Select
            value={data.taxFiling.whoClaimsDeductions || ""}
            onValueChange={(value) => updateTaxFiling("whoClaimsDeductions", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select who receives refund" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petitioner">I receive the full refund</SelectItem>
              <SelectItem value="respondent">Spouse receives the full refund</SelectItem>
              <SelectItem value="split">Split the refund 50/50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-amber-800">
          <strong>Tax Advice:</strong> Consider consulting with a tax professional
          about the best filing strategy for your situation. Filing status can
          significantly impact your tax liability.
        </p>
      </div>
    </div>
  );
}
