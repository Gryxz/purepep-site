# PUREPEP_MOBILE_OPTIMIZATION_V1

Mobile-first optimization brief for the PurePep Next.js storefront.

## Goals

- Decision-density above fold on every page
- DOM may diverge from desktop where needed
- 44 px minimum touch targets throughout
- Sticky bottom CTA on PDP and checkout
- LCP ≤ 1.5 s on Slow 4G
- Lighthouse Mobile ≥ 90

## Breakpoints

| Token | Width | Notes |
|---|---|---|
| base | 0 – 639 px | Mobile single-column |
| sm | 640 px | Tablet portrait |
| md | 768 px | Tablet landscape / small laptop |
| lg | 1024 px | Desktop |

## Layout container

- Mobile gutter: 16 px
- Desktop gutter: 24 px (existing `--gutter`)

## Segment plan

### S1 — Global mobile foundation
- `layout-content`: drop gutter to 16 px below 640 px
- Header: hamburger button + full-screen nav overlay on mobile
- UtilityStrip: condensed single-line on mobile
- Footer: accordion collapse per column on mobile

### S2 — PDP mobile
- BuyBox: product name / price / stock / CTA all visible above fold on iPhone SE (375 px)
- `StickyBuyBar`: fixed bottom bar that appears after user scrolls past the CTA
- COAPanel: tabs → accordion on mobile

### S3 — Home + Catalog
- Hero: single-column, image below copy on mobile
- FeaturedRail: vertical stack (1-col) on mobile
- WhyGrid (4-col stats): 2×2 grid on mobile
- ValueProps (3-col): single column on mobile
- Catalog grid: 1-col on mobile, 2-col on sm

### S4 — Cart + Checkout + Age Gate
- Cart: order summary moves below items on mobile
- Checkout: single-column form, sticky bottom “Place order” bar
- Age gate: full-screen centered, no changes needed beyond gutter

### S5 — Affiliates + Researcher Access + perf hygiene
- Tier table: horizontal scroll on mobile
- Benefits grid: single column on mobile
- Steps grid: single column on mobile
- Apply form: already single-column
- Perf: lazy-load below-fold images, font preload in `<head>`

## Compliance

All `compliance.researchUseOnly` and related copy must remain visible on mobile.
Never remove compliance text to make room for content.

## Visual rules preserved on mobile

- No drop shadows, no gradients
- Radii: 0 px or 2 px only
- Ink / Bone palette unchanged
- Touch targets ≥ 44 px (min-h-11)
