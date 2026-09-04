// Product & Category Types
export interface Product {
  id: string;
  slug: string;
  name: string;
  nameKey: string; // i18n key
  subtitle: string; // e.g. "Royal Milk", "Black Pearl"
  subtitleKey: string;
  tagline: string; // e.g. "Timeless Beauty"
  taglineKey: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  images: ProductImage[];
  inci: string;
  scentProfile: string;
  scentProfileKey: string;
  usageInstructions: string;
  usageInstructionsKey: string;
  highlightTags: string[];
  highlightTagsKey: string[];
  skinTypes: string[];
  keyIngredients: string[];
  description: string;
  descriptionKey: string;
  stock: StockStatus;
  weight?: string;
}

export interface ProductImage {
  src: string;
  alt: string;
  altKey: string;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "pre-order";

export interface Category {
  id: string;
  name: string;
  nameKey: string;
  slug: string;
  icon?: string;
  comingSoon?: boolean;
}

export interface FilterOption {
  id: string;
  label: string;
  labelKey: string;
  count?: number;
  comingSoon?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  labelKey: string;
  options: FilterOption[];
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Navigation
export interface NavItem {
  label: string;
  labelKey: string;
  href: string;
  children?: NavItem[];
}

// Translation type
export type TranslationKey = string;

export type Language = "en" | "de" | "et" | "ru";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

// Shipping
export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number;
  descriptionKey: string;
}

// Payment
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}
