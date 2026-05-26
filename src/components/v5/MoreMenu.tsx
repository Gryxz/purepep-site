/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect } from "react";
import { ACCOUNT_HREF } from "@/content/nav";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Mobile "more" navigation drawer — opened by the hamburger icon in
 * MobileShell's header. Slides in from the right with the same overlay
 * + transform mechanics as the cart drawer. Bone-on-ink visual language
 * matching the rest of the v5 mobile chrome.
 *
 * Sections (designed from scratch — no mockup exists for this surface):
 *   - Navigation: Shop / Quality / Documentation / Affiliate / Contact
 *   - Account:    Sign in (placeholder until auth lands)
 *   - Support:    Researcher access / View all COAs
 *   - Legal:      Terms · Privacy · Refund · Shipping (mono inline links)
 *   - Compliance footer
 */
export function MoreMenu({ open, onClose }: Props) {
  // Lock body scroll while open so the menu doesn't fight the page.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`mob-more-overlay${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`mob-more${open ? " is-open" : ""}`} aria-label="Menu" aria-hidden={!open}>
        <header className="mob-more-hdr">
          <span className="mob-more-title">Menu</span>
          <button
            type="button"
            className="mob-more-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="mob-more-scroll">
          <section className="mob-more-section">
            <div className="mob-more-eyebrow">Navigation</div>
            <a href="/shop" className="mob-more-link" onClick={onClose}>
              <span>Shop all peptides</span>
              <span className="arr">→</span>
            </a>
          </section>

          <section className="mob-more-section">
            <div className="mob-more-eyebrow">Account</div>
            <a href="/cart" className="mob-more-link" onClick={onClose}>
              <span>View cart</span>
              <span className="arr">→</span>
            </a>
          </section>

          <section className="mob-more-section">
            <div className="mob-more-eyebrow">Support</div>
            <a href="/contact" className="mob-more-link" onClick={onClose}>
              <span>Contact us</span>
              <span className="arr">→</span>
            </a>
            <a href="/faq" className="mob-more-link" onClick={onClose}>
              <span>FAQ</span>
              <span className="arr">→</span>
            </a>
          </section>

          <section className="mob-more-section">
            <div className="mob-more-eyebrow">Legal</div>
            <div className="mob-more-legal">
              <a href="/terms-of-service" onClick={onClose}>
                Terms
              </a>
              <a href="/privacy-policy" onClick={onClose}>
                Privacy
              </a>
              <a href="/refund-policy" onClick={onClose}>
                Refund
              </a>
              <a href="/shipping-policy" onClick={onClose}>
                Shipping
              </a>
              <a href="/disclaimer" onClick={onClose}>
                Disclaimer
              </a>
            </div>
          </section>
        </div>

        <footer className="mob-more-foot">
          For research use only · 21+ qualified researchers
          <br />
          info@purepep.shop
        </footer>
      </aside>
    </>
  );
}
