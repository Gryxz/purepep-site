"use client";
/**
 * Storefront primitives — ported from design-system/ui_kits/storefront/Primitives.jsx
 * and ComplianceBlock.jsx. No inline hex; all color refs via className or currentColor.
 */
import React from "react";
import { compliance } from "@design/tokens";
import { clsx } from "@/lib/clsx";

// ---------------------------------------------------------------------------
// Lockup — horizontal brand lockup SVG (313×72). Hardcoded fills replaced with
// currentColor so the component inherits text color from its container.
// ---------------------------------------------------------------------------
export function Lockup({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 313 72"
      fill="currentColor"
      aria-label="PurePep"
      className={className}
    >
      <g>
        <rect x="4" y="4" width="22" height="64" />
        <rect x="26" y="22" width="8" height="2" />
        <rect x="26" y="29" width="8" height="2" />
        <rect x="34" y="4" width="22" height="36" />
      </g>
      <g transform="translate(78 56)">
        <g transform="translate(0 0) scale(0.02734 -0.02734)"><path d="M96 0V1490H738Q904 1490 1028.5 1424.5Q1153 1359 1222.5 1240.0Q1292 1121 1292 962Q1292 802 1221.0 685.5Q1150 569 1022.0 505.5Q894 442 724 442H500V0ZM500 756H642Q714 756 765.0 781.5Q816 807 843.0 853.0Q870 899 870 962Q870 1027 843.0 1072.5Q816 1118 765.0 1142.0Q714 1166 642 1166H500Z" /></g>
        <g transform="translate(35.630 0) scale(0.02734 -0.02734)"><path d="M492 -14Q374 -14 286.0 40.0Q198 94 150.0 189.0Q102 284 102 406V1118H504V490Q504 407 546.0 359.5Q588 312 664 312Q714 312 750.0 333.5Q786 355 806.0 395.0Q826 435 826 490V1118H1228V0H851L844 253Q806 147 732 73Q646 -14 492 -14Z" /></g>
        <g transform="translate(70.877 0) scale(0.02734 -0.02734)"><path d="M102 0V1118H492V904H504Q534 1023 600.5 1077.5Q667 1132 756 1132Q782 1132 808.0 1128.0Q834 1124 858 1116V774Q828 785 784.5 789.5Q741 794 710 794Q651 794 604.0 767.5Q557 741 530.5 693.5Q504 646 504 582V0Z" /></g>
        <g transform="translate(94.038 0) scale(0.02734 -0.02734)"><path d="M638 -20Q459 -20 329.5 48.5Q200 117 131.0 246.0Q62 375 62 556Q62 729 131.5 858.5Q201 988 328.0 1060.0Q455 1132 628 1132Q755 1132 857.5 1092.5Q960 1053 1033.0 978.5Q1106 904 1145.0 798.0Q1184 692 1184 558V466H456Q458 401 480 358Q503 309 546.0 285.5Q589 262 646 262Q687 262 720.5 273.5Q754 285 778.0 306.5Q802 328 814 359L1168 307Q1140 207 1069.0 133.5Q998 60 889.5 20.0Q781 -20 638 -20ZM459 686H805Q801 725 788 755Q768 801 729.0 825.5Q690 850 632.0 850.0Q574 850 535.0 825.5Q496 801 476 755Q463 725 459 686Z" /></g>
        <g transform="translate(126.879 0) scale(0.02734 -0.02734)"><path d="M96 0V1490H738Q904 1490 1028.5 1424.5Q1153 1359 1222.5 1240.0Q1292 1121 1292 962Q1292 802 1221.0 685.5Q1150 569 1022.0 505.5Q894 442 724 442H500V0ZM500 756H642Q714 756 765.0 781.5Q816 807 843.0 853.0Q870 899 870 962Q870 1027 843.0 1072.5Q816 1118 765.0 1142.0Q714 1166 642 1166H500Z" /></g>
        <g transform="translate(162.509 0) scale(0.02734 -0.02734)"><path d="M638 -20Q459 -20 329.5 48.5Q200 117 131.0 246.0Q62 375 62 556Q62 729 131.5 858.5Q201 988 328.0 1060.0Q455 1132 628 1132Q755 1132 857.5 1092.5Q960 1053 1033.0 978.5Q1106 904 1145.0 798.0Q1184 692 1184 558V466H456Q458 401 480 358Q503 309 546.0 285.5Q589 262 646 262Q687 262 720.5 273.5Q754 285 778.0 306.5Q802 328 814 359L1168 307Q1140 207 1069.0 133.5Q998 60 889.5 20.0Q781 -20 638 -20ZM459 686H805Q801 725 788 755Q768 801 729.0 825.5Q690 850 632.0 850.0Q574 850 535.0 825.5Q496 801 476 755Q463 725 459 686Z" /></g>
        <g transform="translate(195.350 0) scale(0.02734 -0.02734)"><path d="M102 -418V1118H500V922H510Q532 979 574.0 1027.0Q616 1075 678.5 1103.5Q741 1132 824 1132Q935 1132 1034.5 1073.0Q1134 1014 1197.0 887.5Q1260 761 1260 558Q1260 365 1200.0 238.0Q1140 111 1040.0 48.5Q940 -14 820 -14Q742 -14 680.5 12.0Q619 38 576.0 82.5Q533 127 510 184H504V-418ZM672 294Q728 294 766.5 325.5Q805 357 825.5 416.5Q846 476 846 558Q846 641 825.5 700.5Q805 760 766.5 792.0Q728 824 672 824Q617 824 577.0 792.0Q537 760 515.5 700.5Q494 641 494 558Q494 477 515.5 418.0Q537 359 577.0 326.5Q617 294 672 294Z" /></g>
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Glyph — tau mark (60×72). Already uses fill="currentColor".
// ---------------------------------------------------------------------------
export function Glyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 72"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <rect x="4" y="4" width="22" height="64" />
      <rect x="26" y="22" width="8" height="2" />
      <rect x="26" y="29" width="8" height="2" />
      <rect x="34" y="4" width="22" height="36" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Eyebrow
// ---------------------------------------------------------------------------
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={clsx(
        "font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Hairline
// ---------------------------------------------------------------------------
export function Hairline({ className }: { className?: string }) {
  return <hr className={clsx("border-t border-ink", className)} />;
}

// ---------------------------------------------------------------------------
// Pills
// ---------------------------------------------------------------------------
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-block border border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PillStock() {
  return <Pill className="text-emerald border-emerald">In stock</Pill>;
}
export function PillLowStock({ count }: { count?: number }) {
  return (
    <Pill className="text-alert border-alert">
      {count != null ? `${count} left` : "Low stock"}
    </Pill>
  );
}
export function PillOut() {
  return <Pill className="text-ink-muted border-ink-muted">Out of stock</Pill>;
}
export function PillVerified() {
  return <Pill className="text-emerald border-emerald">COA verified</Pill>;
}

export function SemanticPill({ stock, lowCount }: { stock: "in" | "low" | "out"; lowCount?: number }) {
  if (stock === "in") return <PillStock />;
  if (stock === "low") return <PillLowStock count={lowCount} />;
  return <PillOut />;
}

// ---------------------------------------------------------------------------
// MonoLine
// ---------------------------------------------------------------------------
export function MonoLine({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("font-mono text-mono", className)}>{children}</span>
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------
export function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border border-ink px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
        active ? "bg-ink text-bone" : "bg-bone text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type ButtonVariant = "primary" | "outline" | "ghost";

export function Button({
  children,
  variant = "primary",
  className,
  disabled,
  onClick,
  type = "button",
  fullWidth,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center border border-ink px-6 py-3 font-mono text-[13px] uppercase tracking-[0.12em] transition-colors",
        variant === "primary" && "bg-ink text-bone hover:bg-ink/90",
        variant === "outline" && "bg-bone text-ink hover:bg-surface",
        variant === "ghost" && "border-transparent bg-transparent text-ink hover:bg-surface",
        disabled && "pointer-events-none opacity-40",
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Icon — 17 Lucide-compatible path definitions rendered as inline SVG
// ---------------------------------------------------------------------------
const ICON_PATHS: Record<string, React.ReactNode> = {
  cart: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  chevronDown: <polyline points="6 9 12 15 18 9" />,
  truck: (
    <>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v5l-4 8a1 1 0 0 0 .9 1.5h10.2a1 1 0 0 0 .9-1.5L14 8V3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </>
  ),
  doc: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>
  ),
  heart: (
    <>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: keyof typeof ICON_PATHS;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CheckGlyph / DotGlyph
// ---------------------------------------------------------------------------
export function CheckGlyph({ pass }: { pass: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex h-5 w-5 items-center justify-center border",
        pass ? "border-emerald text-emerald" : "border-alert text-alert",
      )}
    >
      {pass ? <Icon name="check" size={12} /> : <Icon name="close" size={12} />}
    </span>
  );
}

export function DotGlyph({ active }: { active?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-block h-2 w-2 rounded-full border",
        active ? "bg-ink border-ink" : "bg-transparent border-ink",
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
export function Checkbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-ink">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {checked && <Icon name="check" size={12} />}
      </span>
      <span className="text-body-s leading-relaxed">{children}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------
// VialRender — minimal cream-label vial illustration in SVG
// ---------------------------------------------------------------------------
export function VialRender({ compound, className }: { compound: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 120"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("text-ink", className)}
      aria-hidden="true"
    >
      {/* body */}
      <rect x="20" y="20" width="40" height="80" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* cap */}
      <rect x="22" y="10" width="36" height="14" rx="1" fill="currentColor" />
      {/* label band */}
      <rect x="20" y="44" width="40" height="30" fill="currentColor" fillOpacity="0.08" />
      <text
        x="40"
        y="63"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="9"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="0.12em"
      >
        {compound}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LabelCard — cream product card with vial peeking (used in rails/catalog)
// ---------------------------------------------------------------------------
export function LabelCard({
  compound,
  name,
  cas,
  price,
  stock,
  lowCount,
  href,
}: {
  compound: string;
  name: string;
  cas: string;
  price: string;
  stock: "in" | "low" | "out";
  lowCount?: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col border border-ink bg-bone transition-colors hover:bg-surface"
    >
      {/* vial area */}
      <div className="flex items-end justify-center border-b border-ink bg-surface px-6 pt-8 pb-0">
        <VialRender compound={compound} className="h-[88px] w-auto" />
      </div>
      {/* info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Eyebrow>{compound}</Eyebrow>
        <p className="mt-1 font-display text-[15px] font-black leading-tight tracking-[-0.01em]">
          {name}
        </p>
        <MonoLine className="mt-1 text-[10px] text-ink-muted">{cas}</MonoLine>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-[17px] font-black">{price}</span>
          <SemanticPill stock={stock} lowCount={lowCount} />
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// TrustStrip — 3 horizontal trust signals (used in header/hero areas)
// ---------------------------------------------------------------------------
const TRUST_ITEMS = [
  { icon: "truck" as const, label: "Ships same day" },
  { icon: "flask" as const, label: "≥99.5% HPLC purity" },
  { icon: "shield" as const, label: compliance.researchUseOnly },
];

export function TrustStrip({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-wrap items-center gap-x-8 gap-y-2", className)}>
      {TRUST_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <Icon name={item.icon} size={14} className="shrink-0 text-ink-muted" />
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function TrustStripInline({ className }: { className?: string }) {
  return (
    <p className={clsx("font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted", className)}>
      {TRUST_ITEMS.map((t) => t.label).join(" · ")}
    </p>
  );
}

// ---------------------------------------------------------------------------
// BlushBand — a blush-background band (testimonial / social-proof strip)
// ---------------------------------------------------------------------------
export function BlushBand({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("bg-blush py-24", className)}>
      <div className="layout-content">{children}</div>
    </section>
  );
}
