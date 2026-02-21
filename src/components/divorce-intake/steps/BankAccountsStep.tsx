"use client";

import { DivorceIntakeData, BankAccount } from "@/types/divorce-intake";
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
import { Landmark, Plus, Trash2, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BankAccountsStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
  { value: "money_market", label: "Money Market Account" },
  { value: "cd", label: "Certificate of Deposit (CD)" },
  { value: "other", label: "Other" },
];

export function BankAccountsStep({ data, updateData }: BankAccountsStepProps) {
  const addAccount = () => {
    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      institution: "",
      accountType: "checking",
      approximateBalance: 0,
      whoGetsAccount: "split",
      splitPercentagePetitioner: 50,
    };
    updateData({
      bankAccounts: [...data.bankAccounts, newAccount],
    });
  };

  const updateAccount = (id: string, field: string, value: string | number) => {
    const updated = data.bankAccounts.map((a) => {
      if (a.id === id) {
        return { ...a, [field]: value };
      }
      return a;
    });
    updateData({ bankAccounts: updated });
  };

  const removeAccount = (id: string) => {
    updateData({
      bankAccounts: data.bankAccounts.filter((a) => a.id !== id),
    });
  };

  const totalBalance = data.bankAccounts.reduce(
    (sum, a) => sum + (a.approximateBalance || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Landmark className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Bank Accounts</p>
            <p className="text-sm text-emerald-700">
              Include checking, savings, money market accounts, and CDs opened during
              the marriage. These are typically considered community property.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Do you have any bank accounts to divide?
        </h3>
        <p className="text-sm text-slate-500">
          Include joint accounts and individual accounts opened during the marriage
        </p>
      </div>

      <RadioGroup
        value={
          data.hasBankAccounts === null
            ? undefined
            : data.hasBankAccounts
            ? "yes"
            : "no"
        }
        onValueChange={(value) => {
          const hasAccounts = value === "yes";
          updateData({ hasBankAccounts: hasAccounts });
          if (hasAccounts && data.bankAccounts.length === 0) {
            addAccount();
          }
        }}
        className="flex justify-center gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="bank-yes" />
          <Label htmlFor="bank-yes" className="cursor-pointer">
            Yes, we have accounts
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="bank-no" />
          <Label htmlFor="bank-no" className="cursor-pointer">
            No bank accounts to divide
          </Label>
        </div>
      </RadioGroup>

      {data.hasBankAccounts && (
        <div className="space-y-4 mt-6">
          {/* Total Summary */}
          {data.bankAccounts.length > 0 && (
            <div className="bg-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600">Total Balance Across All Accounts</p>
              <p className="text-2xl font-bold text-slate-900">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
          )}

          {data.bankAccounts.map((account, index) => (
            <Card key={account.id} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-slate-900">Account {index + 1}</h4>
                  {data.bankAccounts.length > 1 && (
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
                    {/* Institution */}
                    <div className="space-y-2">
                      <Label>Bank/Credit Union Name</Label>
                      <Input
                        placeholder="e.g., Chase, Bank of America"
                        value={account.institution}
                        onChange={(e) =>
                          updateAccount(account.id, "institution", e.target.value)
                        }
                      />
                    </div>

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
                          {ACCOUNT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Approximate Balance
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Enter the current approximate balance
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
                        placeholder="10,000"
                        value={account.approximateBalance || ""}
                        onChange={(e) =>
                          updateAccount(
                            account.id,
                            "approximateBalance",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Division */}
                  <div className="space-y-2">
                    <Label>How should this account be divided?</Label>
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
                        <SelectItem value="petitioner">I keep this account</SelectItem>
                        <SelectItem value="respondent">
                          Spouse keeps this account
                        </SelectItem>
                        <SelectItem value="split">Split the balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Split percentages */}
                  {account.whoGetsAccount === "split" && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Your share</Label>
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
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="30">30%</SelectItem>
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
            Add Another Account
          </Button>
        </div>
      )}
    </div>
  );
}
