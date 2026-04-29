"use client";
import { useState } from "react";
import { Eyebrow } from "@/components/storefront/primitives";

export default function ResearcherAccessPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="bg-bone">
        <div className="layout-content py-8 md:py-12">
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
        <div className="layout-content py-10 md:py-16">
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
    </>
  );
}
