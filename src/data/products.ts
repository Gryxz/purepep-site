/**
 * PurePep catalog — single source of truth for product listings.
 *
 * Mirrors the CATALOG fixture in
 * purepep-site/design-system/ui_kits/storefront/Catalog.jsx so the design
 * source and the storefront stay aligned. Generalized so /shop/[slug]
 * resolves any compound's PDP via a stable URL slug.
 */

export type StockState = "in" | "low" | "out";

export type Category =
  | "Incretin mimetics"
  | "GH secretagogues"
  | "Healing"
  | "Cognition"
  | "Metabolic";

export interface Product {
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
}

export const PRODUCTS: Product[] = [
  {
    slug: "reta",
    compound: "RETA",
    name: "Retatrutide",
    dose: "10 mg",
    variants: ["5 mg", "10 mg"],
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
    variants: ["2 mg", "5 mg", "10 mg"],
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
    variants: ["5 mg", "10 mg"],
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
    variants: ["5 mg", "10 mg"],
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
    variants: ["5 mg", "10 mg"],
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
    variants: ["5 mg", "10 mg"],
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
    compound: "IPAM",
    name: "Ipamorelin",
    dose: "5 mg",
    variants: ["2 mg", "5 mg"],
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
