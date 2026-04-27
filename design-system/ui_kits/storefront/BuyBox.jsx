/* global React, PP, Eyebrow, Button, Icon, Hairline, PillStock, PillOut, PillVerified, PillLowStock, CheckGlyph, MonoLine, LotInventoryLine, NextLotETALine, LotReleasedCaption, LotReorderCount, TrustStripInline */
const { useState } = React;

function QtyStepper({ qty, setQty }) {
  const btn = {
    width: 44, height: 52, background: 'transparent', border: 'none',
    cursor: 'pointer', color: PP.ink, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2, height: 52,
      background: PP.bone,
    }}>
      <button style={btn} onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Icon name="minus" size={16}/></button>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600,
        color: PP.ink, minWidth: 36, textAlign: 'center',
        borderLeft: `${PP.BW} solid ${PP.ink}`, borderRight: `${PP.BW} solid ${PP.ink}`,
        alignSelf: 'stretch', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>{String(qty).padStart(2, '0')}</span>
      <button style={btn} onClick={() => setQty(qty + 1)} aria-label="Increase"><Icon name="plus" size={16}/></button>
    </div>
  );
}

function SpecRow({ label, value, mono, last, trailing }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '140px 1fr',
      padding: '14px 0',
      borderBottom: last ? 'none' : `${PP.BW} solid ${PP.line}`,
      alignItems: 'center',
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: mono ? "'IBM Plex Mono', monospace" : 'Inter',
          fontSize: 15, fontWeight: mono ? 600 : 500,
          color: PP.ink, letterSpacing: '-0.005em',
        }}>{value}</span>
        {trailing}
      </div>
    </div>
  );
}

function TierRow({ label, eachPrice, totalPrice, saveTag, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center',
      padding: '16px 18px',
      border: `${PP.BW} solid ${PP.ink}`,
      background: active ? PP.bone : PP.bone,
      cursor: 'pointer', borderRadius: 2,
      marginBottom: '-1.5px',
      position: 'relative',
      transition: 'background 160ms',
    }}>
      <span style={{
        width: 16, height: 16, borderRadius: '50%',
        border: `${PP.BW} solid ${PP.ink}`,
        background: PP.bone, position: 'relative',
      }}>
        {active && (
          <span style={{
            position: 'absolute', inset: 3, borderRadius: '50%', background: PP.ink,
          }}/>
        )}
      </span>
      <span style={{
        fontFamily: 'Inter', fontWeight: active ? 700 : 500, fontSize: 15, color: PP.ink,
      }}>{label}</span>
      {saveTag && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '3px 8px', border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, color: PP.ink,
        }}>{saveTag}</span>
      )}
      <span style={{
        fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: PP.ink,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {eachPrice}
        {totalPrice && <span style={{ fontWeight: 500, color: PP.inkMuted, marginLeft: 6, fontSize: 13 }}>{totalPrice}</span>}
      </span>
    </button>
  );
}

function VariantPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', minWidth: 80,
      background: active ? PP.ink : PP.bone,
      color: active ? PP.bone : PP.ink,
      border: `${PP.BW} solid ${PP.ink}`,
      fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
      letterSpacing: '0.02em',
      borderRadius: 2, cursor: 'pointer',
    }}>{label}</button>
  );
}

function BuyBox({ onAddToCart, stockState = 'in-stock', lowStockCount = 4, vialsRemaining = 18, reorderCount = '[127]', lot = 'RT-2604-A11', nextLot = 'RT-2604-A12', nextLotETA = '[TKTK — date]' }) {
  const [qty, setQty] = useState(1);
  const [tier, setTier] = useState(0);
  const [variant, setVariant] = useState(1); // 0=5mg, 1=10mg
  const unitPrices = [189.00, 170.10, 151.20];
  const unit = unitPrices[tier];
  const tierQty = [1, 3, 6][tier];
  const total = unit * tierQty * qty;
  const isOut = stockState === 'out';
  const isLow = stockState === 'low' || vialsRemaining <= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        {/* B2/D — reorder count, sits above eyebrow row */}
        <LotReorderCount count={reorderCount} lot={lot} style={{ marginBottom: 10 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Eyebrow>Retatrutide · lyophilized</Eyebrow>
          <span style={{ color: PP.inkMuted }}>·</span>
          {isOut ? <PillOut/> : isLow ? <PillLowStock count={lowStockCount}/> : <PillStock/>}
        </div>
        <h1 style={{
          fontFamily: 'Inter', fontWeight: 900,
          fontSize: 'clamp(44px, 5.5vw, 64px)',
          letterSpacing: '-0.035em', lineHeight: 1,
          margin: '14px 0 0', color: PP.ink,
        }}>
          RETA <span style={{ color: PP.ink }}>· 10 mg</span>
        </h1>
        <p style={{
          fontFamily: 'Inter', fontSize: 15.5, lineHeight: 1.65,
          color: PP.ink, margin: '20px 0 0', maxWidth: 520,
        }}>
          Retatrutide (LY3437943) is a synthetic 39-amino-acid peptide — a triple
          agonist at GLP-1, GIP, and glucagon receptors. It is supplied here as a white
          lyophilized powder in a stoppered glass vial, assayed at ≥99.5% by HPLC on every
          lot and shipped with a lot-matched certificate of analysis.
        </p>
        <p style={{
          fontFamily: 'Inter', fontSize: 14, fontWeight: 600, lineHeight: 1.55,
          color: PP.ink, margin: '18px 0 0',
        }}>
          This is a lyophilized powder vial intended for research use — this is not a
          capsule or oral supplement.
        </p>
      </div>

      <Hairline/>

      {/* Spec rows */}
      <div>
        <div style={{ marginBottom: 4 }}><Eyebrow>Specification</Eyebrow></div>
        <SpecRow label="Compound" value="Retatrutide (LY3437943)"/>
        <SpecRow label="Net mass" value="10 mg lyophilized"/>
        <SpecRow label="Purity" value="≥ 99.5% (HPLC)"/>
        <SpecRow label="Lot" value="RT-2604-A11" mono trailing={<div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><PillVerified/><LotReleasedCaption/></div>}/>
        <SpecRow label="Storage" value="2–8 °C, protect from light" last/>
      </div>

      <Hairline/>

      {/* Tiered pricing */}
      <div>
        <div style={{ marginBottom: 12 }}><Eyebrow>Buy more, save more</Eyebrow></div>
      </div>
      {/* B1/A + B1/B — lot inventory disclosure under tier pricing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: -12 }}>
        <LotInventoryLine remaining={vialsRemaining} lot={lot}/>
        <NextLotETALine remaining={vialsRemaining} nextLot={nextLot} eta={nextLotETA}/>
      </div>
      <div>
        <TierRow
          active={tier === 0}
          onClick={() => setTier(0)}
          label="Buy 1 vial"
          eachPrice="$189.00"
          totalPrice="Total: $189.00"
        />
        <TierRow
          active={tier === 1}
          onClick={() => setTier(1)}
          label="Buy 3 — save 10%"
          saveTag="10% off"
          eachPrice="$170.10/ea"
          totalPrice="$510.30"
        />
        <TierRow
          active={tier === 2}
          onClick={() => setTier(2)}
          label="Buy 6 — save 20%"
          saveTag="20% off"
          eachPrice="$151.20/ea"
          totalPrice="$907.20"
        />
      </div>

      {/* Variant + Qty */}
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={{ marginBottom: 10 }}><Eyebrow>Dose</Eyebrow></div>
          <div style={{ display: 'flex', gap: '-1.5px' }}>
            <VariantPill label="5 mg" active={variant === 0} onClick={() => setVariant(0)}/>
            <VariantPill label="10 mg" active={variant === 1} onClick={() => setVariant(1)}/>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 10 }}><Eyebrow>Quantity</Eyebrow></div>
          <QtyStepper qty={qty} setQty={setQty}/>
        </div>
      </div>

      {/* Low-stock warning line (only when low) */}
      {isLow && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          border: `${PP.BW} solid ${PP.alert}`, borderRadius: 2,
          background: PP.bone,
          marginTop: -8,
        }}>
          <span aria-hidden="true" style={{
            width: 8, height: 8, borderRadius: '50%', background: PP.alert, flexShrink: 0,
          }}/>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.alert,
          }}>
            Low stock — only {lowStockCount} vials remaining this lot
          </span>
        </div>
      )}

      {/* Primary CTA */}
      <button onClick={() => !isOut && onAddToCart(qty * tierQty)} disabled={isOut} style={{
        width: '100%', height: 56,
        background: isOut ? PP.line : PP.ink, color: isOut ? PP.inkMuted : PP.bone,
        border: `${PP.BW} solid ${isOut ? PP.line : PP.ink}`, borderRadius: 2,
        fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: isOut ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <Icon name="cart" size={17} color={isOut ? PP.inkMuted : PP.bone} strokeWidth={2}/>
        {isOut ? 'Out of stock — notify me' : `Add to cart — $${total.toFixed(2)}`}
      </button>

      {/* B3/H — trust strip relocated to the moment of decision */}
      <TrustStripInline/>

      {/* B3/J — Reserve link only when stock is low or out */}
      {(isOut || isLow) && (
        <a href="#" style={{
          fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: PP.ink,
          textDecoration: 'underline', textUnderlineOffset: 4, textAlign: 'center',
          marginTop: -10,
        }}>Reserve a vial from the next lot</a>
      )}

      {/* Proudly Made in the USA chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, borderRadius: 2,
      }}>
        <svg width="28" height="18" viewBox="0 0 28 18">
          <rect width="28" height="18" fill="#FAF7F0"/>
          {[1,3,5,7,9,11,13,15,17].map((y, i) => <rect key={i} width="28" height="1" y={y} fill="#C83E4D"/>)}
          <rect width="11" height="9" fill="#1F1F1F"/>
        </svg>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
          }}>Proudly Made in the USA</div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 400,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: PP.inkMuted,
            marginTop: 3,
          }}>USA manufactured · Lab tested · Ships from [TKTK — confirm city, state]</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BuyBox });
