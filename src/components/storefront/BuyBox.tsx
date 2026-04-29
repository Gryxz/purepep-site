"use client";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import {
  Eyebrow,
  Hairline,
  Icon,
  SemanticPill,
  PillVerified,
  TrustStripInline,
} from "./primitives";
import { clsx } from "@/lib/clsx";
import type { Product } from "@/data/products";

const TIERS = [
  { label: "Buy 1 vial", qty: 1, discount: 0 },
  { label: "Buy 3 — save 10%", qty: 3, discount: 0.1, tag: "10% off", mostPopular: true },
  { label: "Buy 6 — save 20%", qty: 6, discount: 0.2, tag: "20% off" },
];

function QtyStepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-[2px] border border-ink bg-bone" style={{ height: 52 }}>
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="inline-flex h-full w-11 cursor-pointer items-center justify-center border-none bg-transparent text-ink"
      >
        <Icon name="minus" size={16} />
      </button>
      <span className="inline-flex min-w-9 items-center justify-center self-stretch border-x border-ink font-mono text-[15px] font-semibold text-ink">
        {String(qty).padStart(2, "0")}
      </span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => setQty(qty + 1)}
        className="inline-flex h-full w-11 cursor-pointer items-center justify-center border-none bg-transparent text-ink"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

function SpecRow({
  label,
  value,
  mono,
  last,
  trailing,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="grid items-center py-3.5"
      style={{
        gridTemplateColumns: "140px 1fr",
        borderBottom: last ? "none" : "1px solid var(--pp-line)",
      }}
    >
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={clsx(
            "text-[15px] text-ink",
            mono ? "font-mono font-semibold" : "font-sans font-medium tracking-[-0.005em]",
          )}
        >
          {value}
        </span>
        {trailing}
      </div>
    </div>
  );
}

export function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [tierIdx, setTierIdx] = useState(0);
  const [variantIdx, setVariantIdx] = useState(
    product.variants.indexOf(product.dose) >= 0
      ? product.variants.indexOf(product.dose)
      : 0,
  );
  const { addItem, openCart } = useCartStore();
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!(entry?.isIntersecting ?? true)),
      { rootMargin: "0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tier = TIERS[tierIdx] ?? TIERS[0]!;
  const variant = product.variants[variantIdx] ?? product.dose;
  const unitPrice = product.price * (1 - tier.discount);
  const totalPrice = unitPrice * tier.qty * qty;
  const isOut = product.stock === "out";
  const isLow = product.stock === "low";

  function handleAddToCart() {
    if (isOut) return;
    for (let i = 0; i < tier.qty * qty; i++) {
      addItem({
        slug: product.slug,
        compound: product.compound,
        name: product.name,
        dose: variant,
        price: unitPrice,
        priceLabel: `$${unitPrice.toFixed(2)}`,
      });
    }
    openCart();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* title block */}
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Eyebrow>
            {product.name} · lyophilized
          </Eyebrow>
          <span className="text-ink-muted">·</span>
          <SemanticPill stock={product.stock} lowCount={product.lowCount} />
        </div>
        <h1
          className="mt-3 font-display font-black leading-[1] tracking-[-0.035em] text-ink md:mt-3.5"
          style={{ fontSize: "clamp(32px, 8vw, 64px)" }}
        >
          {product.compound}{" "}
          <span className="text-ink">· {variant}</span>
        </h1>
        {/* Description — desktop only; mobile keeps CTA above fold */}
        <p className="mt-4 hidden max-w-[520px] font-sans text-[15.5px] leading-[1.65] text-ink md:block md:mt-5">
          {product.description}
        </p>
      </div>

      <Hairline />

      {/* spec table — desktop only; mobile has COAPanel spec tab */}
      <div className="hidden md:block">
        <div className="mb-1">
          <Eyebrow>Specification</Eyebrow>
        </div>
        <SpecRow label="Compound" value={product.name} />
        <SpecRow label="Net mass" value={`${variant} lyophilized`} />
        <SpecRow label="Purity" value={product.purity} />
        <SpecRow
          label="Lot"
          value={product.lot}
          mono
          trailing={
            <div className="flex flex-wrap items-center gap-2.5">
              <PillVerified />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Released
              </span>
            </div>
          }
        />
        <SpecRow label="Storage" value={product.storage} last />
      </div>

      <Hairline className="hidden md:block" />

      {/* tier pricing — desktop: always open; mobile: collapsed by default, open when a bundle is active */}
      <details className="group md:open" open={tierIdx > 0 || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between border border-ink bg-bone px-[14px] py-3 md:hidden [&::-webkit-details-marker]:hidden">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {tierIdx > 0 ? TIERS[tierIdx]!.label : "↓ Save 10–20% with bundles"}
          </span>
          <span className="font-display text-[15px] font-black tabular-nums text-ink">
            ${unitPrice.toFixed(2)}
          </span>
        </summary>
        <div className="hidden md:mb-3 md:block">
          <Eyebrow>Buy more, save more</Eyebrow>
        </div>
        <div className="flex flex-col">
          {TIERS.map((t, i) => {
            const eachPrice = product.price * (1 - t.discount);
            const fullTotal = product.price * t.qty;
            const bundleTotal = eachPrice * t.qty;
            const active = tierIdx === i;
            const isFirst = i === 0;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setTierIdx(i)}
                className={clsx(
                  "relative w-full cursor-pointer grid items-center gap-3 rounded-md px-[14px] py-3 text-left transition-colors md:gap-4 md:px-[18px] md:py-4",
                  // Hairline divider between rows (not before the first)
                  !isFirst && "border-t border-t-line",
                  active
                    ? "z-10 bg-surface ring-[1.5px] ring-ink"
                    : "bg-transparent hover:bg-bone-soft",
                )}
                style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              >
                {/* "Most popular" flag — absolutely positioned top-right */}
                {t.mostPopular && (
                  <span className="absolute right-3 top-[-1px] -translate-y-1/2 rounded-md bg-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone">
                    Most popular
                  </span>
                )}
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-ink bg-bone">
                  {active && (
                    <span className="absolute inset-[3px] rounded-full bg-ink" />
                  )}
                </span>
                <span
                  className={clsx(
                    "font-sans text-[14px] text-ink md:text-[15px]",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {t.label}
                </span>
                {t.tag && (
                  <span className="border border-ink px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                    {t.tag}
                  </span>
                )}
                <span className="font-display text-[15px] font-black tabular-nums text-ink md:text-[16px]">
                  ${eachPrice.toFixed(2)}
                  {t.qty > 1 && (
                    <span className="ml-1.5 text-[13px] font-medium text-ink-muted">
                      ${bundleTotal.toFixed(2)}{" "}
                      <s className="text-ink-muted">${fullTotal.toFixed(2)}</s>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </details>

      {/* variant + qty */}
      <div className="flex flex-wrap items-end gap-5 md:gap-7">
        <div>
          <div className="mb-2.5">
            <Eyebrow>Dose</Eyebrow>
          </div>
          <div className="flex -space-x-px">
            {product.variants.map((v, i) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariantIdx(i)}
                className={clsx(
                  "min-w-[72px] cursor-pointer rounded-[2px] border border-ink px-4 py-2.5 font-sans text-[13px] font-semibold tracking-[0.02em] transition-colors md:min-w-[80px] md:px-5",
                  variantIdx === i ? "bg-ink text-bone" : "bg-bone text-ink",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2.5">
            <Eyebrow>Quantity</Eyebrow>
          </div>
          <QtyStepper qty={qty} setQty={setQty} />
        </div>
      </div>

      {/* low stock warning */}
      {isLow && (
        <div className="flex items-center gap-2.5 border border-alert bg-bone px-3.5 py-2.5 rounded-md">
          <span className="h-2 w-2 shrink-0 rounded-full bg-alert" aria-hidden="true" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-alert">
            Low stock — only {product.lowCount} vials remaining this lot
          </span>
        </div>
      )}

      {/* CTA — in-flow button; IntersectionObserver keys off this element */}
      <button
        ref={ctaRef}
        type="button"
        onClick={handleAddToCart}
        disabled={isOut}
        className={clsx(
          "flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md shadow-none border font-sans text-[14px] font-bold uppercase tracking-[0.04em] transition-colors",
          isOut
            ? "border-line bg-line text-ink-muted cursor-not-allowed"
            : "border-ink bg-ink text-bone hover:bg-ink/90",
        )}
      >
        <Icon name="cart" size={17} />
        {isOut
          ? "Out of stock — notify me"
          : `Add to cart — $${totalPrice.toFixed(2)}`}
      </button>

      <TrustStripInline />

      {/* Sticky buy bar — mobile only, appears when main CTA scrolls out of view */}
      {showSticky && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink bg-bone px-4 pt-3 md:hidden"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3">
            {/* Thumbnail — 44 px vial mini SVG */}
            <div className="h-11 w-11 shrink-0 bg-surface flex items-center justify-center">
              <svg
                viewBox="0 0 80 120"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-auto text-ink"
                aria-hidden="true"
              >
                <rect x="20" y="20" width="40" height="80" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="22" y="10" width="36" height="14" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-display text-[15px] font-black leading-tight tracking-[-0.01em] text-ink">
                {product.compound}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                ${(unitPrice * tier.qty * qty).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOut}
              className={clsx(
                "flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-5 font-sans text-[13px] font-bold uppercase tracking-[0.04em] transition-colors",
                isOut
                  ? "border-line bg-line text-ink-muted cursor-not-allowed"
                  : "border-ink bg-ink text-bone",
              )}
            >
              <Icon name="cart" size={15} />
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
