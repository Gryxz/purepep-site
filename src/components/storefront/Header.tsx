"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Lockup, Icon, Eyebrow } from "./primitives";
import { clsx } from "@/lib/clsx";

function UtilityStrip() {
  const items = ["For research use only", "21+ qualified researchers", "All sales final"];
  return (
    <div className="border-b border-ink bg-bone">
      <div className="layout-content flex items-center justify-center gap-5 py-[9px] whitespace-nowrap">
        {items.map((t, i) => (
          <React.Fragment key={t}>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
              {t}
            </span>
            {i < items.length - 1 && (
              <span className="text-ink" aria-hidden="true">·</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function NavLink({ children, href = "#", active = false }: { children: React.ReactNode; href?: string; active?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href as never}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={clsx(
        "pb-px font-sans text-[14px] font-medium leading-none tracking-[-0.005em] text-ink no-underline transition-colors",
        active || hovered ? "border-b border-ink" : "border-b border-transparent",
      )}
    >
      {children}
    </Link>
  );
}

function DropdownRow({ href, children, divider }: { href: string; children: React.ReactNode; divider?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href as never}
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
    </Link>
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

export function Header({ minimal = false }: { minimal?: boolean }) {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <header className="relative z-10 bg-bone">
      <UtilityStrip />
      <div
        className={clsx(
          "layout-content grid items-center gap-8 border-b border-ink py-5",
          minimal ? "grid-cols-[1fr_auto]" : "grid-cols-[220px_1fr_auto]",
        )}
      >
        <Link href="/" className="inline-block no-underline">
          <Lockup className="h-9 w-auto" />
        </Link>

        {!minimal && (
          <nav className="flex items-center justify-center gap-9">
            <NavLink href="/shop">Catalog</NavLink>
            <NavLink href="/shop/reta">RETA</NavLink>
            <NavLink>Quality</NavLink>
            <NavLink>Documentation</NavLink>
            <NavAffiliatesDropdown />
            <NavLink>Account</NavLink>
          </nav>
        )}

        {minimal ? (
          <Eyebrow className="text-ink">Secure checkout</Eyebrow>
        ) : (
          <div className="flex items-center gap-[18px]">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-ink"
            >
              <Icon name="search" size={18} />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent p-1.5 text-ink"
            >
              <Icon name="user" size={18} />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label="Open cart"
              className="relative inline-flex cursor-pointer items-center gap-2 border border-ink bg-transparent px-3 py-2 text-ink"
            >
              <Icon name="cart" size={16} />
              <span className="font-mono text-[11px] font-semibold tracking-[0.12em]">
                {String(count).padStart(2, "0")}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
