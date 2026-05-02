"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { Lockup, Icon, Eyebrow } from "./primitives";
import { clsx } from "@/lib/clsx";

function UtilityStrip() {
  const items = ["For research use only", "21+ qualified researchers", "All sales final"];
  return (
    <div className="border-b border-ink bg-bone">
      {/* Desktop: all three items */}
      <div className="layout-content hidden items-center justify-center gap-5 py-[9px] md:flex">
        {items.map((t, i) => (
          <React.Fragment key={t}>
            <span className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
              {t}
            </span>
            {i < items.length - 1 && (
              <span className="text-ink" aria-hidden="true">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Mobile: condensed single line */}
      <div className="flex items-center justify-center py-[7px] md:hidden">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
          Research use only · 21+ qualified researchers
        </span>
      </div>
    </div>
  );
}

function NavLink({ children, href = "#", active = false }: { children: React.ReactNode; href?: string; active?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        "pb-px font-sans text-[14px] font-medium leading-none tracking-[-0.005em] text-ink no-underline transition-colors",
        active || hovered ? "border-b border-ink" : "border-b border-transparent",
      )}
    >
      {children}
    </a>
  );
}

function DropdownRow({ href, children, divider }: { href: string; children: React.ReactNode; divider?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      role="menuitem"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        "block px-[18px] py-[14px] font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink no-underline",
        hovered ? "bg-surface" : "bg-bone",
        divider ? "border-t border-line" : "",
      )}
    >
      {children}
    </a>
  );
}

function NavAffiliatesDropdown({ active = false }: { active?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex cursor-pointer items-center gap-1.5 border-b bg-transparent py-2 font-sans text-[14px] font-medium tracking-[-0.005em] text-ink",
          active || open ? "border-ink" : "border-transparent",
        )}
      >
        Affiliates
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-[calc(100%+2px)] z-40 min-w-[260px] -translate-x-1/2 rounded-[2px] border border-ink bg-bone"
        >
          <DropdownRow href="/affiliates">Join the program →</DropdownRow>
          <DropdownRow href="/affiliates/dashboard" divider>Affiliate dashboard →</DropdownRow>
        </div>
      )}
    </div>
  );
}

// TODO: when the WC product slug is renamed from `purepep-reta-test` to
// `reta` in WP admin, switch this href back to `/shop/reta`.  Header is
// hard-pinned to the live WC slug to avoid a 404 today.
const RETA_HREF = "/shop/purepep-reta-test";

const MOBILE_NAV_LINKS = [
  { label: "Catalog", href: "/shop" },
  { label: "RETA", href: RETA_HREF },
  { label: "Quality", href: "/quality" },
  { label: "Documentation", href: "/documentation" },
  { label: "Affiliates", href: "/affiliates" },
  { label: "Affiliate dashboard", href: "/affiliates/dashboard" },
  { label: "Account", href: "#" },
];

export function Header({ minimal = false }: { minimal?: boolean }) {
  const { totalItems, openCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = totalItems();

  return (
    <header className="relative z-10 bg-bone">
      <UtilityStrip />
      <div
        className={clsx(
          "layout-content grid items-center border-b border-ink py-4 md:py-5",
          minimal
            ? "grid-cols-[1fr_auto] gap-4"
            : "grid-cols-[auto_minmax(0,1fr)_auto] gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8",
        )}
      >
        <Link href="/" className="inline-block no-underline">
          <Lockup className="h-8 w-auto md:h-9" />
        </Link>

        {!minimal && (
          /* Desktop nav — hidden on mobile */
          <nav className="hidden items-center justify-center gap-7 md:flex">
            <NavLink href="/shop">Catalog</NavLink>
            <NavLink href={RETA_HREF}>RETA</NavLink>
            <NavLink href="/quality">Quality</NavLink>
            <NavLink href="/documentation">Documentation</NavLink>
            <NavAffiliatesDropdown />
            <NavLink>Account</NavLink>
          </nav>
        )}

        {minimal ? (
          <Eyebrow className="text-ink">Secure checkout</Eyebrow>
        ) : (
          <div className="flex items-center gap-2 md:gap-[18px]">
            {/* Search — desktop only */}
            <button
              type="button"
              aria-label="Search"
              className="hidden cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-ink md:inline-flex"
            >
              <Icon name="search" size={18} />
            </button>
            {/* Account — desktop only */}
            <button
              type="button"
              aria-label="Account"
              className="hidden cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-ink md:inline-flex"
            >
              <Icon name="user" size={18} />
            </button>
            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="relative inline-flex h-11 cursor-pointer items-center gap-2 border border-ink bg-transparent px-3 py-2 text-ink"
            >
              <Icon name="cart" size={16} />
              <span className="hidden font-mono text-[11px] font-semibold tracking-[0.12em] min-[360px]:inline">
                {String(count).padStart(2, "0")}
              </span>
            </button>
            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent text-ink md:hidden"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile full-screen nav overlay */}
      {menuOpen && !minimal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bone md:hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-ink px-4 py-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="inline-block no-underline">
              <Lockup className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border-none bg-transparent text-ink"
            >
              <Icon name="close" size={22} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col overflow-y-auto">
            {MOBILE_NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[56px] items-center border-b border-line px-4 font-sans text-[17px] font-medium text-ink no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-ink px-4 pb-8 pt-4">
            <button
              type="button"
              onClick={() => { openCart(); setMenuOpen(false); }}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone"
            >
              <Icon name="cart" size={16} />
              Cart · {String(count).padStart(2, "0")}
            </button>
            <a
              href="/researcher-access"
              onClick={() => setMenuOpen(false)}
              className="mt-3 flex h-11 w-full items-center justify-center border border-ink bg-transparent font-mono text-[11px] uppercase tracking-[0.14em] text-ink no-underline"
            >
              Researcher access →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
