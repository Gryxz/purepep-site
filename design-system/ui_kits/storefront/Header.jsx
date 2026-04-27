/* global React, PP, Lockup, Icon, Eyebrow */
const { useState } = React;

function UtilityStrip() {
  const items = ['For research use only', '21+ qualified researchers', 'All sales final'];
  return (
    <div style={{
      background: PP.bone,
      borderBottom: `${PP.BW} solid ${PP.ink}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '9px 24px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
        whiteSpace: 'nowrap', flexWrap: 'nowrap',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11, fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
      }}>
        {items.map((t, i) => (
          <React.Fragment key={i}>
            <span>{t}</span>
            {i < items.length - 1 && <span style={{ color: PP.ink }}>·</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function NavLink({ children, active = false, href = '#' }) {
  const [h, sh] = useState(false);
  return (
    <a href={href} onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)} style={{
      fontFamily: 'Inter', fontWeight: 500, fontSize: 14,
      color: PP.ink, textDecoration: 'none',
      padding: '8px 0',
      borderBottom: active || h ? `${PP.BW} solid ${PP.ink}` : `${PP.BW} solid transparent`,
      letterSpacing: '-0.005em',
    }}>{children}</a>
  );
}

// O — NavAffiliatesDropdown: first dropdown in the nav, brutalist mini-menu
function NavAffiliatesDropdown({ active = false }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      style={{ position: 'relative' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none', padding: '8px 0', cursor: 'pointer',
          fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: PP.ink,
          letterSpacing: '-0.005em', display: 'inline-flex', alignItems: 'center', gap: 6,
          borderBottom: active || open ? `${PP.BW} solid ${PP.ink}` : `${PP.BW} solid transparent`,
        }}
      >
        Affiliates
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"
             style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 160ms' }}>
          <path d="M2 4l3 3 3-3" stroke={PP.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: '50%', transform: 'translateX(-50%)',
            minWidth: 260, zIndex: 40,
            border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
            borderRadius: 2,
          }}
        >
          <DropdownRow href="affiliates.html">Join the program →</DropdownRow>
          <DropdownRow href="affiliates-dashboard.html" divider>Affiliate dashboard →</DropdownRow>
        </div>
      )}
    </div>
  );
}

function DropdownRow({ href, children, divider }) {
  const [h, sh] = useState(false);
  return (
    <a href={href} role="menuitem"
       onMouseEnter={() => sh(true)} onMouseLeave={() => sh(false)}
       style={{
         display: 'block', padding: '14px 18px',
         background: h ? PP.surface : PP.bone, color: PP.ink,
         textDecoration: 'none',
         borderTop: divider ? `${PP.BW} solid ${PP.line}` : 'none',
         fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
         letterSpacing: '0.16em', textTransform: 'uppercase',
       }}>{children}</a>
  );
}

function Header({ cartCount = 0, onOpenCart, minimal = false }) {
  return (
    <header style={{ background: PP.bone, position: 'relative', zIndex: 10 }}>
      <UtilityStrip/>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: minimal ? '1fr auto' : '220px 1fr auto',
        alignItems: 'center', gap: 32,
        borderBottom: `${PP.BW} solid ${PP.ink}`,
      }}>
        <a href="#" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <Lockup height={36}/>
        </a>

        {!minimal && (
          <nav style={{ display: 'flex', justifyContent: 'center', gap: 36, alignItems: 'center' }}>
            <NavLink href="catalog.html">Catalog</NavLink>
            <NavLink href="index.html">RETA</NavLink>
            <NavLink>Quality</NavLink>
            <NavLink>Documentation</NavLink>
            <NavAffiliatesDropdown/>
            <NavLink>Account</NavLink>
          </nav>
        )}

        {minimal ? (
          <Eyebrow style={{ color: PP.ink }}>Secure checkout</Eyebrow>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <button style={iconBtn} aria-label="Search"><Icon name="search" size={18}/></button>
            <button style={iconBtn} aria-label="Account"><Icon name="user" size={18}/></button>
            <button onClick={onOpenCart} style={{
              ...iconBtn, position: 'relative', gap: 8,
              padding: '8px 12px',
              border: `${PP.BW} solid ${PP.ink}`,
            }}>
              <Icon name="cart" size={16}/>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                letterSpacing: '0.12em',
              }}>{String(cartCount).padStart(2, '0')}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', color: PP.ink,
  cursor: 'pointer', padding: 6,
};

Object.assign(window, { Header, UtilityStrip, NavAffiliatesDropdown });
