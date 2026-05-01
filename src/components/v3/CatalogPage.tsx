"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import type { Product, Category } from "@/data/products";
import { RetaVial } from "./RetaVial";

/**
 * v3 Apple Swiss Catalog page.
 *
 * Sections (from docs/design-v3/project/Catalog - Apple Swiss.html):
 *   1. Page intro (Catalog eyebrow + h1 + lede)
 *   2. Filter chip row + sort button + hairline divider
 *   3. Featured carousel — 3 slides on desktop, swipeable, 56 px arrow
 *      buttons hugging the card edges, hairline-bar pagination + "01 / 03"
 *      mono caption
 *   4. Responsive product grid — 3 cols desktop / 2 tablet / 1 mobile.
 *      The user spec preferred a static 3-col grid for this surface
 *      (vs. the design's horizontal rail) so the full catalog is visible
 *      without horizontal scroll. Re-uses the same .v3-tile family as the
 *      homepage rail.
 *   5. Footnote — RUO compliance line on a loden hairline.
 */

type ChipKey = "all" | "glp1" | "growth" | "repair" | "cosmetic" | "blends";

const CHIPS: { key: ChipKey; label: string; categories: Category[] | "all" }[] = [
  { key: "all",      label: "All",              categories: "all" },
  { key: "glp1",     label: "GLP-1",            categories: ["Incretin mimetics"] },
  { key: "growth",   label: "Growth",           categories: ["GH secretagogues"] },
  { key: "repair",   label: "Repair",           categories: ["Healing"] },
  { key: "cosmetic", label: "Cosmetic",         categories: ["Healing"] },
  { key: "blends",   label: "Research blends",  categories: ["Metabolic", "Cognition"] },
];

export function CatalogPage({ products }: { products: Product[] }) {
  const [chip, setChip] = useState<ChipKey>("all");
  const [slide, setSlide] = useState(0);

  const filtered = useMemo(() => {
    const def = CHIPS.find((c) => c.key === chip)!;
    if (def.categories === "all") return products;
    const set = new Set(def.categories);
    return products.filter((p) => set.has(p.category));
  }, [chip, products]);

  const featured = products.slice(0, 3);

  function goTo(i: number) {
    setSlide(((i % featured.length) + featured.length) % featured.length);
  }

  return (
    <div className="v3-shop">
      <main className="v3-container">
        <section className="v3cat-intro">
          <div className="eyebrow">Catalog</div>
          <h1>Research-grade peptides.</h1>
          <p>
            Lyophilized, lot-tested, shipped with a matched Certificate of Analysis. No marketing math — just
            specifications.
          </p>
        </section>

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

        {/* Featured carousel */}
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

        {/* Product grid — 3/2/1 */}
        <section aria-label="All peptides">
          <div className="v3-section-head-row" style={{ marginBottom: 24 }}>
            <p className="v3-section-eyebrow">All peptides · {String(filtered.length).padStart(2, "0")} of {String(products.length).padStart(2, "0")}</p>
          </div>
          {filtered.length > 0 ? (
            <div className="v3cat-grid">
              {filtered.map((p) => (
                <ProductTile key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <p
              style={{
                padding: "64px 0",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--v3-ink-55)",
              }}
            >
              No peptides match this filter
            </p>
          )}
        </section>

        <hr className="v3cat-footnote-divider" />
        <div className="v3cat-footnote">
          All products sold for laboratory research use only · Not for human or animal consumption
        </div>
      </main>
    </div>
  );
}

function FeaturedSlide({ product }: { product: Product }) {
  return (
    <div className="v3cat-featured-slide">
      <div className="v3cat-featured-photo">
        <RetaVial compound={product.compound} dose={product.dose} lot={product.lot} storage={product.storage} />
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
        <RetaVial compound={product.compound} dose={product.dose} lot={product.lot} storage={product.storage} />
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
