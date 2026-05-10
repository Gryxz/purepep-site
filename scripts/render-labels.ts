/**
 * Renders all canonical PurePep SKU labels as 1080×360 PNGs.
 *
 * Pipeline: JSX (src/lib/labels/Label.tsx) → satori → SVG → resvg-js
 * → PNG → public/brand/labels/{slug}.png.
 *
 * Fonts (IBM Plex Mono Regular + Bold) are fetched once from Google
 * Fonts and cached in scripts/.fonts-cache/ so repeated runs don't
 * round-trip the network.
 *
 * Run:
 *   pnpm labels                    # render all
 *   pnpm labels --slug reta        # render a single SKU
 *
 * Add a new SKU to src/lib/labels/skus.ts → run `pnpm labels` →
 * label drops in.
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
const OUT_DIR = join(REPO_ROOT, "public", "brand", "labels");

// IBM Plex Mono fonts — sourced from the @fontsource/ibm-plex-mono
// devDep already in node_modules.  Satori accepts TTF / OTF / WOFF
// (not WOFF2 — must be decompressed first); fontsource ships WOFF
// alongside WOFF2, so we read those directly from disk.  No network
// required at script runtime — fully deterministic.
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

async function renderOne(sku: LabelSku, fonts: Awaited<ReturnType<typeof loadFonts>>) {
  const width = 1080;
  const height = 360;
  // satori takes JSX-as-data — call Label() to get the React element
  const element = Label({ sku, width, height });
  const svg = await satori(element, { width, height, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width } })
    .render()
    .asPng();
  const out = join(OUT_DIR, `${sku.slug}.png`);
  await writeFile(out, png);
  console.log(`  ✓ ${sku.slug.padEnd(8)} → ${out.replace(REPO_ROOT + "/", "")}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // CLI: --slug reta picks one
  const slugArgIdx = process.argv.indexOf("--slug");
  const onlySlug = slugArgIdx >= 0 ? process.argv[slugArgIdx + 1] : null;

  const queue = onlySlug
    ? LABEL_SKUS.filter((s) => s.slug === onlySlug)
    : LABEL_SKUS;

  if (queue.length === 0) {
    throw new Error(`no SKU matches --slug ${onlySlug}`);
  }

  console.log(`PurePep label render — ${queue.length} SKU${queue.length > 1 ? "s" : ""}`);
  console.log("loading fonts…");
  const fonts = await loadFonts();
  console.log("rendering…");
  for (const sku of queue) {
    await renderOne(sku, fonts);
  }
  console.log(`done — ${queue.length} label${queue.length > 1 ? "s" : ""} written to ${OUT_DIR.replace(REPO_ROOT + "/", "")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
