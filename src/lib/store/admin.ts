"use client";
import { create } from "zustand";
import { Product } from "../types";
import { products as initialProducts } from "@/data/products";
import { categories as initialCategories } from "@/data/categories";
import { Category } from "../types";

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  items: { productId: string; name: string; quantity: number; price: number }[];
  shipping_method?: string | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_method?: string | null;
  payment_status: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  tracking_number?: string | null;
  created_at: string;
}

export interface NewsletterSignup {
  id: string;
  email: string;
  source?: string | null;
  created_at?: string;
  date?: string;
}

interface AdminState {
  // Auth (dev-mode fallback; real auth is server-side via Supabase)
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductVisibility: (id: string, status: Product["stock"]) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  // Orders — REAL data only (loaded from the database via API)
  orders: AdminOrder[];
  loadOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: AdminOrder["status"]) => Promise<void>;
  updateOrderTracking: (id: string, tracking: string) => Promise<void>;

  // Newsletter — REAL data only
  newsletterSignups: NewsletterSignup[];
  loadNewsletterSignups: () => Promise<void>;

  // Content (homepage, legal pages — admin-editable, English source)
  content: Record<string, string>;
  updateContent: (key: string, value: string) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  // Dev-mode auth fallback. In production, access is enforced server-side
  // by middleware + Supabase Auth; this flag only mirrors the session UI state.
  isAuthenticated: false,
  login: (password: string) => {
    if (password === "cleopatra2026") {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),

  // Products
  products: initialProducts,
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  toggleProductVisibility: (id, status) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, stock: status } : p)),
    })),

  // Categories
  categories: initialCategories,
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteCategory: (id) =>
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
  reorderCategories: (orderedIds) =>
    set((state) => ({
      categories: orderedIds
        .map((id) => state.categories.find((c) => c.id === id))
        .filter(Boolean) as Category[],
    })),

  // Orders — no sample data. Empty until loaded from the database.
  orders: [],
  loadOrders: async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data?.configured && Array.isArray(data.orders)) {
        set({ orders: data.orders });
      }
    } catch {
      // keep existing (empty) state
    }
  },
  updateOrderStatus: async (id, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {}
  },
  updateOrderTracking: async (id, tracking) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, tracking_number: tracking } : o)),
    }));
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, trackingNumber: tracking }),
      });
    } catch {}
  },

  // Newsletter — no sample data.
  newsletterSignups: [],
  loadNewsletterSignups: async () => {
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (data?.configured && Array.isArray(data.signups)) {
        set({ newsletterSignups: data.signups });
      }
    } catch {}
  },

  // Content — editable English source for the storefront sections
  content: {
    "hero.tagline": "Timeless Beauty, Reimagined",
    "hero.subtitle":
      "Inspired by ancient beauty rituals, handcrafted in small batches with pure natural ingredients.",
    "about.intro.title": "Crafted with Purpose",
    "about.intro.text":
      "Every Cleopatra product is handcrafted in small batches in our German atelier. We source the finest natural ingredients, combining ancient beauty wisdom with modern artisan techniques.",
    "comingSoon.title": "Coming Soon",
  },
  updateContent: (key, value) =>
    set((state) => ({ content: { ...state.content, [key]: value } })),
}));