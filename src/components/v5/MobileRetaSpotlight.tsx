"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";

/**
 * v5 mobile — Curated stacks promotion section.
 *
 * Sits between the hero parallax stack and the catalog teaser.  Promotes
 * the multi-peptide bundle catalog (3 stacks: GLP / Healing / Recovery)
 * with a 2×2 hairline stat grid + a horizontal chip rail linking each
 * stack's PDP plus a back-link to the Reta hero featured above.
 *
 * Component name + CSS class names retain the legacy "reta-spotlight"
 * prefix (file rename out of scope per the originating change request:
 * "layout is good just replace the values").
 *
 * Reveal-on-view: a single IntersectionObserver flips `inView`; the
 * .mob-reta-spotlight wrapper toggles a `is-in` class, and child CSS
 * transitions fade + lift each row with staggered delays.  Matches the
 * shell's existing pattern (vanilla useEffect + IO, no Framer Motion).
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

  // Compute the top bundle savings across the live stack catalog so the
  // headline figure stays in sync with products.static.ts pricing.  Falls
  // back to 14 (the canonical GLP Stack savings: $288 → $274) when no
  // stack data is present (CI builds with no WC credentials).
  const stacks = products.filter((p) => p.type === "stack");
  const topSavings = Math.max(
    14,
    ...stacks
      .filter((p) => typeof p.regularPrice === "number" && p.regularPrice! > p.price)
      .map((p) => Math.round(p.regularPrice! - p.price)),
  );

  const stats: Array<{ value: string; label: string }> = [
    { value: "3",                  label: "Curated Stacks" },
    { value: "2",                  label: "Vials Each" },
    { value: `$${topSavings}`,     label: "Top Bundle Savings" },
    { value: "COA",                label: "Lot-Level Testing" },
  ];

  // Real /shop/{slug} routes from the static fixture.  Order: the three
  // stacks first (the section's promo focus), then a back-link to the
  // Reta hero featured in the parallax above.
  const stackChips: Array<{ name: string; sub: string; href: string }> = [
    { name: "GLP Stack",      sub: "Bundle · GLP-1",   href: "/shop/glp-stack" },
    { name: "Healing Stack",  sub: "Bundle · Healing", href: "/shop/healing-stack" },
    { name: "Recovery Stack", sub: "Bundle · Recovery", href: "/shop/recovery-stack" },
    { name: "Retatrutide",    sub: "Solo · GLP-1",     href: "/shop/reta" },
  ];

  return (
    <section
      ref={ref}
      className={`mob-reta-spotlight${inView ? " is-in" : ""}`}
      aria-label="Curated research stacks"
    >
      <div className="mob-reta-eyebrow" style={{ ["--mob-stagger" as string]: "0" }}>
        <span className="dot" />
        <span>Curated Stacks</span>
      </div>

      <h2 className="mob-reta-h2" style={{ ["--mob-stagger" as string]: "1" }}>
        Curated research stacks
      </h2>

      <p className="mob-reta-body" style={{ ["--mob-stagger" as string]: "2" }}>
        Two complementary compounds shipped as separately-sealed
        lyophilized vials — never pre-mixed — under a single lot-matched
        COA. Built for paired research protocols.
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
          <span>Browse stacks</span>
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
