import { NavItem } from "../lib/types";

export const navigation: NavItem[] = [
  { label: "Home", labelKey: "nav.home", href: "/" },
  { label: "Shop", labelKey: "nav.catalog", href: "/catalog" },
  { label: "About Us", labelKey: "nav.about", href: "/about" },
];

export const footerShopLinks = [
  { label: "All Products", labelKey: "nav.allProducts", href: "/catalog" },
  { label: "Soaps", labelKey: "filter.soaps", href: "/catalog?category=soaps" },
  { label: "Lotions", labelKey: "filter.lotions", href: "/catalog?category=lotions" },
  { label: "Lip Care", labelKey: "filter.lipCare", href: "/catalog?category=lip-care" },
  { label: "Hair Oils", labelKey: "filter.hairOils", href: "/catalog?category=hair-oils" },
];

export const footerInfoLinks = [
  { label: "Customer Service", labelKey: "footer.customerService", href: "#" },
  { label: "FAQ", labelKey: "footer.faq", href: "#" },
  { label: "Track Order", labelKey: "footer.trackOrder", href: "#" },
  { label: "Returns & Exchanges", labelKey: "footer.returns", href: "#" },
];

export const footerLegalLinks = [
  { label: "Impressum", labelKey: "footer.impressum", href: "/impressum" },
  { label: "Privacy Policy", labelKey: "footer.privacy", href: "/datenschutz" },
  { label: "Terms & Conditions", labelKey: "footer.terms", href: "/agb" },
  { label: "Shipping & Returns", labelKey: "footer.shippingPolicy", href: "/shipping-returns" },
];
