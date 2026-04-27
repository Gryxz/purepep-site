/* global React, PP, Lockup, Eyebrow */

function FootCol({ title, items }) {
  return (
    <div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.55)',
        marginBottom: 14,
      }}>{title}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {items.map(i => (
          <li key={i}>
            <a href="#" style={{
              fontFamily: 'Inter', fontSize: 13.5, color: PP.bone,
              textDecoration: 'none',
            }}>{i}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ minimal = false }) {
  if (minimal) {
    return (
      <footer style={{
        background: PP.ink, color: PP.bone, padding: '20px 24px',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        © 2026 PurePep · For research use only · Not for human consumption
      </footer>
    );
  }
  return (
    <footer style={{ background: PP.ink, color: PP.bone, marginTop: 0 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 48 }}>
          <div>
            <Lockup height={40} color={PP.bone}/>
            <p style={{
              fontFamily: 'Inter', fontSize: 13.5, lineHeight: 1.6,
              color: 'rgba(250,247,240,0.75)', marginTop: 18, maxWidth: 280,
            }}>
              Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped. Documentation on file.
            </p>
          </div>
          <FootCol title="Catalog" items={['RETA · Retatrutide', 'SEMA · Semaglutide', 'TIRZ · Tirzepatide', 'View all']}/>
          <FootCol title="Quality" items={['Certificates of analysis', 'Lab partners', 'Cold-chain shipping', 'Lot traceability']}/>
          <FootCol title="Account" items={['Sign in', 'Researcher verification', 'Order history', 'Re-order']}/>
          <FootCol title="Policies" items={['No-refund policy', 'Terms of sale', 'Privacy', 'Contact']}/>
        </div>
        <div style={{ height: PP.BW, background: 'rgba(250,247,240,0.2)', margin: '48px 0 20px' }}/>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5,
          color: 'rgba(250,247,240,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>
          <span>For research use only · Not for human consumption · 21+ qualified researchers</span>
          <span>© 2026 PurePep</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
