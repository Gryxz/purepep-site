"use client";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import {
  Eyebrow,
  VialRender,
  Checkbox,
  TrustStrip,
  CheckGlyph,
  Hairline,
  Icon,
} from "@/components/storefront/primitives";

function Input({
  label,
  placeholder,
  type = "text",
  colSpan = 1,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  colSpan?: number;
  value?: string;
  onChange?: (v: string) => void;
  error?: string;
}) {
  return (
    <label
      className="flex flex-col gap-2"
      style={{ gridColumn: `span ${colSpan}` }}
    >
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!!error}
        className="h-12 rounded-[2px] border border-ink bg-bone px-3.5 font-sans text-[15px] text-ink outline-none focus:outline-none aria-[invalid=true]:border-alert"
      />
      {error && (
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-alert">
          {error}
        </span>
      )}
    </label>
  );
}

export default function CheckoutPage() {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCartStore();
  const [ack, setAck] = useState(false);
  const [promo, setPromo] = useState("");
  const [placed, setPlaced] = useState(false);
  const placeRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = placeRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!(entry?.isIntersecting ?? true)),
      { rootMargin: "0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [placed]);

  const shipping = 18.0;
  const tax = Math.round(subtotal() * 0.0625 * 100) / 100;
  const total = subtotal() + shipping + tax;

  function handlePlace() {
    if (!ack || items.length === 0) return;
    clearCart();
    setPlaced(true);
  }

  return (
    <>
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-10 pb-12 md:py-12 md:pb-16">
          <Eyebrow>Checkout · Step 1 of 2</Eyebrow>
          {placed ? (
            <div className="mt-6">
              <div className="inline-flex items-center gap-3 border border-emerald bg-bone px-4 py-2.5">
                <CheckGlyph pass={true} />
                <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-emerald">
                  Order confirmed
                </span>
              </div>
              <h1
                className="mt-6 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
                style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
              >
                Thank you.
              </h1>
              <p className="mt-5 max-w-[520px] font-sans text-[16px] leading-relaxed text-ink">
                Your order has been received. A confirmation email with your lot-matched
                COA will be sent within 24 hours.
              </p>
            </div>
          ) : (
            <h1
              className="mt-3 font-display font-black leading-[1] tracking-[-0.035em] text-ink md:mt-3.5"
              style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
            >
              Your order
            </h1>
          )}
        </div>
      </section>

      {!placed && (
        <section className="bg-bone">
          <div className="layout-content grid grid-cols-1 items-start gap-10 py-8 pb-24 md:grid-cols-[1.4fr_1fr] md:gap-14 md:py-12">
            {/* LEFT: form */}
            <div className="flex flex-col gap-10 md:gap-12">
              {/* cart items */}
              <div>
                <div className="mb-3.5">
                  <Eyebrow>In your cart</Eyebrow>
                </div>
                <div className="border border-ink bg-bone">
                  {items.length === 0 && (
                    <p className="px-6 py-10 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                      No items in cart
                    </p>
                  )}
                  {items.map((item, i) => (
                    <div
                      key={item.slug + item.dose}
                      className="flex flex-wrap items-center gap-4 px-4 py-4 md:grid md:gap-5 md:px-6 md:py-5"
                      style={{
                        gridTemplateColumns: "80px 1fr auto auto",
                        borderBottom: i < items.length - 1 ? "1px solid var(--pp-line)" : "none",
                      }}
                    >
                      <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center border border-ink bg-bone md:h-20 md:w-20">
                        <VialRender compound={item.compound} className="h-[40px] w-auto md:h-[60px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[15px] font-black tracking-[-0.01em] text-ink md:text-[17px]">
                          {item.compound} · {item.dose}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
                          className="mt-1.5 cursor-pointer border-none bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex w-full items-center justify-between gap-3 md:contents">
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
                  ))}
                </div>
              </div>

              {/* contact */}
              <div>
                <div className="mb-6">
                  <Eyebrow>Contact</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <Input label="First name" placeholder="Jane" />
                  <Input label="Last name" placeholder="Smith" />
                  <Input label="Email" type="email" placeholder="jane@example.com" colSpan={2} />
                  <Input label="Institution / organization" placeholder="University of…" colSpan={2} />
                </div>
              </div>

              {/* shipping */}
              <div>
                <div className="mb-6">
                  <Eyebrow>Shipping address</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <Input label="Address" placeholder="123 Research Blvd" colSpan={2} />
                  <Input label="City" placeholder="Boston" />
                  <Input label="State" placeholder="MA" />
                  <Input label="ZIP" placeholder="02101" />
                  <Input label="Country" placeholder="United States" />
                </div>
              </div>

              {/* payment */}
              <div>
                <div className="mb-6">
                  <Eyebrow>Payment</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <Input label="Card number" placeholder="•••• •••• •••• ••••" colSpan={2} />
                  <Input label="Expiry" placeholder="MM / YY" />
                  <Input label="CVC" placeholder="•••" />
                  <Input label="Name on card" placeholder="Jane Smith" colSpan={2} />
                </div>
              </div>

              {/* promo code */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="h-11 flex-1 rounded-md border border-ink bg-bone px-3.5 font-mono text-[12px] text-ink outline-none"
                />
                <button
                  type="button"
                  className="h-11 rounded-md border border-ink bg-bone px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-surface"
                >
                  Apply
                </button>
              </div>

              {/* acknowledgement */}
              <Checkbox id="ack" checked={ack} onChange={setAck}>
                I confirm I am 21 or older, a qualified researcher, and purchasing for
                legitimate research purposes only. I understand all sales are final with
                no refunds, no exchanges, and no returns.
              </Checkbox>

              <TrustStrip />

              {/* Mobile: inline place order button (also tracked for sticky bar) */}
              <div className="md:hidden">
                <button
                  ref={placeRef}
                  type="button"
                  onClick={handlePlace}
                  disabled={!ack || items.length === 0}
                  className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted"
                >
                  <Icon name="check" size={17} />
                  Place order · ${total.toFixed(2)}
                </button>
              </div>
            </div>

            {/* RIGHT: sticky summary (desktop) */}
            <div className="border border-ink bg-bone p-5 md:sticky md:top-6 md:p-6">
              <Eyebrow>Order summary</Eyebrow>

              <Hairline className="my-4" />

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.slug + item.dose} className="flex justify-between text-[13px]">
                    <span className="font-sans text-ink-muted">
                      {item.compound} × {item.qty}
                    </span>
                    <span className="font-sans font-semibold tabular-nums text-ink">
                      ${(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Hairline className="my-4" />

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <span>Subtotal</span>
                  <span className="text-ink">${subtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  <span>Tax (est.)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Hairline className="my-4" />

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  Total
                </span>
                <span className="font-display text-[28px] font-black tabular-nums tracking-[-0.02em] text-ink md:text-[32px]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                All sales final · No refunds
              </p>

              {/* Desktop: place order button in sidebar */}
              <button
                type="button"
                onClick={handlePlace}
                disabled={!ack || items.length === 0}
                className="mt-5 hidden h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted md:flex"
              >
                <Icon name="check" size={17} />
                Place order
              </button>
            </div>
          </div>

          {/* Mobile sticky bottom bar — appears when inline CTA scrolls out of view */}
          {showStickyBar && (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink bg-bone px-4 pb-4 pt-3 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  Total · ${total.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={handlePlace}
                  disabled={!ack || items.length === 0}
                  className="flex h-12 cursor-pointer items-center gap-2 rounded-md border border-ink bg-ink px-5 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-bone disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted"
                >
                  <Icon name="check" size={15} />
                  Place order
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
