/* global React, PP, Lockup, Eyebrow, Checkbox */
const { useState } = React;

function AgeGate() {
  const [age, setAge] = useState(false);
  const [researcher, setResearcher] = useState(false);
  const ready = age && researcher;

  return (
    <main style={{
      minHeight: '100vh', background: PP.bone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Lockup */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 44,
        }}>
          <Lockup height={48}/>
        </div>

        {/* Eyebrow */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Eyebrow>Restricted access · 21+ qualified researchers</Eyebrow>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(32px, 4.2vw, 42px)',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          color: PP.ink, textAlign: 'center', marginBottom: 24,
        }}>Verify you're a qualified researcher.</h1>

        {/* Body */}
        <p style={{
          fontFamily: 'Inter', fontSize: 15, lineHeight: 1.65, color: PP.ink,
          textAlign: 'center', marginBottom: 14, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
        }}>
          PurePep supplies research-grade peptides for in-vitro study only. These are
          not dietary supplements, therapeutics, or products for human or veterinary
          consumption.
        </p>
        <p style={{
          fontFamily: 'Inter', fontSize: 15, lineHeight: 1.65, color: PP.ink,
          textAlign: 'center', marginBottom: 36, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Access is restricted to qualified scientific researchers aged 21 or older.
        </p>

        {/* Checkboxes */}
        <div style={{
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
          padding: '20px 24px', display: 'grid', gap: 2, marginBottom: 28,
        }}>
          <Checkbox checked={age} onChange={setAge} label="I am 21 years of age or older"/>
          <Checkbox
            checked={researcher} onChange={setResearcher}
            label="I am a qualified scientific researcher and will use these products for research purposes only"
          />
        </div>

        {/* Primary CTA */}
        <button disabled={!ready} style={{
          width: '100%', height: 56,
          background: !ready ? PP.line : PP.ink,
          color: !ready ? PP.inkMuted : PP.bone,
          border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
          fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          cursor: !ready ? 'not-allowed' : 'pointer',
          marginBottom: 20,
        }}>Enter site</button>

        {/* Secondary link */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <a href="https://www.google.com" style={{
            fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: PP.ink,
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}>Leave site</a>
        </div>

        {/* Disclaimer */}
        <div style={{
          textAlign: 'center',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
          lineHeight: 1.8,
        }}>
          For research use only · Not for human consumption<br/>
          © 2026 PurePep · All sales final
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { AgeGate });
