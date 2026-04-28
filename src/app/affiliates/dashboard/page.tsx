"use client";
import { useState } from "react";
import { Eyebrow, Hairline } from "@/components/storefront/primitives";
import { clsx } from "@/lib/clsx";

const STAT_CARDS = [
  { label: "Clicks", value: "—", caption: "Last 30 days" },
  { label: "Conversions", value: "—", caption: "— % rate" },
  { label: "Earnings", value: "$—", caption: "Lifetime" },
  { label: "Pending", value: "$—", caption: "Available on payout date" },
];

const ASSET_TABS = ["banners", "links", "email", "docs"] as const;
type AssetTab = (typeof ASSET_TABS)[number];

const PAYOUT_HISTORY = [
  { date: "—", amount: "$—", method: "—", status: "pending" },
];

export default function AffiliateDashboardPage() {
  const [assetTab, setAssetTab] = useState<AssetTab>("links");
  const [copied, setCopied] = useState(false);
  const referralCode = "PP-REF-XXXX";
  const referralUrl = `https://purepep.shop/?ref=${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(referralUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink bg-bone">
        <div
          className="layout-content grid items-end gap-8 py-12 pb-11"
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          <div>
            <Eyebrow>Affiliate dashboard</Eyebrow>
            <div className="mt-3.5 flex flex-wrap items-center gap-4.5">
              <h1
                className="font-display font-black leading-[1] tracking-[-0.025em] text-ink"
                style={{ fontSize: "clamp(28px, 3.4vw, 42px)" }}
              >
                Dr. K. Olsen
              </h1>
              <span className="inline-flex items-center gap-2 rounded-[2px] border border-ink-muted bg-bone px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                <span className="h-1.5 w-1.5 bg-emerald" />
                Tier · Silver
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Next payout
            </p>
            <p className="mt-1.5 font-display text-[28px] font-black tabular-nums tracking-[-0.02em] text-ink">
              $—
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              — days
            </p>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="border-b border-ink bg-surface">
        <div className="layout-content py-12">
          <div className="grid grid-cols-4 border border-ink bg-bone">
            {STAT_CARDS.map((c, i) => (
              <div
                key={c.label}
                className="px-7 py-8"
                style={{ borderLeft: i === 0 ? "none" : "1.5px solid var(--pp-ink)" }}
              >
                <div className="mb-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  {c.label}
                </div>
                <div
                  className="font-display font-black tabular-nums leading-[1] tracking-[-0.025em] text-ink"
                  style={{ fontSize: "clamp(32px, 3vw, 44px)" }}
                >
                  {c.value}
                </div>
                <div className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
                  {c.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral code */}
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-12">
          <Eyebrow>Your referral link</Eyebrow>
          <div className="mt-4 flex max-w-[600px] items-center gap-0">
            <div className="flex h-12 flex-1 items-center border border-r-0 border-ink bg-surface px-4 font-mono text-[13px] text-ink">
              {referralUrl}
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="h-12 cursor-pointer border border-ink bg-ink px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-bone hover:bg-ink/90"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            Code: {referralCode}
          </p>
        </div>
      </section>

      {/* Asset library */}
      <section className="border-b border-ink bg-surface">
        <div className="layout-content py-12">
          <Eyebrow>Asset library</Eyebrow>
          <div className="-mb-px mt-6 flex gap-8 border-b border-ink">
            {ASSET_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAssetTab(t)}
                className={clsx(
                  "cursor-pointer border-b-[3px] bg-transparent pb-4 pt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  assetTab === t
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="py-8">
            {assetTab === "links" && (
              <div className="flex flex-col gap-3 max-w-[540px]">
                {[
                  { label: "Homepage", url: `/?ref=${referralCode}` },
                  { label: "Catalog", url: `/shop?ref=${referralCode}` },
                  { label: "RETA PDP", url: `/shop/reta?ref=${referralCode}` },
                  { label: "SEMA PDP", url: `/shop/sema?ref=${referralCode}` },
                ].map((link) => (
                  <div key={link.label} className="flex items-center gap-0 border border-ink">
                    <span className="w-[120px] shrink-0 border-r border-ink px-4 py-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      {link.label}
                    </span>
                    <span className="flex-1 px-4 py-3 font-mono text-[12px] text-ink">
                      https://purepep.shop{link.url}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {assetTab !== "links" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Assets available after approval
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Payout history */}
      <section className="bg-bone">
        <div className="layout-content py-12 pb-20">
          <Eyebrow>Payout history</Eyebrow>
          <div className="mt-6 max-w-[640px] border border-ink">
            <div
              className="grid border-b border-ink bg-surface px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink"
              style={{ gridTemplateColumns: "1fr 1fr 1fr auto" }}
            >
              {["Date", "Amount", "Method", "Status"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {PAYOUT_HISTORY.map((row, i) => (
              <div
                key={i}
                className="grid items-center px-5 py-4"
                style={{
                  gridTemplateColumns: "1fr 1fr 1fr auto",
                  borderBottom: i < PAYOUT_HISTORY.length - 1 ? "1px solid var(--pp-line)" : "none",
                }}
              >
                <span className="font-mono text-[12px] text-ink-muted">{row.date}</span>
                <span className="font-display text-[15px] font-black tabular-nums text-ink">{row.amount}</span>
                <span className="font-mono text-[12px] text-ink-muted">{row.method}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
