"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Derived helpers (computed from items, never stored — keeps persist hydration simple)
export const selectItemCount = (s: CartState): number =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (s: CartState): number =>
  s.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cleopatra-cart",
      // Only persist data (never functions) so hydration is a plain merge
      partialize: (s) => ({ items: s.items }),
      version: 1,
      migrate: (persisted: any) => ({ items: persisted?.items || [] }),
    }
  )
);