"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "@/lib/clsx";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/data/products";
import { RetaVialMini } from "./RetaVialMini";
import { TrustBar } from "./TrustBar";

/**
 * v3 Apple Swiss Cart page (mobile-first).
 *
 * Source: cart-mockup.html.
 *
 * Layout (top → bottom): page title · free-ship progress bar (amber) ·
 * line items with stepper + tap-twice-to-remove · promo expand · order
 * summary card · upsell (hardcoded BPC-157 — hidden if already in cart) ·
 * Proceed-to-checkout (dark loden) + Continue shopping · trust footer.
 *
 * Wired to useCartStore. Empty state renders a single "browse the catalog"
 * CTA in place of items + summary.
 */

const FREE_SHIP_THRESHOLD = 200;

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

  // Find the WC-mirrored upsell product if available so addItem can sync to WC
  const upsellProduct = useMemo(() => products.find((p) => p.slug === UPSELL.slug), [products]);

  const sub = subtotal();
  const count = totalItems();
  const itemCount = items.length;

  // Tap-twice-to-confirm-remove state, scoped per-slug
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null);
  useEffect(() => {
    if (!confirmingRemove) return;
    const t = setTimeout(() => setConfirmingRemove(null), 2000);
    return () => clearTimeout(t);
  }, [confirmingRemove]);

  const [promoOpen, setPromoOpen] = useState(false);

  // Free-ship progress
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const freeShipUnlocked = sub >= FREE_SHIP_THRESHOLD;

  // Upsell visibility — hide if already in cart
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
        {/* Page title */}
        <div className="v3cart-title">
          <Link href="/shop" className="v3cart-back">
            ← Shop
          </Link>
          <h1>
            Your cart{" "}
            <span className="v3cart-title-count">
              · {count} {count === 1 ? "item" : "items"}
            </span>
          </h1>
        </div>

        {empty ? (
          <div className="v3cart-empty">
            <p className="v3cart-empty-title">Cart is empty</p>
            <p className="v3cart-empty-sub">Add a vial to get started.</p>
            <Link href="/shop" className="v3cart-empty-cta">
              Browse the catalog →
            </Link>
          </div>
        ) : (
          <>
            {/* Free-ship bar */}
            <div className="v3cart-shipbar">
              <div className="v3cart-shipbar-row">
                <span className={clsx("v3cart-shipbar-text", freeShipUnlocked && "is-unlocked")}>
                  {freeShipUnlocked ? (
                    <>
                      You&rsquo;ve unlocked <strong>free shipping</strong>
                    </>
                  ) : (
                    <>
                      Add <strong>${remaining.toFixed(2)}</strong> more for free shipping
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

            {/* Items */}
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
                      <div className="v3cart-item-top">
                        <div className="v3cart-item-name">{item.name}</div>
                        <button
                          type="button"
                          className="v3cart-item-remove"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.slug)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="v3cart-item-meta">{item.dose} · LYOPHILIZED</div>
                      <div className="v3cart-item-bottom">
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
                        <div className="v3cart-item-total">${lineTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Promo */}
            <div className="v3cart-promo">
              <button
                type="button"
                className={clsx("v3cart-promo-toggle", promoOpen && "is-open")}
                onClick={() => setPromoOpen((o) => !o)}
                aria-expanded={promoOpen}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Have a promo code?
              </button>
              <div className={clsx("v3cart-promo-field", promoOpen && "is-open")}>
                <input
                  className="v3cart-promo-input"
                  placeholder="Enter code"
                  type="text"
                  aria-label="Promo code"
                />
                <button type="button" className="v3cart-promo-apply">
                  Apply
                </button>
              </div>
            </div>

            {/* Order summary */}
            <div className="v3cart-summary-wrap">
              <div className="v3cart-summary">
                <div className="v3cart-summary-h">Order summary</div>
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
                            {item.dose} · Lyophilized
                          </span>
                        </div>
                        <div className="v3cart-summary-line-right">
                          <span className="v3cart-summary-line-price">${lineTotal.toFixed(2)}</span>
                          <span className="v3cart-summary-line-unit">{unitStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="v3cart-summary-divider" />
                <div className="v3cart-summary-shiprow">
                  <span className="v3cart-summary-k">Shipping</span>
                  <span className={clsx("v3cart-summary-v", freeShipUnlocked && "is-free")}>
                    {freeShipUnlocked ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="v3cart-summary-totalrow">
                  <span className="v3cart-summary-k">Total</span>
                  <span className="v3cart-summary-total">${sub.toFixed(2)}</span>
                </div>
                <div className="v3cart-summary-note">
                  Taxes calculated at checkout · Returns per policy · Research use only
                </div>
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

            {/* CTAs */}
            <div className="v3cart-ctas">
              <Link href="/checkout" className="v3cart-cta-primary">
                Proceed to checkout
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
              <Link href="/shop" className="v3cart-cta-secondary">
                Continue shopping
              </Link>
            </div>
          </>
        )}

        {/* Trust footer */}
        <div className="v3cart-trust">
          <TrustItem
            label={
              <>
                Secure
                <br />
                checkout
              </>
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                Lab
                <br />
                verified
              </>
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                2-3 day
                <br />
                shipping
              </>
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </TrustItem>
          <TrustItem
            label={
              <>
                Research
                <br />
                use only
              </>
            }
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </TrustItem>
        </div>
      </main>
    </div>
  );
}

function TrustItem({ children, label }: { children: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="v3cart-trust-item">
      <div className="v3cart-trust-icon">{children}</div>
      <div className="v3cart-trust-label">{label}</div>
    </div>
  );
}
