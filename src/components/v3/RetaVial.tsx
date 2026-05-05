"use client";

/**
 * v3 Apple Swiss vial — large hero variant.
 *
 * Ported verbatim from docs/design-v3/project/PDP Hero - Apple Swiss.html.
 * The label text (compound, dose, lot, expiry, storage) is parameterised
 * so the same artwork serves every SKU; everything else (gradient stops,
 * glass refraction highlights, crimp cap, stopper) is geometry the design
 * locks in place.
 */
export function RetaVial({
  compound,
  dose,
  lot,
  exp = "2027-04",
  storage = "2–8 °C · protect from light",
}: {
  compound: string;
  dose: string;
  lot: string;
  exp?: string;
  storage?: string;
}) {
  return (
    <svg
      className="v3pdp-vial"
      viewBox="0 0 220 540"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${compound} ${dose} vial`}
    >
      <defs>
        <linearGradient id="v3-vial-glass" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F8F4EA" />
          <stop offset="18%" stopColor="#FFFDF6" />
          <stop offset="50%" stopColor="#EDE6D2" />
          <stop offset="82%" stopColor="#C9BFA3" />
          <stop offset="100%" stopColor="#A89E83" />
        </linearGradient>
        <linearGradient id="v3-vial-powder" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FAF6EB" />
          <stop offset="100%" stopColor="#E5DDC8" />
        </linearGradient>
        <linearGradient id="v3-vial-cap" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2A2D38" />
          <stop offset="40%" stopColor="#5A5E6E" />
          <stop offset="55%" stopColor="#7C8092" />
          <stop offset="70%" stopColor="#3E4252" />
          <stop offset="100%" stopColor="#191B23" />
        </linearGradient>
        <linearGradient id="v3-vial-stopper" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#1A1C24" />
          <stop offset="50%" stopColor="#2C2F3A" />
          <stop offset="100%" stopColor="#0F1116" />
        </linearGradient>
        <linearGradient id="v3-vial-label" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F2EBD9" />
          <stop offset="100%" stopColor="#E5DCC4" />
        </linearGradient>
      </defs>

      {/* Vial body */}
      <rect x="40" y="120" width="140" height="380" rx="14" fill="url(#v3-vial-glass)" />

      {/* Lyophilized powder fill */}
      <rect x="50" y="280" width="120" height="210" rx="6" fill="url(#v3-vial-powder)" opacity="0.95" />
      <g opacity="0.18">
        <line x1="56" y1="320" x2="166" y2="320" stroke="#C8BE9F" strokeWidth="0.5" />
        <line x1="56" y1="345" x2="166" y2="345" stroke="#C8BE9F" strokeWidth="0.5" />
        <line x1="56" y1="380" x2="166" y2="380" stroke="#C8BE9F" strokeWidth="0.5" />
        <line x1="56" y1="430" x2="166" y2="430" stroke="#C8BE9F" strokeWidth="0.5" />
      </g>
      <path d="M50 282 Q 80 274 110 280 T 170 282 L 170 290 L 50 290 Z" fill="#D4CAB0" opacity="0.6" />

      {/* Glass highlights */}
      <rect x="48" y="130" width="6" height="360" rx="3" fill="#FFFDF6" opacity="0.9" />
      <rect x="172" y="130" width="3" height="360" rx="1.5" fill="#86795A" opacity="0.5" />

      {/* Vial neck */}
      <path d="M40 120 L 56 100 L 164 100 L 180 120 Z" fill="url(#v3-vial-glass)" />
      <rect x="40" y="118" width="140" height="3" fill="#9C9176" opacity="0.5" />

      {/* Stopper */}
      <rect x="56" y="76" width="108" height="28" rx="2" fill="url(#v3-vial-stopper)" />
      <rect x="58" y="78" width="104" height="2" fill="#3D414F" opacity="0.7" />

      {/* Aluminum crimp cap */}
      <rect x="50" y="40" width="120" height="44" rx="3" fill="url(#v3-vial-cap)" />
      <ellipse cx="110" cy="40" rx="60" ry="6" fill="#3A3D49" />
      <ellipse cx="110" cy="40" rx="60" ry="3" fill="#5C6072" />
      <rect x="56" y="46" width="6" height="36" fill="#9094A7" opacity="0.85" />
      <rect x="68" y="46" width="2" height="36" fill="#C9CCDA" opacity="0.7" />
      <rect x="50" y="78" width="120" height="2" fill="#0E1016" opacity="0.7" />
      <rect x="50" y="82" width="120" height="2" fill="#0E1016" opacity="0.7" />
      <circle cx="110" cy="40" r="14" fill="#3D4232" />
      <circle cx="110" cy="40" r="11" fill="none" stroke="#5A6048" strokeWidth="0.5" />

      {/* Paper label */}
      <rect x="44" y="195" width="132" height="220" rx="3" fill="url(#v3-vial-label)" />
      <rect x="48" y="199" width="124" height="212" rx="2" fill="none" stroke="#B5A989" strokeWidth="0.5" opacity="0.7" />

      {/* Label header — τ glyph + PurePep wordmark */}
      <rect x="56" y="210" width="14" height="14" rx="2" fill="#14161C" />
      <text x="63" y="221" textAnchor="middle" fill="#F5F1EA" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="10">
        P
      </text>
      <text x="76" y="221" fill="#14161C" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="11" letterSpacing="-0.5">
        PurePep
      </text>

      <line x1="56" y1="234" x2="164" y2="234" stroke="#14161C" strokeWidth="0.4" opacity="0.3" />

      {/* Compound + dose */}
      <text x="56" y="282" fill="#14161C" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="40" letterSpacing="-2">
        {compound}
      </text>
      <text x="56" y="310" fill="#14161C" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="16" letterSpacing="-0.3">
        {dose} · lyophilized
      </text>

      <line x1="56" y1="328" x2="164" y2="328" stroke="#14161C" strokeWidth="0.4" opacity="0.2" />

      {/* Lot + expiry */}
      <text x="56" y="346" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="6.5" letterSpacing="1">
        LOT
      </text>
      <text x="56" y="360" fill="#14161C" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="9">
        {lot}
      </text>
      <text x="120" y="346" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="6.5" letterSpacing="1">
        EXP
      </text>
      <text x="120" y="360" fill="#14161C" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="9">
        {exp}
      </text>

      {/* Storage */}
      <text x="56" y="382" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="6.5" letterSpacing="1">
        STORAGE
      </text>
      <text x="56" y="396" fill="#14161C" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="9">
        {storage}
      </text>

      <line x1="56" y1="402" x2="164" y2="402" stroke="#14161C" strokeWidth="0.3" opacity="0.2" />
      <text x="56" y="411" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="5.5" letterSpacing="1">
        FOR RESEARCH USE ONLY
      </text>
    </svg>
  );
}
