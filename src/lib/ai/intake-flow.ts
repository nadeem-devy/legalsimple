export const INTAKE_STEPS = [
  "welcome",
  "understand_problem",
  "classify_case_type",
  "identify_parties",
  "gather_timeline",
  "confirm_jurisdiction",
  "collect_facts",
  "assess_damages",
  "determine_outcome",
  "gather_evidence",
  "complexity_check",
  "confirm_summary",
  "generate_document",
] as const;

export type IntakeStep = (typeof INTAKE_STEPS)[number];

export interface IntakeData {
  currentStep: IntakeStep;
  caseType?: string;
  subType?: string;
  state?: string;
  county?: string;
  city?: string;
  plaintiffName?: string;
  plaintiffAddress?: string;
  defendantName?: string;
  defendantAddress?: string;
  defendantType?: "individual" | "business";
  incidentDate?: string;
  incidentDescription?: string;
  damagesAmount?: number;
  damagesDescription?: string;
  desiredOutcome?: string;
  evidenceDescription?: string;
  complexityScore?: number;
  lawyerRecommended?: boolean;
  summary?: string;
}

export function getNextStep(currentStep: IntakeStep): IntakeStep | null {
  const currentIndex = INTAKE_STEPS.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === INTAKE_STEPS.length - 1) {
    return null;
  }
  return INTAKE_STEPS[currentIndex + 1];
}

export function getPreviousStep(currentStep: IntakeStep): IntakeStep | null {
  const currentIndex = INTAKE_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return INTAKE_STEPS[currentIndex - 1];
}

export function getStepProgress(currentStep: IntakeStep): number {
  const currentIndex = INTAKE_STEPS.indexOf(currentStep);
  return Math.round(((currentIndex + 1) / INTAKE_STEPS.length) * 100);
}

export function isIntakeComplete(data: IntakeData): boolean {
  const requiredFields = [
    data.caseType,
    data.state,
    data.plaintiffName,
    data.incidentDescription,
    data.desiredOutcome,
  ];

  return requiredFields.every((field) => field !== undefined && field !== "");
}

export function getStepDisplayName(step: IntakeStep): string {
  const names: Record<IntakeStep, string> = {
    welcome: "Welcome",
    understand_problem: "Understanding Your Situation",
    classify_case_type: "Case Type",
    identify_parties: "Parties Involved",
    gather_timeline: "Timeline",
    confirm_jurisdiction: "Location",
    collect_facts: "What Happened",
    assess_damages: "Damages",
    determine_outcome: "Desired Outcome",
    gather_evidence: "Evidence",
    complexity_check: "Review",
    confirm_summary: "Confirmation",
    generate_document: "Document Generation",
  };

  return names[step];
}

export function extractDataFromMessage(
  message: string,
  currentStep: IntakeStep
): Partial<IntakeData> {
  const extracted: Partial<IntakeData> = {};

  // Extract state mentions
  const statePatterns: Record<string, string> = {
    "arizona|az|phoenix|tucson|scottsdale|mesa|chandler|tempe|glendale|gilbert": "AZ",
    "nevada|nv|las vegas|vegas|reno|henderson|north las vegas|sparks": "NV",
    "texas|tx|houston|dallas|austin|san antonio|fort worth|el paso|arlington": "TX",
  };

  const lowerMessage = message.toLowerCase();
  for (const [pattern, state] of Object.entries(statePatterns)) {
    if (new RegExp(pattern).test(lowerMessage)) {
      extracted.state = state;
      break;
    }
  }

  // Extract money amounts
  const moneyMatch = message.match(/\$[\d,]+(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD)/i);
  if (moneyMatch) {
    const amount = parseFloat(moneyMatch[0].replace(/[$,\s]|dollars?|USD/gi, ""));
    if (!isNaN(amount)) {
      extracted.damagesAmount = amount;
    }
  }

  // Extract dates
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,  // MM/DD/YYYY or MM-DD-YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s*(\d{4})/i,
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december),?\s*(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const dateMatch = message.match(pattern);
    if (dateMatch) {
      // Store the raw match for now - proper date parsing would happen on the backend
      extracted.incidentDate = dateMatch[0];
      break;
    }
  }

  return extracted;
}
