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
const REFS_DIR = join(ROOT, "references");
const REF_SEMA = join(REFS_DIR, "sema-10mg.jpg");
const REF_TB500 = join(REFS_DIR, "tb-500-10mg.jpg");
const PRODUCTS_DIR = join(ROOT, "public", "products");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

interface Args {
  force: boolean;
  only: string | null;
  maxAttempts: number;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { force: false, only: null, maxAttempts: 5 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force" || argv[i] === "-f") args.force = true;
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

function buildPrompt(sku: LabelSku): string {
  return `A single peptide research vial, photorealistic editorial product \
photograph. The vial geometry, lighting, framing, depth-of-field, \
stopper, crimp seal, glass clarity, and powder fill level must \
match the provided reference images exactly. The two reference \
images show the canonical PurePep vial — replicate them precisely.

Apply the provided label artwork to the vial. The label wraps the \
lower 60% of the vial body. Label print must appear matte and crisp, \
no glossy reflections on label surface.

Backdrop: solid ${sku.labelBg} matte studio cyc, fading to a \
slightly darker tone at the floor where the vial sits. Match the \
backdrop character of the reference images.

Vial position: centered horizontally, sitting on a flat matte \
surface. Generous negative space above and around. Match the \
framing of the reference images exactly.

White lyophilized powder visible in the lower ~25% of the vial, \
matching the powder fill level of the reference images exactly. \
Same fill level for every SKU — do not vary by compound.

No text overlay. No watermark. No additional elements. The image \
shows only the vial and the matte backdrop.`;
}

// ---------------------------------------------------------------------------
// Higgsfield call — product_shot mode, 3 reference images
// ---------------------------------------------------------------------------

function runHighgsfield(sku: LabelSku, labelPhoto: string, outPath: string): string {
  const prompt = buildPrompt(sku);

  const result = spawnSync(
    "higgsfield",
    [
      "product-photoshoot", "create",
      "--mode", "product_shot",
      "--prompt", prompt,
      "--image", REF_SEMA,
      "--image", REF_TB500,
      "--image", labelPhoto,
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
  for (const [label, path] of [["sema reference", REF_SEMA], ["tb-500 reference", REF_TB500]] as const) {
    if (!existsSync(path)) {
      console.error(`Missing ${label}: ${path}`);
      process.exit(1);
    }
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
  const outPath = join(dir, "hero.png");
  const labelPhoto = join(dir, "label-photo.png");

  if (existsSync(outPath) && !args.force) {
    const { size } = statSync(outPath);
    return { slug: sku.slug, outPath, fileSize: size, renderMs: 0, attempts: 0, skipped: true, failed: false, failReasons: [] };
  }

  mkdirSync(dir, { recursive: true });

  const failReasons: string[] = [];
  let attempts = 0;

  while (attempts < args.maxAttempts) {
    attempts++;
    console.log(`  [attempt ${attempts}/${args.maxAttempts}] ${sku.slug}…`);
    const t0 = Date.now();
    try {
      const url = runHighgsfield(sku, labelPhoto, outPath);
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

  console.log(`PurePep vial photography — ${skus.length} SKU(s), up to ${args.maxAttempts} attempts each`);
  if (args.force) console.log("  --force: re-rolling existing outputs");

  // Step 1: generate photography labels
  generatePhotoLabels(skus.map((s) => s.slug));

  // Step 2: generate hero images
  const results: RenderResult[] = [];
  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i]!;
    process.stdout.write(`\n[${i + 1}/${skus.length}] ${sku.slug} `);
    if (existsSync(join(PRODUCTS_DIR, sku.slug, "hero.png")) && !args.force) {
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
