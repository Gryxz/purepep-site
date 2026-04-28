"use client";
import { useState } from "react";
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
  { label: "Buy 3 — save 10%", qty: 3, discount: 0.1, tag: "10% off" },
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
    <div className="flex flex-col gap-6">
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
          className="mt-3.5 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
          style={{ fontSize: "clamp(44px, 5.5vw, 64px)" }}
        >
          {product.compound}{" "}
          <span className="text-ink">· {variant}</span>
        </h1>
        <p className="mt-5 max-w-[520px] font-sans text-[15.5px] leading-[1.65] text-ink">
          {product.description}
        </p>
        <p className="mt-4.5 font-sans text-[14px] font-semibold leading-[1.55] text-ink">
          {product.disclaimer}
        </p>
      </div>

      <Hairline />

      {/* spec table */}
      <div>
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

      <Hairline />

      {/* tier pricing */}
      <div>
        <div className="mb-3">
          <Eyebrow>Buy more, save more</Eyebrow>
        </div>
        <div className="flex flex-col">
          {TIERS.map((t, i) => {
            const eachPrice = product.price * (1 - t.discount);
            const active = tierIdx === i;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setTierIdx(i)}
                className={clsx(
                  "relative -mb-px grid w-full cursor-pointer items-center gap-4 border border-ink bg-bone px-[18px] py-4 text-left rounded-[2px] transition-colors",
                  active && "z-10 bg-surface",
                )}
                style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              >
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-ink bg-bone">
                  {active && (
                    <span className="absolute inset-[3px] rounded-full bg-ink" />
                  )}
                </span>
                <span
                  className={clsx(
                    "font-sans text-[15px] text-ink",
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
                <span className="font-display text-[16px] font-black tabular-nums text-ink">
                  ${eachPrice.toFixed(2)}
                  {t.qty > 1 && (
                    <span className="ml-1.5 text-[13px] font-medium text-ink-muted">
                      ${(eachPrice * t.qty).toFixed(2)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* variant + qty */}
      <div className="flex flex-wrap items-end gap-7">
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
                  "min-w-[80px] cursor-pointer rounded-[2px] border border-ink px-5 py-2.5 font-sans text-[13px] font-semibold tracking-[0.02em] transition-colors",
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
        <div className="flex items-center gap-2.5 border border-alert bg-bone px-3.5 py-2.5 rounded-[2px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-alert" aria-hidden="true" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-alert">
            Low stock — only {product.lowCount} vials remaining this lot
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOut}
        className={clsx(
          "flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border font-sans text-[14px] font-bold uppercase tracking-[0.04em] transition-colors",
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
    </div>
  );
}
