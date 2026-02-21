"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Printer, Building2, FileCheck, Send, Clock, Gavel, CheckCircle2 } from "lucide-react";

export function FilingInstructionsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-md"
      >
        <BookOpen className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        Filing Instructions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Gavel className="h-5 w-5 text-indigo-600" />
              How to File Your Divorce Papers
            </DialogTitle>
            <DialogDescription>
              Follow these steps after downloading all your court forms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {/* Step 1: Print */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Printer className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 1: Print Your Documents</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">3 copies</span> of the Petition for Dissolution of Marriage
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">3 copies</span> of the Summons
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">3 copies</span> of the Preliminary Injunction
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">3 copies</span> of the Notice Regarding Creditors
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">3 copies</span> of the Health Insurance Notice
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Print <span className="font-medium">1 copy</span> of the Sensitive Data Coversheet (filed under seal)
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Step 2: File at Court */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 2: File at the Clerk of Superior Court</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Take all copies to the Clerk of the Superior Court in your county
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Pay the filing fee (currently around $349 in Maricopa County; fees vary by county)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Request <span className="font-medium">&quot;conformed&quot; copies</span> (stamped with the filing date and case number)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Keep one conformed copy for your records
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">Fee Waiver:</span> If you cannot afford the filing fee, you may request a fee deferral or waiver by filing a Fee Deferral Application with the court.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 3: Serve Your Spouse */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 3: Serve Your Spouse (Respondent)</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Your spouse must be officially served with a copy of the filed documents. There are two main options:
                </p>
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-sm font-medium text-slate-800">Option A: Acceptance of Service</p>
                    <p className="text-xs text-slate-600 mt-1">
                      If your spouse is willing, they can sign an &quot;Acceptance of Service&quot; form acknowledging receipt of the documents. This is the simplest and least expensive method.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-sm font-medium text-slate-800">Option B: Private Process Server or Sheriff</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Hire a certified process server or request the county sheriff to personally deliver the documents to your spouse. The process server will file a proof of service with the court.
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-red-800">
                    <span className="font-semibold">Important:</span> You cannot serve the papers yourself. Service must be completed by someone other than you who is at least 18 years old.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 4: Response Window */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 4: Wait for Response</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Your spouse has <span className="font-medium">20 calendar days</span> to file a written response after being served (30 days if served out of state)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    If your spouse does not respond within the deadline, you may apply for a <span className="font-medium">default decree</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    If your spouse files a response, the case proceeds as a contested divorce
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Step 5: Default Decree */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 5: Obtain Your Decree</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    If uncontested (no response or agreement reached), file an Application for Default and a proposed Decree of Dissolution
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Arizona requires a minimum <span className="font-medium">60-day waiting period</span> from the date of service before a decree can be entered
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    Once the judge signs the decree, your divorce is final
                  </li>
                </ul>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-slate-100 rounded-lg border">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold">Disclaimer:</span> This information is provided for general guidance only and does not constitute legal advice. Court procedures and fees may vary by county and are subject to change. For specific legal questions about your case, consult with a licensed Arizona attorney.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
