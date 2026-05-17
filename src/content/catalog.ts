/**
 * Shared catalog copy + state labels.
 *
 * Desktop (components/v3/CatalogPage) and mobile (components/v5/
 * MobileShopPage) both render from these constants so wording, CTAs,
 * compliance strings and stock-state labels stay identical — content
 * parity by construction. Each surface keeps its own layout/styling.
 */
import type { StockState } from "@/data/products";

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
