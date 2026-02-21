import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, FolderOpen, TrendingUp, ArrowRight, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface LawyerProfile {
  id: string;
  bar_number: string;
  bar_state: string;
  profiles?: {
    full_name: string;
  };
}

interface CaseItem {
  id: string;
  case_number: string;
  status: string;
  case_type: string;
  state: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  intake: "bg-yellow-100 text-yellow-800",
  pending_review: "bg-emerald-100 text-emerald-800",
  lawyer_requested: "bg-purple-100 text-purple-800",
  document_ready: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-800",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client");

  const { count: totalLawyers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "lawyer");

  const { count: pendingVerifications } = await supabase
    .from("lawyer_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verified", false);

  const { count: totalCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true });

  const { count: totalDocuments } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true });

  const { data: recentCases } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingLawyers } = await supabase
    .from("lawyer_profiles")
    .select("*, profiles!lawyer_profiles_user_id_fkey(full_name, email)")
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Users</CardDescription>
            <CardTitle className="text-3xl text-white">{totalUsers || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="h-4 w-4" />
              <span>Registered clients</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Lawyers</CardDescription>
            <CardTitle className="text-3xl text-white">{totalLawyers || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerifications && pendingVerifications > 0 ? (
              <Badge variant="secondary" className="bg-amber-900/50 text-amber-300">
                {pendingVerifications} pending
              </Badge>
            ) : (
              <span className="text-slate-400 text-sm">All verified</span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Cases</CardDescription>
            <CardTitle className="text-3xl text-white">{totalCases || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FolderOpen className="h-4 w-4" />
              <span>All cases</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Documents</CardDescription>
            <CardTitle className="text-3xl text-white">{totalDocuments || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FileText className="h-4 w-4" />
              <span>Generated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Pending Verifications</CardTitle>
              <CardDescription className="text-slate-400">Lawyers awaiting approval</CardDescription>
            </div>
            <Link href="/admin/lawyers">
              <Button variant="outline" size="sm" className="gap-1 border-slate-600 text-slate-300">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLawyers && pendingLawyers.length > 0 ? (
              <div className="space-y-3">
                {pendingLawyers.map((lawyer: LawyerProfile) => (
                  <div key={lawyer.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div className="space-y-1">
                      <p className="font-medium text-white">{lawyer.profiles?.full_name}</p>
                      <p className="text-xs text-slate-400">Bar #{lawyer.bar_number} ({lawyer.bar_state})</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">Verify</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-slate-400">All lawyers verified</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Recent Cases</CardTitle>
              <CardDescription className="text-slate-400">Latest case activity</CardDescription>
            </div>
            <Link href="/admin/cases">
              <Button variant="outline" size="sm" className="gap-1 border-slate-600 text-slate-300">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCases && recentCases.length > 0 ? (
              <div className="space-y-3">
                {recentCases.map((caseItem: CaseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{caseItem.case_number}</span>
                        <Badge variant="secondary" className={statusColors[caseItem.status] || "bg-slate-600"}>
                          {caseItem.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        {PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name} • {caseItem.state}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No cases yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <Users className="h-6 w-6" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/lawyers">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <Briefcase className="h-6 w-6" />
                Manage Lawyers
              </Button>
            </Link>
            <Link href="/admin/cases">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <FolderOpen className="h-6 w-6" />
                View Cases
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                <TrendingUp className="h-6 w-6" />
                Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
