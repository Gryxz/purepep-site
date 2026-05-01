/**
 * Compliance copy — locked verbatim by the brand bible. Quoted directly
 * by every product surface (PDP, COA panels, checkout strip, footer).
 *
 * Mirrors the canonical token set that lives in
 * `purepep-site/design-system/tokens.ts` (the brand source-of-truth
 * submodule). Production builds don't ship that submodule, so this file
 * holds the subset of tokens the storefront actually consumes — kept in
 * sync by hand. The token-fence script bans hand-typed compliance
 * strings; everything that needs these values must import from here
 * (resolved via the `@design/*` alias in tsconfig.json).
 */
export const compliance = {
  researchUseOnly: "For research use only. Not for human consumption.",
  qualified21: "Sales restricted to qualified researchers, 21 and over.",
  noRefunds: "All sales final. No refunds, no exchanges, no returns.",
} as const;

export type Compliance = typeof compliance;
