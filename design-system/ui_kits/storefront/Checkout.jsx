/* global React, PP, Eyebrow, Icon, VialRender, Checkbox, TrustStrip, RemoveLink, CheckGlyph */
const { useState } = React;

function Input({ label, placeholder, colSpan = 1, type = 'text', value, onChange, error }) {
  const borderColor = error ? PP.alert : PP.ink;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: `span ${colSpan}` }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: PP.ink,
      }}>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        aria-invalid={!!error}
        style={{
          height: 48, padding: '0 14px',
          border: `${PP.BW} solid ${borderColor}`, background: PP.bone,
          fontFamily: 'Inter', fontSize: 15, color: PP.ink,
          borderRadius: 2, outline: 'none',
        }}
      />
      {error && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.alert,
          marginTop: 2,
        }}>{error}</span>
      )}
    </label>
  );
}

function OrderConfirmedHeader() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      padding: '10px 16px',
      border: `${PP.BW} solid ${PP.emerald}`, background: PP.bone,
    }}>
      <CheckGlyph color={PP.emerald} size={16}/>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase', color: PP.emerald,
      }}>Order confirmed</span>
    </div>
  );
}

function CheckoutPage() {
  const [items, setItems] = useState([
    { id: 1, compound: 'RETA', dose: '10 mg', cas: '2381089-83-2', qty: 2, price: 189.00 },
    { id: 2, compound: 'SEMA', dose: '5 mg',  cas: '910463-68-2',  qty: 1, price: 149.00 },
  ]);
  const [promo, setPromo] = useState('');
  const [ack, setAck] = useState(false);

  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const shipping = 18.00;
  const tax = Math.round(subtotal * 0.0625 * 100) / 100;
  const total = subtotal + shipping + tax;

  const setQty = (id, qty) => setItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x));
  const remove = (id) => setItems(prev => prev.filter(x => x.id !== id));

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 96px' }}>
      <Eyebrow>Checkout · Step 1 of 2</Eyebrow>
      <h1 style={{
        fontFamily: 'Inter', fontWeight: 900,
        fontSize: 'clamp(40px, 5vw, 64px)',
        letterSpacing: '-0.035em', lineHeight: 1,
        color: PP.ink, marginTop: 14, marginBottom: 48,
      }}>Your order</h1>

      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 56,
      }} className="co-grid">
        <div>
          {/* Line items */}
          <section>
            <div style={{ marginBottom: 14 }}><Eyebrow>In your cart</Eyebrow></div>
            <div style={{
              border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
            }}>
              {items.map((it, i) => (
                <div key={it.id} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 20,
                  padding: '20px 24px', alignItems: 'center',
                  borderBottom: i === items.length - 1 ? 'none' : `${PP.BW} solid ${PP.line}`,
                }}>
                  <div style={{
                    width: 80, height: 80, border: `${PP.BW} solid ${PP.ink}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: PP.bone,
                  }}>
                    <VialRender label={it.compound} dose={it.dose} w={42} h={60}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: PP.ink, letterSpacing: '-0.01em' }}>{it.compound} · {it.dose}</div>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                      letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 5,
                    }}>CAS {it.cas}</div>
                    <div style={{ marginTop: 10 }}>
                      <RemoveLink onClick={() => remove(it.id)}/>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    border: `${PP.BW} solid ${PP.ink}`, height: 36, borderRadius: 2,
                  }}>
                    <button onClick={() => setQty(it.id, it.qty - 1)} style={coQtyBtn} aria-label="Decrease">−</button>
                    <span style={{
                      minWidth: 34, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 13, fontWeight: 600, color: PP.ink,
                      borderLeft: `${PP.BW} solid ${PP.ink}`, borderRight: `${PP.BW} solid ${PP.ink}`,
                      alignSelf: 'stretch', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.qty + 1)} style={coQtyBtn} aria-label="Increase">+</button>
                  </div>
                  <div style={{
                    fontFamily: 'Inter', fontWeight: 700, fontSize: 17, color: PP.ink,
                    fontVariantNumeric: 'tabular-nums', minWidth: 90, textAlign: 'right',
                  }}>${(it.qty * it.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping address */}
          <section style={{ marginTop: 56 }}>
            <div style={{ marginBottom: 14 }}><Eyebrow>Ship to</Eyebrow></div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
            }}>
              <Input label="Full name" placeholder="Principal investigator" colSpan={2}/>
              <Input label="Institution / Lab" placeholder="Research group" colSpan={2}/>
              <Input label="Email" placeholder="you@lab.edu" type="email" error="Email is required"/>
              <Input label="Phone" placeholder="(555) 123-4567"/>
              <Input label="Street address" placeholder="123 Research Drive" colSpan={2}/>
              <Input label="City" placeholder="City"/>
              <Input label="State" placeholder="State"/>
              <Input label="ZIP / Postal code" placeholder="94103"/>
              <Input label="Country" placeholder="United States"/>
            </div>
          </section>

          {/* Payment placeholder */}
          <section style={{ marginTop: 56 }}>
            <div style={{ marginBottom: 14 }}><Eyebrow>Payment</Eyebrow></div>
            <div style={{
              border: `${PP.BW} solid ${PP.ink}`, background: PP.bone, padding: '28px 28px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <Icon name="shield" size={22} color={PP.ink}/>
              <div>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: PP.ink, letterSpacing: '-0.005em' }}>Payment processing handled at next step</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: PP.inkMuted,
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
                }}>Secure transport layer · Card details never touch our servers</div>
              </div>
            </div>
          </section>

          {/* Acknowledgement */}
          <section style={{ marginTop: 56 }}>
            <div style={{ marginBottom: 14 }}><Eyebrow>Acknowledgement</Eyebrow></div>
            <Checkbox
              checked={ack} onChange={setAck}
              label="I am a 21+ qualified researcher, acquiring this material for in-vitro research use only, and acknowledge that all sales are final."
            />
          </section>
        </div>

        {/* Order summary */}
        <aside>
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{
              background: PP.boneSoft, border: `${PP.BW} solid ${PP.ink}`, padding: 28,
            }}>
              <Eyebrow>Order summary</Eyebrow>
              <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
                <Row label={`Subtotal · ${items.reduce((s, i) => s + i.qty, 0)} items`} value={`$${subtotal.toFixed(2)}`}/>
                <Row label="Shipping · 2-day cold-chain" value={`$${shipping.toFixed(2)}`}/>
                <Row label="Tax (est.)" value={`$${tax.toFixed(2)}`}/>
              </div>

              <div style={{
                marginTop: 20, display: 'flex', gap: 8,
              }}>
                <input
                  placeholder="Promo code"
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                  style={{
                    flex: 1, height: 40, padding: '0 12px',
                    border: `${PP.BW} solid ${PP.ink}`, background: PP.bone,
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: PP.ink, borderRadius: 2,
                  }}
                />
                <button style={{
                  height: 40, padding: '0 18px',
                  background: PP.bone, color: PP.ink,
                  border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
                  fontFamily: 'Inter', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                }}>Apply</button>
              </div>

              <div style={{ height: PP.BW, background: PP.ink, margin: '24px 0' }}/>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 20,
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.18em', textTransform: 'uppercase', color: PP.ink,
                }}>Total</span>
                <span style={{
                  fontFamily: 'Inter', fontWeight: 900, fontSize: 36, letterSpacing: '-0.025em',
                  color: PP.ink, fontVariantNumeric: 'tabular-nums',
                }}>${total.toFixed(2)}</span>
              </div>

              <button disabled={!ack} style={{
                width: '100%', height: 56,
                background: !ack ? PP.line : PP.ink,
                color: !ack ? PP.inkMuted : PP.bone,
                border: `${PP.BW} solid ${PP.ink}`, borderRadius: 2,
                fontFamily: 'Inter', fontWeight: 700, fontSize: 14,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                cursor: !ack ? 'not-allowed' : 'pointer',
              }}>Place order →</button>

              <div style={{
                marginTop: 14, textAlign: 'center',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: PP.inkMuted,
              }}>For research use only · All sales final</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: 'Inter', fontSize: 14, color: PP.ink,
      }}>{label}</span>
      <span style={{
        fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: PP.ink,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
    </div>
  );
}

const coQtyBtn = {
  width: 32, height: 34, background: 'transparent', border: 'none',
  color: PP.ink, fontSize: 16, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
};

Object.assign(window, { CheckoutPage, OrderConfirmedHeader });
