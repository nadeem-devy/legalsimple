"use client";

import { DivorceIntakeData, US_STATES } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarriageInfoStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function MarriageInfoStep({ data, updateData }: MarriageInfoStepProps) {
  const updateMarriageInfo = (field: string, value: string) => {
    updateData({
      marriageInfo: {
        ...data.marriageInfo,
        [field]: value,
      },
    });
  };

  // Calculate marriage duration
  const calculateDuration = () => {
    if (data.marriageInfo.dateOfMarriage && data.marriageInfo.dateOfSeparation) {
      const marriage = new Date(data.marriageInfo.dateOfMarriage);
      const separation = new Date(data.marriageInfo.dateOfSeparation);
      const years = Math.floor(
        (separation.getTime() - marriage.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      const months = Math.floor(
        ((separation.getTime() - marriage.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) /
          (30.44 * 24 * 60 * 60 * 1000)
      );
      return `${years} years, ${months} months`;
    }
    return null;
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-700">
          <strong>Marriage Details</strong> - This information will be used in your
          divorce petition. Please be as accurate as possible with dates.
        </p>
      </div>

      {/* Date of Marriage */}
      <div className="space-y-2">
        <Label htmlFor="marriageDate" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          Date of Marriage
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">The date shown on your marriage certificate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          id="marriageDate"
          type="date"
          value={data.marriageInfo.dateOfMarriage}
          onChange={(e) => updateMarriageInfo("dateOfMarriage", e.target.value)}
        />
      </div>

      {/* Location of Marriage */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marriageCity">City Where Married</Label>
          <Input
            id="marriageCity"
            placeholder="e.g., Las Vegas"
            value={data.marriageInfo.cityOfMarriage}
            onChange={(e) => updateMarriageInfo("cityOfMarriage", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marriageState">State/Country Where Married</Label>
          <Select
            value={data.marriageInfo.stateOfMarriage}
            onValueChange={(value) => updateMarriageInfo("stateOfMarriage", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (Outside US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date of Separation */}
      <div className="space-y-2">
        <Label htmlFor="separationDate" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          Date of Separation
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  The date you and your spouse stopped living together as a married
                  couple, or when one of you decided the marriage was over
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          id="separationDate"
          type="date"
          value={data.marriageInfo.dateOfSeparation}
          onChange={(e) => updateMarriageInfo("dateOfSeparation", e.target.value)}
        />
      </div>

      {/* Marriage Duration Display */}
      {duration && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-800">
            <strong>Length of Marriage:</strong> {duration}
          </p>
          {parseInt(duration.split(" ")[0]) >= 10 && (
            <p className="text-xs text-emerald-600 mt-1">
              Note: Marriages of 10+ years may have implications for spousal maintenance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
