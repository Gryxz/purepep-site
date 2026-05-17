"use client";

import Image from "next/image";
import { useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  compound: string;
  duration: string;
  quote: string;
  metric: string;
  metricLabel: string;
  avatarSrc: string;
  transformSrc: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Marcus W.",
    role: "Independent researcher · TX",
    compound: "RETA",
    duration: "16-week protocol",
    quote:
      "Purity confirmed by my own HPLC before use. Matched the COA exactly — 99.7% by my read. The reconstituted compound performed exactly as the published pharmacokinetic data would suggest. Product quality is not the variable in my experiments anymore.",
    metric: "−38 lbs",
    metricLabel: "16-week result",
    avatarSrc: "/images/testimonials/avatar-1.jpg",
    transformSrc: "/images/testimonials/transform-1.jpg",
  },
  {
    id: "t2",
    name: "Daniela M.",
    role: "Research associate · FL",
    compound: "TIRZ",
    duration: "12-week protocol",
    quote:
      "I've sourced peptides from four vendors. PurePep is the first where every lot-matched COA came back clean, with mass spec data that actually matched theoretical molecular weight. Endotoxin below 0.5 EU/mg on every run. Finally a supplier I don't have to double-check.",
    metric: "−29 lbs",
    metricLabel: "12-week result",
    avatarSrc: "/images/testimonials/avatar-2.jpg",
    transformSrc: "/images/testimonials/transform-2.jpg",
  },
  {
    id: "t3",
    name: "James K.",
    role: "Private researcher · CA",
    compound: "SEMA",
    duration: "20-week protocol",
    quote:
      "Shipped next business day. COA was in my inbox before the package arrived. Lyophilized powder reconstituted cleanly, no particulate — exactly what I need for consistent experimental baselines. Reordered three times, same quality each lot.",
    metric: "−44 lbs",
    metricLabel: "20-week result",
    avatarSrc: "/images/testimonials/avatar-3.jpg",
    transformSrc: "/images/testimonials/transform-3.jpg",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active]!;

  return (
    <section className="v3-testimonials v3-section">
      <div className="v3-container">
        <p className="v3-section-eyebrow">Researcher results</p>
        <h2 className="v3-section-headline">
          Real results.
          <br />
          Published data.
        </h2>
        <p className="v3-section-sub">
          Independent researchers on product purity, shipping consistency, and protocol outcomes.
          For research use only — not for human consumption.
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
          {/* AI-generated transformation image */}
          <div className="v3-test-visual">
            <div className="v3-test-transform-wrap">
              <Image
                key={t.id}
                src={t.transformSrc}
                alt={`${t.name} transformation — ${t.compound} ${t.duration}`}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="v3-test-transform-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
              />
              <div className="v3-test-transform-overlay" aria-hidden="true" />
            </div>
            <div className="v3-test-metric">
              <div className="v3-test-metric-num">{t.metric}</div>
              <div className="v3-test-metric-lbl">{t.metricLabel}</div>
            </div>
          </div>

          {/* Quote content */}
          <div className="v3-test-body">
            <div className="v3-test-protocol-pill">
              <span className="v3-test-cpd">{t.compound}</span>
              <span className="sep">·</span>
              <span>{t.duration}</span>
            </div>

            <blockquote className="v3-test-quote">&ldquo;{t.quote}&rdquo;</blockquote>

            <div className="v3-test-attribution">
              <div className="v3-test-avatar-wrap">
                <Image
                  src={t.avatarSrc}
                  alt={t.name}
                  fill
                  sizes="52px"
                  className="v3-test-avatar-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0";
                  }}
                />
              </div>
              <div className="v3-test-attribution-text">
                <div className="v3-test-name">{t.name}</div>
                <div className="v3-test-role">{t.role}</div>
              </div>
            </div>

            <p className="v3-test-disclaimer">
              AI-generated transformation imagery. Individual research results may vary.
              Not for human consumption · Research use only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
