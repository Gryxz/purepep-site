 
"use client";
import { useState } from "react";
import { Eyebrow } from "@/components/storefront/primitives";

/**
 * Slim referral card surfaced on the Account / Researcher access page —
 * mobile-only ($25 off / $25 credit / no cap). Mirrors the larger
 * homepage referral frame but tuned for the account context (smaller
 * headline, denser stats, single CTA).
 */
function ReferralCard() {
  return (
    <div className="mob-only mob-rais-referral">
      <div className="mob-rais-referral-eyebrow">Refer · Earn</div>
      <h3 className="mob-rais-referral-h">Refer a colleague, earn store credit</h3>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgb(250 247 240 / 55%)", maxWidth: "32ch" }}>
        Share your code with another verified researcher. Both sides save — no caps, stack indefinitely.
      </p>
      <div className="mob-rais-referral-stats">
        <div>
          <div className="mob-rais-referral-stat-num">$25</div>
          <div className="mob-rais-referral-stat-label">Off their<br />first order</div>
        </div>
        <div>
          <div className="mob-rais-referral-stat-num">$25</div>
          <div className="mob-rais-referral-stat-label">Credit when<br />they receive</div>
        </div>
        <div>
          <div className="mob-rais-referral-stat-num">∞</div>
          <div className="mob-rais-referral-stat-label">Referrals<br />no cap</div>
        </div>
      </div>
      <a href="/affiliates" className="mob-cta-amber-base mob-rais-referral-cta">
        Join the program
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </div>
  );
}

export default function ResearcherAccessPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {/* Hero — extra top padding on mobile so the eyebrow clears the
          fixed glass header (MobileShell). */}
      <section className="bg-bone">
        <div className="layout-content pt-14 pb-3 md:py-12">
          <Eyebrow>Researcher access</Eyebrow>
          <h1
            className="mt-4 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            Research access
          </h1>
          <p className="mt-3 max-w-[560px] font-sans text-[15px] leading-relaxed text-ink-muted md:mt-5 md:text-[18px]">
            Early lot announcements, 10% on your first order, and COA archive access.
            One email per lot release — no spam.
          </p>
        </div>
      </section>

      {/* Signup block */}
      <section className="bg-bone">
        <div className="layout-content pt-5 pb-10 md:py-16">
          <div className="grid grid-cols-1 items-end gap-8 border border-ink bg-bone px-6 py-8 md:grid-cols-[1fr_auto] md:gap-12 md:px-12 md:py-12">
            <div>
              <div className="mb-4">
                <Eyebrow>Researcher access</Eyebrow>
              </div>
              <h2
                className="font-display font-black leading-[1.05] tracking-[-0.025em] text-ink"
                style={{ fontSize: "clamp(24px, 3.4vw, 44px)" }}
              >
                10% on your first order. New lot announcements. COA archive access.
              </h2>
              <p className="mt-4 max-w-[580px] font-sans text-[14px] leading-[1.65] text-ink-muted">
                One email per lot release. No marketing spam, no affiliate promos.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex w-full flex-col gap-2.5 md:min-w-[340px] md:max-w-[420px]"
            >
              <label className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lab.edu"
                required
                className="h-[52px] rounded-md border border-ink bg-bone px-4 font-sans text-[15px] text-ink outline-none"
              />
              <button
                type="submit"
                className="h-[52px] rounded-md border border-ink bg-ink font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-bone cursor-pointer hover:bg-ink/90"
              >
                {submitted ? "Request received →" : "Request access →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="bg-surface">
        <div className="layout-content py-14 md:py-20">
          <div className="mb-8 max-w-[560px] md:mb-10">
            <Eyebrow>What you get</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              Research-tier access.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "First-order discount",
                b: "10% off your first purchase. Applied automatically at checkout.",
              },
              {
                n: "02",
                t: "Lot release alerts",
                b: "Get notified when a new lot ships and COA is available. No delay.",
              },
              {
                n: "03",
                t: "COA archive",
                b: "Full document archive — every lot, every assay. Downloadable anytime.",
              },
            ].map((item, i) => (
              <div
                key={item.n}
                className={[
                  "bg-bone px-7 py-8 md:px-9 md:py-10",
                  i < 2 ? "border-b border-b-line md:border-b-0 md:border-r md:border-r-line" : "",
                ].join(" ")}
              >
                <div className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted md:mb-6">
                  {item.n} · {item.t.toUpperCase()}
                </div>
                <h3 className="mb-3 font-display text-[20px] font-black leading-[1.15] tracking-[-0.02em] text-ink md:mb-3.5 md:text-[22px]">
                  {item.t}
                </h3>
                <p className="font-sans text-[14.5px] leading-relaxed text-ink">{item.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-only referral card */}
      <ReferralCard />
    </>
  );
}
