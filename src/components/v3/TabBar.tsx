/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

function HomeIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();

  const isHome = pathname === "/";
  const isShop = pathname?.startsWith("/shop");

  return (
    <nav className="v3-tab-bar" aria-label="Mobile navigation">
      <a href="/" className={`v3-tab-btn${isHome ? " is-active" : ""}`} aria-current={isHome ? "page" : undefined}>
        <HomeIcon />
        Home
      </a>
      <a href="/shop" className={`v3-tab-btn${isShop ? " is-active" : ""}`} aria-current={isShop ? "page" : undefined}>
        <ShopIcon />
        Shop
      </a>
      <button
        type="button"
        onClick={openCart}
        className="v3-tab-btn"
        aria-label={`Open cart, ${count} item${count !== 1 ? "s" : ""}`}
      >
        <span className="relative">
          <CartIcon />
          {count > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-amber px-0.5 font-mono text-[8px] font-bold text-ink"
              aria-hidden="true"
            >
              {count}
            </span>
          )}
        </span>
        Cart
      </button>
      <a href="#" className="v3-tab-btn">
        <UserIcon />
        Account
      </a>
    </nav>
  );
}
