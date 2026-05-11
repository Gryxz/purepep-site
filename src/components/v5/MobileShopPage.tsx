/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";
import type { Product, Category } from "@/data/products";
import Image from "next/image";
import { MobileVial } from "./MobileVial";
import { MobileFooter } from "./MobileFooter";

/**
 * v5 mobile shop / catalog page — ported 1:1 from
 * docs/design-v3/mobile-mockups/Shop.html.
 *
 * Sections:
 *   1. Trust strip (5 items)
 *   2. Centered "Shop All Peptides" title
 *   3. Search pill (visual placeholder, non-functional per mockup)
 *   4. Filter chips (All / GLP-1 / Growth / Healing) — live filtering
 *   5. Count row "Showing N of M"
 *   6. 2-col product grid
 *   7. 2x2 trust band (HPLC / Domestic / Secure / Research-use)
 *   8. Dark CTA — "Need a compound that isn't listed?"
 *   9. MobileFooter
 */
type FilterKey = "all" | "glp1" | "growth" | "healing";

interface ChipDef {
  key: FilterKey;
  label: string;
  match: (c: Category) => boolean;
}

const CHIPS: ChipDef[] = [
  { key: "all",     label: "All",            match: () => true },
  { key: "glp1",    label: "GLP-1 & Metabolic", match: (c) => c === "Incretin mimetics" || c === "Metabolic" },
  { key: "growth",  label: "Growth Hormone", match: (c) => c === "GH secretagogues" },
  { key: "healing", label: "Healing",        match: (c) => c === "Healing" },
];

export function MobileShopPage({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const chipDef = CHIPS.find((c) => c.key === filter)!;

  const visible = useMemo(
    () => products.filter((p) => chipDef.match(p.category)),
    [products, chipDef],
  );

  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = { all: 0, glp1: 0, growth: 0, healing: 0 };
    for (const p of products) {
      for (const c of CHIPS) {
        if (c.match(p.category)) map[c.key]++;
      }
    }
    return map;
  }, [products]);

  return (
    <div className="mob-app mob-shop">
      {/* Trust strip — auto-loop marquee */}
      <div className="mob-trust-bar" data-mob-section="dark">
        <div className="mob-trust-track">
          <div className="mob-trust-item"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item"><span className="dot" />Secure Checkout</div>
          <div className="mob-trust-item"><span className="dot" />Free over $200</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Secure Checkout</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Free over $200</div>
        </div>
      </div>

      {/* Page title */}
      <div className="mob-shop-title">
        <h1 className="mob-shop-h1">Shop All Peptides</h1>
      </div>

      {/* Search pill (visual only — search not yet wired) */}
      <div className="mob-search-wrap">
        <div className="mob-search-pill" role="search" aria-label="Search peptides (coming soon)">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>Search peptides…</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mob-filter-row" role="tablist" aria-label="Filter by category">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={filter === c.key}
            onClick={() => setFilter(c.key)}
            className={`mob-fchip${filter === c.key ? " is-active" : ""}`}
          >
            {c.label} <span className="ct">{counts[c.key]}</span>
          </button>
        ))}
      </div>

      <div className="mob-count-row">
        <span className="mob-show-count">
          Showing <strong>{visible.length}</strong> of {products.length}
        </span>
      </div>

      {/* Product grid */}
      <div className="mob-pgrid">
        {visible.map((p) => (
          <a key={p.slug} href={`/shop/${p.slug}`} className="mob-pcard">
            <div className="mob-pcard-img">
              {p.type === "stack" ? (
                <span className="mob-card-stack-ribbon">Stack</span>
              ) : p.regularPrice && p.regularPrice > p.price ? (
                <span className="mob-card-sale-ribbon">Sale</span>
              ) : null}
              <span className="mob-cat-pill">{categoryShort(p.category)}</span>
              <span className={`mob-stock-chip ${p.stock === "low" ? "is-low" : "is-in"}`}>
                <span className="sd" />
                {p.stock === "low" ? "Low stock" : "In stock"}
              </span>
              <Image
                src={`/images/products/source/purepep-vial-${p.slug}-v1.0.jpg`}
                alt={`${p.compound} vial`}
                fill
                sizes="50vw"
                className="mob-pcard-hero-img"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="mob-pcard-body">
              <div className="mob-pname">{p.name}</div>
              <div className="mob-pdesc">{shortDesc(p)}</div>
              <div className="mob-pcard-foot">
                <span className="mob-pprice">${Math.round(p.price)}</span>
                <span className="mob-parr">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* 2x2 trust band */}
      <section className="mob-trust-band-section">
        <div className="mob-trust-band">
          <div className="mob-tcell">
            <div className="mob-ticon-tile">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M9 2v6.5L4 17a3 3 0 0 0 2.5 4.5h11A3 3 0 0 0 20 17l-5-8.5V2" />
                <line x1="9" y1="2" x2="15" y2="2" />
              </svg>
            </div>
            <span className="mob-tlabel">99.5%+ HPLC Verified</span>
            <span className="mob-tcap">Every batch independently analyzed. COA included.</span>
          </div>
          <div className="mob-tcell">
            <div className="mob-ticon-tile">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="mob-tlabel">2-3 Day Domestic</span>
            <span className="mob-tcap">Tracked US fulfillment. Discreet packaging.</span>
          </div>
          <div className="mob-tcell">
            <div className="mob-ticon-tile">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="mob-tlabel">Secure Checkout</span>
            <span className="mob-tcap">Encrypted payment. Order protection.</span>
          </div>
          <div className="mob-tcell">
            <div className="mob-ticon-tile">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="mob-tlabel">Research Use Only</span>
            <span className="mob-tcap">Sold strictly for laboratory research.</span>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="mob-dcta" data-mob-section="dark">
        <div className="mob-dcta-eyebrow">For research teams</div>
        <h2 className="mob-dcta-h">Don&apos;t see what you need?</h2>
        <p className="mob-dcta-body">
          We source and synthesize additional peptides for labs and repeat buyers. Send us your spec —
          we respond within one business day.
        </p>
        <a href="/legal/contact" className="mob-cta-amber-base mob-dcta-btn">
          Request a quote
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      <MobileFooter />
    </div>
  );
}

function categoryShort(c: Category): string {
  switch (c) {
    case "Incretin mimetics": return "GLP-1";
    case "GH secretagogues":  return "Growth";
    case "Healing":           return "Healing";
    case "Cognition":         return "Cognition";
    case "Metabolic":         return "Metabolic";
  }
}

function shortDesc(p: Product): string {
  const first = p.description.split(".")[0] ?? p.name;
  return first.length > 60 ? first.slice(0, 57) + "..." : first + ".";
}
