import { ShippingMethod, PaymentMethod } from "./types";

export function formatPrice(price: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(price);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: "omniva",
    name: "Omniva Parcel",
    carrier: "Omniva",
    estimatedDays: "3-5 business days",
    price: 3.90,
    descriptionKey: "shipping.omnivaDesc",
  },
  {
    id: "dpd",
    name: "DPD Express",
    carrier: "DPD",
    estimatedDays: "1-2 business days",
    price: 7.90,
    descriptionKey: "shipping.dpdDesc",
  },
  {
    id: "smartpost",
    name: "SmartPost",
    carrier: "SmartPost",
    estimatedDays: "2-4 business days",
    price: 2.90,
    descriptionKey: "shipping.smartpostDesc",
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "card", name: "Credit / Debit Card", icon: "credit-card", description: "Visa, Mastercard, AMEX" },
  { id: "google-pay", name: "Google Pay", icon: "smartphone", description: "Quick checkout" },
  { id: "apple-pay", name: "Apple Pay", icon: "smartphone", description: "Quick checkout" },
  { id: "klarna", name: "Klarna", icon: "clock", description: "Pay later in 30 days" },
  { id: "sofort", name: "SOFORT / Giropay", icon: "landmark", description: "Direct bank transfer" },
  { id: "ideal", name: "iDEAL", icon: "landmark", description: "Dutch online banking" },
  { id: "bancontact", name: "Bancontact", icon: "landmark", description: "Belgian payment" },
];
