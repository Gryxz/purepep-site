"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchWcOrder, type WcOrderData } from "@/lib/wc-store-api";
import { identifyUserByEmail, trackPurchase } from "@/lib/analytics";

function minorFmt(cents: string | undefined, minorUnit = 2): string {
  const n = Number(cents ?? "0") / Math.pow(10, minorUnit);
  return n.toFixed(2);
}

function SkeletonRect({ w, h }: { w: string; h: string }) {
  return <div className="v3co-confirm-skel" style={{ width: w, height: h }} />;
}

function LoadingSkeleton() {
  return (
    <div className="v3-shop">
      <section className="v3co-page-strip">
        <div className="v3-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SkeletonRect w="120px" h="14px" />
          <SkeletonRect w="min(360px, 80%)" h="56px" />
          <SkeletonRect w="min(280px, 70%)" h="20px" />
        </div>
      </section>
      <div className="v3-container">
        <div className="v3co-confirm-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SkeletonRect w="100%" h="120px" />
            <SkeletonRect w="100%" h="120px" />
          </div>
          <SkeletonRect w="100%" h="300px" />
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="v3-shop">
      <section className="v3co-page-strip">
        <div className="v3-container">
          <p className="eyebrow">Order confirmation</p>
          <h1>Order not found.</h1>
          <p className="deck">
            We couldn&rsquo;t load your order details. Check your email for
            confirmation, or contact{" "}
            <a href="mailto:info@purepep.shop">info@purepep.shop</a>.
          </p>
        </div>
      </section>
      <div className="v3-container" style={{ padding: "40px 32px 96px" }}>
        <Link href="/shop" className="v3-pill v3-pill-primary">
          Back to shop <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmPage() {
  const [order, setOrder] = useState<WcOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const hasFiredPurchase = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key") ?? "";
    const id = Number(params.get("id") ?? "0");
    if (!key || !id || id <= 0) {
      setFetchError(true);
      setLoading(false);
      return;
    }
    fetchWcOrder(id, key).then((data) => {
      if (!data) {
        setFetchError(true);
      } else {
        setOrder(data);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!order || hasFiredPurchase.current) return;
    hasFiredPurchase.current = true;
    // Identify before capture so this and every subsequent event in the
    // session shares the `email:<billing_email>` distinct_id used by the
    // server-side WC mu-plugin webhook.
    const email = order.billing_address?.email ?? "";
    if (email) identifyUserByEmail(email);
    const mu = order.totals?.currency_minor_unit ?? 2;
    const total = Number(order.totals?.total_price ?? "0") / Math.pow(10, mu);
    trackPurchase(
      order.id,
      total,
      (order.items ?? []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        total:
          Number(item.totals?.line_total ?? "0") /
          Math.pow(10, item.totals?.currency_minor_unit ?? mu),
      })),
    );
  }, [order]);

  if (loading) return <LoadingSkeleton />;
  if (fetchError || !order) return <ErrorState />;

  const mu = order.totals?.currency_minor_unit ?? 2;
  const totalStr = minorFmt(order.totals?.total_price, mu);
  const isBacs = order.payment_method === "bacs";
  const paymentDetails = order.payment_result?.payment_details ?? [];

  const addr = order.shipping_address ?? order.billing_address ?? {};
  const addrLines = [
    [addr.first_name, addr.last_name].filter(Boolean).join(" "),
    addr.address_1,
    addr.address_2,
    [addr.city, addr.state, addr.postcode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean) as string[];

  const csvRows = [
    ["Item", "Qty", "Line total (USD)"].join(","),
    ...(order.items ?? []).map((item) =>
      [
        `"${item.name.replace(/"/g, '""')}"`,
        item.quantity,
        minorFmt(item.totals?.line_total, item.totals?.currency_minor_unit ?? mu),
      ].join(","),
    ),
    ["", "Order total", totalStr].join(","),
  ];

  function downloadCsv() {
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purepep-order-${order!.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="v3-shop">
      {/* ── Page header ── */}
      <section className="v3co-page-strip">
        <div className="v3-container">
          <div className="v3co-confirm-check" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12.5l5 5 9-9.5"
                stroke="var(--v3-accent-ink)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="eyebrow">Order confirmed</p>
          <h1>Order #{order.id}</h1>
          <p className="deck">
            Your order is confirmed. We&rsquo;ll email you when it ships.
          </p>
        </div>
      </section>

      <div className="v3-container">
        <div className="v3co-confirm-grid">
          {/* ── LEFT: items + address + BACS ── */}
          <div>
            {/* Items */}
            <section className="v3co-stage">
              <div className="v3co-stage-head">
                <span className="num">Items ordered</span>
                <span className="meta">
                  {order.items?.length ?? 0}{" "}
                  {(order.items?.length ?? 0) === 1 ? "line" : "lines"}
                </span>
              </div>
              {(order.items ?? []).map((item, idx) => (
                <article
                  key={idx}
                  className="v3co-item-card"
                  style={{ gridTemplateColumns: "1fr auto" }}
                >
                  <div className="v3co-item-mid">
                    <h3 className="name" style={{ fontSize: "17px", margin: "0 0 6px" }}>
                      {item.name}
                    </h3>
                    <span className="meta-row">Qty {item.quantity}</span>
                  </div>
                  <div className="v3co-item-right" style={{ minWidth: "auto" }}>
                    <div className="v3co-item-price">
                      ${minorFmt(item.totals?.line_total, item.totals?.currency_minor_unit ?? mu)}
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Shipping address */}
            <section className="v3co-stage">
              <div className="v3co-stage-head">
                <span className="num">Shipping to</span>
              </div>
              <div className="v3co-confirm-card">
                <div className="v3co-confirm-addr">
                  {addrLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* BACS bank transfer instructions */}
            {isBacs && (
              <section className="v3co-stage">
                <div className="v3co-stage-head">
                  <span className="num">Bank transfer</span>
                </div>
                <div className="v3co-confirm-card">
                  <div className="v3co-confirm-bacs">
                    <p className="bacs-title">Payment instructions</p>
                    <p className="bacs-note">
                      Please transfer the exact amount below, quoting your order
                      number as the payment reference.
                    </p>
                    {paymentDetails.length > 0 ? (
                      paymentDetails.map((detail, i) => (
                        <div key={i} className="v3co-confirm-bank-row">
                          <span className="v3co-confirm-bank-label">
                            {detail.key}
                          </span>
                          <span
                            dangerouslySetInnerHTML={{ __html: detail.value }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="v3co-confirm-bank-row">
                        <span className="v3co-confirm-bank-label">Reference</span>
                        <span>Order #{order.id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT: summary card + ETA + actions ── */}
          <div>
            <div className="v3co-summary-card">
              <p className="eyebrow">Order summary</p>
              <h2>Total</h2>
              <hr className="v3co-summary-rule" />
              {(order.items ?? []).map((item, idx) => (
                <div key={idx} className="v3co-summary-item">
                  <div className="v3co-summary-thumb" aria-hidden="true">
                    <svg viewBox="0 0 40 40" fill="none">
                      <rect
                        x="17" y="6" width="6" height="28" rx="3"
                        fill="var(--v3-accent)" opacity=".9"
                      />
                      <rect
                        x="8" y="14" width="24" height="6" rx="3"
                        fill="var(--v3-accent)" opacity=".4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="name">{item.name}</div>
                    <span className="qty">× {item.quantity}</span>
                  </div>
                  <div className="price">
                    $
                    {minorFmt(
                      item.totals?.line_total,
                      item.totals?.currency_minor_unit ?? mu,
                    )}
                  </div>
                </div>
              ))}
              <hr className="v3co-summary-rule heavy" />
              <div className="v3co-totals-final">
                <span className="lbl">Total</span>
                <span className="val">
                  ${totalStr}
                  <span className="currency">USD</span>
                </span>
              </div>
              <p className="v3co-confirm-payment-method">
                {order.payment_method_title}
              </p>
            </div>

            <div className="v3co-confirm-eta">
              <p className="eta-label">Shipping estimate</p>
              <p className="eta-value">Ships in 2 business days</p>
            </div>

            <div className="v3co-confirm-actions">
              <button
                type="button"
                onClick={downloadCsv}
                className="v3-pill v3-pill-ghost v3-pill-sm"
              >
                Download receipt (CSV)
              </button>
              <Link href="/shop" className="v3-pill v3-pill-primary v3-pill-sm">
                Back to shop <span className="arrow">→</span>
              </Link>
            </div>

            {/* Referral nudge — post-purchase highest-intent moment */}
            <div
              style={{
                marginTop: 20,
                border: "1.5px solid var(--pp-line)",
                background: "var(--pp-surface)",
                padding: "20px 20px 18px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "var(--pp-ink-muted)",
                  marginBottom: 8,
                }}
              >
                Researcher referral
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--pp-ink)",
                  marginBottom: 14,
                }}
              >
                Know a colleague who needs research peptides?{" "}
                <strong>Refer them and both of you save $25.</strong> No cap — every verified referral earns you store credit.
              </p>
              <Link
                href="/referral"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--pp-ink)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--pp-ink)",
                  paddingBottom: 1,
                }}
              >
                Get your referral link →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
