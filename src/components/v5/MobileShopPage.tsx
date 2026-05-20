/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import {
  CATALOG_FILTERS,
  filterCounts,
  visibleFilters,
  type FilterKey,
} from "@/data/catalog-filters";
import {
  stockLabel,
  STACK_BADGE_LABEL,
  CATALOG_RUO_FOOTNOTE,
  CATALOG_REQUEST_CTA,
  categoryShort,
  shortDesc,
} from "@/content/catalog";
import Image from "next/image";
import { MobileVial } from "./MobileVial";
import { MobileFooter } from "./MobileFooter";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics";

/**
 * v5 mobile shop / catalog page — ported 1:1 from
 * docs/design-v3/mobile-mockups/Shop.html.
 *
 * Sections:
 *   1. Trust strip (5 items)
 *   2. Centered "Shop All Peptides" title
 *   3. Search pill (visual placeholder, non-functional per mockup)
 *   4. Filter chips — shared with desktop via @/data/catalog-filters
 *   5. Count row "Showing N of M"
 *   6. 2-col product grid
 *   7. 2x2 trust band (HPLC / Domestic / Secure / Research-use)
 *   8. Dark CTA — "Need a compound that isn't listed?"
 *   9. MobileFooter
 */

export function MobileShopPage({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => filterCounts(products), [products]);
  const chips = useMemo(() => visibleFilters(counts), [counts]);

  // If the active filter's chip is no longer rendered (zero products),
  // fall back to "all" so the grid never reads empty unexpectedly.
  const activeChip =
    chips.find((c) => c.key === filter) ??
    CATALOG_FILTERS.find((c) => c.key === "all")!;

  const visible = useMemo(
    () => products.filter((p) => activeChip.match(p.category)),
    [products, activeChip],
  );
  const { addItem, openCart } = useCartStore();

  /** Tile quick-add — preventDefault + stopPropagation so the
   *  wrapping <a> to the PDP doesn't fire when the button is tapped. */
  function handleQuickAdd(e: React.MouseEvent, p: Product) {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock === "out") return;
    addItem({
      slug: p.slug,
      compound: p.compound,
      name: p.name,
      dose: p.dose,
      price: p.price,
      priceLabel: `$${p.price.toFixed(2)}`,
      wcId: p.wcId,
    });
    trackAddToCart(p, p.dose, 1, p.price, p.wcId);
    openCart();
  }

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
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={activeChip.key === c.key}
            onClick={() => setFilter(c.key)}
            className={`mob-fchip${activeChip.key === c.key ? " is-active" : ""}`}
          >
            {c.shortLabel} <span className="ct">{counts[c.key]}</span>
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
                <span className="mob-card-stack-ribbon">{STACK_BADGE_LABEL}</span>
              ) : p.regularPrice && p.regularPrice > p.price ? (
                <span className="mob-card-sale-ribbon">Sale</span>
              ) : null}
              <span className="mob-cat-pill">{categoryShort(p.category)}</span>
              <span
                className={`mob-stock-chip ${
                  p.stock === "low" ? "is-low" : p.stock === "out" ? "is-out" : "is-in"
                }`}
              >
                <span className="sd" />
                {stockLabel(p.stock)}
              </span>
              <Image
                src={p.imageUrl ?? `/images/products/source/purepep-vial-${p.slug}-v1.0.jpg`}
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
                <button
                  type="button"
                  className="mob-parr"
                  onClick={(e) => handleQuickAdd(e, p)}
                  disabled={p.stock === "out"}
                  aria-label={p.stock === "out" ? "Out of stock" : `Add ${p.name} to cart`}
                >
                  +
                </button>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mob-cat-footnote">{CATALOG_RUO_FOOTNOTE}</div>

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
        <div className="mob-dcta-eyebrow">{CATALOG_REQUEST_CTA.eyebrow}</div>
        <h2 className="mob-dcta-h">
          {CATALOG_REQUEST_CTA.headlineLead} {CATALOG_REQUEST_CTA.headlineEmphasis}
        </h2>
        <p className="mob-dcta-body">{CATALOG_REQUEST_CTA.body}</p>
        <a href={CATALOG_REQUEST_CTA.primary.href} className="mob-cta-amber-base mob-dcta-btn">
          {CATALOG_REQUEST_CTA.primary.label}
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
        <a href={CATALOG_REQUEST_CTA.secondary.href} className="mob-dcta-link">
          {CATALOG_REQUEST_CTA.secondary.label}
        </a>
      </section>

      <MobileFooter />
    </div>
  );
}
