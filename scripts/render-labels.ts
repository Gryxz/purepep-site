/**
 * Renders all canonical PurePep SKU labels as 1080×360 PNGs.
 *
 * Pipeline: JSX (src/lib/labels/Label.tsx) → satori → SVG → resvg-js
 * → PNG → public/brand/labels/{slug}.png.
 *
 * Run:
 *   pnpm labels                          # render all (production)
 *   pnpm labels --slug reta              # render one (production)
 *   pnpm labels --photography            # render all (τ glyph, for AI photography)
 *   pnpm labels --photography --slug bpc-157  # render one photography label
 *
 * Production labels  → public/brand/labels/{slug}.png
 * Photography labels → public/products/{slug}/label-photo.png
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { Label } from "../src/lib/labels/Label";
import { LABEL_SKUS, type LabelSku } from "../src/lib/labels/skus";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PROD_OUT_DIR = join(REPO_ROOT, "public", "brand", "labels");
const PHOTO_OUT_DIR = join(REPO_ROOT, "public", "products");

const FONT_PACKAGE_DIR = join(REPO_ROOT, "node_modules", "@fontsource", "ibm-plex-mono", "files");
const FONT_PATHS = {
  "IBM Plex Mono Regular": join(FONT_PACKAGE_DIR, "ibm-plex-mono-latin-400-normal.woff"),
  "IBM Plex Mono Bold": join(FONT_PACKAGE_DIR, "ibm-plex-mono-latin-700-normal.woff"),
};

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    readFile(FONT_PATHS["IBM Plex Mono Regular"]),
    readFile(FONT_PATHS["IBM Plex Mono Bold"]),
  ]);
  return [
    { name: "IBM Plex Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

async function renderOne(
  sku: LabelSku,
  fonts: Awaited<ReturnType<typeof loadFonts>>,
  photography: boolean,
) {
  const width = 1080;
  const height = 360;
  const element = Label({ sku, width, height, photography });
  const svg = await satori(element, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    .render()
    .asPng();

  let out: string;
  if (photography) {
    const dir = join(PHOTO_OUT_DIR, sku.slug);
    await mkdir(dir, { recursive: true });
    out = join(dir, "label-photo.png");
  } else {
    await mkdir(PROD_OUT_DIR, { recursive: true });
    out = join(PROD_OUT_DIR, `${sku.slug}.png`);
  }

  await writeFile(out, png);
  console.log(`  ✓ ${sku.slug.padEnd(10)} → ${out.replace(REPO_ROOT + "/", "")}`);
}

async function main() {
  const argv = process.argv.slice(2);
  const photography = argv.includes("--photography");
  const slugIdx = argv.indexOf("--slug");
  const onlySlug = slugIdx >= 0 ? argv[slugIdx + 1] : null;

  const queue = onlySlug
    ? LABEL_SKUS.filter((s) => s.slug === onlySlug)
    : LABEL_SKUS;

  if (queue.length === 0) {
    throw new Error(`no SKU matches --slug ${onlySlug}`);
  }

  const mode = photography ? "photography (τ glyph)" : "production";
  console.log(`PurePep label render [${mode}] — ${queue.length} SKU${queue.length > 1 ? "s" : ""}`);
  console.log("loading fonts…");
  const fonts = await loadFonts();
  console.log("rendering…");
  for (const sku of queue) {
    await renderOne(sku, fonts, photography);
  }
  const outBase = photography ? "public/products/{slug}/label-photo.png" : "public/brand/labels/";
  console.log(`done — ${queue.length} label${queue.length > 1 ? "s" : ""} → ${outBase}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
