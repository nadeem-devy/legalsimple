"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Star,
  Download,
  Shield,
  ArrowRight,
  X,
} from "lucide-react";
import { PRACTICE_AREAS } from "@/config/practice-areas";
import { ReviewLawyerDialog } from "./ReviewLawyerDialog";

interface CaseItem {
  id: string;
  case_number: string;
  status: string;
  case_type: string;
  sub_type?: string;
  created_at: string;
  assigned_lawyer_id?: string;
  assigned_lawyer_name?: string;
  lawyer_feedback?: string;
}

// Demo data for reviewed cases - shows what it looks like when a lawyer completes a review
const DEMO_REVIEWED_DATA: Record<
  string,
  {
    lawyer_name: string;
    lawyer_avatar: string;
    lawyer_id: string;
    feedback: string;
    reviewed_at: string;
    documents_count: number;
  }
> = {
  // This will be matched to actual case IDs when real data is available
  demo: {
    lawyer_name: "Sarah Johnson",
    lawyer_avatar: "https://i.pravatar.cc/200?img=47",
    lawyer_id: "lawyer-001",
    feedback:
      "I've reviewed all your documents thoroughly. Everything looks solid. I've made minor corrections to the petition formatting and added a missing statutory reference in Section 4. Your case is well-prepared for filing.",
    reviewed_at: "2026-02-11T14:30:00Z",
    documents_count: 3,
  },
};

export function ReviewedCaseBanner({ cases }: { cases: CaseItem[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedLawyerId, setSelectedLawyerId] = useState("");
  const [selectedLawyerName, setSelectedLawyerName] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");

  // Filter for cases with document_reviewed status
  const reviewedCases = cases.filter(
    (c) => c.status === "document_reviewed" && !dismissed.includes(c.id)
  );

  if (reviewedCases.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        {reviewedCases.map((caseItem) => {
          const demoData = DEMO_REVIEWED_DATA.demo;
          const lawyerName =
            caseItem.assigned_lawyer_name || demoData.lawyer_name;
          const lawyerId = caseItem.assigned_lawyer_id || demoData.lawyer_id;

          return (
            <Card
              key={caseItem.id}
              className="border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-emerald-50 shadow-md overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          Document Review Complete!
                        </h3>
                        <p className="text-sm text-slate-500">
                          {caseItem.case_number} &middot;{" "}
                          {PRACTICE_AREAS[
                            caseItem.case_type as keyof typeof PRACTICE_AREAS
                          ]?.name || caseItem.case_type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDismissed((prev) => [...prev, caseItem.id])
                      }
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Lawyer info + feedback */}
                  <div className="flex gap-4 mb-4">
                    <img
                      src={demoData.lawyer_avatar}
                      alt={lawyerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">
                          {lawyerName}
                        </span>
                        <Shield className="h-3.5 w-3.5 text-emerald-500" />
                        <Badge className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0">
                          Verified Attorney
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        &ldquo;{demoData.feedback}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-indigo-100">
                    <Link href={`/cases/${caseItem.id}?tab=documents`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-2 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Reviewed Files
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => {
                        setSelectedLawyerId(lawyerId);
                        setSelectedLawyerName(lawyerName);
                        setSelectedCaseId(caseItem.id);
                        setReviewDialogOpen(true);
                      }}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Rate Your Lawyer
                    </Button>
                    <Link href={`/cases/${caseItem.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg gap-1.5 text-slate-500"
                      >
                        View Case
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ReviewLawyerDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        lawyerId={selectedLawyerId}
        lawyerName={selectedLawyerName}
        caseId={selectedCaseId}
      />
    </>
  );
}
