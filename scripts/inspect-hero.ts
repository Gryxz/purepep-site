/**
 * Mobile hero parallax inspector.
 *
 * Spins up Playwright in iPhone-emulated mobile chromium, navigates to the
 * deployed site (or localhost via SITE env), scrolls through the hero
 * parallax in 8 evenly-spaced steps, and at each step captures:
 *   • a screenshot under tmp/inspect/step-N.png
 *   • computed styles for the parallax-relevant selectors
 *   • bounding-box rects (so we can SEE where pane 2 actually lands)
 *
 * Run:
 *   pnpm exec playwright install chromium    # one-time, ~150 MB
 *   pnpm exec tsx scripts/inspect-hero.ts
 *
 * Override target with SITE env var:
 *   SITE=http://localhost:3000 pnpm exec tsx scripts/inspect-hero.ts
 */

import { chromium, devices } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SITE = process.env.SITE ?? "https://purepep.shop";
const OUT = join(process.cwd(), "tmp", "inspect");

const SELECTORS = [
  ".mob-heropx",
  ".mob-heropx-1",
  ".mob-heropx-2",
  ".mob-heropx-content-2",
  ".mob-heropx-vial-wrap",
  ".mob-heropx-brand-watermark",
  ".mob-heropx-cta-block",
];

const COMPUTED_KEYS = [
  "position",
  "display",
  "top",
  "bottom",
  "left",
  "right",
  "transform",
  "width",
  "height",
  "margin-top",
  "margin-bottom",
  "padding-top",
  "padding-bottom",
  "justify-content",
  "align-items",
  "flex-direction",
  "z-index",
  "opacity",
];

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices["iPhone 14 Pro"] });
  const page = await context.newPage();

  console.log(`→ ${SITE}`);
  await page.goto(SITE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const vh = await page.evaluate(() => window.innerHeight);
  const vw = await page.evaluate(() => window.innerWidth);
  console.log(`viewport: ${vw} × ${vh}`);

  const STEPS = 8;
  const totalScroll = vh * 2; // parallax stack is 200vh

  for (let i = 0; i <= STEPS; i++) {
    const y = Math.round((i / STEPS) * totalScroll);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(250);

    const shotPath = join(OUT, `step-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });

    const measurements = await page.evaluate(
      ({ selectors, keys }) => {
        const result: Record<string, unknown> = {};
        for (const sel of selectors) {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (!el) {
            result[sel] = null;
            continue;
          }
          const cs = getComputedStyle(el);
          const computed: Record<string, string> = {};
          for (const k of keys) computed[k] = cs.getPropertyValue(k);
          const r = el.getBoundingClientRect();
          result[sel] = {
            rect: {
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              left: Math.round(r.left),
              right: Math.round(r.right),
              width: Math.round(r.width),
              height: Math.round(r.height),
            },
            computed,
          };
        }
        return result;
      },
      { selectors: SELECTORS, keys: COMPUTED_KEYS },
    );

    const dataPath = join(OUT, `step-${String(i).padStart(2, "0")}.json`);
    await writeFile(
      dataPath,
      JSON.stringify({ scrollY: y, viewport: { vw, vh }, measurements }, null, 2),
    );
    console.log(`  step ${i}/${STEPS}  scrollY=${y}  → ${shotPath}`);
  }

  await browser.close();
  console.log(`\nDone. Output in ${OUT}/`);
  console.log("Share step-04.json (~midpoint) + step-04.png — that's where the bug is.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
