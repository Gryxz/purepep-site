"use client";
import { useState } from "react";
import { Eyebrow, Chip, SemanticPill, VialRender, MonoLine } from "@/components/storefront/primitives";
import { PRODUCTS } from "@/data/products";
import type { Category } from "@/data/products";

const FILTERS: ("All" | Category)[] = [
  "All",
  "Incretin mimetics",
  "GH secretagogues",
  "Healing",
  "Cognition",
  "Metabolic",
];

function CatalogHeader({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (f: "All" | Category) => void;
}) {
  return (
    <section className="border-b border-ink bg-bone">
      <div className="layout-content pb-10 pt-14">
        <Eyebrow>All compounds · lab-tested · lot-traceable</Eyebrow>
        <h1
          className="mt-4.5 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(48px, 6vw, 88px)" }}
        >
          Catalog
        </h1>
        <div className="mt-9 flex flex-wrap gap-2.5">
          {FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogGrid({ filter }: { filter: string }) {
  const items =
    filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <section className="bg-bone">
      <div className="layout-content py-14 pb-24">
        <div className="grid grid-cols-3 gap-7">
          {items.map((p) => (
            <a
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="no-underline"
              style={{ opacity: p.stock === "out" ? 0.85 : 1 }}
            >
              {/* vial card */}
              <div className="flex flex-col border border-ink bg-bone hover:bg-surface transition-colors">
                <div className="flex items-end justify-center border-b border-ink bg-surface px-6 pt-8 pb-0">
                  <VialRender compound={p.compound} className="h-[88px] w-auto" />
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <Eyebrow>{p.compound}</Eyebrow>
                  <p className="mt-1 font-display text-[15px] font-black leading-tight tracking-[-0.01em] text-ink">
                    {p.name}
                  </p>
                  <MonoLine className="mt-1 text-[10px] text-ink-muted">{p.cas}</MonoLine>
                </div>
              </div>

              {/* below-card info */}
              <div
                className="mt-4.5 grid items-baseline gap-4"
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <div className="min-w-0">
                  <p className="font-display text-[17px] font-black leading-tight tracking-[-0.01em] text-ink">
                    {p.name}
                  </p>
                  <MonoLine className="mt-1 text-[10.5px] text-ink-muted uppercase tracking-[0.14em]">
                    {p.compound} · {p.dose} · CAS {p.cas}
                  </MonoLine>
                  <div className="mt-2.5">
                    <SemanticPill stock={p.stock} lowCount={p.lowCount} />
                  </div>
                </div>
                <p
                  className="font-display text-[17px] font-black tabular-nums"
                  style={{
                    color: p.stock === "out" ? "var(--pp-ink-muted)" : "var(--pp-ink)",
                    textDecoration: p.stock === "out" ? "line-through" : "none",
                  }}
                >
                  {p.priceLabel}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ShopPage() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  return (
    <>
      <CatalogHeader filter={filter} setFilter={setFilter} />
      <CatalogGrid filter={filter} />
    </>
  );
}
