"use client";
import { useState } from "react";
import Link from "next/link";
import { Eyebrow, Button, Hairline } from "@/components/storefront/primitives";

const TIER_ROWS = [
  { tier: "Base", revenue: "$0 – $999", rate: "TBD%", bonus: "—" },
  { tier: "Silver", revenue: "$1,000 – $4,999", rate: "TBD%", bonus: "TBD" },
  { tier: "Gold", revenue: "$5,000 – $19,999", rate: "TBD%", bonus: "TBD" },
  { tier: "Platinum", revenue: "$20,000+", rate: "TBD%", bonus: "TBD" },
];

const FAQ_ITEMS = [
  {
    q: "Who can join the affiliate program?",
    a: "Any researcher, content creator, or educator who reaches an audience of qualified scientific researchers. Standard age and eligibility requirements apply.",
  },
  {
    q: "How does the tracking cookie work?",
    a: "Clicks on your referral link set a first-party cookie for a rolling window. Any purchase made during that window credits your account.",
  },
  {
    q: "When are payouts issued?",
    a: "Payouts are issued on the 15th of each month for the prior month's confirmed commissions, once the balance reaches the payout threshold.",
  },
  {
    q: "What payment methods are available?",
    a: "ACH (US), SEPA (EU), and crypto (USDC on Ethereum mainnet). Wire available for balances over $500.",
  },
];

export default function AffiliatesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-24 pb-[104px]">
          <div className="max-w-[860px]">
            <Eyebrow>PurePep affiliate program</Eyebrow>
            <h1
              className="my-7 font-display font-black leading-[0.98] tracking-[-0.035em] text-ink"
              style={{ fontSize: "clamp(48px, 6.4vw, 92px)", textWrap: "balance" } as React.CSSProperties}
            >
              Earn commission on every verified researcher you refer.
            </h1>
            <p className="mb-10 max-w-[620px] font-sans text-[19px] leading-relaxed text-ink">
              Lot-matched COA means your audience trusts the product. That trust converts.
            </p>
            <div className="flex flex-wrap items-center gap-7">
              <a
                href="#apply"
                className="inline-flex items-center justify-center border border-ink bg-ink px-6 py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-bone no-underline hover:bg-ink/90"
              >
                Apply now →
              </a>
              <Link
                href="/affiliates/dashboard"
                className="font-sans text-[14px] font-semibold tracking-[-0.005em] text-ink underline underline-offset-4 no-underline"
              >
                Already an affiliate? Access dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-ink bg-surface">
        <div className="layout-content py-24">
          <div className="mb-14 max-w-[640px]">
            <Eyebrow>How it works</Eyebrow>
            <h2
              className="mt-4.5 font-display font-black leading-[1] tracking-[-0.03em] text-ink"
              style={{ fontSize: "clamp(32px, 3.8vw, 52px)" }}
            >
              Three steps. No gimmicks.
            </h2>
          </div>
          <div className="grid grid-cols-3">
            {[
              { n: "01", t: "Share", b: "Get your unique referral link. Drop it in forums, videos, newsletters, or DMs." },
              { n: "02", t: "Convert", b: "Your audience orders. Cookie tracks for a rolling window." },
              { n: "03", t: "Earn", b: "Payouts issued on the 15th of every month once balance hits the threshold." },
            ].map((s, i) => (
              <div
                key={s.n}
                className="border-y border-r border-ink bg-bone px-9 py-10"
                style={{ borderLeft: i === 0 ? "1.5px solid var(--pp-ink)" : "none" }}
              >
                <div className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {s.n} · {s.t.toUpperCase()}
                </div>
                <h3 className="mb-3.5 font-display text-[28px] font-black leading-[1.1] tracking-[-0.025em] text-ink">
                  {s.t}
                </h3>
                <p className="font-sans text-[15px] leading-relaxed text-ink">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier table */}
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-[88px]" style={{ maxWidth: 1080 }}>
          <div className="mb-9">
            <Eyebrow>Commission structure</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(30px, 3.4vw, 44px)" }}
            >
              Tiers evaluated monthly.
            </h2>
          </div>
          <div className="border border-ink bg-bone">
            {/* header */}
            <div
              className="grid border-b border-ink bg-surface px-5 py-3.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink"
              style={{ gridTemplateColumns: "1.2fr 1.8fr 1fr 1fr" }}
            >
              {["Tier", "Monthly referred revenue", "Commission", "Bonus"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {TIER_ROWS.map((r, i) => (
              <div
                key={r.tier}
                className="grid items-center px-5 py-[18px]"
                style={{
                  gridTemplateColumns: "1.2fr 1.8fr 1fr 1fr",
                  background: i % 2 === 0 ? "var(--pp-bone)" : "var(--pp-bone-soft)",
                  borderBottom: i < TIER_ROWS.length - 1 ? "1px solid var(--pp-line)" : "none",
                }}
              >
                <span className="font-display text-[16px] font-black tracking-[-0.01em] text-ink">
                  {r.tier}
                </span>
                <span className="font-mono text-[13px] tabular-nums text-ink">{r.revenue}</span>
                <span className="font-mono text-[13px] font-semibold text-ink">{r.rate}</span>
                <span className="font-mono text-[12px] text-ink-muted">{r.bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-ink bg-surface">
        <div className="layout-content py-20">
          <div className="mb-10">
            <Eyebrow>FAQ</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
            >
              Common questions.
            </h2>
          </div>
          <div className="max-w-[720px] border border-ink">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={item.q}
                className="border-b border-ink last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-sans text-[16px] font-bold tracking-[-0.01em] text-ink">
                    {item.q}
                  </span>
                  <span className="ml-4 shrink-0 font-mono text-[14px] text-ink-muted">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-line px-6 pb-5 pt-4 font-sans text-[14.5px] leading-relaxed text-ink">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section className="bg-bone" id="apply" data-apply-anchor>
        <div className="layout-content py-20">
          <div className="mb-10 max-w-[560px]">
            <Eyebrow>Apply</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
            >
              Join the program.
            </h2>
          </div>

          {submitted ? (
            <div className="border border-emerald bg-bone px-6 py-5 max-w-[480px]">
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-emerald">
                Application received
              </p>
              <p className="mt-2 font-sans text-[14px] text-ink">
                We review applications within 3 business days and respond via email.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="flex max-w-[480px] flex-col gap-4"
            >
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                  Name
                </span>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="h-12 rounded-[2px] border border-ink bg-bone px-3.5 font-sans text-[15px] text-ink outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                  Email address
                </span>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 rounded-[2px] border border-ink bg-bone px-3.5 font-sans text-[15px] text-ink outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                  How do you reach researchers?
                </span>
                <textarea
                  rows={3}
                  placeholder="Newsletter, YouTube channel, academic forum…"
                  className="rounded-[2px] border border-ink bg-bone px-3.5 py-3 font-sans text-[15px] text-ink outline-none"
                />
              </label>
              <button
                type="submit"
                className="h-14 cursor-pointer rounded-[2px] border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone hover:bg-ink/90"
              >
                Submit application →
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
