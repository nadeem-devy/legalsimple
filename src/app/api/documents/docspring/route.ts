import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getDocSpring } from "@/lib/docspring/client";
import { format } from "date-fns";

// Flatten array data into numbered fields (e.g., homes[] -> home1Address, home2Address)
function flattenArrayData(intakeData: Record<string, unknown>): Record<string, unknown> {
  const flattened: Record<string, unknown> = { ...intakeData };

  // Flatten homes array
  const homes = intakeData.homes as Array<{
    address?: string;
    hasDisclaimerDeed?: boolean;
    usedCommunityFunds?: boolean;
    requestEquitableLien?: boolean;
    divisionOption?: string;
  }> | undefined;
  if (homes?.length) {
    homes.forEach((home, idx) => {
      const num = idx + 1;
      flattened[`home${num}Address`] = home.address;
      flattened[`home${num}HasDisclaimerDeed`] = home.hasDisclaimerDeed;
      flattened[`home${num}UsedCommunityFunds`] = home.usedCommunityFunds;
      flattened[`home${num}RequestEquitableLien`] = home.requestEquitableLien;
      flattened[`home${num}Division`] = home.divisionOption;
    });
  }

  // Flatten vehicles array
  const vehicles = intakeData.vehicles as Array<{
    year?: string;
    make?: string;
    model?: string;
    titledTo?: string;
    hasLoan?: boolean;
    loanBalance?: number;
    divisionOption?: string;
  }> | undefined;
  if (vehicles?.length) {
    vehicles.forEach((vehicle, idx) => {
      const num = idx + 1;
      flattened[`vehicle${num}Year`] = vehicle.year;
      flattened[`vehicle${num}Make`] = vehicle.make;
      flattened[`vehicle${num}Model`] = vehicle.model;
      flattened[`vehicle${num}Description`] = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      flattened[`vehicle${num}TitledTo`] = vehicle.titledTo;
      flattened[`vehicle${num}HasLoan`] = vehicle.hasLoan;
      flattened[`vehicle${num}LoanBalance`] = vehicle.loanBalance;
      flattened[`vehicle${num}Division`] = vehicle.divisionOption;
    });
  }

  // Flatten bank accounts array
  const bankAccounts = intakeData.bankAccounts as Array<{
    bankName?: string;
    last4Digits?: string;
    proposedDivision?: string;
  }> | undefined;
  if (bankAccounts?.length) {
    bankAccounts.forEach((account, idx) => {
      const num = idx + 1;
      flattened[`bank${num}Name`] = account.bankName;
      flattened[`bank${num}Last4`] = account.last4Digits;
      flattened[`bank${num}Division`] = account.proposedDivision;
    });
  }

  // Flatten retirement accounts array
  const retirementAccounts = intakeData.retirementAccounts as Array<{
    accountType?: string;
    ownerName?: string;
    administrator?: string;
    proposedDivision?: string;
  }> | undefined;
  if (retirementAccounts?.length) {
    retirementAccounts.forEach((account, idx) => {
      const num = idx + 1;
      flattened[`retirement${num}Type`] = account.accountType;
      flattened[`retirement${num}Owner`] = account.ownerName;
      flattened[`retirement${num}Admin`] = account.administrator;
      flattened[`retirement${num}Division`] = account.proposedDivision;
    });
  }

  // Flatten separate property array
  const separateProperty = intakeData.separateProperty as Array<{
    description?: string;
    value?: number;
    awardedTo?: string;
  }> | undefined;
  if (separateProperty?.length) {
    separateProperty.forEach((prop, idx) => {
      const num = idx + 1;
      flattened[`sepProp${num}Desc`] = prop.description;
      flattened[`sepProp${num}Value`] = prop.value;
      flattened[`sepProp${num}AwardedTo`] = prop.awardedTo;
    });
  }

  // Flatten community debts array
  const communityDebts = intakeData.communityDebts as Array<{
    description?: string;
    amountOwed?: number;
    responsibleParty?: string;
  }> | undefined;
  if (communityDebts?.length) {
    communityDebts.forEach((debt, idx) => {
      const num = idx + 1;
      flattened[`commDebt${num}Desc`] = debt.description;
      flattened[`commDebt${num}Amount`] = debt.amountOwed;
      flattened[`commDebt${num}Responsible`] = debt.responsibleParty;
    });
  }

  // Flatten separate debts array
  const separateDebts = intakeData.separateDebts as Array<{
    description?: string;
    amountOwed?: number;
    responsibleParty?: string;
  }> | undefined;
  if (separateDebts?.length) {
    separateDebts.forEach((debt, idx) => {
      const num = idx + 1;
      flattened[`sepDebt${num}Desc`] = debt.description;
      flattened[`sepDebt${num}Amount`] = debt.amountOwed;
      flattened[`sepDebt${num}Responsible`] = debt.responsibleParty;
    });
  }

  return flattened;
}

// Transform intake data to DocSpring format using saved mappings
function transformIntakeData(
  intakeData: Record<string, unknown>,
  fieldMappings: Record<string, string>
): Record<string, string | number | boolean | null> {
  // First flatten array data
  const flatData = flattenArrayData(intakeData);
  const result: Record<string, string | number | boolean | null> = {};

  // Computed/derived fields
  const computedFields: Record<string, () => string | null> = {
    petitionerRole: () => flatData.gender === "male" ? "Husband" : "Wife",
    respondentRole: () => flatData.gender === "male" ? "Wife" : "Husband",
    currentDate: () => format(new Date(), "MM/dd/yyyy"),
    caseNumber: () => (flatData.caseNumber as string) || "",
    isPregnantText: () => flatData.isPregnant ? "Yes" : "No",
    wantsMaidenNameText: () => flatData.wantsMaidenName ? "Yes" : "No",
    hasPropertyAgreementText: () => flatData.hasPropertyAgreement ? "Yes" : "No",
  };

  // If mappings exist, use them
  if (Object.keys(fieldMappings).length > 0) {
    for (const [docspringField, intakeField] of Object.entries(fieldMappings)) {
      // Check if it's a computed field
      if (computedFields[intakeField]) {
        result[docspringField] = computedFields[intakeField]();
      } else {
        // Get value from flattened data
        const value = flatData[intakeField];
        if (value !== undefined && value !== null) {
          result[docspringField] = typeof value === "object" ? JSON.stringify(value) : value as string;
        }
      }
    }
  } else {
    // No mappings - use intake field names directly (assume DocSpring fields match)
    for (const [key, value] of Object.entries(flatData)) {
      if (value !== undefined && value !== null && typeof value !== "object") {
        result[key] = value as string | number | boolean;
      }
    }
    // Add computed fields with standard names
    result.petitionerRole = computedFields.petitionerRole();
    result.respondentRole = computedFields.respondentRole();
    result.currentDate = computedFields.currentDate();
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, documentType, intakeData } = body;

    if (!caseId || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields: caseId, documentType" },
        { status: 400 }
      );
    }

    // Get case details
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Check if user owns this case or is a lawyer assigned to it
    if (caseData.client_id !== user.id && caseData.lawyer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const docspring = getDocSpring();

    // Check if DocSpring is configured
    if (!docspring.isConfigured()) {
      return NextResponse.json({
        warning: "DocSpring not configured. Using AI document generation.",
        fallback: true,
      });
    }

    // Get saved mapping from database
    const adminClient = await createAdminClient();
    const { data: mapping } = await adminClient
      .from("docspring_mappings")
      .select("*")
      .eq("state", caseData.state)
      .eq("practice_area", caseData.case_type)
      .eq("document_type", documentType)
      .eq("is_active", true)
      .single();

    if (!mapping) {
      return NextResponse.json({
        warning: "No template mapping found for this document type. Please configure in admin.",
        fallback: true,
      });
    }

    // Merge case data with intake data
    const fullIntakeData = {
      caseNumber: caseData.case_number,
      county: caseData.county,
      state: caseData.state,
      ...intakeData,
    };

    // Transform data using saved mappings
    const docspringData = transformIntakeData(
      fullIntakeData,
      mapping.field_mappings || {}
    );

    // Generate PDF with DocSpring
    const result = await docspring.generatePDF({
      templateId: mapping.template_id,
      data: docspringData,
      metadata: {
        case_id: caseId,
        user_id: user.id,
        document_type: documentType,
      },
    });

    if (result.status === "error") {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Save document record to database
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        case_id: caseId,
        document_type: documentType,
        title: `${documentType.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())} - ${caseData.case_number}`,
        file_url: result.submission?.permanent_download_url || result.submission?.download_url,
        status: "draft",
        version: 1,
        generated_by: "ai",
        content: JSON.stringify({
          docspring_submission_id: result.submission?.id,
          template_id: mapping.template_id,
          data: docspringData,
        }),
      })
      .select()
      .single();

    if (docError) {
      console.error("Error saving document:", docError);
    }

    return NextResponse.json({
      success: true,
      submission: result.submission,
      document: document,
      download_url: result.submission?.permanent_download_url || result.submission?.download_url,
    });

  } catch (error) {
    console.error("DocSpring API error:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}

// Get submission status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submissionId");

    if (!submissionId) {
      return NextResponse.json(
        { error: "Missing submissionId" },
        { status: 400 }
      );
    }

    const docspring = getDocSpring();

    if (!docspring.isConfigured()) {
      return NextResponse.json(
        { error: "DocSpring not configured" },
        { status: 503 }
      );
    }

    const submission = await docspring.getSubmission(submissionId);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission });

  } catch (error) {
    console.error("DocSpring status error:", error);
    return NextResponse.json(
      { error: "Failed to get submission status" },
      { status: 500 }
    );
  }
}
