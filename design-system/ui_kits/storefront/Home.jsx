/* global React, PP, Eyebrow, Button, LabelCard, TrustStrip, BlushBand, Icon, Hairline */

function Hero() {
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '88px 24px 96px',
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 72, alignItems: 'center',
      }} className="hero-grid">
        <div>
          <Eyebrow>Research-grade peptides · verified per lot</Eyebrow>
          <h1 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(54px, 7vw, 96px)',
            letterSpacing: '-0.035em', lineHeight: 0.98,
            color: PP.ink, margin: '28px 0 28px', textWrap: 'balance',
          }}>
            Research-grade peptides.<br/>
            Verified per lot.
          </h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 18, lineHeight: 1.6,
            color: PP.ink, maxWidth: 520, margin: '0 0 36px',
          }}>
            Triplicate HPLC assay, lot-matched certificate of analysis,
            cold-chain delivery. Documentation on file for every vial that
            leaves the building.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => {}}>View catalog →</Button>
            <a href="#" style={{
              fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: PP.ink,
              textDecoration: 'underline', textUnderlineOffset: 4,
              letterSpacing: '-0.005em',
            }}>Read our quality standard</a>
          </div>
        </div>
        <div>
          <LabelCard compound="RETA" cas="2381089-83-2" dose="10 mg"/>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const items = [
    {
      num: '01', title: 'Order with confidence',
      body: 'Every compound ships with a lot-matched COA including HPLC purity, mass confirmation, and endotoxin results. No verbal assurances — paper trail, every time.',
    },
    {
      num: '02', title: '2-day cold-chain delivery',
      body: 'Stoppered vials dispatched same-day in insulated packaging with ice pack and tamper-evident seal. Tracked point-to-point from our US partner facility.',
    },
    {
      num: '03', title: 'Documentation on file',
      body: 'COA, mass spectrum, HPLC chromatogram, SDS, and handling guide retained per lot. Downloadable against any order or by lot number on request.',
    },
  ];
  return (
    <section style={{ background: PP.surface, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <Eyebrow>What we ship with every vial</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(36px, 4vw, 56px)',
            letterSpacing: '-0.03em', lineHeight: 1,
            color: PP.ink, marginTop: 18,
          }}>A quality standard you can pull up in a document.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }} className="vp-grid">
          {items.map((it, i) => (
            <div key={it.num} style={{
              padding: '40px 36px 36px',
              borderLeft: i === 0 ? `${PP.BW} solid ${PP.ink}` : 'none',
              borderRight: `${PP.BW} solid ${PP.ink}`,
              borderTop: `${PP.BW} solid ${PP.ink}`,
              borderBottom: `${PP.BW} solid ${PP.ink}`,
              background: PP.bone,
            }}>
              <div style={{
                fontFamily: 'Inter', fontWeight: 900,
                fontSize: 72, letterSpacing: '-0.04em', lineHeight: 1,
                color: PP.ink, marginBottom: 32,
              }}>{it.num}</div>
              <h3 style={{
                fontFamily: 'Inter', fontWeight: 900,
                fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1.15,
                color: PP.ink, marginBottom: 14,
              }}>{it.title}</h3>
              <p style={{
                fontFamily: 'Inter', fontSize: 14.5, lineHeight: 1.6,
                color: PP.ink,
              }}>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedRail() {
  const items = [
    { compound: 'RETA', cas: '2381089-83-2', dose: '10 mg', price: '$189.00' },
    { compound: 'SEMA', cas: '910463-68-2', dose: '5 mg', price: '$149.00' },
    { compound: 'TIRZ', cas: '2023788-19-2', dose: '10 mg', price: '$199.00' },
    { compound: 'CAGRI', cas: '1415456-99-3', dose: '5 mg', price: '$179.00' },
  ];
  return (
    <section style={{ background: PP.bone }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 40, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <Eyebrow>Featured catalog</Eyebrow>
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 'clamp(32px, 3.4vw, 44px)',
              letterSpacing: '-0.025em', lineHeight: 1,
              color: PP.ink, marginTop: 14,
            }}>In stock now</h2>
          </div>
          <a href="#" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}>View full catalog →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="rail-grid">
          {items.map(it => (
            <a href="#" key={it.compound} style={{ textDecoration: 'none', color: 'inherit' }}>
              <LabelCard compound={it.compound} cas={it.cas} dose={it.dose}/>
              <div style={{
                padding: '16px 2px 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: PP.ink, letterSpacing: '-0.01em' }}>{it.compound} · {it.dose}</div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                    letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
                  }}>CAS {it.cas}</div>
                </div>
                <div style={{
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: PP.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}>{it.price}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyGrid() {
  const cells = [
    { k: '≥99.5%', l: 'Purity threshold (HPLC)' },
    { k: 'Per lot', l: 'Independent COA' },
    { k: 'USA',    l: 'Synthesis + release' },
    { k: '2-day',  l: 'Cold-chain shipping' },
  ];
  return (
    <section style={{ background: PP.bone, borderTop: `${PP.BW} solid ${PP.ink}`, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <Eyebrow>Why PurePep</Eyebrow>
          <h2 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(28px, 3vw, 40px)',
            letterSpacing: '-0.025em', lineHeight: 1,
            color: PP.ink, marginTop: 16,
          }}>A documented standard.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }} className="why-grid">
          {cells.map((c, i) => (
            <div key={c.l} style={{
              padding: '44px 28px',
              borderLeft: i === 0 ? 'none' : `${PP.BW} solid ${PP.ink}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'Inter', fontWeight: 900,
                fontSize: 56, letterSpacing: '-0.035em', lineHeight: 1,
                color: PP.ink, marginBottom: 18,
              }}>{c.k}</div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
              }}>{c.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, ValueProps, FeaturedRail, WhyGrid });
