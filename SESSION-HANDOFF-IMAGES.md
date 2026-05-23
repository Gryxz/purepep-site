# PurePep — image-generation session handoff

> Temporary working doc. Hand-off to a fresh local Claude Code session that can
> drive the **Higgsfield MCP** (this session could not — the server was added but
> never authenticated, and its tools never loaded). Goal prompt to paste into
> `/goal` is at the very bottom (§10).

## 0. Pick up here

All code-side work from the prior QA-fix plan (`SESSION-HANDOFF.md` §6, items
A–G + testimonials + a cart-badge hydration fix) is **done, committed, pushed,
and visually QA'd** — 10 green commits on `claude/port-apple-swiss-design-29ktB`
(`78a5ee1..3109fab`). The ONLY remaining launch-blockers are visual/asset:

1. **Hero (#7/#22)** — replace the dark warehouse plate with a clean
   product-on-color composition.
2. **6 "gap" SKUs (#11/#14/#15)** — they have a plain vial jpg but **no chroma
   and no cutout**. Generate the missing treatments so the catalog/cart are
   visually consistent with the 8 complete SKUs.
3. (Data, non-image) **ghk-cu / mots-c prices** are still placeholder values
   ($65 / $95) — see §8.

Everything needed to do the image work is below. Generate in Higgsfield, drop
files at the exact documented paths, run `pnpm vial-cutout`, then verify with the
Playwright harness (§7) and assemble a contact sheet for a Claude-vision pass.

## 1. Repo / branch / build

- Repo `/home/zay/purepep-site`, branch `claude/port-apple-swiss-design-29ktB`
  (PR #7; PR #8 is stacked on top — don't break it). pnpm · Next 15 ·
  `output: "export"`.
- After any change: `pnpm fence && pnpm typecheck && pnpm lint && pnpm build`
  must pass. NOTE: `pnpm lint` has **81 pre-existing stylelint errors** in
  globals.css (baseline) that the user chose to clear with a single
  `stylelint --fix` commit at the very end — so the working gate is
  fence+typecheck+build green AND stylelint not above 81. Image work touches no
  CSS, so this won't move.
- LOCKED (carry over): compliance copy verbatim incl. "research use only"; no
  emoji / no exclamation marks / sentence case; amber for primary actions only;
  no raw hex outside globals.css (image files are exempt — they're assets).

## 2. Higgsfield MCP — what's wired, what you must do

- Already added to **user config**: `higgsfield` → `https://mcp.higgsfield.ai/mcp`
  (http transport). Verify with `claude mcp get higgsfield`.
- Status will read **"Needs authentication."** Auth is interactive and cannot be
  done programmatically: in the Claude Code prompt type **`/mcp`** → select
  **higgsfield** → **Authenticate** (completes an OAuth browser flow).
- After authenticating you very likely need to **restart the session** so the
  `higgsfield` tools register (they are not in the deferred-tools list until a
  fresh start). Confirm with ToolSearch `+higgsfield` — you should see the
  generation tools before proceeding.
- If Higgsfield still can't be driven, fall back to: user generates in the
  Higgsfield web app and drops files at the §6 paths; you run `pnpm vial-cutout`.

## 3. The canon SKU manifest (authoritative source for prompts)

Use the live file **`src/lib/labels/skus.ts`** (Canon v1.2) as the source of
truth — it carries, per SKU: `abbreviation`, `fullName`, `cas`, `dose`,
`labelBg` (label-paper color), and `backdropUpper` / `backdropShelf` (the exact
seamless-paper colors to composite the chroma shot onto). The user supplied
`purepep-packaging-skus.zip` containing this file + the existing rendered labels
(`public/brand/labels/*.png`) + the current source images. The canon data
CORRECTS errors in the old `SESSION-HANDOFF.md` §8b table (e.g. **survo is
5 MG, CAS 2381085-61-4**, not 10 MG / 1510265-99-0).

The reference look to match is **`public/images/products/source/purepep-vial-reta-v1.0.jpg`**
(plain) and any existing `*-chroma-v1.0.jpg` (e.g. reta/sema/tirz) for the chroma
background treatment.

## 4. Deliverables + exact output paths

The 8 complete SKUs (reta, sema, tirz, cagri, bpc-157, tb-500, ghk-cu, mots-c)
already have plain + chroma + cutout — **do not touch them**. Generate for the
**6 gap SKUs** below. The code already resolves these paths with no change
(catalog/PDP use `/images/products/source/purepep-vial-<slug>-v1.0.jpg`).

Per gap SKU, produce:
- `public/images/products/source/purepep-vial-<slug>-v1.0.jpg` — plain, seamless
  near-white background (the one the cards use). Plain jpgs already exist for the
  6 but were generated ad hoc; regenerate to match the reta house style if they
  don't.
- `public/images/products/source/purepep-vial-<slug>-chroma-v1.0.jpg` — same vial
  on the SKU's tonal backdrop (use that SKU's `backdropUpper`/`backdropShelf`
  from skus.ts; match the exact framing of an existing `*-chroma-v1.0.jpg`).
- `public/images/products/source/purepep-vial-<slug>-v1.0-cutout.png` — DO NOT
  generate by hand; derive from the plain jpg with
  **`pnpm vial-cutout --only <slug>`** (flags: `--force` to re-roll,
  `--attempts N`).

Hero (#7/#22):
- `public/hero/lab.jpg` — REPLACE (desktop wide hero; currently dark warehouse).
- `public/hero/reta.jpg` — mobile hero plate (portrait crop).

## 5. Higgsfield prompts (filled with canon data)

**House-style base prompt (single powder vial):**
> Photorealistic studio product photo of one small clear glass pharmaceutical
> vial, upright and centered. Brushed aluminum crimp cap over a dark grey rubber
> stopper. Bottom third filled with white lyophilized (freeze-dried) peptide
> powder. Wrapped paper label in {LABELBG} paper. Label top row: a small solid-
> black square glyph beside the "PurePep" wordmark (Inter, heavy) on the left, a
> solid-black "{DOSE}" badge on the right. Center: "{ABBR}" in very large bold
> black condensed sans. Below: "{FULLNAME}" then "CAS {CAS}" in monospace. A
> solid black band across the lower label reads "FOR RESEARCH USE ONLY · NOT FOR
> HUMAN CONSUMPTION" in small white mono caps. Soft even lighting, seamless near-
> white background, subtle reflection and shadow under the vial. Sharp focus,
> high detail, 4:5 portrait, no people, label is the only text.

Chroma variant: append "place the vial on a soft tonal gradient backdrop from
{BACKDROP_UPPER} (upper) to {BACKDROP_SHELF} (shelf)" and match the framing of an
existing `*-chroma-v1.0.jpg`.

**Single-vial gap SKUs:**
| slug | {ABBR} | {FULLNAME} | {DOSE} | {CAS} | {LABELBG} | backdrop upper / shelf |
|---|---|---|---|---|---|---|
| `ipamorelin` | IPA | Ipamorelin | 5 MG | 170851-70-4 | #8B6BAE | #DDD0E8 / #C4B0D6 |
| `survo` | SURVO | Survodutide | 5 MG | 2381085-61-4 | #D4874A | #F0DEC8 / #D9BC96 |

**Stack gap SKUs — TWO vials side by side, each with its own label** (replace the
single-vial line with "two identical vials standing side by side, each with its
own label"; dose pill "10 MG" on both; CAS band omitted, show only the two
compound names):
| slug | {ABBR} | vial 1 | vial 2 | backdrop upper / shelf |
|---|---|---|---|---|
| `healing-stack` | HEAL | "BPC" / BPC-157 / 5 MG | "TB500" / TB-500 / 5 MG | #E8D0CC / #C8A8A4 |
| `glp-stack` | GLPS | "RETA" / Retatrutide / 5 MG | "CAGRI" / Cagrilintide / 5 MG | #F0E8D5 / #D8C8A8 |
| `recovery-stack` | RECOV | "BPC" / BPC-157 / 5 MG | "IPAM" / Ipamorelin / 5 MG | #D8C8DC / #B8A0C0 |

**`bac-water` (BAC WATER) — liquid, NOT powder, not in skus.ts:**
> Photorealistic studio product photo of one clear glass 30 mL multi-dose vial,
> upright and centered, filled with clear colorless liquid (NOT powder). Aluminum
> flip-off cap over a grey rubber stopper. Wrapped parchment-cream paper label:
> small black glyph + "PurePep" wordmark top-left, "30 mL" badge top-right, "BAC
> WATER" in large bold black sans center, "0.9% BENZYL ALCOHOL" in mono below, and
> a black band "FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION". Soft even
> lighting, seamless near-white background, subtle reflection. 4:5 portrait, no
> people. (Chroma backdrop: parchment-cream, upper #F0DEC8 / shelf #D9BC96.)

**Hero (replace `public/hero/lab.jpg`):**
> Premium, minimal hero composition: the PurePep RETA vial (clean glass,
> parchment label, aluminum cap) on a soft tonal product-on-color background
> (upper #f3ead9 to shelf #d4c5a7) with generous negative space on the LEFT for
> headline text. Soft directional studio light, gentle floor reflection, no
> warehouse/lab clutter, no people. Render a wide 16:9 for desktop AND a 4:5
> portrait crop for mobile (`public/hero/reta.jpg`).

Global constraints for ALL generations: locked palette (bone #FAF7F0, loden/ink
#3D4232 / #1F1F1F, amber accents only), consistent framing/aspect, export at 2×,
and NO fake people / NO fake clinical results.

## 6. Pipeline per SKU

1. Generate plain + chroma in Higgsfield; download.
2. Drop at the exact paths in §4 (overwrite if regenerating).
3. `pnpm vial-cutout --only <slug>` to derive the cutout PNG.
4. Repeat for all 6 gap SKUs + the hero (hero has no cutout step).
5. `pnpm build` (must stay green), then verify (§7).
6. Commit per small batch (e.g. one commit per 2–3 SKUs) and push. Don't break
   PR #8.

## 7. Verification harness (already built, reusable)

A Playwright QA harness exists at the repo root (untracked, safe to reuse or
delete): `pp-qa.mjs` (captures every key page at 1440 + 390, seeds the cart, sets
the `pp_age_verified=1` + `pp_cookie_consent=1` cookies so real content renders,
and reports broken images + console errors) and `pp-sheet.mjs` (assembles
`/tmp/pp-qa/CONTACT-SHEET.png`). Run `pnpm dev` first, then
`node pp-qa.mjs && node pp-sheet.mjs`. Imports `@playwright/test` (chromium is
installed). Confirm **every SKU resolves to a real image (broken:0)** on
`/shop/<slug>/` for all 6, then hand the contact sheet to the user for the
Claude-vision quality pass at desktop (1440) + mobile (390).

## 8. Non-image open item

`src/data/products.static.ts` — ghk-cu (`price: 65.0`, `sku: PP-GHKCU-050`) and
mots-c (`price: 95.0`, `sku: PP-MOTSC-010`) are flagged `// PLACEHOLDER`. Values
render plausibly but are not confirmed against WooCommerce. Get the real numbers
from the user (or `pnpm wc:audit`) and drop them in. Lots were already fixed.

## 9. Definition of done (carry over from the goal)

Every §6 item resolved; no `[TBD]`/`PLACEHOLDER` left (the data ones above);
build green; **visual QA passed on both breakpoints** with a Claude-vision pass
over the contact sheet; all 6 gap SKUs resolve to real chroma + cutout images;
hero replaced.

## 10. Goal prompt for the fresh session

Paste into `/goal`:

> Finish the PurePep storefront imagery. Source of truth: SESSION-HANDOFF-IMAGES.md
> (repo root) — read ALL of it first, plus §3/§8b of SESSION-HANDOFF.md. Confirm
> you're in /home/zay/purepep-site on branch claude/port-apple-swiss-design-29ktB
> and `git pull`. All code work is already done (10 commits); only assets remain.
>
> First: authenticate Higgsfield — run `/mcp` → higgsfield → Authenticate, then
> (if needed) restart so the tools load; confirm with ToolSearch `+higgsfield`.
> If it still won't drive, tell me and I'll generate in the Higgsfield web app and
> drop files at the documented paths for you to run `pnpm vial-cutout`.
>
> Then generate, using the canon data in src/lib/labels/skus.ts and the filled
> prompts in SESSION-HANDOFF-IMAGES.md §5: (a) the 6 gap SKUs — ipamorelin, survo,
> bac-water, glp-stack, healing-stack, recovery-stack — each gets plain +
> chroma at the §4 paths, then `pnpm vial-cutout --only <slug>` for the cutout;
> (b) a new clean product-on-color hero replacing public/hero/lab.jpg + the
> public/hero/reta.jpg mobile crop. Match the reta house style.
>
> Hard rules: keep output:"export"; compliance copy verbatim; no emoji/exclaims;
> after each batch `pnpm fence && pnpm typecheck && pnpm lint && pnpm build` green
> (stylelint baseline is 81, don't exceed) and commit+push in small batches
> without breaking PR #8. Verify every SKU resolves to a real image with the
> Playwright harness (pp-qa.mjs / pp-sheet.mjs, §7), then give me a contact sheet
> at 1440 + 390 for a vision pass. Also: ask me for the real ghk-cu/mots-c prices
> (§8) and drop them in. Done = all 6 gap SKUs have real chroma+cutout, hero
> replaced, no PLACEHOLDER left, build green, visual QA passed on both breakpoints.
