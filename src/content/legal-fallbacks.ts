/**
 * In-file fallback policy bodies for /legal/* — TEMPORARY.
 *
 * Ship as the live policy text whenever the WP mirror in
 * lib/wp-pages.ts can't reach the upstream WP install (no
 * WC_BASE_URL secret / missing WP page / non-2xx response).  They
 * supersede the old generic "page temporarily unavailable" stub so
 * legal pages aren't blank while WordPress is being set up.
 *
 * These are PLACEHOLDER drafts — operator-reviewed, not
 * attorney-reviewed.  Once WP has all six policy slugs published,
 * those WP pages take over automatically (mirror is attempted on
 * every build).  Flip WP_MIRROR_STRICT back to "1" in
 * .github/workflows/deploy.yml once you want missing/broken
 * upstream to FAIL the build instead of silently using these.
 *
 * Compliance copy is imported from @design/tokens (per the token
 * fence) so the locked strings can never drift in this file:
 *   compliance.researchUseOnly
 *   compliance.qualified21
 *   compliance.noRefunds
 *
 * HTML is rendered through sanitize-html via the allowlist in
 * lib/wp-pages.ts.
 */

import { compliance } from "@design/tokens";

const SUPPORT_LINKS =
  '<a href="mailto:info@purepep.shop">info@purepep.shop</a> · ' +
  '<a href="tel:+18662126466">(866) 212-6466</a> · ' +
  '<a href="/contact">support portal</a>';

export interface PolicyFallback {
  title: string;
  contentHtml: string;
}

export const LEGAL_FALLBACKS: Record<string, PolicyFallback> = {
  "refund-policy": {
    title: "Refund Policy",
    contentHtml: `
      <p><strong>${compliance.noRefunds}</strong></p>
      <p>PurePep peptides are research materials sold strictly for in vitro laboratory research. Once an order leaves our facility the product is considered consumed for research purposes and is not eligible for return or refund.</p>

      <h2>Damaged or lost shipments</h2>
      <p>If a package arrives damaged or never arrives at the address on file, we will replace the order at no charge. Email <a href="mailto:info@purepep.shop">info@purepep.shop</a> or call <a href="tel:+18662126466">(866) 212-6466</a> within 14 days of the expected delivery date and quote your order number.</p>

      <h2>Order cancellation</h2>
      <p>Orders may be cancelled before they ship — typically within one hour of placement. Once a shipment label has been generated and the package has left our facility, the order is final.</p>

      <h2>Lot quality concerns</h2>
      <p>Every order ships with a lot-matched Certificate of Analysis. If our published analytical specifications are not met for a given lot, contact us and we will issue a replacement from the next qualified batch.</p>

      <h2>Contact</h2>
      <p>Questions about a return or replacement: ${SUPPORT_LINKS}. Support hours: Mon–Fri 9:00–17:00, reply within one business day.</p>
    `.trim(),
  },

  "terms-of-service": {
    title: "Terms of Service",
    contentHtml: `
      <p>By purchasing from PurePep you confirm you are a qualified researcher aged 21 or older, and that any product purchased will be used exclusively for in vitro laboratory research.</p>

      <h2>Eligibility</h2>
      <p>${compliance.qualified21} PurePep verifies researcher eligibility at checkout where required. You agree to provide accurate information at checkout and not to resell, redistribute, or transfer product to any party for human or veterinary application.</p>

      <h2>Product use</h2>
      <p>${compliance.researchUseOnly} PurePep products are not approved by the FDA or any other regulatory body for human or veterinary use, and are not intended to diagnose, treat, cure, or prevent any disease. Use in humans, food, or supplements is strictly prohibited.</p>

      <h2>Orders and pricing</h2>
      <p>Prices are listed in US dollars. We reserve the right to change pricing, modify the catalogue, or correct errors at any time. Order acknowledgement is not a binding acceptance until the order has shipped.</p>

      <h2>Intellectual property</h2>
      <p>All site content — text, photography, labels, and analytical methods documentation — is the property of PurePep. Reproduction without written permission is prohibited.</p>

      <h2>Limitation of liability</h2>
      <p>PurePep's liability for any product is limited to the purchase price of that product. We are not liable for incidental, consequential, or punitive damages arising from product use, misuse, or storage outside published parameters.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the state in which PurePep is incorporated. Any dispute shall be resolved in the courts of that state.</p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms at any time. Continued use of the site constitutes acceptance of the current version.</p>

      <h2>Contact</h2>
      <p>Questions about these terms: ${SUPPORT_LINKS}.</p>
    `.trim(),
  },

  "privacy-policy": {
    title: "Privacy Policy",
    contentHtml: `
      <p>This Privacy Policy describes how PurePep collects, uses, and shares information when you visit purepep.shop or place an order.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Order information</strong> — name, shipping address, billing address, email, phone, and items ordered.</li>
        <li><strong>Account information</strong> — credentials, researcher verification details, and order history when you create an account.</li>
        <li><strong>Technical information</strong> — IP address, browser, device, pages visited, and referring source, collected automatically through cookies and standard server logs.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>Fulfill orders, ship product, and issue Certificates of Analysis.</li>
        <li>Verify researcher eligibility where required.</li>
        <li>Respond to support requests.</li>
        <li>Prevent fraud, abuse, and unauthorised access.</li>
        <li>Improve the site and the catalogue.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>We do not sell your information. We share order details with shipping carriers, payment processors, and qualified service providers strictly as needed to fulfill your order. We may disclose information when required by law or to protect the rights and safety of PurePep, our researchers, or the public.</p>

      <h2>Cookies</h2>
      <p>We use cookies for session management, cart state, analytics, and fraud prevention. Essential cookies cannot be disabled; non-essential cookies can be declined via the cookie banner.</p>

      <h2>Retention</h2>
      <p>Order records are retained for the period required by applicable tax, accounting, and compliance regulations. You may request deletion of personal data not subject to a retention obligation.</p>

      <h2>Your rights</h2>
      <p>Depending on your jurisdiction you may have the right to access, correct, delete, or port your personal information, or to opt out of certain processing. To exercise any right contact <a href="mailto:info@purepep.shop">info@purepep.shop</a>.</p>

      <h2>Researchers under 21</h2>
      <p>This site and the products sold here are not intended for individuals under the age of 21. We do not knowingly collect information from anyone under 21. ${compliance.qualified21}</p>

      <h2>Updates</h2>
      <p>This policy may be updated. Continued use of the site after changes constitutes acceptance of the revised policy.</p>

      <h2>Contact</h2>
      <p>Privacy questions: ${SUPPORT_LINKS}.</p>
    `.trim(),
  },

  "shipping-policy": {
    title: "Shipping Policy",
    contentHtml: `
      <p>PurePep ships within the United States only. Every order ships with a lot-matched Certificate of Analysis.</p>

      <h2>Dispatch</h2>
      <p>Orders placed before 12:00 ET Mon–Fri ship the same business day. Orders placed later ship the next business day. Weekend orders are dispatched Monday.</p>

      <h2>Transit time</h2>
      <p>Standard tracked shipping arrives in 2–3 business days for most US addresses. A tracking number is emailed once the carrier collects the package.</p>

      <h2>Packaging</h2>
      <p>Lyophilized peptides are stable at room temperature in transit and ship in discreet, unbranded packaging. No signature is required for delivery unless requested at checkout.</p>

      <h2>Shipping costs</h2>
      <p>Standard US shipping is calculated at checkout based on weight. Orders over $200 ship free.</p>

      <h2>International orders</h2>
      <p>PurePep does not currently ship outside the United States.</p>

      <h2>Damaged or lost in transit</h2>
      <p>If a package arrives damaged or never arrives at the address on file, we will replace the order at no charge — see our <a href="/legal/refund-policy">Refund Policy</a> for details.</p>

      <h2>Storage on receipt</h2>
      <p>Store lyophilized peptides at 2–8 °C, protected from light, until reconstitution. Reconstituted product is stable 30+ days refrigerated.</p>

      <h2>Contact</h2>
      <p>Shipping questions: ${SUPPORT_LINKS}.</p>
    `.trim(),
  },

  disclaimer: {
    title: "Disclaimer",
    contentHtml: `
      <p><strong>${compliance.researchUseOnly}</strong></p>
      <p>All products sold by PurePep are intended exclusively for in vitro laboratory research by qualified researchers. They are not drugs, food, or supplements, and they have not been approved by the FDA or any other regulatory body for human or veterinary use.</p>

      <h2>Not medical advice</h2>
      <p>Nothing on this website constitutes medical, scientific, or professional advice. Product descriptions reflect published research literature and analytical specifications — they are not therapeutic claims. Consult qualified professionals for medical, regulatory, or research-design questions.</p>

      <h2>Prohibited uses</h2>
      <p>You may not use PurePep products for human consumption, human application, veterinary application, or in any food or supplement. You may not resell, redistribute, or transfer product to any party for those purposes.</p>

      <h2>Research-use-only acknowledgement</h2>
      <p>By purchasing, you confirm you are a qualified researcher, 21 or older, and that any product purchased will be used exclusively for in vitro laboratory research. ${compliance.qualified21}</p>

      <h2>No therapeutic claims</h2>
      <p>PurePep makes no claims that any product diagnoses, treats, cures, or prevents any disease, condition, or symptom.</p>

      <h2>Contact</h2>
      <p>Questions: ${SUPPORT_LINKS}.</p>
    `.trim(),
  },

  contact: {
    title: "Contact",
    contentHtml: `
      <p>Reach the PurePep research team through our <a href="/contact">support portal</a>, by email at <a href="mailto:info@purepep.shop">info@purepep.shop</a>, or by phone at <a href="tel:+18662126466">(866) 212-6466</a>.</p>

      <h2>Hours</h2>
      <p>Mon–Fri · 9:00–17:00. Reply within one business day.</p>

      <h2>Order issues</h2>
      <p>Quote your order or lot number for the fastest resolution. Tracking is in your confirmation email.</p>
    `.trim(),
  },
};
