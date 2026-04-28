"use client";
import { useState } from "react";
import { Eyebrow } from "@/components/storefront/primitives";

export default function ResearcherAccessPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-16">
          <Eyebrow>Researcher access</Eyebrow>
          <h1
            className="mt-4 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
            style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
          >
            Research access
          </h1>
          <p className="mt-5 max-w-[560px] font-sans text-[18px] leading-relaxed text-ink-muted">
            Early lot announcements, 10% on your first order, and COA archive access.
            One email per lot release — no spam.
          </p>
        </div>
      </section>

      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-16">
          <div
            className="grid items-end gap-12 border border-ink bg-bone px-12 py-12"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <div>
              <div className="mb-4">
                <Eyebrow>Researcher access</Eyebrow>
              </div>
              <h2
                className="font-display font-black leading-[1.05] tracking-[-0.025em] text-ink"
                style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
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
              className="flex min-w-[340px] max-w-[420px] flex-col gap-2.5"
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
                className="h-[52px] rounded-[2px] border border-ink bg-bone px-4 font-sans text-[15px] text-ink outline-none"
              />
              <button
                type="submit"
                className="h-[52px] rounded-[2px] border border-ink bg-ink font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-bone cursor-pointer hover:bg-ink/90"
              >
                {submitted ? "Request received →" : "Request access →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="bg-surface">
        <div className="layout-content py-20">
          <div className="mb-10 max-w-[560px]">
            <Eyebrow>What you get</Eyebrow>
            <h2
              className="mt-4 font-display font-black leading-[1] tracking-[-0.025em] text-ink"
              style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
            >
              Research-tier access.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-0">
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
                className="border-y border-r border-ink bg-bone px-9 py-10"
                style={{ borderLeft: i === 0 ? "1.5px solid var(--pp-ink)" : "none" }}
              >
                <div className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {item.n} · {item.t.toUpperCase()}
                </div>
                <h3 className="mb-3.5 font-display text-[22px] font-black leading-[1.15] tracking-[-0.02em] text-ink">
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
