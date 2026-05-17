/**
 * Single source of truth for catalog category filters.
 *
 * Both the desktop catalog (components/v3/CatalogPage) and the mobile
 * catalog (components/v5/MobileShopPage) consume this so the chip set,
 * labels, and category buckets stay in lockstep — parity by construction.
 *
 * Every `Category` union member is reachable by exactly one non-"all"
 * filter, so no product can be stranded out of every bucket.
 */
import type { Category } from "./products.static";

export type FilterKey = "all" | "glp1" | "growth" | "healing" | "cognition";

export interface CatalogFilter {
  key: FilterKey;
  /** Full label — desktop chips. */
  label: string;
  /** Compact label — mobile chips. */
  shortLabel: string;
  match: (c: Category) => boolean;
}

export const CATALOG_FILTERS: CatalogFilter[] = [
  { key: "all",       label: "All",                shortLabel: "All",       match: () => true },
  { key: "glp1",      label: "GLP-1 & metabolic",  shortLabel: "GLP-1",     match: (c) => c === "Incretin mimetics" || c === "Metabolic" },
  { key: "growth",    label: "Growth hormone",     shortLabel: "Growth",    match: (c) => c === "GH secretagogues" },
  { key: "healing",   label: "Healing & repair",   shortLabel: "Healing",   match: (c) => c === "Healing" },
  { key: "cognition", label: "Cognition",          shortLabel: "Cognition", match: (c) => c === "Cognition" },
];

export function filterCounts(
  products: ReadonlyArray<{ category: Category }>,
): Record<FilterKey, number> {
  const counts = {} as Record<FilterKey, number>;
  for (const f of CATALOG_FILTERS) counts[f.key] = 0;
  for (const p of products) {
    for (const f of CATALOG_FILTERS) {
      if (f.match(p.category)) counts[f.key]++;
    }
  }
  return counts;
}

/**
 * Chips actually worth showing: "all" always, plus any bucket that has
 * at least one product. Both catalogs derive their chip row from this so
 * they render an identical set for identical data.
 */
export function visibleFilters(
  counts: Record<FilterKey, number>,
): CatalogFilter[] {
  return CATALOG_FILTERS.filter((f) => f.key === "all" || counts[f.key] > 0);
}
