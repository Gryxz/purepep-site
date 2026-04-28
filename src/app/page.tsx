import Link from "next/link";
import { Eyebrow, Button, LabelCard, TrustStrip, BlushBand } from "@/components/storefront/primitives";
import { PRODUCTS } from "@/data/products";

function Hero() {
  const reta = PRODUCTS.find((p) => p.slug === "reta")!;
  return (
    <section className="border-b border-ink bg-bone">
      <div
        className="layout-content grid items-center gap-[72px] py-[88px] pb-24"
        style={{ gridTemplateColumns: "1.15fr 1fr" }}
      >
        <div>
          <Eyebrow>Research-grade peptides · verified per lot</Eyebrow>
          <h1
            className="my-7 font-display font-black tracking-[-0.035em] leading-[0.98] text-ink"
            style={{ fontSize: "clamp(54px, 7vw, 96px)", textWrap: "balance" } as React.CSSProperties}
          >
            Research-grade peptides.
            <br />
            Verified per lot.
          </h1>
          <p className="mb-9 max-w-[520px] font-sans text-[18px] leading-relaxed text-ink">
            Triplicate HPLC assay, lot-matched certificate of analysis, cold-chain delivery.
            Documentation on file for every vial that leaves the building.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button variant="primary">
              <Link href="/shop" className="text-bone no-underline">
                View catalog →
              </Link>
            </Button>
            <a
              href="#quality"
              className="font-sans text-[14px] font-semibold tracking-[-0.005em] text-ink underline underline-offset-4"
            >
              Read our quality standard
            </a>
          </div>
          <TrustStrip className="mt-10" />
        </div>

        <div>
          <LabelCard
            compound={reta.compound}
            name={reta.name}
            cas={reta.cas}
            price={reta.priceLabel}
            stock={reta.stock}
            lowCount={reta.lowCount}
            href={`/shop/${reta.slug}`}
          />
        </div>
      </div>
    </section>
  );
}

const VALUE_PROPS = [
  {
    num: "01",
    title: "Order with confidence",
    body: "Every compound ships with a lot-matched COA including HPLC purity, mass confirmation, and endotoxin results. No verbal assurances — paper trail, every time.",
  },
  {
    num: "02",
    title: "2-day cold-chain delivery",
    body: "Stoppered vials dispatched same-day in insulated packaging with ice pack and tamper-evident seal. Tracked point-to-point from our US partner facility.",
  },
  {
    num: "03",
    title: "Documentation on file",
    body: "COA, mass spectrum, HPLC chromatogram, SDS, and handling guide retained per lot. Downloadable against any order or by lot number on request.",
  },
];

function ValueProps() {
  return (
    <section className="border-b border-ink bg-surface" id="quality">
      <div className="layout-content py-24">
        <div className="mb-16 max-w-[640px]">
          <Eyebrow>What we ship with every vial</Eyebrow>
          <h2
            className="mt-4.5 font-display font-black tracking-[-0.03em] leading-[1] text-ink"
            style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
          >
            A quality standard you can pull up in a document.
          </h2>
        </div>
        <div className="grid grid-cols-3">
          {VALUE_PROPS.map((item, i) => (
            <div
              key={item.num}
              className="border-y border-r border-ink bg-bone px-9 py-10"
              style={{ borderLeft: i === 0 ? "1.5px solid var(--pp-ink)" : "none" }}
            >
              <div className="mb-8 font-display text-[72px] font-black leading-[1] tracking-[-0.04em] text-ink">
                {item.num}
              </div>
              <h3 className="mb-3.5 font-display text-[22px] font-black leading-[1.15] tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="font-sans text-[14.5px] leading-relaxed text-ink">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedRail() {
  const featured = PRODUCTS.filter((p) =>
    ["reta", "sema", "tirz", "cagri"].includes(p.slug),
  );
  return (
    <section className="bg-bone">
      <div className="layout-content py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Featured catalog</Eyebrow>
            <h2
              className="mt-3.5 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(32px, 3.4vw, 44px)" }}
            >
              In stock now
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink underline underline-offset-4"
          >
            View full catalog →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-5">
          {featured.map((p) => (
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
  );
}

const WHY_CELLS = [
  { stat: "≥99.5%", label: "Purity threshold (HPLC)" },
  { stat: "Per lot", label: "Independent COA" },
  { stat: "USA", label: "Synthesis + release" },
  { stat: "2-day", label: "Cold-chain shipping" },
];

function WhyGrid() {
  return (
    <section className="border-y border-ink bg-bone">
      <div className="layout-content py-20">
        <div className="mb-12 text-center">
          <Eyebrow>Why PurePep</Eyebrow>
          <h2
            className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
            style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
          >
            A documented standard.
          </h2>
        </div>
        <div className="grid grid-cols-4">
          {WHY_CELLS.map((c, i) => (
            <div
              key={c.label}
              className="px-7 py-11 text-center"
              style={{ borderLeft: i === 0 ? "none" : "1.5px solid var(--pp-ink)" }}
            >
              <div className="mb-4.5 font-display text-[56px] font-black leading-[1] tracking-[-0.035em] text-ink">
                {c.stat}
              </div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <FeaturedRail />
      <WhyGrid />
      <BlushBand>
        <blockquote className="mx-auto max-w-2xl text-center">
          <Eyebrow className="justify-center">Researcher testimonial</Eyebrow>
          <p className="mt-6 font-display text-[28px] font-black leading-tight tracking-[-0.02em] text-ink">
            &ldquo;The COA arrived before the vial. That&apos;s the level of documentation we expect for serious work.&rdquo;
          </p>
          <footer className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            — Independent researcher, peer-reviewed lab
          </footer>
        </blockquote>
      </BlushBand>
    </>
  );
}
