/**
 * Shared catalog copy + state labels.
 *
 * Desktop (components/v3/CatalogPage) and mobile (components/v5/
 * MobileShopPage) both render from these constants so wording, CTAs,
 * compliance strings and stock-state labels stay identical — content
 * parity by construction. Each surface keeps its own layout/styling.
 */
import type { Product, Category, StockState } from "@/data/products";

/** Stock pill label — identical text on both catalogs (styling per side). */
export function stockLabel(stock: StockState): string {
  switch (stock) {
    case "out":
      return "Waitlist";
    case "low":
      return "Low stock";
    case "in":
      return "In stock";
  }
}

/** Short category label for product-card pills (shared by every mobile grid). */
export function categoryShort(c: Category): string {
  switch (c) {
    case "Incretin mimetics":
      return "GLP-1";
    case "GH secretagogues":
      return "Growth";
    case "Healing":
      return "Healing";
    case "Cognition":
      return "Cognition";
    case "Metabolic":
      return "Metabolic";
  }
}

/** First sentence of the description, capped so it fits a card. */
export function shortDesc(p: Product): string {
  const first = p.description.split(/\.\s+/)[0] ?? p.name;
  return first.length > 60 ? first.slice(0, 57) + "..." : first + ".";
}

/** "Request a compound" CTA block — rendered identically on both. */
export const CATALOG_REQUEST_CTA = {
  eyebrow: "For research teams",
  headlineLead: "Need a compound",
  headlineEmphasis: "that isn't listed?",
  body:
    "We source and synthesize additional peptides for labs and repeat buyers. " +
    "Send us your spec — we respond within one business day.",
  primary: { label: "Request a quote", href: "/legal/contact" },
  secondary: { label: "View all COAs", href: "/documentation" },
} as const;

/** Research-use-only catalog footnote — must appear on both catalogs. */
export const CATALOG_RUO_FOOTNOTE =
  "All products sold for laboratory research use only · Not for human or animal consumption";

/** Single word used for the stack/bundle badge on both catalogs. */
export const STACK_BADGE_LABEL = "Bundle";
