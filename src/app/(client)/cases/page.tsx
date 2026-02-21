import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Case } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Clock, ArrowRight, Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_AREAS } from "@/config/practice-areas";
import { CaseActions } from "@/components/cases/CaseActions";

const statusColors: Record<string, string> = {
  intake: "bg-yellow-100 text-yellow-800",
  pending_review: "bg-emerald-100 text-emerald-800",
  lawyer_requested: "bg-purple-100 text-purple-800",
  lawyer_assigned: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-cyan-100 text-cyan-800",
  document_ready: "bg-green-100 text-green-800",
  document_reviewed: "bg-indigo-100 text-indigo-800",
  filed: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-100 text-slate-800",
  escalated: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  intake: "In Progress",
  pending_review: "Pending Review",
  lawyer_requested: "Lawyer Requested",
  lawyer_assigned: "Lawyer Assigned",
  in_progress: "In Progress",
  document_ready: "Document Ready",
  document_reviewed: "Review Complete",
  filed: "Filed",
  closed: "Closed",
  escalated: "Escalated",
};

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all user's cases
  const { data: casesData } = user ? await supabase
    .from("cases")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false }) : { data: null };

  const cases = (casesData || []) as unknown as Case[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
          <p className="text-slate-600">View and manage all your legal cases</p>
        </div>
        <Link href="/chat">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search cases..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(PRACTICE_AREAS).map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {cases && cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <Link href={`/cases/${caseItem.id}`} className="flex-1 cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {caseItem.case_number}
                        </span>
                        <Badge
                          variant="secondary"
                          className={statusColors[caseItem.status]}
                        >
                          {statusLabels[caseItem.status]}
                        </Badge>
                        {caseItem.lawyer_recommended && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Lawyer Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>
                          {PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name || caseItem.case_type}
                        </span>
                        {caseItem.sub_type && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="capitalize">{caseItem.sub_type.replace(/_/g, " ")}</span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <span>{caseItem.state}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {format(new Date(caseItem.created_at), "MMM d, yyyy")}
                        </div>
                        {caseItem.defendant_name && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>vs. {caseItem.defendant_name}</span>
                          </>
                        )}
                      </div>
                      {caseItem.ai_summary && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {caseItem.ai_summary}
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 ml-4">
                    <CaseActions caseId={caseItem.id} status={caseItem.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No cases yet</h3>
              <p className="text-slate-600 mb-4">
                Start a conversation with our AI to create your first case
              </p>
              <Link href="/chat">
                <Button>Start Your First Case</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
