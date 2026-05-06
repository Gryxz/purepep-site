#!/usr/bin/env tsx
/**
 * Token fence — runs as part of `pnpm lint`.
 *
 * Hard constraints (always banned):
 *   - Raw hex literals (#xxx) anywhere in src/
 *   - Inline style hex literals
 *   - Banned typefaces in CSS (anything other than Inter / IBM Plex Mono)
 *   - Hand-typed compliance strings (must come from @design/tokens)
 *
 * Arbitrary Tailwind size values are NOT enforced — design fidelity to the
 * reference JSXs in purepep-site/design-system/ui_kits/storefront/ requires
 * many off-scale numbers (15px, 17px, 28px headlines, etc.). The brand bible
 * locks the palette + typefaces, not every pixel.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";

type Pattern = { name: string; re: RegExp; allowFile?: (file: string) => boolean };

/**
 * globals.css is the project's local token-extension point: stylelint already
 * permits box-shadow + gradient background-image there (see .stylelintrc.json
 * overrides), and v3 Apple Swiss tokens (amber, surface stack, soft elevation
 * shadows) are defined there as :root custom properties so the rest of src/
 * can consume them via var(...). Hex literals are therefore allowed in
 * globals.css only — every other src/ file must use those vars.
 *
 * The v3 vial artwork is a one-off vector asset (gradient stops, glass
 * refraction highlights) ported verbatim from docs/design-v3/. It carries
 * its own non-token palette by design intent; allow-listing it keeps the
 * SVG geometry intact without leaking generic hex into the rest of src/.
 */
const HEX_ALLOWED_FILES = [
  "src/app/globals.css",
  "src/components/v3/RetaVial.tsx",
  "src/components/v3/RetaVialMini.tsx",
  "src/components/v3/LabelCropSvg.tsx",
];
const isHexAllowed = (f: string) =>
  HEX_ALLOWED_FILES.some((p) => f.endsWith(p) || f.endsWith("/" + p));

const PATTERNS: Pattern[] = [
  {
    name: "Hex literal in source",
    re: /(?<![a-zA-Z0-9_])#[0-9A-Fa-f]{3,8}\b/g,
    allowFile: isHexAllowed,
  },
  {
    name: "Inline style hex literal",
    re: /style=\{\{[^}]*#[0-9A-Fa-f]{3,8}[^}]*\}\}/g,
  },
  {
    name: "Banned typeface in CSS",
    re: /font-family:\s*(?!var\(|inherit|initial|unset|sans-serif|serif|monospace|system-ui|ui-monospace)['"]?(?!Inter\b|IBM Plex Mono\b|-apple-system|BlinkMacSystemFont|'Segoe UI'|'SF Mono'|Menlo)[A-Za-z][^;]*/gi,
  },
  {
    name: "Hand-typed compliance string (use compliance.* from @design/tokens)",
    re: /(For research use only\. Not for human consumption\.|Sales restricted to qualified researchers, 21 and over\.|All sales final\. No refunds, no exchanges, no returns\.)/g,
    // The compliance strings necessarily live verbatim in the canonical
    // tokens module that the rest of src/ imports — that's the whole
    // point of importing them. Exempt the source file itself.
    allowFile: (f) => f.endsWith("src/design-system/tokens.ts") || f.endsWith("/design-system/tokens.ts"),
  },
];

const files = globSync("src/**/*.{ts,tsx,css}", {
  ignore: ["**/node_modules/**", "**/.next/**"],
});

let failed = 0;

for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const p of PATTERNS) {
    const matches = [...src.matchAll(p.re)];
    if (!matches.length) continue;
    if (p.allowFile && p.allowFile(f)) continue;
    console.error(`✗ ${f}: ${p.name}`);
    for (const m of matches.slice(0, 5)) {
      console.error(`    ${m[0]}`);
    }
    if (matches.length > 5) console.error(`    … and ${matches.length - 5} more`);
    failed += matches.length;
  }
}

if (failed > 0) {
  console.error(`\nToken fence: ${failed} violation${failed === 1 ? "" : "s"}.`);
  process.exit(1);
}

console.log("Token fence: OK");
