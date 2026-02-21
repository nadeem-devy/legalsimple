"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Baby, Users } from "lucide-react";

interface ChildrenCheckStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function ChildrenCheckStep({ data, updateData }: ChildrenCheckStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you have any children from this marriage?
        </h3>
        <p className="text-sm text-slate-500">
          This includes minor children (under 18) and adult children who are still dependents
        </p>
      </div>

      <RadioGroup
        value={data.hasChildren === null ? undefined : data.hasChildren ? "yes" : "no"}
        onValueChange={(value) => updateData({ hasChildren: value === "yes" })}
        className="grid md:grid-cols-2 gap-4"
      >
        <Label
          htmlFor="no-children"
          className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
            data.hasChildren === false
              ? "border-emerald-600 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <RadioGroupItem value="no" id="no-children" className="sr-only" />
          <Users className={`h-12 w-12 ${data.hasChildren === false ? "text-emerald-600" : "text-slate-400"}`} />
          <div className="text-center">
            <p className="font-semibold text-slate-900">No Children</p>
            <p className="text-sm text-slate-500 mt-1">
              We have no minor or dependent children
            </p>
          </div>
        </Label>

        <Label
          htmlFor="has-children"
          className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
            data.hasChildren === true
              ? "border-emerald-600 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <RadioGroupItem value="yes" id="has-children" className="sr-only" />
          <Baby className={`h-12 w-12 ${data.hasChildren === true ? "text-emerald-600" : "text-slate-400"}`} />
          <div className="text-center">
            <p className="font-semibold text-slate-900">Yes, We Have Children</p>
            <p className="text-sm text-slate-500 mt-1">
              We have minor or dependent children
            </p>
          </div>
        </Label>
      </RadioGroup>

      {data.hasChildren === true && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Since you have children, you'll need to complete a different form
            that includes custody, child support, and parenting time arrangements. You'll be
            redirected when you click Next.
          </p>
        </div>
      )}
    </div>
  );
}
