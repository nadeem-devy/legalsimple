"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Scale,
  Briefcase,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface CaseItem {
  id: string;
  case_number: string;
  case_type: string;
  sub_type?: string | null;
  status: string;
  urgency: string;
  state?: string;
  county?: string | null;
  plaintiff_name?: string | null;
  created_at: string;
  updated_at: string;
  client?: { full_name: string | null; email: string | null } | null;
  documents?: { id: string }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  intake: { label: "Intake", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-3 w-3" /> },
  lawyer_requested: { label: "Lawyer Requested", color: "bg-purple-100 text-purple-700", icon: <Clock className="h-3 w-3" /> },
  lawyer_assigned: { label: "Assigned", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  in_progress: { label: "In Progress", color: "bg-emerald-100 text-emerald-700", icon: <Loader2 className="h-3 w-3" /> },
  document_ready: { label: "Doc Ready", color: "bg-green-100 text-green-700", icon: <FileText className="h-3 w-3" /> },
  document_reviewed: { label: "Doc Reviewed", color: "bg-indigo-100 text-indigo-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  filed: { label: "Filed", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-600", icon: <XCircle className="h-3 w-3" /> },
  escalated: { label: "Escalated", color: "bg-red-100 text-red-700", icon: <AlertCircle className="h-3 w-3" /> },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-500" },
  high: { label: "High", color: "bg-red-500" },
  normal: { label: "Normal", color: "bg-amber-500" },
  low: { label: "Low", color: "bg-green-500" },
};

const practiceAreaColors: Record<string, string> = {
  family_law: "text-rose-600 bg-rose-50",
  personal_injury: "text-amber-600 bg-amber-50",
  estate_planning: "text-emerald-600 bg-emerald-50",
};

const ACTIVE_STATUSES = ["intake", "pending_review", "lawyer_requested", "lawyer_assigned", "in_progress", "document_ready", "document_reviewed", "escalated"];
const COMPLETED_STATUSES = ["filed", "closed"];

export function CasesClient({ cases: initialCases }: { cases: CaseItem[] }) {
  const [cases, setCases] = useState(initialCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [respondingCaseId, setRespondingCaseId] = useState<string | null>(null);

  const handleRespond = async (caseId: string, action: "accept" | "reject") => {
    setRespondingCaseId(caseId);
    try {
      const res = await fetch("/api/lawyers/request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, action }),
      });
      if (res.ok) {
        if (action === "accept") {
          setCases((prev) =>
            prev.map((c) =>
              c.id === caseId ? { ...c, status: "in_progress" } : c
            )
          );
        } else {
          setCases((prev) => prev.filter((c) => c.id !== caseId));
        }
      }
    } catch (error) {
      console.error("Error responding to case:", error);
    } finally {
      setRespondingCaseId(null);
    }
  };

  const filterCases = (status: string) => {
    let filtered = cases;
    if (status === "active") {
      filtered = cases.filter((c) => ACTIVE_STATUSES.includes(c.status));
    } else if (status === "completed") {
      filtered = cases.filter((c) => COMPLETED_STATUSES.includes(c.status));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.case_number.toLowerCase().includes(q) ||
          (c.client?.full_name || c.plaintiff_name || "").toLowerCase().includes(q) ||
          c.case_type.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const activeCases = cases.filter((c) => ACTIVE_STATUSES.includes(c.status));
  const completedCases = cases.filter((c) => COMPLETED_STATUSES.includes(c.status));
  const urgentCases = cases.filter((c) => c.urgency === "high" || c.urgency === "urgent");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-500" />
            My Cases
          </h1>
          <p className="text-slate-600 mt-1">Manage and track all your active and completed cases</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Scale className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{cases.length}</p>
                <p className="text-sm text-slate-500">Total Cases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Loader2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeCases.length}</p>
                <p className="text-sm text-slate-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{completedCases.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{urgentCases.length}</p>
                <p className="text-sm text-slate-500">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cases by number, client, or type..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Cases Tabs */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <CasesList cases={filterCases("all")} onRespond={handleRespond} respondingCaseId={respondingCaseId} />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <CasesList cases={filterCases("active")} onRespond={handleRespond} respondingCaseId={respondingCaseId} />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <CasesList cases={filterCases("completed")} onRespond={handleRespond} respondingCaseId={respondingCaseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CasesList({
  cases,
  onRespond,
  respondingCaseId,
}: {
  cases: CaseItem[];
  onRespond: (caseId: string, action: "accept" | "reject") => void;
  respondingCaseId: string | null;
}) {
  if (cases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No cases found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => {
        const status = statusConfig[caseItem.status] || statusConfig.in_progress;
        const urgency = urgencyConfig[caseItem.urgency] || urgencyConfig.normal;
        const areaColor = practiceAreaColors[caseItem.case_type] || "text-slate-600 bg-slate-50";
        const clientName = caseItem.client?.full_name || caseItem.plaintiff_name || "Unknown Client";
        const practiceArea = PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name || caseItem.case_type;
        const docCount = caseItem.documents?.length || 0;

        return (
          <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`w-1.5 h-8 rounded-full ${urgency.color}`} />
                    <span className="font-semibold text-slate-900">{caseItem.case_number}</span>
                    <Badge className={status.color} variant="secondary">
                      <span className="flex items-center gap-1">
                        {status.icon}
                        {status.label}
                      </span>
                    </Badge>
                    <Badge variant="outline" className={areaColor}>
                      {practiceArea}
                    </Badge>
                  </div>

                  {/* Client and Case Type */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <User className="h-4 w-4 text-slate-400" />
                      {clientName}
                    </span>
                    {caseItem.sub_type && (
                      <>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600">{caseItem.sub_type.replace(/_/g, " ")}</span>
                      </>
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Created: {new Date(caseItem.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {docCount} document{docCount !== 1 ? "s" : ""}
                    </span>
                    {caseItem.state && (
                      <span className="text-slate-500">
                        {caseItem.state}{caseItem.county ? `, ${caseItem.county}` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {caseItem.status === "lawyer_requested" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={respondingCaseId === caseItem.id}
                        onClick={() => onRespond(caseItem.id, "accept")}
                      >
                        {respondingCaseId === caseItem.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={respondingCaseId === caseItem.id}
                        onClick={() => onRespond(caseItem.id, "reject")}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Decline
                      </Button>
                    </>
                  )}
                  <Link href={`/lawyer/cases/${caseItem.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/lawyer/cases/${caseItem.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/lawyer/messages?case=${caseItem.id}`}>Message Client</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
