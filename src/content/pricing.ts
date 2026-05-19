/**
 * Shared bulk-pricing tiers.
 *
 * The 1/3/5-vial discount ladder is identical on desktop (PDPHero) and
 * mobile (MobilePDP) so a 5-vial order costs the same on either device.
 * Previously desktop-only — mobile had no bulk discount at all.
 */
export interface PricingTier {
  qty: number;
  discount: number;
  label: string;
  sub: string;
  save: string;
  badge?: "Most popular";
}

export const PRICING_TIERS: PricingTier[] = [
  { qty: 1, discount: 0, label: "1 vial", sub: "single unit", save: "No discount" },
  { qty: 3, discount: 0.1, label: "3 vials", sub: "researcher pack", save: "Save 10%", badge: "Most popular" },
  { qty: 5, discount: 0.2, label: "5 vials", sub: "lab pack", save: "Save 20%" },
];

/** Default selection — the entry-tier (1 vial).  The 3-vial tier
 * keeps the "Most popular" badge as informational, but it isn't
 * pre-selected for the user (per Taiga's feedback). */
export const DEFAULT_TIER_INDEX = 0;
