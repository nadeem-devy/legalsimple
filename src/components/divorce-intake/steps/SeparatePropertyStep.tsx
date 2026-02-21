"use client";

import { DivorceIntakeData, SeparatePropertyItem } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Plus, Trash2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeparatePropertyStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function SeparatePropertyStep({ data, updateData }: SeparatePropertyStepProps) {
  const addItem = () => {
    const newItem: SeparatePropertyItem = {
      id: `separate-${Date.now()}`,
      description: "",
      owner: "petitioner",
      estimatedValue: 0,
      howAcquired: "before_marriage",
    };
    updateData({
      separateProperty: {
        ...data.separateProperty,
        items: [...(data.separateProperty.items || []), newItem],
      },
    });
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    const updated = (data.separateProperty.items || []).map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateData({
      separateProperty: {
        ...data.separateProperty,
        items: updated,
      },
    });
  };

  const removeItem = (id: string) => {
    updateData({
      separateProperty: {
        ...data.separateProperty,
        items: (data.separateProperty.items || []).filter((item) => item.id !== id),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Lock className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 flex items-center gap-2">
              Separate Property
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-green-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Separate property is NOT divided in a divorce and remains with
                      the original owner.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <p className="text-sm text-green-700 mt-1">
              This includes property owned before marriage, inherited property, or
              gifts received by one spouse during the marriage.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Does either spouse have separate property to claim?
        </h3>
        <p className="text-sm text-slate-500">
          Items owned before marriage, inheritances, or personal gifts
        </p>
      </div>

      <RadioGroup
        value={
          data.separateProperty.hasSeparateProperty === null
            ? undefined
            : data.separateProperty.hasSeparateProperty
            ? "yes"
            : "no"
        }
        onValueChange={(value) => {
          const hasSeparate = value === "yes";
          updateData({
            separateProperty: {
              ...data.separateProperty,
              hasSeparateProperty: hasSeparate,
            },
          });
          if (hasSeparate && (!data.separateProperty.items || data.separateProperty.items.length === 0)) {
            addItem();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="separate-yes" />
          <Label htmlFor="separate-yes" className="cursor-pointer">
            Yes, we have separate property
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="separate-no" />
          <Label htmlFor="separate-no" className="cursor-pointer">
            No separate property
          </Label>
        </div>
      </RadioGroup>

      {data.separateProperty.hasSeparateProperty && (
        <div className="space-y-4 mt-6">
          {(data.separateProperty.items || []).map((item, index) => (
            <Card key={item.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">
                    Separate Property Item {index + 1}
                  </h4>
                  {(data.separateProperty.items || []).length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description of Property</Label>
                    <Input
                      placeholder="e.g., Grandma's antique jewelry collection"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Owner */}
                    <div className="space-y-2">
                      <Label>Who owns this property?</Label>
                      <Select
                        value={item.owner}
                        onValueChange={(value) =>
                          updateItem(item.id, "owner", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petitioner">I own this</SelectItem>
                          <SelectItem value="respondent">Spouse owns this</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* How Acquired */}
                    <div className="space-y-2">
                      <Label>How was it acquired?</Label>
                      <Select
                        value={item.howAcquired}
                        onValueChange={(value) =>
                          updateItem(item.id, "howAcquired", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="before_marriage">
                            Owned before marriage
                          </SelectItem>
                          <SelectItem value="inheritance">
                            Inheritance
                          </SelectItem>
                          <SelectItem value="gift">
                            Gift to one spouse only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="space-y-2">
                    <Label>Estimated Value (optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="5,000"
                        value={item.estimatedValue || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "estimatedValue",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addItem} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Separate Property Item
          </Button>
        </div>
      )}
    </div>
  );
}
