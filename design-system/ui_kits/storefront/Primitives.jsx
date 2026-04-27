/* global React */
const { useState } = React;

const PP = {
  ink: '#1F1F1F',
  inkMuted: '#6E6E6E',
  bone: '#FAF7F0',
  boneSoft: '#F5F1E6',
  surface: '#F1EDE3',
  blush: '#F2D7D7',
  line: '#E4DFCF',
  // Semantic accents — type + 1.5px border only, never hero fill
  emerald: '#0F5132',
  emeraldSoft: '#E8F0EB',
  alert: '#C83E4D',
  alertSoft: '#F7E4E6',
  white: '#FFFFFF',
  BW: '1.5px',
};

const LOCKUP = '../../assets/lockup-horizontal.svg';
const GLYPH = '../../assets/glyph.svg';

function Lockup({ height = 36, color = PP.ink, style }) {
  const filter = color === PP.bone ? 'invert(96%) sepia(7%) saturate(200%) hue-rotate(5deg) brightness(104%)' : 'none';
  return (
    <img src={LOCKUP} alt="PurePep" style={{
      height, width: 'auto', display: 'block',
      filter,
      ...style,
    }}/>
  );
}

function Glyph({ size = 24, color = PP.ink, style }) {
  return (
    <img src={GLYPH} alt="" style={{
      height: size, width: 'auto', display: 'block',
      filter: color === PP.bone ? 'invert(1)' : 'none',
      ...style,
    }}/>
  );
}

function Eyebrow({ children, color, style }) {
  return (
    <span className="pp-eyebrow" style={{ color: color || undefined, ...style }}>{children}</span>
  );
}

function Pill({ children, active = false, as = 'span', onClick, style }) {
  const Comp = as;
  return (
    <Comp onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 12px',
      border: `${PP.BW} solid ${PP.ink}`,
      background: active ? PP.ink : PP.bone,
      color: active ? PP.bone : PP.ink,
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, fontWeight: 500,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: 0,
      ...style,
    }}>{children}</Comp>
  );
}

// ---------- Semantic pills (emerald / alert, type+border only) ----------
function SemanticPill({ color, children, soft, tint, icon, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px',
      border: `${PP.BW} solid ${color}`,
      background: soft ? tint : PP.bone,
      color,
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10.5, fontWeight: 600,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      lineHeight: 1.1, borderRadius: 0,
      ...style,
    }}>
      {icon}
      {children}
    </span>
  );
}

function CheckGlyph({ color, size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true"
         style={{ flexShrink: 0 }}>
      <path d="M2.5 6.3l2.3 2.3L9.5 3.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DotGlyph({ color, size = 8 }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'inline-block', flexShrink: 0,
    }}/>
  );
}

function PillStock({ soft, style }) {
  return (
    <SemanticPill color={PP.emerald} soft={soft} tint={PP.emeraldSoft}
                  icon={<DotGlyph color={PP.emerald}/>} style={style}>In stock</SemanticPill>
  );
}
function PillOut({ soft, style }) {
  return (
    <SemanticPill color={PP.alert} soft={soft} tint={PP.alertSoft}
                  icon={<DotGlyph color={PP.alert}/>} style={style}>Out of stock</SemanticPill>
  );
}
function PillVerified({ soft, style, children = 'COA verified' }) {
  return (
    <SemanticPill color={PP.emerald} soft={soft} tint={PP.emeraldSoft}
                  icon={<CheckGlyph color={PP.emerald}/>} style={style}>{children}</SemanticPill>
  );
}
function PillLowStock({ count = 3, soft, style }) {
  return (
    <SemanticPill color={PP.alert} soft={soft} tint={PP.alertSoft}
                  style={style}>
      Low stock — {count} left
    </SemanticPill>
  );
}

// Standardized destructive REMOVE link — mono 11px uppercase 0.16em, alert, no underline until hover
function RemoveLink({ onClick, children = 'Remove', style }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.alert,
        textDecoration: hover ? 'underline' : 'none',
        textUnderlineOffset: 3,
        ...style,
      }}>{children}</button>
  );
}

// ---------- Phase-3 conversion primitives ----------

// Mono utility line — 11px / 0.16em / ink-muted default; escalates to alert when `alarm`
function MonoLine({ alarm = false, children, style }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: alarm ? PP.alert : PP.inkMuted,
      lineHeight: 1.5,
      ...style,
    }}>{children}</div>
  );
}

// B1/A — vials remaining for current lot; escalates to alert when ≤ 5
function LotInventoryLine({ remaining = 18, lot = 'RT-2604-A11', style }) {
  const alarm = remaining <= 5;
  return (
    <MonoLine alarm={alarm} style={style}>
      [{remaining}] vials remaining · Lot {lot}
    </MonoLine>
  );
}

// B1/B — next lot ETA; only renders when remaining < 20
function NextLotETALine({ remaining = 18, nextLot = 'RT-2604-A12', eta = '[TKTK — date]', style }) {
  if (remaining >= 20) return null;
  return (
    <MonoLine style={style}>Next lot {nextLot} · Expected {eta}</MonoLine>
  );
}

// B1/C — released/expires caption that sits under the lot number in spec rows
function LotReleasedCaption({ released = '2025-04-10', expires = '2027-04-10', style }) {
  return (
    <MonoLine style={{ fontSize: 10.5, letterSpacing: '0.14em', ...style }}>
      Released {released} · Expires {expires}
    </MonoLine>
  );
}

// B2/D — researcher reorder count for current lot; placed above eyebrow row
function LotReorderCount({ count = '[127]', lot = 'RT-2604-A11', style }) {
  return (
    <MonoLine style={{ color: PP.ink, fontWeight: 600, ...style }}>
      {count} researchers · Lot {lot}
    </MonoLine>
  );
}

// B2/F — inline link promoting third-party verification in COA panel
function IndependentVerificationLink({ lab = '[TKTK — Eurofins / lab name]', href = '#', style }) {
  const [hover, setHover] = useState(false);
  return (
    <a href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
        textDecoration: hover ? 'underline' : 'none', textUnderlineOffset: 3,
        ...style,
      }}>
      <CheckGlyph color={PP.emerald} size={11}/>
      Independent verification by {lab} · View third-party assay →
    </a>
  );
}

function Chip({ children, color = PP.ink, bg = PP.bone, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 9px',
      border: `${PP.BW} solid ${color}`,
      background: bg, color,
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      lineHeight: 1.1,
      ...style,
    }}>{children}</span>
  );
}

function Button({ children, variant = 'primary', size = 'md', fullWidth = false, onClick, disabled, style, type = 'button' }) {
  const [hover, setHover] = useState(false);
  const sizes = {
    sm: { h: 36, px: 14, fs: 12 },
    md: { h: 48, px: 20, fs: 13 },
    lg: { h: 56, px: 24, fs: 13 },
  };
  const s = sizes[size];
  const styles = {
    primary: {
      bg: disabled ? PP.line : (hover ? '#000' : PP.ink),
      color: disabled ? PP.inkMuted : PP.bone,
      border: `${PP.BW} solid ${PP.ink}`,
    },
    secondary: {
      bg: hover ? PP.boneSoft : PP.bone,
      color: PP.ink,
      border: `${PP.BW} solid ${PP.ink}`,
    },
    ghost: {
      bg: 'transparent', color: PP.ink, border: 'none',
      textDecoration: 'underline', textUnderlineOffset: 3,
    },
  };
  const v = styles[variant];
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: s.h, padding: variant === 'ghost' ? 0 : `0 ${s.px}px`,
        background: v.bg, color: v.color, border: v.border,
        fontFamily: 'Inter', fontWeight: 600, fontSize: s.fs,
        letterSpacing: '0.04em',
        textTransform: variant === 'ghost' ? 'none' : 'uppercase',
        textDecoration: v.textDecoration,
        textUnderlineOffset: v.textUnderlineOffset,
        borderRadius: variant === 'ghost' ? 0 : 2,
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 160ms',
        ...style,
      }}
    >{children}</button>
  );
}

function Hairline({ vertical = false, soft = false, style }) {
  const color = soft ? PP.line : PP.ink;
  return vertical
    ? <div style={{ width: PP.BW, alignSelf: 'stretch', background: color, ...style }}/>
    : <div style={{ height: PP.BW, width: '100%', background: color, ...style }}/>;
}

// Icon pack — thin line icons, 1.5 stroke
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.5, style }) {
  const paths = {
    cart: <><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.3h8.2a1.5 1.5 0 0 0 1.5-1.2L21 8H6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <><path d="M5 12h14"/></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    chevronDown: <><path d="M6 9l6 6 6-6"/></>,
    truck: <><rect x="2" y="7" width="12" height="9"/><path d="M14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></>,
    flask: <><path d="M9 3h6M10 3v6L5 19a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 19 19l-5-10V3"/></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></>,
    flag: <><path d="M5 21V4M5 4h13l-2 4 2 4H5"/></>,
    doc: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></>,
    heart: <><path d="M12 20s-7-4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 6-7 10-7 10z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {paths[name] || <circle cx="12" cy="12" r="8"/>}
    </svg>
  );
}

// Realistic-looking lyophilized vial rendering (used in product cards)
function VialRender({ label = 'RETA', cas = '2381089-83-2', dose = '10 mg', w = 120, h = 260 }) {
  return (
    <svg viewBox="0 0 120 260" style={{ width: w, height: h, display: 'block' }}>
      <defs>
        <linearGradient id="vglass" x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9"/>
          <stop offset="0.3" stopColor="#F3EEDE" stopOpacity="1"/>
          <stop offset="1" stopColor="#E5DFC9" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="vcap" x1="0" x2="1">
          <stop offset="0" stopColor="#2A2A2A"/>
          <stop offset="0.5" stopColor="#0E0E0E"/>
          <stop offset="1" stopColor="#2A2A2A"/>
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="60" cy="248" rx="36" ry="3" fill="rgba(31,31,31,0.18)"/>
      {/* crimp */}
      <rect x="40" y="10" width="40" height="14" fill="url(#vcap)"/>
      <rect x="36" y="22" width="48" height="6" fill="#999999"/>
      <rect x="36" y="27" width="48" height="2" fill="rgba(0,0,0,0.3)"/>
      {/* glass body */}
      <rect x="22" y="29" width="76" height="210" rx="2" fill="url(#vglass)" stroke="#1F1F1F" strokeWidth="0.6"/>
      {/* lyophilized cake */}
      <rect x="25" y="170" width="70" height="66" fill="#EDE6CD"/>
      <rect x="25" y="168" width="70" height="3" fill="rgba(0,0,0,0.15)"/>
      {/* paper label — minimal so card doesn't feel double-labelled */}
      <g transform="translate(30 90)">
        <rect width="60" height="52" fill="#FAF7F0" stroke="#1F1F1F" strokeWidth="0.4"/>
        <text x="30" y="22" fontFamily="Inter" fontWeight="900" fontSize="10" letterSpacing="-0.4" fill="#1F1F1F" textAnchor="middle">PurePep</text>
        <line x1="10" y1="28" x2="50" y2="28" stroke="#1F1F1F" strokeWidth="0.3"/>
        <text x="30" y="40" fontFamily="Inter" fontWeight="700" fontSize="7" fill="#1F1F1F" textAnchor="middle">{label} · {dose}</text>
      </g>
      {/* highlight */}
      <rect x="26" y="40" width="3" height="190" fill="rgba(255,255,255,0.55)"/>
    </svg>
  );
}

// Cream-label card: signature Oath-style product card, PurePep-branded
function LabelCard({ compound = 'RETA', cas = '2381089-83-2', dose = '10 mg', size = 360, madeInUSA = true, vialOffset = true, coaVerified = false }) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1 / 1',
      background: PP.bone, border: `${PP.BW} solid ${PP.ink}`,
      overflow: 'hidden',
    }}>
      {/* Top-right cluster: COA ✓ chip + Made in USA chip */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 3,
        display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
      }}>
        {coaVerified && <PillVerified/>}
        {madeInUSA && (
          <Chip style={{ background: PP.bone }}>
            <svg width="16" height="10" viewBox="0 0 16 10">
              <rect width="16" height="10" fill="#FAF7F0"/>
              <rect width="16" height="1" y="1" fill="#C83E4D"/>
              <rect width="16" height="1" y="3" fill="#C83E4D"/>
              <rect width="16" height="1" y="5" fill="#C83E4D"/>
              <rect width="16" height="1" y="7" fill="#C83E4D"/>
              <rect width="16" height="1" y="9" fill="#C83E4D"/>
              <rect width="7" height="5" fill="#1F1F1F"/>
            </svg>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: 9 }}>Made in USA</span>
              <span style={{ fontSize: 8, fontWeight: 400, letterSpacing: '0.1em', color: PP.inkMuted }}>Ships from [TKTK — confirm city, state]</span>
            </span>
          </Chip>
        )}
      </div>
      {/* Big wordmark + CAS + compound */}
      <div style={{ position: 'absolute', top: '8%', left: '8%', zIndex: 2 }}>
        <div style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(36px, 8%, 56px)',
          letterSpacing: '-0.04em', color: PP.ink, lineHeight: 1,
        }}>PurePep</div>
      </div>
      <div style={{ position: 'absolute', top: '32%', left: '8%', right: '8%', zIndex: 2 }}>
        <div style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(28px, 6.5%, 44px)',
          letterSpacing: '-0.03em', color: PP.ink, lineHeight: 1,
        }}>{compound}</div>
        <div style={{ marginTop: 6 }}>
          <Eyebrow>CAS: {cas}</Eyebrow>
        </div>
        <div style={{ marginTop: 12 }}>
          <Eyebrow style={{ color: PP.ink, fontWeight: 600 }}>{dose}</Eyebrow>
        </div>
      </div>
      {/* bottom-left RUO */}
      <div style={{ position: 'absolute', bottom: 16, left: '8%', zIndex: 2, maxWidth: '55%' }}>
        <div style={{
          fontFamily: 'Inter', fontSize: 12, color: PP.inkMuted, fontStyle: 'italic',
        }}>Not for human or veterinary use</div>
      </div>
      {/* right-edge vertical RUO micro */}
      <div style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%) rotate(90deg)',
        transformOrigin: 'right center',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.inkMuted,
        whiteSpace: 'nowrap', zIndex: 2,
      }}>≥99.5% purity · research use only</div>
      {/* vial peeking bottom-right */}
      {vialOffset && (
        <div style={{ position: 'absolute', right: '6%', bottom: '-8%', zIndex: 3, width: '36%' }}>
          <VialRender label={compound} cas={cas} dose={dose} w="100%" h="auto"/>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PP, LOCKUP, GLYPH, Lockup, Glyph, Eyebrow, Pill, SemanticPill, PillStock, PillOut, PillVerified, PillLowStock, RemoveLink, CheckGlyph, DotGlyph, Chip, Button, Hairline, Icon, VialRender, LabelCard, MonoLine, LotInventoryLine, NextLotETALine, LotReleasedCaption, LotReorderCount, IndependentVerificationLink });
