"use client";

import { useState } from "react";
import { DivorceIntakeData, RealEstateProperty } from "@/types/divorce-intake";
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
import { Home, Plus, Trash2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealEstateStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function RealEstateStep({ data, updateData }: RealEstateStepProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const addProperty = () => {
    const newProperty: RealEstateProperty = {
      id: `property-${Date.now()}`,
      address: "",
      estimatedValue: 0,
      mortgageBalance: 0,
      equity: 0,
      whoGetsProperty: "sell_split",
    };
    updateData({
      realEstateProperties: [...data.realEstateProperties, newProperty],
    });
    setShowAddForm(true);
  };

  const updateProperty = (id: string, field: string, value: string | number) => {
    const updated = data.realEstateProperties.map((p) => {
      if (p.id === id) {
        const updatedProperty = { ...p, [field]: value };
        // Calculate equity
        if (field === "estimatedValue" || field === "mortgageBalance") {
          updatedProperty.equity =
            (field === "estimatedValue" ? (value as number) : p.estimatedValue) -
            (field === "mortgageBalance" ? (value as number) : p.mortgageBalance);
        }
        return updatedProperty;
      }
      return p;
    });
    updateData({ realEstateProperties: updated });
  };

  const removeProperty = (id: string) => {
    updateData({
      realEstateProperties: data.realEstateProperties.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Home className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Community Property</p>
            <p className="text-sm text-emerald-700">
              Real estate acquired during your marriage is typically considered
              community property and must be divided.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you and your spouse own any real estate?
        </h3>
        <p className="text-sm text-slate-500">
          This includes homes, condos, land, rental properties, or vacation homes
        </p>
      </div>

      <RadioGroup
        value={
          data.hasRealEstate === null ? undefined : data.hasRealEstate ? "yes" : "no"
        }
        onValueChange={(value) => {
          const hasProperty = value === "yes";
          updateData({ hasRealEstate: hasProperty });
          if (hasProperty && data.realEstateProperties.length === 0) {
            addProperty();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="real-estate-yes" />
          <Label htmlFor="real-estate-yes" className="cursor-pointer">
            Yes, we own property
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="real-estate-no" />
          <Label htmlFor="real-estate-no" className="cursor-pointer">
            No real estate
          </Label>
        </div>
      </RadioGroup>

      {data.hasRealEstate && (
        <div className="space-y-4 mt-6">
          {data.realEstateProperties.map((property, index) => (
            <Card key={property.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">
                    Property {index + 1}
                  </h4>
                  {data.realEstateProperties.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProperty(property.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Property Address */}
                  <div className="space-y-2">
                    <Label>Property Address</Label>
                    <Input
                      placeholder="123 Main St, Phoenix, AZ 85001"
                      value={property.address}
                      onChange={(e) =>
                        updateProperty(property.id, "address", e.target.value)
                      }
                    />
                  </div>

                  {/* Value and Mortgage */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Estimated Value
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Approximate current market value of the property
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="350,000"
                          value={property.estimatedValue || ""}
                          onChange={(e) =>
                            updateProperty(
                              property.id,
                              "estimatedValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mortgage Balance</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="200,000"
                          value={property.mortgageBalance || ""}
                          onChange={(e) =>
                            updateProperty(
                              property.id,
                              "mortgageBalance",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Equity</Label>
                      <div
                        className={`p-2 rounded-md text-center font-medium ${
                          property.equity >= 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        ${property.equity.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Division Selection */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      How should this property be divided?
                    </Label>
                    <Select
                      value={property.whoGetsProperty}
                      onValueChange={(value) =>
                        updateProperty(
                          property.id,
                          "whoGetsProperty",
                          value as "petitioner" | "respondent" | "sell_split"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petitioner">
                          I keep this property
                        </SelectItem>
                        <SelectItem value="respondent">
                          Spouse keeps this property
                        </SelectItem>
                        <SelectItem value="sell_split">
                          Sell and split the proceeds
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split percentage if sell_split */}
                  {property.whoGetsProperty === "sell_split" && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Your share of proceeds</Label>
                        <Select
                          value={String(property.splitPercentagePetitioner || 50)}
                          onValueChange={(value) =>
                            updateProperty(
                              property.id,
                              "splitPercentagePetitioner",
                              parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="40">40%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="30">30%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Spouse&apos;s share of proceeds</Label>
                        <div className="p-2 rounded-md bg-slate-100 text-center">
                          {100 - (property.splitPercentagePetitioner || 50)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addProperty}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Property
          </Button>
        </div>
      )}
    </div>
  );
}
