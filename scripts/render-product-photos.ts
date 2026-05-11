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
// Dark variants land directly under the v1.0 source convention used by
// the components (purepep-vial-{slug}-v1.0-dark.jpg).  Avoids a manual
// move step between script output and the path consumed by JSX.
const SOURCES_DIR = join(ROOT, "public", "images", "products", "source");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  force: boolean;
  only: string | null;
  maxAttempts: number;
  /**
   * Dark variant: same vial / label / geometry, but the studio backdrop
   * is rendered as matte charcoal black instead of the per-SKU tone.
   * Output is written to
   *   public/images/products/source/purepep-vial-{slug}-v1.0-dark.jpg
   * to match the v1.0 source naming convention used by the components
   * (no manual rename step between render and use).  Consumed by the
   * mobile homepage flagship hero pane.
   *
   * Run: pnpm products --only reta --dark
   */
  dark: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { force: false, only: null, maxAttempts: 5, dark: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force" || argv[i] === "-f") args.force = true;
    else if (argv[i] === "--dark") args.dark = true;
    else if (argv[i] === "--only" && argv[i + 1]) args.only = argv[++i]!;
    else if (argv[i] === "--attempts" && argv[i + 1]) {
      args.maxAttempts = Math.max(1, parseInt(argv[++i]!, 10) || 5);
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Prompt template — geometry locked to both reference images
// ---------------------------------------------------------------------------

function buildPrompt(sku: LabelSku, dark: boolean): string {
  // Backdrop override: dark mode swaps the per-SKU coloured cyc
  // (sku.backdropUpper → sku.backdropShelf) for a pure matte charcoal
  // studio set with a warm rim-light directive.  Everything else
  // (geometry, label artwork, powder fill, framing, reference fidelity)
  // is kept identical to the standard render so the dark and light
  // heroes read as the same vial photographed against different sets.
  const backdropClause = dark
    ? `solid matte charcoal black (#0a0a0a) studio cyc, with a soft warm \
rim-light from camera-right grazing the vial shoulder so the crimp \
seal and glass edge pop against the dark backdrop. The floor fades \
to near-pure black, no horizon line visible. Subtle warm golden \
practical bounce lifts the label print just enough to remain fully \
legible. Treat as moody high-end editorial product photography.`
    : `match the seamless studio backdrop shown in the first two \
reference images exactly — same color family (${sku.backdropUpper} \
upper, ${sku.backdropShelf} shelf), same soft gradient sweep to floor.`;

  return `Photorealistic editorial product photograph of a single peptide \
research vial. The first two reference images show the EXACT canonical \
${sku.abbreviation} vial — replicate the packaging layout, label position, \
label color, stopper, crimp seal, glass, and powder fill level \
with pixel-perfect fidelity. This is the authoritative source of truth \
for how this product looks.

CRITICAL — label: The third reference image is the updated label artwork. \
Apply it directly over the label area visible in the first two references. \
Label background color is ${sku.labelBg}. Preserve the dark ink border, \
the compound code, the compliance bar at the bottom of the label, and the \
τ (tau) brand mark replacing the dose pill in the upper-right area. \
Label surface: matte, crisp, no gloss or reflections.

Backdrop: ${backdropClause}

Vial position: perfectly upright, 90 degrees vertical, no tilt. Centered \
horizontally. Generous negative space above and on both sides, matching \
the framing of the reference images.

White lyophilized powder visible in the lower ~25% of the vial, \
matching the fill level shown in the reference images exactly.

No text overlay. No watermark. No added props. Only vial and backdrop.`;
}

// ---------------------------------------------------------------------------
// Higgsfield call — product_shot mode, 3 reference images
// ---------------------------------------------------------------------------

function runHighgsfield(sku: LabelSku, refs: string[], outPath: string, dark: boolean): string {
  const prompt = buildPrompt(sku, dark);

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
  // Encode based on dest extension so the v1.0 source convention
  // (.jpg) stays JPEG-encoded while the legacy /products/{slug}/hero
  // path stays PNG.
  const isJpg = /\.jpe?g$/i.test(dest);
  const img = sharp(buf);
  await (isJpg
    ? img.jpeg({ quality: 90, mozjpeg: true }).toFile(dest)
    : img.png({ compressionLevel: 6 }).toFile(dest));
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
  if (!existsSync(BRAND_DIR)) {
    console.error(`Missing brand products dir: ${BRAND_DIR}`);
    process.exit(1);
  }
  mkdirSync(PRODUCTS_DIR, { recursive: true });
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
  const dir = join(PRODUCTS_DIR, sku.slug);
  // Light variant: legacy per-SKU dir, hero.png (kept for any existing
  // surfaces that still read it).
  // Dark variant: written directly into the v1.0 source dir consumed by
  // MobileHomePage's flagship pane, so no manual move step is required
  // between `pnpm products --only reta --dark` and the page reading it.
  const outPath = args.dark
    ? join(SOURCES_DIR, `purepep-vial-${sku.slug}-v1.0-dark.jpg`)
    : join(dir, "hero.png");
  const labelPhoto = join(dir, "label-photo.png");
  if (args.dark) mkdirSync(SOURCES_DIR, { recursive: true });

  if (existsSync(outPath) && !args.force) {
    const { size } = statSync(outPath);
    return { slug: sku.slug, outPath, fileSize: size, renderMs: 0, attempts: 0, skipped: true, failed: false, failReasons: [] };
  }

  mkdirSync(dir, { recursive: true });

  // SKU-specific canonical brand photos as geometry references
  const brand10 = join(BRAND_DIR, `${sku.slug}-10mg.jpg`);
  const brand5  = join(BRAND_DIR, `${sku.slug}-5mg.jpg`);
  const refs: string[] = [];
  if (existsSync(brand10)) refs.push(brand10);
  if (existsSync(brand5))  refs.push(brand5);
  refs.push(labelPhoto); // τ glyph label always last

  const failReasons: string[] = [];
  let attempts = 0;

  while (attempts < args.maxAttempts) {
    attempts++;
    console.log(`  [attempt ${attempts}/${args.maxAttempts}] ${sku.slug}…`);
    const t0 = Date.now();
    try {
      const url = runHighgsfield(sku, refs, outPath, args.dark);
      await downloadAsPng(url, outPath);
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

async function main(): Promise<void> {
  const args = parseArgs();
  preflight();

  let skus = LABEL_SKUS;
  if (args.only) {
    skus = skus.filter((s) => s.slug === args.only);
    if (skus.length === 0) {
      console.error(`Unknown slug: ${args.only}`);
      process.exit(1);
    }
  }

  const variant = args.dark ? "dark backdrop" : "light backdrop";
  console.log(`PurePep vial photography — ${skus.length} SKU(s), ${variant}, up to ${args.maxAttempts} attempts each`);
  if (args.force) console.log("  --force: re-rolling existing outputs");

  // Step 1: generate photography labels
  generatePhotoLabels(skus.map((s) => s.slug));

  // Step 2: generate hero images
  const results: RenderResult[] = [];
  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i]!;
    process.stdout.write(`\n[${i + 1}/${skus.length}] ${sku.slug} `);
    const heroOut = args.dark
      ? join(SOURCES_DIR, `purepep-vial-${sku.slug}-v1.0-dark.jpg`)
      : join(PRODUCTS_DIR, sku.slug, "hero.png");
    if (existsSync(heroOut) && !args.force) {
      console.log("→ skip");
    }
    const result = await renderOne(sku, args);
    results.push(result);
  }

  // Step 3: contact sheet — only on full light-mode runs.  Dark runs are
  // typically single-SKU (flagship hero) so a sheet is not useful, and we
  // never want the dark variant to clobber the canonical light sheet.
  if (!args.only && !args.dark) {
    await buildContactSheet(LABEL_SKUS);
  }

  printSummary(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
