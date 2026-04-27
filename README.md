# purepep-site

PurePep storefront tooling — wp-sync CLI, child theme, and content sources.

## Layout

```
purepep-site/
├── index.html             Navigable index of every prototype + preview card
├── design-system/         Canonical brand source (handed off from Claude Design)
│   ├── README.md          Brand bible: content + visual foundations, iconography, compliance copy
│   ├── SKILL.md           Agent Skills entry point
│   ├── colors_and_type.css  Locked tokens — palette, type ramp, spacing, radii, motion
│   ├── assets/            Logos (lockup, glyph), favicons, RETA vial label
│   ├── preview/           Design-system preview cards (16 token + component clusters)
│   └── ui_kits/storefront/  Storefront UI kit — eight prototype pages + shared JSX components
```

The prototypes are HTML/CSS/JS — the visual contract for the WordPress port. Components are defined as JSX so the WP child theme can map 1:1 by component name when the port lands.

## Browse the design

Open `index.html` at the repo root in a browser. It links to every storefront page (Home, Catalog, RETA PDP, Checkout, Age Gate, Affiliates, Affiliates Dashboard, plus the stat-headline home variant) and every preview card.

## Brand rules — non-negotiable

Read [`design-system/README.md`](design-system/README.md) before changing any surface. Highlights:

- **Locked five-color palette.** Ink `#1F1F1F`, Bone `#FAF7F0`, Soft Blush `#F2D7D7` (one band per page), Surface `#F1EDE3`. Amber `#DC9814` is **favicon only** — never in UI, type, or buttons.
- **Compliance copy verbatim.** "For research use only — not for human consumption." / "21+ qualified researchers only." / "All sales final. No refunds."
- **No therapeutic, dosage, weight-loss, or wellness claims. Ever.**
- **Sentence case, no emoji, no exclamation marks** in any UI or copy.

## Roadmap

- `wp-sync/` CLI — push prototype-derived content into WordPress.
- `child-theme/` — WordPress child theme that consumes `design-system/colors_and_type.css` and ports `ui_kits/storefront/*` into PHP partials.
- `content/` — markdown source for monograph copy, COA fixtures, and policy pages.
