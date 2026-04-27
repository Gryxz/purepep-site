/* global React, PP, Icon, Eyebrow, VialRender, RemoveLink, CheckGlyph */
const { useState } = React;

function CartDrawer({ open, onClose, items = [], onQty, onRemove }) {
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <>
      {/* scrim */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(31,31,31,0.40)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 220ms',
        zIndex: 90,
      }}/>
      {/* drawer */}
      <aside aria-hidden={!open} style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(480px, 100vw)',
        background: PP.bone,
        borderLeft: `${PP.BW} solid ${PP.ink}`,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 240ms cubic-bezier(0.2,0.6,0.2,1)',
        zIndex: 100, display: 'flex', flexDirection: 'column',
      }}>
        <header style={{
          padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `${PP.BW} solid ${PP.ink}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="cart" size={18}/>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
            }}>Cart · {String(items.length).padStart(2, '0')} items</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: PP.ink, padding: 4,
          }}><Icon name="close" size={20}/></button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {items.length === 0 && (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: PP.ink, marginBottom: 6 }}>Cart is empty</div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: PP.inkMuted,
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>Add a vial to get started</div>
            </div>
          )}
          {items.map((it, i) => (
            <div key={it.id} style={{
              display: 'grid', gridTemplateColumns: '68px 1fr auto', gap: 16,
              padding: '20px 0',
              borderBottom: i === items.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
              alignItems: 'center',
            }}>
              <div style={{
                width: 68, height: 68, border: `${PP.BW} solid ${PP.ink}`,
                background: PP.bone, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <VialRender label={it.compound} dose={it.dose} w={34} h={52}/>
              </div>
              <div>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: PP.ink, letterSpacing: '-0.01em' }}>{it.compound} · {it.dose}</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
                }}>CAS {it.cas}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => onQty(it.id, Math.max(1, it.qty - 1))} style={qtyBtn} aria-label="Decrease">−</button>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: PP.ink, minWidth: 24, textAlign: 'center',
                  }}>{it.qty}</span>
                  <button onClick={() => onQty(it.id, it.qty + 1)} style={qtyBtn} aria-label="Increase">+</button>
                  <span style={{ marginLeft: 'auto' }}>
                    <RemoveLink onClick={() => onRemove(it.id)}/>
                  </span>
                </div>
              </div>
              <div style={{
                fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: PP.ink,
                fontVariantNumeric: 'tabular-nums',
              }}>${(it.qty * it.price).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `${PP.BW} solid ${PP.ink}`, padding: '20px 24px 28px', background: PP.boneSoft }}>
          {items.length > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 14,
            }}>
              <CheckGlyph color={PP.emerald} size={12}/>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.emerald,
              }}>All items in stock</span>
            </div>
          )}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 4,
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.inkMuted,
            }}>Subtotal</span>
            <span style={{
              fontFamily: 'Inter', fontWeight: 900, fontSize: 28, color: PP.ink,
              letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
            }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
            marginBottom: 18,
          }}>All sales final · Taxes + shipping at checkout</div>
          <button disabled={items.length === 0} style={{
            width: '100%', height: 52,
            background: items.length === 0 ? PP.line : PP.ink,
            color: items.length === 0 ? PP.inkMuted : PP.bone,
            border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
            fontFamily: 'Inter', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
          }}>Proceed to checkout</button>
        </div>
      </aside>
    </>
  );
}

const qtyBtn = {
  width: 26, height: 26, borderRadius: 2,
  border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, color: PP.ink,
  cursor: 'pointer', fontSize: 14, display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
};

Object.assign(window, { CartDrawer });
