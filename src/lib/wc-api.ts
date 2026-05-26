/**
 * WooCommerce REST API v3 client — BUILD-TIME ONLY.
 *
 * This module reads `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` from the server
 * environment. It MUST NOT be imported from any "use client" file: doing so
 * would either fail at runtime (env unset) or, worse, leak the credentials
 * into the client bundle. Only call these helpers from server components and
 * `generateStaticParams` / `generateMetadata`.
 *
 * If credentials are missing or any upstream request fails, the public API
 * silently falls back to the bundled static catalog so the storefront can
 * still build and render.
 */

import {
  PRODUCTS as STATIC_PRODUCTS,
  type Category,
  type Product,
  type StockState,
} from "@/data/products.static";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WC_BASE_URL = (process.env.WC_BASE_URL ?? "").replace(/\/+$/, "");
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY ?? "";
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET ?? "";

const REVALIDATE_SECONDS = 3600;

function hasCreds(): boolean {
  return Boolean(WC_BASE_URL && WC_CONSUMER_KEY && WC_CONSUMER_SECRET);
}

function authHeader(): string {
  const token = Buffer.from(
    `${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`,
    "utf8",
  ).toString("base64");
  return `Basic ${token}`;
}

// ---------------------------------------------------------------------------
// Raw WC shape — only the fields we actually consume
// ---------------------------------------------------------------------------

interface WcMeta {
  key: string;
  value: unknown;
}

interface WcAttributeTerm {
  name?: string;
}

interface WcAttribute {
  name?: string;
  options?: unknown;
}

interface WcCategory {
  name?: string;
  slug?: string;
}

interface WcImage {
  id?: number;
  src?: string;
  alt?: string;
}

interface WcProduct {
  id: number;
  slug: string;
  name: string;
  type?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  low_stock_amount?: number | null;
  description?: string;
  short_description?: string;
  categories?: WcCategory[];
  attributes?: WcAttribute[];
  meta_data?: WcMeta[];
  images?: WcImage[];
}

/** WC product variation — only the fields we actually consume. */
interface WcVariation {
  id: number;
  price?: string;
  attributes?: Array<{ name?: string; option?: string }>;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchWcProducts(): Promise<WcProduct[] | null> {
  if (!hasCreds()) return null;
  try {
    const res = await fetch(
      `${WC_BASE_URL}/products?per_page=100&status=publish`,
      {
        headers: {
          Authorization: authHeader(),
          Accept: "application/json",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return data as WcProduct[];
  } catch {
    return null;
  }
}

async function fetchWcProductBySlug(slug: string): Promise<WcProduct | null> {
  if (!hasCreds()) return null;
  try {
    const res = await fetch(
      `${WC_BASE_URL}/products?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          Authorization: authHeader(),
          Accept: "application/json",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0] as WcProduct;
  } catch {
    return null;
  }
}

/**
 * Fetch the variations for a WC variable product. Returns null on missing
 * creds or upstream failure; the caller treats the variable product as a
 * simple one when this is null (parent price + parent id everywhere).
 */
async function fetchWcVariations(productId: number): Promise<WcVariation[] | null> {
  if (!hasCreds()) return null;
  try {
    const res = await fetch(
      `${WC_BASE_URL}/products/${productId}/variations?per_page=100`,
      {
        headers: {
          Authorization: authHeader(),
          Accept: "application/json",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    return data as WcVariation[];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const KNOWN_CATEGORIES: Category[] = [
  "Incretin mimetics",
  "GH secretagogues",
  "Healing",
  "Cognition",
  "Metabolic",
];

function pickCategory(wc: WcProduct): Category {
  const names = (wc.categories ?? []).map((c) => (c.name ?? "").trim());

  // 1. Exact match against our canonical category names.
  for (const known of KNOWN_CATEGORIES) {
    if (names.some((n) => n.toLowerCase() === known.toLowerCase())) {
      return known;
    }
  }

  // 2. Heuristic match — WC stores tend to use generic categories like
  //    "Peptides" / "Uncategorized" with the actual classification embedded
  //    in the slug or in the product name. Walk both for known compound
  //    families and bucket accordingly.
  const catLower = names.map((n) => n.toLowerCase());
  const matchesAny = (haystack: string[], needles: string[]): boolean =>
    haystack.some((h) => needles.some((n) => h.includes(n)));

  if (matchesAny(catLower, ["glp", "incretin", "semaglutide", "reta", "tirz"])) {
    return "Incretin mimetics";
  }
  if (matchesAny(catLower, ["gh ", "growth", "secretagogue", "ipamorelin"])) {
    return "GH secretagogues";
  }
  if (
    matchesAny(catLower, [
      "heal",
      "repair",
      "bpc",
      "tb-500",
      "thymosin",
      "ghk",
      "copper",
      "tripeptide",
    ])
  ) {
    return "Healing";
  }
  if (matchesAny(catLower, ["cogni", "nootropic", "selank", "semax"])) {
    return "Cognition";
  }

  // 3. Fall back to product-name detection.
  const nameLower = wc.name.toLowerCase();
  if (matchesAny([nameLower], ["reta", "sema", "tirz", "survo", "cagri"])) {
    return "Incretin mimetics";
  }
  if (matchesAny([nameLower], ["ipamorelin", "ghrp", "sermorelin"])) {
    return "GH secretagogues";
  }
  if (
    matchesAny([nameLower], ["bpc", "tb-500", "thymosin", "ghk", "copper"])
  ) {
    return "Healing";
  }
  if (matchesAny([nameLower], ["selank", "semax", "noopept"])) {
    return "Cognition";
  }

  // MOTS-c is metabolic — make it explicit so it's intentional, not just
  // a side-effect of the fallback below.
  if (matchesAny([nameLower], ["mots"])) {
    return "Metabolic";
  }

  return "Metabolic";
}

function pickMeta(meta: WcMeta[] | undefined, key: string): string | undefined {
  if (!meta) return undefined;
  const hit = meta.find((m) => m.key === key);
  if (!hit) return undefined;
  if (typeof hit.value === "string") return hit.value;
  if (typeof hit.value === "number") return String(hit.value);
  return undefined;
}

function pickVariants(wc: WcProduct): string[] {
  // WC convention varies: the storefront design used "Dose" but the live
  // store uses "Size". Match either.
  const dose = (wc.attributes ?? []).find((a) => {
    const n = (a.name ?? "").toLowerCase();
    return n.includes("dose") || n.includes("size");
  });
  if (!dose) return [];
  const opts = dose.options;
  if (Array.isArray(opts)) {
    return opts
      .map((o: unknown) => {
        if (typeof o === "string") return o;
        if (o && typeof o === "object" && "name" in o) {
          const term = o as WcAttributeTerm;
          return typeof term.name === "string" ? term.name : "";
        }
        return "";
      })
      .filter((s): s is string => s.length > 0);
  }
  return [];
}

function pickStockState(wc: WcProduct): { stock: StockState; lowCount?: number } {
  const status = (wc.stock_status ?? "").toLowerCase();
  if (status === "outofstock") return { stock: "out" };

  const qty = typeof wc.stock_quantity === "number" ? wc.stock_quantity : null;
  const threshold = typeof wc.low_stock_amount === "number" ? wc.low_stock_amount : null;

  if (qty !== null && qty <= 0) return { stock: "out" };
  if (qty !== null && threshold !== null && qty <= threshold) {
    return { stock: "low", lowCount: qty };
  }
  return { stock: "in" };
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function priceNumber(wc: WcProduct): number {
  const raw = wc.price ?? wc.regular_price ?? "0";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function toProduct(wc: WcProduct, variations?: WcVariation[]): Product {
  const variants = pickVariants(wc);
  const { stock, lowCount } = pickStockState(wc);
  const price = priceNumber(wc);
  const description = stripHtml(wc.description ?? wc.short_description ?? "");

  // Compound derivation:
  //   1. Explicit `_pp_compound` meta wins.
  //   2. Otherwise strip the marketing prefix ("PurePep ") and the
  //      build-time placeholder suffix (" - PLACEHOLDER", em-dash variants)
  //      so "PurePep Reta - PLACEHOLDER" becomes "RETA".
  //   3. Fall back to the raw upper-cased name if cleanup leaves nothing.
  const cleanedName = wc.name
    .replace(/^PurePep\s+/i, "")
    .replace(/\s*[-–—]\s*PLACEHOLDER\s*$/i, "")
    .toUpperCase()
    .trim();
  const compound =
    pickMeta(wc.meta_data, "_pp_compound") ??
    (cleanedName.length > 0 ? cleanedName : wc.name.toUpperCase());

  const cas = pickMeta(wc.meta_data, "_pp_cas") ?? "";
  const lot = pickMeta(wc.meta_data, "_pp_lot") ?? "";
  const storage = pickMeta(wc.meta_data, "_pp_storage") ?? "2–8 °C, protect from light";
  const purity = pickMeta(wc.meta_data, "_pp_purity") ?? "≥ 99.5% (HPLC)";
  const disclaimer =
    pickMeta(wc.meta_data, "_pp_disclaimer") ??
    "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.";

  // Variable products: build a dose → {wcId, price} map from the variation
  // list. The cheapest variation drives the default dose so the configurator
  // mounts on the lowest tier (matches WC catalog price display).
  let variantMap: Record<string, { wcId: number; price: number }> | undefined;
  if (variations && variations.length > 0) {
    variantMap = {};
    for (const v of variations) {
      const sizeAttr = (v.attributes ?? []).find((a) => {
        const n = (a.name ?? "").toLowerCase();
        return n.includes("size") || n.includes("dose");
      });
      const doseKey = sizeAttr?.option ?? "";
      if (doseKey && typeof v.id === "number" && v.id > 0) {
        const p = Number.parseFloat(v.price ?? "0");
        variantMap[doseKey] = {
          wcId: v.id,
          price: Number.isFinite(p) ? p : 0,
        };
      }
    }
    if (Object.keys(variantMap).length === 0) {
      variantMap = undefined;
    }
  }

  // Default dose: prefer the first variant entry that exists in variantMap;
  // otherwise the first variant; otherwise empty.
  const dose = variants[0] ?? "";

  // Display name: strip the trailing " - PLACEHOLDER" suffix (em-dash
  // variants) so a stale WP draft never leaks the marker into the eyebrow,
  // PDP spec table, page <title>, or "View {name}" CTAs. The "PurePep "
  // prefix is intentionally KEPT here — design wants the eyebrow to read
  // "PUREPEP RETA · LYOPHILIZED", not "RETA · LYOPHILIZED".
  const displayName = wc.name.replace(/\s*[-–—]\s*PLACEHOLDER\s*$/i, "").trim();

  // First WC product image becomes the hero photo on every render site
  // via Product.imageUrl.  When undefined (no upload yet) the components
  // fall back to the local convention path under public/images/products/
  // source.  Keeps the WP-admin → live-site flow one upload away.
  const firstImageSrc = (wc.images ?? []).find(
    (img) => typeof img.src === "string" && img.src.length > 0,
  )?.src;
  const imageUrl = firstImageSrc && firstImageSrc.length > 0 ? firstImageSrc : undefined;

  return {
    slug: wc.slug,
    compound,
    name: displayName || wc.name,
    dose,
    variants,
    cas,
    price,
    priceLabel: `$${price.toFixed(2)}`,
    category: pickCategory(wc),
    stock,
    lowCount,
    description,
    disclaimer,
    lot,
    storage,
    purity,
    sku: wc.sku ?? "",
    wcId: wc.id,
    variantMap,
    imageUrl,
  };
}

// ---------------------------------------------------------------------------
// Public API — falls back to STATIC_PRODUCTS on any failure
// ---------------------------------------------------------------------------

// Build-time guard so the diff log only fires once per build instead of
// per-call (RSCs call getAllProducts from many surfaces).
let staticDiffLogged = false;

function logStaticSlugDiff(wcSlugs: Iterable<string>): void {
  if (staticDiffLogged) return;
  staticDiffLogged = true;
  const wcSet = new Set(wcSlugs);
  const missing = STATIC_PRODUCTS.filter((p) => !wcSet.has(p.slug)).map((p) => p.slug);
  if (missing.length === 0) return;
  // Stays informational — the build does not fail; missing entries simply
  // don't get a /shop/[slug] page generated.
  console.warn(
    `[wc-api] Static seed slugs without a WooCommerce product: ${missing.join(", ")}. ` +
      `Add these in WP admin (or remove them from src/data/products.static.ts) to make /shop/[slug] generate them.`,
  );
}

export async function getAllProducts(): Promise<Product[]> {
  const wc = await fetchWcProducts();
  const HIDDEN_SLUGS = new Set(["glp-stack", "healing-stack", "recovery-stack"]);
  if (!wc || wc.length === 0) return STATIC_PRODUCTS.filter((p) => !HIDDEN_SLUGS.has(p.slug));
  try {
    const products = (await Promise.all(
      wc
        .filter((p) => !HIDDEN_SLUGS.has(p.slug))
        .map(async (p) => {
          const variations =
            p.type === "variable" ? (await fetchWcVariations(p.id)) ?? undefined : undefined;
          return toProduct(p, variations);
        }),
    ));
    if (hasCreds()) logStaticSlugDiff(wc.map((p) => p.slug));
    return products;
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const wc = await fetchWcProductBySlug(slug);
  if (wc) {
    try {
      const variations =
        wc.type === "variable" ? (await fetchWcVariations(wc.id)) ?? undefined : undefined;
      return toProduct(wc, variations);
    } catch {
      // fall through to static
    }
  }
  return STATIC_PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Slug list driving generateStaticParams on /shop/[slug].
 *
 * When WC is reachable (creds set + upstream OK) we use ONLY the WC slugs
 * — even an empty result — so the static export never generates a page
 * for a slug that has no live product data.  STATIC_PRODUCTS is reserved
 * for the no-creds fallback path (CI builds, dev without env), where the
 * static fixture is the only data we have.
 */
export async function getAllSlugs(): Promise<string[]> {
  const wc = await fetchWcProducts();
  if (!wc) return STATIC_PRODUCTS.map((p) => p.slug);
  if (hasCreds()) logStaticSlugDiff(wc.map((p) => p.slug));
  return wc.map((p) => p.slug);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const all = await getAllProducts();
  const target = all.find((p) => p.slug === slug);
  if (!target) return all.slice(0, limit);
  const sameCategory = all.filter((p) => p.slug !== slug && p.category === target.category);
  const others = all.filter((p) => p.slug !== slug && p.category !== target.category);
  return [...sameCategory, ...others].slice(0, limit);
}
