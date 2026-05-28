"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/data/products";
import { RetaVialMini } from "@/components/v3/RetaVialMini";
import { TrustBar } from "@/components/v3/TrustBar";
import { BackButton } from "@/components/ui/BackButton";
import {
  FREE_SHIP_THRESHOLD,
  CART_EMPTY_TITLE,
  CART_EMPTY_SUB,
} from "@/content/cart";

/**
 * v3 Apple Swiss Cart page (desktop two-column).
 *
 * Layout: progress steps · two columns: left = item grid (thumb · name+meta ·
 * stepper · line total), right = sticky order summary card with free-ship bar,
 * promo field, totals, Continue-to-checkout CTA, trust strip.
 */

const UPSELL: {
  slug: string;
  compound: string;
  name: string;
  dose: string;
  meta: string;
  price: number;
} = {
  slug: "bpc-157",
  compound: "BPC",
  name: "BPC-157",
  dose: "5 mg",
  meta: "5 MG · LYOPHILIZED",
  price: 69,
};

export function CartPage({ products }: { products: Product[] }) {
  const { items, updateQty, removeItem, addItem, subtotal, totalItems } = useCartStore();

  const upsellProduct = useMemo(
    () => products.find((p) => p.slug === UPSELL.slug),
    [products],
  );

  const sub = subtotal();
  const count = totalItems();
  const itemCount = items.length;

  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  useEffect(() => {
    if (!confirmingRemove) return;
    const t = setTimeout(() => setConfirmingRemove(null), 2000);
    return () => clearTimeout(t);
  }, [confirmingRemove]);

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("");

  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const freeShipUnlocked = sub >= FREE_SHIP_THRESHOLD;

  const hasUpsell = items.some((i) => i.slug === UPSELL.slug);

  function handleStepperMinus(slug: string, currentQty: number) {
    if (currentQty > 1) {
      updateQty(slug, currentQty - 1);
      return;
    }
    if (confirmingRemove === slug) {
      removeItem(slug);
      setConfirmingRemove(null);
    } else {
      setConfirmingRemove(slug);
    }
  }

  function addUpsell() {
    if (!upsellProduct) return;
    addItem({
      slug: upsellProduct.slug,
      compound: upsellProduct.compound,
      name: upsellProduct.name,
      dose: upsellProduct.dose,
      price: upsellProduct.price,
      priceLabel: `$${upsellProduct.price}`,
      wcId: upsellProduct.wcId,
    });
  }

  const empty = itemCount === 0;

  return (
    <div className="v3-shop">
      <TrustBar />

      <main className="v3cart">
        {/* Progress steps */}
        <div className="v3cart-steps" aria-label="Checkout progress">
          <div className="v3cart-step is-current">
            <span className="v3cart-step-dot">1</span>
            <span className="v3cart-step-label">Cart</span>
          </div>
          <div className="v3cart-step-rule" />
          <div className="v3cart-step">
            <span className="v3cart-step-dot">2</span>
            <span className="v3cart-step-label">Details</span>
          </div>
          <div className="v3cart-step-rule" />
          <div className="v3cart-step">
            <span className="v3cart-step-dot">3</span>
            <span className="v3cart-step-label">Payment</span>
          </div>
        </div>

        {/* Page-level nav header with back button */}
        <div className="v3cart-nav">
          <BackButton href="/shop" label="Continue shopping" />
        </div>

        {/* Page title */}
        <div className="v3cart-title">
          <h1>
            Your cart{" "}
            <span className="v3cart-title-count">
              · {count} {count === 1 ? "item" : "items"}
            </span>
          </h1>
        </div>

        {empty ? (
          <div className="v3cart-empty">
            <p className="v3cart-empty-title">{CART_EMPTY_TITLE}</p>
            <p className="v3cart-empty-sub">{CART_EMPTY_SUB}</p>
            <Link href="/shop" className="v3cart-empty-cta">
              Browse the catalog →
            </Link>
          </div>
        ) : (
          <div className="v3cart-layout">
            {/* LEFT column — item grid + upsell */}
            <div className="v3cart-col-main">
              <div className="v3cart-items-card">
                <div className="v3cart-items-hdr">
                  <span className="v3cart-items-hdr-label">Item</span>
                  <span className="v3cart-items-hdr-qty">Quantity</span>
                  <span className="v3cart-items-hdr-total">Total</span>
                </div>
                <div className="v3cart-items">
                  {items.map((item) => {
                    const lineTotal = item.price * item.qty;
                    const isConfirming = confirmingRemove === item.slug;
                    return (
                      <article key={item.slug + item.dose} className="v3cart-item">
                        <div className="v3cart-item-thumb">
                          <RetaVialMini compound={item.compound} />
                        </div>
                        <div className="v3cart-item-body">
                          <div className="v3cart-item-name">{item.name}</div>
                          <div className="v3cart-item-meta">{item.dose} · LYOPHILIZED</div>
                          <div className="v3cart-item-price-unit">
                            ${item.price.toFixed(2)}
                            <span className="v3cart-item-price-unit-suffix"> / vial</span>
                          </div>
                          <button
                            type="button"
                            className="v3cart-item-remove-link"
                            onClick={() => removeItem(item.slug)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="v3cart-item-qty-col">
                          <div
                            className={clsx("v3cart-stepper", isConfirming && "is-confirming")}
                            role="group"
                            aria-label="Quantity"
                          >
                            <button
                              type="button"
                              aria-label={isConfirming ? "Confirm remove" : "Decrease"}
                              onClick={() => handleStepperMinus(item.slug, item.qty)}
                            >
                              {isConfirming ? "×" : "−"}
                            </button>
                            <span className="v3cart-stepper-num">{item.qty}</span>
                            <button
                              type="button"
                              aria-label="Increase"
                              onClick={() => updateQty(item.slug, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="v3cart-item-total">${lineTotal.toFixed(2)}</div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Upsell */}
              {!hasUpsell && upsellProduct && (
                <div className="v3cart-upsell">
                  <div className="v3cart-upsell-eyebrow">Often paired with</div>
                  <div className="v3cart-upsell-card">
                    <div className="v3cart-upsell-thumb">
                      <RetaVialMini compound={UPSELL.compound} />
                    </div>
                    <div className="v3cart-upsell-info">
                      <div className="v3cart-upsell-name">{UPSELL.name}</div>
                      <div className="v3cart-upsell-meta">{UPSELL.meta}</div>
                      <div className="v3cart-upsell-price">${UPSELL.price.toFixed(2)}</div>
                    </div>
                    <button
                      type="button"
                      className="v3cart-upsell-add"
                      onClick={addUpsell}
                      aria-label={`Add ${UPSELL.name} to cart`}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              <Link href="/shop" className="v3cart-continue-shop">
                ← Continue shopping
              </Link>
            </div>
            {/* END LEFT column */}

            {/* RIGHT column — sticky order summary + primary CTA */}
            <aside className="v3cart-col-aside">
              <div className="v3cart-summary">
                <div className="v3cart-summary-h">Order summary</div>

                {/* Free-ship bar inside summary */}
                <div className="v3cart-shipbar">
                  <div className="v3cart-shipbar-row">
                    <span className={clsx("v3cart-shipbar-text", freeShipUnlocked && "is-unlocked")}>
                      {freeShipUnlocked ? (
                        <>Free shipping unlocked</>
                      ) : (
                        <>
                          Add <strong>${remaining.toFixed(2)}</strong> for free shipping
                        </>
                      )}
                    </span>
                    <span className="v3cart-shipbar-pct">
                      {freeShipUnlocked ? "✓" : `${Math.round(pct)}%`}
                    </span>
                  </div>
                  <div className="v3cart-shipbar-track">
                    <div className="v3cart-shipbar-fill" style={{ width: `${pct}%` }}>
                      <div className="v3cart-shipbar-milestone" />
                    </div>
                  </div>
                </div>

                <div className="v3cart-summary-lines">
                  {items.map((item) => {
                    const lineTotal = item.price * item.qty;
                    const unitStr =
                      item.qty > 1
                        ? `${item.qty} × $${item.price.toFixed(2)}`
                        : `$${item.price.toFixed(2)}/vial`;
                    return (
                      <div key={item.slug + item.dose} className="v3cart-summary-line">
                        <div className="v3cart-summary-line-info">
                          <span className="v3cart-summary-line-name">{item.name}</span>
                          <span className="v3cart-summary-line-meta">
                            {item.dose} · {unitStr}
                          </span>
                        </div>
                        <span className="v3cart-summary-line-price">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Promo */}
                <div className="v3cart-promo">
                  {!promoOpen ? (
                    <button
                      type="button"
                      className="v3cart-promo-toggle"
                      onClick={() => setPromoOpen(true)}
                    >
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      Have a promo or referral code?
                    </button>
                  ) : (
                    <div className="v3cart-promo-field is-open">
                      <input
                        className="v3cart-promo-input"
                        placeholder="Enter code"
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        aria-label="Promo code"
                        autoFocus
                      />
                      <button type="button" className="v3cart-promo-apply">
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="v3cart-summary-divider" />
                <div className="v3cart-summary-shiprow">
                  <span className="v3cart-summary-k">Subtotal</span>
                  <span className="v3cart-summary-v">${sub.toFixed(2)}</span>
                </div>
                <div className="v3cart-summary-shiprow">
                  <span className="v3cart-summary-k">Shipping</span>
                  <span className={clsx("v3cart-summary-v", freeShipUnlocked && "is-free")}>
                    {freeShipUnlocked ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="v3cart-summary-shiprow">
                  <span className="v3cart-summary-k">Tax</span>
                  <span className="v3cart-summary-v is-muted">Calculated at checkout</span>
                </div>
                <div className="v3cart-summary-totalrow">
                  <span className="v3cart-summary-k">Total</span>
                  <span className="v3cart-summary-total">${sub.toFixed(2)}</span>
                </div>

                <div className="v3cart-ctas">
                  <Link href="/checkout" className="v3cart-cta-primary">
                    Continue to checkout
                    <svg
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
                  </Link>
                </div>

                <div className="v3cart-summary-note">
                  Taxes calculated at checkout · All sales final · Research use only
                </div>

                {/* Trust strip inside summary */}
                <div className="v3cart-summary-trust">
                  <div className="v3cart-summary-trust-row">
                    <svg
                      width="13"
                      height="13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Secure SSL · PCI-DSS hosted fields</span>
                  </div>
                  <div className="v3cart-summary-pays">
                    <span className="v3cart-paymark">VISA</span>
                    <span className="v3cart-paymark">MC</span>
                    <span className="v3cart-paymark">AMEX</span>
                    <span className="v3cart-paymark">DISC</span>
                  </div>
                </div>
              </div>
            </aside>
            {/* END RIGHT column */}
          </div>
        )}
      </main>
    </div>
  );
}
