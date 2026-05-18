"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { RetaVialMini } from "@/components/v3/RetaVialMini";
import {
  FREE_SHIP_THRESHOLD,
  CART_EMPTY_TITLE,
  CART_EMPTY_SUB,
} from "@/content/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, subtotal, totalItems } =
    useCartStore();

  const sub = subtotal();
  const count = totalItems();
  const pct = Math.min(100, (sub / FREE_SHIP_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - sub);
  const freeShipUnlocked = sub >= FREE_SHIP_THRESHOLD;

  return (
    <>
      {/* dim overlay */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className="v3drawer-scrim"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* slide-in panel */}
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className="v3drawer"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* header */}
        <header className="v3drawer-hdr">
          <div className="v3drawer-hdr-left">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="v3drawer-hdr-label">
              Cart{" "}
              <span className="v3drawer-hdr-count">
                · {count} {count === 1 ? "item" : "items"}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="v3drawer-close"
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* free-ship bar */}
        {items.length > 0 && (
          <div className="v3drawer-shipbar">
            <div className="v3drawer-shipbar-row">
              <span className={`v3drawer-shipbar-text${freeShipUnlocked ? " is-unlocked" : ""}`}>
                {freeShipUnlocked ? (
                  <>
                    Free shipping unlocked
                  </>
                ) : (
                  <>
                    Add <strong>${remaining.toFixed(2)}</strong> more for free shipping
                  </>
                )}
              </span>
              <span className="v3drawer-shipbar-pct">
                {freeShipUnlocked ? "✓" : `${Math.round(pct)}%`}
              </span>
            </div>
            <div className="v3drawer-shipbar-track">
              <div className="v3drawer-shipbar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* items */}
        <div className="v3drawer-items">
          {items.length === 0 ? (
            <div className="v3drawer-empty">
              <p className="v3drawer-empty-title">{CART_EMPTY_TITLE}</p>
              <p className="v3drawer-empty-sub">{CART_EMPTY_SUB}</p>
            </div>
          ) : (
            items.map((item) => {
              const lineTotal = item.price * item.qty;
              return (
                <div key={item.slug + item.dose} className="v3drawer-item">
                  <div className="v3drawer-item-thumb">
                    <RetaVialMini compound={item.compound} />
                  </div>
                  <div className="v3drawer-item-body">
                    <div className="v3drawer-item-top">
                      <div className="v3drawer-item-name">{item.name}</div>
                      <button
                        type="button"
                        className="v3drawer-item-remove"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.slug)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="v3drawer-item-meta">{item.dose} · Lyophilized</div>
                    <div className="v3drawer-item-bottom">
                      <div className="v3drawer-stepper" role="group" aria-label="Quantity">
                        <button
                          type="button"
                          aria-label="Decrease"
                          onClick={() => updateQty(item.slug, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="v3drawer-stepper-num">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          onClick={() => updateQty(item.slug, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="v3drawer-item-total">${lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="v3drawer-footer">
            <div className="v3drawer-subtotal">
              <span className="v3drawer-subtotal-label">Subtotal</span>
              <span className="v3drawer-subtotal-value">${sub.toFixed(2)}</span>
            </div>
            <div className="v3drawer-subtotal-note">
              Taxes &amp; shipping calculated at checkout
            </div>
            <Link href="/cart" onClick={closeCart} className="v3drawer-cta-secondary">
              View cart
            </Link>
            <Link href="/checkout" onClick={closeCart} className="v3drawer-cta-primary">
              Continue to checkout
              <svg
                width="13"
                height="13"
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
        )}
      </aside>
    </>
  );
}
