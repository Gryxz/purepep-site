# PurePep storefront — QA fix session handoff

> Temporary working doc. Hand-off from a Claude Code web session to a local
> Claude Code session. Delete before merging PR #7. Nothing here is shipping copy.

## 0. What this is / how to use it

A full desktop+mobile QA review was run against the **live** PurePep storefront
(via the Claude for Chrome extension). This doc captures: where the code
actually lives, the confirmed root causes already traced, the prioritized fix
plan with exact `file:line` targets, the LOCKED constraints you must not break,
and the image/asset work earmarked for Higgsfield.

**Pick up here:** start at §5 (confirmed root causes) and §6 (fix-first plan).
No code fixes have been committed yet — the working tree is clean.

---

## 1. Where everything lives (orientation)

- **Repo:** `Gryxz/purepep-site` (personal use). `main` only holds the README +
  hero JPEGs — the storefront is NOT on main.
- **Canonical storefront branch:** `claude/port-apple-swiss-design-29ktB`
  → open **draft PR #7** (base `claude/headless-v2-wc-api-CIsh1`). This is the
  branch the QA review was run against and the one we are fixing. **Commit
  directly onto it** (user-approved).
- **Stack above it:** `claude/port-apple-swiss-des-VO4Ft` (PR #8, mobile hero
  stagger) is based on 29ktB — be aware changes to 29ktB flow under it.
- **Tech:** Next.js (App Router) + TypeScript + Tailwind, `output: "export"`
  (static), `trailingSlash: true`. Package manager: **pnpm**.
- **Component split (this is finding #9):** `src/components/v3/*` = **desktop**,
  `src/components/v5/*` = **mobile**. They are separate implementations — most
  fixes must be applied in BOTH.
- **Live deploy target:** `https://phpstack-1617574-6380918.cloudwaysapps.com`
  (Cloudways, static export rsynced to nginx). Deploy is manual from a host with
  SFTP creds — NOT reachable from CI:
  ```sh
  rm -rf .next out && pnpm build
  rsync -av --delete out/ /home/master/applications/tupbkzzpnc/public_html/
  ```
  (This is why `/collections/all` returns a raw nginx 404 — see finding #3.)

### Related open PRs worth reading before editing
- **PR #10** `claude/bankful-verification-Mg5ZC` — content pack with
  `content/pages/faq.md`, `about.md`, `contact.md`, legal policies, checkout
  disclosures. **The FAQ copy already exists here** (see finding #1).
- **PR #9** affiliate backend (WP plugin) — relevant to referral/affiliate.
- **PR #5/#6** headless WC API + Apple-Swiss design system port.

---

## 2. Build / verify / deploy commands

```sh
pnpm install
pnpm fence       # token-fence check — see §3, MUST stay green
pnpm typecheck
pnpm lint
pnpm build       # static export → out/ ; all routes must prerender
pnpm dev         # local dev server for visual QA
```
There is no live WC backend in dev: catalog falls back to
`src/data/products.static.ts`, and WP-mirrored pages fall back to in-file stubs
(this is WHY the live FAQ shows a stub — §5).

---

## 3. LOCKED constraints — do not break these

1. **Token fence (`scripts/check-tokens-fence.ts`, run via `pnpm fence`):** no
   raw hex colors and no banned typefaces outside the sanctioned spots. Color
   values live as CSS custom properties; `globals.css` is the only place raw hex
   is allowed. When restyling CTAs use the EXISTING amber tokens already defined
   in `globals.css`: `--amber: #B8860B`, `--amber-light: #D4A017`,
   `--amber-cta: #C8890A`.
2. **Compliance copy is LOCKED and verbatim** (from `@design/tokens`):
   - `For research use only. Not for human consumption.`
   - `Sales restricted to qualified researchers, 21 and over.`
   - `All sales final. No refunds, no exchanges, no returns.`
   These are intentional (Bankful high-risk MCC underwriting). **Do NOT remove
   the "research use only" framing** — that reframes finding #4 (see §7).
3. **Headless contract:** `next.config.ts` stays `output: "export"`. No
   client-side WC fetches added in v3/v5 components. WC keys never in
   `NEXT_PUBLIC_*`.
4. Brand: no emoji, no exclamation marks, sentence case, amber reserved for
   primary actions only.

---

## 4. Decision log

- Find the real repo/branch → done: `claude/port-apple-swiss-design-29ktB`.
- User chose: **commit fixes directly onto 29ktB** (not a side branch).
- PR #7 already exists for 29ktB → do NOT open a new PR.
- Positioning/testimonials (#4) and any content-strategy calls: **flagged, not
  auto-fixed** — need user decision (§7).

---

## 5. Confirmed root causes (already traced — high confidence)

### "0." Bacteriostatic Water card description (finding #14) — ROOT CAUSE FOUND
The product data is fine (`src/data/products.static.ts:321` has a full
description starting `"0.9% benzyl alcohol..."`). The card renders a "first
sentence" via `description.split(".")[0] + "."`, so `"0.9%..."` → `"0."`.
Affected lines (all do the same naive split):
- `src/components/v3/CatalogPage.tsx:300` (`.lede`)
- `src/components/v3/CatalogPage.tsx:387` (`.v3-tile-sub`)
- `src/components/v3/HomePage.tsx:473` (`.v3-tile-sub`)
- `src/content/catalog.ts:41` (`const first = p.description.split(".")[0]`)
**Fix options:** (a) add a dedicated `short`/`tagline` field per product and
render that, or (b) split on `". "` (period+space) / regex `/\.\s/` so decimals
don't break. Option (a) is cleaner and lets copy be tuned per card. Any product
whose description starts with a decimal hits this bug, not just bac-water.

### FAQ "temporarily unavailable" + title "Faq" (finding #1) — ROOT CAUSE FOUND
`src/app/faq/page.tsx` calls `getPage("faq")`. Live build runs **non-strict**
(no `WC_BASE_URL`), so `src/lib/wp-pages.ts` → `fallbackPage("faq")`. "faq" is
NOT in `LEGAL_FALLBACKS` (`src/content/legal-fallbacks.ts`) and NOT in
`POLICY_SLUGS`, so it hits the generic stub: title `humanize("faq")` = "Faq" and
body "This page is temporarily unavailable."
**Fix:** add an `faq` entry to `LEGAL_FALLBACKS` using the real copy that
**already exists in PR #10 `content/pages/faq.md`**, and fix the title casing
("Faq" → "FAQ"). Footer/Contact/Quality all link to `/faq/`, so this also
clears three dead-end links.

### `[TBD]` stat on live PDP (finding #2) — LOCATED
`src/components/v3/PDPHero.tsx:58-63` — 4th entry in `STATS[]` with
`num: "[TBD]"`, `label: "Research Accounts Served"`, `placeholder: true`.
**Fix:** drop the 4th stat (grid becomes 3) or commit a real number. Then
audit: there are **9 more `PLACEHOLDER` markers** in
`src/data/products.static.ts` (price/lot/sku for GHK-Cu, MOTS-c, etc. — e.g.
`lot: "MO-0000-PLACEHOLDER"`). Lot/SKU placeholders may render on PDP/COA.
Grep before relaunch: `git grep -in "\[TBD\]\|PLACEHOLDER\|lorem"`.

### Bankful processor label (finding #18) — LOCATED
`src/components/v3/CheckoutPage.tsx:517` and
`src/components/v5/MobileCheckout.tsx:475`:
"Processed by Bankful · 256-bit SSL encryption". Also referenced in
`src/components/v3/PDPHero.tsx:420`, `src/components/AgeGateGuard.tsx`,
`src/app/age-gate/page.tsx`, `globals.css:4768` (`.v3chk-bankful-note`).
Bankful is the actual processor (see PR #10) — likely can't swap it, but can
hide the brand label and add Apple/Google/Shop Pay express buttons.

### "Forwarding test" recent request (finding #5) — LIKELY A NON-BUG
`src/components/contact/ContactPage.tsx` loads "recent requests" from
`localStorage` (`TICKETS_KEY`, see `useEffect` ~line 106). The
"Forwarding test" entry was the reviewer's OWN prior test submission persisted
on the review device — not seeded in code. Optional hardening: keep the section
hidden when empty (it already conditionally renders). Verify before "fixing".

### Hours format (finding #16) — LOCATED
`src/components/contact/ContactPage.tsx:513` → "Mon–Fri · 9–17 · 1 business
day". Also `src/content/legal-fallbacks.ts:56,195` ("9:00–17:00"). Fix to a
US-friendly format and STATE THE TIMEZONE (currently unstated).

### "01/02" count motif (finding #25) — LOCATED, design motif
`String(n).padStart(2,"0")` is a deliberate mono-numeral motif used widely:
`src/components/storefront/Header.tsx:183,248`, `CartDrawer.tsx:35`,
`BuyBox.tsx:33`, `v3/CatalogPage.tsx:174,185,186`, `referral/page.tsx:326`.
Subjective — only change the header cart badge if desired; leave the carousel
"01 / 03" captions (intentional).

---

## 6. Fix-first plan (prioritized; from the QA review's own ordering)

Status legend: [TRACED]=root cause + file:line known, [LOCATE]=needs a short
search, [DECISION]=needs user sign-off (§7), [STRUCT]=larger refactor.

1. [DECISION] **Marketing/legal split-brain (finding #4).** Replace human
   before/after testimonials with lab-grade evidence. Keep the locked
   disclaimer. See §7. Components: `v3/TestimonialsSection.tsx`,
   `v3/HomePage.tsx`, mobile equivalents; assets `public/images/testimonials/
   transform-1..3.jpg`, `avatar-1..3.jpg`.
2. [TRACED] **Remove placeholders.** `[TBD]` stat (PDPHero.tsx:58-63); FAQ real
   content + "FAQ" casing (wp-pages/legal-fallbacks, copy from PR #10);
   bac-water "0." (the split bug, §5); 9 data PLACEHOLDERs in
   products.static.ts. Grep the whole tree first.
3. [LOCATE] **Conversion CTAs.** Make cart "Continue to checkout" + checkout
   "Place order" the strongest amber buttons. Currently muddy-olive/ghost.
   Files: `cart/CartPage.tsx`, `cart/CartDrawer.tsx`, `v3/CheckoutPage.tsx`,
   `v5/MobileCheckout.tsx`, styles in `globals.css` (use `--amber*` tokens).
4. [LOCATE] **Mobile sticky bottom nav overlaps content (finding #6) + cart
   badge desync (finding #7).** Add bottom padding equal to bar height on every
   scroll container; HIDE the bar on `/checkout/*`. Bar: `v5/MobileShell.tsx` /
   `v3/TabBar.tsx`. Badge: rehydrate from same cart source on first paint
   (`cart-store.ts`, `storefront/Header.tsx`).
5. [LOCATE] **Branded 404 + `/collections/*` alias (finding #3).** Static export
   on nginx returns raw 404. Add `src/app/not-found` handling and/or nginx
   alias `/collections/* → /shop/*`. Coordinate with the Cloudways nginx config.
6. [STRUCT] **Unify PDP + eligibility copy across breakpoints (finding #9).**
   `v3/PDPHero.tsx` (desktop: 3-tier card, dose toggle, COA card, amber CTA) vs
   `v5/MobilePDP.tsx` (single price, black CTA, no COA card). Port the desktop
   affordances down; use amber CTA on mobile; restore the "21+ qualified
   researcher, in vitro" attestation on mobile checkout (it weakens to a generic
   "I agree to Terms" — `v5/MobileCheckout.tsx`).
7. [DECISION+ASSET] **Hero reshoot/relayout (findings #7, #22).** Replace dark
   warehouse plate (`public/hero/lab.jpg` desktop, mobile hero) with a clean
   product-on-color composition; fix mobile vial overlap (CAGRI hidden behind
   SEMA). → Higgsfield, §8.
8. [STRUCT] **Two-column cart + checkout on desktop (finding #17).** Currently
   single-column centered on a wide canvas. Items left / sticky amber-CTA
   summary right. `cart/CartPage.tsx`, `v3/CheckoutPage.tsx`, `globals.css`.
9. [LOCATE] **Express wallet buttons (finding #18).** Add Apple/Google/Shop Pay
   at top of checkout (and cart); drop visible "Bankful" label; reconcile footer
   payment icons across viewports (desktop shows VISA/MC only; mobile shows
   more) — `MobileFooter.tsx` vs desktop footer.
10. [LOCATE] **Trust-strip alignment (findings #10, #11).** Desktop strip starts
    at x=0 — align to content grid (`v3/TrustBar.tsx`). Mobile ticker clips
    first item / no reduced-motion fallback — lock to viewport or make a static
    two-row chip group.
11. [LOCATE] **Mobile header opacity (finding #13).** Transparent sticky header
    lets body text bleed through the wordmark on scroll — make opaque/blurred
    after ~24px scroll. `v5/MobileShell.tsx` + `globals.css`.
12. [LOCATE] **Polish pass.** Unify input radii (define sm/md/pill tokens);
    raise contrast on "Free shipping unlocked" bar (`cart/CartDrawer.tsx`);
    visible focus rings on amber buttons; hours format (§5); reconcile category
    labels between mobile home chips and desktop catalog filters
    (`v5/MobileHomePage.tsx` vs `v3/CatalogPage.tsx`); optional "01/02"→"1/2" on
    the header cart badge only.

---

## 7. Needs a decision before coding

- **Testimonials vs locked research posture (finding #4 / fix-first #1).** The
  "research use only / 21+ qualified researcher" copy is a LOCKED compliance
  token and cannot be removed. The human weight-loss before/after section
  (`transform-*.jpg`, "Marcus W. −38 lbs") directly contradicts it and is the
  biggest premium-feel + regulatory risk. Recommended: replace with lab evidence
  (COA excerpts, HPLC/MS traces, instrument photography, purity-focused quotes).
  **Confirm the brand posture (B2B research vs consumer) before building**, and
  confirm we're removing the human testimonials.
- **Hero direction (#7/#22):** confirm the new hero concept before generating
  assets (clean product-on-color vs current moody warehouse).
- **`/collections/*` (#3):** branded Next 404 vs nginx alias — depends on who
  controls the Cloudways nginx config.

---

## 8. Image / asset work for Higgsfield

Higgsfield (AI image/video) is the user's intended tool for the imagery upgrades.
Current assets:

```
public/hero/lab.jpg            # dark warehouse hero (desktop) — REPLACE (#22)
public/hero/reta.jpg           # mobile hero plate
public/images/products/source/purepep-vial-<compound>-v1.0.jpg        # plain
public/images/products/source/purepep-vial-<compound>-chroma-v1.0.jpg # on-color
public/images/products/source/purepep-vial-<compound>-v1.0-cutout.png # transparent
public/products/<slug>/hero.png + label-photo.png
public/images/testimonials/transform-1..3.jpg, avatar-1..3.jpg        # see §7
```

**Asset-treatment inventory (consistency gap — finding #14/#15):**
- Have `chroma` (product-on-color, premium) + `cutout` (transparent): bpc-157,
  cagri, ghk-cu, mots-c, reta, sema, tb-500, tirz.
- **Only have plain source jpg (NO chroma/cutout): bac-water, glp-stack,
  healing-stack, ipamorelin, recovery-stack, survo.** ← generation gap.

**Higgsfield targets, mapped to findings:**
1. **Hero (#7/#22):** clean, premium product-on-color hero composition (desktop
   wide + mobile portrait crops). Optionally a subtle motion/video hero
   (note: mobile already has a CSS-only entrance stagger from PR #8 — keep the
   "no Framer Motion" contract on v5).
2. **Cart line-item thumbnails (#15):** the drawer shows low-fi grey vial
   silhouettes (likely the `cutout` PNGs on a plain bg). Generate consistent
   square `chroma`-style crops at 2× for all SKUs, esp. the 6 missing ones, so
   catalog + cart match.
3. **Lab-evidence imagery (#4, if approved):** instrument/assay-style visuals
   (HPLC traces, vials under lab lighting, COA close-ups) to REPLACE the human
   before/after. **Do not generate fake people / fake clinical results** — keep
   it equipment/data, consistent with the research posture.
4. **Catalog photography consistency (#14 imagery, premium feel):** unify
   treatment/aspect ratio across all product cards.

When generating: match the locked palette (bone `#FAF7F0`, loden/ink `#3D4232`/
`#1F1F1F`, amber accents only), keep aspect ratios consistent, export at 2×.

---

## 8a. Potential uses for the SVG label card (`LabelCropSvg`)

Open idea (not decided). Three product-visual systems exist:
- **Photoreal vial JPGs** (`public/images/products/source/purepep-vial-<slug>-v1.0.jpg`)
  — already live on catalog cards + PDP; rival the AXIS reference. Exist for 8
  SKUs only.
- **`src/components/v3/LabelCropSvg.tsx`** — code-rendered "big RETA card"
  (parametric parchment spec label: compound, dose, LOT, EXP, RUO). Currently
  live ONLY on the desktop homepage (`HomePage.tsx:131`).
- **`src/components/v3/RetaVial.tsx`** — large SVG vial, now ORPHANED (imported
  in CatalogPage/PDPHero but those render the JPG). Candidate for deletion.

The SVG label's unique edge vs the photos: parametric (any compound/dose/lot
from data), tiny + crisp at any size, and can show the REAL lot number a static
photo can't. Best-fit uses (where photos fall short — NOT side-by-side with a
photoreal vial, since the flat parchment is a different visual language):
1. **Universal fallback image** for the 6 SKUs with no photoreal render
   (bac-water, glp-stack, healing-stack, ipamorelin, recovery-stack, survo) so
   the catalog looks complete before Higgsfield fills the photo gaps.
2. **Cart line-item thumbnails** (finding #15, currently low-fi silhouettes) —
   one consistent all-SKU treatment, near-zero payload.
3. **PDP "label detail" beat next to the COA** — show the actual LOT matching the
   certificate (authenticity signal).
4. **OG / social share images** — a per-PDP parametric label card.

Note: our photoreal vials ALREADY carry a printed label (PurePep, mg, compound,
CAS, RUO), so adding a second big label card beside them (pure AXIS style) is
redundant/busy. A full AXIS-style spec PANEL would also need new data — records
have `cas` + `purity` but no molecular weight / molecular formula.

## 9. What was NOT done this session

- No code edits committed (working tree clean at handoff; only this doc added).
- No fixes verified in-browser (web session; do visual QA locally with
  `pnpm dev` per finding, on both desktop ~1440px and mobile 390×844).
- Positioning/testimonials and hero direction left for user decision (§7).
