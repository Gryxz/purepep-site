/* global React, PP, Lockup, Eyebrow, Chip, Pill, PillVerified, VialRender */
const { useState } = React;

// The flagship product card — cream label sheet with real vial peeking in, Oath-style.
function FlagshipCard({ size = 620, coaVerified = false }) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1 / 1',
      background: PP.bone, border: `${PP.BW} solid ${PP.ink}`,
      overflow: 'hidden',
    }}>
      {/* Top-right cluster: COA ✓ chip + Made in USA chip */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 4,
        display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
      }}>
        {coaVerified && <PillVerified/>}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 12px',
          border: `${PP.BW} solid ${PP.ink}`,
          background: PP.bone,
        }}>
          <svg width="22" height="14" viewBox="0 0 22 14">
            <rect width="22" height="14" fill="#FAF7F0"/>
            {[1,3,5,7,9,11,13].map(y => <rect key={y} width="22" height="1" y={y} fill="#C83E4D"/>)}
            <rect width="9" height="7" fill="#1F1F1F"/>
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.ink,
            }}>Made in USA</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 400,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: PP.inkMuted,
            }}>Ships from [TBD]</span>
          </div>
        </div>
      </div>

      {/* Big wordmark top-left */}
      <div style={{ position: 'absolute', top: 48, left: 48, zIndex: 2 }}>
        <div style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(64px, 12%, 96px)',
          letterSpacing: '-0.04em', color: PP.ink, lineHeight: 0.95,
        }}>PurePep</div>
      </div>

      {/* Compound mass */}
      <div style={{ position: 'absolute', top: 180, left: 48, zIndex: 2 }}>
        <div style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(56px, 10%, 80px)',
          letterSpacing: '-0.035em', color: PP.ink, lineHeight: 1,
        }}>RETA</div>
        <div style={{ marginTop: 10 }}>
          <span className="pp-eyebrow" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.inkMuted,
          }}>CAS: 2381089-83-2</span>
        </div>
      </div>

      {/* Dose */}
      <div style={{ position: 'absolute', top: 296, left: 48, zIndex: 2 }}>
        <span style={{
          fontFamily: 'Inter', fontWeight: 700,
          fontSize: 24, letterSpacing: '-0.01em', color: PP.ink,
        }}>10 mg</span>
      </div>

      {/* Bottom-left disclaimer */}
      <div style={{ position: 'absolute', bottom: 32, left: 48, zIndex: 2, maxWidth: '55%' }}>
        <div style={{
          fontFamily: 'Inter', fontSize: 14, color: PP.inkMuted, fontStyle: 'italic',
        }}>Not for human or veterinary use</div>
      </div>

      {/* Right-edge vertical RUO micro */}
      <div style={{
        position: 'absolute', right: 14, top: '50%',
        transform: 'translateY(-50%) rotate(90deg)', transformOrigin: 'right center',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 8.5, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: PP.inkMuted,
        whiteSpace: 'nowrap', zIndex: 2,
      }}>≥99.5% purity · research use only</div>

      {/* Vial peeking bottom-right */}
      <div style={{
        position: 'absolute', right: '6%', bottom: '-4%',
        width: '34%', zIndex: 3,
      }}>
        <VialRender label="RETA" cas="2381089-83-2" dose="10 mg" w="100%" h="auto"/>
      </div>
    </div>
  );
}

function ProductGallery({ coaVerified = false }) {
  const [active, setActive] = useState(0);
  const thumbs = [0, 1, 2];
  return (
    <div>
      <FlagshipCard coaVerified={coaVerified}/>

      {/* SKU + thumbnails row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 20,
      }}>
        <span className="pp-eyebrow" style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
        }}>SKU · PP-RT-010</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {thumbs.map(i => (
            <button key={i} onClick={() => setActive(i)} aria-label={`View ${i + 1}`} style={{
              width: 68, height: 68, padding: 6,
              background: PP.bone,
              border: `${PP.BW} solid ${PP.ink}`,
              outline: i === active ? `2px solid ${PP.ink}` : 'none',
              outlineOffset: i === active ? 2 : 0,
              cursor: 'pointer', borderRadius: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <VialRender label="RETA" dose="10 mg" w={36} h={54}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductGallery, FlagshipCard });
