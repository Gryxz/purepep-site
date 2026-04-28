#!/usr/bin/env tsx
/**
 * Token fence — runs as part of `pnpm lint`.
 *
 * Catches the cases ESLint and Stylelint can't:
 *   - Tailwind arbitrary values like `bg-[#FF0000]` or `w-[123px]`
 *   - Inline `style={{ color: '#xxx' }}` hex literals
 *   - Banned typeface declarations
 *   - Hand-typed compliance strings (must come from @design/tokens)
 *
 * Exits non-zero on any violation. Add to CI.
 */
import { readFileSync } from "node:fs";
import { globSync } from "glob";

type Pattern = { name: string; re: RegExp; allowFile?: (file: string) => boolean };

const PATTERNS: Pattern[] = [
  {
    name: "Arbitrary Tailwind hex value",
    re: /\b(?:bg|text|border|from|to|via|fill|stroke|ring|outline|decoration|shadow|caret|accent|placeholder)-\[#[0-9A-Fa-f]{3,8}\]/g,
  },
  {
    name: "Arbitrary Tailwind size value",
    re: /\b(?:w|h|p|m|gap|text|leading|max-w|min-w|max-h|min-h)-\[\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)\]/g,
    allowFile: (f) => f.endsWith("page.tsx") && /max-\[1280px\]/.test(""),
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
    allowFile: (f) => /\/page\.tsx$/.test(f) === false && /\/layout\.tsx$/.test(f) === false,
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
