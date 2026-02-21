"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Star,
  CheckCircle2,
  Download,
  FileText,
  Clock,
  MessageCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { ReviewLawyerDialog } from "@/components/cases/ReviewLawyerDialog";

// Demo data for lawyer review
const DEMO_REVIEW_DATA = {
  lawyer: {
    id: "lawyer-001",
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/200?img=47",
    bar_number: "AZ-12345",
    bar_state: "AZ",
  },
  reviewed_at: "2026-02-11T14:30:00Z",
  overall_feedback:
    "I've completed a thorough review of all your submitted documents. Overall, your case is well-prepared and the documents are in good shape for filing. Below are my specific notes and corrections for each document.",
  documents: [
    {
      id: "doc-1",
      name: "Petition for Dissolution of Marriage",
      status: "approved" as const,
      notes:
        "Added missing statutory reference in Section 4 (A.R.S. §25-312). Corrected formatting on signature block. Document is ready for filing.",
    },
    {
      id: "doc-2",
      name: "Preliminary Injunction",
      status: "approved" as const,
      notes:
        "All sections look correct. Verified compliance with A.R.S. §25-315. No changes needed.",
    },
    {
      id: "doc-3",
      name: "Sensitive Data Coversheet",
      status: "revision_needed" as const,
      notes:
        "Please verify the SSN last 4 digits and update the current mailing address. Once corrected, this will be ready for filing.",
    },
  ],
  key_findings: [
    "All court forms comply with current Arizona family law requirements",
    "Petition formatting corrected to match DRDC15f standards",
    "Preliminary injunction verified against A.R.S. §25-315",
    "Minor correction needed on Sensitive Data Coversheet",
  ],
  next_steps: [
    "Download your reviewed documents below",
    "Correct the mailing address on the Sensitive Data Coversheet",
    "File all documents with your local Superior Court",
    "Serve the respondent within 120 days of filing",
  ],
};

const docStatusConfig = {
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700",
    iconColor: "text-emerald-500",
  },
  revision_needed: {
    icon: AlertCircle,
    label: "Needs Revision",
    color: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-500",
  },
};

export function LawyerReviewSection({
  caseId,
  caseNumber,
}: {
  caseId: string;
  caseNumber: string;
}) {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const data = DEMO_REVIEW_DATA;

  return (
    <>
      <div className="space-y-6">
        {/* Lawyer Info Card */}
        <Card className="rounded-xl shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={data.lawyer.avatar}
                alt={data.lawyer.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    {data.lawyer.name}
                  </h3>
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                    Verified Attorney
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">
                  {data.lawyer.bar_state} Bar #{data.lawyer.bar_number}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  Reviewed on{" "}
                  {new Date(data.reviewed_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/lawyers/${data.lawyer.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg gap-1.5"
                  >
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message
                </Button>
              </div>
            </div>

            {/* Overall feedback */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Attorney&apos;s Summary
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {data.overall_feedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Review Details */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-400" />
              Reviewed Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.documents.map((doc) => {
              const config = docStatusConfig[doc.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {doc.name}
                        </h4>
                        <Badge className={`${config.color} text-xs gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {doc.notes}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 gap-2 shadow-sm">
              <Download className="h-4 w-4" />
              Download All Reviewed Documents
            </Button>
          </CardContent>
        </Card>

        {/* Key Findings & Next Steps - two columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Findings */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.key_findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-600">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recommended Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {data.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-blue-600">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Rate Your Lawyer CTA */}
        <Card className="rounded-xl shadow-sm border-amber-100 bg-gradient-to-r from-amber-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Star className="h-7 w-7 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  How was your experience?
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Help other clients by sharing your experience with{" "}
                  {data.lawyer.name}
                </p>
              </div>
              <Button
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 shadow-sm"
                onClick={() => setReviewDialogOpen(true)}
              >
                <Star className="h-4 w-4" />
                Leave a Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReviewLawyerDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        lawyerId={data.lawyer.id}
        lawyerName={data.lawyer.name}
        caseId={caseId}
      />
    </>
  );
}
