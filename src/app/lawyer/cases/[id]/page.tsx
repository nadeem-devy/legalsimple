import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  FileText,
  Scale,
  Clock,
  AlertTriangle,
  Mail,
  FolderOpen,
} from "lucide-react";
import { PRACTICE_AREAS } from "@/config/practice-areas";
import { format } from "date-fns";
import { Lock, Download } from "lucide-react";
import { LawyerDownloadButtons } from "@/components/court-forms/LawyerDownloadButtons";

// Pleading document types — the initial court filings a lawyer can review before accepting
const PLEADING_TYPES = new Set([
  "petition_for_divorce",
  "custody_petition",
  "child_support_petition",
  "adoption_petition",
  "protective_order_petition",
  "paternity_petition",
  "complaint",
  "demand_letter",
  "workers_comp_claim",
]);

const statusConfig: Record<string, { label: string; color: string }> = {
  intake: { label: "Intake", color: "bg-yellow-100 text-yellow-700" },
  pending_review: { label: "Pending Review", color: "bg-amber-100 text-amber-700" },
  lawyer_requested: { label: "Lawyer Requested", color: "bg-purple-100 text-purple-700" },
  lawyer_assigned: { label: "Assigned", color: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "In Progress", color: "bg-emerald-100 text-emerald-700" },
  document_ready: { label: "Document Ready", color: "bg-green-100 text-green-700" },
  document_reviewed: { label: "Doc Reviewed", color: "bg-indigo-100 text-indigo-700" },
  filed: { label: "Filed", color: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", color: "bg-slate-100 text-slate-600" },
  escalated: { label: "Escalated", color: "bg-red-100 text-red-700" },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-slate-100 text-slate-600" },
};

// Demo data for mock mode
const DEMO_CASE = {
  id: "1",
  case_number: "LS-20240115-0001",
  case_type: "family_law",
  sub_type: "divorce",
  status: "in_progress",
  urgency: "high",
  state: "AZ",
  county: "Maricopa",
  city: "Phoenix",
  plaintiff_name: "Sarah Johnson",
  defendant_name: "John Johnson",
  incident_date: "2024-01-01",
  incident_description: "Filing for divorce after 5 years of marriage. Both parties have agreed to an uncontested divorce with fair division of assets.",
  desired_outcome: "Fair division of assets and clean dissolution of marriage",
  complexity_score: 5,
  ai_summary: "Uncontested divorce case. Both parties are cooperative. Straightforward asset division expected.",
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-28T00:00:00Z",
  documents: [
    { id: "d1", title: "Petition for Dissolution", document_type: "petition_for_divorce", status: "draft", created_at: "2024-01-20T00:00:00Z" },
    { id: "d2", title: "Financial Disclosure", document_type: "financial_disclosure", status: "draft", created_at: "2024-01-22T00:00:00Z" },
  ],
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (isMockMode()) {
    const caseData = { ...DEMO_CASE, id };
    return <CaseDetailView caseData={caseData} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("lawyer_id", user?.id)
    .single();

  if (!caseData) {
    notFound();
  }

  // Fetch documents for this case
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, document_type, status, created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const fullCase = { ...caseData, documents: documents || [] };

  return <CaseDetailView caseData={fullCase} />;
}

function CaseDetailView({ caseData }: { caseData: typeof DEMO_CASE }) {
  const status = statusConfig[caseData.status] || statusConfig.in_progress;
  const urgency = urgencyConfig[caseData.urgency] || urgencyConfig.normal;
  const practiceArea = PRACTICE_AREAS[caseData.case_type as keyof typeof PRACTICE_AREAS]?.name || caseData.case_type;

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Link href="/lawyer/cases">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{caseData.case_number}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={status.color} variant="secondary">{status.label}</Badge>
            <Badge className={urgency.color} variant="secondary">{urgency.label} Priority</Badge>
            <Badge variant="outline">{practiceArea}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/lawyer/messages?case=${caseData.id}`}>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Message Client
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Summary */}
      {caseData.ai_summary && (
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-violet-600 mt-0.5" />
              <div>
                <p className="font-medium text-violet-800">AI Case Summary</p>
                <p className="text-sm text-violet-700 mt-1">{caseData.ai_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
        {/* Case Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Case Type</p>
                <p className="font-medium text-slate-900">{practiceArea}</p>
              </div>
              {caseData.sub_type && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Sub Type</p>
                  <p className="font-medium text-slate-900">
                    {caseData.sub_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </p>
                <p className="font-medium text-slate-900">
                  {[caseData.city, caseData.county, caseData.state].filter(Boolean).join(", ")}
                </p>
              </div>
              {caseData.complexity_score && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Complexity Score</p>
                  <p className="font-medium text-slate-900">{caseData.complexity_score}/10</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Created
                </p>
                <p className="font-medium text-slate-900">{format(new Date(caseData.created_at), "MMM d, yyyy")}</p>
              </div>
              {caseData.incident_date && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Incident Date</p>
                  <p className="font-medium text-slate-900">{format(new Date(caseData.incident_date), "MMM d, yyyy")}</p>
                </div>
              )}
            </div>

            {caseData.plaintiff_name && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-slate-500">Plaintiff / Petitioner</p>
                <p className="font-medium text-slate-900">{caseData.plaintiff_name}</p>
              </div>
            )}

            {caseData.defendant_name && (
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Defendant / Respondent</p>
                <p className="font-medium text-slate-900">{caseData.defendant_name}</p>
              </div>
            )}

            {caseData.incident_description && (
              <div className="space-y-1 pt-2 border-t">
                <p className="text-sm text-slate-500">Description</p>
                <p className="text-slate-700">{caseData.incident_description}</p>
              </div>
            )}

            {caseData.desired_outcome && (
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Desired Outcome</p>
                <p className="text-slate-700">{caseData.desired_outcome}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Court Form PDFs — only after accepting the case */}
        {caseData.status !== "lawyer_requested" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-violet-500" />
                Court Form PDFs
              </CardTitle>
              <CardDescription>
                Download all court forms for this case
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LawyerDownloadButtons
                caseId={caseData.id}
                caseName={caseData.case_number}
                caseSubType={caseData.sub_type}
              />
            </CardContent>
          </Card>
        )}
        </div>

        {/* Case Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseData.plaintiff_name && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Petitioner / Plaintiff</p>
                  <p className="font-medium text-slate-900">{caseData.plaintiff_name}</p>
                </div>
              )}
              {caseData.defendant_name && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Respondent / Defendant</p>
                  <p className="font-medium text-slate-900">{caseData.defendant_name}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </p>
                <p className="font-medium text-slate-900">
                  {[caseData.county, caseData.state].filter(Boolean).join(", ") || "N/A"}
                </p>
              </div>
              {caseData.incident_date && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Filed / Incident Date
                  </p>
                  <p className="font-medium text-slate-900">{format(new Date(caseData.incident_date), "MMM d, yyyy")}</p>
                </div>
              )}
              {caseData.complexity_score && (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5" /> Complexity
                  </p>
                  <p className="font-medium text-slate-900">{caseData.complexity_score}/10</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Documents
                {caseData.status === "lawyer_requested" ? (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                    <Lock className="h-3 w-3 mr-1" />
                    Limited Access
                  </Badge>
                ) : (
                  <span className="text-sm font-normal text-slate-500">
                    ({caseData.documents?.length || 0})
                  </span>
                )}
              </CardTitle>
              {caseData.status === "lawyer_requested" && (
                <CardDescription className="text-amber-600 text-xs">
                  Only pleading documents are visible before accepting the case
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {(() => {
                const isPendingReview = caseData.status === "lawyer_requested";
                const visibleDocs = isPendingReview
                  ? (caseData.documents || []).filter((doc) => PLEADING_TYPES.has(doc.document_type))
                  : caseData.documents || [];

                if (visibleDocs.length > 0) {
                  return (
                    <div className="space-y-3">
                      {visibleDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(doc.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                      {isPendingReview && (caseData.documents?.length || 0) > visibleDocs.length && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-dashed text-slate-500">
                          <Lock className="h-4 w-4" />
                          <p className="text-xs">
                            {(caseData.documents?.length || 0) - visibleDocs.length} more document{(caseData.documents?.length || 0) - visibleDocs.length !== 1 ? "s" : ""} available after accepting the case
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="text-center py-4">
                    <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {isPendingReview ? "No pleading documents available yet" : "No documents yet"}
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
