# Bankful verification checklist

This branch adds the content PurePep needs to pass a Bankful merchant verification. PurePep sits in a high-risk MCC (research peptides), so Bankful applies the underwriting checklist they use for nutraceuticals / supplements / RC sellers: policies, disclosures, contact, identity, and checkout transparency.

Everything here is **portable markdown**. It can be:

- pasted into WordPress pages via wp-sync,
- mounted into the Next.js storefront (`claude/headless-v2-wc-api-CIsh1`) as MDX routes,
- attached directly to the Bankful application.

---

## 1. Required surfaces — what Bankful looks for and where it lives

| Requirement | File | Where it must appear on the live site |
|---|---|---|
| Terms of Sale | `content/legal/terms-of-sale.md` | `/terms-of-sale`, footer, linked above the "Place order" button |
| Privacy Policy | `content/legal/privacy-policy.md` | `/privacy-policy`, footer, linked above the "Place order" button |
| Refund / Return Policy | `content/legal/refund-policy.md` | `/refund-policy`, footer, every PDP, cart, checkout |
| Shipping Policy | `content/legal/shipping-policy.md` | `/shipping-policy`, footer, checkout |
| Cookie Notice | `content/legal/cookie-notice.md` | `/cookie-notice`, footer, banner on first visit |
| About / company info | `content/pages/about.md` | `/about`, link in footer |
| Contact | `content/pages/contact.md` | `/contact`, link in footer and in header |
| FAQ | `content/pages/faq.md` | `/faq`, link in footer |
| Checkout disclosures | `content/checkout/checkout-disclosures.md` | Cart page, checkout page, order-receipt email, shipment-confirmation email |
| Business info block | `content/checkout/business-info.md` | Footer, contact page, transactional emails |

## 2. Compliance language — already enforced in the storefront

The three Bankful-relevant compliance strings are locked in `@design/tokens` on `claude/headless-v2-wc-api-CIsh1` and verified by `scripts/check-tokens-fence.ts` so they cannot be paraphrased:

- "For research use only. Not for human consumption."
- "Sales restricted to qualified researchers, 21 and over."
- "All sales final. No refunds, no exchanges, no returns."

All policy and content files in this branch use these strings verbatim where they appear.

## 3. Visible business identity — required everywhere

Bankful underwriting requires the customer to be able to identify the merchant from any page:

- Legal entity name (matching the underwriting application).
- Physical business address (not a PO box).
- Customer-service email on the same domain as the website.
- Customer-service phone number, answered or with same-business-day callback.
- Stated business hours.

These belong in the footer and in transactional email. See `content/checkout/business-info.md`.

## 4. Checkout transparency — required at the order-total panel

- Subtotal, shipping, tax, total, all in **USD**.
- Single charge — no hidden subscriptions or recurring billing.
- Billing descriptor (`{{BILLING_DESCRIPTOR}}`) shown on receipt and email, identical to what appears on the cardholder statement.
- Visible accepted-card marks (Visa / Mastercard / Amex / Discover, whichever Bankful enables).
- Links to Terms, Privacy, Shipping, Refund directly above the "Place order" button.
- Age-and-research affirmation directly above the "Place order" button.

See `content/checkout/checkout-disclosures.md`.

## 5. Restricted-product handling

- Age gate before catalog access (`/age-gate` already exists in the storefront).
- Researcher-verification flow before checkout (`/researcher-access` already exists).
- Compliance block on every PDP, cart, and checkout (`ComplianceBlock` already exists).

## 6. Operational requirements outside the codebase

These can't be fixed by content — call them out for the operator before submitting to Bankful:

- [ ] SSL certificate active on the production domain. Verify with `curl -vI https://{{SITE_URL}}`.
- [ ] Domain WHOIS matches the legal entity, or privacy-protected with verifiable owner records.
- [ ] Customer-service phone number is live during stated hours.
- [ ] Customer-service email is monitored, replied within one business day.
- [ ] Returns / refund team can process the limited exceptions (damage, loss) within seven business days.
- [ ] Chargeback response process is in place; order, tracking, COA, and signed-delivery records retained.
- [ ] Order confirmation and shipment confirmation emails are sent and include the disclosures in `content/checkout/checkout-disclosures.md`.
- [ ] Billing descriptor matches the value displayed in checkout disclosures.

---

## Placeholders to fill in before publishing

Search-and-replace these across `content/` before publishing or syncing to WordPress. Do **not** ship the site with placeholders visible — Bankful will reject.

| Placeholder | What to put in |
|---|---|
| `{{LEGAL_ENTITY}}` | Full legal entity name on the Bankful application |
| `{{SITE_URL}}` | Production URL, e.g. `https://purepep.com` |
| `{{BUSINESS_ADDRESS}}` | Street, city, state, ZIP — physical, not a PO box |
| `{{SUPPORT_EMAIL}}` | Customer service email on the site's domain |
| `{{SUPPORT_PHONE}}` | Customer service phone |
| `{{SUPPORT_HOURS}}` | e.g. `9:00–17:00` |
| `{{SUPPORT_TZ}}` | e.g. `ET` |
| `{{PRIVACY_EMAIL}}` | Email for privacy / data requests |
| `{{VERIFICATION_EMAIL}}` | Researcher-verification inbox |
| `{{PRESS_EMAIL}}` | Press / partnerships inbox |
| `{{BILLING_DESCRIPTOR}}` | Exact descriptor configured at Bankful, e.g. `PUREPEP RESEARCH` |
| `{{CUTOFF_TIME}}` | Same-day ship cutoff, e.g. `2:00 PM` |
| `{{VM_CUTOFF}}` | Voicemail same-day return cutoff, e.g. `3:00 PM` |
| `{{GOVERNING_STATE}}` | State whose law governs Terms of Sale |
| `{{VENUE_COUNTY}}` | County for venue clause |
| `{{FOUNDED_YEAR}}` | Year founded |
| `{{FORMATION_STATE}}` | State of incorporation / LLC formation |

A quick sanity check before submission:

```sh
grep -RIn '{{' content/ BANKFUL-CHECKLIST.md
```

The command should return zero matches before going live.
