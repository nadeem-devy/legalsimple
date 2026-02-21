import { notFound } from "next/navigation";
import type { Case, ChatMessage, Document, Evidence } from "@/types/database";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, FileText, MessageSquare, Upload, User, Building2,
  Calendar, MapPin, DollarSign, Scale, AlertTriangle, Clock, Download,
  CheckCircle2, Shield, Star
} from "lucide-react";
import { format } from "date-fns";
import { PRACTICE_AREAS, getDocumentTypeName } from "@/config/practice-areas";
import { SUPPORTED_STATES } from "@/config/states";
import { CaseDetailChat } from "./CaseDetailChat";
import { DocumentGenerator } from "./DocumentGenerator";
import { LawyerReviewSection } from "./LawyerReviewSection";

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

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generate?: string }>;
}

export default async function CaseDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { generate } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Get case details
  const { data: caseDataResult, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (error || !caseDataResult) {
    notFound();
  }

  const caseData = caseDataResult as unknown as Case;

  // Get chat messages
  const { data: messagesData } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const messages = (messagesData || []) as unknown as ChatMessage[];

  // Get documents
  const { data: documentsData } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const documents = (documentsData || []) as unknown as Document[];

  // Get evidence
  const { data: evidenceData } = await supabase
    .from("evidence")
    .select("*")
    .eq("case_id", id)
    .order("created_at", { ascending: false });

  const evidence = (evidenceData || []) as unknown as Evidence[];

  const practiceArea = PRACTICE_AREAS[caseData.case_type as keyof typeof PRACTICE_AREAS];
  const stateConfig = SUPPORTED_STATES[caseData.state as keyof typeof SUPPORTED_STATES];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{caseData.case_number}</h1>
            <Badge variant="secondary" className={statusColors[caseData.status]}>
              {statusLabels[caseData.status]}
            </Badge>
            {caseData.lawyer_recommended && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                <AlertTriangle className="h-3 w-3" />
                Lawyer Recommended
              </Badge>
            )}
          </div>
          <p className="text-slate-600">
            {practiceArea?.name || caseData.case_type}
            {caseData.sub_type && ` - ${caseData.sub_type.replace(/_/g, " ")}`}
          </p>
        </div>
        {caseData.lawyer_recommended && (
          <Button variant="outline" className="gap-2">
            <Scale className="h-4 w-4" />
            Find a Lawyer
          </Button>
        )}
      </div>

      {/* Lawyer Review Complete Banner */}
      {caseData.status === "document_reviewed" && (
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  Your documents have been reviewed by a verified attorney
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Check the Lawyer Review tab for detailed feedback and download your reviewed documents.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                  <Shield className="h-3 w-3" />
                  Reviewed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={generate ? "documents" : caseData.status === "document_reviewed" ? "lawyer_review" : "overview"}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {caseData.status === "document_reviewed" && (
            <TabsTrigger value="lawyer_review" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Lawyer Review
            </TabsTrigger>
          )}
          <TabsTrigger value="chat">Chat History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        {/* Lawyer Review Tab */}
        {caseData.status === "document_reviewed" && (
          <TabsContent value="lawyer_review" className="space-y-6">
            <LawyerReviewSection caseId={id} caseNumber={caseData.case_number} />
          </TabsContent>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Case Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.ai_summary ? (
                  <p className="text-slate-600">{caseData.ai_summary}</p>
                ) : (
                  <p className="text-slate-400 italic">No summary available yet</p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Case Type</span>
                    <p className="font-medium">{practiceArea?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sub Type</span>
                    <p className="font-medium capitalize">
                      {caseData.sub_type?.replace(/_/g, " ") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Complexity</span>
                    <p className="font-medium">
                      {caseData.complexity_score ? `${caseData.complexity_score}/10` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Urgency</span>
                    <p className="font-medium capitalize">{caseData.urgency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {caseData.city && `${caseData.city}, `}
                      {caseData.county && `${caseData.county} County, `}
                      {stateConfig?.name || caseData.state}
                    </p>
                    <p className="text-sm text-slate-500">Jurisdiction</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {caseData.incident_date
                        ? format(new Date(caseData.incident_date), "MMMM d, yyyy")
                        : "Not specified"}
                    </p>
                    <p className="text-sm text-slate-500">Incident Date</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(caseData.created_at), "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-slate-500">Case Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parties Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Plaintiff</p>
                    <p className="font-medium">{caseData.plaintiff_name || "You"}</p>
                    {caseData.plaintiff_address && (
                      <p className="text-sm text-slate-500">{caseData.plaintiff_address}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  {caseData.defendant_type === "business" ? (
                    <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  ) : (
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Defendant</p>
                    <p className="font-medium">{caseData.defendant_name || "Not specified"}</p>
                    {caseData.defendant_address && (
                      <p className="text-sm text-slate-500">{caseData.defendant_address}</p>
                    )}
                    {caseData.defendant_type && (
                      <Badge variant="outline" className="mt-1 capitalize">
                        {caseData.defendant_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Damages & Outcome */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Damages & Desired Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseData.damages_amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-lg">
                        ${caseData.damages_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-500">Claimed Amount</p>
                    </div>
                  </div>
                )}

                {caseData.damages_description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Damages Description</p>
                    <p className="text-slate-600">{caseData.damages_description}</p>
                  </div>
                )}

                {caseData.desired_outcome && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Desired Outcome</p>
                    <p className="text-slate-600">{caseData.desired_outcome}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Incident Description */}
          {caseData.incident_description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Happened</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">
                  {caseData.incident_description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chat History Tab */}
        <TabsContent value="chat">
          <CaseDetailChat
            caseId={id}
            initialMessages={messages || []}
            userState={caseData.state as "AZ" | "NV" | "TX"}
            practiceArea={caseData.case_type as "family_law" | "business_formation" | "estate_planning"}
          />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <DocumentGenerator
            caseId={id}
            caseData={caseData}
            existingDocuments={documents || []}
            autoGenerate={generate === "true"}
          />
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Evidence & Documents</CardTitle>
                <CardDescription>
                  Upload supporting documents for your case
                </CardDescription>
              </div>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </CardHeader>
            <CardContent>
              {evidence && evidence.length > 0 ? (
                <div className="space-y-3">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium">{item.file_name}</p>
                          <p className="text-sm text-slate-500">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">No evidence uploaded yet</p>
                  <p className="text-sm text-slate-500">
                    Upload contracts, receipts, photos, or any supporting documents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
