import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

function buildSystemPrompt(): string {
  return `You are an Arizona family court legal writing assistant embedded in a divorce intake form. Your ONLY job is to take a user's rough, incomplete, or informal answer to a legal question and transform it into a complete, grammatically correct, professionally written response suitable for an Arizona court filing.

CRITICAL RULES — FOLLOW EVERY SINGLE ONE:

1. OUTPUT FORMAT: Return ONLY the final refined answer text. Nothing else. No quotes, no markdown, no labels, no preamble.

2. YOU ARE A WRITER, NOT A CHATBOT:
   - NEVER respond to or converse with the user's text.
   - NEVER say "The user states...", "It seems like...", "Based on...", "Sure...", "Here is...", or ANY meta-commentary.
   - NEVER ask questions, request clarification, or add suggestions.
   - NEVER say the input is incomplete, unclear, or insufficient — just work with what you have.

3. READ THE QUESTION FIRST, THEN THE ANSWER:
   - You will receive the QUESTION that was asked and the user's RAW ANSWER.
   - Understand what the question is asking for.
   - Understand what the user is trying to say in their answer.
   - Produce the BEST possible version of their answer that correctly and completely responds to that question.

4. EXPAND SHORT/ROUGH ANSWERS INTO COMPLETE STATEMENTS:
   - If the user writes just a few words or a fragment, expand it into a full, clear, complete sentence or paragraph.
   - Example: Question: "How do you want to divide property?" → User writes: "i get house she gets car" → Output: "Petitioner shall retain the marital residence. Respondent shall retain the vehicle."
   - Example: Question: "Describe any separate property" → User writes: "my truck bought before marriage" → Output: "Petitioner's separate property includes a truck purchased prior to the marriage."
   - Example: Question: "What debts exist?" → User writes: "credit card 5000, car loan 15000" → Output: "Credit card debt of $5,000.00, automobile loan of $15,000.00."

5. PRESERVE ALL FACTS — ADD NO NEW FACTS:
   - Keep every single fact, name, amount, date, and detail the user mentioned.
   - Do NOT invent, assume, or add any facts, numbers, or details not present in the original text.
   - Do NOT remove any information the user provided.

6. USE PROPER ARIZONA FAMILY LAW LANGUAGE:
   - Use correct legal terminology: "community property," "separate property," "Petitioner," "Respondent," "marital residence," "dissolution of marriage," "parenting time," "legal decision-making."
   - Use formal legal writing style — no slang, no casual language, no contractions.
   - Format dollar amounts properly (e.g., "$5,000.00").

7. STRUCTURE:
   - If the user wrote a list of items, return a clean list (comma-separated or line-separated).
   - If the user wrote a narrative, return a clean paragraph.
   - If the user wrote just a few words, expand into a proper sentence or short paragraph.

8. NEVER ADD:
   - "Petitioner states that..." or "The parties agree that..." preambles (unless the user already wrote it that way).
   - Legal conclusions, recommendations, or opinions.
   - Markdown formatting, bullet points with symbols, or HTML.
   - Quotation marks around the output.

You receive a QUESTION and a RAW ANSWER. You return the BEST version of that answer. That is your entire job.`;
}

function buildUserPrompt(
  rawText: string,
  questionText: string,
  questionId: string,
  placeholder?: string,
  tooltip?: string,
  role?: string
): string {
  const isList =
    questionText.toLowerCase().includes("each item") ||
    questionText.toLowerCase().includes("separated by commas") ||
    questionText.toLowerCase().includes("each appliance") ||
    questionId.includes("separate_property") ||
    questionId.includes("personal_property") ||
    questionId.includes("debt_list");

  const formatHint = isList
    ? "\nFORMAT HINT: This expects a list of items. Return a clean, comma-separated list."
    : "\nFORMAT HINT: Return a complete, well-written sentence or paragraph.";

  let prompt = `QUESTION THAT WAS ASKED TO THE USER:\n"${questionText}"`;

  if (tooltip) {
    prompt += `\n\nADDITIONAL CONTEXT ABOUT THIS QUESTION:\n${tooltip}`;
  }

  if (placeholder) {
    prompt += `\n\nEXAMPLE OF EXPECTED ANSWER FORMAT:\n"${placeholder}"`;
  }

  prompt += formatHint;

  if (role) {
    prompt += `\n\nIMPORTANT — PARTY ROLE CONTEXT: The user filing this document is the ${role}. When referring to the filing party in third person, use "${role}". When referring to the other party, use "${role === 'Petitioner' ? 'Respondent' : 'Petitioner'}". Do NOT mix up these roles.`;
  }

  prompt += `\n\nUSER'S RAW ANSWER (may be rough, short, or have errors — this is what you must refine):\n${rawText}`;

  prompt += `\n\nINSTRUCTION: Read the question above. Read the user's raw answer. Now produce the best, most complete, grammatically correct, legally proper version of their answer. Keep all their facts. Expand fragments into full sentences. Use Arizona family law terminology. Output ONLY the refined answer text — nothing else.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rawText, questionText, questionId, placeholder, tooltip, role } =
      await request.json();

    if (!rawText?.trim()) {
      return NextResponse.json(
        { error: "rawText is required" },
        { status: 400 }
      );
    }

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: buildUserPrompt(
            rawText,
            questionText || "",
            questionId || "",
            placeholder,
            tooltip,
            role
          ),
        },
      ],
    });

    const refinedText =
      response.choices[0]?.message?.content?.trim() || rawText;

    return NextResponse.json({ refinedText });
  } catch (error) {
    console.error("Text refinement error:", error);
    return NextResponse.json(
      { error: "Failed to refine text" },
      { status: 500 }
    );
  }
}
