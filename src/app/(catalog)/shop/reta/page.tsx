import type { Metadata } from "next";
import { Eyebrow } from "@/components/Eyebrow";
import { Hairline } from "@/components/Hairline";
import { Button } from "@/components/Button";
import { PillStock, PillVerified } from "@/components/SemanticPill";
import { ComplianceBlock } from "@/components/ComplianceBlock";
import { ProductGalleryPlaceholder } from "@/components/ProductGalleryPlaceholder";

export const metadata: Metadata = {
  title: "Retatrutide · 10 mg",
  description:
    "RETA (Retatrutide, LY3437943) supplied as a lyophilized powder, ≥99.5% purity by HPLC, lot-matched COA on every vial.",
};

const SPEC_ROWS: { label: string; value: string; mono?: boolean; trailing?: React.ReactNode }[] = [
  { label: "Compound", value: "Retatrutide (LY3437943)" },
  { label: "Net mass", value: "10 mg lyophilized" },
  { label: "Purity", value: "≥ 99.5% (HPLC)" },
  {
    label: "Lot",
    value: "RT-2604-A11",
    mono: true,
    trailing: <PillVerified />,
  },
  { label: "Storage", value: "2–8 °C, protect from light" },
];

export default function RetaProductPage() {
  const unitPrice = 189.0;
  const formattedPrice = `$${unitPrice.toFixed(2)}`;

  return (
    <main className="bg-bone">
      <section className="layout-content py-9 md:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <ProductGalleryPlaceholder coaVerified />

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow>Retatrutide · lyophilized</Eyebrow>
                <span className="text-ink-muted" aria-hidden>
                  ·
                </span>
                <PillStock />
              </div>

              <h1 className="mt-4 font-display text-h1 font-black tracking-tight leading-tight text-ink md:text-display-m">
                RETA <span className="text-ink">· 10 mg</span>
              </h1>

              <p className="mt-5 max-w-[58ch] font-sans text-body-l leading-relaxed text-ink">
                Retatrutide (LY3437943) is a synthetic 39-amino-acid peptide — a triple agonist at
                GLP-1, GIP, and glucagon receptors. Supplied as a white lyophilized powder in a
                stoppered glass vial, assayed at ≥99.5% by HPLC on every lot and shipped with a
                lot-matched certificate of analysis.
              </p>

              <p className="mt-4 font-sans text-body-s font-semibold leading-normal text-ink">
                This is a lyophilized powder vial intended for research use — this is not a capsule
                or oral supplement.
              </p>
            </div>

            <Hairline />

            <div>
              <Eyebrow>Specification</Eyebrow>
              <dl className="mt-3">
                {SPEC_ROWS.map((row, i) => {
                  const last = i === SPEC_ROWS.length - 1;
                  return (
                    <div
                      key={row.label}
                      className={
                        last
                          ? "grid grid-cols-[140px_1fr] items-center gap-4 py-4"
                          : "grid grid-cols-[140px_1fr] items-center gap-4 border-b-[1.5px] border-line py-4"
                      }
                    >
                      <dt className="font-mono text-eyebrow font-medium uppercase tracking-[0.16em] text-ink-muted">
                        {row.label}
                      </dt>
                      <dd className="flex flex-wrap items-center gap-3">
                        <span
                          className={
                            row.mono
                              ? "font-mono text-mono font-semibold text-ink"
                              : "font-sans text-body font-medium text-ink"
                          }
                        >
                          {row.value}
                        </span>
                        {row.trailing}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <Hairline />

            <div>
              <Eyebrow>Price</Eyebrow>
              <p className="mt-3 font-display text-h2 font-black tracking-tight text-ink tabular-nums">
                {formattedPrice}
                <span className="ml-2 align-middle font-mono text-mono font-medium uppercase tracking-[0.16em] text-ink-muted">
                  per vial
                </span>
              </p>
            </div>

            <Button size="lg" fullWidth aria-label={`Add to cart — ${formattedPrice}`}>
              Add to cart — {formattedPrice}
            </Button>

            <ComplianceBlock />
          </div>
        </div>
      </section>
    </main>
  );
}
