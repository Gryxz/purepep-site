/* global React, PP, Eyebrow */
const { useState } = React;

// ------------------------------------------------------------
// B4/K — ResearcherAccessBlock
// Single bone panel, 1.5px ink border, no shadow.
// Placed on PDP between COA tab and RelatedRail, and on home above footer.
// No "VIP", no neon, no floating product render.
// ------------------------------------------------------------
function ResearcherAccessBlock({ style }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={{
      background: PP.bone,
      borderTop: `${PP.BW} solid ${PP.ink}`,
      borderBottom: `${PP.BW} solid ${PP.ink}`,
      ...style,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
          padding: '48px 48px 44px',
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 48,
          alignItems: 'end',
        }} className="researcher-access-inner">
          <div>
            <div style={{ marginBottom: 16 }}><Eyebrow>Researcher access</Eyebrow></div>
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 'clamp(28px, 3.4vw, 44px)',
              letterSpacing: '-0.025em', lineHeight: 1.05,
              color: PP.ink, margin: 0, maxWidth: 760, textWrap: 'balance',
            }}>
              10% on your first order. New lot announcements. COA archive access.
            </h2>
            <p style={{
              fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65, color: PP.inkMuted,
              margin: '16px 0 0', maxWidth: 580,
            }}>
              One email per lot release. No marketing spam, no affiliate promos.
            </p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              minWidth: 340, maxWidth: 420,
            }}
            className="researcher-access-form"
          >
            <label style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
            }}>Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@lab.edu" required
              style={{
                height: 52, padding: '0 16px',
                border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
                fontFamily: 'Inter', fontSize: 15, color: PP.ink,
                borderRadius: 2, outline: 'none',
              }}
            />
            <button type="submit" style={{
              height: 52, background: PP.ink, color: PP.bone,
              border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
              fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{submitted ? 'Request received →' : 'Request access →'}</button>
          </form>
        </div>
      </div>
      <style>{`
        @media (max-width: 820px) {
          .researcher-access-inner {
            grid-template-columns: 1fr !important;
            padding: 32px 24px !important;
            gap: 28px !important;
          }
          .researcher-access-form { min-width: 0 !important; max-width: none !important; }
        }
      `}</style>
    </section>
  );
}

// ------------------------------------------------------------
// B5/L — RewardsPill + RewardsDrawer
// Bottom-left floating pill, inactive-launch state (opacity 0.5 + tooltip).
// Click opens RewardsDrawer from left side — brutalist, static, never animates.
// ------------------------------------------------------------
function RewardsPill({ active = false }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Researcher rewards"
        style={{
          position: 'fixed', left: 20, bottom: 20, zIndex: 60,
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 18px',
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, color: PP.ink,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: 'pointer', borderRadius: 2,
          opacity: active ? 1 : 0.6,
        }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="4" width="12" height="3" stroke={PP.ink} strokeWidth="1.3"/>
          <rect x="2" y="7" width="10" height="6" stroke={PP.ink} strokeWidth="1.3"/>
          <path d="M7 4v9M3 4c0-1.5 1-2 2-2s2 1 2 2M11 4c0-1.5-1-2-2-2S7 3 7 4" stroke={PP.ink} strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        Researcher rewards · 1 pt / $1
      </button>

      {!active && hover && (
        <div style={{
          position: 'fixed', left: 20, bottom: 72, zIndex: 61,
          padding: '10px 14px',
          border: `${PP.BW} solid ${PP.ink}`, background: PP.ink, color: PP.bone,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          maxWidth: 260,
        }}>
          Program launching [TKTK]
        </div>
      )}

      <RewardsDrawer open={open} onClose={() => setOpen(false)} active={active}/>
    </>
  );
}

function RewardsDrawer({ open, onClose, active }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(31,31,31,0.40)',
          zIndex: 70,
        }}
      />
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 'min(460px, 90vw)',
        background: PP.bone, borderRight: `${PP.BW} solid ${PP.ink}`,
        zIndex: 71, display: 'flex', flexDirection: 'column',
      }}>
        <header style={{
          padding: '28px 28px 22px',
          borderBottom: `${PP.BW} solid ${PP.ink}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <Eyebrow>Researcher rewards</Eyebrow>
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1,
              margin: '12px 0 0', color: PP.ink,
            }}>How it works</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
            padding: 4,
          }}>Close ✕</button>
        </header>

        <div style={{ padding: '28px 28px 40px', flex: 1, overflowY: 'auto' }}>
          {!active && (
            <div style={{
              padding: '12px 14px', marginBottom: 24,
              border: `${PP.BW} solid ${PP.ink}`, background: PP.surface,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
            }}>Program launching [TKTK] · Preview only</div>
          )}

          {[
            { tag: 'Earn', body: '1 pt per $1 spent on every verified lot purchase.' },
            { tag: 'Redeem', body: '100 pts = $10 off. No cap, no expiry.' },
            { tag: 'Tier', body: 'Silver / Gold / Platinum unlock at [TKTK] / [TKTK] / [TKTK] pts.' },
          ].map((row, i) => (
            <div key={row.tag} style={{
              display: 'grid', gridTemplateColumns: '110px 1fr', gap: 20,
              padding: '22px 0',
              borderBottom: i === 2 ? 'none' : `${PP.BW} solid ${PP.line}`,
              alignItems: 'start',
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: PP.ink,
              }}>{row.tag}</span>
              <span style={{
                fontFamily: 'Inter', fontSize: 15, lineHeight: 1.6, color: PP.ink,
              }}>{row.body}</span>
            </div>
          ))}

          <div style={{
            marginTop: 28, padding: 20,
            border: `${PP.BW} solid ${PP.ink}`, background: PP.boneSoft,
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
              marginBottom: 8,
            }}>Fine print</div>
            <div style={{
              fontFamily: 'Inter', fontSize: 13, lineHeight: 1.6, color: PP.ink,
            }}>Points earn on subtotal only. Excludes shipping, cold-chain surcharges, and promotional credits. No retroactive accrual.</div>
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { ResearcherAccessBlock, RewardsPill, RewardsDrawer });
