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

const PATTERNS: Pattern[] = [
  {
    name: "Hex literal in source",
    re: /(?<![a-zA-Z0-9_])#[0-9A-Fa-f]{3,8}\b/g,
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
