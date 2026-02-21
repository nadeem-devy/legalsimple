import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, FolderOpen, Clock, ArrowRight, Plus, MapPin, Users, CheckCircle2, Star, Download, Shield } from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_AREAS } from "@/config/practice-areas";
import { CaseActions } from "@/components/cases/CaseActions";
import { ReviewedCaseBanner } from "@/components/cases/ReviewedCaseBanner";

interface CaseItem {
  id: string;
  case_number: string;
  status: string;
  case_type: string;
  sub_type?: string;
  created_at: string;
}

interface DocumentItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || '')
    .single();
  const profile = profileResult?.data;

  // Get user's cases
  const casesQuery = supabase
    .from("cases")
    .select("*")
    .eq("client_id", user?.id || '')
    .order("created_at", { ascending: false })
    .limit(5);
  const casesResult = await Promise.resolve(casesQuery);
  const cases = casesResult?.data || [];

  // Get user's documents
  const docsQuery = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  const docsResult = await Promise.resolve(docsQuery);
  const documents = docsResult?.data || [];

  // Stats
  const totalCases = cases?.length || 0;
  const activeCases = cases?.filter((c: CaseItem) => !["closed", "filed"].includes(c.status)).length || 0;
  const documentsCount = documents?.length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
            </h1>
            <p className="mt-1 text-emerald-100">
              Here&apos;s an overview of your legal matters.
            </p>
          </div>
          <Link href="/chat">
            <Button className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50 shadow-md">
              <Plus className="h-4 w-4" />
              Start New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Cases</CardDescription>
              <div className="rounded-full bg-emerald-100 p-2">
                <FolderOpen className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">{totalCases}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{activeCases} active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Documents</CardDescription>
              <div className="rounded-full bg-emerald-100 p-2">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">{documentsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Generated documents</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Your State</CardDescription>
              <div className="rounded-full bg-emerald-100 p-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">{profile?.state || "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>
                {profile?.state === "AZ" && "Arizona"}
                {profile?.state === "NV" && "Nevada"}
                {profile?.state === "TX" && "Texas"}
                {!profile?.state && "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviewed Cases Notification */}
      <ReviewedCaseBanner cases={cases} />

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/chat">
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg hover:border-l-emerald-600 transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="rounded-lg bg-emerald-50 p-3 w-fit mb-2 group-hover:bg-emerald-100 transition-colors">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Start New Case</CardTitle>
              <CardDescription>
                Chat with our AI to create a new legal document
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/cases">
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg hover:border-l-emerald-600 transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="rounded-lg bg-emerald-50 p-3 w-fit mb-2 group-hover:bg-emerald-100 transition-colors">
                <FolderOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">View All Cases</CardTitle>
              <CardDescription>
                See and manage all your legal cases
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/lawyers">
          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg hover:border-l-emerald-600 transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="rounded-lg bg-emerald-50 p-3 w-fit mb-2 group-hover:bg-emerald-100 transition-colors">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Find a Lawyer</CardTitle>
              <CardDescription>
                Browse verified lawyers for your legal needs
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Cases */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-lg">Recent Cases</CardTitle>
            <CardDescription>Your latest legal matters</CardDescription>
          </div>
          <Link href="/cases">
            <Button variant="outline" size="sm" className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {cases && cases.length > 0 ? (
            <div className="space-y-3">
              {cases.map((caseItem: CaseItem) => (
                <div
                  key={caseItem.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <Link
                    href={`/cases/${caseItem.id}`}
                    className="flex-1"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {caseItem.case_number}
                        </span>
                        <Badge
                          variant="secondary"
                          className={statusColors[caseItem.status]}
                        >
                          {statusLabels[caseItem.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name || caseItem.case_type}
                        {caseItem.sub_type && ` - ${caseItem.sub_type.replace(/_/g, " ")}`}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {format(new Date(caseItem.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <CaseActions caseId={caseItem.id} status={caseItem.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="rounded-full bg-slate-100 p-4 w-fit mx-auto mb-4">
                <FolderOpen className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No cases yet</p>
              <p className="text-sm text-slate-400 mb-4">Get started by creating your first case</p>
              <Link href="/chat">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Start Your First Case
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
