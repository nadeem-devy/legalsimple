"use client";

import { ExtractedOrderData } from "@/lib/modification-chat/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Scale,
  Users,
  DollarSign,
  Calendar,
  Hash,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderReferencePanelProps {
  data: ExtractedOrderData;
  className?: string;
}

function LabeledField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-1">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">
        {value}
      </span>
    </div>
  );
}

const sectionTypeConfig: Record<
  string,
  { label: string; icon: typeof Scale; color: string }
> = {
  legal_decision_making: {
    label: "Legal Decision Making",
    icon: Scale,
    color: "text-blue-600",
  },
  parenting_time: {
    label: "Parenting Time",
    icon: Users,
    color: "text-purple-600",
  },
  child_support: {
    label: "Child Support",
    icon: DollarSign,
    color: "text-green-600",
  },
  other: { label: "Other", icon: BookOpen, color: "text-slate-600" },
};

const confidenceConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  high: { label: "High", bg: "bg-green-100", text: "text-green-700" },
  medium: { label: "Medium", bg: "bg-amber-100", text: "text-amber-700" },
  low: { label: "Low", bg: "bg-red-100", text: "text-red-700" },
};

export function OrderReferencePanel({
  data,
  className,
}: OrderReferencePanelProps) {
  const confidence = confidenceConfig[data.confidence] || confidenceConfig.medium;

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            Court Order Reference
          </h3>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              confidence.bg,
              confidence.text
            )}
          >
            {confidence.label}
          </span>
        </div>

        <Separator />

        {/* Case Info */}
        {(data.caseNumber || data.courtName) && (
          <div>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Case Information
            </h4>
            {data.caseNumber && (
              <LabeledField label="Case #" value={data.caseNumber} />
            )}
            {data.courtName && (
              <LabeledField label="Court" value={data.courtName} />
            )}
          </div>
        )}

        {/* Parties */}
        {(data.petitionerName || data.respondentName) && (
          <div>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Parties
            </h4>
            {data.petitionerName && (
              <LabeledField label="Petitioner" value={data.petitionerName} />
            )}
            {data.respondentName && (
              <LabeledField label="Respondent" value={data.respondentName} />
            )}
          </div>
        )}

        {/* Children */}
        {data.children && data.children.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Children ({data.children.length})
            </h4>
            <div className="space-y-1.5">
              {data.children.map((child, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <span className="font-medium text-slate-800">
                    {child.name}
                  </span>
                  {child.dateOfBirth && (
                    <span className="text-xs text-slate-500">
                      {child.dateOfBirth}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {data.sections && data.sections.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Identified Sections
            </h4>
            <Accordion
              type="multiple"
              defaultValue={data.sections.map((_, i) => `section-${i}`)}
            >
              {data.sections.map((section, i) => {
                const config =
                  sectionTypeConfig[section.type] || sectionTypeConfig.other;
                const Icon = config.icon;

                return (
                  <AccordionItem key={i} value={`section-${i}`}>
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                        <span className="font-medium">{config.label}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="space-y-1 text-xs pl-5.5">
                        {section.orderDate && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{section.orderDate}</span>
                          </div>
                        )}
                        {section.pageNumber && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Hash className="h-3 w-3 text-slate-400" />
                            <span>Page {section.pageNumber}</span>
                            {section.paragraphNumber && (
                              <span>, Para. {section.paragraphNumber}</span>
                            )}
                          </div>
                        )}
                        {section.summary && (
                          <p className="text-slate-600 mt-1.5 leading-relaxed">
                            {section.summary}
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
