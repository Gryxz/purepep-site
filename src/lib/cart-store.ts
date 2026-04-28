"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  slug: string;
  compound: string;
  name: string;
  dose: string;
  price: number;
  priceLabel: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (incoming) => {
        set((s) => {
          const existing = s.items.find((i) => i.slug === incoming.slug && i.dose === incoming.dose);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.slug === incoming.slug && i.dose === incoming.dose
                  ? { ...i, qty: i.qty + 1 }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { ...incoming, qty: 1 }] };
        });
      },

      removeItem: (slug) => {
        set((s) => ({ items: s.items.filter((i) => i.slug !== slug) }));
      },

      updateQty: (slug, qty) => {
        if (qty < 1) {
          get().removeItem(slug);
          return;
        }
        set((s) => ({
          items: s.items.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    {
      name: "purepep-cart",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
