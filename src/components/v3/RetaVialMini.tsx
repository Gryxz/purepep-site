/**
 * Premium lyophilized-vial thumbnail for cart / sticky-bar use.
 * Each compound gets a category-matched color palette: cap, liquid glow,
 * and label accent are all derived from the compound's therapeutic class.
 * Gradient IDs are scoped per compound to avoid collisions when multiple
 * vials render on the same page.
 */

interface Palette {
  capTop: string;
  capMid: string;
  capEdge: string;
  glowInner: string;
  glowOuter: string;
  labelAccent: string;
  stopper: string;
}

const PALETTES: Record<string, Palette> = {
  // ── Incretin mimetics (GLP-1) ── warm amber/gold ──────────────────────
  RETA:  glp1(),
  SEMA:  glp1(),
  TIRZ:  glp1(),
  SURVO: glp1(),
  // ── Metabolic ── indigo/violet ────────────────────────────────────────
  CAGRI: metabolic(),
  MOTSC: metabolic(),
  // ── GH secretagogues ── steel blue ───────────────────────────────────
  IPA:   ghs(),
  // ── Healing ── emerald ────────────────────────────────────────────────
  BPC:   healing(),
  TB500: healing(),
  GHKCU: healing(),
  BACW:  healing(),
};

function glp1(): Palette {
  return {
    capTop:      "#7A4C00",
    capMid:      "#C87C10",
    capEdge:     "#A06008",
    glowInner:   "rgba(220,142,20,0.42)",
    glowOuter:   "rgba(200,120,10,0.04)",
    labelAccent: "#B87010",
    stopper:     "#1e2028",
  };
}
function metabolic(): Palette {
  return {
    capTop:      "#2E2580",
    capMid:      "#6558D4",
    capEdge:     "#3E34A0",
    glowInner:   "rgba(110,90,230,0.40)",
    glowOuter:   "rgba(80,65,200,0.04)",
    labelAccent: "#5848C0",
    stopper:     "#1a1a28",
  };
}
function ghs(): Palette {
  return {
    capTop:      "#0D3E62",
    capMid:      "#1E7AB8",
    capEdge:     "#155888",
    glowInner:   "rgba(30,122,184,0.40)",
    glowOuter:   "rgba(20,96,152,0.04)",
    labelAccent: "#1268A0",
    stopper:     "#141c24",
  };
}
function healing(): Palette {
  return {
    capTop:      "#064430",
    capMid:      "#10A870",
    capEdge:     "#087A52",
    glowInner:   "rgba(16,168,112,0.40)",
    glowOuter:   "rgba(10,128,84,0.04)",
    labelAccent: "#0A8A5C",
    stopper:     "#101e18",
  };
}

const DEFAULT_PALETTE: Palette = glp1();

export function RetaVialMini({ compound }: { compound: string }) {
  const p = PALETTES[compound] ?? DEFAULT_PALETTE;
  const id = compound.replace(/[^a-z0-9]/gi, "").toLowerCase();

  return (
    <svg
      viewBox="0 0 80 210"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* cap metallic gradient */}
        <linearGradient id={`cap-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={p.capEdge} />
          <stop offset="18%"  stopColor={p.capTop}  />
          <stop offset="42%"  stopColor={p.capMid}  />
          <stop offset="72%"  stopColor={p.capEdge} />
          <stop offset="100%" stopColor={p.capTop}  />
        </linearGradient>

        {/* cap top sheen */}
        <linearGradient id={`cap-sheen-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
          <stop offset="60%"  stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </linearGradient>

        {/* glass body gradient — left dark, center warm cream, right slightly dark */}
        <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#cec5ae" />
          <stop offset="12%"  stopColor="#ede5d2" />
          <stop offset="50%"  stopColor="#f5eede" />
          <stop offset="88%"  stopColor="#e8e0cb" />
          <stop offset="100%" stopColor="#c6bca5" />
        </linearGradient>

        {/* compound ambient glow inside glass */}
        <radialGradient id={`glow-${id}`} cx="50%" cy="68%" r="62%">
          <stop offset="0%"   stopColor={p.glowInner} />
          <stop offset="100%" stopColor={p.glowOuter}  />
        </radialGradient>

        {/* label paper gradient */}
        <linearGradient id={`label-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#faf5ec" />
          <stop offset="100%" stopColor="#f0e9da" />
        </linearGradient>

        {/* left-edge glass highlight */}
        <linearGradient id={`ledge-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="40%"  stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>

        {/* right-edge subtle shadow */}
        <linearGradient id={`redge-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.04)" />
        </linearGradient>

        {/* bottom shadow ellipse */}
        <radialGradient id={`shadow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.28)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
        </radialGradient>
      </defs>

      {/* ── ground shadow ── */}
      <ellipse cx="40" cy="206" rx="24" ry="4" fill={`url(#shadow-${id})`} />

      {/* ── glass body ── */}
      <rect x="13" y="50" width="54" height="148" rx="9" fill={`url(#glass-${id})`} />

      {/* lyophilized powder cake — frosted white at bottom of vial */}
      <rect x="15" y="155" width="50" height="38" rx="5" fill="rgba(255,253,248,0.72)" />
      <rect x="15" y="155" width="50" height="5"  rx="2" fill="rgba(255,255,255,0.5)" />

      {/* compound ambient glow */}
      <rect x="13" y="50" width="54" height="148" rx="9" fill={`url(#glow-${id})`} />

      {/* ── label ── */}
      <rect x="17" y="76" width="46" height="72" rx="3.5" fill={`url(#label-${id})`} />
      {/* label top accent bar */}
      <rect x="17" y="76" width="46" height="5" rx="3.5" fill={p.labelAccent} opacity="0.85" />
      {/* label bottom accent bar */}
      <rect x="17" y="143" width="46" height="5" rx="3.5" fill={p.labelAccent} opacity="0.55" />
      {/* label border */}
      <rect x="17" y="76" width="46" height="72" rx="3.5" fill="none" stroke={p.labelAccent} strokeWidth="0.6" opacity="0.5" />

      {/* compound code */}
      <text
        x="40"
        y="112"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1a1a1a"
        fontFamily="'Inter', 'SF Pro Display', system-ui, sans-serif"
        fontWeight="800"
        fontSize="13"
        letterSpacing="0.5"
      >
        {compound}
      </text>
      {/* "PEPTIDES" micro text below compound code */}
      <text
        x="40"
        y="127"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={p.labelAccent}
        fontFamily="'Inter', system-ui, sans-serif"
        fontWeight="600"
        fontSize="6"
        letterSpacing="1.8"
        opacity="0.9"
      >
        PUREPEP
      </text>

      {/* ── left edge glass highlight ── */}
      <rect x="14" y="52" width="5" height="140" rx="2.5" fill={`url(#ledge-${id})`} />

      {/* ── right edge shadow ── */}
      <rect x="61" y="52" width="5" height="140" rx="2.5" fill={`url(#redge-${id})`} />

      {/* ── top glass dome shine ── */}
      <ellipse cx="34" cy="58" rx="12" ry="4" fill="rgba(255,255,255,0.32)" />

      {/* ── rubber stopper ── */}
      <rect x="20" y="38" width="40" height="16" rx="2" fill={p.stopper} />
      {/* stopper sheen */}
      <rect x="23" y="39.5" width="12" height="5" rx="1.5" fill="rgba(255,255,255,0.14)" />
      {/* stopper center disk */}
      <ellipse cx="40" cy="46" rx="10" ry="3" fill="rgba(255,255,255,0.07)" />

      {/* ── aluminum crimp cap ── */}
      <rect x="16" y="8" width="48" height="34" rx="5" fill={`url(#cap-${id})`} />
      {/* cap sheen overlay */}
      <rect x="16" y="8" width="48" height="34" rx="5" fill={`url(#cap-sheen-${id})`} />
      {/* crimp ring at cap bottom */}
      <rect x="14" y="38" width="52" height="4" rx="1" fill={p.capEdge} opacity="0.7" />
      {/* cap top rim */}
      <rect x="18" y="8" width="44" height="4" rx="2" fill={p.capTop} opacity="0.6" />
      {/* cap left highlight strip */}
      <rect x="20" y="11" width="7" height="26" rx="3" fill="rgba(255,255,255,0.22)" />
      {/* cap right micro-shadow */}
      <rect x="55" y="11" width="5" height="26" rx="2" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}
