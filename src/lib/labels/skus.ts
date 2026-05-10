/* eslint-disable no-restricted-syntax -- this file is the canonical
   source of label-paper + backdrop hex values per SKU.  These are
   brand data (printed on physical labels, fed into Higgsfield as
   composition-reference colors), NOT app styling — they don't belong
   in the design-tokens system.  Allowing raw hex here is intentional. */
/**
 * PurePep canonical SKU label manifest (Canon v1.2).
 *
 * Drives the deterministic label-render pipeline:
 *   scripts/render-labels.ts iterates this list, calls renderLabel() per
 *   entry, and writes a 1080×360 PNG to public/brand/labels/{slug}.png.
 *
 * Add a SKU here, run `pnpm labels`, and the new label drops in.
 *
 * Palette per SKU is the LABEL-paper color.  Backdrop / shelf colors
 * are noted alongside for downstream Higgsfield compositing — the
 * AI-photoreal pass uses the SAME label PNG as a reference image and
 * places the synthesized vial on the matching pastel backdrop.
 */

export interface LabelSku {
  slug: string;
  /** Compound code shown HUGE in the center (IBM Plex Mono Bold caps). */
  abbreviation: string;
  /** Full chemical name shown below the compound code.  Omitted for
   *  RETA only since "Retatrutide" reads as RETA in industry shorthand. */
  fullName: string | null;
  /** CAS registry number (paired with fullName).  Empty string hides
   *  both name and CAS — used for products without a meaningful CAS. */
  cas: string;
  /** Mass label inside the dark dose pill ("10 MG" style). */
  dose: string;
  /** Hex of the LABEL paper color (pastel background of the label). */
  labelBg: string;
  /** Backdrop hex pair for downstream Higgsfield compositing — the
   *  upper / shelf colors of the seamless paper backdrop the AI pass
   *  will place the vial on. */
  backdropUpper: string;
  backdropShelf: string;
}

export const LABEL_SKUS: LabelSku[] = [
  {
    slug: "reta",
    abbreviation: "RETA",
    fullName: null, // industry shorthand — drop the long name
    cas: "2381089-83-2",
    dose: "10 MG",
    labelBg: "#efe6d6",
    backdropUpper: "#f3ead9",
    backdropShelf: "#d4c5a7",
  },
  {
    slug: "sema",
    abbreviation: "SEMA",
    fullName: "Semaglutide",
    cas: "910463-68-2",
    dose: "5 MG",
    labelBg: "#f3d9c6",
    backdropUpper: "#f5dfca",
    backdropShelf: "#d8a586",
  },
  {
    slug: "tirz",
    abbreviation: "TIRZ",
    fullName: "Tirzepatide",
    cas: "2023788-19-2",
    dose: "10 MG",
    labelBg: "#d9d2e8",
    backdropUpper: "#e0d8ec",
    backdropShelf: "#a89dc6",
  },
  {
    slug: "cagri",
    abbreviation: "CAGRI",
    fullName: "Cagrilintide",
    cas: "1415456-99-3",
    dose: "5 MG",
    labelBg: "#cddbc7",
    backdropUpper: "#d8e2d0",
    backdropShelf: "#9eb393",
  },
  {
    slug: "bpc-157",
    abbreviation: "BPC-157",
    fullName: "BPC-157",
    cas: "137525-51-0",
    dose: "5 MG",
    labelBg: "#d4c0c8",
    backdropUpper: "#dcc8d0",
    backdropShelf: "#9c7e8a",
  },
  {
    slug: "tb-500",
    abbreviation: "TB-500",
    fullName: "Thymosin Beta-4 fragment",
    cas: "77591-33-4",
    dose: "5 MG",
    labelBg: "#e1c5c2",
    backdropUpper: "#e8cecb",
    backdropShelf: "#b48b87",
  },
  {
    slug: "ghk-cu",
    abbreviation: "GHK-Cu",
    fullName: "Copper Tripeptide-1",
    cas: "49557-75-7",
    dose: "50 MG",
    labelBg: "#b8cdd9",
    backdropUpper: "#cfdce6",
    backdropShelf: "#a9c0d3",
  },
  {
    slug: "mots-c",
    abbreviation: "MOTS-c",
    fullName: "MOTS-c peptide",
    cas: "1627580-64-6",
    dose: "10 MG",
    labelBg: "#c4d9d4",
    backdropUpper: "#d2e0dc",
    backdropShelf: "#8eada6",
  },
];
