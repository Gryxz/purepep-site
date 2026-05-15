/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { placeWcOrder } from "@/lib/wc-store-api";

const FREE_SHIP_THRESHOLD = 200;
const EXPRESS_SHIP_COST = 24;
const STANDARD_SHIP_COST_BELOW_THRESHOLD = 8;

type PayMethod = "card" | "crypto" | "wire";
type ShipMethod = "standard" | "express";

/**
 * v5 mobile /checkout page — ported 1:1 from
 * docs/design-v3/mobile-mockups/Checkout flow (the third device frame
 * in the cart→checkout flow paste).
 *
 * Wiring:
 *  - useCartStore for line items + subtotal + clearCart on success
 *  - placeWcOrder() for the bacs gateway path (same as v3 CheckoutPage —
 *    card/crypto/wire are visual until staff follow up off-site)
 *  - Compliance checkbox gates the Place Order button (disabled until
 *    confirmed; bounce + slide-up confirmation bar on check)
 *
 * The mockup's payment tabs (Card / Crypto / Wire VIP) follow the
 * v3 desktop pattern — only the bacs path actually hits WC; the card
 * UI is the Bankful placeholder.
 */
export function MobileCheckout() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("United States");
  const [shipping, setShipping] = useState<ShipMethod>("standard");
  const [pay, setPay] = useState<PayMethod>("card");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [compliance, setCompliance] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Referral / promo code
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState<string | null>(null);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (/^PP-REF-[A-Z0-9]{4,}$/.test(code) || code === "PP-REF-XXXX") {
      setPromoApplied(code);
      setPromoDiscount(25);
      setPromoError(null);
    } else {
      setPromoError("Code not recognized.");
    }
  }

  function removePromo() {
    setPromoApplied(null);
    setPromoDiscount(0);
    setPromoInput("");
    setPromoError(null);
  }

  const sub = subtotal();
  const shipCost = shipping === "express"
    ? EXPRESS_SHIP_COST
    : sub >= FREE_SHIP_THRESHOLD
    ? 0
    : STANDARD_SHIP_COST_BELOW_THRESHOLD;
  const total = Math.max(0, sub + shipCost - promoDiscount);
  const standardLabel = sub >= FREE_SHIP_THRESHOLD ? "Free" : `$${STANDARD_SHIP_COST_BELOW_THRESHOLD.toFixed(2)}`;

  // Card formatters
  function formatCard(v: string): string {
    const digits = v.replace(/\D/g, "").substring(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string): string {
    const digits = v.replace(/\D/g, "").substring(0, 4);
    return digits.length >= 2 ? `${digits.substring(0, 2)} / ${digits.substring(2)}` : digits;
  }

  async function handlePlaceOrder() {
    if (submitting || items.length === 0 || !compliance) return;
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

    const result = await placeWcOrder({
      billing_address: { ...address },
      shipping_address: address,
      payment_method: "bacs", // only enabled WC gateway; staff follows up for card/crypto/wire
    });

    setSubmitting(false);

    if (result) {
      clearCart();
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        const key = result.order_key ?? "";
        window.location.href = `/order-confirm/?key=${encodeURIComponent(key)}&id=${result.order_id}`;
      }
    } else {
      setOrderError(
        "We couldn't place this order. Please double-check your delivery details, or email research@purepep.com if it persists.",
      );
    }
  }

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="mob-app">
        <div className="mob-cart-empty" style={{ padding: "80px 20px" }}>
          <div className="mob-cart-empty-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: "var(--m-ink-mute)" }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="mob-cart-empty-h">No items to check out</div>
          <div className="mob-cart-empty-p">Add a vial to get started.</div>
          <a href="/shop" className="mob-cta-view" style={{ marginTop: 12, maxWidth: 280 }}>Browse the catalog →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mob-app">
      {/* Custom checkout header */}
      <header className="mob-chk-hdr">
        <button type="button" className="mob-chk-back" onClick={() => router.back()}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
        <div className="mob-chk-secure">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure
        </div>
      </header>

      {/* Order summary card */}
      <div className="mob-chk-order-card">
        <div className="mob-chk-order-h">
          Order summary
          <button type="button" className="mob-chk-order-toggle" onClick={() => setSummaryOpen((o) => !o)}>
            {summaryOpen ? "Hide ▴" : "Show ▾"}
          </button>
        </div>
        {summaryOpen && (
          <>
            <div>
              {items.map((item) => {
                const linePrice = (item.price * item.qty).toFixed(2);
                const unitStr = item.qty > 1
                  ? `${item.qty} × $${item.price.toFixed(2)}`
                  : `$${item.price.toFixed(2)}/vial`;
                return (
                  <div key={`${item.slug}-${item.dose}`} className="mob-sum-line">
                    <div className="mob-sum-line-info">
                      <span className="mob-sum-line-name">{item.name}</span>
                      <span className="mob-sum-line-meta">{item.dose} · LYOPHILIZED</span>
                      <span className="mob-sum-line-meta">{unitStr}</span>
                    </div>
                    <span className="mob-sum-line-price">${linePrice}</span>
                  </div>
                );
              })}
            </div>
            <div className="mob-sum-divider" />
            <div className="mob-order-row"><span className="ok">Subtotal</span><span className="ov">${sub.toFixed(2)}</span></div>
            <div className="mob-order-row">
              <span className="ok">Shipping</span>
              <span
                className="ov"
                style={{ color: shipCost === 0 ? "var(--m-emerald)" : "var(--m-ink)", fontWeight: shipCost === 0 ? 600 : 500 }}
              >
                {shipCost === 0 ? "Free" : `$${shipCost.toFixed(2)}`}
              </span>
            </div>

            {/* Referral / promo code */}
            {promoApplied ? (
              <div className="mob-order-row" style={{ borderTop: "1px solid var(--m-rule)", paddingTop: 8, marginTop: 4 }}>
                <span className="ok" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--m-emerald)", flexShrink: 0, display: "inline-block" }} />
                  Referral: {promoApplied}
                  <button type="button" onClick={removePromo} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--m-ink-mute)", padding: "0 2px", lineHeight: 1 }}>×</button>
                </span>
                <span className="ov" style={{ color: "var(--m-emerald)", fontWeight: 700 }}>−${promoDiscount.toFixed(2)}</span>
              </div>
            ) : (
              <div style={{ borderTop: "1px solid var(--m-rule)", paddingTop: 8, marginTop: 4 }}>
                {!promoOpen ? (
                  <button type="button" onClick={() => setPromoOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--m-ink-mute)", textDecoration: "underline", textUnderlineOffset: 3, padding: "4px 0" }}>
                    Have a referral or promo code?
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 0 }}>
                    <input
                      type="text"
                      placeholder="PP-REF-XXXX"
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      autoFocus
                      style={{ flex: 1, height: 40, border: "1.5px solid var(--m-ink)", borderRight: "none", background: "var(--m-bone)", padding: "0 10px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", color: "var(--m-ink)", outline: "none" }}
                    />
                    <button type="button" onClick={applyPromo} style={{ height: 40, padding: "0 14px", border: "1.5px solid var(--m-ink)", background: "var(--m-ink)", color: "var(--m-bone)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--m-alert)", margin: "5px 0 0", letterSpacing: "0.06em" }}>{promoError}</p>}
              </div>
            )}

            <div className="mob-sum-row-total">
              <span className="tk">Total</span>
              <span className="tv">${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Sections */}
      <div className="mob-chk-sections-wrap">
        {/* 01 — Contact */}
        <section className="mob-chk-section">
          <header className="mob-chk-section-hdr">
            <div className="mob-chk-section-title">
              <span className="mob-chk-section-num">01</span>
              <span className="mob-chk-section-label">Contact</span>
            </div>
          </header>
          <div className="mob-chk-section-body">
            <div className="mob-chk-field">
              <label htmlFor="m-email">Email address</label>
              <input
                id="m-email"
                type="email"
                placeholder="you@lab.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
        </section>

        {/* 02 — Shipping address */}
        <section className="mob-chk-section">
          <header className="mob-chk-section-hdr">
            <div className="mob-chk-section-title">
              <span className="mob-chk-section-num">02</span>
              <span className="mob-chk-section-label">Shipping address</span>
            </div>
          </header>
          <div className="mob-chk-section-body">
            <div className="mob-chk-field-row">
              <div className="mob-chk-field">
                <label htmlFor="m-fname">First name</label>
                <input id="m-fname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
              </div>
              <div className="mob-chk-field">
                <label htmlFor="m-lname">Last name</label>
                <input id="m-lname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
              </div>
            </div>
            <div className="mob-chk-field">
              <label htmlFor="m-addr">Address</label>
              <input id="m-addr" type="text" placeholder="123 Research Blvd" value={address1} onChange={(e) => setAddress1(e.target.value)} autoComplete="address-line1" />
            </div>
            <div className="mob-chk-field">
              <label htmlFor="m-addr2">Apt / Suite / Lab (optional)</label>
              <input id="m-addr2" type="text" placeholder="Lab 4B" value={address2} onChange={(e) => setAddress2(e.target.value)} autoComplete="address-line2" />
            </div>
            <div className="mob-chk-field-row">
              <div className="mob-chk-field">
                <label htmlFor="m-city">City</label>
                <input id="m-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
              </div>
              <div className="mob-chk-field is-narrow">
                <label htmlFor="m-state">State</label>
                <div className="mob-chk-select-wrap">
                  <select id="m-state" value={stateField} onChange={(e) => setStateField(e.target.value)} autoComplete="address-level1">
                    <option value="">—</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mob-chk-field is-narrow">
                <label htmlFor="m-zip">ZIP</label>
                <input id="m-zip" type="text" maxLength={10} value={postcode} onChange={(e) => setPostcode(e.target.value)} autoComplete="postal-code" />
              </div>
            </div>
            <div className="mob-chk-field">
              <label htmlFor="m-country">Country</label>
              <div className="mob-chk-select-wrap">
                <select id="m-country" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name">
                  {["United States", "Canada", "United Kingdom", "Australia", "Germany", "Other"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* 03 — Shipping method */}
        <section className="mob-chk-section">
          <header className="mob-chk-section-hdr">
            <div className="mob-chk-section-title">
              <span className="mob-chk-section-num">03</span>
              <span className="mob-chk-section-label">Shipping method</span>
            </div>
          </header>
          <div className="mob-chk-section-body">
            <div className="mob-chk-ship-options">
              <label className={`mob-chk-ship-option${shipping === "standard" ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shipping === "standard"}
                  onChange={() => setShipping("standard")}
                />
                <div className="mob-chk-ship-info">
                  <div className="mob-chk-ship-name">Standard</div>
                  <div className="mob-chk-ship-eta">2–3 BUSINESS DAYS · USPS / UPS</div>
                </div>
                <span className={`mob-chk-ship-price${standardLabel === "Free" ? " is-free" : ""}`}>{standardLabel}</span>
              </label>
              <label className={`mob-chk-ship-option${shipping === "express" ? " is-selected" : ""}`}>
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shipping === "express"}
                  onChange={() => setShipping("express")}
                />
                <div className="mob-chk-ship-info">
                  <div className="mob-chk-ship-name">Express</div>
                  <div className="mob-chk-ship-eta">1 BUSINESS DAY · UPS OVERNIGHT</div>
                </div>
                <span className="mob-chk-ship-price">${EXPRESS_SHIP_COST.toFixed(2)}</span>
              </label>
            </div>
          </div>
        </section>

        {/* 04 — Payment */}
        <section className="mob-chk-section">
          <header className="mob-chk-section-hdr">
            <div className="mob-chk-section-title">
              <span className="mob-chk-section-num">04</span>
              <span className="mob-chk-section-label">Payment</span>
            </div>
          </header>
          <div className="mob-chk-section-body">
            <div className="mob-chk-pay-methods" role="tablist">
              <button type="button" role="tab" aria-selected={pay === "card"} className={`mob-chk-pay-tab${pay === "card" ? " is-active" : ""}`} onClick={() => setPay("card")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Card
              </button>
              <button type="button" role="tab" aria-selected={pay === "crypto"} className={`mob-chk-pay-tab${pay === "crypto" ? " is-active" : ""}`} onClick={() => setPay("crypto")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 9h6v6H9z" />
                </svg>
                Crypto
              </button>
              <button type="button" role="tab" aria-selected={pay === "wire"} className={`mob-chk-pay-tab${pay === "wire" ? " is-active" : ""}`} onClick={() => setPay("wire")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M2 20h20M5 20V10l7-7 7 7v10" />
                </svg>
                Wire
                <span className="mob-chk-vip-badge">VIP</span>
              </button>
            </div>

            {/* Card panel */}
            <div className={`mob-chk-pay-panel${pay === "card" ? " is-active" : ""}`}>
              <div className="mob-chk-field">
                <label htmlFor="m-card">Card number</label>
                <div className="mob-chk-card-wrap">
                  <input
                    id="m-card"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNum}
                    onChange={(e) => setCardNum(formatCard(e.target.value))}
                    autoComplete="cc-number"
                  />
                  <div className="mob-chk-card-icons">
                    <div className="mob-chk-card-icon">VISA</div>
                    <div className="mob-chk-card-icon">MC</div>
                  </div>
                </div>
              </div>
              <div className="mob-chk-field">
                <label htmlFor="m-card-name">Name on card</label>
                <input id="m-card-name" type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} autoComplete="cc-name" />
              </div>
              <div className="mob-chk-field-row">
                <div className="mob-chk-field">
                  <label htmlFor="m-card-exp">Expiry</label>
                  <input
                    id="m-card-exp"
                    type="text"
                    placeholder="MM / YY"
                    maxLength={7}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    autoComplete="cc-exp"
                  />
                </div>
                <div className="mob-chk-field is-narrow">
                  <label htmlFor="m-card-cvv">CVV</label>
                  <input
                    id="m-card-cvv"
                    type="text"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
              <div className="mob-chk-card-foot">
                <div className="mob-chk-card-foot-text">Processed by Bankful · 256-bit SSL encryption</div>
              </div>
            </div>

            {/* Crypto panel — simplified: single bone card with the fallback
                instruction.  The dramatic gold-glass dome / coin badges felt
                ornamental for a feature that doesn't ship. */}
            <div className={`mob-chk-pay-panel${pay === "crypto" ? " is-active" : ""}`}>
              <div className="mob-chk-crypto-fallback">
                Crypto payments coming soon · 3% off when launched. To pay in crypto today, email{" "}
                <strong>info@purepep.shop</strong> and we&apos;ll handle it manually.
              </div>
            </div>

            {/* Wire panel */}
            <div className={`mob-chk-pay-panel${pay === "wire" ? " is-active" : ""}`}>
              <div className="mob-chk-bank-panel">
                <div className="mob-chk-bank-row"><span className="mob-chk-bank-k">Bank</span><span className="mob-chk-bank-v">[Bank name pending]</span></div>
                <div className="mob-chk-bank-row"><span className="mob-chk-bank-k">Account name</span><span className="mob-chk-bank-v">PurePep LLC</span></div>
                <div className="mob-chk-bank-row"><span className="mob-chk-bank-k">Routing</span><span className="mob-chk-bank-v">[Routing pending]</span></div>
                <div className="mob-chk-bank-row"><span className="mob-chk-bank-k">Account</span><span className="mob-chk-bank-v">[Account pending]</span></div>
                <div className="mob-chk-bank-row"><span className="mob-chk-bank-k">Reference</span><span className="mob-chk-bank-v">Your email</span></div>
                <div className="mob-chk-bank-note">Orders ship within 1 business day of payment confirmation. Include your email as the wire reference so we can match your order.</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Terms acknowledgement gate — researcher 21+ verification already
          happened at the AgeGate, so this surface is for sale-policy
          consent only. */}
      <div className={`mob-chk-compliance-box${compliance ? " is-confirmed" : ""}`}>
        <label className={`mob-chk-compliance-check${compliance ? " is-confirmed" : ""}`}>
          <input
            type="checkbox"
            checked={compliance}
            onChange={(e) => setCompliance(e.target.checked)}
          />
          <span className="mob-chk-compliance-text">
            I agree to PurePep&apos;s{" "}
            <a href="/legal/terms-of-service" style={{ color: "var(--m-amber-cta)", fontWeight: 600 }}>Terms of Sale</a>,{" "}
            <a href="/legal/refund-policy" style={{ color: "var(--m-amber-cta)", fontWeight: 600 }}>Refund Policy</a>, and{" "}
            <a href="/legal/shipping-policy" style={{ color: "var(--m-amber-cta)", fontWeight: 600 }}>Shipping Policy</a>.{" "}
            <strong>All sales are final.</strong>
          </span>
        </label>
        <div className={`mob-chk-compliance-bar${compliance ? " is-show" : ""}`}>
          <span>✓ Terms accepted</span>
        </div>
      </div>

      {/* Place order */}
      <div className="mob-chk-place-wrap">
        <button
          type="button"
          className="mob-cta-amber-base mob-chk-place"
          disabled={!compliance || submitting}
          onClick={handlePlaceOrder}
        >
          {submitting ? "Placing order…" : "Place order"}
          {!submitting && (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>
      <div className="mob-chk-place-note">
        By placing your order you agree to PurePep&apos;s Terms of Sale and Privacy Policy.
        Your card will be charged ${total.toFixed(2)}.
      </div>
      {orderError && (
        <div style={{ padding: "0 16px", marginTop: 12, fontSize: 13, color: "var(--m-alert)" }}>
          {orderError}
        </div>
      )}

      {/* Trust footer (reuses cart-page tile styles) */}
      <div className="mob-trust-footer">
        <div className="mob-tf-item">
          <div className="mob-tf-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="mob-tf-label">SSL<br />encrypted</div>
        </div>
        <div className="mob-tf-item">
          <div className="mob-tf-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="mob-tf-label">Fraud<br />protected</div>
        </div>
        <div className="mob-tf-item">
          <div className="mob-tf-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="mob-tf-label">COA<br />included</div>
        </div>
        <div className="mob-tf-item">
          <div className="mob-tf-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="mob-tf-label">2-3 day<br />ship</div>
        </div>
      </div>
    </div>
  );
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];
