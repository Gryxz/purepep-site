/* global React, PP */
const { useState, useEffect, useRef } = React;

// B6/M — StickyBuyBar
// Slim ink bar pinned to bottom once user scrolls past the BuyBox.
// Slides in from bottom (no fade, no bounce). Hides when footer enters viewport.
// Hidden on mobile by default — mobile gets a separate sticky pattern.
function StickyBuyBar({
  compound = 'RETA',
  dose = '10 mg',
  price = '$189.00',
  onAddToCart,
  variants = ['5 mg', '10 mg'],
  activeVariant = '10 mg',
  triggerSelector = '[data-sticky-trigger]',
  footerSelector = 'footer',
}) {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState(activeVariant);
  const barRef = useRef(null);

  useEffect(() => {
    const trigger = document.querySelector(triggerSelector);
    const footer = document.querySelector(footerSelector);
    if (!trigger) return;

    let triggerPassed = false;
    let footerVisible = false;
    const recompute = () => setVisible(triggerPassed && !footerVisible);

    const triggerObserver = new IntersectionObserver(
      ([entry]) => { triggerPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0; recompute(); },
      { threshold: 0 }
    );
    triggerObserver.observe(trigger);

    let footerObserver;
    if (footer) {
      footerObserver = new IntersectionObserver(
        ([entry]) => { footerVisible = entry.isIntersecting; recompute(); },
        { threshold: 0 }
      );
      footerObserver.observe(footer);
    }
    return () => {
      triggerObserver.disconnect();
      if (footerObserver) footerObserver.disconnect();
    };
  }, [triggerSelector, footerSelector]);

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      className="sticky-buy-bar"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 55,
        background: PP.ink, color: PP.bone,
        borderTop: `${PP.BW} solid ${PP.ink}`,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 200ms linear',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '14px 24px',
        display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) auto auto auto',
        alignItems: 'center', gap: 28,
      }} className="sticky-buy-bar-inner">
        {/* Compound name + dose */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Inter', fontWeight: 600, fontSize: 15,
            letterSpacing: '-0.005em', color: PP.bone,
          }}>{compound} · {dose} lyophilized</span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(250,247,240,0.65)',
          }}>Research use only</span>
        </div>

        {/* Price */}
        <div style={{
          fontFamily: 'Inter', fontWeight: 900, fontSize: 22,
          letterSpacing: '-0.02em', color: PP.bone,
          fontVariantNumeric: 'tabular-nums',
        }}>{price}</div>

        {/* Dose variant pills — 2 tiny inverse pills */}
        <div style={{ display: 'flex', gap: '-1.5px' }}>
          {variants.map(v => {
            const active = v === variant;
            return (
              <button key={v} onClick={() => setVariant(v)} style={{
                padding: '8px 14px',
                background: active ? PP.bone : 'transparent',
                color: active ? PP.ink : PP.bone,
                border: `${PP.BW} solid ${PP.bone}`,
                fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.02em',
                cursor: 'pointer', borderRadius: 2,
              }}>{v}</button>
            );
          })}
        </div>

        {/* CTA — ink fill on bone bg reversal */}
        <button onClick={() => onAddToCart && onAddToCart(1)} style={{
          padding: '0 22px', height: 44,
          background: PP.bone, color: PP.ink,
          border: `${PP.BW} solid ${PP.bone}`, borderRadius: 2,
          fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Add to cart →
        </button>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .sticky-buy-bar { display: none; }
        }
        @media (max-width: 960px) {
          .sticky-buy-bar-inner {
            grid-template-columns: 1fr auto auto !important;
            gap: 16px !important;
          }
          .sticky-buy-bar-inner > div:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { StickyBuyBar });
