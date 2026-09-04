import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getPaymentIntent, isPaymentSuccessful } from "@/lib/stripe";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/config";

export interface CreateOrderBody {
  orderRef: string;
  paymentIntentId?: string; // present when Stripe is used
  devMode?: boolean; // only honored when Stripe is NOT configured (labeled dev)
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    apartment?: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  items: { productId: string; name: string; quantity: number; price: number }[];
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
}

/**
 * POST /api/orders — creates a real order in Supabase.
 *
 * Payment verification (server-side, never trusts the frontend):
 *  - Stripe mode: retrieves the PaymentIntent from Stripe and requires
 *    status succeeded/requires_capture before creating the order.
 *  - Dev mode: only possible when Stripe is NOT configured; stored with
 *    payment_status 'dev' and clearly visible as such in the admin panel.
 */
export async function POST(request: NextRequest) {
  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    orderRef,
    paymentIntentId,
    devMode,
    customer,
    items,
    shippingMethod,
    shippingCost,
    subtotal,
    total,
    paymentMethod,
  } = body;

  if (!orderRef || !customer?.email || !items?.length) {
    return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
  }

  let paymentStatus = "pending";

  // --- Stripe verification (real payments) ---
  if (isStripeConfigured()) {
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }
    try {
      const pi = await getPaymentIntent(paymentIntentId);
      if (!isPaymentSuccessful(pi)) {
        return NextResponse.json(
          { error: `Payment not successful (status: ${pi.status})` },
          { status: 402 }
        );
      }
      paymentStatus = "paid";
    } catch (err: any) {
      console.error("Payment verification failed:", err.message);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 402 });
    }
  } else if (!devMode) {
    return NextResponse.json(
      { error: "Stripe is not configured — no payment method available" },
      { status: 503 }
    );
  } else {
    paymentStatus = "dev"; // clearly labeled development-mode order
  }

  // --- Store in Supabase ---
  if (!isSupabaseConfigured()) {
    // No database configured: the checkout flow is still testable in dev,
    // but the order only persists once Supabase credentials are added.
    return NextResponse.json({ order: { order_number: orderRef }, dev: true });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // Upsert customer
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const { data: cust } = await db
    .from("customers")
    .upsert({ email: customer.email, first_name: customer.firstName, last_name: customer.lastName, phone: customer.phone || null }, { onConflict: "email" })
    .select("id")
    .single();

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      order_number: orderRef,
      customer_id: cust?.id || null,
      customer_name: fullName,
      email: customer.email,
      phone: customer.phone || null,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postalCode,
      country: customer.country || "Germany",
      items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
      shipping_method: shippingMethod,
      shipping_cost: shippingCost,
      subtotal,
      total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      stripe_payment_intent_id: paymentIntentId || null,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order insert failed:", orderError?.message);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }

  // Order items (normalized, used for analytics)
  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    quantity: i.quantity,
    price: i.price,
  }));
  const { error: itemsError } = await db.from("order_items").insert(orderItems);
  if (itemsError) console.error("order_items insert failed:", itemsError.message);

  // Purchase analytics events
  await db.from("analytics_events").insert(
    items.map((i) => ({ product_id: i.productId, event_type: "purchase" }))
  );

  return NextResponse.json({ order: { id: order.id, order_number: order.order_number } });
}