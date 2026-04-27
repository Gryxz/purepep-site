/* global React, PP, Eyebrow, Button, Icon, PillStock, PillVerified, LabelCard */
const { useState } = React;

// ------------------------------------------------------------
// V — AffiliateDashboardHero
// Compact, logged-in utility header.
// ------------------------------------------------------------
function AffiliateDashboardHero({ name = 'Dr. K. Olsen', tier = 'SILVER' }) {
  const tierColor = { BASE: PP.inkMuted, SILVER: PP.inkMuted, GOLD: PP.ink, PLATINUM: PP.ink }[tier] || PP.ink;
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '48px 24px 44px',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'end',
      }} className="dash-hero">
        <div>
          <Eyebrow>Affiliate dashboard</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
            <h1 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 'clamp(28px, 3.4vw, 42px)',
              letterSpacing: '-0.025em', lineHeight: 1,
              color: PP.ink, margin: 0,
            }}>{name}</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', border: `${PP.BW} solid ${tierColor}`, background: PP.bone,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: tierColor,
              borderRadius: 2,
            }}>
              <span style={{ width: 6, height: 6, background: PP.emerald, display: 'inline-block' }}/>
              Tier · {tier}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.inkMuted,
            marginBottom: 6,
          }}>Next payout</div>
          <div style={{
            fontFamily: 'Inter', fontWeight: 900, fontSize: 28,
            letterSpacing: '-0.02em', color: PP.ink, fontVariantNumeric: 'tabular-nums',
          }}>[TKTK]</div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
            marginTop: 4,
          }}>[TKTK] days</div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .dash-hero { grid-template-columns: 1fr !important; gap: 16px !important; }
          .dash-hero > div:last-child { text-align: left !important; }
        }
      `}</style>
    </section>
  );
}

// ------------------------------------------------------------
// W — AffiliateStatGrid — 4 KPI cards
// ------------------------------------------------------------
function AffiliateStatGrid() {
  const cards = [
    { label: 'Clicks',      value: '[TKTK]',  caption: 'Last 30 days' },
    { label: 'Conversions', value: '[TKTK]',  caption: '[TKTK]% rate' },
    { label: 'Earnings',    value: '$[TKTK]', caption: 'Lifetime' },
    { label: 'Pending',     value: '$[TKTK]', caption: 'Available [DATE]' },
  ];
  return (
    <section style={{ background: PP.surface, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
        }} className="why-grid">
          {cards.map((c, i) => (
            <div key={c.label} style={{
              padding: '32px 28px',
              borderLeft: i === 0 ? 'none' : `${PP.BW} solid ${PP.ink}`,
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: PP.inkMuted,
                marginBottom: 14,
              }}>{c.label}</div>
              <div style={{
                fontFamily: 'Inter', fontWeight: 900,
                fontSize: 'clamp(32px, 3vw, 44px)', letterSpacing: '-0.025em', lineHeight: 1,
                color: PP.ink, fontVariantNumeric: 'tabular-nums',
              }}>{c.value}</div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
                marginTop: 10,
              }}>{c.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// X — ReferralCodeBlock
// ------------------------------------------------------------
function ReferralCodeBlock({ url = 'purepep.shop/?ref=[TKTK-USER-CODE]' }) {
  const [copied, setCopied] = useState(false);
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 22 }}>
          <Eyebrow>Your referral link</Eyebrow>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 0,
          border: `${PP.BW} solid ${PP.ink}`,
        }} className="ref-code-row">
          <div style={{
            padding: '22px 20px',
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 500,
            letterSpacing: '0.02em', color: PP.ink, background: PP.surface,
            borderRight: `${PP.BW} solid ${PP.ink}`,
            display: 'flex', alignItems: 'center',
            overflowX: 'auto', whiteSpace: 'nowrap',
          }}>{url}</div>
          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }} style={{
            padding: '0 28px', background: PP.ink, color: PP.bone, border: 'none', cursor: 'pointer',
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', minWidth: 120,
          }}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <p style={{
          marginTop: 12,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
        }}>This link credits orders for [TKTK] days after click.</p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Y — AssetLibraryRail
// ------------------------------------------------------------
function AssetPreview({ kind, compound = 'RETA' }) {
  if (kind === 'lockup') {
    return (
      <div style={{
        aspectRatio: '4 / 3', background: PP.boneSoft,
        border: `${PP.BW} solid ${PP.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter', fontWeight: 900, fontSize: 44,
        letterSpacing: '-0.04em', color: PP.ink,
      }}>PurePep</div>
    );
  }
  if (kind === 'banner') {
    return (
      <div style={{
        aspectRatio: '4 / 3', background: PP.ink,
        border: `${PP.BW} solid ${PP.ink}`,
        padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.7)',
        }}>Verified per lot</div>
        <div style={{
          fontFamily: 'Inter', fontWeight: 900, fontSize: 28,
          letterSpacing: '-0.03em', lineHeight: 1, color: PP.bone,
        }}>Research-<br/>grade peptides.</div>
      </div>
    );
  }
  if (kind === 'product') {
    return (
      <div style={{
        aspectRatio: '4 / 3', background: PP.boneSoft,
        border: `${PP.BW} solid ${PP.ink}`,
        padding: 10,
      }}>
        <div style={{ width: '100%', height: '100%', transform: 'scale(0.7)', transformOrigin: 'center' }}>
          <LabelCard compound={compound} cas="2381089-83-2" dose="10 mg" coaVerified={true}/>
        </div>
      </div>
    );
  }
  // copy block
  return (
    <div style={{
      aspectRatio: '4 / 3', background: PP.bone,
      border: `${PP.BW} solid ${PP.ink}`,
      padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500,
      letterSpacing: '0.02em', color: PP.ink, lineHeight: 1.5,
      overflow: 'hidden',
    }}>
      <div style={{ opacity: 0.5 }}>{'// 160 chars · research-grade'}</div>
      <div>Research-grade peptides, verified per lot. Triplicate HPLC assay + lot-matched COA. Cold-chain, 2-day. [REF-LINK]</div>
    </div>
  );
}

function AssetLibraryRail() {
  const [tab, setTab] = useState('LOCKUPS');
  const tabs = ['LOCKUPS', 'BANNERS', 'PRODUCT SHOTS', 'COPY BLOCKS'];
  const data = {
    LOCKUPS: [
      { name: 'purepep-lockup-horizontal', fmt: 'SVG', kind: 'lockup' },
      { name: 'purepep-lockup-stacked',    fmt: 'SVG', kind: 'lockup' },
      { name: 'purepep-mark-only',         fmt: 'SVG', kind: 'lockup' },
    ],
    BANNERS: [
      { name: 'banner-728x90-quality',  fmt: 'PNG', kind: 'banner' },
      { name: 'banner-300x250-square',  fmt: 'PNG', kind: 'banner' },
      { name: 'banner-1080x1080-story', fmt: 'PNG', kind: 'banner' },
    ],
    'PRODUCT SHOTS': [
      { name: 'reta-10mg-label',  fmt: 'PNG', kind: 'product', compound: 'RETA' },
      { name: 'sema-5mg-label',   fmt: 'PNG', kind: 'product', compound: 'SEMA' },
      { name: 'tirz-10mg-label',  fmt: 'PNG', kind: 'product', compound: 'TIRZ' },
    ],
    'COPY BLOCKS': [
      { name: 'copy-160char-quality', fmt: 'TXT', kind: 'copy' },
      { name: 'copy-280char-coa',     fmt: 'TXT', kind: 'copy' },
      { name: 'copy-500char-longform',fmt: 'TXT', kind: 'copy' },
    ],
  };
  const items = data[tab];
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 28, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <Eyebrow>Asset library</Eyebrow>
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 'clamp(28px, 3vw, 40px)',
              letterSpacing: '-0.025em', lineHeight: 1,
              color: PP.ink, marginTop: 14,
            }}>Drop-in creative.</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
          {tabs.map(t => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '14px 18px', background: active ? PP.ink : 'transparent',
                color: active ? PP.bone : PP.ink,
                border: 'none', cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                borderRight: `${PP.BW} solid ${PP.ink}`,
              }}>{t}</button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="rail-grid">
          {items.map(it => (
            <div key={it.name} style={{ display: 'flex', flexDirection: 'column' }}>
              <AssetPreview kind={it.kind} compound={it.compound}/>
              <div style={{
                padding: '14px 2px 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10,
              }}>
                <div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600,
                    letterSpacing: '0.04em', color: PP.ink,
                  }}>{it.name}</div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                    letterSpacing: '0.2em', textTransform: 'uppercase', color: PP.inkMuted,
                    marginTop: 4, display: 'inline-block',
                    padding: '2px 8px', border: `1px solid ${PP.line}`,
                  }}>{it.fmt}</div>
                </div>
                <a href="#" style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
                  textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap',
                }}>Download →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Z — PayoutHistoryTable
// ------------------------------------------------------------
function PayoutStatusPill({ status }) {
  const map = {
    PAID:    { color: PP.emerald, label: 'Paid' },
    PENDING: { color: PP.alert,   label: 'Pending' },
    FAILED:  { color: PP.alert,   label: 'Failed' },
  };
  const cfg = map[status] || map.PAID;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', border: `${PP.BW} solid ${cfg.color}`, color: cfg.color,
      background: PP.bone, borderRadius: 2,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
      letterSpacing: '0.18em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, background: cfg.color, display: 'inline-block' }}/>
      {cfg.label}
    </span>
  );
}

function PayoutHistoryTable() {
  const rows = [
    { date: '[TKTK]-[TK]-[TK]', method: 'PayPal',  amount: '$[TKTK]', status: 'PAID' },
    { date: '[TKTK]-[TK]-[TK]', method: 'ACH',     amount: '$[TKTK]', status: 'PAID' },
    { date: '[TKTK]-[TK]-[TK]', method: 'USDC',    amount: '$[TKTK]', status: 'PENDING' },
    { date: '[TKTK]-[TK]-[TK]', method: 'PayPal',  amount: '$[TKTK]', status: 'PAID' },
    { date: '[TKTK]-[TK]-[TK]', method: 'ACH',     amount: '$[TKTK]', status: 'FAILED' },
    { date: '[TKTK]-[TK]-[TK]', method: 'PayPal',  amount: '$[TKTK]', status: 'PAID' },
  ];
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ marginBottom: 26 }}>
          <Eyebrow>Payout history</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(28px, 3vw, 40px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 14,
          }}>Transaction log.</h2>
        </div>
        <div style={{ border: `${PP.BW} solid ${PP.ink}`, background: PP.bone }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr', gap: 0,
            padding: '14px 20px', background: PP.surface,
            borderBottom: `${PP.BW} solid ${PP.ink}`,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
          }}>
            <span>Date</span>
            <span>Method</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr', gap: 0,
              padding: '18px 20px',
              background: i % 2 === 0 ? PP.bone : PP.boneSoft,
              borderBottom: i === rows.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
                letterSpacing: '0.04em', color: PP.ink, fontVariantNumeric: 'tabular-nums',
              }}>{r.date}</span>
              <span style={{
                fontFamily: 'Inter', fontWeight: 600, fontSize: 14.5,
                letterSpacing: '-0.005em', color: PP.ink,
              }}>{r.method}</span>
              <span style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 15.5,
                letterSpacing: '-0.01em', color: PP.ink, fontVariantNumeric: 'tabular-nums',
              }}>{r.amount}</span>
              <span><PayoutStatusPill status={r.status}/></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  AffiliateDashboardHero, AffiliateStatGrid, ReferralCodeBlock,
  AssetLibraryRail, PayoutHistoryTable, PayoutStatusPill,
});
