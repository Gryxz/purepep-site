/* global React, PP, Eyebrow, Button, Icon, PillStock, PillVerified */
const { useState } = React;

// ------------------------------------------------------------
// P — AffiliatesHero
// ------------------------------------------------------------
function AffiliatesHero() {
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '96px 24px 104px',
      }}>
        <div style={{ maxWidth: 860 }}>
          <Eyebrow>PurePep affiliate program</Eyebrow>
          <h1 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(48px, 6.4vw, 92px)',
            letterSpacing: '-0.035em', lineHeight: 0.98,
            color: PP.ink, margin: '28px 0 28px', textWrap: 'balance',
          }}>
            Earn [TKTK]% on every verified researcher you refer.
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 19, lineHeight: 1.6,
            color: PP.ink, maxWidth: 620, margin: '0 0 40px',
          }}>
            Lot-matched COA means your audience trusts the product. That trust converts.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => {
              const el = document.querySelector('[data-apply-anchor]');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>Apply now →</Button>
            <a href="affiliates-dashboard.html" style={{
              fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: PP.ink,
              textDecoration: 'underline', textUnderlineOffset: 4,
              letterSpacing: '-0.005em',
            }}>Already an affiliate? Access dashboard →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Q — AffiliateStepsBlock — Share / Convert / Earn
// ------------------------------------------------------------
function AffiliateStepsBlock() {
  const steps = [
    { n: '01', t: 'Share',   b: 'Get your unique referral link. Drop it in forums, videos, newsletters, or DMs.' },
    { n: '02', t: 'Convert', b: 'Your audience orders. Cookie tracks for [TKTK] days.' },
    { n: '03', t: 'Earn',    b: 'Payouts issued on the [TKTK] of every month once balance hits $[TKTK].' },
  ];
  return (
    <section style={{ background: PP.surface, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(32px, 3.8vw, 52px)',
            letterSpacing: '-0.03em', lineHeight: 1,
            color: PP.ink, marginTop: 18,
          }}>Three steps. No gimmicks.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }} className="vp-grid">
          {steps.map((s, i) => (
            <div key={s.n} style={{
              padding: '40px 36px 40px',
              borderLeft: i === 0 ? `${PP.BW} solid ${PP.ink}` : 'none',
              borderRight: `${PP.BW} solid ${PP.ink}`,
              borderTop: `${PP.BW} solid ${PP.ink}`,
              borderBottom: `${PP.BW} solid ${PP.ink}`,
              background: PP.bone, borderRadius: 2,
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                letterSpacing: '0.2em', textTransform: 'uppercase', color: PP.inkMuted,
                marginBottom: 24,
              }}>{s.n} · {s.t.toUpperCase()}</div>
              <h3 style={{
                fontFamily: 'Inter', fontWeight: 900,
                fontSize: 28, letterSpacing: '-0.025em', lineHeight: 1.1,
                color: PP.ink, margin: '0 0 14px',
              }}>{s.t}</h3>
              <p style={{
                fontFamily: 'Inter', fontSize: 15, lineHeight: 1.6,
                color: PP.ink, margin: 0,
              }}>{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// R — AffiliateTierTable — commission structure
// ------------------------------------------------------------
function AffiliateTierTable() {
  const rows = [
    { tier: 'Base',     revenue: '$0 – $[TKTK]',        rate: '[TKTK]%', bonus: '—' },
    { tier: 'Silver',   revenue: '$[TKTK] – $[TKTK]',   rate: '[TKTK]%', bonus: '[TKTK]' },
    { tier: 'Gold',     revenue: '$[TKTK] – $[TKTK]',   rate: '[TKTK]%', bonus: '[TKTK]' },
    { tier: 'Platinum', revenue: '$[TKTK]+',            rate: '[TKTK]%', bonus: '[TKTK]' },
  ];
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <Eyebrow>Commission structure</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(30px, 3.4vw, 44px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 16,
          }}>Tiers evaluated monthly.</h2>
        </div>
        <div style={{ border: `${PP.BW} solid ${PP.ink}`, background: PP.bone }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr', gap: 0,
            padding: '14px 20px', background: PP.surface,
            borderBottom: `${PP.BW} solid ${PP.ink}`,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
          }}>
            <span>Tier</span>
            <span>Monthly referred revenue</span>
            <span>Commission</span>
            <span>Bonus</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.tier} style={{
              display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr', gap: 0,
              padding: '18px 20px',
              background: i % 2 === 0 ? PP.bone : PP.boneSoft,
              borderBottom: i === rows.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 16,
                letterSpacing: '-0.01em', color: PP.ink,
              }}>{r.tier}</span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
                letterSpacing: '0.04em', color: PP.ink, fontVariantNumeric: 'tabular-nums',
              }}>{r.revenue}</span>
              <span style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 18,
                letterSpacing: '-0.015em', color: PP.ink, fontVariantNumeric: 'tabular-nums',
              }}>{r.rate}</span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
                letterSpacing: '0.04em', color: PP.inkMuted,
              }}>{r.bonus}</span>
            </div>
          ))}
        </div>
        <p style={{
          marginTop: 18,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
          lineHeight: 1.5,
        }}>Tiers evaluated monthly. Higher tier = higher payout on all referred orders, not just the bracket above.</p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// S — AffiliatePayoutBlock — methods + cadence
// ------------------------------------------------------------
function AffiliatePayoutBlock() {
  const methods = [
    { label: 'PayPal',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={PP.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 21l2-14h6c3 0 5 2 4 5s-3 4-6 4h-3l-1 5z"/><path d="M9 16h3c3 0 5 2 4 5H7"/></svg> },
    { label: 'ACH (US)',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={PP.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-6 9 6v2H3z"/><path d="M5 12v7M10 12v7M14 12v7M19 12v7M3 20h18"/></svg> },
    { label: 'Crypto (BTC · ETH · USDC)',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={PP.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 8h4.5a2 2 0 0 1 0 4H9M9 12h5a2 2 0 0 1 0 4H9M9 6v12M13 5v2M13 17v2"/></svg> },
  ];
  return (
    <section style={{ background: PP.surface, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>Payout methods</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(28px, 3vw, 40px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 14,
          }}>Paid the way you prefer.</h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
        }} className="why-grid">
          {methods.map((m, i) => (
            <div key={m.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 14, padding: '36px 24px',
              borderLeft: i === 0 ? 'none' : `${PP.BW} solid ${PP.ink}`,
            }}>
              {m.icon}
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
                textAlign: 'center',
              }}>{m.label}</div>
            </div>
          ))}
        </div>
        <p style={{
          marginTop: 20, textAlign: 'center',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
        }}>Payouts issued on the [TKTK] of each month. Minimum balance $[TKTK].</p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// T — AffiliateFAQAccordion
// ------------------------------------------------------------
function AffiliateFAQAccordion() {
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = [
    { q: 'What counts as a qualified referral?',
      a: 'Any first-time researcher who completes age-gate, passes identity screening, and places a verified order through your referral link within the [TKTK]-day cookie window. Orders flagged for fraud or chargeback are reversed from your balance.' },
    { q: 'How long does the tracking cookie last?',
      a: 'The referral cookie tracks for [TKTK] days from first click. If the researcher clears cookies or switches devices before converting, the referral credit may be lost — we recommend sending qualified traffic, not cold spam.' },
    { q: 'Can I promote on Reddit, YouTube, Discord, or Telegram?',
      a: 'Yes, provided you follow that platform\'s rules and our promotional restrictions (no medical claims, no targeting minors, no review manipulation). Forum moderators have the final call on whether referral links are allowed in their community.' },
    { q: 'Are there promotional restrictions?',
      a: 'No medical claims. No "treats" / "cures" / "prevents" language. No targeting minors. No fake reviews, astroturfing, or coupon-site spam. No trademark bidding on branded search terms. Violating affiliates are removed and unpaid balances forfeited.' },
    { q: 'When do I get paid?',
      a: 'Payouts issue on the [TKTK] of every month, covering all verified balance from the prior month. Minimum balance $[TKTK]. Balances below the minimum roll forward.' },
    { q: 'Tax forms — W-9 / W-8BEN handling',
      a: 'US affiliates complete a W-9 in the dashboard before first payout. Non-US affiliates complete a W-8BEN. 1099s issued annually for US earnings over $[TKTK].' },
    { q: 'Can my tier go down?',
      a: 'Yes. Tiers evaluate on a rolling [TKTK]-day window. If your referred revenue drops below a tier threshold for that window, your rate reverts to the bracket your referred revenue currently supports. You keep earned commissions from the previous tier.' },
  ];
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <Eyebrow>Frequently asked</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(30px, 3.4vw, 44px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 16,
          }}>Program details.</h2>
        </div>
        <div style={{ border: `${PP.BW} solid ${PP.ink}`, background: PP.bone }}>
          {faqs.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q} style={{
                borderBottom: i === faqs.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
              }}>
                <button onClick={() => setOpenIdx(open ? -1 : i)} style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
                  padding: '22px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 16,
                  letterSpacing: '-0.01em', color: PP.ink,
                }}>
                  <span>{f.q}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                       style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 160ms', flexShrink: 0 }}>
                    <path d="M6 4l4 4-4 4" stroke={PP.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {open && (
                  <div style={{
                    padding: '0 22px 24px',
                    fontFamily: 'Inter', fontSize: 14.5, lineHeight: 1.65, color: PP.ink,
                    maxWidth: 700,
                  }}>{f.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// U — AffiliateApplyForm
// ------------------------------------------------------------
function FormField({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
      }}>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input {...props} style={{
      height: 48, padding: '0 14px',
      border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
      fontFamily: 'Inter', fontSize: 15, color: PP.ink,
      borderRadius: 2, outline: 'none', ...(props.style || {}),
    }}/>
  );
}

function Select({ options, value, onChange, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      height: 48, padding: '0 14px',
      border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
      fontFamily: 'Inter', fontSize: 15, color: PP.ink,
      borderRadius: 2, outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='%231F1F1F' stroke-width='1.4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
      paddingRight: 38,
    }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function FormCheckbox({ checked, onChange, label }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', userSelect: 'none',
    }}>
      <span style={{
        width: 20, height: 20, flexShrink: 0, marginTop: 2,
        border: `${PP.BW} solid ${PP.ink}`, background: checked ? PP.ink : PP.bone,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 2,
      }}>
        {checked && <Icon name="check" size={14} color={PP.bone} strokeWidth={2.5}/>}
      </span>
      <span style={{ fontFamily: 'Inter', fontSize: 14, color: PP.ink, lineHeight: 1.55 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }}/>
    </label>
  );
}

function AffiliateApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', country: '', source: '', handle: '', url: '',
    audience: '', volume: '', desc: '', ack1: false, ack2: false,
  });
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <section data-apply-anchor style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '10px 18px',
            border: `${PP.BW} solid ${PP.emerald}`, color: PP.emerald, background: PP.bone,
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6.3l2.3 2.3L9.5 3.8" stroke={PP.emerald} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Application received
          </div>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(36px, 4.2vw, 56px)',
            letterSpacing: '-0.03em', lineHeight: 1,
            color: PP.ink, margin: '0 0 20px',
          }}>Thanks. We'll review within [TKTK] business days.</h2>
          <p style={{
            fontFamily: 'Inter', fontSize: 16, lineHeight: 1.65, color: PP.ink,
            maxWidth: 560, margin: '0 auto',
          }}>
            Approved applicants receive a welcome email with dashboard access, referral link,
            and the asset library. Declined applications receive a reason and may reapply in [TKTK] days.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section data-apply-anchor style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '88px 24px' }}>
        <div style={{ marginBottom: 36 }}>
          <Eyebrow>Apply</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(30px, 3.4vw, 44px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 16,
          }}>Join the program.</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{
          border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
          padding: '40px 40px 36px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 22px',
        }} className="affiliate-form">
          <FormField label="Name"><TextInput required value={form.name} onChange={e => set('name')(e.target.value)}/></FormField>
          <FormField label="Email"><TextInput required type="email" value={form.email} onChange={e => set('email')(e.target.value)}/></FormField>
          <FormField label="Country">
            <Select placeholder="Select country"
              options={['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia', 'Other']}
              value={form.country} onChange={set('country')}/>
          </FormField>
          <FormField label="Primary traffic source">
            <Select placeholder="Select source"
              options={['Forum', 'YouTube', 'Reddit', 'Instagram', 'TikTok', 'Email list', 'Blog', 'Discord / Telegram', 'Other']}
              value={form.source} onChange={set('source')}/>
          </FormField>
          <FormField label="Social / forum handle"><TextInput required value={form.handle} onChange={e => set('handle')(e.target.value)} placeholder="@yourhandle"/></FormField>
          <FormField label="Profile URL"><TextInput required value={form.url} onChange={e => set('url')(e.target.value)} placeholder="https://..."/></FormField>
          <FormField label="Monthly audience size">
            <Select placeholder="Select bracket"
              options={['< 1K', '1K – 10K', '10K – 50K', '50K – 100K', '100K+']}
              value={form.audience} onChange={set('audience')}/>
          </FormField>
          <FormField label="Expected monthly referred volume">
            <Select placeholder="Select bracket"
              options={['< $1K', '$1K – $5K', '$5K – $25K', '$25K – $100K', '$100K+']}
              value={form.volume} onChange={set('volume')}/>
          </FormField>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormField label="Brief description of your audience">
              <textarea value={form.desc} onChange={e => set('desc')(e.target.value)} rows={4} style={{
                padding: '14px', border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
                fontFamily: 'Inter', fontSize: 15, color: PP.ink, borderRadius: 2,
                outline: 'none', resize: 'vertical', lineHeight: 1.5,
              }}/>
            </FormField>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            <FormCheckbox checked={form.ack1} onChange={set('ack1')}
              label="I will not make medical claims about PurePep products or target minors."/>
            <FormCheckbox checked={form.ack2} onChange={set('ack2')}
              label="I understand payout is contingent on verified researcher purchases only."/>
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: 14 }}>
            <button type="submit" disabled={!(form.ack1 && form.ack2)} style={{
              width: '100%', height: 56,
              background: (form.ack1 && form.ack2) ? PP.ink : PP.line,
              color: (form.ack1 && form.ack2) ? PP.bone : PP.inkMuted,
              border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
              fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              cursor: (form.ack1 && form.ack2) ? 'pointer' : 'not-allowed',
            }}>Submit application →</button>
          </div>
        </form>
        <style>{`
          @media (max-width: 640px) {
            .affiliate-form { grid-template-columns: 1fr !important; padding: 28px 22px !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

Object.assign(window, {
  AffiliatesHero, AffiliateStepsBlock, AffiliateTierTable,
  AffiliatePayoutBlock, AffiliateFAQAccordion, AffiliateApplyForm,
});
