/* global React, PP, Eyebrow, Button, LabelCard */

// B7/N — StatHeadlineHero
// A/B variant of the home hero — same layout, stat-as-headline.
// Eyebrow: INDEPENDENT VERIFICATION · LOT-MATCHED COA
// Headline: [TKTK]+ research labs. [TKTK,000]+ vials shipped. Zero unverified lots.
function StatHeadlineHero() {
  return (
    <section style={{ background: PP.bone, borderBottom: `${PP.BW} solid ${PP.ink}` }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '88px 24px 96px',
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 72, alignItems: 'center',
      }} className="hero-grid">
        <div>
          <Eyebrow>Independent verification · Lot-matched COA</Eyebrow>
          <h1 style={{
            fontFamily: 'Inter', fontWeight: 900,
            fontSize: 'clamp(48px, 6.2vw, 88px)',
            letterSpacing: '-0.035em', lineHeight: 0.98,
            color: PP.ink, margin: '28px 0 28px', textWrap: 'balance',
          }}>
            <span style={{ display: 'block' }}>[TKTK]<span style={{ fontWeight: 500, letterSpacing: '-0.02em' }}>+</span> research labs.</span>
            <span style={{ display: 'block' }}>[TKTK,000]<span style={{ fontWeight: 500, letterSpacing: '-0.02em' }}>+</span> vials shipped.</span>
            <span style={{ display: 'block' }}>Zero unverified lots.</span>
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
          <LabelCard compound="RETA" cas="2381089-83-2" dose="10 mg" coaVerified={true}/>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { StatHeadlineHero });
