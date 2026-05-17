/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { padded2, plural } from "@/lib/text";
import type { Product } from "@/data/products";
import Image from "next/image";
import Link from "next/link";
import { RetaVial } from "./RetaVial";
import { LabelCropSvg } from "./LabelCropSvg";
import { TestimonialsSection } from "./TestimonialsSection";

/**
 * v3 Apple Swiss Homepage.
 *
 * Sections (from docs/design-v3/project/Homepage - Apple Swiss.html):
 *   1. Cinematic vial hero (55/45 desktop, stacked mobile)
 *   2. Featured compound band — 60/40 grid with label-crop visual
 *   3. Stat grid — Specifications we publish (4-up)
 *   4. Catalog teaser — section head row, horizontal product rail with snap +
 *      progress fill, expand tab that toggles a 3-col grid of all 9 products
 *   5. From-order-to-lab timeline (reuses .v3pdp-timeline classes)
 *   6. Documentation strip (3-card band on surface-4)
 *   7. Closing CTA
 */
export function HomePage({ products }: { products: Product[] }) {
  const featured = products[0];
  const railRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState({ width: 33, left: 0 });
  const [expanded, setExpanded] = useState(false);
  const expandRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const pct = max > 0 ? el.scrollLeft / max : 0;
      const windowPct = el.clientWidth / el.scrollWidth;
      const fillPct = Math.max(windowPct * 100, 18);
      setProgress({ width: fillPct, left: pct * (100 - fillPct) });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function railStep(dir: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    const tile = el.querySelector(".v3-tile") as HTMLElement | null;
    const step = tile ? tile.getBoundingClientRect().width + 24 : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div className="v3-shop">
      {/* ───── Cinematic Hero ───── */}
      <section className="v3home-hero">
        <div className="v3home-hero-grid">
          <div className="v3home-hero-stage">
            <div className="v3home-corner tl">
              {featured ? `01 / ${padded2(products.length)} — ${featured.compound}` : "Research grade"}
            </div>
            {featured && (
              <RetaVial
                compound={featured.compound}
                dose={featured.dose}
                lot={featured.lot}
                storage={featured.storage}
              />
            )}
            <div className="v3home-corner bl">Lyophilized · Research use only</div>
          </div>

          <div className="v3home-hero-info">
            <p className="v3home-hero-eyebrow">Research-grade peptides</p>
            <h1 className="v3home-hero-headline">
              Specifications,
              <br />
              not slogans.
            </h1>
            <p className="v3home-hero-deck">
              Every lot ships with a matched Certificate of Analysis. Purity by HPLC. Identity by mass spectrometry.
              Endotoxin by LAL. That is the entire pitch.
            </p>
            <div className="v3home-hero-cta-row">
              <a href="/shop" className="v3-pill v3-pill-primary">
                Browse the catalog <span className="arrow">→</span>
              </a>
              <a href="/quality" className="v3-pill v3-pill-ghost">
                Read a sample COA
              </a>
            </div>

            <div className="v3home-hero-data">
              <div>
                <div className="lbl">Purity</div>
                <div className="val">≥99.5%</div>
              </div>
              <div>
                <div className="lbl">Mass</div>
                <div className="val">≤0.5 Da</div>
              </div>
              <div>
                <div className="lbl">Endotoxin</div>
                <div className="val">&lt;1.0 EU/mg</div>
              </div>
              <div>
                <div className="lbl">Lots</div>
                <div className="val">LAL-tested</div>
              </div>
            </div>

            <div className="v3home-hero-stamp">Sample COA released 2026-04-12</div>
          </div>
        </div>
      </section>

      {/* ───── Featured compound ───── */}
      {featured && (
        <section className="v3home-featured-band">
          <div className="v3-container">
            <div className="v3home-featured-grid">
              <div>
                <p className="v3-section-eyebrow">
                  Featured · 01 / {padded2(products.length)}
                </p>
                <h2 className="v3home-featured-headline">
                  {featured.name}. The current frontier for metabolic research.
                </h2>
                <p className="v3home-featured-body">
                  Triple GLP-1 / GIP / glucagon agonist, 39-amino-acid peptide. Supplied as lyophilized powder in a
                  stoppered glass vial. Available in 1, 3, and 5-vial configurations, each shipped with a lot-matched
                  Certificate of Analysis.
                </p>
                <div className="v3home-featured-ctas">
                  <a href={`/shop/${featured.slug}`} className="v3-pill v3-pill-primary">
                    View {featured.name} <span className="arrow">→</span>
                  </a>
                  <a href="/shop" className="v3-pill v3-pill-ghost">
                    Compare configurations
                  </a>
                </div>
              </div>
              <div className="v3home-label-crop" aria-label={`${featured.compound} label close-up`}>
                <LabelCropSvg
                  compound={featured.compound}
                  dose={featured.dose}
                  lot={featured.lot}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───── Proven & Tested ───── */}
      <section className="v3-section">
        <div className="v3-container">
          <p className="v3-section-eyebrow">The standard</p>
          <h2 className="v3-section-headline">Specifications we publish.</h2>
          <p className="v3-section-sub">
            Analytical specifications verified per lot. No marketing math, no rounded promises — just the numbers from
            the instruments.
          </p>

          <div className="v3-stat-grid">
            <div className="v3-stat-card">
              <div className="v3-stat-num">≥99.5%</div>
              <div className="v3-stat-label">HPLC Verified</div>
              <div className="v3-stat-source">
                Reverse-phase C18 HPLC, in-house QC. Independent third-party confirmation per lot.
              </div>
            </div>
            <div className="v3-stat-card">
              <div className="v3-stat-num">≤0.5 Da</div>
              <div className="v3-stat-label">MS Deviation</div>
              <div className="v3-stat-source">
                ESI high-resolution mass spectrometry. Molecular identity confirmed per lot, reported in COA.
              </div>
            </div>
            <div className="v3-stat-card">
              <div className="v3-stat-num">&lt;1.0 EU/mg</div>
              <div className="v3-stat-label">Endotoxin Tested</div>
              <div className="v3-stat-source">
                Limulus Amebocyte Lysate (LAL) assay per lot. Results included in downloadable Certificate of Analysis.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Testimonials ───── */}
      <TestimonialsSection />

      {/* ───── Best-selling bundles ───── */}
      {(() => {
        const stacks = products.filter((p) => p.type === "stack");
        if (stacks.length === 0) return null;
        return (
          <section className="v3-section v3-bundles-section">
            <div className="v3-container">
              <div className="v3-section-head-row">
                <div>
                  <p className="v3-section-eyebrow">Research bundles</p>
                  <h2 className="v3-section-headline">Best-selling stacks.</h2>
                </div>
                <a href="/shop" className="v3-pill v3-pill-primary v3-pill-sm">
                  View all bundles <span className="arrow">→</span>
                </a>
              </div>
              <div className="v3-bundles-grid">
                {stacks.map((p) => (
                  <Link key={p.slug} href={`/shop/${p.slug}`} className="v3-bundle-card">
                    <div className="v3-bundle-photo">
                      <span className="v3-bundle-badge">Bundle · Save</span>
                      <Image
                        src={`/images/products/source/purepep-vial-${p.slug}-v1.0.jpg`}
                        alt={`${p.compound} bundle`}
                        fill
                        sizes="(max-width:900px) 100vw, 33vw"
                        className="v3-product-hero-img"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="v3-bundle-info">
                      <div className="v3-bundle-name">{p.name}</div>
                      <div className="v3-bundle-components">{p.stackComponents?.map((c) => c.compound).join(" + ")}</div>
                      <div className="v3-bundle-foot">
                        <span className="v3-bundle-price">${Math.round(p.price)}</span>
                        {p.regularPrice && p.regularPrice > p.price && (
                          <span className="v3-bundle-was">${Math.round(p.regularPrice)}</span>
                        )}
                        <span className="v3-bundle-cta">View bundle →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ───── Catalog teaser rail + expand ───── */}
      <section className="v3-section" style={{ paddingTop: 0 }}>
        <div className="v3-container">
          <div className="v3-section-head-row">
            <div>
              <p className="v3-section-eyebrow">Catalog</p>
              <h2 className="v3-section-headline">
                {plural(products.length, "compound")}.
                <br />
                One standard.
              </h2>
            </div>
            <a href="/shop" className="v3-pill v3-pill-primary v3-pill-sm">
              See all {plural(products.length, "peptide")} <span className="arrow">→</span>
            </a>
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <span
              className="v3-rail-hint"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--v3-ink-60)",
              }}
            >
              ← Scroll horizontally · {String(products.length).padStart(2, "0")} products
            </span>
            <div style={{ display: "inline-flex", gap: 8 }}>
              <button
                type="button"
                className="v3-arrow-btn is-sm"
                aria-label="Scroll rail left"
                onClick={() => railStep(-1)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                className="v3-arrow-btn is-sm"
                aria-label="Scroll rail right"
                onClick={() => railStep(1)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="v3-rail-viewport" ref={railRef}>
            <div className="v3-rail-track">
              {products.map((p) => (
                <ProductTile key={p.slug} product={p} />
              ))}
            </div>
          </div>
          <div className="v3-rail-progress-track">
            <div
              className="v3-rail-progress-fill"
              style={{ width: `${progress.width}%`, left: `${progress.left}%` }}
            />
          </div>

          <button
            type="button"
            className={clsx("v3-expand-tab", expanded && "is-open")}
            aria-expanded={expanded}
            onClick={() => {
              setExpanded((e) => !e);
              const el = expandRegionRef.current;
              if (el) {
                if (!expanded) el.style.maxHeight = el.scrollHeight + "px";
                else el.style.maxHeight = "0px";
              }
            }}
          >
            <span>{expanded ? "Collapse" : `Expand all 0${products.length}`}</span>
            <span aria-hidden="true">·</span>
            <span className="chev" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
          <div className="v3-expand-region" ref={expandRegionRef}>
            <div className="v3-expand-grid">
              {products.map((p) => (
                <ProductTile key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── From order to lab timeline ───── */}
      <section className="v3-section" style={{ paddingTop: 0 }}>
        <div className="v3-container">
          <p className="v3-section-eyebrow">Logistics</p>
          <h2 className="v3-section-headline">From order to lab.</h2>
          <p className="v3-section-sub">
            What happens after Add to cart. No surprises, no cold-chain anxiety.
          </p>

          <div className="v3pdp-timeline-wrap">
            <div className="v3pdp-timeline">
              {[
                ["Order confirmed", "Research eligibility verified. Your lot is allocated and reserved within 1 hour."],
                ["COA released + dispatched", "Lot-specific Certificate of Analysis issued. Ships same or next business day."],
                ["Delivered", "Lyophilized powder, stable at room temperature in transit. No cold-chain anxiety."],
                ["Research-ready", "Reconstitute with bacteriostatic water. Stable 30+ days refrigerated post-reconstitution."],
              ].map(([title, body], i) => (
                <div key={title} className="v3pdp-tl-node">
                  <div className="v3pdp-tl-circle">{i + 1}</div>
                  <div className="v3pdp-tl-card">
                    <h3 className="v3pdp-tl-title">{title}</h3>
                    <p className="v3pdp-tl-body">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Documentation strip ───── */}
      <section className="v3-docs-band">
        <div className="v3-container">
          <div className="v3-docs-grid">
            <a href="/quality#methods" className="v3-doc-card">
              <div className="v3-doc-num">01 — Methods</div>
              <h3 className="v3-doc-title">How we test every lot</h3>
              <div className="v3-doc-foot">
                <span>Read methods</span>
                <span className="arrow">→</span>
              </div>
            </a>
            <a href="/quality#sample-coa" className="v3-doc-card">
              <div className="v3-doc-num">02 — Sample COA</div>
              <h3 className="v3-doc-title">Read a real Certificate of Analysis</h3>
              <div className="v3-doc-foot">
                <span>Open sample</span>
                <span className="arrow">→</span>
              </div>
            </a>
            <a href="/researcher-access" className="v3-doc-card">
              <div className="v3-doc-num">03 — Researcher verification</div>
              <h3 className="v3-doc-title">21+ qualified researchers only</h3>
              <div className="v3-doc-foot">
                <span>Verify access</span>
                <span className="arrow">→</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ───── Referral teaser ───── */}
      <section className="v3-section v3-referral-teaser">
        <div className="v3-container">
          <div className="v3-ref-teaser-grid">
            <div className="v3-ref-teaser-left">
              <p className="v3-section-eyebrow">Researcher referral</p>
              <h2 className="v3-ref-teaser-h">Refer a colleague. Both of you save $25.</h2>
              <p className="v3-ref-teaser-body">Share your personal referral link. Your colleague gets $25 off their first order. You receive $25 store credit when their order ships.</p>
              <div className="v3-ref-teaser-ctas">
                <a href="/referral" className="v3-pill v3-pill-primary">Get your referral link <span className="arrow">→</span></a>
                <a href="/referral" className="v3-pill v3-pill-ghost">Learn about the program</a>
              </div>
            </div>
            <div className="v3-ref-teaser-stats">
              <div className="v3-ref-stat">
                <div className="v3-ref-stat-num">$25</div>
                <div className="v3-ref-stat-label">Off their first order</div>
              </div>
              <div className="v3-ref-stat">
                <div className="v3-ref-stat-num">$25</div>
                <div className="v3-ref-stat-label">Credit to your account</div>
              </div>
              <div className="v3-ref-stat">
                <div className="v3-ref-stat-num">∞</div>
                <div className="v3-ref-stat-label">No referral cap</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Closing CTA ───── */}
      <section className="v3-closing">
        <div className="v3-container">
          <p className="v3-closing-eyebrow">Ready when you are</p>
          <h2 className="v3-closing-headline">Open the catalog.</h2>
          <a href="/shop" className="v3-pill v3-pill-primary">
            Browse {plural(products.length, "peptide")} <span className="arrow">→</span>
          </a>
          <div className="v3-closing-stamp">
            For research use only · Not for human consumption · Sales final
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  const stockClass =
    product.stock === "low" ? "is-low" : product.stock === "out" ? "is-wait" : "";
  const stockLabel =
    product.stock === "out" ? "Waitlist" : product.stock === "low" ? "Low stock" : "In stock";
  const showDot = product.stock !== "out";

  return (
    <a href={`/shop/${product.slug}`} className="v3-tile">
      <div className="v3-tile-photo">
        <Image
          src={product.imageUrl ?? `/images/products/source/purepep-vial-${product.slug}-v1.0.jpg`}
          alt={`${product.compound} vial`}
          fill
          sizes="(max-width:600px) 50vw, 25vw"
          className="v3-product-hero-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="v3-tile-content">
        <div className="v3-meta-row">
          <span className="v3-sku-line">
            <span className="sku">{product.compound}</span>
            <span className="sep">·</span>
            <span className="generic">{product.name}</span>
          </span>
          <span className={clsx("v3-stock", stockClass)}>
            {showDot && <span className="dot" />}
            {stockLabel}
          </span>
        </div>
        <h3 className="v3-tile-name">{product.name}</h3>
        <p className="v3-tile-sub">{product.description.split(".")[0]}.</p>
        <div className="v3-mini-spec">
          <div>
            <div className="lbl">Purity</div>
            <div className="val">{product.purity.replace(/\s*\(.*\)$/, "")}</div>
          </div>
          <div>
            <div className="lbl">Net mass</div>
            <div className="val">{product.dose}</div>
          </div>
        </div>
        <div className="v3-action-row">
          <div>
            <div className="v3-tile-price">${Math.round(product.price)}</div>
            <div className="v3-price-from">From · 1 vial</div>
          </div>
          <span className="v3-view-pill">
            View
            <span className="arrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}
