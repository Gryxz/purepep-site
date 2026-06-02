"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";

/**
 * v5 mobile — Retatrutide research-profile spotlight section.
 *
 * Sits between the hero parallax stack and the catalog teaser.  Surfaces
 * the four headline specs (quantity, purity, receptor targets, COA) in
 * a 2×2 hairline grid and a horizontal "Often Stacked With" chip row.
 *
 * Reveal-on-view: a single IntersectionObserver flips `inView`; the
 * .mob-reta-spotlight wrapper toggles a `is-in` class, and child CSS
 * transitions fade + lift each row with staggered delays.  Matches the
 * shell's existing pattern (vanilla useEffect + IO, no Framer Motion).
 *
 * Reta-specific by design — the section IS the Reta research profile.
 * If `featured` (props) isn't Reta, this component still renders the
 * Reta-keyed copy; the section is part of the homepage narrative, not
 * a per-SKU template.
 */
export function MobileRetaSpotlight({ products }: { products: Product[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Real Reta values pulled from the static fixture so the spotlight stays
  // in sync if the data layer changes.  Fall back to canonical literals
  // when the slug isn't present (CI builds with no WC credentials).
  const reta = products.find((p) => p.slug === "reta");
  const quantity = reta?.dose ?? "10 mg";
  const purity = reta?.purity?.replace(/\s*\(.*\)$/, "") ?? "≥99.5%";

  const stats: Array<{ value: string; label: string }> = [
    { value: quantity,   label: "Quantity / Vial" },
    { value: purity,     label: "Purity (HPLC)" },
    { value: "3",        label: "Receptor Targets" },
    { value: "COA",      label: "Lot-Level Testing" },
  ];

  // Real /shop/{slug} routes from the static fixture.  Order matches the
  // research profile: the bundle first, then the individual stack
  // companions, then the in-class peer.
  const stackChips: Array<{ name: string; sub: string; href: string }> = [
    { name: "BPC-157",     sub: "Peptide",        href: "/shop/bpc-157" },
    { name: "TB-500",      sub: "Peptide",        href: "/shop/tb-500" },
    { name: "Semaglutide", sub: "GLP-1",          href: "/shop/sema" },
  ];

  return (
    <section
      ref={ref}
      className={`mob-reta-spotlight${inView ? " is-in" : ""}`}
      aria-label="Retatrutide research profile"
    >
      <div className="mob-reta-eyebrow" style={{ ["--mob-stagger" as string]: "0" }}>
        <span className="dot" />
        <span>Research Profile</span>
      </div>

      <h2 className="mob-reta-h2" style={{ ["--mob-stagger" as string]: "1" }}>
        Retatrutide
      </h2>

      <p className="mob-reta-body" style={{ ["--mob-stagger" as string]: "2" }}>
        Triple agonist targeting GLP-1, GIP, and glucagon receptors.
        Investigated in pre-clinical and Phase II research settings
        for metabolic applications.
      </p>

      <div className="mob-reta-stat-grid" style={{ ["--mob-stagger" as string]: "3" }}>
        {stats.map((s) => (
          <div key={s.label} className="mob-reta-stat">
            <div className="mob-reta-stat-val">{s.value}</div>
            <div className="mob-reta-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mob-reta-stack" style={{ ["--mob-stagger" as string]: "4" }}>
        <div className="mob-reta-stack-label">
          <span>Often Stacked With</span>
          <span className="dot" />
        </div>
        <div className="mob-reta-stack-rail">
          {stackChips.map((c) => (
            <a key={c.name} href={c.href} className="mob-reta-stack-chip">
              <div className="mob-reta-stack-text">
                <div className="mob-reta-stack-name">{c.name}</div>
                <div className="mob-reta-stack-sub">{c.sub}</div>
              </div>
              <span className="mob-reta-stack-arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
