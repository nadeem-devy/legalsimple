import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Star, Clock, ArrowRight, AlertTriangle, Users } from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface CaseItem {
  id: string;
  case_number: string;
  status: string;
  case_type: string;
  state?: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default async function LawyerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  const { data: activeCases } = await supabase
    .from("cases")
    .select("*")
    .eq("lawyer_id", user?.id)
    .not("status", "in", '("closed","filed")')
    .order("created_at", { ascending: false })
    .limit(5);

  const totalActiveCases = activeCases?.length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Counselor"}!
          </h1>
          <p className="text-slate-600">Here&apos;s your practice overview.</p>
        </div>
        <Link href="/lawyer/cases">
          <Button className="gap-2">
            <FolderOpen className="h-4 w-4" />
            View Cases
          </Button>
        </Link>
      </div>

      {!lawyerProfile?.verified && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Account Pending Verification</p>
                <p className="text-sm text-amber-700">
                  Your lawyer account is being verified. You&apos;ll be able to accept cases once approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Cases</CardDescription>
            <CardTitle className="text-3xl">{totalActiveCases}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FolderOpen className="h-4 w-4" />
              <span>Currently assigned</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rating</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              {lawyerProfile?.rating?.toFixed(1) || "—"}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              <span>{lawyerProfile?.total_cases || 0} total cases</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Active Cases</CardTitle>
            <CardDescription>Cases you&apos;re currently working on</CardDescription>
          </div>
          <Link href="/lawyer/cases">
            <Button variant="ghost" size="sm" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {activeCases && activeCases.length > 0 ? (
            <div className="space-y-3">
              {activeCases.map((caseItem: CaseItem) => (
                <div key={caseItem.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50">
                  <div className="space-y-1">
                    <span className="font-medium text-slate-900">{caseItem.case_number}</span>
                    <p className="text-sm text-slate-600">
                      {PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      {format(new Date(caseItem.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No active cases</p>
              <p className="text-sm text-slate-400 mt-2">Cases will appear here once assigned to you.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
