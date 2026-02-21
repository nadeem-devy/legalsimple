"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  PiggyBank,
  Receipt,
  BarChart3,
  CreditCard,
} from "lucide-react";

interface TransactionData {
  id: string;
  description: string;
  client_name: string;
  amount: number;
  type: "earning" | "fee" | "withdrawal";
  status: string;
  date: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3.5 w-3.5" /> },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3.5 w-3.5" /> },
  refunded: { label: "Refunded", color: "bg-slate-100 text-slate-600", icon: <XCircle className="h-3.5 w-3.5" /> },
};

function buildMonthlyData(transactions: TransactionData[]) {
  const months: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "earning" && t.status === "completed")
    .forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + t.amount;
    });

  const sorted = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return sorted.map(([key, amount]) => ({
    month: monthNames[parseInt(key.split("-")[1]) - 1],
    amount,
  }));
}

export function EarningsClient({ transactions }: { transactions: TransactionData[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const totalEarnings = transactions
    .filter((t) => t.type === "earning" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingEarnings = transactions
    .filter((t) => t.type === "earning" && t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFees = transactions
    .filter((t) => t.type === "fee")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const availableBalance = totalEarnings - totalFees - totalWithdrawals;

  const monthlyEarnings = buildMonthlyData(transactions);
  const maxEarning = Math.max(...monthlyEarnings.map((m) => m.amount), 1);

  const completedCases = transactions.filter((t) => t.type === "earning" && t.status === "completed").length;
  const avgPerCase = completedCases > 0 ? Math.round(totalEarnings / completedCases) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-violet-500" />
            Earnings
          </h1>
          <p className="text-slate-600 mt-1">Track your income, fees, and withdrawals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-sm">Available Balance</p>
                <p className="text-3xl font-bold mt-1">${availableBalance.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${totalEarnings.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-violet-100">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${pendingEarnings.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">Platform Fees</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${totalFees.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100">
                <Receipt className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Earnings Overview</CardTitle>
            <CardDescription>
              {monthlyEarnings.length > 0
                ? `Your earnings over the last ${monthlyEarnings.length} months`
                : "No earnings data yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyEarnings.length > 0 ? (
              <div className="flex items-end justify-between gap-2 h-48">
                {monthlyEarnings.map((item, index) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs font-medium text-slate-600 mb-1">
                        ${(item.amount / 1000).toFixed(1)}k
                      </span>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          index === monthlyEarnings.length - 1
                            ? "bg-gradient-to-t from-violet-500 to-violet-400"
                            : "bg-slate-200 hover:bg-slate-300"
                        }`}
                        style={{ height: `${(item.amount / maxEarning) * 140}px` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">
                <p>Earnings data will appear here as you complete cases</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Avg. per Case</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900">${avgPerCase.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Cases Paid</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900">{completedCases}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <PiggyBank className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Lifetime Earnings</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900">${totalEarnings.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <CardDescription>All your earnings, fees, and withdrawals</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TransactionList transactions={transactions} />
            </TabsContent>
            <TabsContent value="earnings" className="mt-4">
              <TransactionList transactions={transactions.filter((t) => t.type === "earning")} />
            </TabsContent>
            <TabsContent value="fees" className="mt-4">
              <TransactionList transactions={transactions.filter((t) => t.type === "fee")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionList({ transactions }: { transactions: TransactionData[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const status = statusConfig[transaction.status] || statusConfig.completed;
        const isPositive = transaction.type === "earning";
        const isNegative = transaction.type === "fee" || transaction.type === "withdrawal";

        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${isPositive ? "bg-green-100" : "bg-red-100"}`}>
                {isPositive ? (
                  <ArrowDownRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{transaction.description}</p>
                <p className="text-sm text-slate-500">{transaction.client_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={status.color} variant="secondary">
                <span className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </span>
              </Badge>
              <div className="text-right">
                <p className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? "+" : "-"}${transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
