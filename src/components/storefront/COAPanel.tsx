"use client";
import { useState } from "react";
import { Eyebrow, CheckGlyph, PillVerified } from "./primitives";
import { clsx } from "@/lib/clsx";
import type { Product } from "@/data/products";

type Tab = "desc" | "spec" | "coa" | "docs";

const TABS: { id: Tab; label: string }[] = [
  { id: "desc", label: "Description" },
  { id: "spec", label: "Specification" },
  { id: "coa", label: "Certificate of analysis" },
  { id: "docs", label: "Documentation" },
];

function AssayRow({
  test,
  spec,
  result,
  pass,
  last,
}: {
  test: string;
  spec: string;
  result: string;
  pass: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="grid items-center gap-5 px-5 py-4"
      style={{
        gridTemplateColumns: "2fr 1.4fr 1.4fr auto",
        borderBottom: last ? "none" : "1px solid var(--pp-line)",
      }}
    >
      <span className="font-sans text-[14px] font-medium text-ink">{test}</span>
      <span className="font-mono text-[12px] tracking-[0.04em] text-ink-muted">{spec}</span>
      <span className="font-mono text-[12px] font-semibold tabular-nums tracking-[0.04em] text-ink">
        {result}
      </span>
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]",
          pass
            ? "border-emerald bg-bone text-emerald"
            : "border-alert bg-bone text-alert",
        )}
      >
        {pass && <CheckGlyph pass={true} />}
        {pass ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

export function COAPanel({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("desc");

  return (
    <section aria-label="Product details">
      {/* tab bar */}
      <div className="-mb-px flex gap-11 border-b border-ink">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              "cursor-pointer border-b-[3px] bg-transparent pb-[18px] pt-[18px] font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
              tab === t.id
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* panels */}
      <div className="py-10">
        {tab === "desc" && (
          <div
            className="grid max-w-[980px] gap-12"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div>
              <Eyebrow>Monograph</Eyebrow>
              <p className="mt-3.5 font-sans text-[15px] leading-[1.75] text-ink">
                {product.description}
              </p>
              <p className="mt-4 font-sans text-[15px] leading-[1.75] text-ink">
                Each lot is synthesized in a US partner facility via solid-phase peptide
                synthesis, HPLC-purified to ≥99.5%, and characterized by mass spectrometry,
                appearance, net peptide content, and sterility prior to release. Stoppered
                vials ship cold-chain with ice pack and a lot-matched certificate of analysis.
              </p>
            </div>
            <div>
              <Eyebrow>Handling</Eyebrow>
              <ul className="mt-3.5 flex flex-col gap-3 font-sans text-[14px] leading-relaxed text-ink">
                <li>Store lyophilized vial at 2–8 °C, protect from light and moisture.</li>
                <li>Reconstitute in sterile bacteriostatic water or sterile water for injection.</li>
                <li>Once reconstituted, use within 30 days; store at 2–8 °C.</li>
                <li>Do not freeze after reconstitution.</li>
                <li>Intended for laboratory research use only.</li>
              </ul>
            </div>
          </div>
        )}

        {tab === "spec" && (
          <div className="max-w-[640px] border border-ink">
            {[
              { label: "Product name", value: product.name },
              { label: "SKU", value: product.sku },
              { label: "CAS number", value: product.cas },
              { label: "Lot number", value: product.lot },
              { label: "Net mass", value: product.dose },
              { label: "Purity", value: product.purity },
              { label: "Storage", value: product.storage },
              { label: "Appearance", value: "White lyophilized powder" },
              { label: "Reconstitution", value: "Sterile bacteriostatic water" },
              { label: "Category", value: product.category },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="grid py-3.5 px-5"
                style={{
                  gridTemplateColumns: "160px 1fr",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--pp-line)" : "none",
                }}
              >
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  {row.label}
                </span>
                <span className="font-sans text-[14px] font-medium text-ink">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "coa" && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Eyebrow>Lot {product.lot}</Eyebrow>
              <PillVerified />
            </div>
            <div className="max-w-[760px] border border-ink">
              {/* header row */}
              <div
                className="grid bg-surface px-5 py-3"
                style={{ gridTemplateColumns: "2fr 1.4fr 1.4fr auto" }}
              >
                {["Test", "Specification", "Result", "Status"].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <AssayRow test="Appearance" spec="White lyophilized powder" result="Conforms" pass={true} />
              <AssayRow test="HPLC purity" spec="≥ 99.5%" result="99.7%" pass={true} />
              <AssayRow test="Mass confirmation (ESI-MS)" spec="Exact mass ± 0.5 Da" result="Conforms" pass={true} />
              <AssayRow test="Net peptide content" spec="≥ 95.0%" result="96.2%" pass={true} />
              <AssayRow test="Endotoxin (LAL)" spec="< 1.0 EU/mg" result="< 0.1 EU/mg" pass={true} />
              <AssayRow test="Sterility" spec="No growth (USP <71>)" result="No growth" pass={true} last />
            </div>
          </div>
        )}

        {tab === "docs" && (
          <div className="flex flex-col gap-3">
            <Eyebrow>Available for lot {product.lot}</Eyebrow>
            {[
              { icon: "doc" as const, label: "Certificate of analysis (PDF)" },
              { icon: "doc" as const, label: "HPLC chromatogram (PDF)" },
              { icon: "doc" as const, label: "Mass spectrum (PDF)" },
              { icon: "doc" as const, label: "Safety data sheet (PDF)" },
              { icon: "doc" as const, label: "Handling guide (PDF)" },
            ].map((d) => (
              <button
                key={d.label}
                type="button"
                className="flex w-full max-w-[400px] cursor-pointer items-center gap-3 border border-ink bg-bone px-4 py-3.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:bg-surface"
              >
                <span className="font-mono text-[12px]">↓</span>
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
