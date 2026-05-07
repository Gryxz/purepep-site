/* eslint-disable @next/next/no-html-link-for-pages */

import type { Product } from "@/data/products";
import { MobileVial } from "./MobileVial";
import { MobileFooter } from "./MobileFooter";

/**
 * v5 mobile homepage — ported 1:1 from
 * docs/design-v3/mobile-mockups/Home.html.
 *
 * Sections:
 *   1. Trust strip (4 items)
 *   2. Hero (cinematic dark, layered amber gradient mesh + dot grid +
 *      corner ornaments + eyebrow pill + 42px H1 + deck + 2 CTAs +
 *      compliance badge)
 *   3. Spotlight — featured RETA product card (linked to /shop/reta)
 *   4. Catalog teaser — 2-col grid of remaining products
 *   5. Transparency — 3 stacked editorial cards
 *   6. Process — dark 4-step timeline "From order to lab"
 *   7. Referral — full-bleed amber framed card with stats
 *   8. Dark CTA — "Need a compound that isn't listed?"
 *   9. MobileFooter
 */
export function MobileHomePage({ products }: { products: Product[] }) {
  // Featured product is the first product (RETA in the canonical fixture).
  // Fall back to undefined-safe so an empty catalog doesn't crash the page.
  const featured = products[0];
  const rest = products.slice(1, 8); // up to 7 cards in the catalog teaser

  return (
    <div className="mob-app">
      {/* Trust strip — auto-loop marquee.  Items duplicated so the
          translate(-50%) wrap reads seamlessly. */}
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

      {/* Hero — corner ornaments + 21+ compliance pill removed.  CTA now
          carries a spec tagline so new visitors understand the flagship. */}
      <section className="mob-hero" data-mob-section="dark">
        <div className="mob-hero-bg" />
        <div className="mob-hero-content">
          <div className="mob-hero-eyebrow">
            <span className="dot" />
            Research-grade peptides
          </div>
          <h1 className="mob-hero-h1">The standard for research peptides.</h1>
          <p className="mob-hero-sub">
            Lab-verified peptides for in vitro research. Lot-matched COA on every vial, tracked US shipping.
          </p>
          <div className="mob-hero-ctas">
            <a href={featured ? `/shop/${featured.slug}` : "/shop"} className="mob-cta-amber-base mob-cta-amber">
              {featured ? `Shop ${featured.name}` : "Shop the catalog"}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            {featured && (
              <p className="mob-hero-cta-tagline">
                {featured.compound === "RETA"
                  ? `${featured.name} · Triple GLP-1 / GIP / glucagon agonist`
                  : `${featured.name} · ${shortSpec(featured)}`}
              </p>
            )}
            <a href="/shop" className="mob-cta-ghost">
              Browse catalog
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Spotlight — eyebrow dropped (context is now in the spec line);
          declarative title; explicit spec line so visitors know what
          this compound is at a glance. */}
      {featured && (
        <section className="mob-spotlight">
          <h2 className="mob-spotlight-h">{featured.name} — our flagship compound</h2>
          <a href={`/shop/${featured.slug}`} className="mob-spotlight-card">
            <div className="mob-spotlight-img">
              <span className="mob-spotlight-cat">{categoryShort(featured.category)}</span>
              {featured.stock !== "out" && (
                <span className="mob-spotlight-stock"><span className="sd" />In stock</span>
              )}
              <MobileVial
                size="md"
                compound={featured.compound}
                mass={featured.dose}
                fullName={featured.name}
                purity="≥99.5%"
              />
            </div>
            <div className="mob-spotlight-body">
              <h3 className="mob-spotlight-name">{featured.name}</h3>
              <p className="mob-spotlight-spec">{shortSpec(featured)}</p>
              <div className="mob-spotlight-foot">
                <div className="mob-spotlight-price-block">
                  <span className="mob-spotlight-price">${Math.round(featured.price)}</span>
                  <span className="mob-spotlight-per">{featured.dose} vial</span>
                </div>
                <span className="mob-spotlight-cta">
                  Shop now
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </section>
      )}

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
                <span className="mob-cat-pill">{categoryShort(p.category)}</span>
                <span className={`mob-stock-chip ${p.stock === "low" ? "is-low" : "is-in"}`}>
                  <span className="sd" />
                  {p.stock === "low" ? "Low stock" : "In stock"}
                </span>
                <MobileVial
                  size="md"
                  compound={p.compound}
                  mass={p.dose}
                  purity="≥99.5%"
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

/** Compact technical spec line: receptor profile + structure + form. */
function shortSpec(p: Product): string {
  const knownSpec: Record<string, string> = {
    RETA: "Triple GLP-1 / GIP / glucagon agonist · 39 amino acids · Lyophilized",
    SEMA: "GLP-1 receptor agonist · 31 amino acids · Lyophilized",
    TIRZ: "Dual GLP-1 / GIP agonist · 39 amino acids · Lyophilized",
    CAGRI: "Long-acting amylin analogue · Lyophilized",
    SURVO: "Dual GLP-1 / glucagon agonist · Lyophilized",
    BPC: "Pentadecapeptide · 15 amino acids · Lyophilized",
    "BPC-157": "Pentadecapeptide · 15 amino acids · Lyophilized",
    "TB-500": "Thymosin β-4 fragment · 17 amino acids · Lyophilized",
    TB500: "Thymosin β-4 fragment · 17 amino acids · Lyophilized",
    IPAM: "GH secretagogue pentapeptide · Lyophilized",
    BACW: "0.9% benzyl alcohol bacteriostatic water · Sterile-filtered",
  };
  return knownSpec[p.compound] ?? `${p.purity.replace(/\s*\(.*\)$/, "")} · Lyophilized`;
}
