"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ModificationChatInterface } from "@/components/modification-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, FileEdit } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

function ModificationChatContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || undefined;

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <LogoIcon size="lg" />
            <FileEdit className="h-4 w-4 text-amber-400 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Petition to Modify Court Orders
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto text-sm">
          Complete this questionnaire to prepare your Arizona petition to modify
          existing court orders for legal decision making, parenting time, or
          child support.
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-amber-600" />
          <span>~10-15 minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileEdit className="h-4 w-4 text-orange-600" />
          <span>Modify Existing Orders</span>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <ModificationChatInterface caseId={caseId} />
        </CardContent>
      </Card>

      {/* Help text */}
      <p className="text-center text-sm text-slate-500 mt-3">
        Your progress is saved automatically. You can close this page and return
        later.
      </p>
    </div>
  );
}

export default function ModificationChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-slate-500">
            Loading questionnaire...
          </div>
        </div>
      }
    >
      <ModificationChatContent />
    </Suspense>
  );
}
