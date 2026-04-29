import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getProductSlugs, getRelated } from "@/data/products";
import { BuyBox } from "@/components/storefront/BuyBox";
import { COAPanel } from "@/components/storefront/COAPanel";
import { LabelCard, Eyebrow, Hairline, StatBlock } from "@/components/storefront/primitives";
import { ComplianceBlock } from "@/components/ComplianceBlock";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.compound} · ${product.name} ${product.dose}`,
    description: product.description.slice(0, 155),
  };
}

const PDP_STATS = [
  { value: "≥ 99.5%", caption: "HPLC purity per lot" },
  { value: "Per-lot", caption: "COA on every vial" },
  { value: "2 day", caption: "Cold-chain shipping" },
  { value: "US", caption: "Synthesized" },
];

export default async function PDPPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug, 4);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="bg-bone" aria-label="Breadcrumb">
        <div className="layout-content py-2 md:py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            <Link href="/" className="text-ink-muted no-underline hover:text-ink">Home</Link>
            {" / "}
            <Link href="/shop" className="text-ink-muted no-underline hover:text-ink">Catalog</Link>
            {" / "}
            <span className="text-ink">{product.compound}</span>
          </span>
        </div>
      </nav>

      {/* Hero: responsive grid — BuyBox first on mobile, image first on desktop */}
      <section className="bg-bone">
        <div className="layout-content grid grid-cols-1 gap-8 py-8 md:grid-cols-2 md:gap-[72px] md:py-[72px]">
          {/* Vial visual — order-2 on mobile, order-1 on desktop */}
          <div className="order-2 flex flex-col items-center justify-center bg-surface p-12 md:order-1 md:p-16">
            {/* shadow-product applied only to the SVG wrapper — traces vial shape, not rect surface */}
            <div className="flex items-end justify-center shadow-product">
              <svg
                viewBox="0 0 80 120"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[160px] w-auto text-ink md:h-[200px]"
                aria-hidden="true"
              >
                <rect x="20" y="20" width="40" height="80" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="22" y="10" width="36" height="14" rx="1" fill="currentColor" />
                <rect x="20" y="44" width="40" height="30" fill="currentColor" fillOpacity="0.08" />
                <text
                  x="40"
                  y="63"
                  textAnchor="middle"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="9"
                  fontWeight="700"
                  fill="currentColor"
                  letterSpacing="0.12em"
                >
                  {product.compound}
                </text>
              </svg>
            </div>
            {/* SKU/Lot caption — clean monoline beneath vial, no top border rule */}
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted text-center">
              {product.sku} · Lot {product.lot}
            </p>
          </div>

          {/* BuyBox — order-1 on mobile, order-2 on desktop */}
          <div className="order-1 md:order-2">
            <BuyBox product={product} />
          </div>
        </div>
      </section>

      {/* StatBlock — quality signal band between hero and COA panel */}
      <StatBlock
        eyebrow="Tested · verified · traceable"
        stats={PDP_STATS}
      />

      {/* COA Panel */}
      <section className="bg-bone">
        <div className="layout-content py-10">
          <COAPanel product={product} />
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-surface">
        <div className="layout-content py-10">
          <ComplianceBlock />
        </div>
      </section>

      {/* Related products rail */}
      {related.length > 0 && (
        <section className="bg-bone">
          <div className="layout-content py-16">
            <div className="mb-8">
              <Eyebrow>Related compounds</Eyebrow>
              <h2 className="mt-3 font-display text-[28px] font-black leading-tight tracking-[-0.02em] text-ink">
                Also in catalog
              </h2>
            </div>
            <Hairline className="mb-8" />
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {related.map((p) => (
                <LabelCard
                  key={p.slug}
                  compound={p.compound}
                  name={p.name}
                  cas={p.cas}
                  price={p.priceLabel}
                  stock={p.stock}
                  lowCount={p.lowCount}
                  href={`/shop/${p.slug}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
