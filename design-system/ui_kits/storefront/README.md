# PurePep Storefront — UI Kit

A high-fidelity recreation of the PurePep WooCommerce storefront, rebuilt as React components so the rest of the system can compose pages quickly.

## Scope

- **Site chrome** — sticky header, RUO compliance ribbon, footer
- **RETA product detail page** — gallery, buy box, COA panel, compliance blocks, related products
- **Cart drawer** — slide-in from right, with line item, totals, no-refund acknowledgement

This is a **visual + interaction** recreation. WooCommerce specifics (variants, tax, shipping calc) are stubbed. The design is the deliverable.

## Pages

| File | Route intent |
|---|---|
| `index.html` | RETA product detail page |
| `home.html` | Homepage (hero, category rails, quality strip, compliance band) |
| `catalog.html` | Catalog index with filters |
| `age-gate.html` | Sitewide 21+ / qualified-researcher gate (first visit, 30-day localStorage) |
| `checkout.html` | Single-page Contact → Shipping → Payment checkout |

## Files

| File | Purpose |
|---|---|
| `index.html` | Boots the kit — renders the RETA product page with the cart drawer wired up. |
| `Header.jsx` | Compliance ribbon + sticky main nav with cart. |
| `Footer.jsx` | Carbon-hold footer with brand mark + compliance copy. |
| `ProductGallery.jsx` | Vial photo + thumbnails (placeholders rendered as labeled vials). |
| `BuyBox.jsx` | Title, price, qty, primary CTA, no-refund acknowledgement. |
| `ComplianceBlock.jsx` | Reusable RUO / no-refund callouts. |
| `COAPanel.jsx` | Certificate-of-analysis spec table, mono. |
| `RelatedRail.jsx` | Two-up product card rail. |
| `CartDrawer.jsx` | Slide-in cart with totals + acknowledgement. |
| `Primitives.jsx` | `Button`, `Pill`, `Eyebrow`, `Hairline`, `Icon`. |

## Notes

- Icons use inline SVG copies of Lucide paths (no runtime dependency).
- The "vial photo" is a stylized SVG placeholder. Real product photography goes here when shot — see VISUAL FOUNDATIONS in the root README for shot specs.
