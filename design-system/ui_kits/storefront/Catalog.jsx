/* global React, PP, Eyebrow, Pill, LabelCard, Chip, PillStock, PillOut, PillLowStock */
const { useState } = React;

function CatalogHeader({ filter, setFilter }) {
  const filters = ['All', 'Incretin mimetics', 'GH secretagogues', 'Healing', 'Cognition', 'Metabolic'];
  return (
    <section style={{ borderBottom: `${PP.BW} solid ${PP.ink}`, background: PP.bone }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 40px' }}>
        <Eyebrow>All compounds · lab-tested · lot-traceable</Eyebrow>
        <h1 style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(48px, 6vw, 88px)',
          letterSpacing: '-0.035em', lineHeight: 1,
          color: PP.ink, marginTop: 18,
        }}>Catalog</h1>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10,
          marginTop: 36,
        }}>
          {filters.map(f => (
            <Pill key={f} active={filter === f} onClick={() => setFilter(f)} as="button">{f}</Pill>
          ))}
        </div>
      </div>
    </section>
  );
}

function StockPill({ stock, count }) {
  if (stock === 'out') return <PillOut/>;
  if (stock === 'low') return <PillLowStock count={count}/>;
  return <PillStock/>;
}

function CatalogGrid({ items }) {
  return (
    <section style={{ background: PP.bone }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 96px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28,
        }} className="cat-grid">
          {items.map(it => (
            <a href={it.href || '#'} key={it.compound + it.dose} style={{
              textDecoration: 'none', color: 'inherit',
              opacity: it.stock === 'out' ? 0.85 : 1,
            }}>
              <LabelCard compound={it.compound} cas={it.cas} dose={it.dose}/>
              <div style={{
                padding: '18px 2px 0',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'baseline',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: PP.ink, letterSpacing: '-0.01em' }}>{it.name}</div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                    letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
                  }}>{it.compound} · {it.dose} · CAS {it.cas}</div>
                  <div style={{ marginTop: 10 }}>
                    <StockPill stock={it.stock} count={it.lowCount}/>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 17,
                  color: it.stock === 'out' ? PP.inkMuted : PP.ink,
                  textDecoration: it.stock === 'out' ? 'line-through' : 'none',
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

const CATALOG = [
  { compound: 'RETA',  name: 'Retatrutide',          cas: '2381089-83-2', dose: '10 mg', price: '$189.00', cat: 'Incretin mimetics', href: 'index.html', stock: 'in' },
  { compound: 'SEMA',  name: 'Semaglutide',          cas: '910463-68-2',  dose: '5 mg',  price: '$149.00', cat: 'Incretin mimetics', stock: 'in' },
  { compound: 'TIRZ',  name: 'Tirzepatide',          cas: '2023788-19-2', dose: '10 mg', price: '$199.00', cat: 'Incretin mimetics', stock: 'low', lowCount: 3 },
  { compound: 'CAGRI', name: 'Cagrilintide',         cas: '1415456-99-3', dose: '5 mg',  price: '$179.00', cat: 'Metabolic', stock: 'in' },
  { compound: 'SURVO', name: 'Survodutide',          cas: '1510265-99-0', dose: '10 mg', price: '$189.00', cat: 'Incretin mimetics', stock: 'in' },
  { compound: 'BPC',   name: 'BPC-157',              cas: '137525-51-0',  dose: '5 mg',  price: '$69.00',  cat: 'Healing', stock: 'in' },
  { compound: 'TB500', name: 'TB-500',               cas: '77591-33-4',   dose: '5 mg',  price: '$89.00',  cat: 'Healing', stock: 'in' },
  { compound: 'IPAM',  name: 'Ipamorelin',           cas: '170851-70-4',  dose: '5 mg',  price: '$79.00',  cat: 'GH secretagogues', stock: 'low', lowCount: 5 },
  { compound: 'CJC',   name: 'CJC-1295 (no DAC)',    cas: '863288-34-0',  dose: '5 mg',  price: '$89.00',  cat: 'GH secretagogues', stock: 'in' },
  { compound: 'GHKCU', name: 'GHK-Cu',               cas: '89030-95-5',   dose: '50 mg', price: '$95.00',  cat: 'Healing', stock: 'out' },
  { compound: 'EPI',   name: 'Epithalon',            cas: '307297-39-8',  dose: '10 mg', price: '$65.00',  cat: 'Cognition', stock: 'in' },
  { compound: 'MOTS',  name: 'MOTS-c',               cas: '1627580-64-6', dose: '10 mg', price: '$99.00',  cat: 'Metabolic', stock: 'in' },
];

function CatalogPage() {
  const [filter, setFilter] = useState('All');
  const items = filter === 'All' ? CATALOG : CATALOG.filter(x => x.cat === filter);
  return (
    <>
      <CatalogHeader filter={filter} setFilter={setFilter}/>
      <CatalogGrid items={items}/>
    </>
  );
}

Object.assign(window, { CatalogPage, CatalogHeader, CatalogGrid, CATALOG });
