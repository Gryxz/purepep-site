/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Lockup } from "@/components/storefront/primitives";
import { MoreMenu } from "./MoreMenu";

/**
 * v5 mobile chrome — sticky header (logo + hamburger + cart) and the
 * fixed bottom tab bar (Home / Shop / Cart / Account).  Mounted in
 * src/app/layout.tsx inside a `.mob-only` wrapper so it serves only at
 * ≤768px viewports; the existing v3 desktop chrome continues to serve
 * everyone else unchanged.
 *
 * Cart icon dispatches into the same useCartStore the rest of the
 * storefront uses, so the badge count and drawer toggle stay in sync
 * with the desktop header.  The hamburger opens MoreMenu (designed
 * from scratch — no mockup exists for that surface).
 */
export function MobileShell() {
  const pathname = usePathname() ?? "/";
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop");
  const isCart = pathname === "/cart" || pathname === "/checkout";

  return (
    <>
      {/* Header */}
      <header className="mob-hdr mob-only">
        <a href="/" className="mob-logo" aria-label="PurePep home">
          <Lockup className="h-7 w-auto text-ink" />
        </a>
        <div className="mob-hdr-r">
          <button
            type="button"
            className="mob-ib"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className="mob-ib"
            aria-label={`Open cart, ${count} item${count !== 1 ? "s" : ""}`}
            onClick={openCart}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="mob-cc" aria-hidden="true">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* More menu drawer */}
      <div className="mob-only">
        <MoreMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>

      {/* Bottom tab bar */}
      <nav className="mob-tab-bar mob-only" aria-label="Mobile navigation">
        <a href="/" className={`mob-tab-btn${isHome ? " is-active" : ""}`} aria-current={isHome ? "page" : undefined}>
          <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </a>
        <a href="/shop" className={`mob-tab-btn${isShop ? " is-active" : ""}`} aria-current={isShop ? "page" : undefined}>
          <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          Shop
        </a>
        <button
          type="button"
          onClick={openCart}
          className={`mob-tab-btn${isCart ? " is-active" : ""}`}
          aria-label={`Open cart, ${count} item${count !== 1 ? "s" : ""}`}
        >
          <span style={{ position: "relative" }}>
            <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          Cart
        </button>
        <a href="/researcher-access" className="mob-tab-btn">
          <svg fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Account
        </a>
      </nav>
    </>
  );
}
