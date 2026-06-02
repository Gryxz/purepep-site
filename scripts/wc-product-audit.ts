/**
 * WC product audit / reconciliation — RUN WHERE WC CREDS EXIST.
 *
 *   WC_BASE_URL=… WC_CONSUMER_KEY=… WC_CONSUMER_SECRET=… \
 *     pnpm wc:audit
 *
 * Lists every product on the live WooCommerce backend (all statuses)
 * and reconciles it against the static storefront fixture
 * (src/data/products.static.ts):
 *
 *   • WC products NOT in the fixture  (won't render on /shop/[slug])
 *   • Fixture entries NOT in WC       (will 404 / fall back)
 *   • The category bucket each WC product resolves to, so mis-mapped
 *     items (e.g. GHK-Cu → "Metabolic") are visible at a glance.
 *
 * Read-only: performs only GET requests. Standalone — does not import
 * the protected wc-api client; the category heuristic below is a
 * deliberate audit mirror, not the source of truth.
 */
import { PRODUCTS } from "../src/data/products.static";

const WC_BASE_URL = (process.env.WC_BASE_URL ?? "").replace(/\/+$/, "");
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY ?? "";
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET ?? "";

if (!WC_BASE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
  console.error(
    "Missing env. Set WC_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET " +
      "(WC_BASE_URL = the WC REST root, e.g. https://site/wp-json/wc/v3).",
  );
  process.exit(1);
}

const authHeader =
  "Basic " +
  Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString("base64");

interface WcProduct {
  id: number;
  slug: string;
  name: string;
  status: string;
  type: string;
  price: string;
  stock_status: string;
  categories?: { name?: string }[];
}

/** Audit mirror of wc-api.ts pickCategory — keep roughly in sync by eye. */
function pickCategory(p: WcProduct): string {
  const KNOWN = [
    "Incretin mimetics",
    "GH secretagogues",
    "Healing",
    "Cognition",
    "Metabolic",
  ];
  const names = (p.categories ?? []).map((c) => (c.name ?? "").trim());
  for (const k of KNOWN) {
    if (names.some((n) => n.toLowerCase() === k.toLowerCase())) return k;
  }
  const cats = names.map((n) => n.toLowerCase());
  const name = p.name.toLowerCase();
  const any = (h: string[], needles: string[]) =>
    h.some((x) => needles.some((n) => x.includes(n)));
  if (any(cats, ["glp", "incretin", "semaglutide", "reta", "tirz"]))
    return "Incretin mimetics";
  if (any(cats, ["gh ", "growth", "secretagogue", "ipamorelin"]))
    return "GH secretagogues";
  if (
    any(cats, [
      "heal",
      "repair",
      "bpc",
      "tb-500",
      "thymosin",
      "ghk",
      "copper",
      "tripeptide",
    ])
  )
    return "Healing";
  if (any(cats, ["cogni", "nootropic", "selank", "semax"])) return "Cognition";
  if (any([name], ["reta", "sema", "tirz", "survo", "cagri"]))
    return "Incretin mimetics";
  if (any([name], ["ipamorelin", "ghrp", "sermorelin"]))
    return "GH secretagogues";
  if (any([name], ["bpc", "tb-500", "thymosin", "ghk", "copper"]))
    return "Healing";
  if (any([name], ["selank", "semax", "noopept"])) return "Cognition";
  if (any([name], ["mots"])) return "Metabolic"; // explicit, not fallback
  return "Metabolic"; // fallback bucket
}

async function fetchAll(): Promise<WcProduct[]> {
  const out: WcProduct[] = [];
  for (let page = 1; page < 50; page++) {
    const res = await fetch(
      `${WC_BASE_URL}/products?per_page=100&page=${page}&status=any`,
      { headers: { Authorization: authHeader, Accept: "application/json" } },
    );
    if (!res.ok) {
      throw new Error(`WC ${res.status} ${res.statusText} (page ${page})`);
    }
    const batch = (await res.json()) as WcProduct[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function main() {
  const wc = await fetchAll();
  console.log(`\nWC backend — ${wc.length} product(s):\n`);
  for (const p of wc) {
    console.log(
      [
        String(p.id).padEnd(6),
        p.slug.padEnd(28),
        (p.status + "/" + p.type).padEnd(18),
        ("$" + p.price).padEnd(9),
        p.stock_status.padEnd(10),
        "→ " + pickCategory(p),
        "| " + p.name,
      ].join(" "),
    );
  }

  const wcSlugs = new Set(wc.map((p) => p.slug));
  const fixtureSlugs = new Set(PRODUCTS.map((p) => p.slug));

  const wcOnly = [...wcSlugs].filter((s) => !fixtureSlugs.has(s));
  const fixtureOnly = [...fixtureSlugs].filter((s) => !wcSlugs.has(s));

  console.log(
    `\n— WC products NOT in static fixture (add to products.static.ts ` +
      `or they won't render): ${wcOnly.length ? wcOnly.join(", ") : "none"}`,
  );
  console.log(
    `— Fixture slugs NOT on WC backend (will 404 / fallback): ` +
      `${fixtureOnly.length ? fixtureOnly.join(", ") : "none"}`,
  );
  console.log(
    `\nReview the "→ category" column for mis-bucketed items ` +
      `(e.g. copper/GHK peptides falling to "Metabolic").\n`,
  );
}

main().catch((e) => {
  console.error("Audit failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
