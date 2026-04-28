# PurePep Design System

> Clinical, minimal, biotech-lab aesthetic for a research-use-only peptide e-commerce brand.

## Brand context

PurePep is a US-based, research-use-only peptide e-commerce brand targeting **qualified researchers, 21+**. The storefront is built on WordPress + WooCommerce at **purepep.shop** (Shopify-style architecture). The flagship launch SKU is **RETA (retatrutide)** vials.

Aesthetic direction: **clinical, scientific, premium, restrained.** The brand intentionally rejects the supplement-bro and wellness-lifestyle aesthetics. References:

- **Oath Research** — cream paper background, black editorial serif, subtle gold accents
- **LuxSkin** — pastel pink + black, soft, luxurious

The brand should feel like a **research lab supply catalog crossed with an editorial beauty title** — never like a sports nutrition site, never like a clinic.

### Compliance posture (non-negotiable)

All design + copy must support these legal positions:

- "**For research use only — not for human consumption.**" appears on every product surface.
- **No therapeutic, medical, weight-loss, or dosage claims.** Ever.
- "**21+ qualified researchers only.**" Visible age + qualification gating on entry, product, and checkout.
- **Strict no-refund policy.** Surfaced on PDP and checkout, not buried in legal pages.

Designs that compromise on these are broken designs.

## Sources for this system

This design system was built from a written brief only — no codebase, Figma, screenshots, or existing assets were provided. All visuals (logo, vial label, product page, components) were created from scratch against the locked palette + type direction described in the brief.

If you have access to the live storefront (`purepep.shop`), product photography, or a Figma library, drop them into `assets/` or attach via the Import menu and re-run — the system will be tightened against real reference.

## Index

| File / folder | What's in it |
|---|---|
| `README.md` | This file. Brand context, content + visual foundations, iconography. |
| `tokens.json` | **Canonical machine-readable tokens.** Color, type, spacing, radii, motion, blur, compliance copy, constraints. Source of truth for downstream consumers. |
| `tokens.ts` | TypeScript module mirror of `tokens.json` for Next.js / TS consumers. Hand-authored to stay in sync. |
| `colors_and_type.css` | CSS custom properties + utility classes (`.pp-eyebrow`, `.pp-hairline`, `.pp-rule`, `.pp-frame`). Import directly in CSS-only consumers (the WP child theme; static HTML prototypes). |
| `fonts/` | Webfont references (Google Fonts CDN — see Type section). |
| `assets/` | Logos (wordmark + mark), vial label artwork, brand patterns. |
| `preview/` | Design system cards rendered for the Design System tab (one card per token cluster). |
| `ui_kits/storefront/` | The PurePep storefront UI kit — JSX components and an interactive `index.html` showing the RETA product detail page. |
| `SKILL.md` | Agent Skills entry point — makes this folder portable to Claude Code. |

### Token consumption — pick the format your stack speaks

- **TypeScript / Next.js / build tooling:** `import tokens from '../design-system/tokens'`. Typed, autocompletes, locked to the spec.
- **JSON pipelines / Style Dictionary / language-agnostic codegen:** `tokens.json`. Includes `_doc` fields and role descriptions per token.
- **CSS-first projects (WP child theme, static HTML):** `colors_and_type.css`. Provides `:root` custom properties + utility classes ready to use.
- **PHP / WordPress:** `purepep-child/inc/tokens.php` mirrors a subset for PHP-side code paths (also kept in sync by hand).

When tokens change in `colors_and_type.css`, also update `tokens.json`, `tokens.ts`, and `purepep-child/inc/tokens.php` in the same commit. A `scripts/check-tokens-sync.ts` will eventually fail CI on drift.

---

## CONTENT FUNDAMENTALS

The PurePep voice is the voice of a **lab supply catalog**, not a brand. Imagine the copy on a Sigma-Aldrich datasheet, edited by a magazine copy desk. Restrained, factual, declarative.

### Tone

- **Scientific and restrained.** State facts. Do not sell.
- **Confident, not performative.** No hype words: avoid *amazing*, *revolutionary*, *game-changing*, *unlock*, *transform*, *next-level*.
- **Editorial, not commercial.** Sentences read like a journal abstract or a museum wall label, not like ad copy.
- **Never marketing-exclamation.** No exclamation marks. Period.
- **Never emoji.** Not in product copy, not in UI, not in transactional email.

### Person + voice

- Address the reader as a **researcher**, not a customer or user. Use "the researcher", "researchers", or second person ("you") sparingly and only in instructional contexts (e.g. shipping forms, account setup).
- The brand refers to itself as **PurePep** or "we" — never "us guys", never "the team".
- Default to **third-person product description**: "Lyophilized retatrutide, 10 mg per vial." Not "Get your retatrutide here!"

### Casing

- **Sentence case** for all UI labels, buttons, navigation, and form fields. ("Add to cart", not "Add To Cart" or "ADD TO CART".)
- **Title Case** reserved for product names and editorial headlines only. ("Retatrutide 10 mg", "Research Use Only Materials".)
- **All-caps** used very sparingly — only for tiny eyebrow labels and tags (≤12px), with generous letter-spacing (~0.12em).
- Compound brand: **PurePep** (one word, two capitals). Product code: **RETA** (all caps).

### Punctuation + numbers

- Em-dashes (—) for editorial breaks, not hyphens.
- Use **mg, mL, μg, °C** with a space ("10 mg", not "10mg").
- Compliance phrases are **always quoted verbatim**, never paraphrased: *"For research use only — not for human consumption."*

### Examples — good

> Retatrutide, 10 mg. Lyophilized powder in a stoppered glass vial. Triplicate HPLC analysis on every lot.

> For research use only. Not for human consumption. Sales restricted to qualified researchers, 21 and over.

> All sales final. No refunds, no exchanges, no returns. Review the certificate of analysis before purchase.

> Ships from the United States within two business days of cleared payment.

### Examples — bad (do not write copy like this)

> 🔥 Unlock your research potential with our INCREDIBLE new RETA vials! 💉 Now 20% off!

> Get the most powerful peptide on the market today. You won't believe the results!

> Our amazing team of experts has crafted the purest formula. Try it now risk-free!

The bad examples violate tone, casing, punctuation, emoji policy, the no-claims rule, *and* the no-refund policy in five lines.

---

## VISUAL FOUNDATIONS

### Color

Five colors. No others. The palette is **locked** — do not introduce new hues, do not tint, do not desaturate for "muted" variants.

| Token | Hex | Role |
|---|---|---|
| Eggshell | `#F5EBD8` | Primary background / canvas. Default page color. |
| Soft Blush | `#F2D7D7` | Secondary surface. Pill tags, product card backgrounds, subtle blocks. |
| Carbon Black | `#1F1F1F` | Primary text, serif headings, primary buttons, hairline borders at 100%. |
| Dim Grey | `#6B6B6B` | Body text, captions, dividers, hairlines at low opacity. |
| Rosy Copper | `#C75D3A` | CTA / primary action / single-point accent. **Use sparingly** — one copper element per viewport, max. |

**Rules:**

- The default canvas is always **Eggshell**. White (`#FFFFFF`) is never used as a page background. If a surface needs to recede, drop to Eggshell at 100% and add hairline borders; do not invent a darker cream.
- **Soft Blush** is a *surface* color, not a text color. Never set type in Soft Blush.
- **Rosy Copper** is reserved for the single most important action on screen. Never use it for body links — body links are Carbon Black with an underline.
- Hairlines are **Dim Grey at 15% opacity** (`rgb(107 107 107 / 0.15)`). Never pure black borders.
- Disabled state: text and icon drop to Dim Grey at 40%. No greyed-out backgrounds.

### Typography

| Role | Family | Weight | Notes |
|---|---|---|---|
| Display / Headings | **Fraunces** | 400–600 | Editorial serif. Tight tracking (`-0.01em` to `-0.02em`). Optical size set to display for ≥40px. |
| Body / UI | **Inter** | 400–500 | Neutral sans. Generous line-height (1.5–1.65). |
| Eyebrow / Tags | **Inter** | 500 | All-caps, 11–12px, letter-spacing `0.12em`. |
| Mono (for SKUs, lot numbers, COA refs) | **JetBrains Mono** | 400 | Tabular numerals on. |

Both Fraunces and Inter are loaded from Google Fonts via `colors_and_type.css`. JetBrains Mono is also Google Fonts. **No custom font files are bundled** — if the user has licensed alternatives (e.g. Söhne for body, GT Sectra for display), swap them in the `@import` at the top of `colors_and_type.css` and remove the Google fallbacks. **Flagged substitution:** Fraunces + Inter are Google Fonts stand-ins for the brief's "Fraunces/Playfair" and "Inter/Söhne/Geist" suggestions. Replace with licensed faces if available.

### Type ramp

- **Display XL** — 64px / 1.05 / Fraunces 500, tracking -0.02em (hero only)
- **Display L** — 48px / 1.1 / Fraunces 500
- **H1** — 36px / 1.15 / Fraunces 500
- **H2** — 28px / 1.2 / Fraunces 500
- **H3** — 22px / 1.3 / Fraunces 500
- **Body L** — 18px / 1.55 / Inter 400
- **Body** — 16px / 1.6 / Inter 400
- **Caption** — 13px / 1.5 / Inter 400, Dim Grey
- **Eyebrow** — 11px / 1.2 / Inter 500, all-caps, tracking 0.12em
- **Mono** — 13px / 1.5 / JetBrains Mono 400

### Spacing

8px base unit, with a 4px half-step for tight UI. Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Section padding on marketing surfaces is `96px` desktop / `48px` mobile. Card interior padding is `24px` standard, `32px` for product hero cards.

### Layout

- 12-column grid. 1280px content max-width. Gutters 24px desktop, 16px mobile.
- Generous whitespace. Hero areas occupy ≥60vh.
- **No full-bleed backgrounds in any color other than Eggshell or Soft Blush.** Imagery sits *within* the canvas, framed by margin.

### Corner radii

- `2px` — hairline tags
- `4px` — buttons, inputs, small cards
- `8px` — product cards, modals
- `9999px` — **only** for tiny status pills (e.g. "In stock", "RUO")

No medium roundness (12–24px). The brand is squared.

### Borders

- Default hairline: `1px solid rgb(107 107 107 / 0.15)` (Dim Grey 15%).
- Emphasis hairline: `1px solid #1F1F1F` (Carbon Black) — used on input focus, on the active product image, and on dividers introducing a new section.
- **Never** use a colored border (no copper borders, no blush borders) except for one specific case: the focus ring is `2px solid #C75D3A` at `2px` outer offset.

### Shadows

Minimal. The system has exactly two shadow tokens:

- `--shadow-soft` — `0 1px 2px rgb(31 31 31 / 0.04), 0 4px 12px rgb(31 31 31 / 0.04)` — used on product cards, modals
- `--shadow-lift` — `0 2px 4px rgb(31 31 31 / 0.06), 0 16px 40px rgb(31 31 31 / 0.08)` — used on the floating cart drawer and on hover-elevated product cards

**No glows. No inner shadows. No colored shadows.**

### Backgrounds + imagery

- Background = Eggshell solid. **No gradients. No textures. No patterns.** The cream paper is the texture.
- Product photography is **high-key, soft daylight, Eggshell or pale linen ground, single subject (a vial, a stopper, a box)**. Shot from a slight elevated angle, never flat-lay. Never on white seamless. Never on a lab bench prop.
- **No lifestyle photography. No people. No hands.** The product is the subject.
- If imagery is unavailable, use a **placeholder card**: Soft Blush surface, Carbon Black hairline frame, centered Eyebrow label "Image pending" in Dim Grey. Do not generate stand-in imagery with SVG illustration.

### Animation + motion

- **Duration:** 180–240ms for state changes (hover, focus). 320–400ms for surface transitions (drawer open, modal). Nothing over 500ms.
- **Easing:** `cubic-bezier(0.2, 0.6, 0.2, 1)` — a soft ease-out. No bounces, no overshoots, no springs.
- **Fades only.** No slide-in-from-right, no scale-up entrances, no parallax.
- The cart drawer is the one exception: it slides in from the right at 320ms with the standard easing.

### Interaction states

- **Hover (button, primary):** background shifts from `#1F1F1F` → `#000000`. No transform. No shadow change.
- **Hover (button, secondary outline):** border stays Carbon Black; background fills to `rgba(31,31,31,0.04)`.
- **Hover (link, body):** underline thickens from `1px` to `2px`. No color change.
- **Hover (product card):** elevates with `--shadow-lift`, image scales `1.02` over 240ms. Card itself does not move.
- **Press / active:** 92% opacity. **No shrink, no scale-down.** The brand is not playful.
- **Focus:** `2px` Rosy Copper outline at `2px` offset. Visible on all interactive elements via `:focus-visible`.
- **Disabled:** opacity 0.4, `cursor: not-allowed`. No background change.

### Cards

- Background: Eggshell (default) or Soft Blush (secondary).
- Border: 1px Dim Grey 15% hairline.
- Radius: 8px.
- Shadow: none by default. `--shadow-soft` only when the card is interactive *and* hovered.
- Padding: 24px (32px for hero cards).
- **No card-with-colored-left-border patterns.** No gradient cards. No glass-morphism.

### Transparency + blur

- Used **only** on the sticky header (background Eggshell at 92% opacity, `backdrop-filter: blur(12px)`) and on modal scrims (Carbon Black at 32%).
- **No frosted glass cards. No translucent buttons.**

### Forms

- Input height: 44px (mobile and desktop — accessibility floor).
- Border: 1px Dim Grey 15% default → 1px Carbon Black on focus, plus the Rosy Copper focus ring.
- Label: Eyebrow style above the field, sentence-case despite the all-caps treatment ("Email address" → renders as "EMAIL ADDRESS").
- Helper / error text: 13px Inter 400, Dim Grey for helper, Rosy Copper for error.
- Checkboxes + radios: 18px square / circle, 1px Carbon Black border, Carbon Black fill when checked. Never blue.

### Iconography (summary — see ICONOGRAPHY below)

- Stroke-based, 1.5px stroke, 24px grid. **Lucide** is the chosen library.
- All icons render in `currentColor`. No multi-color icons.
- **No emoji, anywhere.**

---

## ICONOGRAPHY

PurePep uses **Lucide** (lucide.dev) — a stroke-based, open-source icon set with a consistent 1.5px stroke on a 24px grid. Lucide is loaded via CDN from the design system; no icon fonts are bundled.

### Why Lucide

- Stroke-based icons match the brand's hairline-border aesthetic (1px Dim Grey hairlines, 1.5px icon strokes are visually adjacent).
- Comprehensive coverage of e-commerce + science iconography (vial, beaker, atom, package, shield, lock, file-text, chevron, search, user, cart).
- MIT licensed.
- CDN-available — no font files to maintain.

### Loading

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

Or, for static use, import individual SVGs from `https://unpkg.com/lucide-static@latest/icons/<name>.svg`.

### Usage rules

- **Stroke width:** Always 1.5px (Lucide default). Do not override.
- **Color:** Always `currentColor` — icons inherit text color. The most common foregrounds are Carbon Black and Dim Grey.
- **Sizes:** 16px (inline UI, button-adjacent), 20px (nav), 24px (primary actions), 32px (feature blocks). No other sizes.
- **Padding around icons in buttons:** 8px gap between icon and label.
- **No emoji as icon substitutes.** If Lucide doesn't have what you need, use a text label or commission a custom SVG that matches the 1.5px stroke / 24px grid spec.
- **No unicode characters as icons** (no ★, no →, no ✓). Use Lucide's `star`, `arrow-right`, `check`.

### Common icons used in the storefront

`shopping-cart`, `search`, `user`, `menu`, `x`, `chevron-down`, `chevron-right`, `arrow-right`, `arrow-up-right`, `check`, `shield-check`, `lock`, `file-text`, `package`, `truck`, `flask-conical`, `test-tube`, `atom`, `info`, `alert-triangle`.

### Logos and brand marks

The PurePep wordmark and standalone "P" mark are in `assets/`:

- `assets/purepep-wordmark.svg` — primary horizontal lockup (Carbon Black on transparent, intended for Eggshell backgrounds).
- `assets/purepep-wordmark-light.svg` — Eggshell version for use on Carbon Black surfaces.
- `assets/purepep-mark.svg` — standalone "P" mark for favicon / app icon / tight contexts.
- `assets/reta-vial-label.svg` — the RETA product vial label artwork.

The wordmark is set in Fraunces 500, tracking `-0.015em`, with a small flask glyph in the counter of the "P". Minimum width: 96px (wordmark), 24px (mark). Clearspace: half the cap-height on all sides.

---

## Compliance copy block (reusable)

Reuse these strings verbatim wherever required. Do not paraphrase.

```
For research use only. Not for human consumption.
Sales restricted to qualified researchers, 21 and over.
All sales final. No refunds, no exchanges, no returns.
```
