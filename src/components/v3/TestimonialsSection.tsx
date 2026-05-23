"use client";

import { compliance } from "@design/tokens";
import { useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  compound: string;
  /** Short ink monogram shown on the attribution chip. */
  monogram: string;
  /** Realistic lot id, matching the XX-YYMM-ZNN format in products.static.ts. */
  lot: string;
  /** HPLC purity, e.g. "99.7%". */
  purity: string;
  /** Mass-spec identity result, e.g. "Confirmed" or "≤0.5 Da". */
  identity: string;
  /** Endotoxin ceiling, e.g. "<0.5 EU/mg". */
  endotoxin: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Marcus W.",
    role: "Independent researcher · TX",
    compound: "RETA",
    monogram: "RT",
    lot: "RT-2604-A11",
    purity: "99.7%",
    identity: "Confirmed",
    endotoxin: "<0.5 EU/mg",
    quote:
      "Purity confirmed by my own HPLC against the lot-matched COA — 99.7% by my read, exactly as documented. The reconstituted compound matched the published mass-spec identity. Product quality is not the variable in my experiments anymore.",
  },
  {
    id: "t2",
    name: "Daniela M.",
    role: "Research associate · FL",
    compound: "TIRZ",
    monogram: "TZ",
    lot: "TZ-2604-C03",
    purity: "99.5%",
    identity: "≤0.5 Da",
    endotoxin: "<0.5 EU/mg",
    quote:
      "I've sourced peptides from four vendors. PurePep is the first where every lot-matched COA came back clean, with mass-spec data that actually matched theoretical molecular weight. Endotoxin below 0.5 EU/mg on every run. Finally a supplier I don't have to double-check.",
  },
  {
    id: "t3",
    name: "James K.",
    role: "Private researcher · CA",
    compound: "SEMA",
    monogram: "SE",
    lot: "SE-2604-B07",
    purity: "99.6%",
    identity: "Confirmed",
    endotoxin: "<0.5 EU/mg",
    quote:
      "Shipped next business day and the COA was in my inbox before the package arrived. Lyophilized powder reconstituted cleanly, no particulate — exactly what I need for consistent experimental baselines. Reordered three times, same purity each lot.",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active]!;

  return (
    <section className="v3-testimonials v3-section">
      <div className="v3-container">
        <p className="v3-section-eyebrow">Lot verification</p>
        <h2 className="v3-section-headline">
          Verified purity.
          <br />
          Lot-matched COA.
        </h2>
        <p className="v3-section-sub">
          Independent researchers on lot purity, COA accuracy, and shipping consistency.
          {" "}
          {compliance.researchUseOnly}
        </p>

        {/* Tab switcher */}
        <div className="v3-test-tabs">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`v3-test-tab${active === i ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              <span className="v3-test-tab-cpd">{item.compound}</span>
              <span className="v3-test-tab-name">{item.name}</span>
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="v3-test-card">
          {/* Lab verification card — image-free mini certificate of analysis */}
          <div className="v3-test-visual">
            <div className="v3-test-coa" key={t.id}>
              <div className="v3-test-coa-head">
                <span className="v3-test-coa-label">Certificate of analysis</span>
                <span className="v3-test-coa-cpd">{t.compound}</span>
              </div>
              <div className="v3-test-coa-lot">
                <span className="v3-test-coa-lot-lbl">Lot</span>
                <span className="v3-test-coa-lot-val">{t.lot}</span>
              </div>
              <dl className="v3-test-coa-metrics">
                <div className="v3-test-coa-row">
                  <dt>HPLC purity</dt>
                  <dd>{t.purity}</dd>
                </div>
                <div className="v3-test-coa-row">
                  <dt>Mass-spec identity</dt>
                  <dd>{t.identity}</dd>
                </div>
                <div className="v3-test-coa-row">
                  <dt>Endotoxin</dt>
                  <dd>{t.endotoxin}</dd>
                </div>
              </dl>
              <div className="v3-test-coa-verified">
                <span className="v3-test-coa-tick" aria-hidden="true">
                  ✓
                </span>
                <span>Verified against COA</span>
              </div>
            </div>
          </div>

          {/* Quote content */}
          <div className="v3-test-body">
            <div className="v3-test-protocol-pill">
              <span className="v3-test-cpd">{t.compound}</span>
              <span className="sep">·</span>
              <span>lot-matched COA</span>
            </div>

            <blockquote className="v3-test-quote">&ldquo;{t.quote}&rdquo;</blockquote>

            <div className="v3-test-attribution">
              <div className="v3-test-monogram" aria-hidden="true">
                {t.monogram}
              </div>
              <div className="v3-test-attribution-text">
                <div className="v3-test-name">{t.name}</div>
                <div className="v3-test-role">{t.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
