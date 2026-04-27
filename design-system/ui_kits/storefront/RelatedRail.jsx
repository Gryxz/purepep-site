/* global React, PP, LabelCard, Eyebrow */

function RelatedRail({ items, title = 'Researchers studying retatrutide also ordered' }) {
  const defaultItems = [
    { compound: 'SEMA', cas: '910463-68-2', dose: '5 mg', price: '$149.00' },
    { compound: 'TIRZ', cas: '2023788-19-2', dose: '10 mg', price: '$199.00' },
    { compound: 'CAGRI', cas: '1415456-99-3', dose: '5 mg', price: '$179.00' },
    { compound: 'SURVO', cas: '1510265-99-0', dose: '10 mg', price: '$189.00' },
  ];
  const list = items || defaultItems;

  return (
    <section style={{ background: PP.bone }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 28, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <Eyebrow>Catalog</Eyebrow>
            <h2 style={{
              fontFamily: 'Inter', fontWeight: 900,
              fontSize: 'clamp(28px, 3vw, 40px)',
              letterSpacing: '-0.025em', lineHeight: 1,
              color: PP.ink, marginTop: 14,
            }}>{title}</h2>
          </div>
          <a href="#" style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}>View full catalog →</a>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
        }}>
          {list.map(it => (
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

Object.assign(window, { RelatedRail });
