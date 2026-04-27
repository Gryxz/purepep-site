# PurePep Logo — τ · Production v1.0

**Variant locked:** τ (v1.8 decision) — P-Chunky body with two parallel 2u bars in the linkage at y=22 and y=29. Final chosen by Isaiah on 2026-04-23 after full ρ-vs-τ deployment-scale analysis.

**Rationale:** τ's 2u bars survive every production surface that matters — vial caps at 12mm, favicons at 32px, business cards, Apple touch icons, CMYK print. ρ's 1u hairlines were more delicate at hero scale but collapsed below the print/silkscreen dot threshold on vial caps (Taiga's specific constraint) and went invisible at 16px favicon. Consistency > delicacy.

---

## Geometry

All dimensions in SVG user units. Glyph viewBox: `0 0 60 72`.

| Element   | x  | y  | w  | h  |
|-----------|----|----|----|----|
| Stem      | 4  | 4  | 22 | 64 |
| Top bar   | 26 | 22 | 8  | 2  |
| Bottom bar| 26 | 29 | 8  | 2  |
| Bowl      | 34 | 4  | 22 | 36 |

4u padding on all sides of the glyph.

---

## Palette

| Name       | Hex      | Usage                                      |
|------------|----------|---------------------------------------------|
| Ink        | #1F1F1F  | Wordmark, glyph, primary type              |
| Bone       | #FAF7F0  | Primary background                         |
| Soft Blush | #F2D7D7  | Hero / testimonial background              |
| Surface    | #F1EDE3  | Secondary background                       |
| Amber      | #DC9814  | Favicon-only (browser tab visibility)      |

**Restriction:** Amber appears nowhere in the identity except the favicon/tab-icon variant. It is NOT a brand color for lockups, text, UI, or merchandise.

---

## Typography

Wordmark is **Inter Black (900)** at **-0.02em tracking**. In production SVGs, the wordmark is **converted to paths** (see `svg/wordmark.svg` and all lockup SVGs). No font file is required at render time — the logo is font-license-independent.

Phase 1.5 TODO (not a blocker): custom-drawn wordmark letterforms with one opinionated detail (the brief proposes sheared terminal on the lowercase `p`, optical mirror between the two `P`s, or a single cut in the counter — pick one, hold it). Current files use Inter 900 paths verbatim; the wordmark is production-viable as-is.

---

## File Inventory

### `svg/` — Vector source files

| File | Purpose |
|------|---------|
| `glyph.svg` | Pure glyph, `fill="currentColor"` — any color via CSS |
| `glyph-ink.svg` | Glyph locked to Ink (#1F1F1F) |
| `glyph-bone.svg` | Glyph locked to Bone (#FAF7F0) — use on dark surfaces |
| `glyph-amber-favicon.svg` | Glyph on Amber square canvas (browser tab) |
| `lockup-horizontal.svg` | Primary lockup · glyph + wordmark · Ink on transparent |
| `lockup-horizontal-reversed.svg` | Bone on Ink · footer, dark hero, RUO strip |
| `lockup-horizontal-blush.svg` | Ink on Soft Blush · hero surface |
| `lockup-labdoc.svg` | Pure `#000000` on `#ffffff` · COA, packing slip |
| `lockup-stacked.svg` | Glyph centered above wordmark |
| `wordmark.svg` | "PurePep" only, no glyph · Ink |

### `png/` — Rasterized delivery

Lockups rasterized at 2048px longest edge:
- `glyph-2048.png`, `glyph-ink-2048.png`, `glyph-bone-2048.png`
- `lockup-horizontal-2048.png`, `lockup-horizontal-reversed-2048.png`, `lockup-horizontal-blush-2048.png`
- `lockup-stacked-2048.png`, `wordmark-2048.png`, `lockup-labdoc-2048.png`
- `glyph-amber-favicon-2048.png`

Favicon pack (Ink glyph on Amber square):
- `favicon-16.png` — browser tab (low-dpi)
- `favicon-32.png` — browser tab (standard)
- `favicon-48.png` — taskbar / higher-dpi tab
- `favicon-180.png` — Apple touch icon
- `favicon-512.png` — PWA manifest icon

Transparent glyph alternatives (no amber background):
- `glyph-transparent-16.png` through `glyph-transparent-512.png`

---

## WordPress / HTML Integration

Place favicon files in `/wp-content/themes/purepep-child/favicon/` (or theme root) and add to `<head>`:

```html
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon/favicon-48.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
```

With a `site.webmanifest`:
```json
{
  "name": "PurePep",
  "short_name": "PurePep",
  "icons": [
    { "src": "/favicon/favicon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#DC9814",
  "background_color": "#FAF7F0"
}
```

For inline logo placement in the site header, use `lockup-horizontal.svg` with CSS:
```css
.site-logo {
  height: 40px;  /* adjust to header height */
  width: auto;
  fill: #1F1F1F;
}
```

---

## Clear Space

Minimum clear space around the lockup: **0.5× glyph height** on all sides. For the primary horizontal lockup (glyph = 72u tall), clear space = 36u.

Don't place the logo within 1× glyph-height of another logo, button, or strong visual element.

---

## Minimum Sizes

| Use | Minimum | Notes |
|-----|---------|-------|
| Horizontal lockup | 24px glyph height | Below this, wordmark becomes unreadable |
| Stacked lockup | 40px glyph height | Stacked needs more vertical room |
| Glyph only | 16px | Bars go subpixel below 32px but shape still reads |
| Vial cap | 8mm | τ's 2u bars reliably silkscreen-print above 8mm glyph ø |
| Favicon | 16px | Use `favicon-16.png` |

---

## Known Trade-offs

**At 16px favicon, the linkage bars collapse to subpixel haze.** This is expected — τ was chosen knowing this would happen at the very smallest scale. The glyph still reads as a recognizable mark at 16px, just without the linkage detail. If a future spec requires linkage visibility below 16px, we'd need a simplified fallback variant (likely solid "H"-shape with thicker bars, only used at 16px — but that fragments the identity system and wasn't worth it against the constraints we weighed in v1.8).

**Inter Black letterforms are a placeholder for truly custom wordmark.** The brief preferred custom letterforms with one opinionated detail. Current SVGs use Inter 900 paths verbatim — production-viable but not maximally distinctive. Phase 1.5.

---

## Version Trail (this project)

- v1 · Amide / Cut / Sequence (3 execution directions)
- v1.1 · P-Standard / P-Chunky (✓ Taiga greenlit) / P-Open
- v1.2 · Block-P hybrid α / β / γ (interpolation)
- v1.3 · Negative-space slot δ / ε / ζ
- v1.4 · Bracketed framing θ / ι / κ
- v1.5 · Open linkage (P-Chunky, bar removed)
- v1.6 · Staggered linkage (two offset stubs)
- v1.7 · Double linkage (two full bars, h=3)
- v1.8 · Linkage refinement π / ρ / σ / **τ** ← LOCKED

Full iteration artifacts are in the project chat history, HTML previews in `/mnt/user-data/outputs/purepep-logo-v1.*.html`.
