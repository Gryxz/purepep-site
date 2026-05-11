/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Product, Category } from "@/data/products";
import { useCartStore } from "@/lib/cart-store";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import Image from "next/image";
import { MobileVial } from "./MobileVial";
import { MobileFooter } from "./MobileFooter";

/**
 * v5 mobile PDP — ported 1:1 from
 * docs/design-v3/mobile-mockups/PDP.html.
 *
 * Wiring:
 *  - useCartStore.addItem (per-qty, mirrors PDPHero pattern)
 *  - trackProductView fires on mount keyed on slug
 *  - trackAddToCart fires on Add to cart with computed total
 *  - product.variantMap drives per-dose price + WC variation id
 *
 * The mockup has no 1/3/5-vial tier toggle (mobile-simplified flow);
 * we keep the existing PDPHero tier system for desktop only.
 */
export function MobilePDP({ product, related }: { product: Product; related: Product[] }) {
  const { addItem, openCart } = useCartStore();
  const [doseIdx, setDoseIdx] = useState(() => {
    const i = product.variants.indexOf(product.dose);
    return i >= 0 ? i : 0;
  });
  const [qty, setQty] = useState(1);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const variant = product.variants[doseIdx] ?? product.dose;
  const variantEntry = product.variantMap?.[variant];
  // Price priority: WC variation map > static variantPrices > base price.
  // variantMap is populated when the upstream WC product is type:variable;
  // variantPrices is the static fallback so the UI still updates per
  // dose before WC variations are configured.
  const unitPrice =
    variantEntry?.price ??
    product.variantPrices?.[variant] ??
    product.price;
  const effectiveWcId = variantEntry?.wcId ?? product.wcId;
  const orderTotal = unitPrice * qty;
  const isOut = product.stock === "out";

  // Fire product_view exactly once per slug change.
  useEffect(() => {
    trackProductView(product);
  }, [product]);

  function handleAddToCart() {
    if (isOut) return;
    for (let i = 0; i < qty; i++) {
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
    trackAddToCart(product, variant, qty, orderTotal, effectiveWcId);
    openCart();
  }

  function carouselStep(dir: 1 | -1) {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector(".mob-more-card") as HTMLElement | null;
    const step = card ? card.offsetWidth + 12 : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div className="mob-app">
      {/* Trust strip — auto-loop marquee */}
      <div className="mob-trust-bar" data-mob-section="dark">
        <div className="mob-trust-track">
          <div className="mob-trust-item"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item"><span className="dot" />Secure Checkout</div>
          <div className="mob-trust-item"><span className="dot" />Lot-matched COA</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Secure Checkout</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Lot-matched COA</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="mob-crumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="sep">/</span>
        <a href="/shop">Shop</a>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </nav>

      {/* Product image */}
      <div className="mob-pdp-img">
        <Image
          src={`/products/${product.slug}/hero.png`}
          alt={`${product.compound} vial`}
          fill
          priority
          sizes="100vw"
          className="mob-pdp-hero-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Category pill */}
      <div className="mob-pdp-cat-pill">{categoryShort(product.category)}</div>

      <h1 className="mob-pdp-h1">{product.name}</h1>

      <div className="mob-pdp-sku">
        <span className="sku-label">SKU:</span>
        <span className="sku-val">{product.sku}</span>
      </div>

      <div className="mob-pdp-compliance">
        For In Vitro Research Use Only — Not for Human or Veterinary Application.
      </div>

      <div className="mob-pdp-rule" />

      <div className="mob-pdp-price-wrap">
        {product.regularPrice && product.regularPrice > product.price && (
          <span className="mob-pdp-sale-badge">
            Sale · Save ${Math.round(product.regularPrice - product.price)}
          </span>
        )}
        <div className="mob-pdp-price-row" style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span className="mob-pdp-price-big">{formatPrice(orderTotal)}</span>
          {product.regularPrice && product.regularPrice > product.price && (
            <span className="mob-pdp-price-strike">
              {formatPrice(product.regularPrice * qty)}
            </span>
          )}
        </div>
        <span className="mob-pdp-price-sub">
          {variant} vial · {isOut ? "out of stock" : product.stock === "low" ? "low stock" : "in stock"}
        </span>
      </div>

      {product.type === "stack" && product.stackComponents && (
        <div className="mob-pdp-stack-card">
          <div className="mob-pdp-stack-eyebrow">
            {product.stackComponents.length} separate vials · Not pre-mixed
          </div>
          <ul className="mob-pdp-stack-list">
            {product.stackComponents.map((c) => (
              <li key={c.compound} className="mob-pdp-stack-row">
                <span className="mob-pdp-stack-name">{c.name}</span>
                <span className="mob-pdp-stack-mass">{c.mass} vial</span>
              </li>
            ))}
            <li className="mob-pdp-stack-row mob-pdp-stack-total">
              <span className="mob-pdp-stack-name">Total per bundle</span>
              <span className="mob-pdp-stack-mass">{product.dose}</span>
            </li>
          </ul>
          <p className="mob-pdp-stack-note">
            Each peptide ships in its own sealed lyophilized vial with a
            single lot-matched COA covering both compounds. Reconstitute
            and store separately per protocol.
          </p>
        </div>
      )}

      <div className="mob-pdp-rule" />

      {/* Variant card */}
      <div className="mob-variant-card">
        <div className="mob-variant-label">{product.name}</div>
        <div className="mob-variant-select-wrap">
          <select
            className="mob-variant-select"
            value={variant}
            onChange={(e) => {
              const idx = product.variants.indexOf(e.target.value);
              if (idx >= 0) setDoseIdx(idx);
            }}
            aria-label="Dose"
          >
            {product.variants.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="mob-cta-row">
          <div className="mob-qty-stepper" role="group" aria-label="Quantity">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="qval" aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((n) => n + 1)}>
              +
            </button>
          </div>
          <button
            type="button"
            className="mob-buybox"
            onClick={handleAddToCart}
            disabled={isOut}
            aria-label={isOut ? "Out of stock" : `Add to cart, ${formatPrice(orderTotal)}`}
          >
            {isOut ? "Out of stock" : "Add to cart"}
          </button>
        </div>

        <div className="mob-trust-micro">
          <div className="mob-trust-line">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Damaged or lost in transit? <strong>We replace it.</strong> No questions asked.</span>
          </div>
          <div className="mob-trust-line">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>Third-party tested — <a href="/documentation">View Certificate of Analysis →</a></span>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <section className="mob-pdp-section">
        <h2>{product.name} — {variant}</h2>
        <p style={{ fontWeight: 600, color: "var(--m-ink)", fontSize: 15 }}>
          For In Vitro Research Use Only<br />Not for Human or Veterinary Application
        </p>
        <h3>Product Overview</h3>
        <p>{product.description}</p>
      </section>

      <section className="mob-pdp-section">
        <h2>Specifications</h2>
        <ul className="mob-spec-list">
          <li><strong>Quantity:</strong> {variant}</li>
          <li><strong>Form:</strong> Lyophilized powder</li>
          <li><strong>CAS:</strong> {product.cas}</li>
          <li><strong>Purity:</strong> {product.purity}</li>
          <li><strong>Storage:</strong> {product.storage}</li>
          <li><strong>Lot:</strong> {product.lot}</li>
        </ul>
      </section>

      <section className="mob-pdp-section">
        <h2>Intended Use</h2>
        <p>This compound is intended <strong>strictly for in vitro laboratory research</strong> by qualified professionals. It is <strong>not</strong> approved for:</p>
        <ul className="mob-disc-list">
          <li>Human use</li>
          <li>Veterinary use</li>
          <li>Food, drug, diagnostic, or cosmetic applications</li>
        </ul>
      </section>

      <section className="mob-pdp-section">
        <h2>Regulatory Disclaimer</h2>
        <ul className="mob-disc-list">
          <li>This compound has <strong>not been evaluated by the U.S. Food and Drug Administration (FDA)</strong>.</li>
          <li>It is <strong>not intended to diagnose, treat, cure, or prevent any disease</strong>.</li>
          <li>All handling and use must comply with applicable <strong>institutional, local, state, and federal regulations</strong>.</li>
        </ul>
      </section>

      <section className="mob-pdp-section">
        <h2>Terms of Sale</h2>
        <p>By purchasing from <strong>PurePep</strong>, the buyer confirms that they are a <strong>qualified researcher, laboratory, or institution</strong> and acknowledge that the product is for research use only.</p>
        <ul className="mob-disc-list">
          <li><strong>All sales are final.</strong></li>
          <li>The purchaser assumes full responsibility for compliant handling, storage, and use.</li>
          <li>Resale for human consumption is strictly prohibited.</li>
        </ul>
      </section>

      {/* Often paired with — first related product (eyebrow dropped). */}
      {related[0] && (
        <div className="mob-paired-band">
          <h2 className="mob-paired-h2">Often paired with</h2>
          <a href={`/shop/${related[0].slug}`} className="mob-paired-card">
            <div className="mob-paired-thumb">{related[0].compound[0]}</div>
            <div className="mob-paired-info">
              <div className="mob-paired-name">{related[0].name} ({related[0].dose})</div>
              <div className="mob-paired-price">{formatPrice(related[0].price)}</div>
              <span className="mob-paired-add">View product →</span>
            </div>
          </a>
        </div>
      )}

      {/* More from catalog carousel */}
      {related.length > 1 && (
        <div className="mob-more-band">
          <div className="mob-more-eyebrow">More from the catalog</div>
          <h2 className="mob-more-h2">Related products</h2>
          <div className="mob-more-carousel-wrap">
            <button type="button" className="mob-carousel-arrow is-prev" aria-label="Previous" onClick={() => carouselStep(-1)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="mob-more-carousel" ref={carouselRef}>
              {related.map((p) => (
                <a key={p.slug} href={`/shop/${p.slug}`} className="mob-more-card">
                  <div className="mob-more-img">
                    <span className="mob-more-cat-pill">{categoryShort(p.category)}</span>
                    <span className={`mob-more-stock ${p.stock === "low" ? "is-low" : "is-in"}`}>
                      <span className="sd" />
                      {p.stock === "low" ? "Low stock" : "In stock"}
                    </span>
                    <MobileVial size="md" compound={p.compound} mass={p.dose} purity="≥99.5%" />
                  </div>
                  <div className="mob-more-body">
                    <div className="mob-more-name">{p.name}</div>
                    <div className="mob-more-desc">{shortDesc(p)}</div>
                    <div className="mob-more-price-row">
                      <span className="mob-more-price">{formatPrice(p.price)}</span>
                      <span className="mob-more-arr-btn">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button type="button" className="mob-carousel-arrow is-next" aria-label="Next" onClick={() => carouselStep(1)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <MobileFooter />
    </div>
  );
}

function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

function categoryShort(c: Category): string {
  switch (c) {
    case "Incretin mimetics": return "GLP-1 Peptides";
    case "GH secretagogues":  return "Growth Hormone";
    case "Healing":           return "Healing";
    case "Cognition":         return "Cognition";
    case "Metabolic":         return "Metabolic";
  }
}

function shortDesc(p: Product): string {
  const first = p.description.split(".")[0] ?? p.name;
  return first.length > 60 ? first.slice(0, 57) + "..." : first + ".";
}
