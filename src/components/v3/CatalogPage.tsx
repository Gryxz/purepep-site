/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
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
} from "@/content/catalog";
import Image from "next/image";
import { RetaVial } from "./RetaVial";
import { TrustBar } from "./TrustBar";

export function CatalogPage({ products }: { products: Product[] }) {
  const [chip, setChip] = useState<FilterKey>("all");
  const [slide, setSlide] = useState(0);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState({ width: 33, left: 0 });

  const counts = useMemo(() => filterCounts(products), [products]);
  const chips = useMemo(() => visibleFilters(counts), [counts]);
  const activeChip =
    chips.find((c) => c.key === chip) ??
    CATALOG_FILTERS.find((c) => c.key === "all")!;

  const visible = useMemo(
    () => products.filter((p) => activeChip.match(p.category)),
    [products, activeChip],
  );
  const featured = visible.slice(0, 3);

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
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={activeChip.key === c.key}
                className={clsx("v3cat-chip", activeChip.key === c.key && "is-active")}
                onClick={() => {
                  setChip(c.key);
                  setSlide(0);
                }}
              >
                {c.label} <span className="ct">{counts[c.key]}</span>
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
                ← Scroll horizontally · {String(visible.length).padStart(2, "0")} of{" "}
                {String(products.length).padStart(2, "0")} products
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
              {visible.map((p) => (
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
        <div className="v3cat-footnote">{CATALOG_RUO_FOOTNOTE}</div>
      </main>

      {/* ── For Research Teams CTA ── */}
      <div className="v3-dark-cta">
        <div className="v3-dark-cta-eyebrow">{CATALOG_REQUEST_CTA.eyebrow}</div>
        <h2 className="v3-dark-cta-h">
          {CATALOG_REQUEST_CTA.headlineLead} <em>{CATALOG_REQUEST_CTA.headlineEmphasis}</em>
        </h2>
        <p className="v3-dark-cta-body">{CATALOG_REQUEST_CTA.body}</p>
        <div className="v3-dark-cta-btns">
          <a href={CATALOG_REQUEST_CTA.primary.href} className="v3-dark-cta-btn-primary">
            {CATALOG_REQUEST_CTA.primary.label} →
          </a>
          <a href={CATALOG_REQUEST_CTA.secondary.href} className="v3-dark-cta-btn-secondary">
            {CATALOG_REQUEST_CTA.secondary.label}
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
        {product.type === "stack" ? (
          <span className="v3-tile-stack-badge">{STACK_BADGE_LABEL}</span>
        ) : product.regularPrice && product.regularPrice > product.price ? (
          <span className="v3-tile-sale-badge">Sale</span>
        ) : null}
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
          <StockPill product={product} />
        </div>
        <h3 className="v3-tile-name">{product.name}</h3>
        <p className="v3-tile-sub">{product.description.split(".")[0]}.</p>
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
    return <span className="v3-stock is-wait">{stockLabel(product.stock)}</span>;
  }
  if (product.stock === "low") {
    return (
      <span className="v3-stock is-low">
        <span className="dot" />
        {stockLabel(product.stock)}
      </span>
    );
  }
  return (
    <span className="v3-stock">
      <span className="dot" />
      {stockLabel(product.stock)}
    </span>
  );
}
