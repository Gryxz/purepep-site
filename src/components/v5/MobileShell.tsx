/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Lockup } from "@/components/storefront/primitives";
import { MoreMenu } from "./MoreMenu";

/**
 * v5 mobile chrome — fixed glass header (logo + hamburger + cart) and
 * the fixed bottom tab bar with a sliding amber-glass active indicator.
 *
 * Adaptive chrome: an IntersectionObserver watches every element marked
 * `data-mob-section="dark"` (hero, process, dark CTA, footer, etc.).
 * When any of them overlap the header zone (top 64px) the header gets
 * `.is-on-dark`; same for the tab bar zone (bottom 80px).  Glass tints
 * + text colors invert under dark sections so chrome reads cleanly.
 */
export function MobileShell() {
  const pathname = usePathname() ?? "/";
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();
  const [menuOpen, setMenuOpen] = useState(false);
  // Synchronous initial dark state — Home + age-gate ship top-of-page
  // dark, so we paint the header glass-on-dark on the very first render
  // (no light → dark flicker before IntersectionObserver fires).  Other
  // routes start light and only flip when a dark sentinel scrolls in.
  const initialDark = pathname === "/" || pathname === "/age-gate" || pathname === "/age-gate/";
  const [headerDark, setHeaderDark] = useState(initialDark);
  const [tabBarDark, setTabBarDark] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const tabBarRef = useRef<HTMLElement | null>(null);

  // Active-tab index drives the sliding indicator pill (Home/Shop/Cart/Account).
  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop");
  const isCart = pathname === "/cart" || pathname === "/checkout";
  const isAccount = pathname.startsWith("/researcher-access");
  const isAgeGate = pathname === "/age-gate" || pathname === "/age-gate/";
  const tabIndex = isHome ? 0 : isShop ? 1 : isCart ? 2 : isAccount ? 3 : -1;

  // Toggle a global age-gate flag on <html> so globals.css can hide the
  // tab bar + cart icon and force-dark the header without per-component
  // conditionals.  Cleanup on unmount/route change.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mob-age-gate", isAgeGate);
    return () => {
      document.documentElement.classList.remove("mob-age-gate");
    };
  }, [isAgeGate]);

  // Adaptive chrome — IntersectionObserver tracks dark-themed sections.
  // Re-runs when the route changes since the dark sentinels live inside
  // the page component tree which remounts on navigation.
  useEffect(() => {
    if (isAgeGate) return;

    // Wait one frame so the new route's DOM is mounted before query.
    const raf = requestAnimationFrame(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('[data-mob-section="dark"]'),
      );
      if (sections.length === 0) {
        setHeaderDark(false);
        setTabBarDark(false);
        return;
      }

      // Track which dark sections are intersecting which strip.
      const headerHits = new Set<Element>();
      const tabBarHits = new Set<Element>();

      // Header observer: top of viewport, 56px tall (header height + buffer).
      const headerObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) headerHits.add(e.target);
            else headerHits.delete(e.target);
          }
          setHeaderDark(headerHits.size > 0);
        },
        {
          rootMargin: "0px 0px -100% 0px", // collapse bottom edge to 0
          threshold: 0,
        },
      );
      // Use a top sentinel by treating any intersection in the top 64px
      // as "behind header". rootMargin trick: shrink bottom to top+64px.
      // Simpler: switch to threshold-based approach below.
      headerObs.disconnect();

      // Replace with dual observers using rootMargin to define zones.
      const headerZoneObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) headerHits.add(e.target);
            else headerHits.delete(e.target);
          }
          setHeaderDark(headerHits.size > 0);
        },
        // Zone: top 0 to top+56px. Bottom margin = -(viewport - 56)px.
        { rootMargin: `0px 0px -${Math.max(0, (typeof window !== "undefined" ? window.innerHeight : 800) - 56)}px 0px`, threshold: 0 },
      );

      const tabBarZoneObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) tabBarHits.add(e.target);
            else tabBarHits.delete(e.target);
          }
          setTabBarDark(tabBarHits.size > 0);
        },
        // Zone: bottom-80px to bottom. Top margin = -(viewport - 80)px.
        { rootMargin: `-${Math.max(0, (typeof window !== "undefined" ? window.innerHeight : 800) - 80)}px 0px 0px 0px`, threshold: 0 },
      );

      sections.forEach((s) => {
        headerZoneObs.observe(s);
        tabBarZoneObs.observe(s);
      });

      return () => {
        headerZoneObs.disconnect();
        tabBarZoneObs.disconnect();
      };
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, isAgeGate]);

  // Note: we no longer fully unmount on /age-gate.  The header now stays
  // (forced-dark via the html.mob-age-gate class set above), but the tab
  // bar is hidden via CSS and the right-side icons collapse via CSS too.

  return (
    <>
      {/* Header */}
      <header
        ref={headerRef}
        className={`mob-hdr mob-only${headerDark ? " is-on-dark" : ""}`}
      >
        <a href="/" className="mob-logo" aria-label="PurePep home">
          <Lockup className="h-7 w-auto" />
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

      {/* Bottom tab bar with sliding indicator */}
      <nav
        ref={tabBarRef}
        className={`mob-tab-bar mob-only${tabBarDark ? " is-on-dark" : ""}`}
        aria-label="Mobile navigation"
        style={{ ["--mob-tab-index" as string]: String(Math.max(0, tabIndex)) }}
      >
        <span className={`mob-tab-indicator${tabIndex < 0 ? " is-hidden" : ""}`} aria-hidden="true">
          <span className="mob-tab-indicator-pill" />
        </span>
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
        <a
          href="/researcher-access"
          className={`mob-tab-btn${isAccount ? " is-active" : ""}`}
          aria-current={isAccount ? "page" : undefined}
        >
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
