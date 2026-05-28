"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore, useCartCount } from "@/lib/cart-store";
import { RetaVialMini } from "@/components/v3/RetaVialMini";
import {
  FREE_SHIP_THRESHOLD,
  CART_EMPTY_TITLE,
  CART_EMPTY_SUB,
} from "@/content/cart";

export function CartDrawer() {
  const { items: allItems, isOpen, closeCart, updateQty, removeItem, subtotal } =
    useCartStore();

  const [mounted, setMounted] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoVal, setPromoVal]   = useState("");

  useEffect(() => setMounted(true), []);

  const items = mounted ? allItems : [];
  const sub   = mounted ? subtotal() : 0;
  const count = useCartCount();
  const pct   = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const remaining     = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const freeShipUnlocked = sub >= FREE_SHIP_THRESHOLD;

  return (
    <>
      {/* scrim */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className="cdr-scrim"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className="cdr-panel"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* ── header ── */}
        <header className="cdr-hdr">
          <div className="cdr-hdr-left">
            <span className="cdr-hdr-title">Your cart</span>
            {count > 0 && (
              <span className="cdr-hdr-badge" aria-live="polite">{count}</span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="cdr-hdr-close"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* ── free-ship bar ── */}
        {items.length > 0 && (
          <div className="cdr-shipbar">
            <div className="cdr-shipbar-row">
              <span className={`cdr-shipbar-text${freeShipUnlocked ? " is-unlocked" : ""}`}>
                {freeShipUnlocked ? (
                  <><span className="cdr-shipbar-check">✓</span> Free shipping unlocked</>
                ) : (
                  <>Add <strong>${remaining.toFixed(0)}</strong> for free shipping</>
                )}
              </span>
              <span className="cdr-shipbar-pct">{freeShipUnlocked ? "" : `${Math.round(pct)}%`}</span>
            </div>
            <div className="cdr-shipbar-track">
              <div className="cdr-shipbar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* ── items ── */}
        <div className="cdr-items">
          {items.length === 0 ? (
            <div className="cdr-empty">
              <div className="cdr-empty-icon" aria-hidden="true">
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="cdr-empty-title">{CART_EMPTY_TITLE}</p>
              <p className="cdr-empty-sub">{CART_EMPTY_SUB}</p>
              <Link href="/shop" onClick={closeCart} className="cdr-empty-cta">
                Browse catalog
              </Link>
            </div>
          ) : (
            <ul className="cdr-item-list">
              {items.map((item) => {
                const lineTotal  = item.price * item.qty;
                return (
                  <li key={item.slug + item.dose} className="cdr-item">
                    {/* thumbnail */}
                    <div className="cdr-item-thumb">
                      <RetaVialMini compound={item.compound} />
                    </div>

                    {/* body */}
                    <div className="cdr-item-body">
                      <div className="cdr-item-top">
                        <div>
                          <div className="cdr-item-name">{item.name}</div>
                          <div className="cdr-item-meta">{item.dose} · Lyophilized</div>
                          <div className="cdr-item-unit">${item.price.toFixed(2)} / vial</div>
                        </div>
                        <div className="cdr-item-total">${lineTotal.toFixed(2)}</div>
                      </div>

                      <div className="cdr-item-bottom">
                        {/* stepper */}
                        <div className="cdr-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="cdr-stepper-btn"
                            onClick={() => updateQty(item.slug, item.qty - 1)}
                          >
                            −
                          </button>
                          <span className="cdr-stepper-num">{item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="cdr-stepper-btn"
                            onClick={() => updateQty(item.slug, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cdr-item-remove"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.slug)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── footer ── */}
        {items.length > 0 && (
          <div className="cdr-footer">
            {/* promo toggle */}
            <button
              type="button"
              className="cdr-promo-toggle"
              onClick={() => setPromoOpen((p) => !p)}
              aria-expanded={promoOpen}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Have a promo or referral code?
              <svg
                className={`cdr-promo-chevron${promoOpen ? " is-open" : ""}`}
                width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {promoOpen && (
              <div className="cdr-promo-field">
                <input
                  type="text"
                  className="cdr-promo-input"
                  placeholder="Enter code"
                  value={promoVal}
                  onChange={(e) => setPromoVal(e.target.value)}
                  aria-label="Promo or referral code"
                />
                <button type="button" className="cdr-promo-apply">Apply</button>
              </div>
            )}

            {/* totals */}
            <div className="cdr-totals">
              <div className="cdr-totals-row">
                <span className="cdr-totals-label">Subtotal</span>
                <span className="cdr-totals-value">${sub.toFixed(2)}</span>
              </div>
              <div className="cdr-totals-note">Taxes &amp; shipping calculated at checkout</div>
            </div>

            {/* CTAs */}
            <Link href="/checkout" onClick={closeCart} className="cdr-cta-primary">
              Checkout
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/cart" onClick={closeCart} className="cdr-cta-secondary">
              View cart &amp; edit
            </Link>

            {/* trust strip */}
            <div className="cdr-trust">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure checkout</span>
              <span className="cdr-trust-sep" aria-hidden="true">·</span>
              <span>SSL encrypted</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
