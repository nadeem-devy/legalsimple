"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sofa, Package, SplitSquareHorizontal, User, Users } from "lucide-react";

interface FurnitureStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function FurnitureStep({ data, updateData }: FurnitureStepProps) {
  const updateFurniture = (
    field: string,
    value: string
  ) => {
    updateData({
      furniture: {
        ...data.furniture,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Sofa className="h-5 w-5 text-slate-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">
              Furniture & Household Items
            </p>
            <p className="text-sm text-slate-600">
              This includes furniture, appliances, electronics, artwork, and other
              household belongings acquired during the marriage.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you have furniture and household items to divide?
        </h3>
      </div>

      <RadioGroup
        value={
          data.hasFurniture === null ? undefined : data.hasFurniture ? "yes" : "no"
        }
        onValueChange={(value) => updateData({ hasFurniture: value === "yes" })}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="furniture-yes" />
          <Label htmlFor="furniture-yes" className="cursor-pointer">
            Yes
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="furniture-no" />
          <Label htmlFor="furniture-no" className="cursor-pointer">
            No furniture to divide
          </Label>
        </div>
      </RadioGroup>

      {data.hasFurniture && (
        <div className="space-y-6 mt-6">
          <div className="text-center">
            <h4 className="font-medium text-slate-900 mb-4">
              How would you like to handle the furniture and household items?
            </h4>
          </div>

          <RadioGroup
            value={data.furniture.divisionMethod}
            onValueChange={(value) =>
              updateFurniture(
                "divisionMethod",
                value as
                  | "already_divided"
                  | "petitioner_keeps_all"
                  | "respondent_keeps_all"
                  | "will_divide_later"
              )
            }
            className="grid md:grid-cols-2 gap-4"
          >
            <Label
              htmlFor="already-divided"
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                data.furniture.divisionMethod === "already_divided"
                  ? "border-green-600 bg-green-50"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <RadioGroupItem
                value="already_divided"
                id="already-divided"
                className="sr-only"
              />
              <SplitSquareHorizontal
                className={`h-8 w-8 ${
                  data.furniture.divisionMethod === "already_divided"
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
              />
              <div className="text-center">
                <p className="font-semibold text-slate-900">Already Divided</p>
                <p className="text-sm text-slate-500">
                  We&apos;ve already split everything up
                </p>
              </div>
            </Label>

            <Label
              htmlFor="petitioner-keeps"
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                data.furniture.divisionMethod === "petitioner_keeps_all"
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              <RadioGroupItem
                value="petitioner_keeps_all"
                id="petitioner-keeps"
                className="sr-only"
              />
              <User
                className={`h-8 w-8 ${
                  data.furniture.divisionMethod === "petitioner_keeps_all"
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              />
              <div className="text-center">
                <p className="font-semibold text-slate-900">I Keep Everything</p>
                <p className="text-sm text-slate-500">
                  I&apos;ll keep all furniture and items
                </p>
              </div>
            </Label>

            <Label
              htmlFor="respondent-keeps"
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                data.furniture.divisionMethod === "respondent_keeps_all"
                  ? "border-amber-600 bg-amber-50"
                  : "border-slate-200 hover:border-amber-300"
              }`}
            >
              <RadioGroupItem
                value="respondent_keeps_all"
                id="respondent-keeps"
                className="sr-only"
              />
              <Users
                className={`h-8 w-8 ${
                  data.furniture.divisionMethod === "respondent_keeps_all"
                    ? "text-amber-600"
                    : "text-slate-400"
                }`}
              />
              <div className="text-center">
                <p className="font-semibold text-slate-900">Spouse Keeps Everything</p>
                <p className="text-sm text-slate-500">
                  My spouse will keep all items
                </p>
              </div>
            </Label>

            <Label
              htmlFor="divide-later"
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                data.furniture.divisionMethod === "will_divide_later"
                  ? "border-purple-600 bg-purple-50"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <RadioGroupItem
                value="will_divide_later"
                id="divide-later"
                className="sr-only"
              />
              <Package
                className={`h-8 w-8 ${
                  data.furniture.divisionMethod === "will_divide_later"
                    ? "text-purple-600"
                    : "text-slate-400"
                }`}
              />
              <div className="text-center">
                <p className="font-semibold text-slate-900">Divide Later</p>
                <p className="text-sm text-slate-500">
                  We&apos;ll figure it out later
                </p>
              </div>
            </Label>
          </RadioGroup>

          {/* Special Items */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="special-items">
              Any special or valuable items you want to specifically mention?
              <span className="text-slate-400 ml-1">(optional)</span>
            </Label>
            <Input
              id="special-items"
              placeholder="e.g., Antique piano, art collection, jewelry..."
              value={data.furniture.specialItems || ""}
              onChange={(e) => updateFurniture("specialItems", e.target.value)}
            />
            <p className="text-xs text-slate-500">
              List any items of significant value that need specific attention
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
