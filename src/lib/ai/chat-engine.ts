import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "./prompts/system-prompt";
import { StateCode } from "@/config/states";
import { PracticeAreaCode } from "@/config/practice-areas";

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  caseData?: CaseData;
  readyToGenerate: boolean;
}

export interface CaseData {
  case_type: PracticeAreaCode;
  sub_type: string;
  state: StateCode;
  county: string;
  city: string;
  plaintiff_name: string;
  plaintiff_address: string;
  defendant_name: string;
  defendant_address: string;
  defendant_type: "individual" | "business";
  incident_date: string;
  incident_description: string;
  damages_amount: number | null;
  damages_description: string;
  desired_outcome: string;
  evidence_description: string;
  complexity_score: number;
  lawyer_recommended: boolean;
  summary: string;
}

export async function chat(
  messages: ChatMessage[],
  userState?: StateCode,
  practiceArea?: PracticeAreaCode
): Promise<ChatResponse> {
  const systemPrompt = getSystemPrompt(userState, practiceArea);

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const assistantMessage = response.content[0].type === "text"
    ? response.content[0].text
    : "";

  // Check if the response contains case data ready for document generation
  const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.ready_to_generate && parsed.case_data) {
        // Remove the JSON block from the message
        const cleanMessage = assistantMessage.replace(/```json\n[\s\S]*?\n```/, "").trim();
        return {
          message: cleanMessage || "Great! I have all the information I need. Let me generate your document.",
          caseData: parsed.case_data as CaseData,
          readyToGenerate: true,
        };
      }
    } catch {
      // JSON parsing failed, continue with normal message
    }
  }

  return {
    message: assistantMessage,
    readyToGenerate: false,
  };
}

export async function streamChat(
  messages: ChatMessage[],
  userState?: StateCode,
  practiceArea?: PracticeAreaCode,
  onChunk: (chunk: string) => void = () => {}
): Promise<ChatResponse> {
  const systemPrompt = getSystemPrompt(userState, practiceArea);

  let fullMessage = "";

  const stream = getAnthropic().messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      const chunk = event.delta.text;
      fullMessage += chunk;
      onChunk(chunk);
    }
  }

  // Check if the response contains case data
  const jsonMatch = fullMessage.match(/```json\n([\s\S]*?)\n```/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.ready_to_generate && parsed.case_data) {
        const cleanMessage = fullMessage.replace(/```json\n[\s\S]*?\n```/, "").trim();
        return {
          message: cleanMessage || "Great! I have all the information I need. Let me generate your document.",
          caseData: parsed.case_data as CaseData,
          readyToGenerate: true,
        };
      }
    } catch {
      // JSON parsing failed
    }
  }

  return {
    message: fullMessage,
    readyToGenerate: false,
  };
}

export function extractCaseTypeFromMessage(message: string): PracticeAreaCode | null {
  const lowerMessage = message.toLowerCase();

  // Family Law keywords
  const familyKeywords = [
    "divorce", "custody", "child support", "alimony", "separation",
    "marriage", "spouse", "husband", "wife", "children", "kids",
    "adoption", "paternity", "domestic", "visitation", "parenting"
  ];

  // Personal Injury keywords
  const injuryKeywords = [
    "accident", "injury", "injured", "hurt", "car crash", "slip",
    "fall", "medical", "malpractice", "negligence", "compensation",
    "damages", "pain", "suffering", "collision", "workplace"
  ];

  // Estate Planning keywords
  const estateKeywords = [
    "will", "testament", "trust", "estate", "inheritance", "heir",
    "beneficiary", "power of attorney", "healthcare directive",
    "living will", "probate", "assets", "death", "passed away"
  ];

  const familyCount = familyKeywords.filter(k => lowerMessage.includes(k)).length;
  const injuryCount = injuryKeywords.filter(k => lowerMessage.includes(k)).length;
  const estateCount = estateKeywords.filter(k => lowerMessage.includes(k)).length;

  if (familyCount > injuryCount && familyCount > estateCount && familyCount > 0) {
    return "family_law";
  }
  if (injuryCount > familyCount && injuryCount > estateCount && injuryCount > 0) {
    return "personal_injury";
  }
  if (estateCount > familyCount && estateCount > injuryCount && estateCount > 0) {
    return "estate_planning";
  }

  return null;
}

export function assessComplexity(caseData: Partial<CaseData>): number {
  let score = 1;

  // High damages increase complexity
  if (caseData.damages_amount) {
    if (caseData.damages_amount > 100000) score += 3;
    else if (caseData.damages_amount > 50000) score += 2;
    else if (caseData.damages_amount > 10000) score += 1;
  }

  // Business defendants are more complex
  if (caseData.defendant_type === "business") score += 1;

  // Certain case types are inherently more complex
  if (caseData.sub_type) {
    const complexSubTypes = [
      "medical_malpractice", "product_liability", "domestic_violence",
      "contested_custody", "living_trust", "adoption"
    ];
    if (complexSubTypes.includes(caseData.sub_type)) score += 2;
  }

  // Long descriptions suggest complexity
  if (caseData.incident_description && caseData.incident_description.length > 1000) {
    score += 1;
  }

  return Math.min(score, 10);
}
