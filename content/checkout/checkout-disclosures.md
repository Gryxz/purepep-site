---
slug: checkout-disclosures
title: Checkout disclosures (snippets for cart, checkout, and order receipt)
updated: 2026-05-13
---

# Checkout disclosures

Short pieces of copy that must appear on the cart page, the checkout page, and the order-receipt email. They satisfy Bankful's checkout-transparency requirements for high-risk merchants.

Use the strings verbatim. Compliance lines come from `@design/tokens` in the Next.js storefront — never hand-type them in code.

## 1. Above the "Place order" button

> **By placing this order you confirm you are 21 or over, that the product will be used for laboratory research only, and that you have read and agree to our [Terms of Sale]({{SITE_URL}}/terms-of-sale), [Privacy Policy]({{SITE_URL}}/privacy-policy), [Shipping Policy]({{SITE_URL}}/shipping-policy), and [Refund Policy]({{SITE_URL}}/refund-policy).**
>
> All sales final. No refunds, no exchanges, no returns.
>
> Your card will be charged in U.S. Dollars (USD). The descriptor on your statement will appear as **{{BILLING_DESCRIPTOR}}**.

## 2. Order total panel

Display the following lines in this order so the customer sees exactly what is charged:

- Subtotal — sum of line items in USD.
- Shipping — calculated by destination, in USD.
- Sales tax — calculated by destination, in USD.
- **Total charged today** — USD.
- "You will be charged once. There are no recurring charges or subscriptions."

## 3. Accepted payment methods

Place the brand marks for the methods accepted by the processor near the order-total panel and in the footer:

- Visa
- Mastercard
- American Express
- Discover

Replace this list with the exact set enabled by Bankful before going live.

## 4. Customer service strip

A persistent strip on the checkout page:

> Questions before you order? {{SUPPORT_EMAIL}} · {{SUPPORT_PHONE}} · Monday–Friday, {{SUPPORT_HOURS}} {{SUPPORT_TZ}}.

## 5. Order-confirmation email

The receipt email must include:

- Order number and date.
- Full line-item listing with unit price and quantity.
- Subtotal, shipping, tax, and total — all in USD.
- The billing descriptor that will appear on the customer's statement.
- Shipping address and estimated delivery window.
- Customer service contact: {{SUPPORT_EMAIL}} · {{SUPPORT_PHONE}} · hours.
- Links to Terms of Sale, Privacy Policy, Shipping Policy, and Refund Policy.
- The three compliance lines:
  - For research use only. Not for human consumption.
  - Sales restricted to qualified researchers, 21 and over.
  - All sales final. No refunds, no exchanges, no returns.
- The legal entity name and business address.

## 6. Shipment confirmation email

When the carrier picks up the package the customer must receive:

- Order number, ship date, carrier, tracking number, and tracking URL.
- Reminder to inspect on arrival and to report damage within 72 hours to {{SUPPORT_EMAIL}}.
- Storage instructions for the product class shipped.
