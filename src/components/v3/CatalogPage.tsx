/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import type { Product, Category } from "@/data/products";
import Image from "next/image";
import { RetaVial } from "./RetaVial";
import { TrustBar } from "./TrustBar";

type ChipKey = "all" | "glp1" | "growth" | "repair" | "cosmetic" | "blends";

const CHIPS: { key: ChipKey; label: string; categories: Category[] | "all" }[] = [
  { key: "all",      label: "All",             categories: "all" },
  { key: "glp1",     label: "GLP-1",           categories: ["Incretin mimetics"] },
  { key: "growth",   label: "Growth",          categories: ["GH secretagogues"] },
  { key: "repair",   label: "Repair",          categories: ["Healing"] },
  { key: "cosmetic", label: "Cosmetic",        categories: ["Healing"] },
  { key: "blends",   label: "Research blends", categories: ["Metabolic", "Cognition"] },
];

export function CatalogPage({ products }: { products: Product[] }) {
  const [chip, setChip] = useState<ChipKey>("all");
  const [slide, setSlide] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState({ width: 33, left: 0 });

  const featured = products.slice(0, 3);

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

  function goTo(i: number) {
    setSlide(((i % featured.length) + featured.length) % featured.length);
  }

  function railStep(dir: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    const tile = el.querySelector(".v3-tile") as HTMLElement | null;
    const step = tile ? tile.getBoundingClientRect().width + 24 : el.clientWidth;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <div className="v3-shop">
      <TrustBar />
      <main className="v3-container">

        {/* ── Page intro ── */}
        <section className="v3cat-intro">
          <div className="eyebrow">Catalog</div>
          <h1>Research-grade peptides.</h1>
          <p>
            Lyophilized, lot-tested, shipped with a matched Certificate of Analysis. No marketing math — just
            specifications.
          </p>
        </section>

        {/* ── Filter / sort ── */}
        <div className="v3cat-filterbar">
          <div className="v3cat-chips" role="tablist" aria-label="Filter peptides">
            {CHIPS.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={chip === c.key}
                className={clsx("v3cat-chip", chip === c.key && "is-active")}
                onClick={() => setChip(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" className="v3cat-sort-btn" aria-label="Sort">
            Sort · Featured
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <hr className="v3cat-filterbar-divider" />

        {/* ── Featured carousel ── */}
        <section className="v3cat-featured" aria-label="Featured peptides">
          <div className="v3-section-head-row" style={{ marginBottom: 24 }}>
            <p className="v3-section-eyebrow">Featured</p>
          </div>
          <div className="v3cat-featured-stage">
            <button
              type="button"
              className="v3-arrow-btn v3cat-featured-arrow prev"
              aria-label="Previous featured product"
              onClick={() => goTo(slide - 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              className="v3-arrow-btn v3cat-featured-arrow next"
              aria-label="Next featured product"
              onClick={() => goTo(slide + 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
            <div
              className="v3cat-featured-track"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {featured.map((p) => (
                <FeaturedSlide key={p.slug} product={p} />
              ))}
            </div>
          </div>
          <div className="v3cat-featured-pagination">
            <div className="v3cat-pag-bars">
              {featured.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={clsx("v3cat-pag-bar", i === slide && "is-active")}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <span className="v3cat-pag-count">
              {String(slide + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
            </span>
          </div>
        </section>

        {/* ── All peptides — horizontal rail ── */}
        <section className="v3cat-rail-section" aria-label="All peptides">
          <div className="v3cat-rail-head">
            <p className="v3-section-eyebrow">All peptides</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 20 }}>
              <span className="v3cat-section-aside">
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
        </section>

        <hr className="v3cat-footnote-divider" />
        <div className="v3cat-footnote">
          All products sold for laboratory research use only · Not for human or animal consumption
        </div>
      </main>

      {/* ── For Research Teams CTA ── */}
      <div className="v3-dark-cta">
        <div className="v3-dark-cta-eyebrow">For Research Teams</div>
        <h2 className="v3-dark-cta-h">
          Need a compound <em>that isn&apos;t listed?</em>
        </h2>
        <p className="v3-dark-cta-body">
          We regularly source and synthesize additional peptides for labs and repeat buyers. Reach out with your
          spec — we&apos;ll get back within one business day.
        </p>
        <div className="v3-dark-cta-btns">
          <a href="/legal/contact" className="v3-dark-cta-btn-primary">
            Request a quote →
          </a>
          <a href="/documentation" className="v3-dark-cta-btn-secondary">
            View all COAs
          </a>
        </div>
      </div>
    </div>
  );
}

function FeaturedSlide({ product }: { product: Product }) {
  return (
    <div className="v3cat-featured-slide">
      <div className="v3cat-featured-photo">
        <Image
          src={product.imageUrl ?? `/images/products/source/purepep-vial-${product.slug}-v1.0.jpg`}
          alt={`${product.compound} vial`}
          fill
          sizes="(max-width:900px) 100vw, 40vw"
          className="v3-product-hero-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="v3-tile-shadow" />
      </div>
      <div className="v3cat-featured-info">
        <div className="v3-meta-row">
          <span className="v3-sku-line">
            <span className="sku">{product.compound}</span>
            <span className="sep">·</span>
            <span className="generic">{product.name}</span>
          </span>
          <StockPill product={product} />
        </div>
        <h2>
          {product.name} · {product.dose}
        </h2>
        <p className="lede">{product.description.split(".")[0]}.</p>
        <div className="v3cat-featured-spec">
          <div>
            <div className="lbl">Purity</div>
            <div className="val">{product.purity.replace(/\s*\(.*\)$/, "")}</div>
          </div>
          <div>
            <div className="lbl">Net mass</div>
            <div className="val">{product.dose}</div>
          </div>
          <div>
            <div className="lbl">From</div>
            <div className="val">${Math.round(product.price)}</div>
          </div>
        </div>
        <div className="v3cat-featured-cta-row">
          <Link href={`/shop/${product.slug}`} className="v3-view-pill">
            View product
            <span className="arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="v3-tile">
      <div className="v3-tile-photo">
        <Image
          src={product.imageUrl ?? `/images/products/source/purepep-vial-${product.slug}-v1.0.jpg`}
          alt={`${product.compound} vial`}
          fill
          sizes="(max-width:600px) 50vw, 25vw"
          className="v3-product-hero-img"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="v3-tile-shadow" />
      </div>
      <div className="v3-tile-content">
        <div className="v3-meta-row">
          <span className="v3-sku-line">
            <span className="sku">{product.compound}</span>
            <span className="sep">·</span>
            <span className="generic">{product.name}</span>
          </span>
          <StockPill product={product} />
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
    </Link>
  );
}

function StockPill({ product }: { product: Product }) {
  if (product.stock === "out") {
    return <span className="v3-stock is-wait">Waitlist</span>;
  }
  if (product.stock === "low") {
    return (
      <span className="v3-stock is-low">
        <span className="dot" />
        Low stock
      </span>
    );
  }
  return (
    <span className="v3-stock">
      <span className="dot" />
      In stock
    </span>
  );
}
