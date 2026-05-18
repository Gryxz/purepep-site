/**
 * PurePep catalog — static fallback fixture.
 *
 * Used as the build-time fallback when WooCommerce REST credentials are
 * missing or the upstream fetch fails. Mirrors the CATALOG fixture in
 * purepep-site/design-system/ui_kits/storefront/Catalog.jsx so the design
 * source and the storefront stay aligned.
 */

export type StockState = "in" | "low" | "out";

export type Category =
  | "Incretin mimetics"
  | "GH secretagogues"
  | "Healing"
  | "Cognition"
  | "Metabolic";

export interface Product {
  /** "single" (one peptide) vs "stack" (curated multi-peptide bundle).
   *  Defaults to "single" when omitted. */
  type?: "single" | "stack";
  /** For stacks: list of components.  Renders on the PDP composition
   *  block ("BPC-157 — 5 mg / TB-500 — 5 mg / Total · 10 mg"). */
  stackComponents?: Array<{ compound: string; name: string; mass: string }>;
  /** URL slug — lowercased SKU code. */
  slug: string;
  /** Display SKU on the cream label, e.g. "RETA". */
  compound: string;
  /** Full chemical name, e.g. "Retatrutide". */
  name: string;
  /** Mass per vial, e.g. "10 mg". */
  dose: string;
  /** Available variant doses (the first matches `dose` for default). */
  variants: string[];
  /** CAS registry number. */
  cas: string;
  /** Numeric unit price in USD (display formatting is the renderer's job). */
  price: number;
  /** Display price string for parity with the fixture. */
  priceLabel: string;
  /**
   * Optional list price for sale items. When set and greater than `price`,
   * surfaces (PDP big price block, etc.) render a strikethrough of this
   * value next to the live price to communicate "on sale".
   */
  regularPrice?: number;
  /** Catalog category for filtering. */
  category: Category;
  /** Stock state. */
  stock: StockState;
  /** When stock is "low", how many vials remain. */
  lowCount?: number;
  /** Long-form description for PDP body copy. */
  description: string;
  /** Sub-tagline for PDP, "this is a lyophilized powder vial …" style. */
  disclaimer: string;
  /** Lot identifier displayed on the spec table. */
  lot: string;
  /** Storage requirement string. */
  storage: string;
  /** Purity threshold string ("≥ 99.5% (HPLC)"). */
  purity: string;
  /** SKU printed on PDP. */
  sku: string;
  /** WooCommerce product ID — populated when sourced from the WC REST API. */
  wcId?: number;
  /**
   * Maps dose string → WC variation id + per-dose price. Only populated when
   * the upstream WC product is type:"variable" — the variation id is what the
   * Store API /cart/add-item needs (parent ids are rejected for variable
   * products), and the per-dose price is what the PDP must surface so the
   * "5 mg / 10 mg / 15 mg" toggle reflects real WC pricing.
   */
  variantMap?: Record<string, { wcId: number; price: number }>;
  /**
   * Static fallback prices per variant — used when variantMap (WC) is
   * not yet populated.  Keyed by the same dose strings as `variants`.
   * Lets the PDP variant selector update the live price even before
   * WooCommerce variations have been configured.
   */
  variantPrices?: Record<string, number>;
  /**
   * Hero product photograph URL.  Populated by `wc-api.ts → toProduct()`
   * from the first WooCommerce product image (`images[0].src`).  Render
   * sites consume as `product.imageUrl ?? local-fallback-path` so a WP
   * admin upload immediately surfaces on the live site without code
   * changes.  Undefined → falls back to the per-slug local convention
   * at `/images/products/source/purepep-vial-{slug}-v1.0.jpg`.
   */
  imageUrl?: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "reta",
    compound: "RETA",
    name: "Retatrutide",
    dose: "10 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 109.0, "10 mg": 189.0, "15 mg": 269.0 },
    cas: "2381089-83-2",
    price: 189.0,
    priceLabel: "$189.00",
    category: "Incretin mimetics",
    stock: "in",
    description:
      "Retatrutide (LY3437943) is a synthetic 39-amino-acid peptide — a triple agonist at GLP-1, GIP, and glucagon receptors. Supplied as a white lyophilized powder in a stoppered glass vial, assayed at ≥99.5% by HPLC on every lot and shipped with a lot-matched certificate of analysis.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "RT-2604-A11",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-RT-010",
  },
  {
    slug: "sema",
    compound: "SEMA",
    name: "Semaglutide",
    dose: "5 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 149.0, "10 mg": 249.0, "15 mg": 349.0 },
    cas: "910463-68-2",
    price: 149.0,
    priceLabel: "$149.00",
    category: "Incretin mimetics",
    stock: "in",
    description:
      "Semaglutide is a long-acting GLP-1 receptor agonist. Synthesized via solid-phase peptide synthesis, lyophilized in a sealed glass vial, and characterized by HPLC, mass spectrometry, and net peptide content.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "SE-2604-B07",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-SE-005",
  },
  {
    slug: "tirz",
    compound: "TIRZ",
    name: "Tirzepatide",
    dose: "10 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 119.0, "10 mg": 199.0, "15 mg": 279.0 },
    cas: "2023788-19-2",
    price: 199.0,
    priceLabel: "$199.00",
    category: "Incretin mimetics",
    stock: "low",
    lowCount: 3,
    description:
      "Tirzepatide is a synthetic 39-amino-acid dual agonist at the GIP and GLP-1 receptors. Supplied lyophilized for reconstitution, lot-matched COA included with every shipment.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "TZ-2604-C03",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-TZ-010",
  },
  {
    slug: "cagri",
    compound: "CAGRI",
    name: "Cagrilintide",
    dose: "5 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 179.0, "10 mg": 299.0, "15 mg": 399.0 },
    cas: "1415456-99-3",
    price: 179.0,
    priceLabel: "$179.00",
    category: "Metabolic",
    stock: "in",
    description:
      "Cagrilintide is a long-acting amylin analogue investigated for metabolic study. Lyophilized, ≥99.5% by HPLC, lot-traceable.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "CG-2603-A12",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-CG-005",
  },
  {
    slug: "survo",
    compound: "SURVO",
    name: "Survodutide",
    dose: "10 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 109.0, "10 mg": 189.0, "15 mg": 269.0 },
    cas: "1510265-99-0",
    price: 189.0,
    priceLabel: "$189.00",
    category: "Incretin mimetics",
    stock: "in",
    description:
      "Survodutide is an investigational dual GLP-1/glucagon receptor agonist supplied as a white lyophilized powder in a stoppered vial.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "SV-2604-A05",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-SV-010",
  },
  {
    slug: "bpc-157",
    compound: "BPC",
    name: "BPC-157",
    dose: "5 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 69.0, "10 mg": 119.0, "15 mg": 169.0 },
    cas: "137525-51-0",
    price: 69.0,
    priceLabel: "$69.00",
    category: "Healing",
    stock: "in",
    description:
      "BPC-157 is a 15-amino-acid pentadecapeptide derived from a protective gastric protein, studied for tissue repair pathways.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "BP-2604-D11",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-BP-005",
  },
  {
    slug: "tb-500",
    compound: "TB500",
    name: "TB-500",
    dose: "5 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 89.0, "10 mg": 149.0, "15 mg": 209.0 },
    cas: "77591-33-4",
    price: 89.0,
    priceLabel: "$89.00",
    category: "Healing",
    stock: "in",
    description:
      "TB-500 (thymosin β-4 fragment) is a 17-amino-acid synthetic peptide used in tissue repair research.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "TB-2604-A02",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-TB-005",
  },
  {
    slug: "ipamorelin",
    compound: "IPA",
    name: "Ipamorelin",
    dose: "5 mg",
    variants: ["5 mg", "10 mg", "15 mg"],
    variantPrices: { "5 mg": 79.0, "10 mg": 129.0, "15 mg": 179.0 },
    cas: "170851-70-4",
    price: 79.0,
    priceLabel: "$79.00",
    category: "GH secretagogues",
    stock: "low",
    lowCount: 5,
    description:
      "Ipamorelin is a pentapeptide growth hormone secretagogue. Lyophilized, lot-traceable, ≥99.0% pure by HPLC.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "IP-2604-B08",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-IP-005",
  },
  // GHK-Cu / MOTS-c: canon SKUs + product images that previously lived
  // only on the WC backend. price / lot / sku below are PLACEHOLDERS —
  // reconcile against the WC source of truth (pnpm wc:audit) before launch.
  {
    slug: "ghk-cu",
    compound: "GHKCU",
    name: "GHK-Cu",
    dose: "50 mg",
    variants: ["50 mg"],
    cas: "49557-75-7",
    price: 65.0, // PLACEHOLDER
    priceLabel: "$65.00", // PLACEHOLDER
    category: "Healing",
    stock: "in",
    description:
      "GHK-Cu (copper tripeptide-1) is a naturally occurring copper-binding tripeptide studied in skin-remodeling and tissue-repair research.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "GH-0000-PLACEHOLDER", // PLACEHOLDER
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-GHKCU-050", // PLACEHOLDER
  },
  {
    slug: "mots-c",
    compound: "MOTSC",
    name: "MOTS-c",
    dose: "10 mg",
    variants: ["10 mg"],
    cas: "1627580-64-6",
    price: 95.0, // PLACEHOLDER
    priceLabel: "$95.00", // PLACEHOLDER
    category: "Metabolic",
    stock: "in",
    description:
      "MOTS-c is a 16-amino-acid mitochondrial-derived peptide studied in metabolic-regulation and exercise-physiology research.",
    disclaimer:
      "This is a lyophilized powder vial intended for research use — this is not a capsule or oral supplement.",
    lot: "MO-0000-PLACEHOLDER", // PLACEHOLDER
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-MOTSC-010", // PLACEHOLDER
  },
  {
    slug: "bac-water",
    compound: "BACW",
    name: "Bacteriostatic Water",
    dose: "30 mL",
    variants: ["30 mL"],
    cas: "—",
    price: 25.0,
    priceLabel: "$25.00",
    regularPrice: 30.0,
    category: "Healing",
    stock: "in",
    description:
      "0.9% benzyl alcohol bacteriostatic water for in vitro reconstitution of lyophilized peptides. Sterile-filtered, multi-dose 30 mL vial. Pairs with every PurePep peptide vial.",
    disclaimer:
      "Bacteriostatic water for laboratory reconstitution of lyophilized research peptides — not for human or veterinary use.",
    lot: "BW-2604-A01",
    storage: "Room temperature, protect from light",
    purity: "USP-grade · 0.9% benzyl alcohol",
    sku: "PP-BACW-030",
  },
  // Healing Stack — BPC-157 5mg + TB-500 5mg
  {
    slug: "healing-stack",
    compound: "HEAL",
    name: "Healing Stack",
    dose: "10 mg",
    variants: ["10 mg"],
    variantPrices: { "10 mg": 150.0 },
    cas: "—",
    price: 150.0,
    priceLabel: "$150.00",
    regularPrice: 158.0,
    category: "Healing",
    stock: "in",
    description:
      "Curated tissue-repair bundle pairing BPC-157 and TB-500. Each peptide ships as its own separately-sealed lyophilized vial — never pre-mixed — under a single lot-matched COA. Both peptides are studied for synergistic roles in connective-tissue and vascular repair models.",
    disclaimer:
      "This is a curated multi-peptide research stack — supplied as two lyophilized vials with a single lot-matched COA covering both compounds.",
    lot: "HS-2604-A01",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-HS-010",
    type: "stack",
    stackComponents: [
      { compound: "BPC", name: "BPC-157", mass: "5 mg" },
      { compound: "TB500", name: "TB-500", mass: "5 mg" },
    ],
  },
  // GLP Stack — Retatrutide 5mg + Cagrilintide 5mg
  {
    slug: "glp-stack",
    compound: "GLPS",
    name: "GLP Stack",
    dose: "10 mg",
    variants: ["10 mg"],
    variantPrices: { "10 mg": 274.0 },
    cas: "—",
    price: 274.0,
    priceLabel: "$274.00",
    regularPrice: 288.0,
    category: "Incretin mimetics",
    stock: "in",
    description:
      "GLP-1 / amylin combination stack pairing Retatrutide (triple GLP-1 / GIP / glucagon agonist) with Cagrilintide (long-acting amylin analogue). Each peptide ships as its own separately-sealed lyophilized vial — never pre-mixed — under a single lot-matched COA. Studied in metabolic research models.",
    disclaimer:
      "This is a curated multi-peptide research stack — supplied as two lyophilized vials with a single lot-matched COA covering both compounds.",
    lot: "GS-2604-A01",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.5% (HPLC)",
    sku: "PP-GS-010",
    type: "stack",
    stackComponents: [
      { compound: "RETA", name: "Retatrutide", mass: "5 mg" },
      { compound: "CAGRI", name: "Cagrilintide", mass: "5 mg" },
    ],
  },
  // Recovery Stack — BPC-157 5mg + Ipamorelin 5mg
  {
    slug: "recovery-stack",
    compound: "RECOV",
    name: "Recovery Stack",
    dose: "10 mg",
    variants: ["10 mg"],
    variantPrices: { "10 mg": 141.0 },
    cas: "—",
    price: 141.0,
    priceLabel: "$141.00",
    regularPrice: 148.0,
    category: "Healing",
    stock: "in",
    description:
      "Combined tissue-repair and GH-secretagogue stack pairing BPC-157 with Ipamorelin. Each peptide ships as its own separately-sealed lyophilized vial — never pre-mixed — under a single lot-matched COA. Studied for overlapping recovery research pathways.",
    disclaimer:
      "This is a curated multi-peptide research stack — supplied as two lyophilized vials with a single lot-matched COA covering both compounds.",
    lot: "RS-2604-A01",
    storage: "2–8 °C, protect from light",
    purity: "≥ 99.0% (HPLC)",
    sku: "PP-RS-010",
    type: "stack",
    stackComponents: [
      { compound: "BPC", name: "BPC-157", mass: "5 mg" },
      { compound: "IPAM", name: "Ipamorelin", mass: "5 mg" },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

export function getRelated(slug: string, limit = 4): Product[] {
  const target = getProduct(slug);
  if (!target) return PRODUCTS.slice(0, limit);
  const sameCategory = PRODUCTS.filter((p) => p.slug !== slug && p.category === target.category);
  const others = PRODUCTS.filter((p) => p.slug !== slug && p.category !== target.category);
  return [...sameCategory, ...others].slice(0, limit);
}
