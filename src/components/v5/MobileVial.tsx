// v5 mobile vial — pure CSS/HTML composition (no SVG) ported from
// docs/design-v3/mobile-mockups/. Built as a sized component family so
// mobile cards/items can render the same visual element at four scales:
//   lg  → PDP hero (70×175 body, full label card with brand+CAS+MW)
//   md  → Spotlight + catalog tile + carousel card (40×90 body)
//   sm  → CartPage item row (22×54 body)
//   xs  → CartDrawer item + upsell (20×50 / 13×32 bodies)
// Gradient stops are non-token by design intent — eslint hex-ban + the
// token-fence script both allow this file (mirrors RetaVial.tsx /
// LabelCropSvg.tsx exemptions in eslint.config.mjs and check-tokens-fence.ts).

type Size = "lg" | "md" | "sm" | "xs";

interface Props {
  size: Size;
  /** Short SKU printed on the label face, e.g. "RETA". */
  compound: string;
  /** Mass per vial, e.g. "10 mg". */
  mass: string;
  /** Full chemical name — only rendered at `lg`. */
  fullName?: string;
  /** Brand line above the compound name — only rendered at `lg`. */
  brand?: string;
  /** Purity string — rendered at lg / md / sm. Hidden at xs. */
  purity?: string;
}

const SCALE: Record<Size, {
  // body geometry
  bodyW: number; bodyH: number;
  capH: number; capInset: number;
  powderH: number; powderInset: number;
  // label geometry
  labelW: number; labelPadY: number; labelPadX: number; labelGap: number;
  monoSize: number; monoFont: number;
  nameSize: number;
  massPadY: number; massPadX: number; massSize: number;
  puritySize: number;
  footSize: number;
  showFoot: boolean;
}> = {
  lg: {
    bodyW: 70, bodyH: 175, capH: 24, capInset: 6,
    powderH: 70, powderInset: 6,
    labelW: 130, labelPadY: 18, labelPadX: 12, labelGap: 8,
    monoSize: 28, monoFont: 13,
    nameSize: 15,
    massPadY: 4, massPadX: 10, massSize: 11,
    puritySize: 8,
    footSize: 6.5,
    showFoot: true,
  },
  md: {
    bodyW: 40, bodyH: 90, capH: 12, capInset: 4,
    powderH: 32, powderInset: 4,
    labelW: 56, labelPadY: 7, labelPadX: 4, labelGap: 3,
    monoSize: 13, monoFont: 7,
    nameSize: 7.5,
    massPadY: 1.5, massPadX: 4, massSize: 5.5,
    puritySize: 5,
    footSize: 4.5,
    showFoot: true,
  },
  sm: {
    bodyW: 22, bodyH: 54, capH: 9, capInset: 2,
    powderH: 18, powderInset: 2,
    labelW: 30, labelPadY: 4, labelPadX: 2, labelGap: 2,
    monoSize: 10, monoFont: 5,
    nameSize: 5.5,
    massPadY: 1, massPadX: 2, massSize: 4.5,
    puritySize: 0,
    footSize: 0,
    showFoot: false,
  },
  xs: {
    bodyW: 16, bodyH: 38, capH: 7, capInset: 1,
    powderH: 12, powderInset: 1,
    labelW: 22, labelPadY: 4, labelPadX: 2, labelGap: 2,
    monoSize: 9, monoFont: 4,
    nameSize: 5,
    massPadY: 0, massPadX: 0, massSize: 0,
    puritySize: 0,
    footSize: 0,
    showFoot: false,
  },
};

export function MobileVial({ size, compound, mass, fullName, brand, purity }: Props) {
  const s = SCALE[size];
  const isLg = size === "lg";
  const showMass = s.massSize > 0;
  const showPurity = !!purity && s.puritySize > 0;

  return (
    <div
      className="mob-vial"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: isLg ? 14 : size === "md" ? 4 : 3,
        height: isLg ? "78%" : "85%",
        paddingBottom: isLg ? "8%" : 4,
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Paper label card */}
      <div
        style={{
          width: s.labelW,
          background: "#FAF7F0",
          border: "1px solid #E5DFD2",
          borderRadius: isLg ? 8 : size === "md" ? 4 : 2,
          padding: `${s.labelPadY}px ${s.labelPadX}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: s.labelGap,
          alignSelf: "center",
          boxShadow: isLg ? "0 2px 8px rgba(0,0,0,.06)" : "0 1px 2px rgba(0,0,0,.04)",
        }}
      >
        {/* Mono brand mark */}
        <div
          style={{
            width: s.monoSize,
            height: s.monoSize,
            background: "#1F1F1F",
            color: "#FAF7F0",
            borderRadius: isLg ? 6 : size === "md" ? 3 : 2,
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: s.monoFont,
          }}
        >
          P
        </div>
        {isLg && brand && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "#1F1F1F",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {brand}
          </div>
        )}
        <div
          style={{
            fontWeight: 900,
            fontSize: isLg ? 15 : s.nameSize,
            letterSpacing: "-0.02em",
            color: "#1F1F1F",
            textAlign: "center",
            lineHeight: 1,
            marginTop: isLg ? 2 : 0,
          }}
        >
          {isLg && fullName ? fullName.toUpperCase() : compound}
        </div>
        {showMass && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: s.massSize,
              fontWeight: 500,
              background: "#1F1F1F",
              color: "#FAF7F0",
              padding: `${s.massPadY}px ${s.massPadX}px`,
              borderRadius: isLg ? 3 : 1,
              letterSpacing: "0.04em",
            }}
          >
            {mass}
          </div>
        )}
        {showPurity && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: s.puritySize,
              color: isLg ? "#1F1F1F" : "#6B6B66",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {purity}
          </div>
        )}
        {s.showFoot && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: s.footSize,
              color: "#6B6B66",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderTop: "1px dashed #E5DFD2",
              paddingTop: isLg ? 6 : 2,
              width: "100%",
              textAlign: "center",
              marginTop: isLg ? 4 : 0,
            }}
          >
            For research use only
          </div>
        )}
      </div>

      {/* Glass body — gradient + cap (::before) + powder (::after) */}
      <div
        className="mob-vial-body"
        style={{
          width: s.bodyW,
          height: s.bodyH,
          alignSelf: "flex-end",
          background:
            "linear-gradient(180deg,#d8d4c7 0%,#c4c0b3 30%,#e8e4d7 60%,#d8d4c7 100%)",
          border: "1px solid rgba(31,31,31,.15)",
          borderRadius: isLg ? "5px 5px 10px 10px" : size === "md" ? "3px 3px 6px 6px" : "2px 2px 4px 4px",
          position: "relative",
          boxShadow: isLg
            ? "inset -6px -2px 12px rgba(31,31,31,.1), inset 6px -2px 12px rgba(250,247,240,.3)"
            : "none",
        }}
      >
        {/* Cap */}
        <div
          style={{
            position: "absolute",
            top: -s.capH + 2,
            left: s.capInset,
            right: s.capInset,
            height: s.capH,
            background: "linear-gradient(180deg,#5a5e50 0%,#3d4232 50%,#2a2e24 100%)",
            borderRadius: isLg ? "4px 4px 1px 1px" : "2px 2px 1px 1px",
          }}
        />
        {/* Powder fill */}
        <div
          style={{
            position: "absolute",
            left: s.powderInset,
            right: s.powderInset,
            bottom: s.powderInset,
            height: s.powderH,
            background: "rgba(250,247,240,.92)",
            borderRadius: isLg ? 2 : 1,
            boxShadow: isLg ? "inset 0 -3px 6px rgba(31,31,31,.06)" : "none",
          }}
        />
      </div>
    </div>
  );
}
