"use client";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Eyebrow, VialRender, Icon, Hairline } from "@/components/storefront/primitives";
import { CartUpsellSlot } from "@/components/storefront/CartUpsellSlot";
import { ComplianceBlock } from "@/components/ComplianceBlock";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCartStore();

  return (
    <>
      <section className="bg-bone">
        <div className="layout-content py-10 md:py-12">
          <Eyebrow>Your cart</Eyebrow>
          <h1
            className="mt-3 font-display font-black leading-[1] tracking-[-0.035em] text-ink md:mt-3.5"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            Cart
          </h1>
        </div>
      </section>

      <section className="bg-bone">
        <div className="layout-content py-8 pb-16 md:py-12 md:pb-24">
          {items.length === 0 ? (
            <div className="py-16 text-center md:py-20">
              <p className="font-display text-[22px] font-black text-ink">Your cart is empty</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Add a vial from the catalog
              </p>
              <Link
                href="/shop"
                className="mt-8 inline-flex items-center rounded-md border border-ink bg-ink px-6 py-3 font-mono text-[13px] uppercase tracking-[0.12em] text-bone no-underline hover:bg-ink/90"
              >
                Browse catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1.4fr_1fr] md:gap-14">
              {/* Items list + upsell column */}
              <div className="flex flex-col gap-6">
                <div className="border border-ink bg-bone">
                {items.map((item, i) => (
                  <div
                    key={item.slug + item.dose}
                    className="px-4 py-4 md:px-6 md:py-5"
                    style={{ borderBottom: i < items.length - 1 ? "1px solid var(--pp-line)" : "none" }}
                  >
                    {/* Mobile: flex layout; Desktop: grid via inline style */}
                    <div
                      className="flex flex-wrap items-start gap-4 md:grid md:items-center md:gap-5"
                      style={{ gridTemplateColumns: "80px 1fr auto auto" }}
                    >
                      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center border border-ink bg-bone md:h-20 md:w-20">
                        <VialRender compound={item.compound} className="h-[44px] w-auto md:h-[60px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[16px] font-black tracking-[-0.01em] text-ink md:text-[17px]">
                          {item.compound} · {item.dose}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
                          className="mt-2 cursor-pointer border-none bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted underline"
                        >
                          Remove
                        </button>
                      </div>
                      {/* Qty + price row (flex on mobile, separate grid cells on desktop) */}
                      <div className="flex w-full items-center justify-between gap-4 md:contents">
                        <div
                          className="inline-flex items-center rounded-[2px] border border-ink"
                          style={{ height: 36 }}
                        >
                          <button
                            type="button"
                            aria-label="Decrease"
                            onClick={() => updateQty(item.slug, item.qty - 1)}
                            className="inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-ink"
                          >
                            −
                          </button>
                          <span className="inline-flex min-w-[34px] items-center justify-center self-stretch border-x border-ink font-mono text-[13px] font-semibold text-ink">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            onClick={() => updateQty(item.slug, item.qty + 1)}
                            className="inline-flex h-full w-9 cursor-pointer items-center justify-center border-none bg-transparent text-ink"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-display text-[17px] font-black tabular-nums text-ink">
                          ${(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                <CartUpsellSlot enabled={false} />
              </div>

              {/* Order summary */}
              <div className="border border-ink bg-bone p-5 md:sticky md:top-6 md:p-6">
                <Eyebrow>Order summary</Eyebrow>

                <Hairline className="my-4" />

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-ink">${subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>Shipping</span>
                    <span>$18.00</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    <span>Tax (est.)</span>
                    <span>${(subtotal() * 0.0625).toFixed(2)}</span>
                  </div>
                </div>

                <Hairline className="my-4" />

                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                    Total
                  </span>
                  <span className="font-display text-[28px] font-black tabular-nums tracking-[-0.02em] text-ink md:text-[32px]">
                    ${(subtotal() + 18 + subtotal() * 0.0625).toFixed(2)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 flex h-14 w-full items-center justify-center gap-2.5 rounded-md border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone no-underline hover:bg-ink/90"
                >
                  <Icon name="arrowRight" size={16} />
                  Proceed to checkout
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 flex h-10 w-full items-center justify-center rounded-md border border-ink bg-bone font-mono text-[11px] uppercase tracking-[0.12em] text-ink no-underline hover:bg-surface"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface">
        <div className="layout-content py-10">
          <ComplianceBlock />
        </div>
      </section>
    </>
  );
}
