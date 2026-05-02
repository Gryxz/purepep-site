"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { plural } from "@/lib/text";

/**
 * v3 Apple Swiss Quality page.
 *
 * Sections (from docs/design-v3/project/Quality - Apple Swiss.html):
 *   1. Hero — "Every lot, on the record." with three deep-link mono CTAs
 *      (#methods · #sample-coa · #verify) and a foot stamp.
 *   2. Three measurements — Purity / Identity / Endotoxin. Each row is a
 *      30/70 grid with method, reference, independent-confirmation, and
 *      "typical result" strip on a hairline-framed card.
 *   3. Sample COA — full mono-style certificate card with 16-cell grid
 *      and ghost loden download pill foot.
 *   4. Verification — left column copy + bullets, right column verified-
 *      identity card + ghost CTA + verify note.
 *   5. Logistics timeline — 4-node (reuses .v3pdp-timeline).
 *   6. FAQ — accordion with five entries, plus-icon → x rotation.
 *   7. Closing CTA — "Read the COA. Then decide." dual-pill.
 */

const FAQ_ROWS = [
  [
    "Do you publish the COA before shipping?",
    "Yes. Each lot's signed COA is generated and reviewed before dispatch and is included in the order confirmation.",
  ],
  [
    "Are independent labs the same for every product?",
    "We rotate among three accredited third-party labs. The lab name appears on every COA so the chain is traceable.",
  ],
  [
    "What about chain-of-custody?",
    "Every vial is barcoded to its lot. The vial label, the COA, and the dispatch record carry the same lot identifier.",
  ],
  [
    "Can I request additional analytical work?",
    "Yes. NMR, peptide mapping, and trace-metal analysis can be added to a lot for a fee. Email research@purepep.com.",
  ],
  ["What if a lot fails?", "It does not ship. Failed lots are quarantined. We never re-test until pass."],
];

const COA_CELLS: [string, string][] = [
  ["Product", "Retatrutide (RETA)"],
  ["CAS", "2381089-83-2"],
  ["Appearance", "White lyophilized powder"],
  ["Net mass", "10 mg"],
  ["Purity (HPLC)", "99.72%"],
  ["RT", "8.42 min"],
  ["Identity (HRMS)", "4866.4 Da (Δ 0.2)"],
  ["Endotoxin (LAL)", "< 0.05 EU/mg"],
  ["Water (KF)", "2.1%"],
  ["Storage", "2–8 °C, protect from light"],
  ["Reconstitution", "Bacteriostatic water"],
  ["EXP", "2027-04"],
  ["Analyst", "J. Liang, Ph.D."],
  ["Reviewer", "M. Tatum, MS"],
  ["Third-party", "Eurofins Lancaster Labs"],
  ["Status", "Released"],
];

export function QualityPage({ productCount = 0 }: { productCount?: number }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="v3-shop">
      {/* ───── Hero ───── */}
      <section className="v3qual-hero">
        <div className="v3-container">
          <p className="v3qual-hero-eyebrow">Quality · Methods · Lots</p>
          <h1 className="v3qual-hero-h1">Every lot, on the record.</h1>
          <p className="v3qual-hero-deck">
            Three independent measurements per lot — purity, identity, endotoxin — published as a downloadable
            Certificate of Analysis. No claims of efficacy. No marketing math. Just the spec sheet.
          </p>
          <div className="v3qual-hero-links">
            <a href="#methods">Read methods</a>
            <a href="#sample-coa">Open sample COA</a>
            <a href="#verify">Verify researcher access</a>
          </div>
          <div className="v3qual-hero-foot">Last sample COA released 2026-04-12 · RETA Lot RT-2604-A11</div>
        </div>
      </section>

      {/* ───── Three measurements ───── */}
      <section className="v3-section v3qual-measurements" id="methods">
        <div className="v3-container">
          <div className="v3qual-section-head">
            <p className="v3-section-eyebrow">01 — Methods</p>
            <h2 className="v3-section-headline">Three measurements. One COA.</h2>
            <p className="v3-section-sub">
              Each lot is assayed in-house, then independently confirmed by an accredited third-party laboratory before
              release.
            </p>
          </div>

          <div className="v3qual-measure-row">
            <div className="v3qual-measure-left">
              <p className="num">01.1</p>
              <h3 className="name">Purity</h3>
              <p className="target">≥99.5% target</p>
            </div>
            <div className="v3qual-measure-right">
              <p>
                <strong>Method:</strong> Reverse-phase C18 HPLC with UV detection at 214 nm.
              </p>
              <p>
                <strong>Reference:</strong> Compared against an in-house qualified reference standard for each
                compound.
              </p>
              <p>
                <strong>Independent confirmation:</strong> Third-party lab repeats the assay per lot and signs the COA.
              </p>
              <p>
                <strong>Reported as:</strong> Area% of main peak. Listed on the COA as <em>Purity (HPLC)</em>.
              </p>
              <div className="v3qual-typical-strip">
                <span className="lbl">Typical result</span>
                <span className="val">99.72%</span>
              </div>
            </div>
          </div>

          <div className="v3qual-measure-row">
            <div className="v3qual-measure-left">
              <p className="num">01.2</p>
              <h3 className="name">Identity</h3>
              <p className="target">≤0.5 Da deviation</p>
            </div>
            <div className="v3qual-measure-right">
              <p>
                <strong>Method:</strong> ESI high-resolution mass spectrometry (HRMS).
              </p>
              <p>
                <strong>Confirmation:</strong> Observed monoisotopic mass within ≤0.5 Da of theoretical for the named
                sequence.
              </p>
              <p>
                <strong>Independent confirmation:</strong> Third-party HRMS repeated per lot.
              </p>
              <p>
                <strong>Reported as:</strong> Observed mass + theoretical mass + delta on the COA, signed.
              </p>
              <div className="v3qual-typical-strip">
                <span className="lbl">Typical result</span>
                <span className="val">4866.4 Da · Δ 0.2 Da</span>
              </div>
            </div>
          </div>

          <div className="v3qual-measure-row">
            <div className="v3qual-measure-left">
              <p className="num">01.3</p>
              <h3 className="name">Endotoxin</h3>
              <p className="target">&lt; 1.0 EU/mg threshold</p>
            </div>
            <div className="v3qual-measure-right">
              <p>
                <strong>Method:</strong> Limulus Amebocyte Lysate (LAL) assay, gel-clot or kinetic-chromogenic.
              </p>
              <p>
                <strong>Per-lot:</strong> Every production lot is tested before COA release.
              </p>
              <p>
                <strong>Independent confirmation:</strong> Third-party lab repeats LAL per lot.
              </p>
              <p>
                <strong>Reported as:</strong> EU/mg on the COA, signed and dated.
              </p>
              <div className="v3qual-typical-strip">
                <span className="lbl">Typical result</span>
                <span className="val">&lt; 0.05 EU/mg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Sample COA ───── */}
      <section className="v3-section v3qual-coa-band" id="sample-coa">
        <div className="v3-container">
          <div className="v3qual-section-head">
            <p className="v3-section-eyebrow">02 — Sample COA</p>
            <h2 className="v3-section-headline">Read a real Certificate of Analysis.</h2>
            <p className="v3-section-sub">
              Below is the released COA for RETA Lot RT-2604-A11. Every order ships with a lot-matched document in the
              same format.
            </p>
          </div>

          <article className="v3qual-coa-card" aria-label="Sample certificate of analysis">
            <div className="v3qual-coa-head">
              <span>Certificate of Analysis</span>
              <span>Lot RT-2604-A11 · Issued 2026-04-12</span>
            </div>
            <div className="v3qual-coa-grid">
              {COA_CELLS.map(([lbl, val]) => (
                <div key={lbl} className="v3qual-coa-cell">
                  <span className="lbl">{lbl}</span>
                  <span className="val">{val}</span>
                </div>
              ))}
            </div>
            <div className="v3qual-coa-foot">
              <span className="url">purepep.com/coa/rt-2604-a11.pdf</span>
              <a href="#" className="v3qual-coa-foot-pill">
                Download COA (PDF, 482 KB) ↓
              </a>
            </div>
          </article>
          <p className="v3qual-coa-caption">
            This is a sample. Every order ships with a lot-matched COA in the same format.
          </p>
        </div>
      </section>

      {/* ───── Verification ───── */}
      <section className="v3-section v3qual-verify-band" id="verify">
        <div className="v3-container">
          <div className="v3qual-verify-grid">
            <div>
              <p className="v3-section-eyebrow">03 — Access</p>
              <h2 className="v3-section-headline">
                21+ qualified
                <br />
                researchers only.
              </h2>
              <p className="v3-section-sub">
                PurePep verifies institutional or independent research credentials before the first order. Verification
                keeps the catalog where it belongs — in working laboratories.
              </p>
              <ul className="v3qual-verify-bullets">
                <li>
                  <span className="dash">—</span>
                  <span>University, hospital, or independent research lab affiliation</span>
                </li>
                <li>
                  <span className="dash">—</span>
                  <span>Independent researchers: prior publication or verifiable lab address</span>
                </li>
                <li>
                  <span className="dash">—</span>
                  <span>All accounts re-verified annually</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="v3qual-verify-card">
                <div className="v3qual-verify-row">
                  <span className="ldot" aria-hidden="true" />
                  <span className="lbl">Identity</span>
                  <span className="val">Verified</span>
                </div>
                <div className="v3qual-verify-row">
                  <span className="ldot" aria-hidden="true" />
                  <span className="lbl">Institution</span>
                  <span className="val">Verified</span>
                </div>
                <div className="v3qual-verify-row">
                  <span className="ldot" aria-hidden="true" />
                  <span className="lbl">Status</span>
                  <span className="val">Active until 2027-04</span>
                </div>
              </div>
              <div className="v3qual-verify-cta-wrap">
                <Link href="/researcher-access" className="v3-pill v3-pill-ghost">
                  Apply for an account <span className="arrow">→</span>
                </Link>
                <p className="v3qual-verify-cta-note">Approved within 1 business day for most applications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Logistics timeline ───── */}
      <section className="v3-section">
        <div className="v3-container">
          <p className="v3-section-eyebrow">Logistics</p>
          <h2 className="v3-section-headline">From order to lab.</h2>
          <p className="v3-section-sub">
            What happens after Add to cart. No surprises, no cold-chain anxiety.
          </p>

          <div className="v3pdp-timeline-wrap">
            <div className="v3pdp-timeline">
              {[
                ["Order confirmed", "Research eligibility verified. Your lot is allocated and reserved within 1 hour."],
                ["COA released + dispatched", "Lot-specific Certificate of Analysis issued. Ships same or next business day."],
                ["Delivered", "Lyophilized powder, stable at room temperature in transit. No cold-chain anxiety."],
                ["Research-ready", "Reconstitute with bacteriostatic water. Stable 30+ days refrigerated post-reconstitution."],
              ].map(([title, body], i) => (
                <div key={title} className="v3pdp-tl-node">
                  <div className="v3pdp-tl-circle">{i + 1}</div>
                  <div className="v3pdp-tl-card">
                    <h3 className="v3pdp-tl-title">{title}</h3>
                    <p className="v3pdp-tl-body">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="v3-section v3qual-faq-band">
        <div className="v3-container">
          <p className="v3-section-eyebrow">04 — Questions</p>
          <h2 className="v3-section-headline">What researchers ask.</h2>

          <div className="v3qual-faq-list">
            {FAQ_ROWS.map(([q, a], i) => {
              const open = openIdx === i;
              return (
                <div key={q} className={clsx("v3qual-faq-row", open && "is-open")}>
                  <button
                    type="button"
                    className="v3qual-faq-q"
                    aria-expanded={open}
                    onClick={() => setOpenIdx(open ? null : i)}
                  >
                    <span>{q}</span>
                    <span className="icon" aria-hidden="true" />
                  </button>
                  <div className="v3qual-faq-a">
                    <div className="v3qual-faq-a-inner">{a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Closing CTA ───── */}
      <section className="v3-closing on-surface">
        <div className="v3-container">
          <p className="v3-closing-eyebrow">Open the spec sheet</p>
          <h2 className="v3-closing-headline">Read the COA. Then decide.</h2>
          <div className="v3-closing-pills">
            <a href="#sample-coa" className="v3-pill v3-pill-primary">
              Download sample COA <span className="arrow">↓</span>
            </a>
            <Link href="/shop" className="v3-pill v3-pill-ghost">
              Browse {plural(productCount, "peptide")} <span className="arrow">→</span>
            </Link>
          </div>
          <div className="v3-closing-stamp">
            For research use only · Not for human consumption · Sales final
          </div>
        </div>
      </section>
    </div>
  );
}
