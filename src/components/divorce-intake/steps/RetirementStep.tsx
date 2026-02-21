"use client";

import { DivorceIntakeData, RetirementAccount } from "@/types/divorce-intake";
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
import { PiggyBank, Plus, Trash2, HelpCircle, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RetirementStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

const RETIREMENT_TYPES = [
  { value: "401k", label: "401(k)" },
  { value: "403b", label: "403(b)" },
  { value: "ira", label: "Traditional IRA" },
  { value: "roth_ira", label: "Roth IRA" },
  { value: "pension", label: "Pension" },
  { value: "other", label: "Other Retirement Account" },
];

export function RetirementStep({ data, updateData }: RetirementStepProps) {
  const addAccount = () => {
    const newAccount: RetirementAccount = {
      id: `retirement-${Date.now()}`,
      institution: "",
      accountType: "401k",
      owner: "petitioner",
      approximateValue: 0,
      whoGetsAccount: "split",
      splitPercentagePetitioner: 50,
    };
    updateData({
      retirementAccounts: [...data.retirementAccounts, newAccount],
    });
  };

  const updateAccount = (id: string, field: string, value: string | number) => {
    const updated = data.retirementAccounts.map((a) => {
      if (a.id === id) {
        return { ...a, [field]: value };
      }
      return a;
    });
    updateData({ retirementAccounts: updated });
  };

  const removeAccount = (id: string) => {
    updateData({
      retirementAccounts: data.retirementAccounts.filter((a) => a.id !== id),
    });
  };

  const totalValue = data.retirementAccounts.reduce(
    (sum, a) => sum + (a.approximateValue || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <PiggyBank className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800">Retirement Accounts</p>
            <p className="text-sm text-purple-700">
              Retirement accounts accumulated during the marriage are typically
              community property and subject to division.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do either of you have retirement accounts?
        </h3>
        <p className="text-sm text-slate-500">
          This includes 401(k), IRA, pension, or other retirement savings
        </p>
      </div>

      <RadioGroup
        value={
          data.hasRetirementAccounts === null
            ? undefined
            : data.hasRetirementAccounts
            ? "yes"
            : "no"
        }
        onValueChange={(value) => {
          const hasAccounts = value === "yes";
          updateData({ hasRetirementAccounts: hasAccounts });
          if (hasAccounts && data.retirementAccounts.length === 0) {
            addAccount();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="retirement-yes" />
          <Label htmlFor="retirement-yes" className="cursor-pointer">
            Yes, we have retirement accounts
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="retirement-no" />
          <Label htmlFor="retirement-no" className="cursor-pointer">
            No retirement accounts
          </Label>
        </div>
      </RadioGroup>

      {data.hasRetirementAccounts && (
        <div className="space-y-4 mt-6">
          {/* Important notice about QDRO */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Important Notice</p>
                <p className="text-sm text-amber-700">
                  Dividing retirement accounts may require a Qualified Domestic Relations
                  Order (QDRO). We can help you understand your options.
                </p>
              </div>
            </div>
          </div>

          {/* Total Summary */}
          {data.retirementAccounts.length > 0 && (
            <div className="bg-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Retirement Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          )}

          {data.retirementAccounts.map((account, index) => (
            <Card key={account.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">
                    Retirement Account {index + 1}
                  </h4>
                  {data.retirementAccounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Account Type */}
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select
                        value={account.accountType}
                        onValueChange={(value) =>
                          updateAccount(account.id, "accountType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RETIREMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Owner */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Whose Account?
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Who is the account holder/employee?
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Select
                        value={account.owner}
                        onValueChange={(value) =>
                          updateAccount(account.id, "owner", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petitioner">My Account</SelectItem>
                          <SelectItem value="respondent">
                            Spouse&apos;s Account
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Institution */}
                  <div className="space-y-2">
                    <Label>Financial Institution / Employer Plan</Label>
                    <Input
                      placeholder="e.g., Fidelity, Vanguard, Company 401(k)"
                      value={account.institution}
                      onChange={(e) =>
                        updateAccount(account.id, "institution", e.target.value)
                      }
                    />
                  </div>

                  {/* Value */}
                  <div className="space-y-2">
                    <Label>Approximate Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <Input
                        type="number"
                        className="pl-7"
                        placeholder="50,000"
                        value={account.approximateValue || ""}
                        onChange={(e) =>
                          updateAccount(
                            account.id,
                            "approximateValue",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Division */}
                  <div className="space-y-2">
                    <Label>How should this account be handled?</Label>
                    <Select
                      value={account.whoGetsAccount}
                      onValueChange={(value) =>
                        updateAccount(account.id, "whoGetsAccount", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner_keeps">
                          Owner keeps entire account
                        </SelectItem>
                        <SelectItem value="split">
                          Split the community portion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split percentages */}
                  {account.whoGetsAccount === "split" && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Your share of community portion</Label>
                        <Select
                          value={String(account.splitPercentagePetitioner || 50)}
                          onValueChange={(value) =>
                            updateAccount(
                              account.id,
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
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Spouse&apos;s share</Label>
                        <div className="p-2 rounded-md bg-slate-100 text-center">
                          {100 - (account.splitPercentagePetitioner || 50)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addAccount} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Retirement Account
          </Button>
        </div>
      )}
    </div>
  );
}
