/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { getProduct } from "@/data/products.static";
import { MobileVial } from "./MobileVial";

const FREE_SHIP_THRESHOLD = 200;
const UPSELL_SLUG = "bpc-157";

/**
 * v5 mobile /cart page — full-page version of the slide-in cart drawer.
 * Same useCartStore wiring, different chrome:
 *   - Header: logo + "← Back" text link
 *   - Page title with item count
 *   - Free-ship bar
 *   - Item list (full-bleed)
 *   - Promo collapsible
 *   - Order summary card on --m-s1 surface (per-line items + divider +
 *     shipping + total + mono note)
 *   - Upsell card on --m-s1
 *   - Loden checkout CTA + ghost continue-shopping
 *   - 4-icon trust footer (SSL / COA / 2-3 day / Research-use)
 */
export function MobileCartPage() {
  const router = useRouter();
  const { items, updateQty, removeItem, addItem, subtotal } = useCartStore();
  const [promoOpen, setPromoOpen] = useState(false);
  const [shipBarHidden, setShipBarHidden] = useState(false);

  const sub = subtotal();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const unlocked = sub >= FREE_SHIP_THRESHOLD;

  const upsellProduct = getProduct(UPSELL_SLUG);
  const upsellInCart = items.some((i) => i.slug === UPSELL_SLUG);
  const showUpsell = !!upsellProduct && !upsellInCart && items.length > 0;

  // Auto-hide free-ship bar 1.8s after unlock — same behavior as drawer.
  useEffect(() => {
    if (!unlocked) {
      setShipBarHidden(false);
      return;
    }
    const t = setTimeout(() => setShipBarHidden(true), 1800);
    return () => clearTimeout(t);
  }, [unlocked]);

  function handleAddUpsell() {
    if (!upsellProduct) return;
    addItem({
      slug: upsellProduct.slug,
      compound: upsellProduct.compound,
      name: upsellProduct.name,
      dose: upsellProduct.dose,
      price: upsellProduct.price,
      priceLabel: upsellProduct.priceLabel,
      wcId: upsellProduct.wcId,
    });
  }

  return (
    <div className="mob-app">
      {/* Page-specific header (logo + back) — distinct from the global
          MobileShell sticky header which is hidden on this surface
          would conflict; we render below the global chrome here so the
          back button is page-scoped. */}
      <div className="mob-cart-page-title">
        <h1>
          Your cart <span className="item-count">· {count} item{count !== 1 ? "s" : ""}</span>
        </h1>
      </div>

      {/* Free-ship bar (auto-hides 1.8s after unlock) */}
      {items.length > 0 && !shipBarHidden && (
        <div className={`mob-ship-bar${unlocked ? " is-celebrating" : ""}`}>
          <div className="mob-ship-bar-label">
            <span className={`mob-ship-bar-text${unlocked ? " is-unlocked" : ""}`}>
              {unlocked ? (
                <>You&apos;ve unlocked <strong>free shipping!</strong></>
              ) : (
                <>Add <strong>${remaining.toFixed(2)}</strong> more for free shipping</>
              )}
            </span>
            <span className="mob-ship-pct">{unlocked ? "✓" : `${Math.round(pct)}%`}</span>
          </div>
          <div className="mob-ship-track">
            <div className="mob-ship-fill" style={{ width: `${pct}%` }}>
              <div className="mob-ship-milestone" />
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 ? (
        <div className="mob-cart-empty">
          <div className="mob-cart-empty-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: "var(--m-ink-mute)" }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="mob-cart-empty-h">Your cart is empty</div>
          <div className="mob-cart-empty-p">Add a compound from the catalog to get started.</div>
          <a href="/shop" className="mob-cta-view" style={{ marginTop: 12, maxWidth: 280 }}>Browse catalog →</a>
        </div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <article key={`${item.slug}-${item.dose}`} className="mob-item">
                <div className="mob-item-img">
                  <MobileVial size="xs" compound={item.compound} mass={item.dose} />
                </div>
                <div className="mob-item-body">
                  <div className="mob-item-name">{item.name}</div>
                  <div className="mob-item-meta">{item.dose} · LYOPHILIZED</div>
                  <div className="mob-item-price-row" style={{ marginTop: 6 }}>
                    <div className="mob-item-unit">
                      Unit ${item.price.toFixed(2)}
                      {(() => {
                        const reg = getProduct(item.slug)?.regularPrice;
                        return reg && reg > item.price ? (
                          <span className="mob-item-strike">${reg.toFixed(2)}</span>
                        ) : null;
                      })()}
                    </div>
                    <div className="mob-item-total">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div className="mob-item-stepper">
                    <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(item.slug, item.qty - 1)}>−</button>
                    <span className="sv">{item.qty}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.slug, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button
                  type="button"
                  className="mob-item-remove"
                  onClick={() => removeItem(item.slug)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </article>
            ))}
          </div>

          {/* Promo */}
          <div className="mob-promo-row">
            <button
              type="button"
              className={`mob-promo-toggle${promoOpen ? " is-open" : ""}`}
              onClick={() => setPromoOpen((o) => !o)}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Have a promo code?
            </button>
            <div className={`mob-promo-field${promoOpen ? " is-open" : ""}`}>
              <input className="mob-promo-input" placeholder="Enter code" type="text" />
              <button type="button" className="mob-promo-apply">Apply</button>
            </div>
          </div>

          {/* Order summary card */}
          <div style={{ padding: "20px 16px 16px" }}>
            <div className="mob-summary-section">
              <div className="mob-summary-h">Order summary</div>
              <div className="mob-sum-lines">
                {items.map((item) => {
                  const linePrice = (item.price * item.qty).toFixed(2);
                  const unitStr = item.qty > 1
                    ? `${item.qty} × $${item.price.toFixed(2)}`
                    : `$${item.price.toFixed(2)}/vial`;
                  return (
                    <div key={`${item.slug}-${item.dose}`} className="mob-sum-line">
                      <div className="mob-sum-line-info">
                        <span className="mob-sum-line-name">{item.name}</span>
                        <span className="mob-sum-line-meta">{item.dose} · Lyophilized</span>
                      </div>
                      <div className="mob-sum-line-right">
                        <span className="mob-sum-line-price">${linePrice}</span>
                        <span className="mob-sum-line-unit">{unitStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mob-sum-divider" />
              <div className="mob-sum-row-total">
                <span className="tk">Total</span>
                <span className="tv">
                  ${sub.toFixed(2)}
                  {unlocked && <span className="mob-order-ship-note"> · Free shipping</span>}
                </span>
              </div>
              <div className="mob-sum-note">Taxes calculated at checkout · All sales final · Research use only</div>
            </div>
          </div>

          {/* Upsell */}
          {showUpsell && upsellProduct && (
            <div className="mob-upsell">
              <div className="mob-upsell-eyebrow">Often paired with</div>
              <div className="mob-upsell-card">
                <div className="mob-upsell-img">
                  <MobileVial size="xs" compound={upsellProduct.compound} mass={upsellProduct.dose} />
                </div>
                <div className="mob-upsell-info">
                  <div className="mob-upsell-name">{upsellProduct.name}</div>
                  <div className="mob-upsell-meta">{upsellProduct.dose} · LYOPHILIZED</div>
                  <div className="mob-upsell-price">${upsellProduct.price.toFixed(2)}</div>
                </div>
                <button type="button" className="mob-cta-amber-base mob-upsell-add" onClick={handleAddUpsell}>
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mob-ctas-section">
            <a href="/checkout" className="mob-cta-amber-base mob-cta-checkout">
              Continue to checkout
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <button type="button" className="mob-cta-view" onClick={() => router.back()}>
              Continue shopping
            </button>
          </div>

          {/* Trust footer */}
          <div className="mob-trust-footer">
            <div className="mob-tf-item">
              <div className="mob-tf-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="mob-tf-label">Secure<br />checkout</div>
            </div>
            <div className="mob-tf-item">
              <div className="mob-tf-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="mob-tf-label">COA<br />included</div>
            </div>
            <div className="mob-tf-item">
              <div className="mob-tf-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="mob-tf-label">2-3 day<br />shipping</div>
            </div>
            <div className="mob-tf-item">
              <div className="mob-tf-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="mob-tf-label">Research<br />use only</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
