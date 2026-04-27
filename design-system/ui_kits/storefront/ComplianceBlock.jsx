/* global React, PP, Eyebrow, Icon, Hairline, MonoLine */
const { useState } = React;

// Shared 4-icon row used both full-width (section) and inline (inside BuyBox)
function _trustItems() {
  return [
    { icon: 'truck',  label: '2-day fast shipping' },
    { icon: 'flask',  label: '99.5%+ purity (HPLC)' },
    { icon: 'shield', label: 'Ships from [TKTK — confirm city, state]' },
    { icon: 'flag',   label: 'USA lab tested' },
  ];
}

// Trust strip: 4-column thin-icon row on Surface — full-width section form.
// B2/E — now includes aggregate headline line ABOVE the 4-icon row.
function TrustStrip() {
  const items = _trustItems();
  return (
    <section style={{
      background: PP.surface, borderTop: `${PP.BW} solid ${PP.ink}`,
      borderBottom: `${PP.BW} solid ${PP.ink}`,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 12px' }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
          textAlign: 'center',
        }}>Trusted by [340]+ research labs since 2024</div>
      </div>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 24px 28px',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
        borderTop: `${PP.BW} solid ${PP.line}`,
      }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 20px 8px',
            borderLeft: i === 0 ? 'none' : `${PP.BW} solid ${PP.ink}`,
          }}>
            <Icon name={it.icon} size={26} color={PP.ink} strokeWidth={1.25}/>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
              lineHeight: 1.3,
            }}>{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// B3/H — inline 4-icon row rendered INSIDE the BuyBox, directly under the CTA.
// Tighter padding, no section borders, no aggregate line — same icons/copy.
function TrustStripInline() {
  const items = _trustItems();
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0,
      border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, borderRadius: 2,
      marginTop: -8,
    }}>
      {items.map((it, i) => (
        <div key={it.label} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px',
          borderLeft: i % 2 === 0 ? 'none' : `${PP.BW} solid ${PP.line}`,
          borderTop: i >= 2 ? `${PP.BW} solid ${PP.line}` : 'none',
        }}>
          <Icon name={it.icon} size={18} color={PP.ink} strokeWidth={1.4}/>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.ink,
            lineHeight: 1.3,
          }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// Blush testimonial band — one per page, signature pink moment
function BlushBand({ quote, attribution }) {
  return (
    <section style={{
      background: PP.blush,
      borderTop: `${PP.BW} solid ${PP.ink}`,
      borderBottom: `${PP.BW} solid ${PP.ink}`,
    }}>
      <div style={{
        maxWidth: 1080, margin: '0 auto',
        padding: '96px 24px', textAlign: 'center',
      }}>
        <Eyebrow style={{ color: PP.ink }}>In practice</Eyebrow>
        <h2 style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(28px, 3.2vw, 40px)',
          letterSpacing: '-0.025em', lineHeight: 1.2,
          color: PP.ink, margin: '24px 0 28px', textWrap: 'balance',
        }}>"{quote}"</h2>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
        }}>{attribution}</div>
      </div>
    </section>
  );
}

// Legacy compliance block — acknowledgement stack (kept for Checkout / Age-gate use)
function ComplianceBlock({ variant = 'pdp' }) {
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  return (
    <div style={{
      border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, padding: 28,
    }}>
      <Eyebrow>Acknowledgement</Eyebrow>
      <p style={{
        fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65, color: PP.ink,
        margin: '14px 0 20px', maxWidth: 600,
      }}>
        This product is supplied for in-vitro research use only. Not for human or
        veterinary consumption. All sales are final — research reagents are
        non-returnable once cold-chain is broken.
      </p>
      <Checkbox
        checked={ack1} onChange={setAck1}
        label="I am 21 years of age or older"
      />
      <Checkbox
        checked={ack2} onChange={setAck2}
        label="I am a qualified researcher and will use this product for research purposes only"
      />
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      cursor: 'pointer', marginTop: 12, userSelect: 'none',
    }}>
      <span style={{
        width: 20, height: 20, flexShrink: 0, marginTop: 2,
        border: `${PP.BW} solid ${PP.ink}`, background: checked ? PP.ink : PP.bone,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 2,
      }}>
        {checked && <Icon name="check" size={14} color={PP.bone} strokeWidth={2.5}/>}
      </span>
      <span style={{
        fontFamily: 'Inter', fontSize: 14, color: PP.ink, lineHeight: 1.55,
      }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }}/>
    </label>
  );
}

Object.assign(window, { TrustStrip, TrustStripInline, BlushBand, ComplianceBlock, Checkbox });
