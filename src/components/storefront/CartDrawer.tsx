"use client";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { Icon, VialRender, CheckGlyph } from "./primitives";
import { CartUpsellSlot } from "./CartUpsellSlot";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal } = useCartStore();

  return (
    <>
      {/* scrim */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className="fixed inset-0 z-[90] bg-ink/40 transition-opacity duration-[220ms]"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* drawer */}
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className="fixed bottom-0 right-0 top-0 z-[100] flex w-[min(480px,100vw)] flex-col border-l border-ink bg-bone transition-transform duration-[240ms]"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "cubic-bezier(0.2,0.6,0.2,1)",
        }}
      >
        {/* header */}
        <header className="flex items-center justify-between border-b border-ink px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Icon name="cart" size={18} />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
              Cart · {String(items.length).padStart(2, "0")} items
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="cursor-pointer border-none bg-transparent p-1 text-ink"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-[18px] font-black text-ink">Cart is empty</p>
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Add a vial to get started
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.slug + item.dose}
                className="grid items-center gap-4 py-5"
                style={{
                  gridTemplateColumns: "68px 1fr auto",
                  borderBottom: i === items.length - 1 ? "none" : "1px solid var(--pp-line)",
                }}
              >
                {/* thumbnail */}
                <div className="flex h-[68px] w-[68px] items-center justify-center border border-ink bg-bone">
                  <VialRender compound={item.compound} className="h-[52px] w-auto" />
                </div>

                {/* info */}
                <div>
                  <p className="font-display text-[15px] font-black tracking-[-0.01em] text-ink">
                    {item.compound} · {item.dose}
                  </p>
                  <div className="mt-2 flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(item.slug, item.qty - 1)}
                      className="inline-flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[2px] border border-ink bg-bone text-[14px] text-ink"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center font-mono text-[13px] font-semibold text-ink">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.slug, item.qty + 1)}
                      className="inline-flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[2px] border border-ink bg-bone text-[14px] text-ink"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      className="ml-auto cursor-pointer border-none bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* line total */}
                <p className="font-display text-[15px] font-black tabular-nums text-ink">
                  ${(item.qty * item.price).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* footer */}
        <div className="border-t border-ink bg-bone-soft px-6 pb-7 pt-5">
          <CartUpsellSlot enabled={false} />

          {items.length > 0 && (
            <div className="mb-3.5 flex items-center gap-2">
              <CheckGlyph pass={true} />
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-emerald">
                All items in stock
              </span>
            </div>
          )}

          <div className="mb-5 flex items-baseline justify-between">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Subtotal
            </span>
            <span className="font-display text-[28px] font-black tabular-nums tracking-[-0.02em] text-ink">
              ${subtotal().toFixed(2)}
            </span>
          </div>

          <Link
            href={"/checkout" as never}
            onClick={closeCart}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-md border border-ink bg-ink font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-bone no-underline transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-40 hover:bg-ink/90"
            aria-disabled={items.length === 0}
          >
            Proceed to checkout
          </Link>

          {/* Referral micro-prompt */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-muted">
              Know a researcher?
            </span>
            <Link
              href="/referral"
              onClick={closeCart}
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink underline underline-offset-2 no-underline hover:text-ink-muted"
              style={{ textDecoration: "underline", textUnderlineOffset: 2 }}
            >
              Refer &amp; save $25 →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
