"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DivorceWithChildrenChatInterface } from "@/components/divorce-with-children-chat";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Shield, Clock, Users } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

function DivorceWithChildrenChatContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || undefined;

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <LogoIcon size="lg" />
            <Users className="h-4 w-4 text-blue-400 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Divorce Petition with Children
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto text-sm">
          Complete this questionnaire to prepare your Arizona divorce petition with custody, child support, and parenting time arrangements.
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-blue-600" />
          <span>~25-30 minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-indigo-600" />
          <span>Includes Custody & Support</span>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="border-slate-200 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <DivorceWithChildrenChatInterface caseId={caseId} />
        </CardContent>
      </Card>

      {/* Help text */}
      <p className="text-center text-sm text-slate-500 mt-3">
        Your progress is saved automatically. You can close this page and return later.
      </p>
    </div>
  );
}

export default function DivorceWithChildrenChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-slate-500">Loading questionnaire...</div>
        </div>
      }
    >
      <DivorceWithChildrenChatContent />
    </Suspense>
  );
}
