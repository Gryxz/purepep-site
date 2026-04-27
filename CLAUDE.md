# CLAUDE.md — project guidance

Project-level guidance for Claude Code working in this repo. Read before
modifying anything under `purepep-child/` or `design-system/`.

## Repository layout

```
purepep-site/
├── design-system/        Canonical brand source — tokens, assets, prototypes
├── purepep-child/        WordPress child theme (parent: twentytwentyfive)
├── index.html            Local navigable index of every prototype + preview card
└── README.md             Top-level overview
```

## Deployment — SFTP

The WordPress child theme in `purepep-child/` deploys to the live storefront
at purepep.shop. The host is a managed WordPress instance; `wp-content/themes/`
is the only path the theme should ever land in.

| Field    | Value |
|----------|-------|
| Host     | `134.209.168.98` |
| User     | `master_huuvbkqrgr` |
| Webroot  | `/home/master/applications/bzxzssuwrd/public_html/wp-content/themes/` |
| Target dir | `<webroot>/purepep-child/` |
| Protocol | SFTP |

The deployment password is **not** committed. It belongs in a local
`.env`, a secrets manager, or your SFTP client's keychain — never in
this repo. The `wp-sync` CLI (Phase 4 batch 2) will read it from
`PUREPEP_SFTP_PASSWORD` in the environment.

Deployment is one-way: repo → host. Do not edit theme files directly on
the server; changes there will be overwritten on next sync.

## Design constraints — non-negotiable

The full brand bible lives in
[`design-system/README.md`](design-system/README.md). Highlights below;
violations should fail review.

### Palette (locked five colors)

| Token | Hex | Role |
|---|---|---|
| Ink | `#1F1F1F` | Primary type, borders, primary CTA. |
| Bone | `#FAF7F0` | Primary page background. |
| Soft Blush | `#F2D7D7` | One hero / testimonial band per page. Never on type. |
| Surface | `#F1EDE3` | Secondary section bands, hover/subtle fill. |
| Amber | `#DC9814` | **Favicon only.** Never in UI, type, buttons, or merchandise. |

Semantic accents (border + type only, never hero fill): Emerald `#0F5132`
(positive), Alert `#C83E4D` (negative). Tokens are mirrored in
`purepep-child/assets/css/tokens.css` and `purepep-child/inc/tokens.php`.
Source of truth: `design-system/colors_and_type.css`.

### Typography

- Display + body: **Inter** (Black 900 for display, regular/medium for body).
- Utility: **IBM Plex Mono** for SKU codes, lot numbers, eyebrows, breadcrumbs.
- No other typefaces. No fluid type. Display tracking `-0.02em`. Eyebrow
  tracking `0.16em`, all-caps, 11 px.

### Compliance copy — quote verbatim

```
For research use only. Not for human consumption.
Sales restricted to qualified researchers, 21 and over.
All sales final. No refunds, no exchanges, no returns.
```

These appear on every product surface. Never paraphrase. No therapeutic,
dosage, weight-loss, or wellness claims anywhere.

### Brutalist visual rules

- Borders: 1.5 px solid Ink on cards, inputs, nav containers, spec tables.
- Radii: 0 px or 2 px. Nothing else. Never 4 px+ rounded UI.
- **No drop shadows. No gradients. No glassmorphism. No blur except the
  sticky-header backdrop and modal scrims.**
- One Rosy/copper/amber accent per viewport — but for PurePep that single
  accent is **Ink**, not amber. CTAs are flat Ink-on-Bone.
- Sentence case for UI labels. Title Case only for product names + editorial
  headlines. All-caps only for ≤12 px eyebrows with 0.12–0.16em tracking.
- No emoji. No exclamation marks. No unicode characters as icons (use Lucide).
- Hero areas occupy ≥60vh; section padding 96 px desktop / 48 px mobile.

### theme.json discipline

`purepep-child/theme.json` disables: custom colors, custom gradients,
default gradients, default duotone, default palette, custom font sizes,
fluid typography, shadow presets, and arbitrary spacing. The locked
palette + scale + radii + fonts are the only options exposed in the
block editor. Re-enabling any of these without a brand-team decision is
out of scope.

## Working on this repo

- Always read tokens from `design-system/colors_and_type.css` (CSS) or
  `purepep-child/inc/tokens.php` (PHP). Never hardcode hex values.
- When `colors_and_type.css` changes, sync `purepep-child/assets/css/tokens.css`,
  `purepep-child/inc/tokens.php`, and the palette in
  `purepep-child/theme.json` in the same commit.
- Component names in `design-system/ui_kits/storefront/*.jsx` are locked
  for the WordPress port. Map them 1:1 to PHP partials; do not rename.
- Browse the design locally by opening `index.html` at the repo root.
