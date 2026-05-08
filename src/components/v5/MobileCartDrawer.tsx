/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { getProduct } from "@/data/products.static";
import { MobileVial } from "./MobileVial";

const FREE_SHIP_THRESHOLD = 200;
const UPSELL_SLUG = "bpc-157";

/**
 * v5 mobile cart drawer — slide-in from right.  Driven by the same
 * useCartStore the rest of the storefront uses (isOpen / openCart /
 * closeCart / items / updateQty / removeItem).  Mounted in layout.tsx
 * inside .mob-only so the existing v3 desktop CartDrawer continues to
 * serve viewports >768px.
 */
export function MobileCartDrawer() {
  const pathname = usePathname();
  const { items, isOpen, closeCart, updateQty, removeItem, addItem, subtotal } = useCartStore();
  const [promoOpen, setPromoOpen] = useState(false);
  const [shipBarHidden, setShipBarHidden] = useState(false);
  const sub = subtotal();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const unlocked = sub >= FREE_SHIP_THRESHOLD;

  // Body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Esc to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  // Auto-hide the free-ship bar once unlocked.  Brief celebration window
  // (1.8s) so the user sees the "✓ unlocked" state, then the bar slides
  // out to reclaim the precious vertical real estate.  If they later drop
  // below the threshold (remove items / change qty), the bar reappears.
  useEffect(() => {
    if (!unlocked) {
      setShipBarHidden(false);
      return;
    }
    const t = setTimeout(() => setShipBarHidden(true), 1800);
    return () => clearTimeout(t);
  }, [unlocked]);

  // Suppress the entire drawer on the age-gate (no cart access until verified).
  if (pathname === "/age-gate") return null;

  // Upsell candidate: BPC-157 if it exists in catalog AND isn't already in cart.
  const upsellProduct = getProduct(UPSELL_SLUG);
  const upsellInCart = items.some((i) => i.slug === UPSELL_SLUG);
  const showUpsell = !!upsellProduct && !upsellInCart && items.length > 0;

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
    <>
      <div
        className={`mob-cart-overlay${isOpen ? " is-open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`mob-cart-drawer${isOpen ? " is-open" : ""}`}
        aria-label="Cart"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <header className="mob-cart-hdr">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="mob-cart-title">Cart</span>
            <span className="mob-cart-count-badge">{count}</span>
          </div>
          <button type="button" className="mob-cart-close" onClick={closeCart} aria-label="Close cart">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Free-ship progress bar (only when there are items, auto-hides
            after the unlock celebration window — see effect above) */}
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

        {/* Items + promo + upsell */}
        <div className="mob-cart-items">
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
              <a href="/shop" className="mob-cart-empty-btn" onClick={closeCart}>
                Browse catalog →
              </a>
            </div>
          ) : (
            <>
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
                      <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(item.slug, item.qty - 1)}>
                        −
                      </button>
                      <span className="sv">{item.qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.slug, item.qty + 1)}>
                        +
                      </button>
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
            </>
          )}
        </div>

        {/* Order summary (only when items present) */}
        {items.length > 0 && (
          <div className="mob-order-summary">
            {/* Promo code — moved here from inside the items list, replaces
                the old Items / Subtotal / Shipping rows. */}
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
            <div className="mob-order-row is-total">
              <span className="ok">Total</span>
              <span className="ov">
                ${sub.toFixed(2)}
                {unlocked && (
                  <span className="mob-order-ship-note"> · Free shipping</span>
                )}
              </span>
            </div>
            <div className="mob-order-note">Taxes calculated at checkout · All sales final</div>
          </div>
        )}

        {/* CTAs */}
        <div className="mob-cart-ctas">
          {items.length > 0 && (
            <a href="/checkout" className="mob-cta-amber-base mob-cta-checkout" onClick={closeCart}>
              Continue to checkout
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          )}
          {items.length > 0 ? (
            <a href="/cart" className="mob-cta-view" onClick={closeCart}>View cart</a>
          ) : null}
        </div>

        {/* Trust row */}
        {items.length > 0 && (
          <div className="mob-cart-trust">
            <div className="ti">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secure
            </div>
            <div className="ti">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              COA included
            </div>
            <div className="ti">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              2-3 day ship
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
