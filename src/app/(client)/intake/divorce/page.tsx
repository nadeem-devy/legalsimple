"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DivorceIntakeWizard } from "@/components/divorce-intake";

function DivorceIntakeContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || undefined;

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Divorce Petition - No Children
        </h1>
        <p className="text-slate-600">
          Complete this form to generate your Arizona divorce petition.
          All questions use simple selections for easy completion.
        </p>
      </div>

      <DivorceIntakeWizard caseId={caseId} />
    </div>
  );
}

export default function DivorceIntakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-slate-500">Loading intake form...</div>
        </div>
      }
    >
      <DivorceIntakeContent />
    </Suspense>
  );
}
