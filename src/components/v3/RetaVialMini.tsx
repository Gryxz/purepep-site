/**
 * v3 Apple Swiss vial — sticky-bar thumbnail variant.
 *
 * Ported from docs/design-v3/project/PDP Hero - Apple Swiss.html (sticky bar
 * thumbnail). Smaller than the hero vial; only the SKU code goes on the
 * label so it stays legible at 40 × 40 px.
 */
export function RetaVialMini({ compound }: { compound: string }) {
  return (
    <svg viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="14" y="44" width="52" height="138" rx="6" fill="#EDE6D2" />
      <rect x="18" y="110" width="44" height="68" rx="3" fill="#D9CDA8" />
      <rect x="20" y="42" width="40" height="8" fill="#3D414F" />
      <rect x="16" y="22" width="48" height="22" rx="2" fill="#3D4232" />
      <rect x="20" y="60" width="40" height="42" rx="1.5" fill="#F2EBD9" />
      <text
        x="40"
        y="86"
        textAnchor="middle"
        fill="#1F1F1F"
        fontFamily="Inter, sans-serif"
        fontWeight="900"
        fontSize="14"
      >
        {compound}
      </text>
    </svg>
  );
}
