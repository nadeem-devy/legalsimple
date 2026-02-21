import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chat, ChatMessage, CaseData } from "@/lib/ai/chat-engine";
import { StateCode } from "@/config/states";
import { PracticeAreaCode } from "@/config/practice-areas";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messages, caseId, userState, practiceArea } = body as {
      messages: ChatMessage[];
      caseId?: string;
      userState?: StateCode;
      practiceArea?: PracticeAreaCode;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the AI response
    const response = await chat(messages, userState, practiceArea);

    // Store the user message and AI response in the database if we have a case
    if (caseId) {
      // Store user message (last one in the array)
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        await supabase.from("chat_messages").insert({
          case_id: caseId,
          sender_type: "user",
          sender_id: user.id,
          content: lastUserMessage.content,
        });
      }

      // Store AI response
      await supabase.from("chat_messages").insert({
        case_id: caseId,
        sender_type: "ai",
        content: response.message,
        metadata: response.caseData ? { caseData: response.caseData } : null,
      });

      // If we have case data, update the case
      if (response.caseData) {
        await updateCase(supabase, caseId, response.caseData);
      }
    }

    return NextResponse.json({
      message: response.message,
      caseData: response.caseData,
      readyToGenerate: response.readyToGenerate,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateCase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  caseId: string,
  caseData: CaseData
) {
  const updateData: Record<string, unknown> = {
    case_type: caseData.case_type,
    sub_type: caseData.sub_type,
    state: caseData.state,
    county: caseData.county,
    city: caseData.city,
    plaintiff_name: caseData.plaintiff_name,
    plaintiff_address: caseData.plaintiff_address,
    defendant_name: caseData.defendant_name,
    defendant_address: caseData.defendant_address,
    defendant_type: caseData.defendant_type,
    incident_date: caseData.incident_date,
    incident_description: caseData.incident_description,
    damages_amount: caseData.damages_amount,
    damages_description: caseData.damages_description,
    desired_outcome: caseData.desired_outcome,
    complexity_score: caseData.complexity_score,
    lawyer_recommended: caseData.lawyer_recommended,
    ai_summary: caseData.summary,
    status: "pending_review",
  };

  await supabase
    .from("cases")
    .update(updateData)
    .eq("id", caseId);
}
