import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, DOCUMENT_FEE } from "@/lib/stripe/client";

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
    const { caseId, paymentType } = body;

    if (!caseId || !paymentType) {
      return NextResponse.json(
        { error: "Case ID and payment type are required" },
        { status: 400 }
      );
    }

    // Verify the case belongs to the user
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("client_id", user.id)
      .single();

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    // Determine amount based on payment type
    let amount = DOCUMENT_FEE;
    let description = "Document Generation Fee";

    if (paymentType === "lawyer_fee") {
      // Get the quoted fee from lawyer request
      const { data: lawyerRequest } = await supabase
        .from("lawyer_requests")
        .select("quoted_fee")
        .eq("case_id", caseId)
        .eq("status", "accepted")
        .single();

      if (lawyerRequest?.quoted_fee) {
        amount = Math.round(lawyerRequest.quoted_fee * 100); // Convert to cents
        description = "Lawyer Consultation Fee";
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createCheckoutSession({
      caseId,
      userId: user.id,
      userEmail: user.email!,
      paymentType,
      amount,
      description,
      successUrl: `${baseUrl}/cases/${caseId}?payment=success`,
      cancelUrl: `${baseUrl}/cases/${caseId}?payment=cancelled`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Payment checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
