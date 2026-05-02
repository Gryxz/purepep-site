# PurePep storefront

Next.js + WooCommerce-headless frontend for **PurePep** (purepep.shop).

The brand source of truth lives in the sibling repo
[`gryxz/purepep-site`](https://github.com/gryxz/purepep-site), pulled here as
a git submodule under `purepep-site/`. Tokens, components, prototypes, and
compliance copy are all imported from that submodule via the `@design`
TypeScript path alias.

## Stack

- Next.js 15 (App Router) + React 19
- Tailwind v4 (CSS-first `@theme` reading the canonical token vars)
- TypeScript strict mode
- pnpm + Husky + lint-staged

## Quickstart

```bash
git clone <this repo>
cd purepep-storefront
git submodule update --init --recursive
pnpm install
pnpm dev
```

## Design system

Read **`purepep-site/design-system/README.md`** before writing UI code.
Visual rules not encoded in tokens (one blush band per page, hero ≥ 60vh,
sentence case, no emoji, etc.) are enforced there.

Token consumption matrix:

| Need                 | Path                                              |
|----------------------|---------------------------------------------------|
| Typed tokens         | `@design/tokens` (TS module)                      |
| CSS variables        | `purepep-site/design-system/colors_and_type.css`  |
| Component reference  | `purepep-site/design-system/ui_kits/storefront/*` |
| Brand bible          | `purepep-site/design-system/README.md`            |

To bump the design pin:

```bash
git submodule update --remote purepep-site
git add purepep-site && git commit -m "Bump design-system pin"
```

## Fences

Three layers of guardrails block design drift:

1. **ESLint** — bans hex literals and template-literal hex in `src/`.
2. **Stylelint** — bans `box-shadow`, gradient `background-image`, hex colors in CSS.
3. **`scripts/check-tokens-fence.ts`** — bans arbitrary Tailwind values
   (`bg-[#xxx]`, `w-[123px]`), inline `style={{ … #xxx … }}`, banned
   typefaces, and hand-typed compliance strings.

All three run in CI on every PR.

## Routing

See `docs/STOREFRONT_KICKOFF_V3.md` in the `purepep-site` repo for the full
page map and delivery batches. Batch 1 (this commit) ships the foundation
plus a Batch 4 RETA PDP hero spike at `/shop/reta`.

## Deploy

Static export → Cloudways storefront app via SSH / Shell-In-A-Box:

```bash
# 1. Build the static site.
rm -rf .next out
pnpm install --frozen-lockfile
pnpm build

# 2. Sync to public_html.
#
# IMPORTANT: --exclude='index.txt' is required.  Next.js App Router emits
# a per-route `index.txt` next to each `index.html` as the RSC payload
# used by <Link>-based client navigation.  nginx on Cloudways will happily
# serve `/foo/index.txt` as raw text when the URL is requested directly
# (search-engine indexing, paste into address bar, browser pre-fetch),
# leaking the React serialization payload as a public-facing page.
# Excluding them from rsync keeps the static HTML the only thing nginx
# can hand back; the client router falls back to a hard navigation on
# the rare cold-transition case, which is acceptable.
rsync -av --delete --exclude='index.txt' \
  out/ /home/master/applications/<storefront-app-id>/public_html/

# 3. Smoke test.
curl -I https://purepep.shop/
curl -I https://purepep.shop/documentation/
```
