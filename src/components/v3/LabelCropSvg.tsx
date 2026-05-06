// v3 label close-up artwork — ported verbatim from
// docs/design-v3/project/Homepage - Apple Swiss.html.
// Gradient stops and parchment tones are non-token by design intent.
// eslint hex-ban is off for this file (see eslint.config.mjs).

export function LabelCropSvg({
  compound,
  dose,
  lot,
}: {
  compound: string;
  dose: string;
  lot: string;
}) {
  const len = compound.length;
  const fs = len <= 3 ? 80 : len === 4 ? 68 : len === 5 ? 52 : 40;
  const ls = len <= 3 ? -4 : len === 4 ? -3.4 : -2;
  return (
    <svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="labelClose" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#F2EBD9" />
          <stop offset="100%" stopColor="#E5DCC4" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="240" height="280" rx="6" fill="url(#labelClose)" />
      <rect x="6" y="6" width="228" height="268" rx="4" fill="none" stroke="#B5A989" strokeWidth="1" opacity="0.7" />
      {/* PurePep header */}
      <g transform="translate(20, 28)">
        <g transform="scale(0.32)">
          <rect x="4"  y="4"  width="22" height="64" fill="#1F1F1F" />
          <rect x="34" y="4"  width="22" height="36" fill="#1F1F1F" />
          <rect x="26" y="22" width="8"  height="2"  fill="#1F1F1F" />
          <rect x="26" y="29" width="8"  height="2"  fill="#1F1F1F" />
        </g>
        <text x="30" y="18" fill="#1F1F1F" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" letterSpacing="-0.8">PurePep</text>
      </g>
      <line x1="20" y1="68" x2="220" y2="68" stroke="#1F1F1F" strokeWidth="0.6" opacity="0.3" />
      {/* Compound name + dose */}
      <text x="20" y="138" fill="#1F1F1F" fontFamily="Inter, sans-serif" fontWeight="900" fontSize={fs} letterSpacing={ls}>{compound}</text>
      <text x="20" y="170" fill="#1F1F1F" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="22" letterSpacing="-0.4">{dose} · lyophilized</text>
      <line x1="20" y1="190" x2="220" y2="190" stroke="#1F1F1F" strokeWidth="0.6" opacity="0.2" />
      {/* Lot / Exp */}
      <text x="20"  y="212" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="9"  letterSpacing="1.5">LOT</text>
      <text x="20"  y="230" fill="#1F1F1F" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="13">{lot}</text>
      <text x="120" y="212" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="9"  letterSpacing="1.5">EXP</text>
      <text x="120" y="230" fill="#1F1F1F" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="13">2027-04</text>
      <text x="20"  y="258" fill="#7A7E8A" fontFamily="IBM Plex Mono, monospace" fontWeight="500" fontSize="8"  letterSpacing="1.4">FOR RESEARCH USE ONLY</text>
    </svg>
  );
}
