"use client";
import { useState } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/storefront/primitives";
import { clsx } from "@/lib/clsx";

const HERO_STATS = [
  { value: "$25", caption: "Off their first order" },
  { value: "$25", caption: "Credit to your account" },
  { value: "∞", caption: "No referral cap" },
];

const STEPS = [
  {
    n: "01",
    t: "Share",
    b: "Copy your personal referral link and send it to a colleague.",
  },
  {
    n: "02",
    t: "They order",
    b: "Their first order gets $25 off automatically at checkout. Min. $150 order.",
  },
  {
    n: "03",
    t: "You earn",
    b: "You receive $25 store credit 7 days after their delivery is confirmed.",
  },
];

const RULES = [
  "Min. $150 order required for the discount to apply.",
  "Credit issued 7 days after delivery confirmation, not on order.",
  "One discount per new account. Existing accounts are ineligible.",
  "Store credit valid for 12 months from issue date.",
];

const FAQ_ITEMS = [
  {
    q: "Who can participate?",
    a: "Any verified 21+ researcher with a PurePep account. Both the referrer and the new customer must meet age and eligibility requirements.",
  },
  {
    q: "Is there a referral cap?",
    a: "No. Refer as many colleagues as you like. Each successful referral earns you $25 store credit, stackable indefinitely.",
  },
  {
    q: "How is 'delivery confirmed' defined?",
    a: "We use the carrier tracking event 'Delivered' as the trigger. Credit is issued 7 days after that event to account for return/refund windows.",
  },
  {
    q: "Can I use my referral link publicly?",
    a: "Yes. Post it in forums, newsletters, or lab communications. The $25 discount applies to any new account that orders through your link.",
  },
];

const MOCK_LINK = "https://purepep.shop/?ref=PP-REF-XXXX";
const SHARE_SUBJECT = "Try PurePep — $25 off your first order";
const SHARE_BODY =
  "I've been ordering from PurePep — lot-matched COA, ships same day. Use my link for $25 off your first order: ";

export default function ReferralPage() {
  const [step, setStep] = useState<"form" | "generated">("form");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_LINK);
    } catch {
      /* clipboard unavailable — keep UI feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const mailHref = `mailto:?subject=${encodeURIComponent(SHARE_SUBJECT)}&body=${encodeURIComponent(SHARE_BODY + MOCK_LINK)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_BODY + MOCK_LINK)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(MOCK_LINK)}`;

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="bg-bone">
        <div className="layout-content py-16 pb-18 md:py-24 md:pb-[104px]">
          <div className="max-w-[920px]">
            <Eyebrow>Researcher referral program</Eyebrow>
            <h1
              className="my-6 font-display font-black leading-[0.98] tracking-[-0.035em] text-ink md:my-7"
              style={{ fontSize: "clamp(40px, 6vw, 88px)", textWrap: "balance" } as React.CSSProperties}
            >
              Share with a colleague.
              <br />
              Both of you save.
            </h1>
            <p className="mb-8 max-w-[640px] font-sans text-[16px] leading-relaxed text-ink md:mb-10 md:text-[19px]">
              Every verified researcher you refer gets $25 off their first order.
              You get $25 store credit when their order ships. No cap. Stack indefinitely.
            </p>
            <div className="flex flex-wrap items-center gap-5 md:gap-7">
              <a
                href="#get-link"
                className="inline-flex h-12 items-center justify-center rounded-md border border-ink bg-ink px-6 font-mono text-[13px] uppercase tracking-[0.12em] text-bone no-underline hover:bg-ink/90"
              >
                Get your referral link →
              </a>
              <Link
                href="/shop"
                className="inline-flex min-h-[44px] items-center font-sans text-[14px] font-semibold tracking-[-0.005em] text-ink underline underline-offset-4"
              >
                Already have a link? Use it →
              </Link>
            </div>

            {/* Stat boxes inline */}
            <div className="mt-12 grid grid-cols-1 border border-ink sm:grid-cols-3 md:mt-16">
              {HERO_STATS.map((s, i) => (
                <div
                  key={s.caption}
                  className={clsx(
                    "bg-bone px-6 py-7 md:px-8 md:py-8",
                    i < HERO_STATS.length - 1 && "border-b border-b-ink sm:border-b-0 sm:border-r sm:border-r-ink",
                  )}
                >
                  <p
                    className="font-display font-black leading-[1] tracking-[-0.03em] text-ink"
                    style={{ fontSize: "clamp(40px, 4.4vw, 56px)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                    {s.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── How it works ─────────────────────── */}
      <section className="bg-surface">
        <div className="layout-content py-16 md:py-24">
          <div className="mb-10 max-w-[640px] md:mb-14">
            <Eyebrow>How it works</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.03em] text-ink md:mt-4.5"
              style={{ fontSize: "clamp(28px, 3.8vw, 52px)" }}
            >
              Three steps. Both sides win.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className={clsx(
                  "bg-bone px-7 py-8 md:px-9 md:py-10",
                  i < STEPS.length - 1 && "border-b border-b-line md:border-b-0 md:border-r md:border-r-line",
                )}
              >
                <div className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted md:mb-6">
                  {s.n} · {s.t.toUpperCase()}
                </div>
                <h3 className="mb-3 font-display text-[24px] font-black leading-[1.1] tracking-[-0.025em] text-ink md:mb-3.5 md:text-[28px]">
                  {s.t}
                </h3>
                <p className="font-sans text-[14.5px] leading-relaxed text-ink">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Get your link ──────────────────────── */}
      <section className="bg-bone" id="get-link">
        <div className="layout-content py-16 md:py-24">
          <div className="mb-8 max-w-[640px] md:mb-10">
            <Eyebrow>Your referral link</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.03em] text-ink"
              style={{ fontSize: "clamp(28px, 3.8vw, 52px)" }}
            >
              Start referring.
            </h2>
          </div>

          {step === "form" ? (
            <form
              onSubmit={(e) => { e.preventDefault(); setStep("generated"); }}
              className="max-w-[640px]"
            >
              <label htmlFor="ref-email" className="mb-2 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
                Account email
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                <input
                  id="ref-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your account email"
                  className="h-14 flex-1 rounded-md border border-ink bg-bone px-4 font-sans text-[15px] text-ink outline-none placeholder:text-ink-muted sm:rounded-r-none sm:border-r-0"
                />
                <button
                  type="submit"
                  className="inline-flex h-14 cursor-pointer items-center justify-center rounded-md border border-ink bg-ink px-7 font-mono text-[13px] uppercase tracking-[0.12em] text-bone hover:bg-ink/90 sm:rounded-l-none"
                >
                  Generate link →
                </button>
              </div>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Must match an existing PurePep account.
              </p>
            </form>
          ) : (
            <div className="max-w-[720px]">
              {/* Success banner */}
              <div className="mb-6 inline-flex items-center gap-3 border border-emerald bg-bone px-4 py-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-emerald">
                  Link generated
                </span>
              </div>

              {/* Link + copy */}
              <div className="border border-ink bg-bone">
                <div className="border-b border-line px-5 py-3">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    Your unique referral link
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-0 sm:flex-row sm:items-center">
                  <code className="flex-1 truncate px-5 py-5 font-mono text-[14px] text-ink sm:text-[15px]">
                    {MOCK_LINK}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={clsx(
                      "inline-flex h-14 cursor-pointer items-center justify-center border-t border-ink px-7 font-mono text-[13px] uppercase tracking-[0.12em] transition-colors sm:h-auto sm:self-stretch sm:border-t-0 sm:border-l",
                      copied ? "bg-emerald text-bone" : "bg-ink text-bone hover:bg-ink/90",
                    )}
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>

              {/* Share row */}
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  Share via
                </span>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={mailHref}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-ink bg-bone px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink no-underline hover:bg-surface"
                  >
                    Email
                  </a>
                  <a
                    href={twitterHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-ink bg-bone px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink no-underline hover:bg-surface"
                  >
                    Twitter
                  </a>
                  <a
                    href={linkedinHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-ink bg-bone px-5 font-mono text-[12px] uppercase tracking-[0.12em] text-ink no-underline hover:bg-surface"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setStep("form"); setEmail(""); }}
                className="mt-8 cursor-pointer font-sans text-[13px] font-semibold text-ink underline underline-offset-4 hover:text-ink-muted"
              >
                Generate a different link →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── Fine print ───────────────────────── */}
      <section className="bg-surface">
        <div className="layout-content py-14 md:py-20">
          <div className="mb-8 max-w-[640px] md:mb-10">
            <Eyebrow>Program rules</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              The fine print.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-0 border border-ink sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map((rule, i) => (
              <div
                key={i}
                className={clsx(
                  "bg-bone px-5 py-6 md:px-6 md:py-7",
                  // bottom borders for stacked mobile (all but last)
                  i < RULES.length - 1 && "border-b border-b-line",
                  // sm: 2-col — clear bottom borders selectively
                  "sm:border-b-0",
                  i < 2 && "sm:border-b sm:border-b-line",
                  i % 2 === 0 && "sm:border-r sm:border-r-line",
                  // lg: 4-col — only vertical separators
                  "lg:border-b-0",
                  i < RULES.length - 1 && "lg:border-r lg:border-r-line",
                  i === 1 && "lg:border-r lg:border-r-line",
                )}
              >
                <p className="mb-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-sans text-[14px] leading-relaxed text-ink md:text-[14.5px]">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── FAQ ───────────────────────────── */}
      <section className="bg-bone">
        <div className="layout-content py-14 md:py-20">
          <div className="mb-8 md:mb-10">
            <Eyebrow>FAQ</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(24px, 3vw, 40px)" }}
            >
              Common questions.
            </h2>
          </div>
          <div className="max-w-[760px] border border-ink">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className="border-b border-ink last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left md:px-6 md:py-5"
                >
                  <span className="font-sans text-[15px] font-bold tracking-[-0.01em] text-ink md:text-[16px]">
                    {item.q}
                  </span>
                  <span className="ml-4 shrink-0 font-mono text-[14px] text-ink-muted">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-line px-5 pb-4 pt-4 font-sans text-[14px] leading-relaxed text-ink md:px-6 md:pb-5 md:text-[14.5px]">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Closing CTA ──────────────────────── */}
      <section className="bg-ink">
        <div className="layout-content py-16 md:py-24">
          <div className="max-w-[720px]">
            <Eyebrow className="text-bone/60">Refer a colleague</Eyebrow>
            <h2
              className="mt-5 mb-5 font-display font-black leading-[0.98] tracking-[-0.03em] text-bone md:mt-6 md:mb-6"
              style={{ fontSize: "clamp(32px, 4.8vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              Have a colleague in mind?
            </h2>
            <p className="mb-8 font-sans text-[16px] leading-relaxed text-bone/80 md:mb-10 md:text-[18px]">
              Send them your link. Their $25 off is waiting.
            </p>
            <a
              href="#get-link"
              className="inline-flex h-12 items-center justify-center rounded-md bg-amber px-7 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-ink no-underline hover:bg-amber-hover"
            >
              Get my referral link →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
