"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { useCartStore } from "@/lib/cart-store";
import { placeWcOrder, type WcOrderResult } from "@/lib/wc-store-api";
import { trackBeginCheckout } from "@/lib/analytics";
import { RetaVialMini } from "./RetaVialMini";

/**
 * v3 Apple Swiss Cart + Checkout shell.
 *
 * Source: docs/design-v3/project/Cart Checkout - Apple Swiss.html.
 *
 * Both routes share the same chrome (page-header strip · 60/40 two-column
 * desktop · mobile sticky summary that expands on tap · NEED HELP? strip).
 * The `mode` prop controls which stages render in the left column:
 *
 *   • mode="cart"      → 01 Items + Continue-to-checkout pill in summary
 *   • mode="checkout"  → 01 Items + 02 Delivery (form shell) +
 *                        03 Payment (form shell) + Place-order pill in
 *                        summary. Form fields are UI shells only — no
 *                        prefilled card numbers, no mock placeholders for
 *                        anything that resembles real payment data.
 *
 * Items, qty stepper, remove, and totals are wired to the same
 * useCartStore the v2 cart used; no client-side WC fetches in this
 * component.
 */

const SHIPPING = [
  { id: "standard",     name: "Standard",      detail: "2–3 business days · Carrier-tracked", price: 0 },
  { id: "express",      name: "Express",       detail: "1 business day · Priority handling",  price: 24 },
  { id: "international", name: "International", detail: "5–7 business days · Customs included", price: 48 },
];

const PAYMENT_METHODS = [
  { id: "card",   name: "Card",          sub: "Visa · MC · Amex" },
  { id: "bank",   name: "Bank transfer", sub: "ACH · Wire" },
  { id: "crypto", name: "Crypto",        sub: "BTC · USDC" },
];

/** WC payment_method gateway slug for each tile. `bacs` (bank transfer) is
    the only built-in WC gateway guaranteed to be enabled, so we route Card
    and Crypto through it as well — the storefront posts an order, the staff
    follow up with a payment link. Once Stripe / Coinbase are wired into the
    WC store this map is the single place to update. */
const PAYMENT_GATEWAY: Record<string, string> = {
  card:   "bacs",
  bank:   "bacs",
  crypto: "bacs",
};

const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "SE", label: "Sweden" },
  { code: "JP", label: "Japan" },
];

export function CheckoutShell({ mode }: { mode: "cart" | "checkout" }) {
  const { items, updateQty, removeItem, subtotal, totalItems, clearCart } = useCartStore();
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Delivery form — controlled inputs whose values are forwarded to the WC
  // Store API /checkout payload when the user clicks Place order.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("US");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Order placement state.
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<WcOrderResult | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const itemsTotal = subtotal();
  const totalVials = totalItems();
  const itemCount = items.length;
  const shipPrice = SHIPPING.find((s) => s.id === shipping)?.price ?? 0;
  const promoApplied = itemsTotal >= 200 ? 10 : 0;
  const grandTotal = Math.max(0, itemsTotal + (mode === "checkout" ? shipPrice : 0) - promoApplied);

  const empty = items.length === 0;

  // Fire begin_checkout when the /checkout route mounts with a non-empty
  // cart.  Cart-route mounts (the /cart page also uses this shell) are
  // intentionally NOT tracked — that's catalog browsing, not intent.
  useEffect(() => {
    if (mode !== "checkout") return;
    if (items.length === 0) return;
    trackBeginCheckout(items, itemsTotal);
    // Intentionally only fire on mount — re-running on every items/total
    // change would spam PostHog with one event per qty stepper click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function handlePlaceOrder() {
    if (submitting || empty) return;
    setSubmitting(true);
    setOrderError(null);

    const address = {
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      address_2: address2,
      city,
      state: stateField,
      postcode,
      country,
      email,
    };
    const billing = { ...address, phone };

    const result = await placeWcOrder({
      billing_address: billing,
      shipping_address: address,
      payment_method: PAYMENT_GATEWAY[payment] ?? "bacs",
    });

    setSubmitting(false);

    if (result) {
      setOrderResult(result);
      clearCart();
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
    } else {
      setOrderError(
        "We couldn't place this order. Please double-check your delivery details, or email research@purepep.com if it persists.",
      );
    }
  }

  const titleEyebrow =
    mode === "cart"
      ? `Cart · ${String(itemCount).padStart(2, "0")} items`
      : `Cart · Checkout · ${String(itemCount).padStart(2, "0")} items`;
  const title = mode === "cart" ? "Your cart." : "Review your order.";
  const deck =
    mode === "cart"
      ? "Lot-matched COA included with every shipment. Ships in 2 business days."
      : "Lot-matched COA included with every shipment. Ships in 2 business days.";

  return (
    <div className="v3-shop">
      {/* Page header strip */}
      <section className="v3co-page-strip">
        <div className="v3-container">
          <p className="eyebrow">{titleEyebrow}</p>
          <h1>{title}</h1>
          <p className="deck">{deck}</p>
        </div>
      </section>

      <div className="v3-container">
        <div className="v3co-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* 01 — Items */}
            <section className="v3co-stage">
              <div className="v3co-stage-head">
                <span className="num">01 — Items</span>
                <span className="meta">
                  {String(itemCount).padStart(2, "0")} items · {totalVials} {totalVials === 1 ? "vial" : "vials"}
                </span>
              </div>

              {empty ? (
                <div className="v3co-empty">
                  <p className="name">Cart is empty</p>
                  <p className="sub">Add a vial to get started</p>
                  <Link href="/shop" className="v3-pill v3-pill-primary">
                    Browse the catalog <span className="arrow">→</span>
                  </Link>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <article key={item.slug + item.dose} className="v3co-item-card">
                      <div className="v3co-item-thumb">
                        <RetaVialMini compound={item.compound} />
                      </div>
                      <div className="v3co-item-mid">
                        <p className="eyebrow">
                          <span className="sku">{item.compound}</span> · {item.name}
                        </p>
                        <h3 className="name">{item.name}</h3>
                        <span className="meta-row">
                          {item.dose} · Lyo · {item.qty} {item.qty === 1 ? "vial" : "vials"}
                        </span>
                      </div>
                      <div className="v3co-item-right">
                        <div className="v3co-item-price">${(item.qty * item.price).toFixed(2)}</div>
                        <div className="v3co-qty-step" role="group" aria-label="Quantity">
                          <button type="button" aria-label="Decrease" onClick={() => updateQty(item.slug, item.qty - 1)}>
                            –
                          </button>
                          <span className="num">{item.qty}</span>
                          <button type="button" aria-label="Increase" onClick={() => updateQty(item.slug, item.qty + 1)}>
                            +
                          </button>
                        </div>
                        <button type="button" className="v3co-remove-link" onClick={() => removeItem(item.slug)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}

                  <div className="v3co-subtotal-row">
                    <span className="lbl">
                      Subtotal · {String(itemCount).padStart(2, "0")} items
                    </span>
                    <span className="val">${itemsTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </section>

            {/* Checkout-only stages */}
            {mode === "checkout" && !empty && (
              <>
                {/* 02 — Delivery */}
                <section className="v3co-stage">
                  <div className="v3co-stage-head">
                    <span className="num">02 — Delivery</span>
                  </div>
                  <div className="v3co-surface s2">
                    <h3>Where should the COA-matched lot ship?</h3>
                    <div className="v3co-field-grid">
                      <div className="v3co-field">
                        <label>First name</label>
                        <input
                          type="text"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field">
                        <label>Last name</label>
                        <input
                          type="text"
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field full">
                        <label>Address line 1</label>
                        <input
                          type="text"
                          autoComplete="address-line1"
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field full">
                        <label>
                          Address line 2 <span className="opt">Optional</span>
                        </label>
                        <input
                          type="text"
                          autoComplete="address-line2"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field">
                        <label>City</label>
                        <input
                          type="text"
                          autoComplete="address-level2"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field">
                        <label>State / Region</label>
                        <input
                          type="text"
                          autoComplete="address-level1"
                          value={stateField}
                          onChange={(e) => setStateField(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field">
                        <label>Postal code</label>
                        <input
                          type="text"
                          autoComplete="postal-code"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field">
                        <label>Country</label>
                        <select
                          autoComplete="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="v3co-field full">
                        <label>Email</label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="v3co-field full">
                        <label>Phone</label>
                        <input
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="v3co-ship-stack" role="radiogroup" aria-label="Shipping method">
                      {SHIPPING.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="radio"
                          aria-checked={shipping === s.id}
                          className={clsx("v3co-ship-row", shipping === s.id && "is-selected")}
                          onClick={() => setShipping(s.id)}
                        >
                          <span className="radio" aria-hidden="true" />
                          <span>
                            <span className="name">{s.name}</span>
                            <span className="detail">{s.detail}</span>
                          </span>
                          <span className="price">${s.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 03 — Payment */}
                <section className="v3co-stage">
                  <div className="v3co-stage-head">
                    <span className="num">03 — Payment</span>
                  </div>
                  <div className="v3co-surface s1">
                    <h3>How would you like to pay?</h3>
                    <div className="v3co-pay-tiles" role="radiogroup" aria-label="Payment method">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={payment === m.id}
                          className={clsx("v3co-pay-tile", payment === m.id && "is-selected")}
                          onClick={() => setPayment(m.id)}
                        >
                          <span className="radio" aria-hidden="true" />
                          <span className="name">{m.name}</span>
                          <span className="sub">{m.sub}</span>
                        </button>
                      ))}
                    </div>

                    {payment === "card" && (
                      <div className="v3co-pay-form">
                        <div className="v3co-field-grid">
                          <div className="v3co-field full">
                            <label>Card number</label>
                            <input type="text" inputMode="numeric" autoComplete="cc-number" aria-label="Card number" />
                          </div>
                          <div className="v3co-field">
                            <label>Expiry</label>
                            <input type="text" inputMode="numeric" autoComplete="cc-exp" aria-label="Card expiry MM/YY" />
                          </div>
                          <div className="v3co-field">
                            <label>CVC</label>
                            <input type="text" inputMode="numeric" autoComplete="cc-csc" aria-label="Card security code" />
                          </div>
                          <div className="v3co-field full">
                            <label>Name on card</label>
                            <input type="text" autoComplete="cc-name" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="v3co-pay-compliance">
                      Secure · 256-bit TLS · Cards processed off-site · No card data stored
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* RIGHT COLUMN — Sticky summary (desktop) */}
          <aside className="v3co-summary-col" aria-label="Order summary">
            <SummaryCard
              items={items}
              itemsTotal={itemsTotal}
              shippingLabel={SHIPPING.find((s) => s.id === shipping)?.name}
              shippingPrice={mode === "checkout" ? shipPrice : null}
              promoApplied={promoApplied}
              grandTotal={grandTotal}
              mode={mode}
              empty={empty}
              onPlaceOrder={handlePlaceOrder}
              submitting={submitting}
              orderResult={orderResult}
              orderError={orderError}
            />
          </aside>
        </div>
      </div>

      {/* Help strip */}
      <section className="v3co-help-strip">
        <div className="v3-container">
          <p className="eyebrow">Need help?</p>
          <h2>Real humans. Real fast.</h2>
          <div className="v3co-help-links">
            <a href="mailto:research@purepep.com">Email research@purepep.com</a>
            <a href="#">Live chat</a>
            <a href="/quality#sample-coa">Read FAQ</a>
          </div>
        </div>
      </section>

      {/* Mobile sticky summary */}
      {!empty && (
        <div className={clsx("v3co-mobile-summary", mobileExpanded && "is-open")}>
          <div className="v3co-mobile-summary-bar">
            <button
              type="button"
              className="v3co-mobile-summary-toggle"
              aria-expanded={mobileExpanded}
              onClick={() => setMobileExpanded((e) => !e)}
            >
              <span className="lbl">{mobileExpanded ? "Hide details" : "Order summary"}</span>
              <span className="total">
                ${grandTotal.toFixed(2)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>
            {mode === "cart" ? (
              <Link href="/checkout" className="v3co-mobile-summary-cta">
                Checkout <span className="arrow">→</span>
              </Link>
            ) : (
              <button
                type="button"
                className="v3co-mobile-summary-cta"
                onClick={handlePlaceOrder}
                disabled={submitting || empty}
                aria-busy={submitting}
              >
                {submitting ? "Placing…" : "Place order"} <span className="arrow">→</span>
              </button>
            )}
          </div>
          <div className="v3co-mobile-summary-expand">
            <div className="v3co-mobile-summary-expand-inner">
              {items.map((item) => (
                <div key={item.slug + item.dose} className="v3co-summary-item">
                  <div className="v3co-summary-thumb">
                    <RetaVialMini compound={item.compound} />
                  </div>
                  <div>
                    <div className="name">{item.name}</div>
                    <span className="qty">
                      {item.qty} {item.qty === 1 ? "vial" : "vials"} · {item.dose}
                    </span>
                  </div>
                  <div className="price">${(item.qty * item.price).toFixed(2)}</div>
                </div>
              ))}
              <hr className="v3co-summary-rule" />
              <div className="v3co-totals-row">
                <span className="lbl">Subtotal</span>
                <span className="val">${itemsTotal.toFixed(2)}</span>
              </div>
              {mode === "checkout" && (
                <div className="v3co-totals-row">
                  <span className="lbl">Shipping</span>
                  <span className="val">${shipPrice.toFixed(2)}</span>
                </div>
              )}
              {promoApplied > 0 && (
                <div className="v3co-totals-row">
                  <span className="lbl">
                    Discount · RESEARCH10 <span className="applied-pill">Applied</span>
                  </span>
                  <span className="val">−${promoApplied.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  items,
  itemsTotal,
  shippingLabel,
  shippingPrice,
  promoApplied,
  grandTotal,
  mode,
  empty,
  onPlaceOrder,
  submitting,
  orderResult,
  orderError,
}: {
  items: ReturnType<typeof useCartStore.getState>["items"];
  itemsTotal: number;
  shippingLabel: string | undefined;
  shippingPrice: number | null;
  promoApplied: number;
  grandTotal: number;
  mode: "cart" | "checkout";
  empty: boolean;
  onPlaceOrder: () => void;
  submitting: boolean;
  orderResult: WcOrderResult | null;
  orderError: string | null;
}) {
  return (
    <div className="v3co-summary-card">
      <p className="eyebrow">Order summary</p>
      <h2>Your order</h2>
      <hr className="v3co-summary-rule" />

      {empty ? (
        <p
          style={{
            padding: "32px 0",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--v3-ink-55)",
            textAlign: "center",
          }}
        >
          Cart is empty
        </p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.slug + item.dose} className="v3co-summary-item">
              <div className="v3co-summary-thumb">
                <RetaVialMini compound={item.compound} />
              </div>
              <div>
                <div className="name">{item.name}</div>
                <span className="qty">
                  {item.qty} {item.qty === 1 ? "vial" : "vials"} · {item.dose}
                </span>
              </div>
              <div className="price">${(item.qty * item.price).toFixed(2)}</div>
            </div>
          ))}

          <hr className="v3co-summary-rule" />

          <div className="v3co-totals-row">
            <span className="lbl">Subtotal</span>
            <span className="val">${itemsTotal.toFixed(2)}</span>
          </div>
          {shippingPrice !== null && (
            <div className="v3co-totals-row">
              <span className="lbl">Shipping{shippingLabel ? ` · ${shippingLabel}` : ""}</span>
              <span className="val">${shippingPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="v3co-totals-row">
            <span className="lbl">Tax · calculated at finalize</span>
            <span className="val muted">—</span>
          </div>
          {promoApplied > 0 && (
            <div className="v3co-totals-row">
              <span className="lbl">
                Discount · RESEARCH10 <span className="applied-pill">Applied</span>
              </span>
              <span className="val">−${promoApplied.toFixed(2)}</span>
            </div>
          )}

          <hr className="v3co-summary-rule heavy" />

          <div className="v3co-totals-final">
            <span className="lbl">Total</span>
            <span className="val">
              ${grandTotal.toFixed(2)}
              <span className="currency">USD</span>
            </span>
          </div>

          {mode === "cart" ? (
            <Link href="/checkout" className="v3co-place-cta">
              Proceed to checkout <span className="arrow">→</span>
            </Link>
          ) : (
            <button
              type="button"
              className="v3co-place-cta"
              onClick={onPlaceOrder}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Placing…" : "Place order"} <span className="arrow">→</span>
            </button>
          )}

          {mode === "checkout" && orderError && (
            <p
              role="alert"
              style={{
                marginTop: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--pp-alert)",
                lineHeight: 1.5,
              }}
            >
              {orderError}
            </p>
          )}

          {mode === "checkout" && orderResult && (
            <p
              role="status"
              style={{
                marginTop: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--pp-emerald)",
                lineHeight: 1.5,
              }}
            >
              Order #{orderResult.order_id} placed. We&rsquo;ll email next steps.
            </p>
          )}

          <div className="v3co-trust-stack">
            <span>Lot-matched COA included</span>
            <span>Ships in 2 business days · Carrier-tracked</span>
            <span>RUO · 21+ qualified researchers only</span>
          </div>

          <hr className="v3co-summary-rule" />

          <div className="v3co-promo-row">
            <input type="text" placeholder="Promo code" aria-label="Promo code" />
            <button type="button" className="v3co-apply-btn">
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}

