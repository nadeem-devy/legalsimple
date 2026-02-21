"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Demo analytics data
const ANALYTICS_DATA = {
  overview: {
    totalUsers: { value: 1247, change: 12.5, trend: "up" },
    activeCases: { value: 89, change: 8.3, trend: "up" },
    documentsGenerated: { value: 342, change: -2.1, trend: "down" },
    revenue: { value: 45230, change: 15.7, trend: "up" },
  },
  casesByStatus: [
    { status: "Intake", count: 23, color: "bg-yellow-500" },
    { status: "In Progress", count: 34, color: "bg-emerald-500" },
    { status: "Document Ready", count: 18, color: "bg-green-500" },
    { status: "Filed", count: 8, color: "bg-purple-500" },
    { status: "Closed", count: 6, color: "bg-slate-500" },
  ],
  casesByType: [
    { type: "Family Law", count: 45, percentage: 50 },
    { type: "Personal Injury", count: 27, percentage: 30 },
    { type: "Estate Planning", count: 17, percentage: 20 },
  ],
  casesByState: [
    { state: "Arizona", code: "AZ", count: 52, percentage: 58 },
    { state: "Nevada", code: "NV", count: 24, percentage: 27 },
    { state: "Texas", code: "TX", count: 13, percentage: 15 },
  ],
  recentActivity: [
    { id: 1, action: "New case created", user: "John Smith", time: "5 min ago", type: "case" },
    { id: 2, action: "Document generated", user: "Jane Doe", time: "12 min ago", type: "document" },
    { id: 3, action: "Lawyer assigned", user: "Mike Johnson", time: "25 min ago", type: "lawyer" },
    { id: 4, action: "Payment received", user: "Sarah Wilson", time: "1 hour ago", type: "payment" },
    { id: 5, action: "Case filed", user: "Tom Brown", time: "2 hours ago", type: "filed" },
  ],
  monthlyTrend: [
    { month: "Jul", cases: 45, revenue: 12500 },
    { month: "Aug", cases: 52, revenue: 15200 },
    { month: "Sep", cases: 48, revenue: 14100 },
    { month: "Oct", cases: 61, revenue: 18300 },
    { month: "Nov", cases: 72, revenue: 22400 },
    { month: "Dec", cases: 89, revenue: 28700 },
  ],
};

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    setMounted(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    change,
    trend,
    icon: Icon,
    prefix = ""
  }: {
    title: string;
    value: number;
    change: number;
    trend: string;
    icon: React.ElementType;
    prefix?: string;
  }) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">
              {prefix}{typeof value === "number" && value > 1000 ? value.toLocaleString() : value}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-slate-300">vs last period</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-700/50">
            <Icon className="h-6 w-6 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={ANALYTICS_DATA.overview.totalUsers.value}
          change={ANALYTICS_DATA.overview.totalUsers.change}
          trend={ANALYTICS_DATA.overview.totalUsers.trend}
          icon={Users}
        />
        <StatCard
          title="Active Cases"
          value={ANALYTICS_DATA.overview.activeCases.value}
          change={ANALYTICS_DATA.overview.activeCases.change}
          trend={ANALYTICS_DATA.overview.activeCases.trend}
          icon={Briefcase}
        />
        <StatCard
          title="Documents Generated"
          value={ANALYTICS_DATA.overview.documentsGenerated.value}
          change={ANALYTICS_DATA.overview.documentsGenerated.change}
          trend={ANALYTICS_DATA.overview.documentsGenerated.trend}
          icon={FileText}
        />
        <StatCard
          title="Revenue"
          value={ANALYTICS_DATA.overview.revenue.value}
          change={ANALYTICS_DATA.overview.revenue.change}
          trend={ANALYTICS_DATA.overview.revenue.trend}
          icon={DollarSign}
          prefix="$"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
            <CardDescription className="text-slate-400">
              Cases and revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ANALYTICS_DATA.monthlyTrend.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-10 text-sm text-slate-400">{item.month}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${(item.cases / 100) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-slate-300">{item.cases}</span>
                  </div>
                  <span className="w-20 text-sm text-green-500 text-right">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-400">Cases</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-slate-400">Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases by Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Cases by Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current distribution of case statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    const total = ANALYTICS_DATA.casesByStatus.reduce((sum, item) => sum + item.count, 0);
                    let offset = 0;
                    return ANALYTICS_DATA.casesByStatus.map((item, idx) => {
                      const percentage = (item.count / total) * 100;
                      const strokeDasharray = `${percentage} ${100 - percentage}`;
                      const strokeDashoffset = -offset;
                      offset += percentage;
                      const colors = ["#eab308", "#3b82f6", "#22c55e", "#a855f7", "#64748b"];
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={colors[idx]}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {ANALYTICS_DATA.casesByStatus.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                    <p className="text-xs text-slate-400">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {ANALYTICS_DATA.casesByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-slate-300">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases by Type */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Cases by Practice Area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ANALYTICS_DATA.casesByType.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{item.type}</span>
                  <span className="text-sm text-slate-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cases by State */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Cases by State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ANALYTICS_DATA.casesByState.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{item.code}</Badge>
                    <span className="text-sm text-slate-300">{item.state}</span>
                  </div>
                  <span className="text-sm text-slate-400">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ANALYTICS_DATA.recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded-full ${
                    item.type === "case" ? "bg-emerald-500/20 text-emerald-500" :
                    item.type === "document" ? "bg-green-500/20 text-green-500" :
                    item.type === "lawyer" ? "bg-purple-500/20 text-purple-500" :
                    item.type === "payment" ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-slate-500/20 text-slate-500"
                  }`}>
                    {item.type === "case" && <Briefcase className="h-3 w-3" />}
                    {item.type === "document" && <FileText className="h-3 w-3" />}
                    {item.type === "lawyer" && <Users className="h-3 w-3" />}
                    {item.type === "payment" && <DollarSign className="h-3 w-3" />}
                    {item.type === "filed" && <FileText className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{item.action}</p>
                    <p className="text-xs text-slate-300">{item.user}</p>
                  </div>
                  <span className="text-xs text-slate-300">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
