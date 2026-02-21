import { NextRequest, NextResponse } from "next/server";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
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
import { ModificationPetitionDocument } from "@/components/court-forms/ModificationPetitionDocument";
import { mapIntakeDataToPDF } from "@/lib/court-forms/data-mapper";
import { autoCorrectIntakeData } from "@/lib/court-forms/text-cleanup";

// PDF Format types
type PDFFormat = 'summary' | 'pleading' | 'sensitive_data' | 'summons' | 'preliminary_injunction' | 'notice_creditors' | 'petition' | 'health_insurance' | 'parent_info_program' | 'modification_petition';

// Demo data for mock mode testing
const DEMO_INTAKE_DATA = {
  fullName: "John Demo Smith",
  dateOfBirth: "1985-03-15",
  mailingAddress: "123 Demo Street, Phoenix, AZ 85001",
  county: "Maricopa",
  ssn4: "1234",
  phone: "(602) 555-1234",
  email: "john.demo@example.com",
  gender: "male",
  spouseFullName: "Jane Demo Smith",
  spouseDateOfBirth: "1987-07-22",
  spouseMailingAddress: "456 Example Ave, Phoenix, AZ 85001",
  spouseSsn4: "5678",
  spousePhone: "(602) 555-5678",
  spouseEmail: "jane.demo@example.com",
  dateOfMarriage: "2015-06-20",
  meetsResidencyRequirement: true,
  isPregnant: false,
  wantsMaidenName: true,
  maidenName: "Jane Demo Johnson",
  hasPropertyAgreement: false,
  propertyDivisionPreference: "court_decides",
  hasHome: false,
  homes: [],
  hasFurnitureOver200: true,
  furnitureDivision: "Each party keeps furniture currently in their possession",
  hasAppliancesOver200: false,
  hasRetirement: false,
  retirementAccounts: [],
  hasVehicles: true,
  vehicles: [
    {
      id: "v1",
      year: "2020",
      make: "Toyota",
      model: "Camry",
      titledTo: "me",
      hasLoan: false,
      divisionOption: "i_keep",
    },
  ],
  hasSeparateProperty: false,
  hasCommunityDebt: false,
  hasSeparateDebt: false,
  currentYearTaxFiling: "separately",
  hasPreviousUnfiledTaxes: false,
  maintenanceEntitlement: "neither",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, signature, format = 'summary' } = body as {
      caseId: string;
      signature?: string;
      format?: PDFFormat;
    };

    if (!caseId) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      );
    }

    let caseData: Record<string, unknown> | null = null;
    let intakeData: Record<string, unknown> | null = null;
    let subType = "divorce_no_children";

    if (isMockMode()) {
      // Use demo data in mock mode
      caseData = {
        id: caseId,
        case_number: "DEMO-2024-001",
        sub_type: "divorce_no_children",
      };
      intakeData = DEMO_INTAKE_DATA;
    } else {
      const supabase = await createClient();

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Get case with intake session — allow both the client and the assigned lawyer
      let fetchedCase = null;

      // Try as client first
      const { data: clientCase } = await supabase
        .from("cases")
        .select("*, intake_sessions(*)")
        .eq("id", caseId)
        .eq("client_id", user.id)
        .single();

      if (clientCase) {
        fetchedCase = clientCase;
      } else {
        // Try as assigned lawyer (use admin client to bypass RLS)
        const adminClient = createRawClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: lawyerCase } = await adminClient
          .from("cases")
          .select("*, intake_sessions(*)")
          .eq("id", caseId)
          .eq("lawyer_id", user.id)
          .single();

        // Only allow if case has been accepted (not just requested)
        if (lawyerCase && lawyerCase.status !== "lawyer_requested") {
          fetchedCase = lawyerCase;
        }
      }

      if (!fetchedCase) {
        return NextResponse.json(
          { error: "Case not found" },
          { status: 404 }
        );
      }

      caseData = fetchedCase;
      subType = fetchedCase.sub_type || "divorce_no_children";

      // Get intake data from intake_sessions (can be array or single object)
      const intakeSessions = fetchedCase.intake_sessions;
      let intakeSession: { collected_data?: unknown } | null = null;

      if (Array.isArray(intakeSessions)) {
        intakeSession = intakeSessions[0] || null;
      } else if (intakeSessions && typeof intakeSessions === 'object') {
        intakeSession = intakeSessions as { collected_data?: unknown };
      }

      if (!intakeSession || !intakeSession.collected_data) {
        return NextResponse.json(
          { error: "No intake data found for this case" },
          { status: 400 }
        );
      }

      intakeData = intakeSession.collected_data as Record<string, unknown>;
    }

    // Auto-correct spelling in free-text fields before PDF generation
    const correctedData = autoCorrectIntakeData(intakeData as Record<string, unknown>);

    // Map intake data to PDF format
    const pdfData = mapIntakeDataToPDF(correctedData, subType);

    // Generate PDF based on format
    let pdfBuffer: Buffer;
    let filename: string;

    if (format === 'sensitive_data') {
      pdfBuffer = await renderToBuffer(
        SensitiveDataCoversheet({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
        })
      );
      filename = `sensitive-data-coversheet-${caseId}.pdf`;
    } else if (format === 'summons') {
      pdfBuffer = await renderToBuffer(
        SummonsDocument({
          data: pdfData,
        })
      );
      filename = `summons-${caseId}.pdf`;
    } else if (format === 'preliminary_injunction') {
      pdfBuffer = await renderToBuffer(
        PreliminaryInjunctionDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
        })
      );
      filename = `preliminary-injunction-${caseId}.pdf`;
    } else if (format === 'notice_creditors') {
      pdfBuffer = await renderToBuffer(
        NoticeRegardingCreditorsDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
        })
      );
      filename = `notice-regarding-creditors-${caseId}.pdf`;
    } else if (format === 'petition') {
      if (subType === 'establish_paternity') {
        pdfBuffer = await renderToBuffer(
          PaternityPetitionDocument({
            data: pdfData,
            caseNumber: caseData?.case_number as string || undefined,
          })
        );
        filename = `paternity-petition-${caseId}.pdf`;
      } else {
        pdfBuffer = await renderToBuffer(
          PetitionDocument({
            data: pdfData,
            caseNumber: caseData?.case_number as string || undefined,
          })
        );
        filename = `petition-dissolution-${caseId}.pdf`;
      }
    } else if (format === 'health_insurance') {
      pdfBuffer = await renderToBuffer(
        HealthInsuranceNoticeDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
        })
      );
      filename = `health-insurance-notice-${caseId}.pdf`;
    } else if (format === 'parent_info_program') {
      pdfBuffer = await renderToBuffer(
        ParentInfoProgramDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
        })
      );
      filename = `parent-info-program-${caseId}.pdf`;
    } else if (format === 'modification_petition') {
      pdfBuffer = await renderToBuffer(
        ModificationPetitionDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
          signature: signature as string || undefined,
        })
      );
      filename = `petition-to-modify-${caseId}.pdf`;
    } else if (format === 'pleading' && subType === 'establish_paternity') {
      pdfBuffer = await renderToBuffer(
        PaternityPetitionDocument({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
          signature: signature as string || undefined,
        })
      );
      filename = `paternity-petition-${caseId}.pdf`;
    } else {
      const DocumentComponent = format === 'pleading' ? PleadingDocument : PDFDocument;
      pdfBuffer = await renderToBuffer(
        DocumentComponent({
          data: pdfData,
          caseNumber: caseData?.case_number as string || undefined,
          signature: signature as string || undefined,
        })
      );
      filename = format === 'pleading'
        ? `petition-pleading-${caseId}.pdf`
        : `petition-summary-${caseId}.pdf`;
    }

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("caseId");

  if (!caseId) {
    return NextResponse.json(
      { error: "Case ID is required" },
      { status: 400 }
    );
  }

  // Redirect to POST for actual generation
  return NextResponse.json(
    { error: "Use POST method to generate PDF", caseId },
    { status: 405 }
  );
}
