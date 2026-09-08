"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  User,
  CreditCard,
  Truck,
  Check,
  ArrowLeft,
  Lock,
  Droplets,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/lib/store/cart";
import { useLanguageStore, useTranslatedText } from "@/lib/i18n/store";
import { formatPrice } from "@/lib/utils";
import { shippingMethods, paymentMethods } from "@/lib/utils";
import { CartItem } from "@/lib/types";

type Step = "info" | "shipping" | "payment" | "confirm";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2 (passed to Stripe billing details)
}

// Markets the store ships to (EU focus). Codes are ISO 3166-1 alpha-2.
const COUNTRIES: { code: string; name: string }[] = [
  { code: "DE", name: "Germany" },
  { code: "EE", name: "Estonia" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "FI", name: "Finland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "CZ", name: "Czechia" },
  { code: "SK", name: "Slovakia" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "SI", name: "Slovenia" },
  { code: "GR", name: "Greece" },
  { code: "LU", name: "Luxembourg" },
  { code: "CY", name: "Cyprus" },
  { code: "MT", name: "Malta" },
  { code: "CH", name: "Switzerland" },
  { code: "NO", name: "Norway" },
  { code: "IS", name: "Iceland" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

// Per-country postal code formats (light sanity check — catches typos early,
// while still accepting every valid format for the target markets).
const POSTAL_PATTERNS: Record<string, RegExp> = {
  DE: /^\d{5}$/,
  EE: /^\d{5}$/,
  LV: /^\d{4}$/,
  LT: /^(LT-\d{4}|\d{5})$/,
  FI: /^\d{5}$/,
  SE: /^\d{3}\s?\d{2}$/,
  DK: /^\d{4}$/,
  NL: /^\d{4}\s?[A-Za-z]{2}$/,
  BE: /^\d{4}$/,
  FR: /^\d{5}$/,
  ES: /^\d{5}$/,
  IT: /^\d{5}$/,
  AT: /^\d{4}$/,
  IE: /^[\dA-Za-z][\w\s-]{2,8}$/,
  PL: /^\d{2}-\d{3}$/,
  PT: /^\d{4}-?\d{0,3}$/,
  CZ: /^\d{3}\s?\d{2}$/,
  SK: /^\d{3}\s?\d{2}$/,
  HU: /^\d{4}$/,
  RO: /^\d{6}$/,
  BG: /^\d{4}$/,
  HR: /^\d{5}$/,
  SI: /^\d{4}$/,
  GR: /^\d{3}\s?\d{2}$/,
  LU: /^\d{4}$/,
  CY: /^\d{4}$/,
  MT: /^[A-Za-z]{3}\s?\d{0,4}$/,
  CH: /^\d{4}$/,
  NO: /^\d{4}$/,
  IS: /^\d{3}$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/,
  US: /^\d{5}(-\d{4})?$/,
};

function isValidPostal(code: string, countryCode: string): boolean {
  const pattern = POSTAL_PATTERNS[countryCode] || /^[\w][\w\s-]{1,9}$/; // lenient fallback for unlisted countries
  return pattern.test(code.trim());
}

// Example postal codes shown in the validation hint (per country).
const POSTAL_EXAMPLES: Record<string, string> = {
  DE: "10115",
  EE: "10111",
  LV: "LV-1001",
  LT: "LT-01101",
  FI: "00100",
  SE: "114 55",
  DK: "1050",
  NL: "1012 AB",
  BE: "1000",
  FR: "75001",
  ES: "28001",
  IT: "00100",
  AT: "1010",
  IE: "D02 XY45",
  PL: "00-001",
  PT: "1000-001",
  CZ: "110 00",
  SK: "811 01",
  HU: "1011",
  RO: "010011",
  BG: "1000",
  HR: "10000",
  SI: "1000",
  GR: "104 31",
  LU: "1111",
  CY: "1010",
  MT: "VLT 1117",
  CH: "8001",
  NO: "0150",
  IS: "101",
  GB: "SW1A 1AA",
  US: "10001",
};

interface StripeConfig {
  configured: boolean;
  clientSecret: string | null;
  paymentIntentId?: string;
}

export default function CheckoutPage() {
  const t = useLanguageStore((s) => s.t);
  const cartEmptyText = useTranslatedText("Your cart is empty");
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: "Germany",
    countryCode: "DE",
  });
  const [postalError, setPostalError] = useState<string | null>(null);
  const [stripeConfig, setStripeConfig] = useState<StripeConfig | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  // One order reference shared by the PaymentIntent metadata and the order
  // record, so the Stripe webhook can match the payment to the order.
  const orderRefRef = useRef<string | null>(null);
  const getOrderRef = () => {
    if (!orderRefRef.current) {
      orderRefRef.current = `CP-${Date.now().toString(36).toUpperCase()}`;
    }
    return orderRefRef.current;
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0].id);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const shippingCost = shippingMethods.find((m) => m.id === selectedShipping)?.price || 0;
  const total = subtotal + shippingCost;

  // Create the Stripe PaymentIntent when the customer reaches payment
  useEffect(() => {
    if ((step === "payment" || step === "confirm") && !stripeConfig) {
      fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(total * 100),
          currency: "EUR",
          orderRef: getOrderRef(),
          email: customer.email,
        }),
      })
        .then((r) => r.json())
        .then(setStripeConfig)
        .catch(() => setStripeConfig({ configured: false, clientSecret: null }));
    }
  }, [step, stripeConfig, total, customer.email]);

  // Server-verified order placement (called from the Confirm step)
  const placeOrder = async (paymentIntentId?: string) => {
    setPlacing(true);
    setPlaceError(null);
    try {
      const orderRef = getOrderRef();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef,
          paymentIntentId,
          devMode: !stripeConfig?.configured,
          customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            apartment: customer.apartment,
            city: customer.city,
            postalCode: customer.postalCode,
            country: customer.country,
          },
          items: items.map((i) => ({
            productId: i.product.id,
            name: t(i.product.nameKey),
            quantity: i.quantity,
            price: i.product.price,
          })),
          shippingMethod: selectedShipping,
          shippingCost,
          subtotal,
          total,
          paymentMethod: selectedPayment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      clearCart();
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.order_number)}`);
    } catch (err: any) {
      setPlaceError(err.message || "Something went wrong");
      setPlacing(false);
    }
  };

  const steps: { id: Step; labelKey: string; icon: typeof User }[] = [
    { id: "info", labelKey: "checkout.shippingInfo", icon: User },
    { id: "shipping", labelKey: "checkout.shippingMethod", icon: Truck },
    { id: "payment", labelKey: "checkout.paymentMethod", icon: CreditCard },
    { id: "confirm", labelKey: "checkout.reviewOrder", icon: Check },
  ];

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-cream min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-muted mb-4">{cartEmptyText}</p>
            <Link href="/catalog" className="text-gold hover:text-gold-dark transition-colors">
              {t("cart.continueShopping")}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("cart.title")}
          </Link>

          {/* Step indicators */}
          <div className="flex items-center gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2">
            {steps.map((s, i) => {
              const isActive = steps.findIndex((x) => x.id === step) >= i;
              return (
                <div key={s.id} className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const currentIdx = steps.findIndex((x) => x.id === step);
                      if (i <= currentIdx) setStep(s.id);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all ${
                      s.id === step
                        ? "bg-gold text-foreground font-medium"
                        : isActive
                        ? "bg-gold/10 text-gold"
                        : "text-muted"
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(s.labelKey)}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-[1px] ${isActive ? "bg-gold" : "bg-warm-beige"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-warm-beige/30 p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {step === "info" && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <h2 className="font-serif text-xl text-foreground mb-2">{t("checkout.guestCheckout")}</h2>
                      <p className="text-sm text-muted mb-6">{t("checkout.orLogin")}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.firstName")}</label>
                          <input type="text" value={customer.firstName} onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.lastName")}</label>
                          <input type="text" value={customer.lastName} onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.email")}</label>
                        <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.phone")}</label>
                        <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.address")}</label>
                        <input type="text" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.apartment")}</label>
                        <input type="text" value={customer.apartment} onChange={(e) => setCustomer({ ...customer, apartment: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.city")}</label>
                          <input type="text" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.postalCode")}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            value={customer.postalCode}
                            onChange={(e) => {
                              setCustomer({ ...customer, postalCode: e.target.value });
                              if (postalError) setPostalError(null);
                            }}
                            className={`w-full px-4 py-3 bg-cream border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                              postalError
                                ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                                : "border-warm-beige focus:border-gold/50 focus:ring-gold/20"
                            }`}
                          />
                          {postalError && <p className="text-xs text-red-600 mt-1.5">{postalError}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-foreground/70 mb-1.5">{t("checkout.country")}</label>
                        <select
                          value={customer.countryCode}
                          onChange={(e) => {
                            const c = COUNTRIES.find((x) => x.code === e.target.value);
                            setCustomer({ ...customer, countryCode: e.target.value, country: c ? c.name : customer.country });
                            if (postalError) setPostalError(null);
                          }}
                          className="w-full px-4 py-3 bg-cream border border-warm-beige rounded-xl text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const code = customer.postalCode.trim();
                          if (!isValidPostal(code, customer.countryCode)) {
                            setPostalError(
                              t("checkout.postalInvalid").replace("{example}", POSTAL_EXAMPLES[customer.countryCode] || "12345")
                            );
                            return;
                          }
                          setPostalError(null);
                          setStep("shipping");
                        }}
                        className="w-full py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all text-sm"
                      >
                        {t("checkout.shippingMethod")}
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "shipping" && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h2 className="font-serif text-xl text-foreground mb-4">{t("checkout.shippingMethod")}</h2>
                      {shippingMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedShipping(method.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                            selectedShipping === method.id
                              ? "border-gold bg-gold/5"
                              : "border-warm-beige hover:border-gold/30"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">{method.name}</p>
                            <p className="text-xs text-muted mt-0.5">{t(method.descriptionKey)}</p>
                            <p className="text-xs text-muted mt-0.5">{method.estimatedDays}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm text-foreground">
                              {method.price === 0 ? t("shipping.free") : formatPrice(method.price)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                      <div className="flex gap-3 pt-4">
                        <button onClick={() => setStep("info")} className="px-6 py-3 border border-warm-beige rounded-full text-sm text-muted hover:text-foreground transition-colors">
                          {t("common.back")}
                        </button>
                        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep("payment")} className="flex-1 py-3 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all text-sm">
                          {t("checkout.paymentMethod")}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {step === "payment" && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h2 className="font-serif text-xl text-foreground mb-4">{t("checkout.paymentMethod")}</h2>
                      {paymentMethods.map((method) => (
                        <motion.button
                          key={method.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                            selectedPayment === method.id
                              ? "border-gold bg-gold/5"
                              : "border-warm-beige hover:border-gold/30"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">{method.name}</p>
                            <p className="text-xs text-muted mt-0.5">{method.description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === method.id ? "border-gold" : "border-warm-beige"}`}>
                            {selectedPayment === method.id && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                          </div>
                        </motion.button>
                      ))}

                      {stripeConfig === null ? (
                        <div className="p-4 bg-cream rounded-xl text-sm text-muted">Loading payment methods…</div>
                      ) : !stripeConfig.configured ? (
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800 flex gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Stripe is not configured on this deployment. Add <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> and <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to Vercel environment variables to enable real card payments.
                          </span>
                        </div>
                      ) : null}
                    </motion.div>
                  )}

                  {step === "confirm" && (
                    <ConfirmStep
                      items={items}
                      placing={placing}
                      placeError={placeError}
                      stripeConfigured={!!(stripeConfig?.configured && stripeConfig.clientSecret)}
                      onBack={() => setStep("payment")}
                      onPlace={async (paymentIntentId?: string) => {
                        await placeOrder(paymentIntentId);
                      }}
                      onStripeError={(msg) => setPlaceError(msg)}
                    />
                  )}
                </AnimatePresence>

                {/* Stripe Elements — mounted at page level and kept alive across
                    the payment and review steps so confirmPayment() can run from
                    "Place Order" with the same Elements instance. */}
                {stripeConfig?.configured && stripeConfig.clientSecret ? (
                  <div className={step === "payment" ? "mt-4" : "hidden"}>
                    <StripeElementsWrap
                      clientSecret={stripeConfig.clientSecret}
                      billing={{
                        name: `${customer.firstName} ${customer.lastName}`.trim(),
                        email: customer.email,
                        phone: customer.phone || null,
                        address: {
                          line1: customer.address,
                          line2: customer.apartment || null,
                          city: customer.city,
                          postal_code: customer.postalCode,
                          state: "", // DE/EE and most EU countries have no state field
                          country: customer.countryCode,
                        },
                      }}
                    />
                  </div>
                ) : null}

                {step === "payment" && (
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep("shipping")} className="px-6 py-3 border border-warm-beige rounded-full text-sm text-muted hover:text-foreground transition-colors">
                      {t("common.back")}
                    </button>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep("confirm")} className="flex-1 py-3 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all text-sm">
                      {t("checkout.reviewOrder")}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-warm-beige/30 p-6 space-y-4">
                <h3 className="font-serif text-lg text-foreground">{t("checkout.orderSummary")}</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto" data-lenis-prevent>
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream-dark rounded-lg overflow-hidden relative flex-shrink-0">
                        {item.product.images[0] ? (
                          <Image src={item.product.images[0].src} alt={item.product.images[0].alt} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.product.category === "soaps" ? <Droplets className="w-4 h-4 text-gold/40" /> : <Sparkles className="w-4 h-4 text-gold/40" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{t(item.product.nameKey)}</p>
                        <p className="text-xs text-muted">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-medium text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-warm-beige/50 pt-4">
                  <div className="flex justify-between text-muted">
                    <span>{t("cart.subtotal")}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>{t("cart.shipping")}</span>
                    <span>{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-warm-beige/50">
                    <span>{t("cart.total")}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ---------- Stripe Elements wrapper (real card form when configured) ----------
function StripeElementsWrap({
  clientSecret,
  billing,
}: {
  clientSecret: string;
  billing: {
    name: string;
    email: string;
    phone: string | null;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      postal_code: string;
      state: string;
      country: string;
    };
  } | null;
}) {
  const [stripePromise] = useState<Promise<Stripe | null>>(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")
  );

  // Brand-aligned appearance config for the Stripe card form
  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#92651f", // gold brand color
      colorBackground: "#ffffff",
      colorText: "#1a1a1a",
      colorDanger: "#dc2626",
      fontFamily: "Georgia, 'Times New Roman', serif",
      spacingUnit: "8px",
      borderRadius: "12px",
    },
    rules: {
      ".Input": {
        border: "1px solid #e0d5c1",
        padding: "14px 16px",
        fontSize: "15px",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #92651f",
        boxShadow: "0 0 0 1px rgba(146, 101, 31, 0.15)",
      },
      ".Label": {
        fontSize: "13px",
        fontWeight: "500",
        color: "#666666",
      },
      // Note: only selectors officially supported by Stripe's appearance API
      // are allowed here — unsupported ones (e.g. ".Tab.content.active",
      // ".Message.error") produce console warnings and are intentionally omitted.
    },
  } as any;

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
    >
      <PaymentElementHost billing={billing} />
    </Elements>
  );
}

function PaymentElementHost({
  billing,
}: {
  billing: {
    name: string;
    email: string;
    phone: string | null;
    address: {
      line1: string;
      line2: string | null;
      city: string;
      postal_code: string;
      state: string;
      country: string;
    };
  } | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
    stripeConfirmRef = async () => {
      if (!stripe || !elements) return { error: "Payment is still loading. Please wait." };
      // With fields.billingDetails "never", Stripe requires the COMPLETE
      // billing_details object here — every address key present, including
      // state (empty string is valid for DE/EE where states don't apply).
      const billing_details = {
        name: billing?.name || "",
        email: billing?.email || "",
        phone: billing?.phone || "",
        address: {
          line1: billing?.address.line1 || "",
          line2: billing?.address.line2 || "",
          city: billing?.address.city || "",
          postal_code: billing?.address.postal_code || "",
          state: billing?.address.state || "",
          country: billing?.address.country || "DE",
        },
      };
      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + "/checkout",
            // Explicit EU billing details — Stripe applies the correct
            // postal-code rules for the chosen country (DE/EE = 5 digits).
            payment_method_data: { billing_details },
          },
          redirect: "if_required",
        });
        if (error) return { error: error.message };
        return { paymentIntentId: paymentIntent?.id };
      } catch (err: any) {
        // Surface Stripe IntegrationErrors as a friendly message instead of
        // an unhandled promise rejection.
        console.error("Stripe confirmPayment failed:", err?.message);
        return {
          error:
            "We could not process the payment. Please check your details and try again, or contact support if the problem persists.",
        };
      }
    };
    return () => {
      stripeConfirmRef = null;
    };
  }, [stripe, elements, billing]);
  return (
    <div className="mt-4">
      <PaymentElement
        options={{
          layout: "tabs",
          // We collect the billing address ourselves (with the correct EU
          // country) — Stripe's own Country/ZIP fields are hidden. Without
          // this, the Payment Element defaults to US-style ZIP validation
          // and rejects valid European postal codes.
          fields: { billingDetails: "never" },
          ...(billing
            ? {
                defaultValues: {
                  billingDetails: {
                    name: billing.name,
                    email: billing.email,
                    address: {
                      country: billing.address.country,
                      postal_code: billing.address.postal_code,
                      city: billing.address.city,
                      line1: billing.address.line1,
                      state: billing.address.state,
                    },
                  },
                },
              }
            : {}),
        }}
      />
    </div>
  );
}

// Module-level bridge: the Confirm step triggers Stripe confirmation
let stripeConfirmRef: (() => Promise<{ paymentIntentId?: string; error?: string }>) | null = null;

// ---------- Confirm step ----------
function ConfirmStep({
  items,
  placing,
  placeError,
  stripeConfigured,
  onBack,
  onPlace,
  onStripeError,
}: {
  items: CartItem[];
  placing: boolean;
  placeError: string | null;
  stripeConfigured: boolean;
  onBack: () => void;
  onPlace: (paymentIntentId?: string) => Promise<void>;
  onStripeError: (msg: string) => void;
}) {
  const t = useLanguageStore((s) => s.t);

  const handlePlace = async () => {
    if (stripeConfigured) {
      if (!stripeConfirmRef) {
        onStripeError("Payment form is still loading. Please go back to the payment step and try again.");
        return;
      }
      const result = await stripeConfirmRef();
      if (result.error) {
        onStripeError(result.error);
        return;
      }
      await onPlace(result.paymentIntentId);
    } else {
      await onPlace(undefined);
    }
  };

  return (
    <motion.div
      key="confirm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <h2 className="font-serif text-xl text-foreground mb-4">{t("checkout.reviewOrder")}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl">
            <div className="w-12 h-12 bg-cream-dark rounded-lg overflow-hidden relative flex-shrink-0">
              {item.product.images[0] ? (
                <Image src={item.product.images[0].src} alt={item.product.images[0].alt} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {item.product.category === "soaps" ? <Droplets className="w-5 h-5 text-gold/40" /> : <Sparkles className="w-5 h-5 text-gold/40" />}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{t(item.product.nameKey)}</p>
              <p className="text-xs text-muted">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      {placeError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{placeError}</p>
      )}
      <div className="flex gap-3 pt-4">
        <button onClick={onBack} className="px-6 py-3 border border-warm-beige rounded-full text-sm text-muted hover:text-foreground transition-colors">
          {t("common.back")}
        </button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={placing}
          onClick={handlePlace}
          className="flex-1 py-3.5 bg-gold hover:bg-gold-light text-foreground font-medium rounded-full transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Lock className="w-4 h-4" />
          {placing ? "Processing…" : t("checkout.placeOrder")}
        </motion.button>
      </div>
    </motion.div>
  );
}
