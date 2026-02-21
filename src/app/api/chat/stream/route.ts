import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/ai/prompts/system-prompt";
import { StateCode } from "@/config/states";
import { PracticeAreaCode } from "@/config/practice-areas";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { messages, caseId, userState, practiceArea } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      caseId?: string;
      userState?: StateCode;
      practiceArea?: PracticeAreaCode;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = getSystemPrompt(userState, practiceArea);

    // Store the user message if we have a case
    if (caseId) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === "user") {
        await supabase.from("chat_messages").insert({
          case_id: caseId,
          sender_type: "user",
          sender_id: user.id,
          content: lastUserMessage.content,
        });
      }
    }

    // Create the streaming response
    const encoder = new TextEncoder();
    let fullMessage = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const event of anthropicStream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const chunk = event.delta.text;
              fullMessage += chunk;

              // Send the chunk as a Server-Sent Event
              const data = JSON.stringify({ chunk });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Check for case data in the full message
          const jsonMatch = fullMessage.match(/```json\n([\s\S]*?)\n```/);
          let caseData = null;

          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1]);
              if (parsed.ready_to_generate && parsed.case_data) {
                caseData = parsed.case_data;
              }
            } catch {
              // JSON parsing failed
            }
          }

          // Store AI response if we have a case
          if (caseId) {
            const cleanMessage = fullMessage.replace(/```json\n[\s\S]*?\n```/, "").trim();
            await supabase.from("chat_messages").insert({
              case_id: caseId,
              sender_type: "ai",
              content: cleanMessage || fullMessage,
              metadata: caseData ? { caseData } : null,
            });

            // Update case if we have case data
            if (caseData) {
              await supabase
                .from("cases")
                .update({
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
                })
                .eq("id", caseId);
            }
          }

          // Send completion event
          const completionData = JSON.stringify({
            done: true,
            caseData,
            readyToGenerate: !!caseData,
          });
          controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorData = JSON.stringify({ error: "Streaming failed" });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
