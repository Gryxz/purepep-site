/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/data/products";
import Image from "next/image";
import { MobileRetaSpotlight } from "./MobileRetaSpotlight";
import { MobileFooter } from "./MobileFooter";

/**
 * v5 mobile homepage.
 *
 * Sections:
 *   1. Trust strip
 *   2. Hero — single 100vh dark pane with lab ambience photo, brand
 *      promise headline + sub, scroll cue at the floor.
 *   3. Curated stacks promotion (MobileRetaSpotlight) — bundle stats
 *      + chip rail linking each stack PDP.
 *   4. Catalog teaser — 2-col grid of every single-peptide product
 *      including Retatrutide.
 *   5. Transparency — 3 stacked editorial cards
 *   6. Process — dark 4-step timeline "From order to lab"
 *   7. Referral — full-bleed amber framed card with stats
 *   8. Dark CTA
 *   9. MobileFooter
 *
 * History: previous revision featured Retatrutide as a flagship
 * compound in a second parallax pane (vial cutout + "our flagship
 * compound" headline + dedicated Shop Retatrutide CTA).  Direction
 * change: Reta is treated as just another catalog product alongside
 * the rest — no flagship treatment.  Pane 2 removed, Reta now
 * surfaces in the catalog grid below.
 */
export function MobileHomePage({ products }: { products: Product[] }) {
  // Catalog teaser: every single-peptide + BAC water.  Reta is now
  // included (was previously sliced out because it owned the
  // flagship hero pane).  Stacks are still excluded — they get their
  // own promotion section (MobileRetaSpotlight).
  const rest = products
    .filter((p) => p.type !== "stack")
    .slice(0, 8);
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  // Hero scroll listener — writes `--mob-px-p` (0..1, scroll progress
  // through the hero section) so the scroll cue can fade out as the
  // user starts scrolling.  Previous revision drove a two-pane
  // crossfade + a vial parallax via this same var; both are gone with
  // the flagship pane.  Listener kept solely for the cue fade.
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;

    // Cache vh between scroll events; only re-read on resize.
    let vh = window.innerHeight;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const raw = -rect.top / (vh * 0.25);
      const p = Math.max(0, Math.min(1, raw));
      el.style.setProperty("--mob-px-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      vh = window.innerHeight;
      onScroll();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="mob-app">
      {/* Trust strip — first scrollable element, sits flush under the
          fixed glass header on load. */}
      <div className="mob-trust-bar" data-mob-section="dark">
        <div className="mob-trust-track">
          <div className="mob-trust-item"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item"><span className="dot" />Free over $200</div>
          <div className="mob-trust-item"><span className="dot" />Lot-matched COA</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />99.5%+ Purity</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Third-Party Tested</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />2-3 Day Shipping</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Free over $200</div>
          <div className="mob-trust-item" aria-hidden="true"><span className="dot" />Lot-matched COA</div>
        </div>
      </div>

      {/* Hero — single 100vh dark pane.  Lab ambience photo bg, brand
          promise headline + sub centred, scroll cue at the viewport
          floor.  Previously was a 120vh container with a second sticky
          pane featuring Retatrutide as the flagship compound; that
          pane is gone — Reta is now treated as just another catalog
          product alongside the rest.  Container retains the
          `.mob-heropx` class name so the existing CSS / scroll var
          plumbing still applies. */}
      <div
        ref={parallaxRef}
        className="mob-heropx"
        data-mob-section="dark"
        style={{ ["--mob-px-p" as string]: "0" }}
      >
        <section className="mob-heropx-pane mob-heropx-1" aria-label="Hero: research-grade peptides">
          <div className="mob-heropx-bg mob-heropx-bg-lab" aria-hidden="true">
            <div className="mob-heropx-lab-grid" />
            <div className="mob-heropx-lab-glow" />
            <div className="mob-heropx-lab-rings" />
          </div>
          <div className="mob-heropx-content">
            <div className="mob-heropx-eyebrow">
              <span className="dot" />
              Research-grade peptides
            </div>
            <h1 className="mob-heropx-h1">The standard for research peptides.</h1>
            <p className="mob-heropx-sub">
              Lab-verified peptides for in vitro research. Lot-matched COA on every vial, tracked US shipping.
            </p>
          </div>
          {/* Scroll indicator anchored to viewport floor — outside
              `.mob-heropx-content` (content-box height) so its
              `position: absolute; bottom: 32px` lands against the
              100vh hero edge rather than the centred text cluster. */}
          <div className="mob-heropx-scroll-cue pp-animate-6" aria-hidden="true">
            <span className="mob-scroll-dot" />
            <span className="mob-scroll-track">
              <span className="mob-scroll-fill" />
            </span>
          </div>
        </section>
      </div>

      {/* Curated stacks promotion — sits between the hero and the
          catalog teaser.  Surfaces bundle stats (3 stacks · 2 vials
          each · top savings · COA) + a chip rail linking each stack
          PDP plus a back-link to the Reta PDP.  Component name retains
          the legacy "RetaSpotlight" prefix; rename out of scope. */}
      <MobileRetaSpotlight products={products} />

      {/* Catalog teaser — eyebrow dropped (the section header is enough). */}
      <section className="mob-catalog-section">
        <div className="mob-catalog-header">
          <div className="mob-catalog-h-row">
            <h2 className="mob-catalog-h">The catalog</h2>
            <a href="/shop" className="mob-catalog-all">View all →</a>
          </div>
        </div>
        <div className="mob-pgrid">
          {rest.map((p) => (
            <a key={p.slug} href={`/shop/${p.slug}`} className="mob-pcard">
              <div className="mob-pcard-img">
                {p.type === "stack" ? (
                  <span className="mob-card-stack-ribbon">Stack</span>
                ) : p.regularPrice && p.regularPrice > p.price ? (
                  <span className="mob-card-sale-ribbon">Sale</span>
                ) : null}
                <span className="mob-cat-pill">{categoryShort(p.category)}</span>
                <span className={`mob-stock-chip ${p.stock === "low" ? "is-low" : "is-in"}`}>
                  <span className="sd" />
                  {p.stock === "low" ? "Low stock" : "In stock"}
                </span>
                <Image
                  src={`/images/products/source/purepep-vial-${p.slug}-v1.0.jpg`}
                  alt={`${p.compound} vial`}
                  fill
                  sizes="50vw"
                  className="mob-pcard-hero-img"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="mob-pcard-body">
                <div className="mob-pname">{p.name}</div>
                <div className="mob-pdesc">{shortDesc(p)}</div>
                <div className="mob-pcard-foot">
                  <span className="mob-pprice">${Math.round(p.price)}</span>
                  <span className="mob-parr">→</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Transparency — eyebrow dropped, headline declarative. */}
      <section className="mob-transparency">
        <div className="mob-tr-header">
          <h2 className="mob-tr-h">Independent verification</h2>
        </div>
        <div className="mob-tr-stack">
          <a href="/quality" className="mob-tr-card">
            <div className="mob-tr-card-row">
              <div className="mob-tr-card-num">01</div>
              <div className="mob-tr-card-content">
                <h3 className="mob-tr-card-h">How we test every lot</h3>
                <p className="mob-tr-card-cap">
                  Independent HPLC, mass spec, and LAL endotoxin verification on every batch — same
                  protocols as institutional research suppliers.
                </p>
                <div className="mob-tr-card-action">
                  <span>Read methods</span>
                  <span className="arr">→</span>
                </div>
              </div>
            </div>
          </a>
          <a href="/documentation" className="mob-tr-card">
            <div className="mob-tr-card-row">
              <div className="mob-tr-card-num">02</div>
              <div className="mob-tr-card-content">
                <h3 className="mob-tr-card-h">Read a real Certificate of Analysis</h3>
                <p className="mob-tr-card-cap">
                  Lot-specific, third-party COA documents purity, identity, and endotoxin level. Open
                  a sample to see what ships with every vial.
                </p>
                <div className="mob-tr-card-action">
                  <span>Open sample</span>
                  <span className="arr">→</span>
                </div>
              </div>
            </div>
          </a>
          <a href="/researcher-access" className="mob-tr-card">
            <div className="mob-tr-card-row">
              <div className="mob-tr-card-num">03</div>
              <div className="mob-tr-card-content">
                <h3 className="mob-tr-card-h">21+ qualified researchers only</h3>
                <p className="mob-tr-card-cap">
                  Eligibility verified at checkout. Sold strictly for in vitro laboratory research —
                  not for human or veterinary use.
                </p>
                <div className="mob-tr-card-action">
                  <span>Verify access</span>
                  <span className="arr">→</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Process timeline — eyebrow dropped, declarative headline + tightened sub. */}
      <section className="mob-process" data-mob-section="dark">
        <div className="mob-process-header">
          <h2 className="mob-process-h">From order to your lab</h2>
          <p className="mob-process-sub">
            What happens after you tap Add to cart. No cold-chain anxiety.
          </p>
        </div>
        <div className="mob-timeline">
          <div className="mob-tstep">
            <div className="mob-tstep-num">1</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">Within 1 hour</div>
              <h3 className="mob-tstep-h">Order confirmed</h3>
              <p className="mob-tstep-cap">
                Research eligibility verified. Your lot is allocated and reserved against your order.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">2</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">Same / next business day</div>
              <h3 className="mob-tstep-h">COA released + dispatched</h3>
              <p className="mob-tstep-cap">
                Lot-specific Certificate of Analysis issued. Tracked package leaves the US warehouse.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">3</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">2–3 days</div>
              <h3 className="mob-tstep-h">Delivered</h3>
              <p className="mob-tstep-cap">
                Lyophilized powder, stable at room temperature in transit. Discreet, unbranded packaging.
              </p>
            </div>
          </div>
          <div className="mob-tstep">
            <div className="mob-tstep-num">4</div>
            <div className="mob-tstep-body">
              <div className="mob-tstep-meta">In your lab</div>
              <h3 className="mob-tstep-h">Research-ready</h3>
              <p className="mob-tstep-cap">
                Reconstitute with bacteriostatic water. Stable 30+ days refrigerated post-reconstitution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Referral — eyebrow dropped, declarative headline. */}
      <section className="mob-referral">
        <div className="mob-ref-frame">
          <div className="mob-ref-content">
            <h2 className="mob-ref-h">Refer a colleague, earn store credit</h2>
            <p className="mob-ref-sub">
              For labs and verified researchers. Share your code, both sides save — no caps, stack indefinitely.
            </p>
            <div className="mob-ref-stats">
              <div className="mob-r-stat">
                <div className="mob-r-stat-num">$25</div>
                <div className="mob-r-stat-label">Off their<br />first order</div>
              </div>
              <div className="mob-r-stat">
                <div className="mob-r-stat-num">$25</div>
                <div className="mob-r-stat-label">Credit when<br />they receive</div>
              </div>
              <div className="mob-r-stat">
                <div className="mob-r-stat-num">∞</div>
                <div className="mob-r-stat-label">Referrals<br />no cap</div>
              </div>
            </div>
            <a href="/affiliates" className="mob-ref-cta">
              Join the program
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <span className="mob-ref-fine">Min. order $150 · Credit applied 7 days after delivery confirmation.</span>
          </div>
        </div>
      </section>

      {/* Dark CTA — declarative headline + tightened body. */}
      <section className="mob-dcta" data-mob-section="dark">
        <div className="mob-dcta-eyebrow">For research teams</div>
        <h2 className="mob-dcta-h">Don&apos;t see what you need?</h2>
        <p className="mob-dcta-body">
          We source and synthesize additional peptides for labs and repeat buyers. Send us your spec —
          we respond within one business day.
        </p>
        <a href="/legal/contact" className="mob-cta-amber-base mob-dcta-btn">
          Request a quote
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      <MobileFooter />
    </div>
  );
}

/** Map full Category to the short pill label seen on cards. */
function categoryShort(c: Product["category"]): string {
  switch (c) {
    case "Incretin mimetics":
      return "GLP-1";
    case "GH secretagogues":
      return "Growth";
    case "Healing":
      return "Healing";
    case "Cognition":
      return "Cognition";
    case "Metabolic":
      return "Metabolic";
  }
}

/** First sentence of description, capped to ~50 chars to fit the card. */
function shortDesc(p: Product): string {
  const first = p.description.split(".")[0] ?? p.name;
  return first.length > 60 ? first.slice(0, 57) + "..." : first + ".";
}
