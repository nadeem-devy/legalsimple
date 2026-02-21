import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "@/components/court-forms/PDFDocument";
import { PleadingDocument } from "@/components/court-forms/PleadingDocument";
import { SensitiveDataCoversheet } from "@/components/court-forms/SensitiveDataCoversheet";
import { SummonsDocument } from "@/components/court-forms/SummonsDocument";
import { PreliminaryInjunctionDocument } from "@/components/court-forms/PreliminaryInjunctionDocument";
import { NoticeRegardingCreditorsDocument } from "@/components/court-forms/NoticeRegardingCreditorsDocument";
import { PetitionDocument } from "@/components/court-forms/PetitionDocument";
import { HealthInsuranceNoticeDocument } from "@/components/court-forms/HealthInsuranceNoticeDocument";
import { ParentInfoProgramDocument } from "@/components/court-forms/ParentInfoProgramDocument";
import { PaternityPetitionDocument } from "@/components/court-forms/PaternityPetitionDocument";
import { mapIntakeDataToPDF } from "@/lib/court-forms/data-mapper";

type PDFFormat =
  | "summary"
  | "pleading"
  | "sensitive_data"
  | "summons"
  | "preliminary_injunction"
  | "notice_creditors"
  | "petition"
  | "health_insurance"
  | "parent_info_program";

export async function POST(request: NextRequest) {
  try {
    // Auth check: ensure user is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { caseId, format = "summary" } = body as {
      caseId: string;
      format?: PDFFormat;
    };

    if (!caseId) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS — admin can access any case
    const adminClient = await createAdminClient();

    const { data: caseData, error: caseError } = await adminClient
      .from("cases")
      .select("*, intake_sessions(*)")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Get intake data
    const intakeSessions = caseData.intake_sessions;
    let intakeSession: { collected_data?: unknown } | null = null;

    if (Array.isArray(intakeSessions)) {
      intakeSession = intakeSessions[0] || null;
    } else if (intakeSessions && typeof intakeSessions === "object") {
      intakeSession = intakeSessions as { collected_data?: unknown };
    }

    if (!intakeSession || !intakeSession.collected_data) {
      return NextResponse.json(
        { error: "No intake data found for this case. PDF cannot be generated." },
        { status: 400 }
      );
    }

    const intakeData = intakeSession.collected_data as Record<string, unknown>;
    const subType = caseData.sub_type || "divorce_no_children";
    const pdfData = mapIntakeDataToPDF(intakeData, subType);

    // Generate PDF based on format
    let pdfBuffer: Buffer;
    let filename: string;

    if (format === "sensitive_data") {
      pdfBuffer = await renderToBuffer(
        SensitiveDataCoversheet({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `sensitive-data-coversheet-${caseId}.pdf`;
    } else if (format === "summons") {
      pdfBuffer = await renderToBuffer(
        SummonsDocument({ data: pdfData })
      );
      filename = `summons-${caseId}.pdf`;
    } else if (format === "preliminary_injunction") {
      pdfBuffer = await renderToBuffer(
        PreliminaryInjunctionDocument({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `preliminary-injunction-${caseId}.pdf`;
    } else if (format === "notice_creditors") {
      pdfBuffer = await renderToBuffer(
        NoticeRegardingCreditorsDocument({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `notice-regarding-creditors-${caseId}.pdf`;
    } else if (format === "petition") {
      if (subType === "establish_paternity") {
        pdfBuffer = await renderToBuffer(
          PaternityPetitionDocument({
            data: pdfData,
            caseNumber: caseData.case_number || undefined,
          })
        );
        filename = `paternity-petition-${caseId}.pdf`;
      } else {
        pdfBuffer = await renderToBuffer(
          PetitionDocument({
            data: pdfData,
            caseNumber: caseData.case_number || undefined,
          })
        );
        filename = `petition-dissolution-${caseId}.pdf`;
      }
    } else if (format === "health_insurance") {
      pdfBuffer = await renderToBuffer(
        HealthInsuranceNoticeDocument({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `health-insurance-notice-${caseId}.pdf`;
    } else if (format === "parent_info_program") {
      pdfBuffer = await renderToBuffer(
        ParentInfoProgramDocument({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `parent-info-program-${caseId}.pdf`;
    } else if (format === "pleading" && subType === "establish_paternity") {
      pdfBuffer = await renderToBuffer(
        PaternityPetitionDocument({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename = `paternity-petition-${caseId}.pdf`;
    } else {
      const DocumentComponent =
        format === "pleading" ? PleadingDocument : PDFDocument;
      pdfBuffer = await renderToBuffer(
        DocumentComponent({
          data: pdfData,
          caseNumber: caseData.case_number || undefined,
        })
      );
      filename =
        format === "pleading"
          ? `petition-pleading-${caseId}.pdf`
          : `petition-summary-${caseId}.pdf`;
    }

    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Admin document download error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
