# PurePep storefront — kickoff prompt (V3)

> Paste this entire document into a fresh Claude Code session at the root of an
> **empty** `purepep-storefront` repo. The session will scaffold a Next.js 16
> + React 19 + Tailwind v4 storefront that talks headlessly to WordPress +
> WooCommerce at `cms.purepep.shop` while replicating the PurePep design
> system byte-for-byte.

**Supersedes:** V1 (hardcoded tokens — drift risk) and V2 (no design-system
access path for a fresh session).

---

## 1. What you are building

A fully headless storefront for **PurePep** (purepep.shop), a research-grade
peptide e-commerce brand. WordPress + WooCommerce stays at
`cms.purepep.shop` as the catalog/order/auth backend. This Next.js app
becomes the public site at `purepep.shop` (apex domain).

You are not building the design system. The design system already exists in
the sibling repo `gryxz/purepep-site` and is the **single source of truth**
for every visual decision: tokens, components, prototypes, copy. You will
import it as a git submodule and consume it programmatically.

You are not allowed to:

- hardcode any color, type size, spacing, radius, motion, or compliance
  string anywhere in this repo. Always reference the imported tokens.
- introduce a typeface other than Inter and IBM Plex Mono.
- use shadows, gradients, glassmorphism, fluid type, or rounded radii ≥ 4 px.
- paraphrase compliance copy. Quote verbatim from `compliance.*` tokens.
- reach the WooCommerce REST API from browser code. Use the Store API client
  + Next route handler proxy described in §6.

If a requirement in this doc conflicts with the design system, the design
system wins. Open a question; don't silently diverge.

---

## 2. Success criteria — what "done" looks like

Before opening the first PR, all of the following must be true:

- [ ] `pnpm typecheck` passes with `strict: true`, `noUncheckedIndexedAccess: true`.
- [ ] `pnpm lint` passes with the fences in §10 active (no raw hex anywhere
      outside `purepep-site/`, no arbitrary Tailwind values, no banned typefaces).
- [ ] `pnpm build` succeeds and the build output renders the home page,
      catalog, RETA PDP, cart, checkout, age-gate modal, and policy pages
      with zero hydration warnings.
- [ ] Pixel parity: render `purepep-site/design-system/preview-cards/home.png`
      side-by-side with `localhost:3000/`. Geometry, type, palette must match.
      Document any intentional deviation in `docs/DESIGN_PARITY_NOTES.md`.
- [ ] Lighthouse desktop ≥ 95 perf / 100 a11y / 100 best-practices / 100 SEO
      on the home and a PDP. Mobile ≥ 90 perf.
- [ ] Compliance copy renders verbatim on every product surface, cart,
      checkout, and policy page (see §8.3).
- [ ] Age gate appears on first visit, persists via `pp_age_gate_v1` in
      sessionStorage, and is bypassed for crawlers (`User-Agent` allowlist
      via middleware).
- [ ] `robots.ts` and `sitemap.ts` both render correctly. Staging environment
      returns `noindex` via env-gated metadata.
- [ ] The single-page WP frontend at `purepep.shop` is decommissioned (see
      §11 — the WP `template_redirect` interceptor lives in the `purepep-site`
      repo, not here).

---

## 3. Design system access — the load-bearing decision

**Use a git submodule.** Do not copy, vendor, or fork.

```bash
git submodule add https://github.com/gryxz/purepep-site.git purepep-site
git submodule update --init --recursive
echo 'purepep-site/ linguist-vendored' >> .gitattributes
```

This gives you, at known paths:

| Need                      | Path                                                              |
|---------------------------|-------------------------------------------------------------------|
| Typed tokens (TS)         | `purepep-site/design-system/tokens.ts`                            |
| JSON tokens               | `purepep-site/design-system/tokens.json`                          |
| CSS variables (canonical) | `purepep-site/design-system/colors_and_type.css`                  |
| React component reference | `purepep-site/design-system/ui_kits/storefront/*.jsx`             |
| Static prototypes         | `purepep-site/design-system/*.html`                               |
| Preview screenshots       | `purepep-site/design-system/preview-cards/*.png`                  |
| Brand bible               | `purepep-site/design-system/README.md`                            |
| Compliance copy           | `purepep-site/design-system/tokens.ts → compliance.*`             |

**Read `purepep-site/design-system/README.md` before writing any UI code.**
It contains visual rules that are not encoded in tokens (one blush band per
page, hero ≥ 60vh, sentence case for UI labels, no emoji, etc.).

To pull design updates:

```bash
git submodule update --remote purepep-site
git add purepep-site && git commit -m "Bump design-system pin"
```

The submodule is pinned to a commit, so design changes never break this
repo silently. Bumping is an explicit, reviewed action.

Add a CI check (`.github/workflows/submodule.yml`) that runs
`git submodule status` and fails if the submodule is unpinned or dirty.

---

## 4. Tech stack — locked

| Layer            | Choice                              | Why                                                   |
|------------------|-------------------------------------|-------------------------------------------------------|
| Runtime          | Node 22 LTS                         | Pinned via `.nvmrc` and `engines.node`.               |
| Package manager  | pnpm 9                              | Workspaces, lockfile determinism.                     |
| Framework        | Next.js 16 (App Router)             | RSC, route handlers, typed routes.                    |
| React            | 19                                  | Server actions, `use()`.                              |
| Styling          | **Tailwind v4** + CSS variables     | `@theme` directive reads vars natively — see §5.      |
| Type system      | TypeScript 5.6, `strict`            | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. |
| State            | Zustand 5                           | Cart, age-gate, UI state. No Redux.                   |
| Icons            | lucide-react                        | Locked. No emoji, no unicode glyphs as icons.         |
| Forms            | react-hook-form + zod               | Schema-driven validation; zod schemas live in `lib/schemas/`. |
| Auth             | iron-session                        | HttpOnly cookie wrapping a customer JWT from WP.      |
| WC client        | `@/lib/woo/store` (Store API)       | Cart, products. Browser-safe.                         |
| WC server        | `@/lib/woo/admin` (REST API v3)     | Server-only. Consumer keys in env.                    |
| Testing          | Vitest + Playwright                 | Unit + e2e. No Jest.                                  |
| Lint             | ESLint flat config + Stylelint      | Fences in §10.                                        |
| Hooks            | husky + lint-staged                 | `pnpm exec husky init` after install.                 |
| Deploy           | Cloudways (DO NY, 1 GB)             | Node app, PM2-managed. CI from `main`.                |

**Why Tailwind v4 over v3.4 (V2's choice):** v4's CSS-first config exposes a
`@theme` directive that reads CSS custom properties at build time. We can
import `purepep-site/design-system/colors_and_type.css` directly and have
every Tailwind utility (`bg-bone`, `text-ink`, `border-ink`) resolve to the
same `--pp-*` variables that the WP child theme emits. v3.4 forced a parallel
JS palette in `tailwind.config.ts` that drifted from the canonical CSS. v4
eliminates the drift surface. The "too new" concern is real but bounded —
we pin the exact version and review upgrades.

---

## 5. Token-first integration — the rules

### 5.1 Tailwind v4 setup

`src/app/globals.css`:

```css
@import "tailwindcss";

/* Canonical CSS vars — single source of truth. */
@import "../../purepep-site/design-system/colors_and_type.css";

@theme {
  --color-ink:          var(--pp-ink);
  --color-ink-muted:    var(--pp-ink-muted);
  --color-bone:         var(--pp-bone);
  --color-bone-soft:    var(--pp-bone-soft);
  --color-surface:      var(--pp-surface);
  --color-blush:        var(--pp-blush);
  --color-line:         var(--pp-line);
  --color-emerald:      var(--pp-emerald);
  --color-emerald-soft: var(--pp-emerald-soft);
  --color-alert:        var(--pp-alert);
  --color-alert-soft:   var(--pp-alert-soft);

  /* amber is intentionally absent — favicon only. */

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  --radius-none: 0px;
  --radius-sm:   2px;

  /* Disable Tailwind defaults we forbid. */
  --shadow-*:        initial;
  --gradient-*:      initial;
}

/* Re-enable backdrop-blur for the sticky header + modal scrim only. */
@theme {
  --backdrop-blur-header: 12px;
}
```

Import the typed module for type safety + autocomplete in TS code:

```ts
import { color, fontSize, spacing, compliance } from
  "../../purepep-site/design-system/tokens";
```

Set the path alias in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@design/*": ["./purepep-site/design-system/*"]
    }
  }
}
```

Then `import { color } from "@design/tokens"` works everywhere.

### 5.2 Fonts

Use `next/font/google` for both faces. Load **all** weights enumerated in
`tokens.ts → font.*.weights`, not just 900:

```ts
// src/app/fonts.ts
import { Inter, IBM_Plex_Mono } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
```

Apply variables on `<html>` in `app/layout.tsx`. Tailwind utilities
`font-sans`, `font-display`, `font-mono` then resolve correctly.

### 5.3 Backdrop blur — locked allowlist

Tailwind v4 disables most utilities by default for any `--*-*: initial`
override. Backdrop blur is permitted **only** on:

- the sticky header (`backdrop-blur-header` → 12 px)
- the modal scrim (same value)

Enforce via a stylelint rule (§10) that fails on `backdrop-filter` or
`backdrop-blur-*` outside `components/Header.tsx` and `components/Modal.tsx`.

### 5.4 Compliance copy — never typed

```tsx
import { compliance } from "@design/tokens";

<p className="text-mono">{compliance.researchUseOnly}</p>
```

Never write the strings inline. A grep fence in CI fails the build if any of
these substrings appears outside the canonical token file:

- `For research use only`
- `qualified researchers`
- `All sales final`

---

## 6. WooCommerce architecture — headless boundary

### 6.1 Two clients, two trust zones

| Client                | Endpoint                                  | Auth                          | Where it runs        |
|-----------------------|-------------------------------------------|-------------------------------|----------------------|
| Store API (browser)   | `https://cms.purepep.shop/wp-json/wc/store/v1/` | `Cart-Token` header + nonce | Server route handler proxy + RSC |
| REST API (server)     | `https://cms.purepep.shop/wp-json/wc/v3/`       | Consumer key + secret (Basic) | Server-only modules  |

**Hard rule:** the REST API v3 must never be reachable from the browser.
Consumer keys live in `WP_WC_KEY` / `WP_WC_SECRET` env vars (Cloudways app
config), are read only inside `src/lib/woo/admin/*`, and are referenced
exclusively by Server Components, Route Handlers, and Server Actions.

### 6.2 Route handler proxy

Browser code calls `/api/woo/store/<path>`, never the WP host directly. The
proxy adds the `Cart-Token` header from an HttpOnly cookie, attaches the
nonce on mutating requests, and rewrites response cookies back into the
session. CORS is closed at the WP layer.

```
src/app/api/woo/store/[...path]/route.ts
src/app/api/woo/admin/[...path]/route.ts   ← internal use only; gated by
                                              session role check, never
                                              proxies arbitrary paths.
```

The Store proxy:

1. Reads `pp_cart_token` from cookies. If absent, performs a `POST /cart`
   priming call and stores the returned token in an HttpOnly, SameSite=Lax,
   Secure cookie (Path=/, no client JS access).
2. Forwards the request body and query, attaching `Cart-Token` and the
   `X-WC-Store-API-Nonce` header (fetched from `/wp-json/wc/store/v1/cart`
   bootstrap and cached for the session).
3. Streams the JSON response and copies any `Cart-Token` rotation back
   into the cookie via `Set-Cookie`.

A typed wrapper lives at `src/lib/woo/store/index.ts`:

```ts
export const wooStore = {
  cart: {
    get:      () => fetch("/api/woo/store/cart").then(r => r.json()),
    addItem:  (id: number, qty: number) => fetch("/api/woo/store/cart/add-item", { method: "POST", body: JSON.stringify({ id, quantity: qty }) }).then(r => r.json()),
    update:   (key: string, qty: number) => /* … */,
    remove:   (key: string) => /* … */,
  },
  products: {
    list:     (q?: ProductQuery) => /* … */,
    bySlug:   (slug: string) => /* … */,
  },
} as const;
```

### 6.3 Cart state

Zustand store (`src/lib/cart/store.ts`) hydrates from the proxy on mount.
Optimistic updates with rollback on 4xx/5xx. Cart count badge subscribes
via a selector to avoid re-rendering the whole header.

### 6.4 Checkout

WooCommerce's hosted checkout (`/checkout`) is the path of least resistance
for compliance + payment-gateway maintenance, but it breaks the headless
illusion. **Use the Store API `/checkout` endpoint** to render a fully
custom checkout in this app, posting to the WP order endpoint at the end.
Stripe (or whichever gateway) is configured WP-side; this app only collects
billing/shipping/payment-token via Stripe Elements and forwards the
payment_method to WP.

If the gateway requires server-side intent confirmation, do it in a Server
Action (`src/app/(checkout)/checkout/actions.ts`), not a route handler.

### 6.5 Auth (customer login)

Plugin: **JWT Authentication for WP REST API** on the WP side (or the
Authenticator plugin already bundled with the WC backend).

1. Login form posts to `/api/auth/login` (route handler).
2. Handler calls `POST /wp-json/jwt-auth/v1/token` with username/password.
3. Wraps the JWT in an `iron-session` HttpOnly cookie (`pp_session_v1`).
4. Session middleware on protected routes (`/account`, `/account/orders`,
   `/affiliates/dashboard`) attaches the JWT to outbound Store API
   requests for that user's order history.

### 6.6 Webhooks (later)

Out of scope for the kickoff. When stock-sync, order-state mirroring, or
ISR revalidation hooks land, they live at `src/app/api/webhooks/woo/route.ts`
with HMAC verification using a shared secret in `WP_WEBHOOK_SECRET`.

### 6.7 Env vars

Create `.env.example` with every key documented; never commit `.env.local`.

```
# WP base
NEXT_PUBLIC_WP_URL=https://cms.purepep.shop

# WC REST (server-only)
WP_WC_KEY=
WP_WC_SECRET=

# Auth
WP_JWT_SECRET=
SESSION_SECRET=                 # 32-byte random for iron-session
SESSION_COOKIE_NAME=pp_session_v1

# Cart
CART_COOKIE_NAME=pp_cart_token

# Webhooks
WP_WEBHOOK_SECRET=

# Indexing
NEXT_PUBLIC_SITE_URL=https://purepep.shop
NEXT_PUBLIC_INDEXING_ENABLED=false  # true only in prod
```

A pre-commit hook (`.husky/pre-commit`) runs `pnpm dotenv-checker` (or a
small custom script) to fail if `.env.local` has been added.

---

## 7. Routing & page map

App Router structure. Every route ports a counterpart from the
`purepep-child` WP theme; component shapes mirror
`design-system/ui_kits/storefront/*.jsx` 1:1.

```
src/app/
├── (marketing)/
│   ├── page.tsx                          # Home    ← purepep-child/front-page.php
│   ├── about/page.tsx
│   ├── coa/page.tsx                      # Certificates of Analysis index
│   └── research/page.tsx                 # Editorial / research notes
├── (catalog)/
│   ├── shop/page.tsx                     # Catalog ← woocommerce/archive-product.php
│   ├── shop/[slug]/page.tsx              # PDP     ← woocommerce/single-product.php
│   └── shop/[slug]/coa/page.tsx          # PDP-scoped COA
├── (checkout)/
│   ├── cart/page.tsx                     # ← woocommerce/cart/cart.php
│   ├── checkout/page.tsx                 # ← woocommerce/checkout/form-checkout.php
│   └── checkout/thanks/page.tsx
├── (account)/
│   ├── account/page.tsx
│   ├── account/orders/page.tsx
│   ├── account/orders/[id]/page.tsx
│   └── account/addresses/page.tsx
├── (affiliates)/
│   ├── affiliates/page.tsx               # ← page-affiliates.php
│   └── affiliates/dashboard/page.tsx     # ← page-affiliates-dashboard.php
├── (legal)/
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── shipping/page.tsx
│   ├── returns/page.tsx                  # "All sales final" page
│   └── age-verification/page.tsx
├── api/
│   ├── woo/
│   │   ├── store/[...path]/route.ts
│   │   └── admin/[...path]/route.ts
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── register/route.ts
│   └── webhooks/
│       └── woo/route.ts
├── robots.ts
├── sitemap.ts
├── layout.tsx
├── not-found.tsx
└── error.tsx
```

Use Next 16's typed routes. In `next.config.ts`:

```ts
const config: NextConfig = {
  typedRoutes: true,                    // promoted out of experimental in 16
  experimental: { /* … */ },
};
```

---

## 8. Components — port plan

### 8.1 Mapping

Every JSX in `purepep-site/design-system/ui_kits/storefront/` becomes a TSX
in `src/components/` with **the same name**. No renames. The old WP theme
already followed this rule; this repo continues it.

```
design-system/ui_kits/storefront/Button.jsx
  ↓
src/components/Button.tsx
```

Read the source JSX from the submodule, port to TSX with strict types,
import tokens from `@design/tokens`, write a Vitest snapshot, and a
Playwright visual diff against the matching preview card. Don't redesign.

### 8.2 Primitives first

Build in this order so later components can compose primitives:

1. `Button` (primary = ink-on-bone, secondary = bone-on-ink, tertiary = link)
2. `Input`, `Textarea`, `Select`, `Checkbox`, `Radio` (1.5 px ink border, 0/2 px radius)
3. `Eyebrow`, `Heading`, `Body`, `Mono` (typographic primitives)
4. `Pill` (emerald + alert variants only — never amber)
5. `Card` (1.5 px hairline, no shadow)
6. `Divider` (4 px ink rule, or 1 px line for hairline)
7. `Modal` + `Scrim` (only place backdrop-blur is allowed beyond header)

Then composite components: `Header`, `Footer`, `ProductCard`, `ProductGallery`,
`SpecTable`, `CoASummary`, `PriceBlock`, `AddToCart`, `CartLine`, `CheckoutSummary`,
`AgeGate`, `ComplianceBlock`.

### 8.3 ComplianceBlock — required surface

```tsx
import { compliance } from "@design/tokens";

export function ComplianceBlock() {
  return (
    <aside aria-label="Compliance" className="border-t border-ink py-5 text-mono text-ink-muted">
      <p>{compliance.researchUseOnly}</p>
      <p>{compliance.qualified21}</p>
      <p>{compliance.noRefunds}</p>
    </aside>
  );
}
```

Render this on every PDP, the cart, the checkout, and every legal page.
A test in `tests/compliance.spec.ts` walks every route in the sitemap
and asserts the three strings are present in the DOM.

### 8.4 Age gate

`components/AgeGate.tsx` — modal with backdrop-blur scrim. Reads/writes
`pp_age_gate_v1` in `sessionStorage` (not localStorage — must re-prompt
each session per legal review). Bypassed when:

- `User-Agent` matches a crawler allowlist (Googlebot, Bingbot, etc.)
- `?bypass_age_gate=<TOKEN>` is present and `TOKEN === process.env.AGE_GATE_BYPASS`
  (for QA / Lighthouse runs only)

Implementation goes in middleware so the bypass works for SSR Lighthouse
audits. Don't gate via JS only — that breaks SSR Lighthouse scoring.

### 8.5 Layout & metadata

`app/layout.tsx`:

- attaches font CSS variables to `<html>`
- emits the canonical `<link rel="icon">` (the **only** place amber appears)
- sets default OG/Twitter metadata
- wraps children in `<ComplianceFooter>`

`metadata.robots` flips on `NEXT_PUBLIC_INDEXING_ENABLED`. `app/robots.ts`
mirrors this — belt-and-suspenders so a misconfigured staging env never
gets indexed.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const enabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  return enabled
    ? { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml` }
    : { rules: [{ userAgent: "*", disallow: "/" }] };
}
```

---

## 9. Setup commands — the first hour

```bash
# 1. Initialize repo and pull design system as submodule.
git init
git submodule add https://github.com/gryxz/purepep-site.git purepep-site
git submodule update --init --recursive

# 2. Scaffold Next.js 16.
pnpm create next-app@latest . \
  --typescript --eslint --tailwind --app \
  --src-dir --turbopack --import-alias "@/*" \
  --use-pnpm --skip-install
pnpm install

# 3. Pin Tailwind v4 and runtime deps.
pnpm add tailwindcss@^4 @tailwindcss/postcss@^4
pnpm add zustand@^5 lucide-react@^0.460 \
  iron-session@^8 react-hook-form@^7 zod@^3

# 4. Dev tooling.
pnpm add -D \
  prettier prettier-plugin-tailwindcss \
  eslint-plugin-tailwindcss eslint-plugin-jsx-a11y \
  stylelint stylelint-config-standard \
  husky lint-staged \
  vitest @vitejs/plugin-react @testing-library/react \
  @playwright/test \
  tsx

# 5. Husky.
pnpm exec husky init
echo "pnpm lint-staged" > .husky/pre-commit
echo "pnpm typecheck && pnpm test --run" > .husky/pre-push

# 6. Node version pin.
echo "22" > .nvmrc
```

`package.json` scripts (minimum):

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint && stylelint 'src/**/*.{css,tsx}' && tsx scripts/check-tokens-fence.ts",
    "lint:fix": "next lint --fix && stylelint 'src/**/*.{css,tsx}' --fix",
    "test": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  }
}
```

---

## 10. Lint fences — what cannot get past CI

These are the technical guardrails that keep the design system locked. All
must run in CI on every PR.

### 10.1 ESLint — block raw hex in JSX/TS

`eslint.config.mjs`:

```js
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9A-Fa-f]{3,8}/]",
          message: "Hex colors are forbidden in source. Import from @design/tokens."
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9A-Fa-f]{3,8}/]",
          message: "Hex colors are forbidden in template literals. Import from @design/tokens."
        }
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/design-system/**"], message: "Import from @design/* alias instead." }
          ]
        }
      ]
    }
  },
  {
    files: ["purepep-site/**"],
    rules: { /* submodule is exempt */ }
  }
]);
```

### 10.2 Stylelint — block forbidden CSS features

`.stylelintrc.json`:

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "declaration-property-value-disallowed-list": {
      "/^box-shadow/": ["/.+/"],
      "/^background-image/": ["/gradient/"],
      "/^filter/": ["/blur/"]
    },
    "color-no-hex": true,
    "unit-disallowed-list": ["rem", "em"],
    "comment-no-empty": true
  },
  "overrides": [
    {
      "files": ["src/components/Header.tsx", "src/components/Modal.tsx", "src/app/globals.css"],
      "rules": { "declaration-property-value-disallowed-list": null }
    }
  ]
}
```

### 10.3 Custom token fence — block arbitrary Tailwind values

ESLint can't see Tailwind's arbitrary value syntax. Add a Node script that
greps the source tree:

`scripts/check-tokens-fence.ts`:

```ts
#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { globSync } from "glob";

const PATTERNS = [
  { name: "Arbitrary Tailwind hex", re: /\b(?:bg|text|border|from|to|via|fill|stroke|ring|outline|decoration|shadow)-\[#[0-9A-Fa-f]{3,8}\]/g },
  { name: "Arbitrary Tailwind size",  re: /\b(?:w|h|p|m|gap|text|leading)-\[\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)\]/g },
  { name: "Inline style hex",         re: /style=\{\{[^}]*#[0-9A-Fa-f]{3,8}[^}]*\}\}/g },
  { name: "Banned typeface",          re: /font-family:\s*['"]?(?!Inter|IBM Plex Mono|-apple-system|BlinkMacSystemFont|'Segoe UI'|sans-serif|ui-monospace|'SF Mono'|Menlo|monospace)[^;'"]+/gi },
  { name: "Compliance string typed",  re: /(For research use only|qualified researchers|All sales final)/g },
];

const files = globSync("src/**/*.{ts,tsx,css}", { ignore: ["**/node_modules/**"] });
let failed = false;

for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const { name, re } of PATTERNS) {
    const matches = [...src.matchAll(re)];
    if (matches.length) {
      // Allow compliance strings only inside the canonical token import line.
      if (name === "Compliance string typed" && /from\s+["']@design\/tokens["']/.test(src)) continue;
      console.error(`✗ ${f}: ${name}`);
      for (const m of matches) console.error(`    ${m[0]}`);
      failed = true;
    }
  }
}
process.exit(failed ? 1 : 0);
```

Wire it into `pnpm lint` and the GitHub Actions workflow. It is the
single load-bearing fence — the rest catch obvious slips, this one catches
the clever ones.

### 10.4 Tailwind core plugin disablement

Tailwind v4 doesn't ship `corePlugins` toggles the same way as v3. Achieve
the same effect by overriding the relevant `--*-*` theme variables to
`initial` (already done in §5.1) and adding stylelint disallow rules
(§10.2). A PR review checklist item:

- [ ] No new `box-shadow`, `linear-gradient`, `radial-gradient`,
      `backdrop-filter` (outside header/scrim), `border-radius >= 4px`.

---

## 11. WP frontend deprecation — the cutover

Once this storefront is live at `purepep.shop`:

1. Land a `template_redirect` filter in `purepep-child/functions.php`
   (the `purepep-site` repo, **not this one**) that 301s every public
   front-end request to the matching path on `purepep.shop`.
2. Keep `wp-admin`, `wp-login.php`, `wp-cron.php`, and `/wp-json/*`
   reachable on `cms.purepep.shop`.
3. The block-theme templates and PHP page templates in `purepep-child`
   become orphans. Don't delete them — they're the visual reference for
   ports. The redirect filter ensures no one ever sees them again.

This is **not** part of the kickoff scope. Note it in
`docs/CUTOVER_PLAN.md` and revisit when the Next app is staging-ready.

---

## 12. Phased delivery — batches

Don't try to ship everything in one branch. Ship in reviewable batches.

### Batch 1 — Foundation (no UI yet)

- Repo init, submodule, Next 16 scaffold.
- Tailwind v4 + tokens import + globals.css.
- Fonts (`app/fonts.ts`).
- ESLint + Stylelint + token-fence script wired into CI.
- Husky + lint-staged.
- `app/layout.tsx` shell with empty `<main>`.
- `robots.ts`, `sitemap.ts`, `not-found.tsx`, `error.tsx`.
- Vitest + Playwright bootstrapped with one smoke test each.
- `pnpm build` succeeds.

**Acceptance:** CI green on a PR that adds a deliberate `bg-[#FF0000]`
violation — and the same PR fails when the violation is restored. Prove
the fence works.

### Batch 2 — Primitives + Header/Footer

- All components in §8.2.
- `Header` (sticky, blurred backdrop) + `Footer` (with `ComplianceBlock`).
- Visual diff against `design-system/preview-cards/header.png` etc.
- Storybook is **not** introduced; preview cards + Playwright visual
  diffs are the contract.

### Batch 3 — Home page

- Port `purepep-child/front-page.php` → `app/(marketing)/page.tsx`.
- One blush band only. Hero ≥ 60vh.
- Lighthouse ≥ 95 on the home.

### Batch 4 — Catalog + PDP

- WC Store API client (§6).
- `/shop` + `/shop/[slug]` + `/shop/[slug]/coa`.
- Stock states (in-stock/out-of-stock) use emerald/alert pills.
- COA download surfaces are wired (PDFs served from WP media library).

### Batch 5 — Cart + Checkout

- Cart store (Zustand) + proxy.
- `/cart`, `/checkout`, `/checkout/thanks`.
- Stripe Elements integration via Server Action.
- Order confirmation email is sent by WP, not this app.

### Batch 6 — Auth + Account

- JWT + iron-session.
- `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`.

### Batch 7 — Affiliates + Legal + Age gate

- `/affiliates`, `/affiliates/dashboard`.
- All `(legal)` pages.
- `AgeGate` component + middleware bypass.

### Batch 8 — Cutover

- Staging verification.
- `template_redirect` filter in `purepep-site` repo.
- DNS flip on `purepep.shop` apex from WP IP → Cloudways app IP.
- Smoke test all 301s from old URLs.

---

## 13. Notes for the next session — read first

1. **Read these files in order before writing any code:**
   - `purepep-site/design-system/README.md` (brand bible)
   - `purepep-site/design-system/tokens.ts` (canonical typed tokens)
   - `purepep-site/design-system/colors_and_type.css` (canonical CSS vars)
   - `purepep-site/CLAUDE.md` (design constraints + SFTP context)
   - `purepep-site/purepep-child/front-page.php` (home reference)
   - `purepep-site/purepep-child/woocommerce/single-product.php` (PDP reference)

2. **When in doubt about a visual decision, open the matching preview
   card** in `purepep-site/design-system/preview-cards/` and match it.
   Don't invent.

3. **If a token is missing from `tokens.ts`, do not add it locally.**
   File a PR against `purepep-site` adding it to `tokens.json`,
   `tokens.ts`, `colors_and_type.css`, `purepep-child/inc/tokens.php`,
   and `purepep-child/theme.json` in the same commit. Then bump the
   submodule pin here.

4. **Ask a question before paraphrasing compliance copy.** Even if it
   looks awkward, every word in `compliance.*` was vetted by legal.

5. **Don't introduce shadcn, Radix-based component libraries, or any
   pre-built design system.** They will fight the tokens. Build the
   primitives in §8.2 by hand against the JSX references.

6. **The amber color exists only in the favicon.** If you find yourself
   reaching for it for any other surface, stop and re-read §1.

7. **Open Batch 1 as a draft PR on day one.** Don't wait until UI lands
   to surface CI / fence issues — those need eyes immediately.

8. **Pixel parity > pixel perfection.** Match the design system; don't
   chase pixel-perfect Figma alignment that contradicts the tokens.

---

## 14. Ask the user before…

- Adding any dependency not in §4.
- Bumping the design-system submodule pin (visual diff might shift).
- Changing a token value (always upstream first).
- Touching anything inside `purepep-site/` from this repo.
- Skipping a fence in §10 even temporarily.
- Adding a new page route not in §7.
- Deviating from a preview card by more than antialiasing.

End of kickoff. Start with Batch 1.


