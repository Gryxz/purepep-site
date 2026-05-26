"use client";
import { useState } from "react";
import Link from "next/link";
import { Lockup } from "./primitives";
import { PaymentLogos } from "./PaymentLogos";
import { clsx } from "@/lib/clsx";
import { ENTITY } from "@/lib/entity";
import type { Product } from "@/data/products";
import type { WpPage } from "@/lib/wp-pages";

function FootCol({ title, items }: { title: string; items: { label: string; href?: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-bone/20 md:border-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-3.5 md:cursor-default md:py-0 md:pointer-events-none"
      >
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
          {title}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="text-bone/40 transition-transform duration-200 md:hidden"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path
            d="M3 5.5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        className={clsx(
          "list-none gap-2 p-0 m-0 pb-4 md:pb-0 md:mt-3.5",
          open ? "grid" : "hidden",
          "md:grid",
        )}
      >
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href as never}
                className="font-sans text-[13.5px] text-bone no-underline hover:text-bone/80"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-sans text-[13.5px] text-bone/75">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({
  minimal = false,
  products = [],
  policies = [],
}: {
  minimal?: boolean;
  /**
   * Live WC catalogue passed in from the server-side layout.  Used to
   * populate the Catalog column with whatever products actually exist
   * (capped at 4); falls back to a single "View all" entry when empty
   * so a missing/failed WC fetch never leaves the column with 404 links.
   */
  products?: Product[];
  /**
   * Policy + contact pages mirrored from WP at build time.  Footer reads
   * the WP page titles directly so Storefront copy never forks from the
   * canonical CMS source.  When empty (no WP creds, fetch failed), the
   * column falls back to a humanised label per slug so the links still
   * work.
   */
  policies?: WpPage[];
}) {
  if (minimal) {
    return (
      <footer className="bg-ink py-5 text-center font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
        © 2026 {ENTITY.brand} · For research use only · Not for human consumption
        <span className="mt-1 block text-[10px] normal-case tracking-normal text-bone/55">
          Operated by {ENTITY.legalName} ({ENTITY.legalNameJa}) · Corporate Number{" "}
          {ENTITY.corporateNumber}
        </span>
      </footer>
    );
  }

  const catalogItems: { label: string; href?: string }[] = [
    ...products.slice(0, 4).map((p) => ({
      label: `${p.compound} · ${p.name}`,
      href: `/shop/${p.slug}`,
    })),
    { label: "View all", href: "/shop" },
  ];

  const policyItems: { label: string; href?: string }[] =
    policies.length > 0
      ? [
          // `contact` has a dedicated in-repo portal — never link the
          // WP-mirrored /contact stub from the footer.
          ...policies
            .filter((p) => p.slug !== "contact")
            .map((p) => ({ label: p.title, href: `/${p.slug}` })),
          { label: "Contact", href: "/contact" },
        ]
      : [
          { label: "Refund policy", href: "/refund-policy" },
          { label: "Terms of service", href: "/terms-of-service" },
          { label: "Privacy policy", href: "/privacy-policy" },
          { label: "Shipping policy", href: "/shipping-policy" },
          { label: "Disclaimer", href: "/disclaimer" },
          { label: "Contact", href: "/contact" },
        ];

  return (
    <footer className="bg-ink text-bone">
      <div className="layout-content pb-10 pt-12 md:pt-[72px]">
        {/* Logo + tagline — always shown */}
        <div className="mb-6 md:hidden">
          <Lockup className="h-9 w-auto text-bone" />
          <p className="mt-3 font-sans text-[13.5px] leading-relaxed text-bone/75">
            Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped.
          </p>
          <p className="mt-3 font-sans text-[13.5px] leading-relaxed text-bone/75">
            <a href={`mailto:${ENTITY.email}`} className="text-bone/75 no-underline">
              {ENTITY.email}
            </a>
            {" · "}
            <a href={`tel:${ENTITY.phoneTel}`} className="text-bone/75 no-underline">
              {ENTITY.phoneDisplay}
            </a>
          </p>
        </div>

        {/* Desktop: 5-col grid | Mobile: stacked accordion */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_repeat(4,_1fr)] md:gap-12">
          {/* Logo col — desktop only */}
          <div className="hidden md:block">
            <Lockup className="h-10 w-auto text-bone" />
            <p className="mt-4.5 max-w-[280px] font-sans text-[13.5px] leading-relaxed text-bone/75">
              Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped. Documentation on
              file.
            </p>
            <p className="mt-4 font-sans text-[13.5px] leading-relaxed text-bone/75">
              <a href={`mailto:${ENTITY.email}`} className="text-bone/75 no-underline">
                {ENTITY.email}
              </a>
              <br />
              <a href={`tel:${ENTITY.phoneTel}`} className="text-bone/75 no-underline">
                {ENTITY.phoneDisplay}
              </a>
            </p>
          </div>

          <FootCol title="Catalog" items={catalogItems} />
          <FootCol
            title="Quality"
            items={[
              { label: "Certificates of analysis", href: "/documentation" },
              { label: "FAQ", href: "/faq" },
              { label: "Methods & lab partners", href: "/quality#methods" },
              { label: "Cold-chain shipping", href: "/shipping-policy" },
              { label: "Lot traceability", href: "/documentation#lots" },
            ]}
          />
          <FootCol
            title="Account"
            items={[
              { label: "Sign in" },
              { label: "Researcher verification", href: "/researcher-access" },
              { label: "Order history" },
              { label: "Re-order" },
            ]}
          />
          <FootCol title="Policies" items={policyItems} />
        </div>

        <div className="my-8 h-px bg-bone/20 md:my-12" />

        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone/55">
          <span>For research use only · Not for human consumption · 21+ qualified researchers</span>
          <div className="flex items-center gap-4">
            <PaymentLogos />
            <span>© 2026 PurePep</span>
          </div>
        </div>

        <div className="mt-8 space-y-1 border-t-[1.5px] border-ink bg-bone p-4 font-mono text-xs text-ink">
          <p>
            {ENTITY.brand} is a trade name operated by {ENTITY.legalName} ({ENTITY.legalNameJa}), a{" "}
            {ENTITY.entityType} registered in {ENTITY.country}.
          </p>
          <p>Corporate Number: {ENTITY.corporateNumber}</p>
          <p>Registered office: {ENTITY.address.full}</p>
          <p className="pt-2">
            {ENTITY.useStatement}. Sales restricted to {ENTITY.audience}.
          </p>
        </div>
      </div>
    </footer>
  );
}
