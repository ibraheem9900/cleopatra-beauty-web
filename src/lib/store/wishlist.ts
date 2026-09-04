"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../types";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        set((state) => {
          if (state.items.find((i) => i.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },
      toggleItem: (product: Product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      isInWishlist: (productId: string) => {
        return get().items.some((i) => i.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "cleopatra-wishlist" }
  )
);
