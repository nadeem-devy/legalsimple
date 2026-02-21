"use client";

import { DivorceIntakeData, Debt } from "@/types/divorce-intake";
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
import { CreditCard, Plus, Trash2 } from "lucide-react";

interface DebtsStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

const DEBT_TYPES = [
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "medical", label: "Medical Bills" },
  { value: "student_loan", label: "Student Loan" },
  { value: "other", label: "Other Debt" },
];

export function DebtsStep({ data, updateData }: DebtsStepProps) {
  const addDebt = () => {
    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      creditor: "",
      debtType: "credit_card",
      approximateBalance: 0,
      whoIsResponsible: "split",
      splitPercentagePetitioner: 50,
    };
    updateData({
      debts: [...data.debts, newDebt],
    });
  };

  const updateDebt = (id: string, field: string, value: string | number) => {
    const updated = data.debts.map((d) => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    });
    updateData({ debts: updated });
  };

  const removeDebt = (id: string) => {
    updateData({
      debts: data.debts.filter((d) => d.id !== id),
    });
  };

  const totalDebt = data.debts.reduce(
    (sum, d) => sum + (d.approximateBalance || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <CreditCard className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Marital Debts</p>
            <p className="text-sm text-red-700">
              Debts incurred during the marriage are typically community debts and
              must be divided, including credit cards, loans, and medical bills.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you have any marital debts to divide?
        </h3>
        <p className="text-sm text-slate-500">
          Don&apos;t include mortgages or car loans (those were covered earlier)
        </p>
      </div>

      <RadioGroup
        value={data.hasDebts === null ? undefined : data.hasDebts ? "yes" : "no"}
        onValueChange={(value) => {
          const hasDebts = value === "yes";
          updateData({ hasDebts: hasDebts });
          if (hasDebts && data.debts.length === 0) {
            addDebt();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="debts-yes" />
          <Label htmlFor="debts-yes" className="cursor-pointer">
            Yes, we have debts
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="debts-no" />
          <Label htmlFor="debts-no" className="cursor-pointer">
            No debts to divide
          </Label>
        </div>
      </RadioGroup>

      {data.hasDebts && (
        <div className="space-y-4 mt-6">
          {/* Total Summary */}
          {data.debts.length > 0 && (
            <div className="bg-red-100 rounded-lg p-4 text-center">
              <p className="text-sm text-red-700">Total Debt</p>
              <p className="text-2xl font-bold text-red-800">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
          )}

          {data.debts.map((debt, index) => (
            <Card key={debt.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">Debt {index + 1}</h4>
                  {data.debts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDebt(debt.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Debt Type */}
                    <div className="space-y-2">
                      <Label>Type of Debt</Label>
                      <Select
                        value={debt.debtType}
                        onValueChange={(value) =>
                          updateDebt(debt.id, "debtType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEBT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Creditor */}
                    <div className="space-y-2">
                      <Label>Creditor Name</Label>
                      <Input
                        placeholder="e.g., Chase, Discover, Hospital"
                        value={debt.creditor}
                        onChange={(e) =>
                          updateDebt(debt.id, "creditor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="space-y-2">
                    <Label>Approximate Balance Owed</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="5,000"
                        value={debt.approximateBalance || ""}
                        onChange={(e) =>
                          updateDebt(
                            debt.id,
                            "approximateBalance",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Responsibility */}
                  <div className="space-y-2">
                    <Label>Who should be responsible for this debt?</Label>
                    <Select
                      value={debt.whoIsResponsible}
                      onValueChange={(value) =>
                        updateDebt(debt.id, "whoIsResponsible", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petitioner">
                          I will pay this debt
                        </SelectItem>
                        <SelectItem value="respondent">
                          Spouse will pay this debt
                        </SelectItem>
                        <SelectItem value="split">
                          Split responsibility
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split percentages */}
                  {debt.whoIsResponsible === "split" && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Your responsibility</Label>
                        <Select
                          value={String(debt.splitPercentagePetitioner || 50)}
                          onValueChange={(value) =>
                            updateDebt(
                              debt.id,
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
                        <Label>Spouse&apos;s responsibility</Label>
                        <div className="p-2 rounded-md bg-slate-100 text-center">
                          {100 - (debt.splitPercentagePetitioner || 50)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addDebt} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Debt
          </Button>
        </div>
      )}
    </div>
  );
}
