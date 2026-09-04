import { NextRequest, NextResponse } from "next/server";
import { verifyStripeWebhook } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

/**
 * POST /api/webhooks/stripe
 * Confirms payment server-side (independent of the frontend).
 * Stripe → Dashboard → Developers → Webhooks → endpoint http://<host>/api/webhooks/stripe
 * (In dev, use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.)
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: any;
  try {
    const payload = await request.text();
    event = await verifyStripeWebhook(payload, signature);
  } catch (err: any) {
    console.error("Webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  if (!db || !isSupabaseConfigured()) {
    return NextResponse.json({ received: true, dev: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const orderRef = pi.metadata?.order_ref;
    if (orderRef) {
      await db
        .from("orders")
        .update({ payment_status: "paid", status: "processing" })
        .eq("order_number", orderRef);
      console.log(`Webhook: order ${orderRef} marked paid`);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const orderRef = pi.metadata?.order_ref;
    if (orderRef) {
      await db.from("orders").update({ payment_status: "failed" }).eq("order_number", orderRef);
    }
  }

  return NextResponse.json({ received: true });
}