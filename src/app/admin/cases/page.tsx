"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  MoreHorizontal,
  User,
  Scale,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Case {
  id: string;
  case_number: string;
  client_name: string;
  client_email: string;
  lawyer_name?: string | null;
  status: string;
  case_type: string;
  state: string;
  county: string;
  plaintiff_name?: string | null;
  defendant_name?: string | null;
  complexity_score: number;
  ai_summary?: string | null;
  urgency?: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  intake: {
    label: "Intake",
    color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
  pending_review: {
    label: "Pending Review",
    color: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    icon: <AlertCircle className="h-3 w-3" />,
  },
  lawyer_requested: {
    label: "Lawyer Requested",
    color: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    icon: <Scale className="h-3 w-3" />,
  },
  lawyer_assigned: {
    label: "Lawyer Assigned",
    color: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    icon: <User className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    icon: <Loader2 className="h-3 w-3" />,
  },
  document_ready: {
    label: "Document Ready",
    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    icon: <FileText className="h-3 w-3" />,
  },
  filed: {
    label: "Filed",
    color: "bg-green-500/15 text-green-400 border border-green-500/30",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  closed: {
    label: "Closed",
    color: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
    icon: <XCircle className="h-3 w-3" />,
  },
  escalated: {
    label: "Escalated",
    color: "bg-red-500/15 text-red-400 border border-red-500/30",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const caseTypeLabels: Record<string, string> = {
  family_law: "Family Law",
  personal_injury: "Personal Injury",
  estate_planning: "Estate Planning",
  business_formation: "Business Formation",
};

export default function AdminCasesPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cases");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch cases");
      }
      const data = await res.json();
      setCases(data.cases);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load cases";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadCases();
  }, [loadCases]);

  // Derive unique states and case types from real data
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    cases.forEach((c) => {
      if (c.state) states.add(c.state);
    });
    return Array.from(states).sort();
  }, [cases]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    cases.forEach((c) => {
      if (c.case_type) types.add(c.case_type);
    });
    return Array.from(types).sort();
  }, [cases]);

  const handleViewCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/cases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          action: "change_status",
          value: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setCases((prev) =>
        prev.map((c) =>
          c.id === caseId
            ? { ...c, status: newStatus, updated_at: new Date().toISOString() }
            : c
        )
      );
      toast.success(
        `Case status updated to ${statusConfig[newStatus]?.label || newStatus}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.case_type === typeFilter;
    const matchesState = stateFilter === "all" || c.state === stateFilter;
    return matchesSearch && matchesStatus && matchesType && matchesState;
  });

  const stats = {
    total: cases.length,
    intake: cases.filter((c) => c.status === "intake").length,
    inProgress: cases.filter((c) =>
      ["in_progress", "lawyer_assigned", "pending_review", "lawyer_requested"].includes(
        c.status
      )
    ).length,
    completed: cases.filter((c) => ["filed", "closed", "document_ready"].includes(c.status))
      .length,
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cases</h1>
          <p className="text-slate-400">Manage all client cases</p>
        </div>
        <Button variant="outline" onClick={loadCases} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Cases
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  New Intake
                </p>
                <p className="text-3xl font-bold text-amber-400 mt-1">
                  {stats.intake}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by case number, client name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[170px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {caseTypeLabels[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Cases</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredCases.length} case
            {filteredCases.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading cases...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Failed to Load Cases
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button variant="outline" onClick={loadCases}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Cases Found
              </h3>
              <p className="text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 bg-slate-900/50 hover:bg-slate-900/50">
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Case #
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Client
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Type
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Location
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Complexity
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Created
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id}
                      className="border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Case # */}
                      <TableCell className="py-4">
                        <code className="text-sm bg-slate-700/50 text-slate-200 px-2 py-0.5 rounded font-mono">
                          {caseItem.case_number}
                        </code>
                      </TableCell>

                      {/* Client */}
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">
                            {caseItem.client_name}
                          </p>
                          <p className="text-sm text-slate-400 truncate">
                            {caseItem.client_email}
                          </p>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          {caseTypeLabels[caseItem.case_type] ||
                            caseItem.case_type}
                        </Badge>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="text-sm">
                            {caseItem.county
                              ? `${caseItem.county}, ${caseItem.state}`
                              : caseItem.state}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={
                            statusConfig[caseItem.status]?.color ||
                            "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                          }
                        >
                          {statusConfig[caseItem.status]?.icon}
                          <span className="ml-1">
                            {statusConfig[caseItem.status]?.label ||
                              caseItem.status}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* Complexity */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                caseItem.complexity_score <= 3
                                  ? "bg-emerald-500"
                                  : caseItem.complexity_score <= 6
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${(caseItem.complexity_score / 10) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 font-medium">
                            {caseItem.complexity_score}/10
                          </span>
                        </div>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-slate-300 text-sm">
                        {format(new Date(caseItem.created_at), "MMM d, yyyy")}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewCase(caseItem)}
                              className="text-slate-300 focus:text-white focus:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            {caseItem.status !== "in_progress" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    caseItem.id,
                                    "in_progress"
                                  )
                                }
                                disabled={isActionLoading}
                                className="text-slate-300 focus:text-white focus:bg-slate-700"
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Mark In Progress
                              </DropdownMenuItem>
                            )}
                            {caseItem.status !== "document_ready" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(
                                    caseItem.id,
                                    "document_ready"
                                  )
                                }
                                disabled={isActionLoading}
                                className="text-slate-300 focus:text-white focus:bg-slate-700"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Mark Document Ready
                              </DropdownMenuItem>
                            )}
                            {caseItem.status !== "closed" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(caseItem.id, "closed")
                                }
                                disabled={isActionLoading}
                                className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Close Case
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Case Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedCase?.case_number}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              {/* Status + Urgency row */}
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    statusConfig[selectedCase.status]?.color ||
                    "bg-slate-500/15 text-slate-400"
                  }
                >
                  {statusConfig[selectedCase.status]?.icon}
                  <span className="ml-1">
                    {statusConfig[selectedCase.status]?.label ||
                      selectedCase.status}
                  </span>
                </Badge>
                {selectedCase.urgency && selectedCase.urgency !== "normal" && (
                  <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {selectedCase.urgency}
                  </Badge>
                )}
                {selectedCase.lawyer_name && (
                  <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Scale className="h-3 w-3 mr-1" />
                    {selectedCase.lawyer_name}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <User className="h-3 w-3" /> Client
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedCase.client_name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedCase.client_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Case Type</p>
                  <p className="font-medium text-white text-sm">
                    {caseTypeLabels[selectedCase.case_type] ||
                      selectedCase.case_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3 w-3" /> Location
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedCase.county
                      ? `${selectedCase.county}, ${selectedCase.state}`
                      : selectedCase.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Assigned Lawyer
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedCase.lawyer_name || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">
                    Complexity Score
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedCase.complexity_score <= 3
                            ? "bg-emerald-500"
                            : selectedCase.complexity_score <= 6
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${(selectedCase.complexity_score / 10) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-white font-medium text-sm">
                      {selectedCase.complexity_score}/10
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3" /> Created
                  </p>
                  <p className="font-medium text-white text-sm">
                    {format(
                      new Date(selectedCase.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                {selectedCase.plaintiff_name && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Plaintiff</p>
                    <p className="font-medium text-white text-sm">
                      {selectedCase.plaintiff_name}
                    </p>
                  </div>
                )}
                {selectedCase.defendant_name && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Defendant</p>
                    <p className="font-medium text-white text-sm">
                      {selectedCase.defendant_name}
                    </p>
                  </div>
                )}
                {selectedCase.ai_summary && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 mb-1">AI Summary</p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedCase.ai_summary}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
