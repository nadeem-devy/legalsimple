"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, HelpCircle, DollarSign } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpousalMaintenanceStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

const MAINTENANCE_REASONS = [
  {
    value: "lack_earning_capacity",
    label: "Lack sufficient property to provide for needs",
    description: "Cannot meet reasonable financial needs independently",
  },
  {
    value: "supported_spouse_education",
    label: "Supported spouse's education/career",
    description: "Contributed to spouse's education or career advancement",
  },
  {
    value: "long_marriage",
    label: "Long marriage with age/employment challenges",
    description: "Age or condition limits ability to gain adequate employment",
  },
  {
    value: "age_health",
    label: "Age or health issues",
    description: "Age or health condition prevents adequate employment",
  },
  {
    value: "reduced_income",
    label: "Reduced income during marriage",
    description: "Gave up career opportunities for family",
  },
];

export function SpousalMaintenanceStep({ data, updateData }: SpousalMaintenanceStepProps) {
  const updateMaintenance = (field: string, value: string | number | boolean) => {
    updateData({
      spousalMaintenance: {
        ...data.spousalMaintenance,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Scale className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
              Spousal Maintenance (Alimony)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Spousal maintenance is financial support paid by one spouse to
                      the other after divorce. Arizona courts consider several factors
                      when deciding if maintenance is appropriate.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-sm text-purple-700 mt-1">
              In Arizona, you may qualify for spousal maintenance if you meet certain
              criteria. This is not automatic and must be requested.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Is either spouse requesting spousal maintenance?
        </h3>
      </div>

      <RadioGroup
        value={
          data.spousalMaintenance.isRequesting === null
            ? undefined
            : data.spousalMaintenance.isRequesting
            ? "yes"
            : "no"
        }
        onValueChange={(value) => updateMaintenance("isRequesting", value === "yes")}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="maintenance-yes" />
          <Label htmlFor="maintenance-yes" className="cursor-pointer">
            Yes, requesting maintenance
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="maintenance-no" />
          <Label htmlFor="maintenance-no" className="cursor-pointer">
            No spousal maintenance needed
          </Label>
        </div>
      </RadioGroup>

      {data.spousalMaintenance.isRequesting && (
        <div className="space-y-6 mt-6">
          {/* Who is requesting */}
          <div className="space-y-3">
            <Label className="text-base">Who is requesting spousal maintenance?</Label>
            <RadioGroup
              value={data.spousalMaintenance.requestingParty || ""}
              onValueChange={(value) => updateMaintenance("requestingParty", value)}
              className="grid md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="petitioner-requests"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.spousalMaintenance.requestingParty === "petitioner"
                    ? "border-purple-600 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <RadioGroupItem
                  value="petitioner"
                  id="petitioner-requests"
                  className="sr-only"
                />
                <DollarSign
                  className={`h-8 w-8 ${
                    data.spousalMaintenance.requestingParty === "petitioner"
                      ? "text-purple-600"
                      : "text-slate-400"
                  }`}
                />
                <span className="font-medium">I am requesting</span>
                <span className="text-sm text-slate-500">
                  I need financial support from my spouse
                </span>
              </Label>

              <Label
                htmlFor="respondent-requests"
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  data.spousalMaintenance.requestingParty === "respondent"
                    ? "border-purple-600 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <RadioGroupItem
                  value="respondent"
                  id="respondent-requests"
                  className="sr-only"
                />
                <DollarSign
                  className={`h-8 w-8 ${
                    data.spousalMaintenance.requestingParty === "respondent"
                      ? "text-purple-600"
                      : "text-slate-400"
                  }`}
                />
                <span className="font-medium">My spouse is requesting</span>
                <span className="text-sm text-slate-500">
                  They need financial support from me
                </span>
              </Label>
            </RadioGroup>
          </div>

          {/* Reason for request */}
          <div className="space-y-3">
            <Label className="text-base">Primary reason for the request:</Label>
            <Select
              value={data.spousalMaintenance.reason || ""}
              onValueChange={(value) => updateMaintenance("reason", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the main reason" />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <div>
                      <span className="font-medium">{reason.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount and Duration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Requested Monthly Amount (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  type="number"
                  className="pl-7"
                  placeholder="2,000"
                  value={data.spousalMaintenance.requestedAmount || ""}
                  onChange={(e) =>
                    updateMaintenance(
                      "requestedAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <p className="text-xs text-slate-500">
                Leave blank if unsure; the court will determine
              </p>
            </div>

            <div className="space-y-2">
              <Label>Requested Duration</Label>
              <Select
                value={data.spousalMaintenance.requestedDuration || ""}
                onValueChange={(value) =>
                  updateMaintenance("requestedDuration", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Specific number of months</SelectItem>
                  <SelectItem value="years">Specific number of years</SelectItem>
                  <SelectItem value="indefinite">
                    Indefinite (court decides)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration value if months or years selected */}
          {(data.spousalMaintenance.requestedDuration === "months" ||
            data.spousalMaintenance.requestedDuration === "years") && (
            <div className="space-y-2">
              <Label>
                Number of{" "}
                {data.spousalMaintenance.requestedDuration === "months"
                  ? "months"
                  : "years"}
              </Label>
              <Input
                type="number"
                placeholder={
                  data.spousalMaintenance.requestedDuration === "months" ? "24" : "3"
                }
                value={data.spousalMaintenance.durationValue || ""}
                onChange={(e) =>
                  updateMaintenance("durationValue", parseInt(e.target.value) || 0)
                }
              />
            </div>
          )}

          {/* Info box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> The court has final say on spousal maintenance.
              Factors considered include length of marriage, each spouse&apos;s earning
              capacity, age, health, and standard of living during the marriage.
            </p>
          </div>
        </div>
      )}

      {data.spousalMaintenance.isRequesting === false && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>No maintenance requested.</strong> Neither spouse will be seeking
            ongoing financial support from the other. You can still change this later
            if circumstances change.
          </p>
        </div>
      )}
    </div>
  );
}
