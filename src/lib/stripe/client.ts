import Stripe from "stripe";

// Stripe client - lazy initialization to avoid build-time errors
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return stripeClient;
}

// Export for convenience (will error if STRIPE_SECRET_KEY is not set at runtime)
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const DOCUMENT_FEE = 2999; // $29.99 in cents
export const LAWYER_CONSULTATION_FEE = 9999; // $99.99 in cents

export interface CreateCheckoutSessionParams {
  caseId: string;
  userId: string;
  userEmail: string;
  paymentType: "document_fee" | "lawyer_fee" | "filing_fee";
  amount: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  caseId,
  userId,
  userEmail,
  paymentType,
  amount,
  description,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: description,
            description: `Case: ${caseId}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    metadata: {
      caseId,
      userId,
      paymentType,
    },
  });

  return session;
}

export async function createPaymentIntent({
  amount,
  caseId,
  userId,
  paymentType,
}: {
  amount: number;
  caseId: string;
  userId: string;
  paymentType: string;
}) {
  const paymentIntent = await getStripe().paymentIntents.create({
    amount,
    currency: "usd",
    metadata: {
      caseId,
      userId,
      paymentType,
    },
  });

  return paymentIntent;
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return getStripe().paymentIntents.retrieve(paymentIntentId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
