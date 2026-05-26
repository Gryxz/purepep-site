/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { useCartStore } from "@/lib/cart-store";
import { placeWcOrder, getCartToken, getNonce, type WcOrderResult } from "@/lib/wc-store-api";
import { trackBeginCheckout } from "@/lib/analytics";
import { FREE_SHIP_THRESHOLD } from "@/content/cart";
import { compliance as complianceTokens, palette } from "@design/tokens";
import type { BankfulHostedFields } from "@/components/checkout/bankful";

const EXPRESS_PRICE = 24;
const STANDARD_BELOW_THRESHOLD = 8;

const SHOW_CRYPTO = process.env.NEXT_PUBLIC_SHOW_CRYPTO === "true";
const SHOW_WIRE = process.env.NEXT_PUBLIC_SHOW_WIRE === "true";
const DECLINE_FALLBACK =
  "Your payment couldn't be completed. Please try a different card or contact info@purepep.shop.";

type ShippingMethod = "standard" | "express";
type PayTab = "card" | "crypto" | "wire";

const STATES = [
  "TX", "CA", "NY", "FL", "WA", "IL", "MA", "CO", "GA", "AZ", "NC", "OH",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "Other",
];

function toggleHfClass(field: string, prefix: "v3" | "mob", cls: string, on: boolean) {
  const map: Record<string, string> = {
    cardNumber: `#${prefix}-bankful-card-number`,
    expiry: `#${prefix}-bankful-card-expiry`,
    cvv: `#${prefix}-bankful-card-cvv`,
  };
  const sel = map[field];
  if (!sel || typeof document === "undefined") return;
  document.querySelector(sel)?.classList.toggle(cls, on);
}

export function CheckoutPage({ sdkReady }: { sdkReady: boolean | "failed" }) {
  const { items, subtotal, clearCart } = useCartStore();
  const sub = subtotal();

  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payTab, setPayTab] = useState<PayTab>("card");
  const [summaryOpen, setSummaryOpen] = useState(true);

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
      setPromoError("Code not recognized. Check your referral link or try again.");
    }
  }

  function removePromo() {
    setPromoApplied(null);
    setPromoDiscount(0);
    setPromoInput("");
    setPromoError(null);
  }

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

  // Cardholder name only — PAN/expiry/CVV are in Bankful hosted fields
  const [cardName, setCardName] = useState("");

  // Bankful hosted fields
  const hf = useRef<BankfulHostedFields | null>(null);
  const [hfReady, setHfReady] = useState(false);
  const [hfErrors, setHfErrors] = useState<Record<string, string | null>>({});
  const [verifying, setVerifying] = useState(false);

  const [complianceChecked, setComplianceChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<WcOrderResult | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Place-order button polish — entrance + shimmer when compliance flips on
  const [unlockAnim, setUnlockAnim] = useState<"unlock" | "shimmer" | null>(null);
  useEffect(() => {
    if (complianceChecked) {
      setUnlockAnim("unlock");
      const t1 = setTimeout(() => setUnlockAnim("shimmer"), 500);
      const t2 = setTimeout(() => setUnlockAnim(null), 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setUnlockAnim(null);
    }
  }, [complianceChecked]);

  // Fire begin_checkout once on mount with a non-empty cart
  useEffect(() => {
    if (items.length === 0) return;
    trackBeginCheckout(items, sub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount Bankful hosted fields once the SDK is ready
  useEffect(() => {
    if (sdkReady !== true || hf.current || typeof window === "undefined" || !window.Bankful) return;
    const pk = process.env.NEXT_PUBLIC_BANKFUL_HOSTED_FIELDS_KEY;
    if (!pk) return;
    const instance = window.Bankful.create({
      publishableKey: pk,
      environment: process.env.NEXT_PUBLIC_BANKFUL_ENV ?? "sandbox",
    });
    instance.mount({
      fields: {
        cardNumber: { selector: "#v3-bankful-card-number", placeholder: "0000 0000 0000 0000" },
        expiry: { selector: "#v3-bankful-card-expiry", placeholder: "MM / YY" },
        cvv: { selector: "#v3-bankful-card-cvv", placeholder: "•••" },
      },
      styles: {
        base: {
          "font-family": "var(--font-sans), system-ui, sans-serif",
          "font-size": "14px",
          color: palette.ink,
        },
        placeholder: { color: palette.inkMuted },
        invalid: { color: palette.alert },
      },
      onReady: () => setHfReady(true),
      onFocus: (f) => toggleHfClass(f, "v3", "hf-focus", true),
      onBlur: (f) => toggleHfClass(f, "v3", "hf-focus", false),
      onValidityChange: (f, err) => setHfErrors((p) => ({ ...p, [f]: err })),
    });
    hf.current = instance;
    return () => {
      hf.current?.destroy();
      hf.current = null;
    };
  }, [sdkReady]);

  // Pricing
  const shippingCost =
    shipping === "express" ? EXPRESS_PRICE : sub >= FREE_SHIP_THRESHOLD ? 0 : STANDARD_BELOW_THRESHOLD;
  const standardLabel = sub >= FREE_SHIP_THRESHOLD ? "Free" : `$${STANDARD_BELOW_THRESHOLD.toFixed(2)}`;
  const total = Math.max(0, sub + shippingCost - promoDiscount);
  const empty = items.length === 0;

  async function handlePlaceOrder() {
    if (submitting || empty || !complianceChecked) return;
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

    // ── WIRE (hidden unless SHOW_WIRE) — bacs path ──
    if (payTab === "wire") {
      const result = await placeWcOrder({
        billing_address: { ...address },
        shipping_address: address,
        payment_method: "bacs",
      });
      setSubmitting(false);
      if (result) {
        setOrderResult(result);
        clearCart();
        if (result.payment_url) window.location.href = result.payment_url;
        else window.location.href = `/order-confirm/?key=${encodeURIComponent(result.order_key ?? "")}&id=${result.order_id}`;
      } else {
        setOrderError(
          "We couldn't place this order. Please double-check your delivery details, or email info@purepep.shop if it persists.",
        );
      }
      return;
    }

    // ── CARD (default) — Bankful tokenize → WP proxy → WC order ──
    const endpoint = process.env.NEXT_PUBLIC_BANKFUL_CHECKOUT_ENDPOINT;
    if (!endpoint || !hf.current || !hfReady) {
      setSubmitting(false);
      setOrderError(
        "Card payment is temporarily unavailable. Please email info@purepep.shop and we'll complete your order.",
      );
      return;
    }

    try {
      const { token } = await hf.current.tokenize({ cardholderName: cardName, billingPostalCode: postcode });
      const cartToken = await getCartToken();
      const nonce = await getNonce();

      const charge = async (extra?: Record<string, unknown>) => {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email, billing: address, shipping: address, cartToken, nonce, ...extra }),
        });
        return res.json() as Promise<{
          ok: boolean;
          order_id?: number;
          order_key?: string;
          requiresAction?: boolean;
          threeDS?: unknown;
          error?: { code: string; message: string };
        }>;
      };

      let data = await charge();

      if (data.requiresAction && data.threeDS) {
        setVerifying(true);
        const stepUp = await hf.current.handleAction(data.threeDS);
        setVerifying(false);
        data = await charge({ token: stepUp.token, threeDSResult: stepUp.token });
      }

      if (data.ok && data.order_id) {
        clearCart();
        window.location.href = `/order-confirm/?key=${encodeURIComponent(data.order_key ?? "")}&id=${data.order_id}`;
        return;
      }
      setSubmitting(false);
      setOrderError(data.error?.message ?? DECLINE_FALLBACK);
    } catch {
      setSubmitting(false);
      setVerifying(false);
      setOrderError(
        "We couldn't reach the payment processor. Please try again, or email info@purepep.shop.",
      );
    }
  }

  if (empty && !orderResult) {
    return (
      <div className="v3-shop">
        <main className="v3chk">
          <div className="v3chk-empty">
            <p className="v3chk-empty-title">No items to check out</p>
            <p className="v3chk-empty-sub">Add a vial to get started.</p>
            <Link href="/shop" className="v3chk-empty-cta">
              Browse the catalog →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="v3-shop">
      <main className="v3chk">
        <div className="v3chk-layout">
        {/* LEFT column — form sections */}
        <div className="v3chk-col-main">
        <div className="v3chk-sections">
          {/* 01 Contact */}
          <Section num="01" label="Contact">
            <Field label="Email address">
              <input
                type="email"
                placeholder="you@lab.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </Section>

          {/* 02 Shipping address */}
          <Section num="02" label="Shipping address">
            <div className="v3chk-field-row">
              <Field label="First name">
                <input
                  type="text"
                  placeholder="Isaiah"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field>
              <Field label="Last name">
                <input
                  type="text"
                  placeholder="Razon"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Address">
              <input
                type="text"
                placeholder="123 Research Blvd"
                autoComplete="address-line1"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </Field>
            <Field label="Apt / Suite / Lab (optional)">
              <input
                type="text"
                placeholder="Lab 4B"
                autoComplete="address-line2"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </Field>
            <div className="v3chk-field-row">
              <Field label="City">
                <input
                  type="text"
                  placeholder="Austin"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Field>
              <Field label="State" narrow>
                <div className="v3chk-select-wrap">
                  <select
                    autoComplete="address-level1"
                    value={stateField}
                    onChange={(e) => setStateField(e.target.value)}
                  >
                    <option value="">—</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </Field>
              <Field label="ZIP" narrow>
                <input
                  type="text"
                  placeholder="78701"
                  autoComplete="postal-code"
                  maxLength={10}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Country">
              <div className="v3chk-select-wrap">
                <select
                  autoComplete="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </Section>

          {/* 03 Shipping method */}
          <Section num="03" label="Shipping method">
            <div className="v3chk-ship-options">
              <ShipOption
                method="standard"
                selected={shipping === "standard"}
                name="Standard"
                eta="2–3 BUSINESS DAYS · USPS / UPS"
                price={standardLabel}
                priceFree={sub >= FREE_SHIP_THRESHOLD}
                onSelect={setShipping}
              />
              <ShipOption
                method="express"
                selected={shipping === "express"}
                name="Express"
                eta="1 BUSINESS DAY · UPS OVERNIGHT"
                price={`$${EXPRESS_PRICE.toFixed(2)}`}
                priceFree={false}
                onSelect={setShipping}
              />
            </div>
          </Section>

          {/* 04 Payment */}
          <Section num="04" label="Payment">
            <div className="v3chk-pay-tabs" role="tablist" aria-label="Payment method">
              <PayTabBtn active={payTab === "card"} onSelect={() => setPayTab("card")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Card
              </PayTabBtn>
              {SHOW_CRYPTO && (
                <PayTabBtn active={payTab === "crypto"} onSelect={() => setPayTab("crypto")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L10.5 19.25m1.267-.161L9.5 4.25m2.267 14.839L10.5 19.25m0 0L8.75 9.75M12 6.75c-4.924-.868-6.14 6.025-1.216 6.894M12 6.75L10.5 4.25m1.5 2.5L9.5 4.25" />
                  </svg>
                  Crypto
                </PayTabBtn>
              )}
              {SHOW_WIRE && (
                <PayTabBtn active={payTab === "wire"} onSelect={() => setPayTab("wire")}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 20h20M5 20V10l7-7 7 7v10" />
                  </svg>
                  Wire
                  <span className="v3chk-vip-badge">VIP</span>
                </PayTabBtn>
              )}
            </div>

            {payTab === "card" && (
              <div className="v3chk-pay-panel">
                <div className="v3chk-ruo-notice">{complianceTokens.researchUseOnly}</div>

                {sdkReady === "failed" && (
                  <p role="alert" className="v3chk-error" style={{ margin: "0 0 12px" }}>
                    Card payment is temporarily unavailable. Please email info@purepep.shop and we&rsquo;ll complete your order.
                  </p>
                )}

                <Field label="Card number">
                  <div id="v3-bankful-card-number" className="v3chk-hf-field" />
                  {hfErrors.cardNumber && <div className="v3chk-hf-error">{hfErrors.cardNumber}</div>}
                </Field>

                <Field label="Name on card">
                  <input
                    type="text"
                    placeholder="Isaiah Razon"
                    autoComplete="cc-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </Field>

                <div className="v3chk-field-row">
                  <Field label="Expiry">
                    <div id="v3-bankful-card-expiry" className="v3chk-hf-field" />
                    {hfErrors.expiry && <div className="v3chk-hf-error">{hfErrors.expiry}</div>}
                  </Field>
                  <Field label="CVV" narrow>
                    <div id="v3-bankful-card-cvv" className="v3chk-hf-field" />
                    {hfErrors.cvv && <div className="v3chk-hf-error">{hfErrors.cvv}</div>}
                  </Field>
                </div>

                <div className="v3chk-security-note">
                  Card details are entered in PCI-DSS secure fields hosted by Bankful and tokenized in your browser. PurePep never sees or stores your full card number or CVV.
                </div>
                <div className="v3chk-descriptor-note">
                  Your statement will show this charge as PUREPEP.SHOP.
                </div>
              </div>
            )}

            {SHOW_CRYPTO && payTab === "crypto" && (
              <div className="v3chk-pay-panel">
                <div className="v3chk-crypto-panel">
                  <div className="v3chk-crypto-eyebrow">Coming soon</div>
                  <div className="v3chk-crypto-h">Pay with crypto</div>
                  <div className="v3chk-crypto-sub">
                    Direct crypto payments coming soon.{" "}
                    <span className="v3chk-crypto-bonus">
                      Pay in crypto and receive a 3% discount
                    </span>{" "}
                    on your order — automatically applied at checkout.
                  </div>
                  <div className="v3chk-crypto-pill">
                    <span className="v3chk-crypto-dot" />
                    Integration in progress
                  </div>
                  <div className="v3chk-crypto-coins">
                    {["BTC", "ETH", "USDC", "SOL"].map((c) => (
                      <div key={c} className="v3chk-crypto-coin">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="v3chk-crypto-fallback">
                  Want to pay in crypto now? Email{" "}
                  <span className="v3chk-crypto-mail">info@purepep.shop</span> — we&rsquo;ll
                  handle it manually.
                </div>
              </div>
            )}

            {SHOW_WIRE && payTab === "wire" && (
              <div className="v3chk-pay-panel">
                <div className="v3chk-bank-panel">
                  <BankRow k="Bank" v="[Bank name pending]" />
                  <BankRow k="Account name" v="PurePep LLC" />
                  <BankRow k="Routing" v="[Routing pending]" />
                  <BankRow k="Account" v="[Account pending]" />
                  <BankRow k="Reference" v="Your email" />
                  <div className="v3chk-bank-note">
                    Orders ship within 1 business day of payment confirmation. Include your
                    email as the wire reference so we can match your order.
                  </div>
                </div>
              </div>
            )}
          </Section>
        </div>
        </div>
        {/* END LEFT column */}

        {/* RIGHT column — sticky order summary + compliance + place order */}
        <aside className="v3chk-col-aside">
        {/* Order summary */}
        <div className="v3chk-order-card">
          <div className="v3chk-order-h">
            <span>Order summary</span>
            <button
              type="button"
              className="v3chk-order-toggle"
              onClick={() => setSummaryOpen((o) => !o)}
              aria-expanded={summaryOpen}
            >
              {summaryOpen ? "Hide ▴" : "Show ▾"}
            </button>
          </div>
          {summaryOpen && (
            <div>
              <div className="v3chk-order-lines">
                {items.map((item) => {
                  const lineTotal = item.price * item.qty;
                  const unitStr =
                    item.qty > 1
                      ? `${item.qty} × $${item.price.toFixed(2)}`
                      : `$${item.price.toFixed(2)}/vial`;
                  return (
                    <div key={item.slug + item.dose} className="v3chk-order-line">
                      <div className="v3chk-ol-left">
                        <span className="v3chk-ol-name">{item.name}</span>
                        <span className="v3chk-ol-meta">{item.dose} · LYOPHILIZED</span>
                        <span className="v3chk-ol-meta">{unitStr}</span>
                      </div>
                      <span className="v3chk-ol-price">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="v3chk-order-divider" />
              <div className="v3chk-order-row">
                <span className="v3chk-order-k">Subtotal</span>
                <span className="v3chk-order-v">${sub.toFixed(2)}</span>
              </div>
              <div className="v3chk-order-row">
                <span className="v3chk-order-k">Shipping</span>
                <span
                  className={clsx(
                    "v3chk-order-v",
                    shippingCost === 0 && "is-free",
                    shippingCost > 0 && "is-muted",
                  )}
                >
                  {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {/* Referral / promo code */}
              {promoApplied ? (
                <div className="v3chk-order-row v3chk-promo-applied">
                  <span className="v3chk-order-k v3chk-promo-code-label">
                    <span className="v3chk-promo-dot" />
                    Referral: {promoApplied}
                    <button type="button" className="v3chk-promo-remove" onClick={removePromo} aria-label="Remove promo code">×</button>
                  </span>
                  <span className="v3chk-order-v v3chk-promo-savings">−${promoDiscount.toFixed(2)}</span>
                </div>
              ) : (
                <div className="v3chk-promo-toggle-wrap">
                  {!promoOpen ? (
                    <button type="button" className="v3chk-promo-toggle" onClick={() => setPromoOpen(true)}>
                      Have a referral or promo code?
                    </button>
                  ) : (
                    <div className="v3chk-promo-row">
                      <input
                        type="text"
                        className="v3chk-promo-input"
                        placeholder="PP-REF-XXXX"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                        autoFocus
                        aria-label="Promo or referral code"
                      />
                      <button type="button" className="v3chk-promo-apply" onClick={applyPromo}>
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="v3chk-promo-error">{promoError}</p>}
                </div>
              )}

              <div className="v3chk-order-total">
                <span className="v3chk-order-tk">Total</span>
                <span className="v3chk-order-tv">${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className={clsx("v3chk-compliance", complianceChecked && "is-confirmed")}>
          <label className={clsx("v3chk-compliance-label", complianceChecked && "is-confirmed")}>
            <input
              type="checkbox"
              checked={complianceChecked}
              onChange={(e) => setComplianceChecked(e.target.checked)}
            />
            <span className="v3chk-compliance-text">
              I confirm I am a{" "}
              <strong>qualified researcher aged 21+</strong> and that these products will be
              used <strong>strictly for in vitro laboratory research</strong>. I understand
              all sales are final.
            </span>
          </label>
          <div className={clsx("v3chk-compliance-bar", complianceChecked && "is-shown")}>
            <span>✓&nbsp;&nbsp;Confirmed — research use acknowledged</span>
          </div>
        </div>

        {/* Place order */}
        <div className="v3chk-place-wrap">
          <button
            type="button"
            className={clsx(
              "v3chk-place",
              unlockAnim === "unlock" && "is-unlock",
              unlockAnim === "shimmer" && "is-shimmer",
            )}
            disabled={!complianceChecked || submitting}
            onClick={handlePlaceOrder}
            aria-busy={submitting}
          >
            <div className="v3chk-place-shadow" />
            <span className="v3chk-place-label">
              {verifying ? "Verifying with your bank…" : submitting ? "Placing…" : "Place order"}
            </span>
            <svg
              className="v3chk-place-arrow"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div className="v3chk-place-note">
          By placing your order you agree to PurePep&rsquo;s{" "}
          <a href="/legal/terms-of-service">Terms of Sale</a>,{" "}
          <a href="/legal/privacy-policy">Privacy Policy</a>, and{" "}
          <a href="/legal/refund-policy">Refund Policy</a>. Your card will be charged{" "}
          <span className="v3chk-place-charge">${total.toFixed(2)}</span>, shown on your statement as PUREPEP.SHOP.
        </div>
        <div className="v3chk-refund-note">
          All sales are final. No refunds, returns, or exchanges except where a package is lost in transit or arrives damaged — see our{" "}
          <a href="/legal/refund-policy">Refund Policy</a>.
        </div>
        <div className="v3chk-dispute-note">
          Questions about a charge? Contact us before disputing with your bank — most issues are resolved within one business day. Unauthorized chargebacks on completed research-material orders may be contested with order, tracking, and delivery records.
        </div>

        {orderError && (
          <p role="alert" className="v3chk-error">
            {orderError}
          </p>
        )}
        {orderResult && (
          <p role="status" className="v3chk-status">
            Order #{orderResult.order_id} placed. We&rsquo;ll email next steps.
          </p>
        )}
        </aside>
        {/* END RIGHT column */}
        </div>
        {/* END layout */}

        {/* Trust footer */}
        <div className="v3chk-trust">
          <TrustItem
            label={
              <>
                SSL
                <br />
                encrypted
              </>
            }
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                Fraud
                <br />
                protected
              </>
            }
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                COA
                <br />
                included
              </>
            }
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                2-3 day
                <br />
                ship
              </>
            }
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </TrustItem>
        </div>
        <div className="v3chk-support-line">
          Need help? <a href="mailto:info@purepep.shop">info@purepep.shop</a> · PurePep LLC
        </div>
      </main>
    </div>
  );
}

function Section({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <div className="v3chk-section">
      <div className="v3chk-section-hdr">
        <div className="v3chk-section-title">
          <span className="v3chk-section-num">{num}</span>
          <span className="v3chk-section-label">{label}</span>
        </div>
      </div>
      <div className="v3chk-section-body">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  narrow,
}: {
  label: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className={clsx("v3chk-field", narrow && "is-narrow")}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ShipOption({
  method,
  selected,
  name,
  eta,
  price,
  priceFree,
  onSelect,
}: {
  method: ShippingMethod;
  selected: boolean;
  name: string;
  eta: string;
  price: string;
  priceFree: boolean;
  onSelect: (m: ShippingMethod) => void;
}) {
  return (
    <label className={clsx("v3chk-ship-option", selected && "is-selected")}>
      <input
        type="radio"
        name="shipping"
        value={method}
        checked={selected}
        onChange={() => onSelect(method)}
      />
      <div className="v3chk-ship-info">
        <div className="v3chk-ship-name">{name}</div>
        <div className="v3chk-ship-eta">{eta}</div>
      </div>
      <span className={clsx("v3chk-ship-price", priceFree && "is-free")}>{price}</span>
    </label>
  );
}

function PayTabBtn({
  active,
  onSelect,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={clsx("v3chk-pay-tab", active && "is-active")}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}

function BankRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="v3chk-bank-row">
      <span className="v3chk-bank-k">{k}</span>
      <span className="v3chk-bank-v">{v}</span>
    </div>
  );
}

function TrustItem({ children, label }: { children: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="v3chk-trust-item">
      <div className="v3chk-trust-icon">{children}</div>
      <div className="v3chk-trust-label">{label}</div>
    </div>
  );
}
