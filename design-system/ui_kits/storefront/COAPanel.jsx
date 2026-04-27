/* global React, PP, Eyebrow, Hairline, Pill, PillVerified, CheckGlyph, IndependentVerificationLink */
const { useState } = React;

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '18px 0',
      background: 'transparent', border: 'none',
      borderBottom: active ? `3px solid ${PP.ink}` : '3px solid transparent',
      marginBottom: '-1.5px',
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: active ? PP.ink : PP.inkMuted,
      cursor: 'pointer',
      transition: 'color 160ms',
    }}>{children}</button>
  );
}

function AssayRow({ test, spec, result, pass, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr auto',
      gap: 20, padding: '16px 20px', alignItems: 'center',
      borderBottom: last ? 'none' : `${PP.BW} solid ${PP.line}`,
    }}>
      <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: PP.ink }}>{test}</span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: PP.inkMuted,
        letterSpacing: '0.04em',
      }}>{spec}</span>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: PP.ink,
        letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
      }}>{result}</span>
      {pass ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          border: `${PP.BW} solid ${PP.emerald}`, background: PP.bone, color: PP.emerald,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2,
        }}>
          <CheckGlyph color={PP.emerald} size={10}/>
          Pass
        </span>
      ) : (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          border: `${PP.BW} solid ${PP.alert}`, background: PP.bone, color: PP.alert,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase', borderRadius: 2,
        }}>Fail</span>
      )}
    </div>
  );
}

function COAPanel() {
  const [tab, setTab] = useState('desc');

  return (
    <section aria-label="Product details">
      <div style={{
        display: 'flex', gap: 44,
        borderBottom: `${PP.BW} solid ${PP.ink}`,
      }}>
        <TabButton active={tab === 'desc'} onClick={() => setTab('desc')}>Description</TabButton>
        <TabButton active={tab === 'spec'} onClick={() => setTab('spec')}>Specification</TabButton>
        <TabButton active={tab === 'coa'} onClick={() => setTab('coa')}>Certificate of analysis</TabButton>
        <TabButton active={tab === 'docs'} onClick={() => setTab('docs')}>Documentation</TabButton>
      </div>

      <div style={{ padding: '40px 0' }}>
        {tab === 'desc' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, maxWidth: 980 }}>
            <div>
              <Eyebrow>Monograph</Eyebrow>
              <p style={{
                fontFamily: 'Inter', fontSize: 15, lineHeight: 1.75, color: PP.ink,
                marginTop: 14,
              }}>
                Retatrutide (LY3437943) is an investigational 39-amino-acid synthetic
                peptide engineered as a unimolecular triple agonist at the GLP-1, GIP,
                and glucagon receptors. Its sequence incorporates a C20 fatty-diacid
                moiety at Lys<sup>20</sup> which extends half-life through albumin
                binding. It is supplied as a lyophilized white powder for reconstitution
                in sterile water.
              </p>
              <p style={{
                fontFamily: 'Inter', fontSize: 15, lineHeight: 1.75, color: PP.ink,
                marginTop: 16,
              }}>
                Each lot is synthesized in a US partner facility via solid-phase
                peptide synthesis, HPLC-purified to ≥99.5%, and characterized by
                mass spectrometry, appearance, net peptide content, and sterility
                prior to release. Stoppered vials ship cold-chain with ice pack and
                a lot-matched certificate of analysis.
              </p>
            </div>
            <div style={{
              border: `${PP.BW} solid ${PP.ink}`, padding: 28, background: PP.bone,
            }}>
              <Eyebrow>Handling</Eyebrow>
              <ul style={{
                listStyle: 'none', padding: 0, margin: '14px 0 0',
                display: 'grid', gap: 12,
              }}>
                {[
                  ['Storage', '2–8 °C in the sealed stoppered vial; protect from light.'],
                  ['Reconstitution', 'Bacteriostatic water, WFI. Swirl — do not shake.'],
                  ['Post-recon stability', '28 days at 2–8 °C in original vial.'],
                  ['Shipping', '2-day cold-chain, ice pack, tamper-evident seal.'],
                ].map(([k, v]) => (
                  <li key={k} style={{
                    display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12,
                    paddingBottom: 12, borderBottom: `1px solid ${PP.line}`,
                  }}>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                      letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
                    }}>{k}</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 14, color: PP.ink, lineHeight: 1.55 }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'spec' && (
          <div style={{ maxWidth: 760 }}>
            <Eyebrow>Full specification — lot RT-2604-A11</Eyebrow>
            <div style={{
              marginTop: 20, border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
            }}>
              {[
                ['Compound', 'Retatrutide (LY3437943)'],
                ['Molecular formula', 'C₂₂₁H₃₄₃N₄₇O₆₈'],
                ['Molecular weight', '4731.28 g/mol'],
                ['Sequence length', '39 residues'],
                ['Appearance', 'White to off-white lyophilized powder'],
                ['Net peptide content', '≥ 82.0% w/w'],
                ['Counter-ion', 'Trifluoroacetate'],
                ['Solubility', 'Soluble in water, DMSO'],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: 'grid', gridTemplateColumns: '220px 1fr',
                  padding: '14px 20px',
                  borderBottom: i === arr.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
                  }}>{k}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: PP.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'coa' && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              marginBottom: 20, flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <Eyebrow>Certificate of analysis</Eyebrow>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: PP.ink, marginTop: 8, letterSpacing: '-0.01em' }}>
                  Lot RT-2604-A11
                </div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px',
                    border: `${PP.BW} solid ${PP.emerald}`,
                    background: PP.bone, color: PP.emerald,
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                  }}>
                    <CheckGlyph color={PP.emerald} size={12}/>
                    Lot released
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
                  }}>2025-04-10</span>
                </div>
              </div>
              <div style={{
                display: 'flex', gap: 12,
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
              }}>
                <span>Released 2025-04-10</span>
                <span>·</span>
                <span>Expires 2027-04-10</span>
              </div>
            </div>
            <div style={{
              border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr auto',
                gap: 20, padding: '14px 20px',
                background: PP.surface,
                borderBottom: `${PP.BW} solid ${PP.ink}`,
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
              }}>
                <span>Test</span><span>Specification</span><span>Result</span><span>Status</span>
              </div>
              <AssayRow test="Appearance" spec="White powder" result="White powder" pass/>
              <AssayRow test="HPLC purity" spec="≥ 99.0%" result="99.7%" pass/>
              <AssayRow test="Mass (ESI-MS)" spec="4731.28 ± 1.0" result="4731.4" pass/>
              <AssayRow test="Net peptide" spec="≥ 80% w/w" result="83.2%" pass/>
              <AssayRow test="Residual TFA" spec="≤ 1.0%" result="0.42%" pass/>
              <AssayRow test="Water content (KF)" spec="≤ 6.0%" result="3.1%" pass/>
              <AssayRow test="Bioburden" spec="≤ 10 CFU/g" result="< 1 CFU/g" pass/>
              <AssayRow test="Endotoxin (LAL)" spec="< 5 EU/mg" result="0.18 EU/mg" pass last/>
            </div>
            <div style={{
              marginTop: 18,
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <IndependentVerificationLink/>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
              }}>QC released by analyst · Full PDF available</span>
            </div>
          </div>
        )}

        {tab === 'docs' && (
          <div style={{ maxWidth: 680 }}>
            <Eyebrow>Documentation on file</Eyebrow>
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'grid', gap: 0 }}>
              {[
                ['COA — Lot RT-2604-A11', 'PDF · 0.4 MB'],
                ['HPLC chromatogram', 'PDF · 0.6 MB'],
                ['Mass spectrum (ESI-MS)', 'PDF · 0.3 MB'],
                ['SDS — Safety data sheet', 'PDF · 0.2 MB'],
                ['Handling + reconstitution guide', 'PDF · 0.2 MB'],
              ].map(([name, meta]) => (
                <li key={name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 0',
                  borderBottom: `${PP.BW} solid ${PP.line}`,
                }}>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: PP.ink }}>{name}</div>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                      letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
                    }}>{meta}</div>
                  </div>
                  <a href="#" style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
                    textDecoration: 'underline', textUnderlineOffset: 4,
                  }}>Download →</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { COAPanel });
