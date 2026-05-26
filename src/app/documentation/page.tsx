import type { Metadata } from "next";
import Link from "next/link";

/**
 * /documentation/ — static COA + methods hub linked from the header
 * nav.  No client-side fetching: the page is a pure server component
 * so it lands fully formed in the static HTML for SSR + SEO.  Lot
 * rows live as a static placeholder for now; once the WC lots feed is
 * wired up this can move to `getAllProducts()` like the Footer does.
 */

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Certificates of analysis, lot records, and methods documentation for every PurePep peptide. " +
    "One signed PDF per lot, traceable end-to-end.",
};

const LOT_RECORDS: {
  compound: string;
  lot: string;
  released: string;
  href: string;
}[] = [
  {
    compound: "RETA · Retatrutide",
    lot: "RT-2604-A11",
    released: "2026-04-12",
    href: "#",
  },
];

export default function DocumentationPage() {
  return (
    <div className="v3-shop">
      {/* ── Hero ── */}
      <section className="v3qual-hero">
        <div className="v3-container">
          <p className="v3qual-hero-eyebrow">COA · Methods</p>
          <h1 className="v3qual-hero-h1">Every lot, documented.</h1>
          <p className="v3qual-hero-deck">
            Every lot ships with a signed Certificate of Analysis: purity by
            HPLC, identity by mass spectrometry, endotoxin by LAL. Lot
            records, third-party reports, and method summaries are linked
            below — single PDF per lot, single source of truth.
          </p>
          <div className="v3qual-hero-links">
            <span className="is-pending" aria-disabled="true">Sample COA — pending</span>
            <Link href="/quality">Methods overview</Link>
            <Link href="/researcher-access">Researcher access</Link>
          </div>
          <div className="v3qual-hero-foot">
            Last sample COA released 2026-04-12 · RETA Lot RT-2604-A11
          </div>
        </div>
      </section>

      {/* ── Released lots table ── */}
      <section className="v3-section" id="lots">
        <div className="v3-container">
          <p className="v3-section-eyebrow">01 — Lot records</p>
          <h2 className="v3-section-headline">Released lots.</h2>
          <p className="v3-section-sub">
            Each row is a finalized lot with a downloadable signed COA. Older
            lots remain available for traceability — the COA never disappears
            once a lot ships.
          </p>

          <div className="v3doc-table" role="table" aria-label="Released lots">
            <div className="v3doc-row v3doc-row-head" role="row">
              <span role="columnheader">Compound</span>
              <span role="columnheader">Lot</span>
              <span role="columnheader">Released</span>
              <span role="columnheader" aria-label="Document">&nbsp;</span>
            </div>
            {LOT_RECORDS.map((row) => (
              <div key={row.lot} className="v3doc-row" role="row">
                <span className="compound">{row.compound}</span>
                <span className="lot">{row.lot}</span>
                <span className="released">{row.released}</span>
                {row.href === "#" ? (
                  <span className="v3doc-link is-pending" aria-disabled="true">
                    COA pending
                  </span>
                ) : (
                  <a href={row.href} className="v3doc-link">
                    COA (PDF) →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="v3-closing on-surface">
        <div className="v3-container">
          <p className="v3-closing-eyebrow">Need a specific lot?</p>
          <h2 className="v3-closing-headline">We keep every record.</h2>
          <p
            className="v3-section-sub"
            style={{ maxWidth: "60ch", margin: "0 auto 32px" }}
          >
            For lot history beyond the most recent release, email{" "}
            <a href="mailto:info@purepep.shop">info@purepep.shop</a>{" "}
            with the lot identifier from your vial label.
          </p>
          <div className="v3-closing-pills">
            <Link href="/shop" className="v3-pill v3-pill-primary">
              Open the catalog <span className="arrow">→</span>
            </Link>
            <Link href="/quality" className="v3-pill v3-pill-ghost">
              Read methods
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
