"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResidencyStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function ResidencyStep({ data, updateData }: ResidencyStepProps) {
  const updateResidency = (value: boolean) => {
    updateData({
      marriageInfo: {
        ...data.marriageInfo,
        meetsResidencyRequirement: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Important Requirement:</strong> Arizona law requires that at least
          one spouse must have been a resident of Arizona for at least{" "}
          <strong>90 days (about 3 months)</strong> before filing for divorce.
        </p>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-2 flex items-center justify-center gap-2">
          Do you or your spouse meet this residency requirement?
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  You meet the requirement if either you OR your spouse has lived in
                  Arizona for at least 90 consecutive days
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>

      <RadioGroup
        value={
          data.marriageInfo.meetsResidencyRequirement === null
            ? undefined
            : data.marriageInfo.meetsResidencyRequirement
            ? "yes"
            : "no"
        }
        onValueChange={(value) => updateResidency(value === "yes")}
        className="grid md:grid-cols-2 gap-4"
      >
        <Label
          htmlFor="residency-yes"
          className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
            data.marriageInfo.meetsResidencyRequirement === true
              ? "border-green-600 bg-green-50"
              : "border-slate-200 hover:border-green-300"
          }`}
        >
          <RadioGroupItem value="yes" id="residency-yes" className="sr-only" />
          <CheckCircle2
            className={`h-12 w-12 ${
              data.marriageInfo.meetsResidencyRequirement === true
                ? "text-green-600"
                : "text-slate-400"
            }`}
          />
          <div className="text-center">
            <p className="font-semibold text-slate-900">Yes, We Qualify</p>
            <p className="text-sm text-slate-500 mt-1">
              At least one of us has lived in Arizona for 90+ days
            </p>
          </div>
        </Label>

        <Label
          htmlFor="residency-no"
          className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
            data.marriageInfo.meetsResidencyRequirement === false
              ? "border-red-600 bg-red-50"
              : "border-slate-200 hover:border-red-300"
          }`}
        >
          <RadioGroupItem value="no" id="residency-no" className="sr-only" />
          <XCircle
            className={`h-12 w-12 ${
              data.marriageInfo.meetsResidencyRequirement === false
                ? "text-red-600"
                : "text-slate-400"
            }`}
          />
          <div className="text-center">
            <p className="font-semibold text-slate-900">No, Not Yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Neither of us has lived in Arizona for 90 days
            </p>
          </div>
        </Label>
      </RadioGroup>

      {data.marriageInfo.meetsResidencyRequirement === true && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Great! You meet the residency requirement.
              </p>
              <p className="text-sm text-green-700 mt-1">
                You can proceed with filing for divorce in Arizona.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.marriageInfo.meetsResidencyRequirement === false && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                You don&apos;t meet the requirement yet.
              </p>
              <p className="text-sm text-red-700 mt-1">
                You&apos;ll need to wait until you or your spouse has lived in Arizona
                for at least 90 days before filing. You can speak with our AI assistant
                or a lawyer for guidance on your options.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
