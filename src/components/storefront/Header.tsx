"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useCartStore, useCartCount } from "@/lib/cart-store";
import { Lockup, Icon, Eyebrow } from "./primitives";
import { clsx } from "@/lib/clsx";
import { ACCOUNT_HREF } from "@/content/nav";

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
              <span className="text-ink" aria-hidden="true">
                ·
              </span>
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

const TOP_NAV_LINKS = [
  { label: "Catalog", href: "/shop" },
];

const FEATURED_MENU_LINKS = [
  { label: "Best sellers", href: "/shop" },
];

const MOBILE_NAV_LINKS = [
  { label: "Catalog", href: "/shop" },
  { label: "Contact", href: "/contact" },
];

export function Header({ minimal = false }: { minimal?: boolean }) {
  const { openCart } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = useCartCount();
  const pathname = usePathname();

  function isActiveNav(href: string) {
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/shop/");
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const glassPill =
    "group inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-white/55 text-ink shadow-[0_8px_24px_rgb(31_31_31_/_7%)] backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-ink/25 hover:bg-bone hover:shadow-[0_12px_32px_rgb(31_31_31_/_12%)]";

  return (
    <>
      <header className="sticky top-0 z-40 animate-[ppHeaderFade_420ms_ease-out_both] bg-bone/95 shadow-[0_1px_0_rgb(31_31_31_/_12%)] backdrop-blur-xl">
        <UtilityStrip />
        <div
          className={clsx(
            "layout-content grid items-center py-3 md:py-4",
            minimal ? "grid-cols-[1fr_auto] gap-4" : "grid-cols-[1fr_auto_1fr] gap-3 md:gap-6",
          )}
        >
          {!minimal && <div aria-hidden="true" />}

          <Link
            href="/"
            className={clsx("inline-block no-underline", !minimal && "justify-self-center")}
          >
            <Lockup className="h-8 w-auto md:h-9" />
          </Link>

          {minimal ? (
            <Eyebrow className="text-ink">Secure checkout</Eyebrow>
          ) : (
            <div aria-hidden="true" />
          )}
        </div>

        {!minimal && (
          <nav className="layout-content hidden items-center justify-center gap-2 border-t border-line py-2 md:flex">
            {TOP_NAV_LINKS.map((link) => {
              const active = isActiveNav(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "rounded-full border px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.14em] no-underline transition-colors",
                    active
                      ? "border-ink bg-ink hover:text-white"
                      : "border-ink/15 bg-white/35 text-ink hover:bg-bone",
                  )}
                  style={active ? { color: "var(--pp-white)" } : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        )}
      </header>

      {!minimal && (
        <div className="pointer-events-none fixed inset-x-0 top-[43px] z-50 md:top-[52px]">
          <div className="layout-content flex items-center justify-between">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className={clsx(
                glassPill,
                "pointer-events-auto w-11 animate-[ppPillPop_520ms_cubic-bezier(0.2,0.6,0.2,1)_both]",
              )}
            >
              <span className="transition-transform duration-300 ease-out group-hover:scale-110">
                <Icon name={menuOpen ? "close" : "menu"} size={22} />
              </span>
            </button>

            <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
{/* researcher-access icon hidden */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open cart, ${count} item${count !== 1 ? "s" : ""}`}
                className="group relative inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink bg-ink px-4 py-2 text-bone shadow-[0_10px_28px_rgb(31_31_31_/_14%)] transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(31_31_31_/_20%)]"
              >
                <span className="transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
                  <Icon name="cart" size={16} />
                </span>
                <span className="font-mono text-[11px] font-semibold tracking-[0.12em]">
                  {String(count).padStart(2, "0")}
                </span>
                {count > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-amber px-0.5 font-mono text-[8px] font-bold text-ink md:hidden"
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpen && !minimal && (
        <div className="fixed inset-0 z-50 animate-[ppOverlayFade_220ms_ease-out_both] bg-ink/35 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto flex h-full max-w-[760px] animate-[ppMenuRise_360ms_cubic-bezier(0.2,0.6,0.2,1)_both] flex-col overflow-hidden rounded-[24px] border border-bone/80 bg-bone/90 shadow-[0_30px_80px_rgb(31_31_31_/_28%)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-ink/15 px-4 py-4 md:px-6">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="inline-block no-underline"
              >
                <Lockup className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-white/45 text-ink"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-ink/10 px-4 py-3 md:px-6">
              {FEATURED_MENU_LINKS.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-[0.13em] no-underline",
                    index === 0 ? "border-ink bg-ink" : "border-ink/15 bg-white/55 text-ink",
                  )}
                  style={index === 0 ? { color: "var(--pp-white)" } : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2 md:px-4 md:py-4">
              {MOBILE_NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="group flex min-h-[58px] animate-[ppMenuItemIn_420ms_cubic-bezier(0.2,0.6,0.2,1)_both] items-center justify-between rounded-[18px] px-4 font-sans text-[20px] font-semibold tracking-[-0.02em] text-ink no-underline transition-colors hover:bg-white/55 md:text-[24px]"
                >
                  <span>{link.label}</span>
                  <span className="font-mono text-[18px] text-ink-muted transition-transform group-hover:translate-x-1">
                    +
                  </span>
                </a>
              ))}
            </nav>

            <div className="border-t border-ink/15 px-4 pb-5 pt-4 md:px-6">
              <button
                type="button"
                onClick={() => {
                  openCart();
                  setMenuOpen(false);
                }}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone"
              >
                <Icon name="cart" size={16} />
                Cart · {String(count).padStart(2, "0")}
              </button>
{/* researcher-access button hidden */}
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes ppHeaderFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ppPillPop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ppOverlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ppMenuRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ppMenuItemIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\[ppHeaderFade_420ms_ease-out_both\],
          .animate-\[ppPillPop_520ms_cubic-bezier\(0\.2\,0\.6\,0\.2\,1\)_both\],
          .animate-\[ppPillPop_560ms_cubic-bezier\(0\.2\,0\.6\,0\.2\,1\)_120ms_both\],
          .animate-\[ppOverlayFade_220ms_ease-out_both\],
          .animate-\[ppMenuRise_360ms_cubic-bezier\(0\.2\,0\.6\,0\.2\,1\)_both\],
          .animate-\[ppMenuItemIn_420ms_cubic-bezier\(0\.2\,0\.6\,0\.2\,1\)_both\] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
