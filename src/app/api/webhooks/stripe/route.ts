import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { caseId, userId, paymentType } = session.metadata || {};

        if (!caseId || !userId) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Record the payment
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            case_id: caseId,
            client_id: userId,
            amount: (session.amount_total || 0) / 100, // Convert from cents
            stripe_payment_id: session.payment_intent as string,
            status: "completed",
            payment_type: paymentType as "document_fee" | "lawyer_fee" | "filing_fee",
          });

        if (paymentError) {
          console.error("Error recording payment:", paymentError);
        }

        // Update case status if needed
        if (paymentType === "document_fee") {
          await supabase
            .from("cases")
            .update({ status: "document_ready" })
            .eq("id", caseId);
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { caseId, userId, paymentType } = paymentIntent.metadata || {};

        if (caseId && userId) {
          // Update payment status
          await supabase
            .from("payments")
            .update({ status: "completed" })
            .eq("stripe_payment_id", paymentIntent.id);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update payment status
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("stripe_payment_id", paymentIntent.id);

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        // Update payment status
        await supabase
          .from("payments")
          .update({ status: "refunded" })
          .eq("stripe_payment_id", charge.payment_intent as string);

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
