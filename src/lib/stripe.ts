import { stripeSecretKey, stripeWebhookSecret } from "@/lib/config";

/**
 * Minimal Stripe client built on fetch (the registry lacks @stripe/stripe-node).
 * Covers everything the store needs: Payment Intents, verification, webhooks.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/**
 * Flatten a nested object into Stripe's bracket-notation form fields.
 * { automatic_payment_methods: { enabled: true } }
 * → automatic_payment_methods[enabled]=true
 */
function flattenForStripe(obj: Record<string, any>, prefix = ""): [string, string][] {
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      entries.push(...flattenForStripe(value, fullKey));
    } else {
      entries.push([fullKey, String(value)]);
    }
  }
  return entries;
}

async function stripeFetch(path: string, params: Record<string, any>) {
  const body = new URLSearchParams(flattenForStripe(params));
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe API error ${res.status}: ${err}`);
  }
  return res.json();
}

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency: string;
  metadata: Record<string, string>;
}

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  return stripeFetch("/payment_intents", {
    amount: String(input.amountCents),
    currency: input.currency.toLowerCase(),
    "metadata[order_ref]": input.metadata.order_ref || "",
    "metadata[email]": input.metadata.email || "",
    automatic_payment_methods: { enabled: true, allow_redirects: "always" },
  });
}

export async function getPaymentIntent(id: string) {
  const res = await fetch(`${STRIPE_API}/payment_intents/${id}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  });
  if (!res.ok) throw new Error(`Stripe retrieve error ${res.status}`);
  return res.json();
}

export function isPaymentSuccessful(paymentIntent: {
  status: string;
  amount_received?: number;
}): boolean {
  return (
    paymentIntent.status === "succeeded" ||
    (paymentIntent.status === "requires_capture" &&
      (paymentIntent.amount_received || 0) > 0)
  );
}

/**
 * Verify a Stripe webhook signature (Stripe-Signature header + timestamp + HMAC).
 * Returns the parsed event, or throws on invalid signature.
 */
export async function verifyStripeWebhook(
  payload: string,
  signatureHeader: string
): Promise<any> {
  if (!stripeWebhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

  const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts["t"];
  const signatures = (parts["v1"] || "").split(" ");

  if (!timestamp || signatures.length === 0) {
    throw new Error("Invalid Stripe-Signature header");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = await crypto.subtle
    .importKey(
      "raw",
      new TextEncoder().encode(stripeWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    .then((key) => crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload)))
    .then((sig) => Buffer.from(sig).toString("hex"));

  if (!signatures.includes(expected)) {
    throw new Error("Webhook signature mismatch");
  }

  return JSON.parse(payload);
}