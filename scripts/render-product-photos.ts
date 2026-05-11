#!/usr/bin/env tsx
/**
 * Generates one hero product photograph per SKU via Higgsfield.
 *
 * Canonical vial geometry is locked by two reference photos:
 *   references/sema-10mg.jpg   — primary geometry + lighting lock
 *   references/tb-500-10mg.jpg — secondary geometry confirmation
 *
 * Per SKU: photography label (τ glyph, no dose) fed as 3rd reference.
 * Output: public/products/{slug}/hero.png
 * Contact sheet: public/products/_contact-sheet.png
 *
 * Run:
 *   pnpm products                   # all 8 SKUs
 *   pnpm products --only reta       # one SKU
 *   pnpm products --force           # re-roll existing
 *   pnpm products --attempts 5      # max retries per SKU (default 5)
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { LABEL_SKUS, type LabelSku } from "../src/lib/labels/skus.js";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BRAND_DIR = join(ROOT, "public", "brand", "products");
const PRODUCTS_DIR = join(ROOT, "public", "products");
const PHOTOREF_DIR = join(ROOT, "references", "photoref-labels");
const SOURCE_DIR = join(ROOT, "public", "images", "products", "source");

// Sole geometry reference — all SKUs locked to RETA's vial angle/framing
const REF_GEOMETRY = join(BRAND_DIR, "reta-10mg.jpg");

// Map slug → v1.6 photoref label PNG (source of truth for label artwork)
const SLUG_TO_PHOTOREF: Record<string, string> = {
  "reta":    "purepep-photoref-RETA-v1.6.png",
  "sema":    "purepep-photoref-SEMA-v1.6.png",
  "tirz":    "purepep-photoref-TIRZ-v1.6.png",
  "cagri":   "purepep-photoref-CAGRI-v1.6.png",
  "bpc-157": "purepep-photoref-BPC-157-v1.6.png",
  "tb-500":  "purepep-photoref-TB-500-v1.6.png",
  "ghk-cu":  "purepep-photoref-GHK-Cu-v1.6.png",
  "mots-c":  "purepep-photoref-MOTS-c-v1.6.png",
};

// Per-SKU color language — descriptive name drives AI color intent,
// hex anchors lock the exact values. backdropWall / floor override
// skus.ts where the user has specified tighter values.
interface ColorSpec {
  labelHex:      string; // exact vial label hex
  labelDesc:     string; // plain-language vial label color
  gradientTop:   string; // background gradient — top hex (lighter)
  gradientBottom: string; // background gradient — bottom hex (slightly deeper)
  negative:      string; // colors to explicitly exclude
}

const SKU_COLORS: Record<string, ColorSpec> = {
  "reta": {
    labelHex:      "#EFE6D6",
    labelDesc:     "warm cream bone label, hex #EFE6D6",
    gradientTop:   "#F5EFE0",
    gradientBottom: "#E8DCC4",
    negative: "no pure white, no grey, no yellow, no pink, no green, no cool tones, no saturated dark background",
  },
  "sema": {
    labelHex:      "#F3D9C6",
    labelDesc:     "soft peach label, hex #F3D9C6",
    gradientTop:   "#FAE5D5",
    gradientBottom: "#F2C8B0",
    negative: "no mint, no green, no white, no cream, no grey, no cool tones, no rose-pink, no saturated dark background",
  },
  "tirz": {
    labelHex:      "#D9D2E8",
    labelDesc:     "soft lavender label, hex #D9D2E8",
    gradientTop:   "#E5DEEC",
    gradientBottom: "#C9BFD8",
    negative: "no white, no cream, no grey, no pink, no blue-dominant, no green, no saturated dark background",
  },
  "cagri": {
    labelHex:      "#CDDBC7",
    labelDesc:     "soft sage mint label, hex #CDDBC7",
    gradientTop:   "#E0E9D6",
    gradientBottom: "#C7D6B8",
    negative: "no peach, no yellow, no cream, no white, no grey, no pink, no warm tones, no saturated dark background",
  },
  "bpc-157": {
    labelHex:      "#EDA89C",
    labelDesc:     "warm coral label, hex #EDA89C",
    gradientTop:   "#F5D8CE",
    gradientBottom: "#EAB5A8",
    negative: "no dusty pink, no mauve, no rose, no cool pink, no lavender, no white, no grey, no saturated dark background",
  },
  "tb-500": {
    labelHex:      "#E1C5C2",
    labelDesc:     "soft dusty rose label, hex #E1C5C2",
    gradientTop:   "#ECD9D5",
    gradientBottom: "#D8B8B0",
    negative: "no lavender, no purple, no cool tones, no blue, no grey, no white, no cream, no green, no saturated dark background",
  },
  "ghk-cu": {
    labelHex:      "#B8CDD9",
    labelDesc:     "pale powder blue label, hex #B8CDD9",
    gradientTop:   "#E0E8EE",
    gradientBottom: "#BFD0DC",
    negative: "no pink, no peach, no mauve, no lavender, no white, no cream, no grey, no green-dominant, no saturated dark background",
  },
  "mots-c": {
    labelHex:      "#C4D9D4",
    labelDesc:     "cool celadon label, hex #C4D9D4",
    gradientTop:   "#DDE9E6",
    gradientBottom: "#BCD0CB",
    negative: "no warm tones, no yellow, no pink, no pure mint green, no pure powder blue, no grey, no white, no saturated dark background",
  },
};

// ---------------------------------------------------------------------------
// BAC Water — special 9th SKU, bone colorway, clear liquid
// ---------------------------------------------------------------------------

function bacWaterPrompt(): string {
  return `Use the attached reference image (reta-10mg.jpg) — KEEP all brand \
identity intact: aluminum crimp cap (silver, NOT colored), PurePep wordmark, \
dosage badge in upper-right corner of label, large bold sans-serif product \
name, "FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION" black band, \
descriptor and CAS in monospace. These brand elements MUST match the \
reference exactly.

KEY CHANGE — the vial contents:
- The vial is filled with CLEAR COLORLESS LIQUID (water), NOT white \
crystalline powder
- The liquid fills approximately 65% of the vial height (higher than the \
peptide powder fill)
- Visible meniscus at the top of the liquid level
- Clear glass with subtle light refraction through the liquid

COLOR — BONE/CREAM colorway (universal PurePep utility colorway):
- Vial label: pale bone, hex #FAF7F0 — the LIGHTEST layer
- Backdrop: DEEPER warm bone, hex #DDD2BD — like aged ivory, oat milk, \
soft parchment, weathered linen
- Floor: DEEPEST bone, hex #C7B89E — like aged paper, antique muslin, \
faded canvas
- CLEAR 3-TIER DEPTH HIERARCHY: 15–20% lightness gap from label down to \
floor. Reads as "clean / clinical / universal utility" — distinct from \
the saturated peptide colorways.

PRODUCT INFO on the label:
- Product name: "BAC" in massive black bold sans-serif
- Descriptor: "BACTERIOSTATIC WATER" in small uppercase monospace
- Sub-info: "0.9% BENZYL ALCOHOL" in small uppercase monospace
- Dosage badge top-right: "30 ML" in white sans-serif on black rounded \
rectangle (replaces "10 MG")
- "FOR RESEARCH USE ONLY · NOT FOR HUMAN CONSUMPTION" black band at bottom

Everything else (cap shape, glass material, label architecture, lighting \
direction, framing, contact shadow) matches the reference exactly.

NEGATIVE:
NO white crystalline powder (must be clear liquid), NO colored cap \
(aluminum silver only), NO blue-tinted or colored liquid (water is clear \
and colorless), NO foam, NO bubbles, NO carbonation, NO different vial \
shape, NO pale washed-out backdrop, NO inverted lightness hierarchy, NO \
removal of PurePep wordmark or 30 ML badge, NO generic pharmacy stock \
photography aesthetic.`;
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  force: boolean;
  only: string | null;
  maxAttempts: number;
  noRef: boolean;       // skip all reference images (pure prompt generation)
  refImage: string | null; // override reference image path
  bac: boolean;         // render bac water as 9th SKU
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { force: false, only: null, maxAttempts: 5, noRef: false, refImage: null, bac: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force" || argv[i] === "-f") args.force = true;
    else if (argv[i] === "--only" && argv[i + 1]) args.only = argv[++i]!;
    else if (argv[i] === "--attempts" && argv[i + 1]) {
      args.maxAttempts = Math.max(1, parseInt(argv[++i]!, 10) || 5);
    }
    else if (argv[i] === "--no-ref") args.noRef = true;
    else if (argv[i] === "--ref" && argv[i + 1]) args.refImage = argv[++i]!;
    else if (argv[i] === "--bac") args.bac = true;
  }
  return args;
}

// ---------------------------------------------------------------------------
// Prompt template — geometry locked to both reference images
// ---------------------------------------------------------------------------

function buildPrompt(sku: LabelSku): string {
  const col = SKU_COLORS[sku.slug];
  if (!col) throw new Error(`No color spec for slug: ${sku.slug}`);

  return `Use the attached reference image (reta-10mg.jpg) — KEEP all brand \
identity intact: aluminum crimp cap (silver, NOT colored), PurePep wordmark, \
10 MG badge in upper-right corner of label, large bold sans-serif product \
name, "FOR RESEARCH USE ONLY" black band, CAS number in monospace, white \
crystalline powder fill at ~40% of vial. These brand elements MUST match \
the reference exactly.

VIAL TREATMENT: keep the reference's three-quarter front photographic style. \
The vial is 3D-rendered photographic, NOT flat. Same cap, same glass, same \
label architecture, same powder. Vial label color: ${col.labelDesc}.

NEW COMPOSITION — side-by-side layout, NO overlap:
- LEFT zone (~45% width): flat spec card, fully visible, NOT obscured
- RIGHT zone (~45% width): the 3D photographic vial, fully visible, NOT obscured
- Small visual gap between the two — they do NOT overlap at all
- Card and vial sit side-by-side on the same backdrop, catalog split layout

SPEC CARD (flat 2D graphic, NOT a 3D paper card):
- Flat rectangular card, face-on, NO perspective, NO tilt
- Near-white background, hex #FAF7F0
- Slightly rounded corners (4px)
- Minimal drop shadow or no shadow — sits flat on the backdrop, NOT lifted
- Card is mostly blank — placeholder text only, real text overlaid by React
- Optional minimal PurePep wordmark in upper-left of card
- Reads as a designed graphic overlay, NOT a physical object

BACKGROUND:
- Subtle pale gradient — top ${col.gradientTop} fading to bottom \
${col.gradientBottom}
- Gentle vertical gradient, no horizon line, no studio sweep
- Same backdrop spans behind both card and vial — shared scene

LIGHTING:
- Soft diffuse key light from upper-front camera-left
- Vial gets photographic lighting (subtle cap highlight, glass refraction, \
contact shadow beneath vial only)
- Card gets nearly flat lighting — it is a flat graphic, not a 3D object
- Consistent light direction across both elements

PRODUCT INFO on vial label: "${sku.abbreviation}"${sku.fullName ? `, "${sku.fullName.toUpperCase()}"` : ""}, \
"CAS ${sku.cas}".

STYLE: editorial pharmaceutical catalog, AXIS Peptide Labs aesthetic, \
designed split-layout product card. Vial side is photographic, card side \
is flat graphic — they coexist in the same frame as different visual \
treatments.

NEGATIVE: NO overlap between card and vial (critical — side-by-side with \
gap only), NO card in front of or behind vial, NO colored caps (must be \
aluminum silver), NO serif fonts, NO 3D paper card with depth, NO face-on \
vial (keep three-quarter photographic angle), NO removal of PurePep \
wordmark or 10 MG badge, NO horizon line, NO studio sweep, NO chrome \
reflections. ${col.negative}.`;
}

// ---------------------------------------------------------------------------
// Higgsfield call — product_shot mode, 3 reference images
// ---------------------------------------------------------------------------

function runHighgsfield(sku: LabelSku, refs: string[], outPath: string): string {
  const prompt = buildPrompt(sku);

  const imageArgs = refs.flatMap((r) => ["--image", r]);
  const result = spawnSync(
    "higgsfield",
    [
      "product-photoshoot", "create",
      "--mode", "product_shot",
      "--prompt", prompt,
      ...imageArgs,
      "--aspect_ratio", "2:3",
      "--json",
    ],
    { encoding: "utf8", stdio: "pipe", timeout: 600_000 },
  );

  if (result.status !== 0) {
    const errText = result.stderr + result.stdout;
    if (errText.includes("not_enough_credits")) {
      console.error(
        "\nOut of credits. Switch workspace:\n" +
        "  higgsfield workspace list\n" +
        "  higgsfield workspace set <id>",
      );
      process.exit(2);
    }
    throw new Error(`higgsfield failed (exit ${result.status}):\n${errText}`);
  }

  return extractUrl(result.stdout, outPath);
}

function extractUrl(raw: string, context: string): string {
  try {
    const url = findFirstUrl(JSON.parse(raw) as unknown);
    if (url) return url;
  } catch {
    // fall through to regex
  }
  const m = raw.match(/https:\/\/\S+\.(?:jpg|jpeg|png|webp)/i);
  if (m) return m[0];
  throw new Error(`No image URL in higgsfield output for ${context}.\nRaw: ${raw}`);
}

function findFirstUrl(val: unknown): string | null {
  if (typeof val === "string" && val.startsWith("https://")) return val;
  if (Array.isArray(val)) {
    for (const v of val) { const u = findFirstUrl(v); if (u) return u; }
  }
  if (val !== null && typeof val === "object") {
    for (const v of Object.values(val as Record<string, unknown>)) {
      const u = findFirstUrl(v); if (u) return u;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Download URL → PNG via sharp
// ---------------------------------------------------------------------------

async function downloadAsPng(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).png({ compressionLevel: 6 }).toFile(dest);
}

async function downloadAsJpeg(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).jpeg({ quality: 95 }).toFile(dest);
}

// ---------------------------------------------------------------------------
// Render result
// ---------------------------------------------------------------------------

interface RenderResult {
  slug: string;
  outPath: string;
  fileSize: number;
  renderMs: number;
  attempts: number;
  skipped: boolean;
  failed: boolean;
  failReasons: string[];
}

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------

function preflight(): void {
  const auth = spawnSync("higgsfield", ["account", "status"], {
    encoding: "utf8", stdio: "pipe",
  });
  if (auth.status !== 0) {
    console.error(
      "higgsfield authentication required.\n" +
      "  Run: higgsfield auth login\n" +
      "  Or set HIGGSFIELD_API_KEY (GitHub Actions secret name: HIGGSFIELD_API_KEY)",
    );
    process.exit(1);
  }
  if (!existsSync(REF_GEOMETRY)) {
    console.error(`Missing geometry reference: ${REF_GEOMETRY}`);
    process.exit(1);
  }
  if (!existsSync(PHOTOREF_DIR)) {
    console.error(`Missing photoref labels dir: ${PHOTOREF_DIR}`);
    process.exit(1);
  }
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  mkdirSync(SOURCE_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// Generate labels first (--photography mode) via pnpm labels
// ---------------------------------------------------------------------------

function generatePhotoLabels(slugs: string[]): void {
  console.log("Generating photography labels (τ glyph)…");
  for (const slug of slugs) {
    const out = join(PRODUCTS_DIR, slug, "label-photo.png");
    if (existsSync(out)) {
      console.log(`  skip label ${slug} (exists)`);
      continue;
    }
    const r = spawnSync("pnpm", ["labels", "--photography", "--slug", slug], {
      encoding: "utf8", stdio: "pipe", cwd: ROOT,
    });
    if (r.status !== 0) throw new Error(`label render failed for ${slug}:\n${r.stderr}`);
    console.log(`  ✓ label-photo for ${slug}`);
  }
}

// ---------------------------------------------------------------------------
// Render one SKU (with retries)
// ---------------------------------------------------------------------------

async function renderOne(sku: LabelSku, args: Args): Promise<RenderResult> {
  mkdirSync(SOURCE_DIR, { recursive: true });
  const outPath = join(SOURCE_DIR, `purepep-card-${sku.slug}-v1.0.jpg`);

  if (existsSync(outPath) && !args.force) {
    const { size } = statSync(outPath);
    return { slug: sku.slug, outPath, fileSize: size, renderMs: 0, attempts: 0, skipped: true, failed: false, failReasons: [] };
  }

  // Build reference image list
  let refs: string[] = [];
  if (!args.noRef) {
    const geomRef = args.refImage ?? REF_GEOMETRY;
    if (existsSync(geomRef)) refs.push(geomRef);
    const photorefFile = SLUG_TO_PHOTOREF[sku.slug];
    if (photorefFile) {
      const photorefPath = join(PHOTOREF_DIR, photorefFile);
      if (existsSync(photorefPath)) refs.push(photorefPath);
    }
  }
  if (args.noRef) console.log(`  [no-ref] ${sku.slug} — pure prompt generation`);

  const failReasons: string[] = [];
  let attempts = 0;

  while (attempts < args.maxAttempts) {
    attempts++;
    console.log(`  [attempt ${attempts}/${args.maxAttempts}] ${sku.slug}…`);
    const t0 = Date.now();
    try {
      const url = runHighgsfield(sku, refs, outPath);
      await downloadAsJpeg(url, outPath);
      const { size } = statSync(outPath);
      return { slug: sku.slug, outPath, fileSize: size, renderMs: Date.now() - t0, attempts, skipped: false, failed: false, failReasons };
    } catch (err) {
      const msg = (err as Error).message;
      failReasons.push(`attempt ${attempts}: ${msg}`);
      console.error(`    FAILED: ${msg}`);
      if (attempts < args.maxAttempts) console.log("    retrying…");
    }
  }

  return { slug: sku.slug, outPath, fileSize: 0, renderMs: 0, attempts, skipped: false, failed: true, failReasons };
}

// ---------------------------------------------------------------------------
// Contact sheet — 8 rows × 1 col at 800 px wide (portrait)
// Matches catalog order from LABEL_SKUS
// ---------------------------------------------------------------------------

const THUMB_W = 800;
const THUMB_H = 1000; // 4:5 crop
const LABEL_H = 56;
const CELL_H = THUMB_H + LABEL_H;
const SHEET_W = THUMB_W;
const SHEET_H = CELL_H * 8;

async function buildContactSheet(skus: LabelSku[]): Promise<void> {
  const sheetPath = join(PRODUCTS_DIR, "_contact-sheet.png");
  console.log("\nBuilding contact sheet…");

  const base = sharp({
    create: { width: SHEET_W, height: SHEET_H, channels: 3, background: { r: 250, g: 247, b: 240 } },
  });

  const composites: sharp.OverlayOptions[] = [];

  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i]!;
    const heroPath = join(PRODUCTS_DIR, sku.slug, "hero.png");
    const y = i * CELL_H;

    if (existsSync(heroPath)) {
      const thumb = await sharp(heroPath)
        .resize(THUMB_W, THUMB_H, { fit: "cover", position: "centre" })
        .toBuffer();
      composites.push({ input: thumb, left: 0, top: y });
    } else {
      const placeholder = await sharp({
        create: { width: THUMB_W, height: THUMB_H, channels: 3, background: { r: 241, g: 237, b: 227 } },
      }).toBuffer();
      composites.push({ input: placeholder, left: 0, top: y });
    }

    // Label bar
    const labelSvg = Buffer.from(
      `<svg width="${SHEET_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${SHEET_W}" height="${LABEL_H}" fill="#FAF7F0"/>
        <text x="${SHEET_W / 2}" y="${LABEL_H / 2 + 5}"
          font-family="'IBM Plex Mono', monospace" font-size="14"
          letter-spacing="0.1em" fill="#1F1F1F"
          text-anchor="middle" dominant-baseline="middle">${sku.abbreviation}</text>
        <line x1="0" y1="0" x2="${SHEET_W}" y2="0" stroke="#1F1F1F" stroke-width="1.5"/>
      </svg>`,
    );
    composites.push({
      input: await sharp(labelSvg).png().toBuffer(),
      left: 0,
      top: y + THUMB_H,
    });
  }

  await base.composite(composites).png({ compressionLevel: 6 }).toFile(sheetPath);
  console.log(`  contact sheet → ${sheetPath.replace(ROOT + "/", "")}`);
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

function printSummary(results: RenderResult[]): void {
  console.log("\n" + ["slug".padEnd(12), "status".padEnd(8), "attempts".padEnd(10), "size".padEnd(10), "time"].join("  "));
  console.log("─".repeat(60));
  for (const r of results) {
    const status = r.skipped ? "skip" : r.failed ? "FAILED" : "ok";
    const size = r.fileSize > 0 ? `${(r.fileSize / 1024).toFixed(0)} KB` : "—";
    const time = r.skipped || r.failed ? "—" : `${(r.renderMs / 1000).toFixed(1)}s`;
    console.log([r.slug.padEnd(12), status.padEnd(8), String(r.attempts).padEnd(10), size.padEnd(10), time].join("  "));
  }
  const failed = results.filter((r) => r.failed);
  if (failed.length > 0) {
    console.log(`\n${failed.length} SKU(s) need manual review:`);
    for (const r of failed) {
      console.log(`  ${r.slug}:\n    ${r.failReasons.join("\n    ")}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function renderBac(args: Args): Promise<void> {
  const outPath = join(SOURCE_DIR, "purepep-vial-bac-v1.0.jpg");
  if (existsSync(outPath) && !args.force) {
    console.log("bac water → skip (exists, use --force to re-roll)");
    return;
  }
  mkdirSync(SOURCE_DIR, { recursive: true });
  const prompt = bacWaterPrompt();
  const imageArgs = [REF_GEOMETRY].filter(existsSync).flatMap((r) => ["--image", r]);
  const failReasons: string[] = [];
  for (let attempt = 1; attempt <= args.maxAttempts; attempt++) {
    console.log(`  [attempt ${attempt}/${args.maxAttempts}] bac…`);
    const t0 = Date.now();
    const result = spawnSync(
      "higgsfield",
      ["product-photoshoot", "create", "--mode", "product_shot",
        "--prompt", prompt, ...imageArgs, "--aspect_ratio", "2:3", "--json"],
      { encoding: "utf8", stdio: "pipe", timeout: 600_000 },
    );
    if (result.status !== 0) {
      const err = result.stderr + result.stdout;
      if (err.includes("not_enough_credits")) { console.error("Out of credits."); process.exit(2); }
      failReasons.push(`attempt ${attempt}: ${result.stderr}`);
      console.error(`    FAILED: ${result.stderr}`);
      continue;
    }
    try {
      const url = extractUrl(result.stdout, outPath);
      await downloadAsJpeg(url, outPath);
      const { size } = statSync(outPath);
      console.log(`\nbac   ok   1   ${(size / 1024).toFixed(0)} KB   ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      return;
    } catch (err) {
      failReasons.push(`attempt ${attempt}: ${(err as Error).message}`);
      console.error(`    FAILED: ${(err as Error).message}`);
    }
  }
  console.error(`\nbac FAILED after ${args.maxAttempts} attempts:\n  ${failReasons.join("\n  ")}`);
}

async function main(): Promise<void> {
  const args = parseArgs();
  preflight();

  // BAC water — 9th SKU, separate render path
  if (args.bac) {
    console.log("PurePep vial photography — BAC water (9th SKU)");
    if (args.force) console.log("  --force: re-rolling existing output");
    await renderBac(args);
    return;
  }

  let skus = LABEL_SKUS;
  if (args.only) {
    skus = skus.filter((s) => s.slug === args.only);
    if (skus.length === 0) {
      console.error(`Unknown slug: ${args.only}`);
      process.exit(1);
    }
  }

  console.log(`PurePep vial photography — ${skus.length} SKU(s), up to ${args.maxAttempts} attempts each`);
  if (args.force) console.log("  --force: re-rolling existing outputs");

  // Step 1: generate photography labels
  generatePhotoLabels(skus.map((s) => s.slug));

  // Step 2: generate hero images
  const results: RenderResult[] = [];
  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i]!;
    process.stdout.write(`\n[${i + 1}/${skus.length}] ${sku.slug} `);
    if (existsSync(join(SOURCE_DIR, `purepep-card-${sku.slug}-v1.0.jpg`)) && !args.force) {
      console.log("→ skip");
    }
    const result = await renderOne(sku, args);
    results.push(result);
  }

  // Step 3: contact sheet (only full runs)
  if (!args.only) {
    await buildContactSheet(LABEL_SKUS);
  }

  printSummary(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
