/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef } from "react"; // useEffect/useRef kept for RETA parallax (re-enable via RETA_FEATURE_ENABLED)
import type { Product } from "@/data/products";
import Image from "next/image";
import { MobileVial } from "./MobileVial";
import { MobileRetaSpotlight } from "./MobileRetaSpotlight";
import { MobileFooter } from "./MobileFooter";
import { TestimonialsSection } from "../v3/TestimonialsSection";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics";
import {
  stockLabel,
  STACK_BADGE_LABEL,
  categoryShort,
  shortDesc,
  CATALOG_REQUEST_CTA,
} from "@/content/catalog";
import { REFERRAL } from "@/content/referral";

/**
 * v5 mobile homepage — ported 1:1 from
 * docs/design-v3/mobile-mockups/Home.html.
 *
 * Sections:
 *   1. Trust strip (4 items)
 *   2. Hero (cinematic dark, layered amber gradient mesh + dot grid +
 *      corner ornaments + eyebrow pill + 42px H1 + deck + 2 CTAs +
 *      compliance badge)
 *   3. Spotlight — featured RETA product card (linked to /shop/reta)
 *   4. Catalog teaser — 2-col grid of remaining products
 *   5. Transparency — 3 stacked editorial cards
 *   6. Process — dark 4-step timeline "From order to lab"
 *   7. Referral — full-bleed amber framed card with stats
 *   8. Dark CTA — "Need a compound that isn't listed?"
 *   9. MobileFooter
 */
// Reta flagship/spotlight treatment disabled for now.  Flip to true
// to restore pane 2 (RETA flagship hero) + the MobileRetaSpotlight
// section.  Gates retained (JSX not deleted) so re-enabling is a
// one-line change; the .mob-heropx--solo CSS modifier collapses the
// hero to a single pane while disabled.
const RETA_FEATURE_ENABLED = false;

export function MobileHomePage({ products }: { products: Product[] }) {
  // Featured product is the first product (RETA in the canonical fixture).
  // Fall back to undefined-safe so an empty catalog doesn't crash the page.
  const featured = products[0];
  // Catalog teaser: every single-peptide + BAC water.  When the Reta
  // feature is disabled, Reta is no longer the flagship so it joins
  // the grid as a normal product (include products[0]); otherwise it
  // owns the hero and is skipped.  Stacks always excluded — they get
  // the "Best-selling bundles" rail.
  const rest = (RETA_FEATURE_ENABLED ? products.slice(1) : products)
    .filter((p) => p.type !== "stack")
    .slice(0, 8);
  const { addItem, openCart } = useCartStore();

  /** Tile / bundle quick-add — bypasses the wrapping <a href> via
   *  preventDefault + stopPropagation so clicking the button adds
   *  to cart instead of navigating to the PDP.  Image + name still
   *  click through to the PDP. */
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
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  // Hero parallax — tracks scroll progress through the 2-viewport stack and
  // writes it into a CSS variable.  Pane 1 (lab + headline) fades out; pane
  // 2 (vial + brand + amber CTA) fades in.  Multiplier 1.6 means the fade
  // settles to fully-on/fully-off before the user reaches either edge of
  // the stack — gives a clean "rest" state at top and bottom of the
  // parallax instead of a continuous fade through the whole range.
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    // Cache vh between scroll events; only re-read on resize.  Reading
    // window.innerHeight inside the per-frame update was forcing layout
    // queries that don't need to happen 60×/sec.
    let vh = window.innerHeight;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      // Stack is 160vh; panes stick for ~60vh of scroll.  Front-load the
      // fade — divide by 0.25 * vh so progress hits 1 by ~25vh of
      // scroll.  Combined with the CSS clamp() multipliers, pane 2
      // reaches full opacity early and then sits fully on for the
      // remaining ~35vh of stick range — "feature shows up longer".
      const raw = -rect.top / (vh * 0.25);
      const p = Math.max(0, Math.min(1, raw));
      el.style.setProperty("--mob-px-p", p.toFixed(4));

      // Catalog lift removed.  Every scroll-driven transform on the
      // catalog (regardless of single-curve smoothness) was producing
      // perceived chop on iOS Safari — the section is tall and its
      // bone+gradient bg with the cards inside is expensive to
      // recomposite each frame, even with translate3d / GPU hints.
      // Pure natural scroll has no chop and the catalog still appears
      // at the right time because the parallax stack ends right where
      // the catalog begins.
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      vh = window.innerHeight;
      onScroll();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="mob-app">
      {/* Trust strip — first scrollable element, sits flush under the
          fixed glass header on load. */}
      <div className="mob-trust-bar" data-mob-section="dark">
        <div className="mob-trust-track">
          <div className="mob-trust-item"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item"><span className="dot" />Free over $200</div>
          <div className="mob-trust-item"><span className="dot" />US Warehouse</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Free over $200</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />US Warehouse</div>
        </div>
      </div>

      {/* Hero */}
      <section
        className="mob-hero-v2"
        data-mob-section="dark"
        aria-label="Hero: research-grade peptides"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width).toFixed(3));
          e.currentTarget.style.setProperty("--my", ((e.clientY - r.top)  / r.height).toFixed(3));
        }}
      >
        {/* Ghost watermark — decorative background text */}
        <span className="mob-hero-v2-ghost" aria-hidden="true">PEPTIDES</span>

        {/* Back-layer vials — sit behind the headline */}
        <div className="mob-hero-v2-back" aria-hidden="true">
          {(["tirz", "bpc-157"] as const).map((slug, i) => (
            <span key={slug} className={`mob-hero-v2-vial back-v${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/products/source/purepep-vial-${slug}-v1.0-cutout.png`} alt="" className="mob-hero-v2-vial-img" />
            </span>
          ))}
        </div>

        {/* Typography — headline sits between vial layers (z:2) */}
        <div className="mob-hero-v2-content">
          <p className="mob-hero-v2-meta">Lab-verified · Research use only</p>
          <h1 className="mob-hero-v2-h1">
            <em className="mob-hero-v2-line1" style={{ display: "block" }}>The</em>
            <strong className="mob-hero-v2-line2" style={{ display: "block" }}>standard.</strong>
          </h1>
        </div>

        {/* CTA layer — always above vials (z:4), sits right under headline */}
        <div className="mob-hero-v2-cta-layer">
          <a href="/shop" className="mob-hero-v2-cta">
            Shop the catalog
            <svg className="mob-hero-v2-cta-arrow" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <p className="mob-hero-v2-spec">≥ 99.5% HPLC · Lyophilized</p>
        </div>

        {/* Front-layer vials — punch through / over the headline */}
        <div className="mob-hero-v2-front" aria-hidden="true">
          {(["sema", "cagri"] as const).map((slug, i) => (
            <span key={slug} className={`mob-hero-v2-vial front-v${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/products/source/purepep-vial-${slug}-v1.0-cutout.png`} alt="" className="mob-hero-v2-vial-img" />
            </span>
          ))}
          {/* Pointer-driven amber light wash — mix-blend-mode: overlay colours the vials */}
          <span className="mob-hero-v2-light" aria-hidden="true" />
        </div>
      </section>

      {/* Retatrutide research profile — hidden for now, gated on
          RETA_FEATURE_ENABLED (false).  Component + props retained so
          re-enabling is a one-line flip. */}
      {RETA_FEATURE_ENABLED && <MobileRetaSpotlight products={products} />}

      {/* stacks/bundles section hidden */}

      {/* Catalog teaser — eyebrow dropped (the section header is enough). */}
      <section className="mob-catalog-section">
        <div className="mob-catalog-header">
          <div className="mob-catalog-h-row">
            <h2 className="mob-catalog-h">The catalog</h2>
            <a href="/shop" className="mob-catalog-all">View all →</a>
          </div>
        </div>
        <div className="mob-pgrid">
          {rest.map((p) => (
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
      </section>

      {/* transparency section hidden */}

      {/* Testimonials — temporarily hidden */}
      {/* <TestimonialsSection /> */}

      {/* Process timeline — eyebrow dropped, declarative headline + tightened sub. */}
      <section className="mob-process" data-mob-section="dark">
        <div className="mob-process-header">
          <h2 className="mob-process-h">From order to your lab</h2>
          <p className="mob-process-sub">
            What happens after you tap Add to cart. No cold-chain anxiety.
          </p>
        </div>
        <div className="mob-timeline">
          <div className="mob-tstep">
            <div className="mob-tstep-num">1</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">Within 1 hour</div>
              <h3 className="mob-tstep-h">Order confirmed</h3>
              <p className="mob-tstep-cap">
                Research eligibility verified. Your lot is allocated and reserved against your order.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">2</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">Same / next business day</div>
              <h3 className="mob-tstep-h">Packed + dispatched</h3>
              <p className="mob-tstep-cap">
                Tracked package leaves the US warehouse same or next business day.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">3</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">2–3 days</div>
              <h3 className="mob-tstep-h">Delivered</h3>
              <p className="mob-tstep-cap">
                Lyophilized powder, stable at room temperature in transit. Discreet, unbranded packaging.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">4</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">In your lab</div>
              <h3 className="mob-tstep-h">Research-ready</h3>
              <p className="mob-tstep-cap">
                Reconstitute with bacteriostatic water. Stable 30+ days refrigerated post-reconstitution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* referral section hidden */}

      {/* Dark CTA — declarative headline + tightened body. */}
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
      </section>

      <MobileFooter />
    </div>
  );
}

/** Compact technical spec line: receptor profile + structure + form. */
function shortSpec(p: Product): string {
  const knownSpec: Record<string, string> = {
    RETA: "Triple GLP-1 / GIP / glucagon agonist",
    SEMA: "GLP-1 receptor agonist · 31 amino acids · Lyophilized",
    TIRZ: "Dual GLP-1 / GIP agonist · 39 amino acids · Lyophilized",
    CAGRI: "Long-acting amylin analogue · Lyophilized",
    SURVO: "Dual GLP-1 / glucagon agonist · Lyophilized",
    BPC: "Pentadecapeptide · 15 amino acids · Lyophilized",
    "BPC-157": "Pentadecapeptide · 15 amino acids · Lyophilized",
    "TB-500": "Thymosin β-4 fragment · 17 amino acids · Lyophilized",
    TB500: "Thymosin β-4 fragment · 17 amino acids · Lyophilized",
    IPAM: "GH secretagogue pentapeptide · Lyophilized",
    BACW: "0.9% benzyl alcohol bacteriostatic water · Sterile-filtered",
  };
  return knownSpec[p.compound] ?? `${p.purity.replace(/\s*\(.*\)$/, "")} · Lyophilized`;
}
