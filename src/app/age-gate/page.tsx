"use client";
import { useState } from "react";
import Link from "next/link";
import { Lockup, Eyebrow, Checkbox } from "@/components/storefront/primitives";

export default function AgeGatePage() {
  const [age, setAge] = useState(false);
  const [researcher, setResearcher] = useState(false);
  const ready = age && researcher;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bone px-4 py-10 sm:px-6 sm:py-12">
      <div className="w-full max-w-[520px]">
        {/* lockup */}
        <div className="mb-11 flex justify-center">
          <Lockup className="h-12 w-auto" />
        </div>

        {/* eyebrow */}
        <div className="mb-4 text-center">
          <Eyebrow className="justify-center">Restricted access · 21+ qualified researchers</Eyebrow>
        </div>

        {/* heading */}
        <h1
          className="mb-6 text-center font-display font-black leading-[1.05] tracking-[-0.03em] text-ink"
          style={{ fontSize: "clamp(32px, 4.2vw, 42px)" }}
        >
          Verify you&apos;re a qualified researcher.
        </h1>

        {/* body copy */}
        <p className="mx-auto mb-3.5 max-w-[440px] text-center font-sans text-[15px] leading-[1.65] text-ink">
          PurePep supplies research-grade peptides for in-vitro study only. These are not dietary
          supplements, therapeutics, or products for human or veterinary consumption.
        </p>
        <p className="mx-auto mb-9 max-w-[440px] text-center font-sans text-[15px] leading-[1.65] text-ink">
          Access is restricted to qualified scientific researchers aged 21 or older.
        </p>

        {/* checkboxes */}
        <div className="mb-7 grid gap-0.5 border border-ink bg-bone px-6 py-5">
          <Checkbox id="age" checked={age} onChange={setAge}>
            I am 21 years of age or older
          </Checkbox>
          <div className="mt-3">
            <Checkbox id="researcher" checked={researcher} onChange={setResearcher}>
              I am a qualified scientific researcher and will use these products for research purposes only
            </Checkbox>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          aria-disabled={!ready}
          className="mb-5 flex h-14 w-full items-center justify-center rounded-[2px] border border-ink font-sans text-[14px] font-bold uppercase tracking-[0.06em] no-underline transition-colors aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:border-line aria-disabled:bg-line aria-disabled:text-ink-muted bg-ink text-bone hover:bg-ink/90"
          style={!ready ? { background: "var(--pp-line)", color: "var(--pp-ink-muted)", borderColor: "var(--pp-ink)" } : {}}
        >
          Enter site
        </Link>

        {/* leave */}
        <div className="mb-12 text-center">
          <a
            href="https://www.google.com"
            className="font-sans text-[14px] font-medium text-ink underline underline-offset-4"
          >
            Leave site
          </a>
        </div>

        {/* disclaimer */}
        <div className="text-center font-mono text-[10px] font-medium uppercase leading-[1.8] tracking-[0.16em] text-ink-muted">
          For research use only · Not for human consumption
          <br />
          © 2026 PurePep · All sales final
        </div>
      </div>
    </main>
  );
}
