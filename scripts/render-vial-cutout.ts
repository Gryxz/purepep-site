#!/usr/bin/env tsx
/**
 * Generates a TRANSPARENT-BACKGROUND vial photograph for the mobile
 * flagship hero pane (and any future surface that wants a vial
 * floating on a dark backdrop instead of inside its baked cyc).
 *
 * Flow:
 *   1. Call higgsfield product-photoshoot against a saturated neon
 *      green chroma-key backdrop.  Neon green (#00FF22 region) is
 *      absent from every PurePep brand palette (cream / amber / ink),
 *      so chroma-keying it out is lossless for the vial itself.
 *   2. Download the result.
 *   3. Walk pixels with sharp.raw(); set alpha to 0 wherever the
 *      pixel is dominantly green (smoothed at the edges so glass
 *      reflections + label feathering don't get hard-cut).
 *   4. Save PNG with alpha → public/images/products/source/
 *      purepep-vial-{slug}-v1.0-cutout.png
 *
 * Run:
 *   pnpm vial-cutout                # all 8 SKUs
 *   pnpm vial-cutout --only reta    # one SKU (recommended; cutouts
 *                                    are only used by the flagship
 *                                    hero today, single SKU per run
 *                                    keeps credit cost predictable)
 *   pnpm vial-cutout --force        # re-roll existing
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { LABEL_SKUS, type LabelSku } from "../src/lib/labels/skus.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BRAND_DIR = join(ROOT, "public", "brand", "products");
const REF_GEOMETRY = join(BRAND_DIR, "reta-10mg.jpg");
const PHOTOREF_DIR = join(ROOT, "references", "photoref-labels");
const SOURCE_DIR = join(ROOT, "public", "images", "products", "source");
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

interface Args { force: boolean; only: string | null; maxAttempts: number; }

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const args: Args = { force: false, only: null, maxAttempts: 4 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--force" || argv[i] === "-f") args.force = true;
    else if (argv[i] === "--only" && argv[i + 1]) args.only = argv[++i]!;
    else if (argv[i] === "--attempts" && argv[i + 1]) {
      args.maxAttempts = Math.max(1, parseInt(argv[++i]!, 10) || 4);
    }
  }
  return args;
}

function buildPrompt(sku: LabelSku): string {
  return `Use the attached reference image (reta-10mg.jpg) — KEEP all brand \
identity intact: aluminum crimp cap (silver, NOT colored), PurePep wordmark, \
10 MG badge in upper-right corner of label, large bold sans-serif product \
name, "FOR RESEARCH USE ONLY" black band, CAS number in monospace, white \
crystalline powder fill at ~40% of vial.  These brand elements MUST match \
the reference exactly.

Vial label color follows the attached label artwork — apply the second \
reference image as the label.  Vial body: clear glass.  Stopper: standard \
grey rubber.  Powder fill: white lyophilized, ~40% of vial height.

BACKGROUND — chroma-key composition (critical):
- Solid uniform NEON GREEN backdrop, hex #00E830 — fully saturated, no \
gradient, no shading, no horizon line, no floor demarcation, no studio \
sweep, no atmospheric perspective.
- The green fills the ENTIRE frame except where the vial sits.  Floor and \
wall are the same flat green — no transition tone, no shadow blending.
- NO drop shadow.  NO contact shadow under the vial.  NO ambient occlusion.

VIAL POSITION: perfectly upright, 90° vertical, no tilt.  Centered \
horizontally.  Generous negative space above and on both sides (so the \
vial is fully surrounded by green and can be cleanly chroma-keyed out).

LIGHTING: clean editorial product lighting.  Soft key from upper-front \
camera-left, gentle fill from camera-right.  The vial picks up the green \
backdrop only minimally — keep it cleanly separated from the background.

STYLE: editorial pharmaceutical product photograph, isolated on chroma-key \
green for compositing.  Treat this as a cutout plate for a downstream \
compositor — the green is a tool, not a design choice.

NEGATIVE: NO shadow of any kind under or beside the vial (the chroma key \
removes shadows along with the green), NO colored cap (aluminum silver \
only), NO gradient on the green (must be flat uniform #00E830), NO atmosphere \
or fog or mist, NO floor line or horizon, NO reflection on the floor, NO \
green tint on the vial glass, NO additional props, NO text overlay, NO \
watermark.  The green backdrop must be pure and uniform — anything that \
ramps the green darker or lighter creates chroma-key artifacts.`;
}

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
  } catch { /* fall through */ }
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

/**
 * Chroma-key the green backdrop out → PNG with alpha.
 *
 * Algorithm: per-pixel, compute "greenness" = G - max(R, B).  Strongly
 * green pixels (greenness > 60) get alpha=0; non-green pixels get
 * alpha=255; the band in between (40..60) ramps smoothly so glass
 * edges and label feathering don't show hard-cut aliasing.  Also
 * suppresses green spill on the vial glass by clamping G toward
 * max(R, B) where alpha < 255 (de-spill).
 */
async function chromaKeyToPng(srcUrl: string, dest: string): Promise<void> {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${srcUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const out = Buffer.alloc(w * h * 4);

  const SOFT_LO = 40;  // below: opaque
  const SOFT_HI = 90;  // above: transparent

  for (let i = 0, j = 0; i < data.length; i += 4, j += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;

    const maxRB = Math.max(r, b);
    const greenness = g - maxRB;

    let alpha: number;
    if (greenness >= SOFT_HI) alpha = 0;
    else if (greenness <= SOFT_LO) alpha = 255;
    else alpha = Math.round(255 * (1 - (greenness - SOFT_LO) / (SOFT_HI - SOFT_LO)));

    // De-spill: where pixel is semi-transparent or has any green lean,
    // clamp G toward maxRB so leftover green edges don't tint the vial.
    let rOut = r, gOut = g, bOut = b;
    if (alpha < 255 && greenness > 0) {
      gOut = Math.min(g, maxRB + 4); // allow tiny lift, kill rest
    }

    out[j]     = rOut;
    out[j + 1] = gOut;
    out[j + 2] = bOut;
    out[j + 3] = alpha;
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 6 })
    .toFile(dest);
}

interface RenderResult {
  slug: string; outPath: string; fileSize: number; renderMs: number;
  attempts: number; skipped: boolean; failed: boolean; failReasons: string[];
}

function preflight(): void {
  const auth = spawnSync("higgsfield", ["account", "status"], {
    encoding: "utf8", stdio: "pipe",
  });
  if (auth.status !== 0) {
    console.error(
      "higgsfield authentication required.\n" +
      "  Run: higgsfield auth login\n" +
      "  Or set HIGGSFIELD_API_KEY",
    );
    process.exit(1);
  }
  if (!existsSync(REF_GEOMETRY)) {
    console.error(`Missing geometry reference: ${REF_GEOMETRY}`);
    process.exit(1);
  }
  mkdirSync(SOURCE_DIR, { recursive: true });
}

async function renderOne(sku: LabelSku, args: Args): Promise<RenderResult> {
  const outPath = join(SOURCE_DIR, `purepep-vial-${sku.slug}-v1.0-cutout.png`);

  if (existsSync(outPath) && !args.force) {
    const { size } = statSync(outPath);
    return { slug: sku.slug, outPath, fileSize: size, renderMs: 0, attempts: 0, skipped: true, failed: false, failReasons: [] };
  }

  const photoref = SLUG_TO_PHOTOREF[sku.slug];
  const refs: string[] = [REF_GEOMETRY];
  if (photoref) {
    const photorefPath = join(PHOTOREF_DIR, photoref);
    if (existsSync(photorefPath)) refs.push(photorefPath);
  }

  const failReasons: string[] = [];
  let attempts = 0;

  while (attempts < args.maxAttempts) {
    attempts++;
    console.log(`  [attempt ${attempts}/${args.maxAttempts}] ${sku.slug}…`);
    const t0 = Date.now();
    try {
      const url = runHighgsfield(sku, refs, outPath);
      await chromaKeyToPng(url, outPath);
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

  console.log(`PurePep vial cutout — ${skus.length} SKU(s), chroma-key green → alpha PNG, up to ${args.maxAttempts} attempts each`);
  if (args.force) console.log("  --force: re-rolling existing outputs");

  const results: RenderResult[] = [];
  for (let i = 0; i < skus.length; i++) {
    const sku = skus[i]!;
    process.stdout.write(`\n[${i + 1}/${skus.length}] ${sku.slug} `);
    const outPath = join(SOURCE_DIR, `purepep-vial-${sku.slug}-v1.0-cutout.png`);
    if (existsSync(outPath) && !args.force) console.log("→ skip");
    const result = await renderOne(sku, args);
    results.push(result);
  }

  printSummary(results);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
