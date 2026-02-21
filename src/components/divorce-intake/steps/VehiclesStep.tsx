"use client";

import { DivorceIntakeData, Vehicle } from "@/types/divorce-intake";
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
import { Car, Plus, Trash2 } from "lucide-react";

interface VehiclesStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

// Generate years for dropdown (last 30 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

// Common car makes
const CAR_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "GMC", "Honda", "Hyundai", "Infiniti", "Jeep", "Kia",
  "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan", "Ram", "Subaru",
  "Tesla", "Toyota", "Volkswagen", "Volvo", "Other"
];

export function VehiclesStep({ data, updateData }: VehiclesStepProps) {
  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      year: "",
      make: "",
      model: "",
      estimatedValue: 0,
      loanBalance: 0,
      equity: 0,
      whoGetsVehicle: "petitioner",
    };
    updateData({
      vehicles: [...data.vehicles, newVehicle],
    });
  };

  const updateVehicle = (id: string, field: string, value: string | number) => {
    const updated = data.vehicles.map((v) => {
      if (v.id === id) {
        const updatedVehicle = { ...v, [field]: value };
        // Calculate equity
        if (field === "estimatedValue" || field === "loanBalance") {
          updatedVehicle.equity =
            (field === "estimatedValue" ? (value as number) : v.estimatedValue) -
            (field === "loanBalance" ? (value as number) : v.loanBalance);
        }
        return updatedVehicle;
      }
      return v;
    });
    updateData({ vehicles: updated });
  };

  const removeVehicle = (id: string) => {
    updateData({
      vehicles: data.vehicles.filter((v) => v.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Car className="h-5 w-5 text-slate-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">Vehicles</p>
            <p className="text-sm text-slate-600">
              Include cars, trucks, motorcycles, boats, RVs, or other vehicles
              purchased during the marriage.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you have any vehicles to divide?
        </h3>
      </div>

      <RadioGroup
        value={
          data.hasVehicles === null ? undefined : data.hasVehicles ? "yes" : "no"
        }
        onValueChange={(value) => {
          const hasVehicles = value === "yes";
          updateData({ hasVehicles: hasVehicles });
          if (hasVehicles && data.vehicles.length === 0) {
            addVehicle();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="vehicles-yes" />
          <Label htmlFor="vehicles-yes" className="cursor-pointer">
            Yes, we have vehicles
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="vehicles-no" />
          <Label htmlFor="vehicles-no" className="cursor-pointer">
            No vehicles to divide
          </Label>
        </div>
      </RadioGroup>

      {data.hasVehicles && (
        <div className="space-y-4 mt-6">
          {data.vehicles.map((vehicle, index) => (
            <Card key={vehicle.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">Vehicle {index + 1}</h4>
                  {data.vehicles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVehicle(vehicle.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Year, Make, Model */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select
                        value={vehicle.year}
                        onValueChange={(value) =>
                          updateVehicle(vehicle.id, "year", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Make</Label>
                      <Select
                        value={vehicle.make}
                        onValueChange={(value) =>
                          updateVehicle(vehicle.id, "make", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Make" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAR_MAKES.map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        placeholder="e.g., Camry"
                        value={vehicle.model}
                        onChange={(e) =>
                          updateVehicle(vehicle.id, "model", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Value and Loan */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Value</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="25,000"
                          value={vehicle.estimatedValue || ""}
                          onChange={(e) =>
                            updateVehicle(
                              vehicle.id,
                              "estimatedValue",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Loan Balance</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7"
                          placeholder="10,000"
                          value={vehicle.loanBalance || ""}
                          onChange={(e) =>
                            updateVehicle(
                              vehicle.id,
                              "loanBalance",
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
                          vehicle.equity >= 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        ${vehicle.equity.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Who Gets It */}
                  <div className="space-y-2">
                    <Label>Who will keep this vehicle?</Label>
                    <Select
                      value={vehicle.whoGetsVehicle}
                      onValueChange={(value) =>
                        updateVehicle(vehicle.id, "whoGetsVehicle", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petitioner">I keep this vehicle</SelectItem>
                        <SelectItem value="respondent">
                          Spouse keeps this vehicle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addVehicle} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Vehicle
          </Button>
        </div>
      )}
    </div>
  );
}
