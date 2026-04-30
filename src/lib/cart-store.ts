"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addToWcCart } from "@/lib/wc-store-api";

export interface CartItem {
  slug: string;
  compound: string;
  name: string;
  dose: string;
  price: number;
  priceLabel: string;
  qty: number;
  /** WooCommerce product ID — used to mirror the item into the WC cart. */
  wcId?: number;
  /** WC cart line key returned from /cart/add-item — needed for update/remove. */
  wcItemKey?: string;
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

        // Mirror into WC cart in the background. Zustand stays the source of
        // truth — we update wcItemKey opportunistically so later mutations can
        // reach the right line, but we never block the UI on the upstream.
        if (typeof incoming.wcId === "number" && incoming.wcId > 0) {
          void addToWcCart(incoming.wcId, 1).then((line) => {
            if (!line || !line.key) return;
            set((s) => ({
              items: s.items.map((i) =>
                i.slug === incoming.slug && i.dose === incoming.dose && !i.wcItemKey
                  ? { ...i, wcItemKey: line.key }
                  : i,
              ),
            }));
          });
        }
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
