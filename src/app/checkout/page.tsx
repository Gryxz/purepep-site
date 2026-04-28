"use client";
import { useState } from "react";
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
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";

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
      {/* Override layout.tsx header with minimal variant */}
      <section className="border-b border-ink bg-bone">
        <div className="layout-content py-12 pb-16">
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
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
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
              className="mt-3.5 font-display font-black leading-[1] tracking-[-0.035em] text-ink"
              style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
            >
              Your order
            </h1>
          )}
        </div>
      </section>

      {!placed && (
        <section className="bg-bone">
          <div
            className="layout-content grid items-start gap-14 py-12 pb-24"
            style={{ gridTemplateColumns: "1.4fr 1fr" }}
          >
            {/* LEFT: form */}
            <div className="flex flex-col gap-10">
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
                      className="grid items-center gap-5 px-6 py-5"
                      style={{
                        gridTemplateColumns: "80px 1fr auto auto",
                        borderBottom:
                          i < items.length - 1 ? "1px solid var(--pp-line)" : "none",
                      }}
                    >
                      <div className="flex h-20 w-20 items-center justify-center border border-ink bg-bone">
                        <VialRender compound={item.compound} className="h-[60px] w-auto" />
                      </div>
                      <div>
                        <p className="font-display text-[17px] font-black tracking-[-0.01em] text-ink">
                          {item.compound} · {item.dose}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
                          className="mt-2.5 cursor-pointer border-none bg-transparent font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted underline"
                        >
                          Remove
                        </button>
                      </div>
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
                  ))}
                </div>
              </div>

              {/* contact */}
              <div>
                <div className="mb-5">
                  <Eyebrow>Contact</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First name" placeholder="Jane" />
                  <Input label="Last name" placeholder="Smith" />
                  <Input label="Email" type="email" placeholder="jane@example.com" colSpan={2} />
                  <Input label="Institution / organization" placeholder="University of…" colSpan={2} />
                </div>
              </div>

              {/* shipping */}
              <div>
                <div className="mb-5">
                  <Eyebrow>Shipping address</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Address" placeholder="123 Research Blvd" colSpan={2} />
                  <Input label="City" placeholder="Boston" />
                  <Input label="State" placeholder="MA" />
                  <Input label="ZIP" placeholder="02101" />
                  <Input label="Country" placeholder="United States" />
                </div>
              </div>

              {/* payment */}
              <div>
                <div className="mb-5">
                  <Eyebrow>Payment</Eyebrow>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  className="h-11 flex-1 rounded-[2px] border border-ink bg-bone px-3.5 font-mono text-[12px] text-ink outline-none"
                />
                <button
                  type="button"
                  className="border border-ink bg-bone px-5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-surface"
                >
                  Apply
                </button>
              </div>

              {/* acknowledgement */}
              <Checkbox
                id="ack"
                checked={ack}
                onChange={setAck}
              >
                I confirm I am 21 or older, a qualified researcher, and purchasing for
                legitimate research purposes only. I understand all sales are final with
                no refunds, no exchanges, and no returns.
              </Checkbox>

              <TrustStrip />
            </div>

            {/* RIGHT: sticky summary */}
            <div className="sticky top-6 border border-ink bg-bone p-6">
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
                <span className="font-display text-[32px] font-black tabular-nums tracking-[-0.02em] text-ink">
                  ${total.toFixed(2)}
                </span>
              </div>

              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                All sales final · No refunds
              </p>

              <button
                type="button"
                onClick={handlePlace}
                disabled={!ack || items.length === 0}
                className="mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 border border-ink bg-ink font-sans text-[14px] font-bold uppercase tracking-[0.04em] text-bone transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink-muted"
              >
                <Icon name="check" size={17} />
                Place order
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
