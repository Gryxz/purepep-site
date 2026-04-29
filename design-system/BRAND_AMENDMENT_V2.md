# Brand Amendment V2

This document extends, does not replace, `design-system/README.md`. The
original brand bible remains the foundation. All rules not explicitly relaxed
here remain in full effect.

---

## Three relaxations — Phase 0 token foundation

### 1. Soft drop shadows permitted on product photography only

Soft drop shadows are now allowed on vial and box imagery. They are forbidden
on all non-photographic UI surfaces: cards, buttons, modals, inputs, navigation
containers, spec tables, COA panels, FAQ accordions, form controls, and any
other UI element.

Token: `--pp-shadow-product`
Permitted scope: product photography (`<img>` or `<picture>` elements showing
vial or box imagery) only.

### 2. 8 px radius permitted on CTAs and key marketing cards

The 8 px radius token (`--r-md`) is sanctioned for CTA buttons and marketing
card containers where a softer edge is appropriate to the surface. Pill and
fully-rounded radii remain banned. Only three radius values are sanctioned
across the entire system: 0 px (`--r-none`), 2 px (`--r-sm`), and 8 px
(`--r-md`).

Surfaces that keep `--r-none` or `--r-sm` (0/2 px) without exception: inputs,
spec tables, COA panels, PDP photo frames, FAQ accordions, catalog grid card
containers, and all form controls.

Token: `--r-md`
Permitted scope: CTA buttons and key marketing cards only.

### 3. Heavy 1.5 px Ink borders may be dropped on marketing-style cards

The mandatory 1.5 px Ink border rule is relaxed for marketing-style card
surfaces. Whitespace and Surface / Bone-soft tints may separate sections
instead of a hard border. Borders remain required on: inputs, spec tables,
COA panels, PDP photo frames, FAQ accordions, and catalog grid cards (the outer
card border weight will be calibrated in Phase 3 — a hairline rather than the
full Ink border is anticipated but not specified here).

---

## What stays locked

Everything not listed above is unchanged. Highlights:

- **Palette**: Ink / Bone / Soft Blush / Surface / favicon-only Amber / Emerald
  / Alert. No additional colors. Amber remains favicon-only.
- **Typography**: Inter and IBM Plex Mono only. No SF Pro. No third typeface.
  No fluid type.
- **Compliance copy**: verbatim, on every product surface. No paraphrasing, no
  therapeutic or wellness claims.
- **UI copy rules**: sentence case for UI labels; Title Case for product names
  and editorial headlines; all-caps for eyebrows only (11 px IBM Plex Mono,
  0.16 em tracking). No emoji. No exclamation marks. No unicode icons (Lucide
  only).
- **Single Soft Blush band per page.** Never as a type background.
- **Hero areas**: minimum 60vh. Section padding: 96 px desktop / 48 px mobile.
- **Brutalist treatment** on all data and lab surfaces: 1.5 px Ink borders,
  0/2 px radii, no shadows, no gradients.
- **No blur** except the sticky-header backdrop and modal scrims (existing
  allowlist unchanged).

---

## New tokens and permitted scopes

- `--r-md: 8px` — CTAs and key marketing cards only. Not for data/lab surfaces,
  inputs, or form controls.
- `--pp-shadow-product` — product photography (vial/box imagery) only. Not for
  any UI surface.

---

## Block editor / theme.json note

Only the single `product` shadow preset (`"slug": "product"`) is sanctioned
in `theme.json`. The `defaultPresets: false` setting stays. No additional
shadow presets should be added without a brand-team decision.

---

Source CSS: `design-system/colors_and_type.css`; mirrored in
`purepep-child/assets/css/tokens.css`, `purepep-child/inc/tokens.php`,
`purepep-child/theme.json`, and `purepep-storefront/src/app/globals.css`
`@theme` block.
