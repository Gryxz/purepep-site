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
      {/* Trust strip */}
      <div className="mob-trust-bar">
        <div className="mob-trust-item"><span className="dot" />99.5%+ Purity</div>
        <div className="mob-trust-item"><span className="dot" />Third-Party Tested</div>
        <div className="mob-trust-item"><span className="dot" />2-3 Day Shipping</div>
        <div className="mob-trust-item"><span className="dot" />Free over $200</div>
      </div>

      {/* Hero */}
      <section className="mob-hero">
        <div className="mob-hero-bg" />
        <div className="mob-hero-corner tl" />
        <div className="mob-hero-corner tr" />
        <div className="mob-hero-corner bl" />
        <div className="mob-hero-corner br" />
        <div className="mob-hero-content">
          <div className="mob-hero-eyebrow">
            <span className="dot" />
            Research-grade peptides
          </div>
          <h1 className="mob-hero-h1">The standard for research peptides.</h1>
          <p className="mob-hero-sub">
            Lab-verified compounds for in vitro research. Documented, tracked, shipped from the US.
          </p>
          <div className="mob-hero-ctas">
            <a href={featured ? `/shop/${featured.slug}` : "/shop"} className="mob-cta-amber">
              {featured ? `Shop ${featured.name}` : "Shop the catalog"}
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="/shop" className="mob-cta-ghost">
              Browse catalog
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
          <div className="mob-hero-compliance">
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            21+ Qualified researchers · Research use only
          </div>
        </div>
      </section>

      {/* Spotlight */}
      {featured && (
        <section className="mob-spotlight">
          <div className="mob-spotlight-eyebrow">Featured · Triple agonist</div>
          <h2 className="mob-spotlight-h">
            Our flagship compound, <em>{featured.name}.</em>
          </h2>
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
              <p className="mob-spotlight-desc">{shortDesc(featured)}</p>
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

      {/* Catalog teaser */}
      <section className="mob-catalog-section">
        <div className="mob-catalog-header">
          <div className="mob-catalog-eyebrow">Browse all</div>
          <div className="mob-catalog-h-row">
            <h2 className="mob-catalog-h">The catalog.</h2>
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

      {/* Transparency */}
      <section className="mob-transparency">
        <div className="mob-tr-header">
          <div className="mob-tr-eyebrow">See for yourself</div>
          <h2 className="mob-tr-h">Trust, <em>verified.</em></h2>
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

      {/* Process timeline */}
      <section className="mob-process">
        <div className="mob-process-header">
          <div className="mob-process-eyebrow">After checkout</div>
          <h2 className="mob-process-h">From order <em>to lab.</em></h2>
          <p className="mob-process-sub">
            No surprises. No cold-chain anxiety. Here&apos;s exactly what happens after you tap Add to cart.
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

      {/* Referral */}
      <section className="mob-referral">
        <div className="mob-ref-frame">
          <div className="mob-ref-content">
            <div className="mob-ref-eyebrow">Refer · Earn</div>
            <h2 className="mob-ref-h">Bring a researcher. <em>Earn store credit.</em></h2>
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

      {/* Dark CTA */}
      <section className="mob-dcta">
        <div className="mob-dcta-eyebrow">For Research Teams</div>
        <h2 className="mob-dcta-h">Need a compound <em>that isn&apos;t listed?</em></h2>
        <p className="mob-dcta-body">
          We regularly source and synthesize additional peptides for labs and repeat buyers. Reach out
          with your spec — we&apos;ll respond within one business day.
        </p>
        <a href="/legal/contact" className="mob-dcta-btn">
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
