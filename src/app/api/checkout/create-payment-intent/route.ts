import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, isPaymentSuccessful } from "@/lib/stripe";
import { isStripeConfigured } from "@/lib/config";

// POST /api/checkout/create-payment-intent
// Body: { amountCents, currency, orderRef, email }
// Returns { clientSecret, configured }
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({
      configured: false,
      clientSecret: null,
    });
  }
  try {
    const { amountCents, currency = "EUR", orderRef = "", email = "" } = await request.json();
    if (!amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const paymentIntent = await createPaymentIntent({
      amountCents,
      currency,
      metadata: { order_ref: orderRef, email },
    });
    return NextResponse.json({
      configured: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("create-payment-intent error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Exported for the order verification helper
export { isPaymentSuccessful };