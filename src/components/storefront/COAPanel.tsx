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
      className="grid items-center gap-3 px-4 py-3.5 md:gap-5 md:px-5"
      style={{
        gridTemplateColumns: "2fr 1.4fr 1.4fr auto",
        borderBottom: last ? "none" : "1px solid var(--pp-line)",
      }}
    >
      <span className="font-sans text-[13px] font-medium text-ink md:text-[14px]">{test}</span>
      <span className="font-mono text-[11px] tracking-[0.04em] text-ink-muted md:text-[12px]">{spec}</span>
      <span className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.04em] text-ink md:text-[12px]">
        {result}
      </span>
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em]",
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

function PanelDesc({ product }: { product: Product }) {
  return (
    <div className="grid gap-8 md:max-w-[980px] md:gap-12 md:grid-cols-2">
      <div>
        <Eyebrow>Monograph</Eyebrow>
        <p className="mt-3.5 font-sans text-[14px] leading-[1.75] text-ink md:text-[15px]">
          {product.description}
        </p>
        <p className="mt-4 font-sans text-[14px] leading-[1.75] text-ink md:text-[15px]">
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
  );
}

function PanelSpec({ product }: { product: Product }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px] border border-ink md:max-w-[640px]">
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
    </div>
  );
}

function PanelCOA({ product }: { product: Product }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Eyebrow>Lot {product.lot}</Eyebrow>
        <PillVerified />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px] border border-ink md:max-w-[760px]">
          <div
            className="grid bg-surface px-4 py-3 md:px-5"
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
    </div>
  );
}

function PanelDocs({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>Available for lot {product.lot}</Eyebrow>
      {[
        { label: "Certificate of analysis (PDF)" },
        { label: "HPLC chromatogram (PDF)" },
        { label: "Mass spectrum (PDF)" },
        { label: "Safety data sheet (PDF)" },
        { label: "Handling guide (PDF)" },
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
  );
}

function renderPanel(id: Tab, product: Product) {
  if (id === "desc") return <PanelDesc product={product} />;
  if (id === "spec") return <PanelSpec product={product} />;
  if (id === "coa") return <PanelCOA product={product} />;
  return <PanelDocs product={product} />;
}

function AccordionSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between bg-transparent px-0 py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink"
      >
        {label}
        <span className="ml-4 shrink-0 font-mono text-[14px] text-ink-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}

export function COAPanel({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("desc");

  return (
    <section aria-label="Product details">
      {/* Desktop: tab bar + panel */}
      <div className="hidden md:block">
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
        <div className="py-10">{renderPanel(tab, product)}</div>
      </div>

      {/* Mobile: accordion */}
      <div className="border-t border-ink md:hidden">
        {TABS.map((t) => (
          <AccordionSection key={t.id} label={t.label}>
            {renderPanel(t.id, product)}
          </AccordionSection>
        ))}
      </div>
    </section>
  );
}
