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

interface WcProduct {
  id: number;
  slug: string;
  name: string;
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
  for (const known of KNOWN_CATEGORIES) {
    if (names.some((n) => n.toLowerCase() === known.toLowerCase())) {
      return known;
    }
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
  const dose = (wc.attributes ?? []).find((a) =>
    (a.name ?? "").toLowerCase().includes("dose"),
  );
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

function toProduct(wc: WcProduct): Product {
  const variants = pickVariants(wc);
  const dose = variants[0] ?? "";
  const { stock, lowCount } = pickStockState(wc);
  const price = priceNumber(wc);
  const description = stripHtml(wc.description ?? wc.short_description ?? "");

  const compound = pickMeta(wc.meta_data, "_pp_compound") ?? wc.name.toUpperCase();
  const cas = pickMeta(wc.meta_data, "_pp_cas") ?? "";
  const lot = pickMeta(wc.meta_data, "_pp_lot") ?? "";
  const storage = pickMeta(wc.meta_data, "_pp_storage") ?? "2–8 °C, protect from light";
  const purity = pickMeta(wc.meta_data, "_pp_purity") ?? "≥ 99.5% (HPLC)";
  const disclaimer =
    pickMeta(wc.meta_data, "_pp_disclaimer") ??
    "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.";

  return {
    slug: wc.slug,
    compound,
    name: wc.name,
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
  };
}

// ---------------------------------------------------------------------------
// Public API — falls back to STATIC_PRODUCTS on any failure
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<Product[]> {
  const wc = await fetchWcProducts();
  if (!wc || wc.length === 0) return STATIC_PRODUCTS;
  try {
    return wc.map(toProduct);
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const wc = await fetchWcProductBySlug(slug);
  if (wc) {
    try {
      return toProduct(wc);
    } catch {
      // fall through to static
    }
  }
  return STATIC_PRODUCTS.find((p) => p.slug === slug);
}

export async function getAllSlugs(): Promise<string[]> {
  const wc = await fetchWcProducts();
  if (!wc || wc.length === 0) return STATIC_PRODUCTS.map((p) => p.slug);
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
