/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { clsx } from "@/lib/clsx";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product, Category } from "@/data/products";
import Image from "next/image";
import { RetaVial } from "./RetaVial";
import { RetaVialMini } from "./RetaVialMini";
import { TrustBar } from "./TrustBar";
import { formatPrice } from "@/lib/format";
import { RESEARCH_USE_ATTESTATION } from "@/content/compliance";
import { PRICING_TIERS, DEFAULT_TIER_INDEX } from "@/content/pricing";

const CATEGORY_LABEL: Record<Category, string> = {
  "Incretin mimetics": "GLP-1 Peptides",
  "GH secretagogues":  "Growth Hormone",
  "Healing":           "Healing",
  "Cognition":         "Cognition",
  "Metabolic":         "Metabolic",
};

const PDP_TRUST = ["99.5%+ Purity", "Third-Party Tested", "2–3 Day Shipping", "Secure Checkout"];

/**
 * v3 Apple Swiss PDP — bone canvas, cream surface stack, amber accent.
 * Renders compliance bar → breadcrumb → hero (vial + info) → buybox + COA →
 * Proven & Tested → Order timeline → sticky add-to-cart bar.
 *
 * Sticky bar visibility (per design brief, verified against
 * docs/design-v3/project/PDP Hero - Apple Swiss.html lines 1672–1690):
 *   • Hidden when configurator is below viewport (user is on hero).
 *   • Hidden while configurator is in viewport (user is configuring).
 *   • Visible only once configurator has scrolled ABOVE viewport top:
 *     `!entry.isIntersecting && entry.boundingClientRect.top < 0`.
 *   • Hidden again when footer-sentinel enters viewport.
 */

const STATS = [
  {
    num: "≥99.5%",
    label: "HPLC Verified",
    source: "Reverse-phase C18 HPLC, in-house QC. Independent third-party confirmation per lot.",
  },
  {
    num: "≤0.5 Da",
    label: "MS Deviation",
    source: "ESI high-resolution mass spectrometry. Molecular identity confirmed per lot, reported in COA.",
  },
  {
    num: "<1.0 EU/mg",
    label: "Endotoxin Tested",
    source:
      "Limulus Amebocyte Lysate (LAL) assay per lot. Results included in downloadable Certificate of Analysis.",
  },
];

const TIMELINE = [
  {
    title: "Order confirmed",
    body: "Research eligibility verified. Your lot is allocated and reserved within 1 hour.",
  },
  {
    title: "COA released + dispatched",
    body: "Lot-specific Certificate of Analysis issued. Ships same or next business day.",
  },
  {
    title: "Delivered",
    body: "Lyophilized powder, stable at room temperature in transit. No cold-chain anxiety.",
  },
  {
    title: "Research-ready",
    body: "Reconstitute with bacteriostatic water. Stable 30+ days refrigerated post-reconstitution.",
  },
];

function StockPill({ stock, lowCount }: { stock: Product["stock"]; lowCount?: number }) {
  if (stock === "out") {
    return (
      <span className="v3pdp-pill-stock is-out">
        <span className="dot" />
        Waitlist
      </span>
    );
  }
  if (stock === "low") {
    return (
      <span className="v3pdp-pill-stock is-low">
        <span className="dot" />
        Low stock{typeof lowCount === "number" ? ` · ${lowCount} left` : ""}
      </span>
    );
  }
  return (
    <span className="v3pdp-pill-stock">
      <span className="dot" />
      In stock
    </span>
  );
}

export function PDPHero({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore();
  const [tierIdx, setTierIdx] = useState(DEFAULT_TIER_INDEX);
  const [doseIdx, setDoseIdx] = useState(() => {
    const i = product.variants.indexOf(product.dose);
    return i >= 0 ? i : 0;
  });
  const [qty, setQty] = useState(1);

  const tier = PRICING_TIERS[tierIdx]!;
  const variant = product.variants[doseIdx] ?? product.dose;

  // Variable products: per-dose price + per-dose WC variation id come from
  // variantMap. Falls back to variantPrices (static per-dose table) then the
  // parent price — identical priority chain to MobilePDP so desktop and mobile
  // always show the same number for the same dose selection.
  const variantEntry = product.variantMap?.[variant];
  const basePrice =
    variantEntry?.price ??
    product.variantPrices?.[variant] ??
    product.price;
  const effectiveWcId = variantEntry?.wcId ?? product.wcId;

  const unitPrice = basePrice * (1 - tier.discount);
  const tierTotal = unitPrice * tier.qty;
  const orderTotal = tierTotal * qty;
  const tierFullTotal = basePrice * tier.qty;

  const isOut = product.stock === "out";

  // ───── Sticky bar visibility — IntersectionObserver per design brief.
  const buyboxRef = useRef<HTMLDivElement | null>(null);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [buyboxAbove, setBuyboxAbove] = useState(false);
  const [footerIn, setFooterIn] = useState(false);
  const stickyVisible = buyboxAbove && !footerIn && !isOut;

  // Fire product_view exactly once per PDP mount, keyed on slug so a
  // client-side route change to a different SKU re-fires.
  useEffect(() => {
    trackProductView(product);
  }, [product]);

  useEffect(() => {
    const buyboxEl = buyboxRef.current;
    const footerEl = footerSentinelRef.current;
    if (!buyboxEl) return;

    const buyboxObs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Visible only once configurator has scrolled ABOVE viewport top.
        setBuyboxAbove(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.05 },
    );
    buyboxObs.observe(buyboxEl);

    let footerObs: IntersectionObserver | undefined;
    if (footerEl) {
      footerObs = new IntersectionObserver(
        ([entry]) => setFooterIn(Boolean(entry?.isIntersecting)),
        { threshold: 0 },
      );
      footerObs.observe(footerEl);
    }

    return () => {
      buyboxObs.disconnect();
      footerObs?.disconnect();
    };
  }, []);

  function scrollToBuybox() {
    buyboxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAddToCart() {
    if (isOut) return;
    const totalUnits = tier.qty * qty;
    for (let i = 0; i < totalUnits; i++) {
      addItem({
        slug: product.slug,
        compound: product.compound,
        name: product.name,
        dose: variant,
        price: unitPrice,
        priceLabel: formatPrice(unitPrice),
        wcId: effectiveWcId,
      });
    }
    // Analytics fire on user intent — local zustand has updated, the WC
    // mirror is already in flight from cart-store.addItem.  Tracking here
    // captures the click even if the WC sync later 401s; the event is
    // about user action, not backend success.
    trackAddToCart(product, variant, totalUnits, orderTotal, effectiveWcId);
    openCart();
  }

  const stickySummary = useMemo(() => {
    const parts = [tier.sub, "lyo"];
    return parts.join(" · ");
  }, [tier.sub, product.lot]);

  return (
    <div className="v3pdp">
      <TrustBar items={PDP_TRUST} />

      {/* Breadcrumb */}
      <nav className="v3pdp-container v3pdp-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href="/">Home</a>
          </li>
          <li className="sep">/</li>
          <li>
            <a href="/shop">Catalog</a>
          </li>
          <li className="sep">/</li>
          <li className="current">{product.compound}</li>
        </ol>
      </nav>

      <main className="v3pdp-container">
        {/* HERO */}
        <section className="v3pdp-hero">
          <div className="v3pdp-hero-grid">
            <div className="v3pdp-photo-card" data-vial-slug={product.slug}>
              <Image
                src={`/images/products/source/purepep-vial-${product.slug}-v1.0-cutout.png`}
                alt={`${product.compound} vial`}
                fill
                priority
                sizes="(max-width:900px) 100vw, 50vw"
                className="v3pdp-hero-img"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="v3pdp-photo-meta">
                <span>{product.sku}</span>
              </div>
            </div>

            <div className="v3pdp-info">
              {/* Amber category pill */}
              <div style={{ marginBottom: 16 }}>
                <span className="v3-cat-pill">
                  {CATEGORY_LABEL[product.category] ?? product.category}
                </span>
              </div>

              <div className="v3pdp-eyebrow-row">
                <span className="v3pdp-eyebrow">{product.name} · Lyophilized</span>
                <StockPill stock={product.stock} lowCount={product.lowCount} />
              </div>

              <h1 className="v3pdp-title">
                {product.compound} <span className="v3pdp-dose">· {variant}</span>
              </h1>

              <p className="v3pdp-lede">{product.description}</p>

              <hr className="v3pdp-divider" />

              <div className="v3pdp-eyebrow v3pdp-spec-eyebrow">Specification</div>
              <table className="v3pdp-spec">
                <tbody>
                  <tr>
                    <td className="label">Compound</td>
                    <td className="value">{product.name}</td>
                  </tr>
                  <tr>
                    <td className="label">Net mass</td>
                    <td className="value">{variant} lyophilized</td>
                  </tr>
                  <tr>
                    <td className="label">Purity</td>
                    <td className="value">{product.purity}</td>
                  </tr>
                  <tr>
                    <td className="label">Lot</td>
                    <td className="value is-mono">{product.lot}</td>
                  </tr>
                  <tr>
                    <td className="label">Storage</td>
                    <td className="value">{product.storage}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BUYBOX + COA */}
        <section className="v3pdp-below-hero">
          <div className="v3pdp-card v3pdp-buybox" id="v3pdp-buybox" ref={buyboxRef}>
            <h2>Configure your order</h2>
            <p className="v3pdp-buybox-sub">Choose tier, dose and quantity.</p>

            {/* Tier toggle */}
            <div className="v3pdp-tier-row" role="radiogroup" aria-label="Quantity tier">
              {PRICING_TIERS.map((t, i) => {
                const tierUnit = basePrice * (1 - t.discount);
                const tierSum = tierUnit * t.qty;
                const active = tierIdx === i;
                return (
                  <button
                    key={t.qty}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={clsx("v3pdp-tier", active && "is-active")}
                    onClick={() => setTierIdx(i)}
                  >
                    {t.badge && <div className="v3pdp-tier-badge">{t.badge}</div>}
                    <div className="v3pdp-tier-count">{t.label}</div>
                    <div className="v3pdp-tier-label">{t.sub}</div>
                    <div className="v3pdp-tier-price">{formatPrice(tierSum)}</div>
                    <div className="v3pdp-tier-save">{t.save}</div>
                  </button>
                );
              })}
            </div>

            {/* Dose */}
            <div className="v3pdp-dose-section">
              <span className="v3pdp-dose-label">Dose</span>
              <div className="v3pdp-dose-pills" role="radiogroup" aria-label="Dose">
                {product.variants.map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={doseIdx === i}
                    className={clsx("v3pdp-dose-pill", doseIdx === i && "is-active")}
                    onClick={() => setDoseIdx(i)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + price */}
            <div className="v3pdp-price-row">
              <div>
                <div className="v3pdp-dose-label" style={{ marginBottom: 8 }}>
                  Quantity
                </div>
                <div className="v3pdp-qty">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="num">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((n) => n + 1)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="v3pdp-price-block">
                <div className="v3pdp-price-now">{formatPrice(orderTotal)}</div>
                {tier.discount > 0 && (
                  <div className="v3pdp-price-meta">
                    <span className="v3pdp-price-was">{formatPrice(tierFullTotal * qty)}</span>
                    <span className="v3pdp-price-tag">−{Math.round(tier.discount * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              className="v3pdp-cta"
              onClick={handleAddToCart}
              disabled={isOut}
              aria-label={isOut ? "Out of stock" : `Add to cart, ${formatPrice(orderTotal)}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 7h14l-1.4 10.5a2 2 0 0 1-2 1.5H8.4a2 2 0 0 1-2-1.5L5 7Z" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              {isOut ? (
                "Out of stock — notify me"
              ) : (
                <>
                  Add to cart — <span className="v3pdp-cta-price">{formatPrice(orderTotal)}</span>
                  <span className="v3pdp-cta-arrow">→</span>
                </>
              )}
            </button>

            <div className="v3pdp-cta-secondary">
              <span>Ships in 2 business days</span>
              <span className="dot">·</span>
              <span>Carrier-tracked</span>
            </div>

            {/* Bankful compliance — research-use attestation under the CTA */}
            <p className="mx-auto mt-3 max-w-md text-center text-xs leading-relaxed text-ink/40">
              {RESEARCH_USE_ATTESTATION}
            </p>
          </div>

          {/* COA panel hidden */}
        </section>

        {/* Proven & Tested section hidden */}

        {/* From order to lab */}
        <section className="v3pdp-section" style={{ paddingTop: 0 }}>
          <div className="v3pdp-section-eyebrow">Order experience</div>
          <h2 className="v3pdp-section-headline">From order to lab.</h2>
          <p className="v3pdp-section-sub">
            What happens after you click Add to cart. No surprises, no cold-chain anxiety.
          </p>
          <div className="v3pdp-timeline-wrap">
            <div className="v3pdp-timeline">
              {TIMELINE.map((node, i) => (
                <div key={node.title} className="v3pdp-tl-node">
                  <div className="v3pdp-tl-circle">{i + 1}</div>
                  <div className="v3pdp-tl-card">
                    <h3 className="v3pdp-tl-title">{node.title}</h3>
                    <p className="v3pdp-tl-body">{node.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div ref={footerSentinelRef} aria-hidden="true" style={{ height: 1 }} />
      </main>

      {/* Sticky add-to-cart bar */}
      <div
        className={clsx("v3pdp-stickybar", stickyVisible && "is-visible")}
        role="region"
        aria-label="Add to cart bar"
      >
        <div className="v3pdp-stickybar-inner">
          <button type="button" className="v3pdp-sb-left" onClick={scrollToBuybox} aria-label="Back to configurator">
            <span className="v3pdp-sb-thumb">
              <RetaVialMini compound={product.compound} />
            </span>
            <span>
              <span className="v3pdp-sb-eyebrow">
                {product.compound} · {product.name}
              </span>
              <span className="v3pdp-sb-name">
                {product.name} · {variant} · {tier.qty} {tier.qty === 1 ? "vial" : "vials"}
              </span>
            </span>
          </button>
          <div className="v3pdp-sb-center">{stickySummary}</div>
          <div className="v3pdp-sb-right">
            <span className="v3pdp-sb-price">{formatPrice(orderTotal)}</span>
            <button
              type="button"
              className="v3pdp-sb-cta"
              onClick={handleAddToCart}
              disabled={isOut}
              aria-label={isOut ? "Out of stock" : "Add to cart"}
            >
              {isOut ? "Notify me" : "Add to cart"}
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
