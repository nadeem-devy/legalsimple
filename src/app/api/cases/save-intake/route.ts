import { NextRequest, NextResponse } from "next/server";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { DivorceIntakeData } from "@/types/divorce-intake";

/**
 * API endpoint to save intake form data to the database
 * This saves all the answers collected during intake process (AI chat or structured form)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      caseId,
      intakeType,
      intakeData,
      data, // For structured form (divorce intake)
    } = body;

    // Handle structured divorce intake form
    if (intakeType === "divorce_no_children" && data) {
      return handleDivorceIntake(supabase, user.id, caseId, data as DivorceIntakeData);
    }

    // Handle chat-based divorce intake
    if (intakeType === "divorce_no_children_chat" && data) {
      return handleDivorceChatIntake(supabase, user.id, caseId, data);
    }

    // Handle chat-based divorce with children intake
    if (intakeType === "divorce_with_children_chat" && data) {
      return handleDivorceWithChildrenChatIntake(supabase, user.id, caseId, data);
    }

    // Handle chat-based paternity intake
    if (intakeType === "establish_paternity_chat" && data) {
      return handlePaternityChatIntake(supabase, user.id, caseId, data);
    }

    // Handle chat-based modification intake
    if (intakeType === "modification_chat" && data) {
      return handleModificationChatIntake(supabase, user.id, caseId, data);
    }

    // Handle legacy AI chat intake format
    if (!caseId || !intakeData) {
      return NextResponse.json(
        { error: "Missing required fields: caseId, intakeData" },
        { status: 400 }
      );
    }

    // Verify case ownership
    const { data: existingCase, error: fetchError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("client_id", user.id)
      .single();

    if (fetchError || !existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Update case with intake data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map intake data to case fields
    if (intakeData.plaintiff_name) updateData.plaintiff_name = intakeData.plaintiff_name;
    if (intakeData.plaintiff_address) updateData.plaintiff_address = intakeData.plaintiff_address;
    if (intakeData.defendant_name) updateData.defendant_name = intakeData.defendant_name;
    if (intakeData.defendant_address) updateData.defendant_address = intakeData.defendant_address;
    if (intakeData.defendant_type) updateData.defendant_type = intakeData.defendant_type;
    if (intakeData.incident_date) updateData.incident_date = intakeData.incident_date;
    if (intakeData.incident_description) updateData.incident_description = intakeData.incident_description;
    if (intakeData.damages_amount) updateData.damages_amount = intakeData.damages_amount;
    if (intakeData.damages_description) updateData.damages_description = intakeData.damages_description;
    if (intakeData.desired_outcome) updateData.desired_outcome = intakeData.desired_outcome;
    if (intakeData.county) updateData.county = intakeData.county;
    if (intakeData.city) updateData.city = intakeData.city;
    if (intakeData.state) updateData.state = intakeData.state;
    if (intakeData.sub_type) updateData.sub_type = intakeData.sub_type;
    if (intakeData.urgency) updateData.urgency = intakeData.urgency;
    if (intakeData.complexity_score) updateData.complexity_score = intakeData.complexity_score;
    if (intakeData.lawyer_recommended !== undefined) updateData.lawyer_recommended = intakeData.lawyer_recommended;
    if (intakeData.ai_summary) updateData.ai_summary = intakeData.ai_summary;

    // Update case status if intake is complete
    if (intakeData.intake_complete) {
      updateData.status = "pending_review";
    }

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", caseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to save intake data" },
        { status: 500 }
      );
    }

    // Save/update intake session
    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: caseId,
        current_step: intakeData.current_step || "complete",
        collected_data: intakeData,
        completed: intakeData.intake_complete || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      case: updatedCase,
      message: "Intake data saved successfully",
    });

  } catch (error) {
    console.error("Save intake error:", error);
    return NextResponse.json(
      { error: "Failed to save intake data" },
      { status: 500 }
    );
  }
}

/**
 * Get intake session data for a case
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "Missing caseId parameter" },
        { status: 400 }
      );
    }

    // Get case with intake session
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*, intake_sessions(*)")
      .eq("id", caseId)
      .eq("client_id", user.id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      case: caseData,
      intakeSession: caseData.intake_sessions?.[0] || null,
    });

  } catch (error) {
    console.error("Get intake error:", error);
    return NextResponse.json(
      { error: "Failed to get intake data" },
      { status: 500 }
    );
  }
}

/**
 * Handle structured divorce intake form data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDivorceIntake(
  supabase: any,
  userId: string,
  caseId: string | undefined,
  formData: DivorceIntakeData
) {
  try {
    // Create new case if no caseId provided
    let targetCaseId = caseId;

    if (!targetCaseId) {
      // Create a new case for this divorce petition
      const { data: newCase, error: createError } = await supabase
        .from("cases")
        .insert({
          client_id: userId,
          case_type: "family_law",
          sub_type: "divorce_no_children",
          state: "AZ",
          county: formData.personalInfo.county,
          city: formData.personalInfo.city,
          status: "intake",
          case_number: "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating case:", createError);
        return NextResponse.json(
          { error: "Failed to create case" },
          { status: 500 }
        );
      }

      targetCaseId = newCase.id;
    }

    // Map divorce intake data to case fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status: "pending_review",

      // Personal info (Petitioner)
      plaintiff_name: formData.personalInfo.fullLegalName,
      plaintiff_address: `${formData.personalInfo.currentAddress}, ${formData.personalInfo.city}, ${formData.personalInfo.state} ${formData.personalInfo.zipCode}`,

      // Spouse info (Respondent)
      defendant_name: formData.spouseInfo.fullLegalName,
      defendant_address: `${formData.spouseInfo.currentAddress}, ${formData.spouseInfo.city}, ${formData.spouseInfo.state} ${formData.spouseInfo.zipCode}`,
      defendant_type: "individual",

      // Location
      state: "AZ",
      county: formData.personalInfo.county,
      city: formData.personalInfo.city,

      // Case details
      sub_type: "divorce_no_children",
      incident_date: formData.marriageInfo.dateOfSeparation,

      // AI summary (generated from form data)
      ai_summary: generateDivorceSummary(formData),

      // Mark as ready for document generation
      complexity_score: calculateComplexity(formData),
      lawyer_recommended: shouldRecommendLawyer(formData),
    };

    // Update the case
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", targetCaseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      );
    }

    // Save intake session with full form data
    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: targetCaseId,
        current_step: "complete",
        collected_data: formData,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      caseId: targetCaseId,
      case: updatedCase,
      message: "Divorce intake saved successfully",
    });

  } catch (error) {
    console.error("Divorce intake error:", error);
    return NextResponse.json(
      { error: "Failed to save divorce intake" },
      { status: 500 }
    );
  }
}

/**
 * Generate a summary of the divorce case from form data
 */
function generateDivorceSummary(data: DivorceIntakeData): string {
  const parts: string[] = [];

  parts.push(`Petition for Dissolution of Marriage (No Children)`);
  parts.push(`Petitioner: ${data.personalInfo.fullLegalName}`);
  parts.push(`Respondent: ${data.spouseInfo.fullLegalName}`);
  parts.push(`Marriage Date: ${data.marriageInfo.dateOfMarriage}`);
  parts.push(`Separation Date: ${data.marriageInfo.dateOfSeparation}`);
  parts.push(`Filing County: ${data.personalInfo.county} County, Arizona`);

  // Property summary
  const propertyItems: string[] = [];
  if (data.hasRealEstate) propertyItems.push(`${data.realEstateProperties.length} real estate properties`);
  if (data.hasBankAccounts) propertyItems.push(`${data.bankAccounts.length} bank accounts`);
  if (data.hasRetirementAccounts) propertyItems.push(`${data.retirementAccounts.length} retirement accounts`);
  if (data.hasVehicles) propertyItems.push(`${data.vehicles.length} vehicles`);
  if (data.hasDebts) propertyItems.push(`${data.debts.length} debts to divide`);

  if (propertyItems.length > 0) {
    parts.push(`Community Property: ${propertyItems.join(", ")}`);
  }

  if (data.spousalMaintenance.isRequesting) {
    parts.push(`Spousal Maintenance: Requested by ${data.spousalMaintenance.requestingParty === "petitioner" ? "Petitioner" : "Respondent"}`);
  }

  return parts.join("\n");
}

/**
 * Calculate case complexity score (1-10)
 */
function calculateComplexity(data: DivorceIntakeData): number {
  let score = 2; // Base score for any divorce

  // Add complexity for assets
  if (data.hasRealEstate) score += data.realEstateProperties.length;
  if (data.hasBankAccounts && data.bankAccounts.length > 2) score += 1;
  if (data.hasRetirementAccounts) score += data.retirementAccounts.length;
  if (data.hasVehicles && data.vehicles.length > 2) score += 1;
  if (data.hasDebts && data.debts.length > 2) score += 1;
  if (data.separateProperty.hasSeparateProperty) score += 1;
  if (data.spousalMaintenance.isRequesting) score += 2;

  return Math.min(score, 10);
}

/**
 * Determine if a lawyer should be recommended
 */
function shouldRecommendLawyer(data: DivorceIntakeData): boolean {
  // Recommend lawyer for complex cases
  const totalRealEstateValue = data.realEstateProperties.reduce(
    (sum, p) => sum + p.estimatedValue, 0
  );
  const totalRetirementValue = data.retirementAccounts.reduce(
    (sum, a) => sum + a.approximateValue, 0
  );

  // Recommend lawyer if:
  // - High value real estate (over $500k)
  // - Multiple retirement accounts or high value (over $200k)
  // - Spousal maintenance is requested
  // - Complexity score is 7 or higher

  if (totalRealEstateValue > 500000) return true;
  if (totalRetirementValue > 200000) return true;
  if (data.spousalMaintenance.isRequesting) return true;
  if (calculateComplexity(data) >= 7) return true;

  return false;
}

/**
 * Handle chat-based divorce intake form data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDivorceChatIntake(
  supabase: any,
  userId: string,
  caseId: string | undefined,
  chatData: any
) {
  try {
    // Create new case if no caseId provided
    let targetCaseId = caseId;

    if (!targetCaseId) {
      // Create a new case for this divorce petition
      const { data: newCase, error: createError } = await supabase
        .from("cases")
        .insert({
          client_id: userId,
          case_type: "family_law",
          sub_type: "divorce_no_children",
          state: "AZ",
          county: chatData.county,
          city: "",
          status: "intake",
          case_number: "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating case:", createError);
        return NextResponse.json(
          { error: "Failed to create case" },
          { status: 500 }
        );
      }

      targetCaseId = newCase.id;
    }

    // Map chat data to case fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status: "pending_review",

      // Personal info (Petitioner)
      plaintiff_name: chatData.fullName,
      plaintiff_address: chatData.mailingAddress,

      // Spouse info (Respondent)
      defendant_name: chatData.spouseFullName,
      defendant_address: chatData.spouseMailingAddress,
      defendant_type: "individual",

      // Location
      state: "AZ",
      county: chatData.county,

      // Case details
      sub_type: "divorce_no_children",
      incident_date: chatData.dateOfMarriage,

      // AI summary (generated from chat data)
      ai_summary: generateChatDivorceSummary(chatData),

      // Complexity and recommendations
      complexity_score: calculateChatComplexity(chatData),
      lawyer_recommended: shouldRecommendLawyerChat(chatData),
    };

    // Update the case
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", targetCaseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      );
    }

    // Save intake session with full chat data
    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: targetCaseId,
        current_step: "complete",
        collected_data: chatData,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      caseId: targetCaseId,
      case: updatedCase,
      message: "Divorce chat intake saved successfully",
    });

  } catch (error) {
    console.error("Divorce chat intake error:", error);
    return NextResponse.json(
      { error: "Failed to save divorce chat intake" },
      { status: 500 }
    );
  }
}

/**
 * Generate summary from chat-based divorce data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateChatDivorceSummary(data: any): string {
  const parts: string[] = [];

  parts.push(`Petition for Dissolution of Marriage (No Children)`);
  parts.push(`Petitioner: ${data.fullName}`);
  parts.push(`Respondent: ${data.spouseFullName}`);
  parts.push(`Marriage Date: ${data.dateOfMarriage}`);
  parts.push(`Filing County: ${data.county} County, Arizona`);

  // Property summary
  const propertyItems: string[] = [];
  if (data.homes?.length > 0) propertyItems.push(`${data.homes.length} real estate properties`);
  if (data.bankAccounts?.length > 0) propertyItems.push(`${data.bankAccounts.length} bank accounts`);
  if (data.retirementAccounts?.length > 0) propertyItems.push(`${data.retirementAccounts.length} retirement accounts`);
  if (data.vehicles?.length > 0) propertyItems.push(`${data.vehicles.length} vehicles`);
  if (data.communityDebts?.length > 0) propertyItems.push(`${data.communityDebts.length} debts to divide`);

  if (propertyItems.length > 0) {
    parts.push(`Community Property: ${propertyItems.join(", ")}`);
  }

  if (data.maintenanceEntitlement && data.maintenanceEntitlement !== 'neither') {
    parts.push(`Spousal Maintenance: Requested by ${data.maintenanceEntitlement === "me" ? "Petitioner" : "Respondent"}`);
  }

  return parts.join("\n");
}

/**
 * Calculate complexity for chat-based intake
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateChatComplexity(data: any): number {
  let score = 2; // Base score

  if (data.homes?.length > 0) score += data.homes.length;
  if (data.bankAccounts?.length > 2) score += 1;
  if (data.retirementAccounts?.length > 0) score += data.retirementAccounts.length;
  if (data.vehicles?.length > 2) score += 1;
  if (data.communityDebts?.length > 2) score += 1;
  if (data.separateProperty?.length > 0) score += 1;
  if (data.maintenanceEntitlement && data.maintenanceEntitlement !== 'neither') score += 2;

  return Math.min(score, 10);
}

/**
 * Determine if lawyer should be recommended for chat intake
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldRecommendLawyerChat(data: any): boolean {
  if (data.maintenanceEntitlement && data.maintenanceEntitlement !== 'neither') return true;
  if (data.homes?.length > 1) return true;
  if (data.retirementAccounts?.length > 2) return true;
  if (calculateChatComplexity(data) >= 7) return true;

  return false;
}

/**
 * Handle chat-based divorce WITH children intake
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDivorceWithChildrenChatIntake(
  supabase: any,
  userId: string,
  caseId: string | undefined,
  chatData: any
) {
  try {
    let targetCaseId = caseId;

    if (!targetCaseId) {
      const { data: newCase, error: createError } = await supabase
        .from("cases")
        .insert({
          client_id: userId,
          case_type: "family_law",
          sub_type: "divorce_with_children",
          state: "AZ",
          county: chatData.county,
          city: "",
          status: "intake",
          case_number: "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating case:", createError);
        return NextResponse.json(
          { error: "Failed to create case" },
          { status: 500 }
        );
      }

      targetCaseId = newCase.id;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status: "pending_review",
      plaintiff_name: chatData.fullName,
      plaintiff_address: chatData.mailingAddress,
      defendant_name: chatData.spouseFullName,
      defendant_address: chatData.spouseMailingAddress,
      defendant_type: "individual",
      state: "AZ",
      county: chatData.county,
      sub_type: "divorce_with_children",
      incident_date: chatData.dateOfMarriage,
      ai_summary: generateWithChildrenChatSummary(chatData),
      complexity_score: calculateWithChildrenComplexity(chatData),
      lawyer_recommended: shouldRecommendLawyerWithChildren(chatData),
    };

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", targetCaseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      );
    }

    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: targetCaseId,
        current_step: "complete",
        collected_data: chatData,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      caseId: targetCaseId,
      case: updatedCase,
      message: "Divorce with children chat intake saved successfully",
    });

  } catch (error) {
    console.error("Divorce with children chat intake error:", error);
    return NextResponse.json(
      { error: "Failed to save divorce with children chat intake" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateWithChildrenChatSummary(data: any): string {
  const parts: string[] = [];

  parts.push(`Petition for Dissolution of Marriage (With Children)`);
  parts.push(`Petitioner: ${data.fullName}`);
  parts.push(`Respondent: ${data.spouseFullName}`);
  parts.push(`Marriage Date: ${data.dateOfMarriage}`);
  parts.push(`Filing County: ${data.county} County, Arizona`);

  if (data.children?.length > 0) {
    parts.push(`Minor Children: ${data.children.map((c: any) => c.name).join(", ")}`);
  }

  if (data.legalDecisionMaking) {
    parts.push(`Legal Decision-Making: ${data.legalDecisionMaking}`);
  }

  const propertyItems: string[] = [];
  if (data.homes?.length > 0) propertyItems.push(`${data.homes.length} real estate properties`);
  if (data.retirementAccounts?.length > 0) propertyItems.push(`${data.retirementAccounts.length} retirement accounts`);
  if (data.vehicles?.length > 0) propertyItems.push(`${data.vehicles.length} vehicles`);

  if (propertyItems.length > 0) {
    parts.push(`Community Property: ${propertyItems.join(", ")}`);
  }

  return parts.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateWithChildrenComplexity(data: any): number {
  let score = 4; // Higher base for cases with children

  if (data.children?.length > 2) score += 1;
  if (data.hasDomesticViolence) score += 2;
  if (data.homes?.length > 0) score += data.homes.length;
  if (data.retirementAccounts?.length > 0) score += data.retirementAccounts.length;
  if (data.vehicles?.length > 2) score += 1;
  if (data.maintenanceEntitlement && data.maintenanceEntitlement !== 'neither') score += 2;

  return Math.min(score, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldRecommendLawyerWithChildren(data: any): boolean {
  if (data.hasDomesticViolence) return true;
  if (data.maintenanceEntitlement && data.maintenanceEntitlement !== 'neither') return true;
  if (data.homes?.length > 1) return true;
  if (data.children?.length > 3) return true;
  if (calculateWithChildrenComplexity(data) >= 7) return true;

  return false;
}

/**
 * Handle chat-based paternity intake
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaternityChatIntake(
  supabase: any,
  userId: string,
  caseId: string | undefined,
  chatData: any
) {
  try {
    let targetCaseId = caseId;

    if (!targetCaseId) {
      const { data: newCase, error: createError } = await supabase
        .from("cases")
        .insert({
          client_id: userId,
          case_type: "family_law",
          sub_type: "establish_paternity",
          state: "AZ",
          county: chatData.county,
          city: "",
          status: "intake",
          case_number: "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating case:", createError);
        return NextResponse.json(
          { error: "Failed to create case" },
          { status: 500 }
        );
      }

      targetCaseId = newCase.id;
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status: "pending_review",
      plaintiff_name: chatData.fullName,
      plaintiff_address: chatData.mailingAddress,
      defendant_name: chatData.otherPartyFullName,
      defendant_address: chatData.otherPartyMailingAddress,
      defendant_type: "individual",
      state: "AZ",
      county: chatData.county,
      sub_type: "establish_paternity",
      ai_summary: generatePaternityChatSummary(chatData),
      complexity_score: calculatePaternityComplexity(chatData),
      lawyer_recommended: shouldRecommendLawyerPaternity(chatData),
    };

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", targetCaseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      );
    }

    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: targetCaseId,
        current_step: "complete",
        collected_data: chatData,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      caseId: targetCaseId,
      case: updatedCase,
      message: "Paternity chat intake saved successfully",
    });

  } catch (error) {
    console.error("Paternity chat intake error:", error);
    return NextResponse.json(
      { error: "Failed to save paternity chat intake" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generatePaternityChatSummary(data: any): string {
  const parts: string[] = [];

  parts.push(`Petition to Establish Paternity, Legal Decision Making, Parenting Time and Child Support`);
  parts.push(`Petitioner: ${data.fullName}`);
  parts.push(`Respondent: ${data.otherPartyFullName}`);
  parts.push(`Filing County: ${data.county} County, Arizona`);

  if (data.children?.length > 0) {
    parts.push(`Minor Children: ${data.children.map((c: any) => c.name).join(", ")}`);
  }

  if (data.biologicalFather) {
    parts.push(`Biological Father: ${data.biologicalFather === "me" ? data.fullName : data.otherPartyFullName}`);
  }

  if (data.legalDecisionMaking) {
    parts.push(`Legal Decision-Making: ${data.legalDecisionMaking.replace(/_/g, " ")}`);
  }

  if (data.parentingTimeSchedule) {
    parts.push(`Parenting Time: ${data.parentingTimeSchedule.replace(/_/g, " ")}`);
  }

  if (data.seekingChildSupport) {
    parts.push(`Child Support: Requested`);
  }

  if (data.hasDomesticViolence) {
    parts.push(`Domestic Violence: Reported`);
  }

  if (data.hasPriorCustodyCases && data.priorCustodyCases?.length > 0) {
    parts.push(`Prior Court Cases: ${data.priorCustodyCases.length}`);
  }

  return parts.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePaternityComplexity(data: any): number {
  let score = 3; // Base score for paternity cases

  if (data.children?.length > 2) score += 1;
  if (data.hasDomesticViolence) score += 1;
  if (data.hasExistingChildSupportOrder) score += 1;
  if (data.hasPriorCustodyCases && data.priorCustodyCases?.length > 1) score += 1;
  if (data.hasAffectingCourtActions) score += 1;
  if (data.hasOtherCustodyClaimants) score += 1;
  if (data.hasDrugConviction) score += 1;

  return Math.min(score, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shouldRecommendLawyerPaternity(data: any): boolean {
  if (data.hasDomesticViolence) return true;
  if (data.hasPriorCustodyCases && data.priorCustodyCases?.length > 1) return true;
  if (data.hasAffectingCourtActions) return true;
  if (data.hasOtherCustodyClaimants) return true;
  if (data.hasDrugConviction) return true;
  if (calculatePaternityComplexity(data) >= 6) return true;

  return false;
}

/**
 * Handle chat-based modification intake
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleModificationChatIntake(
  supabase: any,
  userId: string,
  caseId: string | undefined,
  chatData: any
) {
  try {
    let targetCaseId = caseId;

    if (!targetCaseId) {
      const { data: newCase, error: createError } = await supabase
        .from("cases")
        .insert({
          client_id: userId,
          case_type: "family_law",
          sub_type: "modification",
          state: "AZ",
          county: "",
          city: "",
          status: "intake",
          case_number: "",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating case:", createError);
        return NextResponse.json(
          { error: "Failed to create case" },
          { status: 500 }
        );
      }

      targetCaseId = newCase.id;
    }

    // Extract county from court name if available
    const courtName = chatData.ldm_courtName || chatData.pt_courtName || chatData.cs_courtName || '';
    const countyMatch = courtName.match(/^(.+?)\s+County/i);
    const county = countyMatch ? countyMatch[1] : '';

    const baseCaseNumber = chatData.caseNumber || "";

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      status: "pending_review",
      plaintiff_name: chatData.fullName,
      plaintiff_address: chatData.mailingAddress,
      defendant_name: chatData.otherPartyName,
      defendant_address: chatData.otherPartyAddress,
      defendant_type: "individual",
      state: "AZ",
      county: county,
      case_number: baseCaseNumber,
      sub_type: "modification",
      ai_summary: generateModificationChatSummary(chatData),
      complexity_score: 4,
      lawyer_recommended: false,
    };

    let updatedCase = null;
    let updateError = null;

    // Try with original case number first
    const result1 = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", targetCaseId)
      .select()
      .single();

    if (result1.error?.code === "23505") {
      // Duplicate case_number — append timestamp to make unique
      updateData.case_number = baseCaseNumber
        ? `${baseCaseNumber}-${Date.now().toString(36)}`
        : `MOD-${Date.now().toString(36)}`;
      const result2 = await supabase
        .from("cases")
        .update(updateData)
        .eq("id", targetCaseId)
        .select()
        .single();
      updatedCase = result2.data;
      updateError = result2.error;
    } else {
      updatedCase = result1.data;
      updateError = result1.error;
    }

    if (updateError) {
      console.error("Error updating case:", updateError);
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      );
    }

    const { error: sessionError } = await supabase
      .from("intake_sessions")
      .upsert({
        case_id: targetCaseId,
        current_step: "complete",
        collected_data: chatData,
        completed: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "case_id",
      });

    if (sessionError) {
      console.error("Error saving intake session:", sessionError);
    }

    return NextResponse.json({
      success: true,
      caseId: targetCaseId,
      case: updatedCase,
      message: "Modification chat intake saved successfully",
    });

  } catch (error) {
    console.error("Modification chat intake error:", error);
    return NextResponse.json(
      { error: "Failed to save modification chat intake" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateModificationChatSummary(data: any): string {
  const parts: string[] = [];

  parts.push("Petition to Modify Existing Court Orders");
  parts.push(`Filing Party: ${data.fullName} (${data.role === "petitioner" ? "Petitioner" : "Respondent"})`);
  parts.push(`Other Party: ${data.otherPartyName}`);
  parts.push(`Original Case Number: ${data.caseNumber}`);

  if (data.domesticatedCaseNumber) {
    parts.push(`Domesticated Case Number: ${data.domesticatedCaseNumber}`);
  }

  if (data.children?.length > 0) {
    parts.push(`Children: ${data.children.map((c: any) => c.name).join(", ")}`);
  }

  if (data.modificationsSelected?.length > 0) {
    const labels = data.modificationsSelected.map((m: string) =>
      m.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    );
    parts.push(`Modifications Requested: ${labels.join(", ")}`);
  }

  return parts.join("\n");
}
