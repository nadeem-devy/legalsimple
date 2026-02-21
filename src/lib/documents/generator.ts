import Anthropic from "@anthropic-ai/sdk";
import { Case } from "@/types/database";
import { SUPPORTED_STATES, getCourtName } from "@/config/states";
import { PRACTICE_AREAS, getDocumentTypeName } from "@/config/practice-areas";
import { format } from "date-fns";

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

export async function generateDocument(
  caseData: Case,
  documentType: string
): Promise<string> {
  const stateConfig = SUPPORTED_STATES[caseData.state as keyof typeof SUPPORTED_STATES];
  const practiceArea = PRACTICE_AREAS[caseData.case_type as keyof typeof PRACTICE_AREAS];
  const courtName = getCourtName(caseData.state as "AZ" | "NV" | "TX", caseData.case_type);
  const documentTitle = getDocumentTypeName(documentType);

  const systemPrompt = `You are a legal document generator. Generate professional, court-ready legal documents that follow proper formatting and legal standards.

IMPORTANT GUIDELINES:
1. Use proper legal formatting with numbered paragraphs
2. Include appropriate court headers for ${stateConfig.name}
3. Use correct terminology for ${stateConfig.name} courts
4. Reference appropriate statutes: ${stateConfig.statutes[caseData.case_type.replace('_', '') as keyof typeof stateConfig.statutes] || 'applicable state law'}
5. Include all required sections for this document type
6. Use professional legal language
7. Include signature blocks and date lines
8. Add proper case caption

Generate the document in a clean, readable format.`;

  const prompt = `Generate a ${documentTitle} for the following case:

**COURT INFORMATION:**
- Court: ${courtName}
- State: ${stateConfig.fullName}
- County: ${caseData.county || "[COUNTY]"}

**CASE INFORMATION:**
- Case Number: ${caseData.case_number}
- Case Type: ${practiceArea.name}
- Sub-Type: ${caseData.sub_type?.replace(/_/g, " ") || "General"}

**PLAINTIFF:**
- Name: ${caseData.plaintiff_name || "[PLAINTIFF NAME]"}
- Address: ${caseData.plaintiff_address || "[PLAINTIFF ADDRESS]"}

**DEFENDANT:**
- Name: ${caseData.defendant_name || "[DEFENDANT NAME]"}
- Address: ${caseData.defendant_address || "[DEFENDANT ADDRESS]"}
- Type: ${caseData.defendant_type || "Individual"}

**INCIDENT DETAILS:**
- Date: ${caseData.incident_date ? format(new Date(caseData.incident_date), "MMMM d, yyyy") : "[DATE]"}
- Description: ${caseData.incident_description || "[INCIDENT DESCRIPTION]"}

**DAMAGES:**
- Amount Claimed: ${caseData.damages_amount ? `$${caseData.damages_amount.toLocaleString()}` : "[AMOUNT]"}
- Description: ${caseData.damages_description || "[DAMAGES DESCRIPTION]"}

**RELIEF SOUGHT:**
${caseData.desired_outcome || "[DESIRED OUTCOME]"}

Generate a complete, properly formatted ${documentTitle} document ready for filing.`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  return content;
}

// Template-based document generation for common forms
export function generateTemplateDocument(
  caseData: Case,
  documentType: string
): string {
  const stateConfig = SUPPORTED_STATES[caseData.state as keyof typeof SUPPORTED_STATES];
  const courtName = getCourtName(caseData.state as "AZ" | "NV" | "TX", caseData.case_type);
  const today = format(new Date(), "MMMM d, yyyy");

  // Basic template structure
  const header = `
${stateConfig.fullName.toUpperCase()}
${courtName.toUpperCase()}
${caseData.county ? `${caseData.county.toUpperCase()} COUNTY` : ""}

${caseData.plaintiff_name || "[PLAINTIFF NAME]"},
    Plaintiff,

vs.                                         Case No.: ${caseData.case_number}

${caseData.defendant_name || "[DEFENDANT NAME]"},
    Defendant.

────────────────────────────────────────────────────────────────────────────
`;

  const signature = `
────────────────────────────────────────────────────────────────────────────

VERIFICATION

I, ${caseData.plaintiff_name || "[PLAINTIFF NAME]"}, declare under penalty of perjury under
the laws of the ${stateConfig.fullName} that the foregoing is true and correct.

Executed on: ____________________

                                        ________________________________
                                        ${caseData.plaintiff_name || "[PLAINTIFF NAME]"}
                                        ${caseData.plaintiff_address || "[ADDRESS]"}

────────────────────────────────────────────────────────────────────────────

CERTIFICATE OF SERVICE

I hereby certify that on ${today}, I served a copy of this document on
the Defendant at the following address:

${caseData.defendant_name || "[DEFENDANT NAME]"}
${caseData.defendant_address || "[ADDRESS]"}

                                        ________________________________
                                        Signature
`;

  return `${header}\n\n[DOCUMENT CONTENT WILL BE GENERATED]\n\n${signature}`;
}
