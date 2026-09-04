/**
 * Canonical English content for texts that live outside the keyed i18n files.
 * When a non-English language is selected, these strings are translated live
 * through /api/translate (LibreTranslate → Azure → Google) and cached.
 */

export const dynamicContent: Record<string, string> = {
  // --- Trust badges ---
  "home.trust.handcrafted": "Handcrafted",
  "home.trust.natural": "Natural Ingredients",
  "home.trust.eco": "Eco-Friendly",
  "home.trust.madeInGermany": "Made in Germany",

  // --- Coming soon banner ---
  "home.comingSoon.badge": "Coming Soon",
  "home.comingSoon.title":
    "Expanding our collection with Body Lotions, Lip Balms, and Hair Oils",
  "home.comingSoon.subtitle":
    "New formulations are being perfected in our atelier. Join the waitlist to be the first to know.",
  "home.comingSoon.emailPlaceholder": "Enter your email for early access",
  "home.comingSoon.notify": "Notify Me",
  "home.comingSoon.success": "Thank you! You're on the list.",

  // --- Catalog coming-soon state ---
  "catalog.comingSoon.title": "Coming Soon",
  "catalog.comingSoon.text":
    "This category is being crafted in our atelier. Leave your email and we'll notify you when it launches.",

  // --- Checkout ---
  "checkout.cartEmpty": "Your cart is empty",

  // --- About ---
  "about.ourValues": "Our Values",

  // --- Legal pages (English source; translated live to DE/ET/RU) ---
  "legal.impressum.tmg": "Information pursuant to § 5 TMG",
  "legal.impressum.tmgBody":
    "Cleopatra Cosmetics GmbH\nRepresented by: [Managing Director]\nMusterstraße 1, 10115 Berlin, Germany",
  "legal.impressum.contact": "Contact",
  "legal.impressum.contactBody":
    "Telephone: +49 30 1234 5678\nEmail: hello@cleopatra-beauty.de",
  "legal.impressum.vat": "VAT ID",
  "legal.impressum.vatBody": "VAT identification number pursuant to § 27a VAT Act:\nDE [Number]",
  "legal.impressum.dispute": "Dispute resolution",
  "legal.impressum.disputeBody":
    "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr\nWe are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.",
  "legal.impressum.liability": "Liability for content",
  "legal.impressum.liabilityBody":
    "As a service provider we are responsible for our own content on these pages under § 7 (1) TMG. Under §§ 8 to 10 TMG we are not obliged to monitor transmitted or stored third-party information.",

  "legal.datenschutz.intro":
    "This privacy policy explains how Cleopatra Cosmetics GmbH (\"we\", \"us\") collects, uses and protects personal data in accordance with the EU General Data Protection Regulation (GDPR).",
  "legal.datenschutz.responsible": "Data controller",
  "legal.datenschutz.responsibleBody":
    "Cleopatra Cosmetics GmbH, Musterstraße 1, 10115 Berlin, Germany. Email: hello@cleopatra-beauty.de",
  "legal.datenschutz.collect": "What data we collect",
  "legal.datenschutz.collectBody":
    "When you place an order we process your name, email address, shipping address, phone number and payment information. When you subscribe to our newsletter we process your email address. When you browse the store we process anonymized analytics data.",
  "legal.datenschutz.purpose": "Purpose and legal basis",
  "legal.datenschutz.purposeBody":
    "Data is processed to fulfil contracts (Art. 6(1)(b) GDPR), for legitimate interests such as fraud prevention and analytics (Art. 6(1)(f) GDPR), and with your consent for marketing (Art. 6(1)(a) GDPR).",
  "legal.datenschutz.rights": "Your rights",
  "legal.datenschutz.rightsBody":
    "You have the right to access, rectify, erase and port your data, and to object to or restrict processing. To exercise these rights contact hello@cleopatra-beauty.de.",

  "legal.agb.scope": "Scope",
  "legal.agb.scopeBody":
    "These General Terms and Conditions (AGB) govern all orders placed with Cleopatra Cosmetics GmbH via this website.",
  "legal.agb.contract": "Conclusion of contract",
  "legal.agb.contractBody":
    "The presentation of products in the online shop is not a legally binding offer. By clicking \"Place Order\" you submit a binding offer; the contract is concluded when we confirm the order by email.",
  "legal.agb.prices": "Prices and payment",
  "legal.agb.pricesBody":
    "All prices include statutory VAT. Payment is due immediately via the selected payment method.",
  "legal.agb.returns": "Right of withdrawal",
  "legal.agb.returnsBody":
    "Consumers have a 14-day right of withdrawal from the day the goods are received, without giving reasons. Return costs are borne by the customer unless we agree otherwise.",

  "legal.shipping.delivery": "Delivery",
  "legal.shipping.deliveryBody":
    "We ship throughout the EU via Omniva, DPD and SmartPost. Orders are dispatched within 1–2 business days.",
  "legal.shipping.costs": "Shipping costs",
  "legal.shipping.costsBody":
    "Standard shipping within Germany costs €3.90. Orders over €50 ship free. International shipping is calculated at checkout.",
  "legal.shipping.returns": "Returns",
  "legal.shipping.returnsBody":
    "Return unopened products within 14 days for a full refund. Contact hello@cleopatra-beauty.de to initiate a return.",
};

// Flattened list of all dynamic texts (used by the live translator)
export const allDynamicTexts: string[] = Array.from(new Set(Object.values(dynamicContent)));

export function dynamicTextsForKey(prefix: string): string[] {
  return Object.entries(dynamicContent)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, v]) => v);
}