/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * v5 mobile footer — used on Home / Shop / PDP / CartPage.
 * Cart drawer + checkout intentionally render their own bottom-of-screen
 * trust rows instead of the full footer (per the mobile mockups).
 */
export function MobileFooter() {
  return (
    <footer className="mob-foot">
      <div className="mob-foot-section">
        <div className="mob-foot-h">Catalog</div>
        <a href="/shop" className="mob-foot-link">Shop all peptides</a>
        <a href="/documentation" className="mob-foot-link">View all COAs</a>
        <a href="/affiliates" className="mob-foot-link">Affiliate program</a>
      </div>
      <div className="mob-foot-section">
        <div className="mob-foot-h">Legal</div>
        <a href="/legal/terms-of-service" className="mob-foot-link">Terms of Service</a>
        <a href="/legal/refund-policy" className="mob-foot-link">Refund Policy</a>
        <a href="/legal/shipping-policy" className="mob-foot-link">Shipping Policy</a>
        <a href="/legal/privacy-policy" className="mob-foot-link">Privacy Policy</a>
      </div>
      <div className="mob-foot-section">
        <div className="mob-foot-h">Contact</div>
        <div className="mob-foot-text">info@purepep.shop</div>
        <a href="/legal/contact" className="mob-foot-link">Contact us</a>
      </div>
      <div className="mob-foot-divider" />
      <div className="mob-foot-secure"><span>Secure Checkout</span></div>
      <div className="mob-foot-pay">
        <span className="mob-pay-badge">VISA</span>
        <span className="mob-pay-badge">MC</span>
        <span className="mob-pay-badge is-amex">AMEX</span>
        <span className="mob-pay-badge">DISCOVER</span>
        <span className="mob-pay-badge is-dark">Pay</span>
      </div>
      <div className="mob-foot-disc">
        For research use only · Not for human consumption.
        <br />© {new Date().getFullYear()} PurePep
      </div>
    </footer>
  );
}
