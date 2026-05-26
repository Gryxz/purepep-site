# BANKFUL_CHECKOUT_SPEC.md

PurePep checkout — Bankful high-risk merchant integration & underwriting spec

> **Audience:** senior full-stack engineer implementing in the existing Next.js App Router storefront.
> **Goal:** replace the cosmetic card fields with Bankful Hosted Fields, wire a real charge path, and clear Bankful high-risk underwriting on first submission.
> **Scope:** `/checkout` desktop (`src/components/v3/CheckoutPage.tsx`) + mobile (`src/components/v5/MobileCheckout.tsx`), the WC Store API checkout path (`src/lib/wc-store-api.ts`), the WP/WooCommerce backend, and the legal surfaces under `/legal/[slug]`.

---

## 0. CRITICAL ARCHITECTURE CONSTRAINT — read first

The task brief assumes a Next.js server-side API route at `/api/bankful-checkout`. **That route cannot exist as written today.** `next.config.ts` ships:

```ts
// next.config.ts (current)
const config: NextConfig = {
  reactStrictMode: true,
  output: "export",      // ← fully static export. No Node server, no API routes, no Route Handlers.
  trailingSlash: true,
  images: { unoptimized: true },
};
```

`output: "export"` produces a static SPA dropped onto a CDN. There is **no Next.js runtime** to host `app/api/**/route.ts`, no `cookies()`/`headers()`, no server actions. Every "backend" call today goes straight from the browser to the live WooCommerce REST/Store API. `BANKFUL_API_KEY` therefore **cannot** live in this codebase if we keep static export — there is no server to hold it.

You must pick ONE of two server homes for the secret-key charge call **before** writing any integration code. Both are valid; pick based on hosting:

| Option | Server home for `BANKFUL_API_KEY` | Code lives in | Next.js change | Underwriting impact |
| --- | --- | --- | --- | --- |
| **A — Node target (recommended)** | Next.js Route Handler `src/app/api/bankful-checkout/route.ts` | This repo | Drop `output: "export"`; deploy to a Node host (Vercel/Cloudways Node/Railway). `/checkout`, `/cart`, `/order-confirm` become server-rendered or `dynamic`. | None — clean, single codebase. |
| **B — WordPress proxy (lowest infra churn)** | WP REST endpoint `POST /wp-json/purepep/v1/bankful-checkout` in a new mu-plugin | `wp-mu-plugins/purepep-bankful.php` (sibling to existing `purepep-posthog-webhook.php`) | **Keep `output: "export"`.** Front-end calls the WP endpoint instead of a Next route. | None — WP is already the live dynamic backend. |

**This spec is written for Option A** (the canonical "Next.js API route" the brief describes), with Option-B equivalents called out inline. Wherever you see `/api/bankful-checkout`, under Option B substitute `${WP_BASE_URL}/wp-json/purepep/v1/bankful-checkout` and move the server logic into the mu-plugin verbatim (same request/response contract). **Do not** ship Bankful secret keys to the browser under either option.

> Note: `package.json` currently pins `next@^15.1.6` / `react@^19`. The brief says "Next 16 / React 19 (locked)". Treat the brief as the target; the integration is version-agnostic across 15→16. Confirm the actual version at implementation time.

---

## 1. Underwriting Checklist

Bankful's high-risk team manually loads the live site and walks the full purchase path. Each row below is something they verify, mapped to current code state and the exact change required. Status legend: **EXISTS** (present, acceptable) · **NEEDS UPDATE** (present but will fail or weaken review) · **MISSING** (absent, must add).

### 1.1 Legal / Compliance

| # | Underwriter check | Current state | Status | Required change |
| --- | --- | --- | --- | --- |
| L1 | "Research use only / not for human consumption" disclaimer visible at checkout | `compliance.researchUseOnly = "For research use only. Not for human consumption."` exists in `src/design-system/tokens.ts` but is **not rendered on /checkout**; the checkbox copy says "in vitro laboratory research" only | NEEDS UPDATE | Render the literal RUO token string as static text inside the Payment section, above Place order (see §3.1). |
| L2 | Age/eligibility attestation at point of sale (21+) | Checkbox present in both desktop (`v3chk-compliance`) and mobile (`mob-chk-compliance-box`): "qualified researcher aged 21+ … strictly for in vitro laboratory research … all sales are final" | EXISTS | Keep. Optionally surface the separate age-gate (`/age-gate`) state so underwriters see two-layer gating. |
| L3 | Refund / return policy reachable **during** checkout | Place-order note links only Terms of Sale + Privacy. `refund-policy` slug exists (`src/lib/wp-pages.ts` → `/legal/refund-policy`) but is **not linked at checkout** | MISSING | Add a Refund Policy link + one-line summary to the checkout (see §3.2). |
| L4 | Terms acceptance gated at the payment step | Place order disabled until `compliance` checkbox is checked; place-note states agreement to Terms + Privacy on submit | EXISTS | Keep; extend the note to also reference the Refund Policy (L3) and chargeback language (L10). |
| L5 | Chargeback / dispute language present | None anywhere on checkout | MISSING | Add a short "all sales final / contact us before disputing" line near Place order (see §3.6). |
| L6 | No product claims implying human consumption | PDP disclaimer token exists ("…not a capsule or oral supplement"); checkout copy is research-framed | EXISTS | Audit /shop + PDP copy for ingestion/dose/benefit language during the underwriting freeze. Checkout itself is clean. |
| L7 | Privacy Policy linked | `/legal/privacy-policy` linked in place-note | EXISTS | Keep. |
| L8 | Business identity / legal entity shown | "PurePep LLC" appears in Wire panel only | NEEDS UPDATE | Surface "PUREPEP LLC" + support contact in the checkout footer/descriptor notice (see §3.4) so it is visible on the card path, not just the wire tab. |

### 1.2 UI / UX & Trust

| # | Underwriter check | Current state | Status | Required change |
| --- | --- | --- | --- | --- |
| U1 | Card fields look real and functional (not placeholder) | Card fields are **cosmetic** — controlled React `<input>`s (`cardNum/cardName/cardExp/cardCvv`) that never transmit. Comment in source literally says "Card fields are UI-only — Bankful processing happens off-site." This is an **automatic decline** if seen. | NEEDS UPDATE | Replace with Bankful Hosted Fields iframes (see §2). Remove the cosmetic state + formatters. |
| U2 | Security indicators (SSL badge, lock, fraud) | Trust footer has SSL/Fraud/COA/Ship tiles; "Secure" lock in mobile header; "256-bit SSL encryption" note under card panel | EXISTS | Keep. Move the SSL/CVV notice adjacent to the live card fields (see §3.5). |
| U3 | Accepted-card marks shown | `PaymentLogos.tsx` (Visa/MC/Amex/Discover) used in footer; card panel shows inline "VISA / MC" chips | EXISTS | Keep; ensure the chips match the networks Bankful actually enables on the MID. |
| U4 | Contact info reachable at checkout | No support email/phone on the checkout page itself; errors point to `research@purepep.com` | MISSING | Add a visible "Questions? <support email>" line at checkout (see §3.3). |
| U5 | Consistent brand/domain | **Domain mismatch:** site is `purepep.shop`; crypto/wire fallbacks use `info@purepep.shop`; error/confirm copy uses `research@purepep.com`. Underwriters flag mismatched contact domains as fraud signal. | NEEDS UPDATE | Standardize on ONE support address on the live domain (recommend `support@purepep.shop`). Replace all `research@purepep.com` references (CheckoutPage.tsx L183, MobileCheckout.tsx L137, order-confirm L49/L51). |
| U6 | Total / amount clearly shown before pay | Order summary + "Your card will be charged $X" in place-note | EXISTS | Keep. |
| U7 | No "Coming soon" / broken payment options on the live card path | Crypto tab = "Coming soon"; Wire tab = `[Bank name pending]`, `[Routing pending]`, `[Account pending]` placeholders | NEEDS UPDATE | Underwriters dislike visible placeholders. Either fill real wire details or hide Crypto + Wire tabs for the underwriting review window so **Card is the only visible method** (see §3.7). |

### 1.3 Technical / Payments

| # | Underwriter check | Current state | Status | Required change |
| --- | --- | --- | --- | --- |
| T1 | Card data never touches merchant server (PCI SAQ-A) | Cosmetic inputs hold raw PAN/CVV in React state — technically the PAN sits in the browser DOM under merchant origin. | NEEDS UPDATE | Hosted Fields iframe the inputs under Bankful's origin; merchant never sees PAN/CVV. Achieves SAQ-A. (§2) |
| T2 | CVV verification enforced | Cosmetic CVV not validated/transmitted | NEEDS UPDATE | CVV becomes a Bankful hosted field; CVV result code returned on charge and surfaced (§2.5). |
| T3 | 3-D Secure / SCA path functional | None | MISSING | Implement 3DS challenge handling per Bankful SDK (§2.6). |
| T4 | AVS (address verification) sent | Billing address collected but only as shipping; no separate billing capture | NEEDS UPDATE | Pass billing address (name, address_1, city, state, postcode, country) to the tokenize/charge call for AVS (§2.3, §3.8). |
| T5 | Live charge path, not a stub | `placeWcOrder()` posts `payment_method: "bacs"` (manual bank transfer) for the card UI | NEEDS UPDATE | Card path → tokenize → server charge → WC order with `payment_method: "bankful"` (§2.4, §4). |
| T6 | Webhook / settlement reconciliation | None | MISSING | Bankful → WP webhook to mark order paid/failed (§4.4). |
| T7 | TLS on the live origin | Storefront + WC are HTTPS | EXISTS | Confirm valid cert + HSTS on `purepep.shop` at go-live. |

### 1.4 Descriptor / Account

| # | Underwriter check | Current state | Status | Required change |
| --- | --- | --- | --- | --- |
| D1 | Billing descriptor shown to customer matches MID descriptor | No descriptor shown | MISSING | Add "Your statement will show **PUREPEP** (or PUREPEP LLC / PUREPEP.SHOP)" at the card step (§3.4). |
| D2 | Descriptor ≤ 22 chars and recognizable | n/a | MISSING | Coordinate exact descriptor with Bankful underwriting; recommend `PUREPEP.SHOP` (12 chars) or `PUREPEP LLC` (11). Whatever is provisioned MUST be the exact string in the UI notice. |
| D3 | Support contact in descriptor soft-descriptor field | n/a | MISSING | Provide Bankful the support phone/URL for the soft descriptor; mirror it at checkout (D1 + U4). |
| D4 | Legal entity name consistent across site, WHOIS, bank | "PurePep LLC" in wire panel only | NEEDS UPDATE | Use the exact registered entity name everywhere (LLC suffix, casing) and match the bank account name. |

---

## 2. Hosted Fields Integration Plan

Replaces the cosmetic card inputs in the **Card** tab (`v3chk-pay-panel` desktop / `mob-chk-pay-panel` mobile) with Bankful's iframed Hosted Fields. Card data is entered inside Bankful-origin iframes; we receive only an opaque single-use token; the secret-keyed charge happens server-side.

> Bankful exposes a JS SDK (commonly `Bankful.js` / a hosted-fields bundle) plus a server charge API. Exact method names vary by Bankful account package — **confirm against the integration guide Bankful issues with your MID.** The names below (`Bankful.hostedFields(...)`, `.mount()`, `.tokenize()`) are the conventional shape; swap to the exact SDK symbols at implementation time. The *flow* is what underwriting evaluates and does not change.

### 2.1 Where the script loads

Load the SDK only on `/checkout`, not globally (keeps it off every page; avoids loading a PCI script site-wide). Because the card UI is a client component, mount it client-side with `next/script` inside the checkout page tree.

Create a small loader used by both desktop and mobile checkout:

```tsx
// src/components/checkout/BankfulScript.tsx
"use client";
import Script from "next/script";

export function BankfulScript({ onReady }: { onReady: () => void }) {
  return (
    <Script
      src={process.env.NEXT_PUBLIC_BANKFUL_SDK_URL!}  // e.g. https://js.bankful.com/v1/hosted-fields.js
      strategy="afterInteractive"
      onLoad={onReady}
      onError={() => console.error("[bankful] SDK failed to load")}
    />
  );
}
```

Render `<BankfulScript onReady={...} />` once inside `app/checkout/page.tsx` (it renders in both desktop and mobile branches — guard with a ref so the SDK initializes once). Do **not** put it in `app/layout.tsx`: a PCI/card SDK on every route is an unnecessary attack surface and slows the whole site.

> Static-export note (Option B): `next/script` still works under `output: "export"` (it's client-side). Only the *charge endpoint* needs a server; the SDK loader does not.

### 2.2 Mounting hosted fields into the card panel

Replace the four cosmetic `<input>`s in the Card panel with empty mount containers. The SDK injects iframes into these.

```tsx
// Inside the Card panel (replaces the <input> block in v3chk-pay-panel / mob-chk-pay-panel)
<Field label="Card number">
  <div id="bankful-card-number" className="v3chk-hf-field" />
</Field>
<Field label="Name on card">
  <input type="text" autoComplete="cc-name" value={cardName}
         onChange={(e) => setCardName(e.target.value)} />
  {/* cardholder name is NOT PCI-sensitive; can stay a normal input and be passed to tokenize */}
</Field>
<div className="v3chk-field-row">
  <Field label="Expiry"><div id="bankful-card-expiry" className="v3chk-hf-field" /></Field>
  <Field label="CVV" narrow><div id="bankful-card-cvv" className="v3chk-hf-field" /></Field>
</div>
```

Mount in a `useEffect` after the SDK signals ready:

```tsx
const hf = useRef<BankfulHostedFields | null>(null);
const [hfReady, setHfReady] = useState(false);
const [hfErrors, setHfErrors] = useState<Record<string, string>>({});

useEffect(() => {
  if (!sdkLoaded || hf.current) return;
  const instance = window.Bankful.hostedFields({
    publishableKey: process.env.NEXT_PUBLIC_BANKFUL_HOSTED_FIELDS_KEY!,
    environment: process.env.NEXT_PUBLIC_BANKFUL_ENV ?? "sandbox", // "sandbox" | "production"
    styles: {
      // style the *inside* of the iframe to match .v3chk-field inputs
      input: { "font-size": "15px", color: "#1a1a1a", "font-family": "Inter, sans-serif" },
      ":focus": { color: "#000" },
      ".invalid": { color: "var(--m-alert)" },
    },
    fields: {
      number: { selector: "#bankful-card-number", placeholder: "0000 0000 0000 0000" },
      expiry: { selector: "#bankful-card-expiry", placeholder: "MM / YY" },
      cvv:    { selector: "#bankful-card-cvv", placeholder: "•••" },
    },
  });
  instance.on("validityChange", (e) => {
    setHfErrors((prev) => ({ ...prev, [e.field]: e.valid ? "" : e.message }));
  });
  instance.on("ready", () => setHfReady(true));
  hf.current = instance;
  return () => { hf.current?.teardown?.(); hf.current = null; };
}, [sdkLoaded]);
```

Delete from both checkout components: `cardNum`, `cardExp`, `cardCvv` state, `formatCard`, `formatExpiry`. Keep `cardName` as a normal input (not PCI-scoped). The `v3chk-hf-field` / `mob-chk-hf-field` wrappers need fixed height + the same border/background as `.v3chk-field input` so the iframe visually matches (iframe content is styled via the SDK `styles` object above; the *frame box* is styled by our CSS).

### 2.3 Tokenize → charge flow (sequence)

```
Browser (Card panel)                 Next API route /api/bankful-checkout         Bankful API            WooCommerce Store API
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
1. user fills hosted fields
2. clicks "Place order"
3. hf.current.tokenize({           ── (stays in browser; PAN never leaves iframe)
     cardholderName, billing })
   → { token, last4, brand,
       cvvCheck, threeDS? }
4. POST /api/bankful-checkout  ───────►  validate body
   { token, amount, currency,           recompute amount from WC cart (do NOT
     email, billing, shipping,          trust client amount)
     cartToken }                        │
                                        ├─ POST Bankful /charges  ──────────────► authorize + capture
                                        │   { token, amount, descriptor,          ◄── { status, txnId,
                                        │     billing(AVS), cvv result,                avs, cvv, 3ds }
                                        │     orderRef }
                                        │
                                        │  if 3DS required → return challenge to browser (see §2.6)
                                        │
                                        ├─ on approved: POST WC /checkout ───────────────────────────────► create order
                                        │   { billing, shipping,                                            payment_method=bankful
                                        │     payment_method: "bankful",                                    set paid + txnId meta
                                        │     payment_data:[{key:bankful_txn,value:txnId},…] }              ◄── { order_id, order_key }
                                        │
                                        ◄─ { ok, order_id, order_key }
5. redirect to
   /order-confirm?id=&key=
```

Key rule: **the server recomputes the amount** from the authoritative WC cart (via `Cart-Token`) before charging. Never charge the amount the browser sends.

### 2.4 The `/api/bankful-checkout` route (Option A)

```ts
// src/app/api/bankful-checkout/route.ts   (requires removing output:"export")
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";        // secret key, never edge-leak
export const dynamic = "force-dynamic";

const BANKFUL_API = process.env.BANKFUL_API_BASE!;            // https://api.bankful.com/v1
const WC_STORE = process.env.NEXT_PUBLIC_WC_STORE_URL!;       // .../wc/store/v1

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, email, billing, shipping, cartToken, nonce } = body;

  if (!token || !cartToken) {
    return NextResponse.json({ ok: false, error: "missing_payment_token" }, { status: 400 });
  }

  // 1. Recompute authoritative total from the WC cart (server-trusted amount).
  const cartRes = await fetch(`${WC_STORE}/cart`, {
    headers: { "Cart-Token": cartToken, Accept: "application/json" },
  });
  if (!cartRes.ok) return NextResponse.json({ ok: false, error: "cart_unavailable" }, { status: 502 });
  const cart = await cartRes.json();
  const minorTotal = Number(cart?.totals?.total_price ?? "0");          // already in minor units
  const currency = cart?.totals?.currency_code ?? "USD";
  if (!Number.isFinite(minorTotal) || minorTotal <= 0) {
    return NextResponse.json({ ok: false, error: "empty_cart" }, { status: 400 });
  }

  // 2. Charge via Bankful (secret key, server only).
  const chargeRes = await fetch(`${BANKFUL_API}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BANKFUL_API_KEY!}`,
      "X-Merchant-Id": process.env.BANKFUL_MERCHANT_ID!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: token,
      amount: minorTotal,
      currency,
      capture: true,
      descriptor: process.env.BANKFUL_STATEMENT_DESCRIPTOR ?? "PUREPEP.SHOP",
      billing: {
        name: `${billing.first_name} ${billing.last_name}`,
        address_line1: billing.address_1,
        address_line2: billing.address_2,
        city: billing.city, state: billing.state,
        postal_code: billing.postcode, country: billing.country, email,
      },
    }),
  });
  const charge = await chargeRes.json();

  // 3. 3DS branch — bubble the challenge back to the browser.
  if (charge.status === "requires_action" && charge.three_ds) {
    return NextResponse.json({ ok: false, requiresAction: true, threeDS: charge.three_ds });
  }
  if (charge.status !== "approved" && charge.status !== "captured") {
    return NextResponse.json(
      { ok: false, error: mapDecline(charge.decline_code ?? charge.error_code) },
      { status: 402 },
    );
  }

  // 4. Create the WC order, marked paid, with the Bankful txn id attached.
  const wcRes = await fetch(`${WC_STORE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cart-Token": cartToken, Nonce: nonce, "X-WC-Store-API-Nonce": nonce },
    body: JSON.stringify({
      billing_address: { ...billing, email },
      shipping_address: { ...shipping, email },
      payment_method: "bankful",
      payment_data: [
        { key: "bankful_transaction_id", value: charge.id },
        { key: "bankful_auth_code", value: charge.auth_code ?? "" },
        { key: "bankful_avs", value: charge.avs_result ?? "" },
        { key: "bankful_cvv", value: charge.cvv_result ?? "" },
      ],
    }),
  });
  if (!wcRes.ok) {
    // Charge succeeded but order failed → must refund/void to avoid an orphan charge.
    await fetch(`${BANKFUL_API}/charges/${charge.id}/refund`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.BANKFUL_API_KEY!}`, "X-Merchant-Id": process.env.BANKFUL_MERCHANT_ID! },
    });
    return NextResponse.json({ ok: false, error: "order_create_failed_refunded" }, { status: 502 });
  }
  const order = await wcRes.json();
  return NextResponse.json({ ok: true, order_id: order.order_id, order_key: order.order_key });
}
```

> **Option B (static export kept):** move the entire `POST` body above into `wp-mu-plugins/purepep-bankful.php`, registered with `register_rest_route('purepep/v1','/bankful-checkout', ['methods'=>'POST', 'callback'=>'pp_bankful_checkout', 'permission_callback'=>'__return_true'])`. Read `BANKFUL_API_KEY` from a WP constant in `wp-config.php` (never the JS bundle). The browser fetches `${WP_BASE_URL}/wp-json/purepep/v1/bankful-checkout` instead of `/api/bankful-checkout`. Everything else (recompute amount, charge, create order, refund-on-failure) is identical.

### 2.5 Client call replacing `placeWcOrder('bacs')`

In `handlePlaceOrder` (both `CheckoutPage.tsx` and `MobileCheckout.tsx`), the card path no longer calls `placeWcOrder` directly. It tokenizes, then posts to our route:

```ts
async function handlePlaceOrder() {
  if (submitting || empty || !compliance) return;
  setSubmitting(true); setOrderError(null);

  if (payTab === "card") {
    if (!hfReady || !hf.current) { setOrderError("Card form still loading — try again."); setSubmitting(false); return; }
    let tok;
    try {
      tok = await hf.current.tokenize({ cardholderName: cardName, billingPostalCode: postcode });
    } catch (e) {
      setOrderError(mapTokenizeError(e)); setSubmitting(false); return;   // invalid card/expiry/cvv
    }

    const billing = { first_name: firstName, last_name: lastName, address_1: address1, address_2: address2, city, state: stateField, postcode, country };
    const res = await fetch(`${process.env.NEXT_PUBLIC_BANKFUL_CHECKOUT_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: tok.token, email, billing, shipping: billing,
        cartToken: await getCartToken(), nonce: await getNonce(),
      }),
    }).then((r) => r.json()).catch(() => null);

    if (res?.requiresAction) { await handle3DS(res.threeDS, /* retry */); return; }      // §2.6
    if (!res?.ok) { setOrderError(declineMessage(res?.error)); setSubmitting(false); return; }

    clearCart();
    window.location.href = `/order-confirm/?key=${encodeURIComponent(res.order_key ?? "")}&id=${res.order_id}`;
    return;
  }

  // wire path (if kept) → existing placeWcOrder("bacs") flow unchanged
}
```

`NEXT_PUBLIC_BANKFUL_CHECKOUT_ENDPOINT` = `/api/bankful-checkout` (Option A) or the full WP URL (Option B). Expose `getCartToken`/`getNonce` — they are already exported from `src/lib/wc-store-api.ts`.

### 2.6 3-D Secure / redirect handling

Two SDK shapes exist; support whichever Bankful provisions:

- **Embedded challenge (preferred):** `res.threeDS` contains an ACS challenge. Call `hf.current.handleAction(res.threeDS)`; the SDK renders the bank's challenge iframe/modal, resolves to an updated token/auth, then you re-POST to `/api/bankful-checkout` with `{ token: updated, threeDSAuth }`. The server completes the charge.
- **Full redirect:** server returns `{ requiresAction: true, redirectUrl }`. Persist `cartToken` (already in localStorage) and `window.location.href = redirectUrl`. Bankful redirects back to `/checkout?bankful_3ds=complete&ref=...`; on mount, detect the param and call a `/api/bankful-checkout?finalize=ref` step to capture + create the order, then redirect to `/order-confirm`.

Always show a "Verifying with your bank…" state during the challenge so the user doesn't double-submit.

### 2.7 Decline-code → user message mapping

Server maps Bankful codes to a stable internal set; the client renders friendly copy. Never show raw processor codes.

```ts
// server: mapDecline(code) → internal key
const DECLINE_MAP: Record<string, string> = {
  insufficient_funds: "card_declined_funds",
  do_not_honor:       "card_declined_generic",
  expired_card:       "card_expired",
  incorrect_cvc:      "card_cvv",
  invalid_number:     "card_number",
  card_not_supported: "card_unsupported",
  fraud_suspected:    "card_declined_generic",
  processing_error:   "processor_error",
  avs_mismatch:       "card_avs",
};
// client: declineMessage(key)
const MESSAGES: Record<string, string> = {
  card_declined_funds:   "Your card was declined for insufficient funds. Try another card.",
  card_declined_generic: "Your card was declined. Please try another card or contact your bank.",
  card_expired:          "That card has expired. Please use a different card.",
  card_cvv:              "The security code (CVV) didn't match. Re-enter it and try again.",
  card_number:           "That card number looks invalid. Please check and re-enter it.",
  card_unsupported:      "We can't accept that card type. Try Visa or Mastercard.",
  card_avs:              "Your billing address didn't match your card. Check the address and retry.",
  processor_error:       "Payment couldn't be processed right now. Please try again in a moment.",
  __default:             "We couldn't process your payment. Please try again or email support@purepep.shop.",
};
```

---

## 3. Compliance Layer — exact copy & placement

All strings below are the literal copy to ship. Place in BOTH `CheckoutPage.tsx` (desktop) and `MobileCheckout.tsx` (mobile) unless noted. Reuse the existing class system (`v3chk-*` desktop, `mob-chk-*` mobile).

### 3.1 Research-use disclaimer (L1)

**Placement:** inside the Payment section (`Section num="04"`), directly under the card panel, above Place order. Source it from the existing token so it stays single-fenced.

```tsx
import { compliance } from "@design/tokens";
// …
<p className="v3chk-ruo-notice">
  {compliance.researchUseOnly}{" "}
  These products are sold strictly as laboratory reference materials and are
  not intended to diagnose, treat, cure, or prevent any disease.
</p>
```

Renders: *"For research use only. Not for human consumption. These products are sold strictly as laboratory reference materials and are not intended to diagnose, treat, cure, or prevent any disease."*

### 3.2 Refund policy reference (L3)

**Placement:** in the place-order note block (`v3chk-place-note` / `mob-chk-place-note`), and as a one-line summary near the order total.

```tsx
<p className="v3chk-refund-note">
  All sales are final. Unopened, undamaged vials may be eligible for return
  within 14 days under our{" "}
  <a href="/legal/refund-policy">Refund &amp; Return Policy</a>. Damaged or
  incorrect shipments are replaced or refunded — contact us within 48 hours.
</p>
```

(`/legal/refund-policy` already resolves via the POLICY_SLUGS allowlist.)

### 3.3 Contact info at checkout (U4)

**Placement:** checkout footer/trust row, persistent across all payment tabs.

```tsx
<p className="v3chk-support-line">
  Questions about your order? Email{" "}
  <a href="mailto:support@purepep.shop">support@purepep.shop</a>
  {" · "}Mon–Fri 9am–5pm CT.
</p>
```

### 3.4 Descriptor notice (D1)

**Placement:** directly under the live card fields, next to the SSL note.

```tsx
<p className="v3chk-descriptor-note">
  Your card statement will show <strong>PUREPEP.SHOP</strong>. PurePep LLC,
  United States.
</p>
```

> Replace `PUREPEP.SHOP` with the **exact** descriptor Bankful provisions on the MID (≤22 chars). The on-screen string must be byte-identical to the descriptor or it counts as a mismatch (D2).

### 3.5 CVV / security notice (T2, U2)

**Placement:** replaces the existing `v3chk-bankful-note` / `mob-chk-card-foot` "256-bit SSL encryption" line, beside the CVV field.

```tsx
<p className="v3chk-security-note">
  <LockIcon /> Card details are encrypted and entered directly with our
  payment processor (Bankful) over a secure connection — PurePep never
  sees or stores your card number or CVV. The 3-digit CVV is verified with
  your bank at checkout.
</p>
```

### 3.6 Chargeback / dispute language (L5)

**Placement:** in the place-order note, after the refund line.

```tsx
<p className="v3chk-dispute-note">
  If there's any issue with your order, please contact us at
  support@purepep.shop before filing a dispute — we resolve order problems
  quickly. By placing this order you authorize PurePep LLC to charge your
  card for the amount shown.
</p>
```

### 3.7 Hide non-functional methods for review (U7)

For the underwriting window, render only the **Card** tab. Gate Crypto/Wire behind a flag so they can be restored later:

```tsx
const SHOW_CRYPTO = process.env.NEXT_PUBLIC_SHOW_CRYPTO === "true"; // default false
const SHOW_WIRE   = process.env.NEXT_PUBLIC_SHOW_WIRE === "true";   // default false
// render the Crypto / Wire <PayTabBtn> and panels only when these are true
```

This removes the `[Bank name pending]` / "Coming soon" placeholders from the underwriter's view without deleting the code.

### 3.8 Billing address for AVS (T4)

The current form collects one address used as both billing and shipping. For AVS, that address is passed as `billing` to tokenize + charge (already in §2.5). If a "billing same as shipping" toggle is later added, the unchecked state must collect a separate billing address and pass it to `tokenize()`.

### 3.9 Consolidated place-order note (final composed block)

```tsx
<div className="v3chk-place-note">
  By placing your order you agree to PurePep's{" "}
  <a href="/legal/terms-of-service">Terms of Sale</a>,{" "}
  <a href="/legal/refund-policy">Refund &amp; Return Policy</a>, and{" "}
  <a href="/legal/privacy-policy">Privacy Policy</a>. All sales are final
  except as stated in the Refund Policy. Your card will be charged{" "}
  <span className="v3chk-place-charge">${total.toFixed(2)}</span> and your
  statement will show <strong>PUREPEP.SHOP</strong>.
</div>
```

---

## 4. WooCommerce Backend Changes

The Store API `/checkout` will receive `payment_method: "bankful"`. WooCommerce only accepts a `payment_method` that maps to an **enabled gateway**, and only routes `payment_data` to a gateway that registers for the Store API. Today only `bacs` is enabled (hence the current code). Changes:

### 4.1 Register a Bankful gateway in WooCommerce

You need a gateway with id `bankful` so `payment_method: "bankful"` is valid. Options:

- **If Bankful ships an official WooCommerce plugin:** install + activate it; set MID/keys in its settings; confirm its gateway id (it may not literally be `bankful` — match the client `payment_method` string to whatever id it registers).
- **If not (custom):** add a thin custom gateway in `wp-mu-plugins/purepep-bankful.php`:
  - `class WC_Gateway_Bankful extends WC_Payment_Gateway` with `$this->id = 'bankful'`, `$this->has_fields = false` (fields are hosted client-side).
  - Register it for the Store API via `Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType` so Store API `/checkout` accepts the method and passes `payment_data` to `process_payment()`.
  - In `process_payment()` (or in the mu-plugin proxy under Option B), mark the order paid using the `bankful_transaction_id` from `payment_data`: `$order->payment_complete($txn_id);` and persist AVS/CVV/auth meta.
  - Add it to the enabled gateways list (`woocommerce_payment_gateways` filter) and enable in **WooCommerce → Settings → Payments**.

### 4.2 Prevent BACS-style auto-cancel / on-hold

`bacs` orders go **on-hold** (awaiting manual transfer) and are subject to the **Hold Stock** auto-cancel timer (WooCommerce → Settings → Products → Inventory → "Hold stock (minutes)", default 60). A Bankful card order is **paid immediately**, so:

- Ensure the Bankful gateway calls `payment_complete()` → order status becomes **processing** (or **completed** for virtual/no-ship). Paid orders are exempt from the unpaid hold-stock cancel.
- Confirm no "Cancel unpaid orders" / Automatic cancellation plugin will touch `processing` orders (it should not — those rules target `pending`/`on-hold`).
- Keep `bacs` enabled ONLY if the Wire tab ships (U7). If Wire is hidden for review, you may leave `bacs` enabled in WP but unused; it won't be selectable from the UI.

### 4.3 Order metadata & admin display

- Store `bankful_transaction_id`, `bankful_auth_code`, `bankful_avs`, `bankful_cvv` as order meta (from §2.4). Surface them in the WP order admin (add a meta box or use `woocommerce_admin_order_data_after_billing_address`) so support can reconcile and respond to disputes (chargeback evidence).
- Set the order's `payment_method_title` to "Card (Bankful)" so `/order-confirm` (`order.payment_method_title`, already rendered) and WP admin both read clearly.
- `/order-confirm/page.tsx` keys BACS-only instructions off `order.payment_method === "bacs"`. A `bankful` order will (correctly) skip the bank-transfer block and show the normal paid confirmation — no change needed, but verify the `payment_method_title` reads well.

### 4.4 Settlement webhook (T6)

Register `POST /wp-json/purepep/v1/bankful-webhook` in the mu-plugin. Bankful posts charge lifecycle events (captured, refunded, chargeback, dispute). Verify the webhook signature (`BANKFUL_WEBHOOK_SECRET`), then update the matching order by `bankful_transaction_id` (mark refunded, flag disputed, etc.). This is also where chargeback notifications land for ops.

### 4.5 CORS

Browser → WP Store API already works (existing `cors-headless.php` mu-plugin). If Option B is used, the new `purepep/v1/bankful-checkout` route must be allowed by the same CORS config for the storefront origin. The Bankful SDK iframe is same-origin to Bankful, so no CORS needed there.

---

## 5. Environment Variables

| Var | Scope | Example / format | Description |
| --- | --- | --- | --- |
| `BANKFUL_API_KEY` | **Server only** | `sk_live_…` / `sk_test_…` | Secret key for the server-side charge/refund API. NEVER `NEXT_PUBLIC_`. Lives in the Node runtime (Option A) or `wp-config.php` constant (Option B). |
| `BANKFUL_MERCHANT_ID` | **Server only** | `mid_…` / numeric | Bankful MID sent on charge requests (`X-Merchant-Id`). |
| `BANKFUL_API_BASE` | **Server only** | `https://api.bankful.com/v1` | Base URL for the charge/refund REST API. Sandbox vs production swap. |
| `BANKFUL_WEBHOOK_SECRET` | **Server only** | `whsec_…` | HMAC secret to verify inbound settlement/chargeback webhooks. |
| `BANKFUL_STATEMENT_DESCRIPTOR` | **Server only** | `PUREPEP.SHOP` | Exact billing descriptor (≤22 chars) sent on charge; must match the on-screen notice (§3.4) and the MID config. |
| `NEXT_PUBLIC_BANKFUL_HOSTED_FIELDS_KEY` | Public (browser) | `pk_live_…` / `pk_test_…` | Publishable/tokenization key for Hosted Fields. Safe to ship to the browser by design — it can only tokenize, not charge. |
| `NEXT_PUBLIC_BANKFUL_SDK_URL` | Public | `https://js.bankful.com/v1/hosted-fields.js` | URL of the Bankful JS SDK loaded by `<BankfulScript>`. |
| `NEXT_PUBLIC_BANKFUL_ENV` | Public | `sandbox` \| `production` | Selects sandbox vs live behavior in the SDK init. |
| `NEXT_PUBLIC_BANKFUL_CHECKOUT_ENDPOINT` | Public | `/api/bankful-checkout` (A) or `https://…/wp-json/purepep/v1/bankful-checkout` (B) | Where the client POSTs the token + order data. |
| `NEXT_PUBLIC_SHOW_CRYPTO` | Public | `false` | Feature flag — hide the Crypto tab during underwriting (§3.7). |
| `NEXT_PUBLIC_SHOW_WIRE` | Public | `false` | Feature flag — hide the Wire tab during underwriting (§3.7). |

Existing (unchanged): `WC_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `NEXT_PUBLIC_WC_STORE_URL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDEXING_ENABLED`.

Add the new vars to `.env.local.example` (with placeholder values, never real keys — `.gitignore` already excludes `.env*` except `.env.example`).

**Rule:** anything that can authorize money (`sk_…`, MID, webhook secret) is server-only. The publishable key + SDK URL are the only Bankful values allowed in the client bundle.

---

## 6. Test Plan

Bankful issues sandbox credentials and test PANs. Exact numbers come from the Bankful sandbox docs; the table uses the **industry-standard test PANs** Bankful's gateway almost certainly honors (they mirror the common processor set). **Confirm against Bankful's sandbox sheet** before relying on a specific decline trigger.

### 6.1 Card scenarios

| Scenario | Test PAN (verify w/ Bankful) | Exp / CVV | Expected result | How to verify |
| --- | --- | --- | --- | --- |
| Approved Visa | `4111 1111 1111 1111` | any future / `123` | Charge approved → WC order `processing` → redirect to `/order-confirm` | Order shows in WP admin paid; `bankful_transaction_id` meta set; PostHog `purchase` fires. |
| Approved Mastercard | `5555 5555 5555 4444` | future / `123` | Approved | Same as above. |
| Insufficient funds | (Bankful decline PAN) | future / `123` | Decline → "insufficient funds" message; NO order created | Friendly message shown; WP has no new order; no orphan charge in Bankful dashboard. |
| Generic decline (do-not-honor) | (Bankful decline PAN) | future / `123` | "Card was declined" message | As above. |
| Expired card | valid PAN | **past** exp | Tokenize/charge rejects → "card has expired" | Hosted field flags invalid or server returns `card_expired`. |
| Incorrect CVV | valid PAN | future / `999` (CVV-fail trigger) | "security code didn't match" | `cvv_result` non-match; declined; no order. |
| AVS mismatch | valid PAN | mismatched ZIP | "billing address didn't match" | `avs_result` mismatch handled. |
| 3DS challenge required | (Bankful 3DS PAN) | future / `123` | Challenge modal/redirect → complete → approved | "Verifying with your bank…" shown; completes; order created. |
| 3DS failed/abandoned | (Bankful 3DS-fail PAN) | future / `123` | No charge, no order, user can retry | No orphan auth in dashboard. |
| Unsupported card type | Amex/Discover if not enabled on MID | — | "can't accept that card type" | Matches enabled networks (U3). |

### 6.2 Flow / compliance checks underwriters perform

- [ ] Card fields are real iframes (inspect DOM: `iframe` under `#bankful-card-number`, cross-origin to Bankful) — not text inputs.
- [ ] Cannot place order without checking the research-use/21+ box (button disabled).
- [ ] RUO disclaimer + refund link + support email + descriptor notice all visible on the card tab without scrolling off-page.
- [ ] "Charge will appear as PUREPEP.SHOP" matches the descriptor on the actual sandbox charge.
- [ ] Total charged == total shown (server recompute prevents tampering — test by editing the client request amount; charge still uses cart total).
- [ ] No "Coming soon" / `[pending]` placeholders visible (Crypto/Wire hidden via flags).
- [ ] HTTPS + valid cert on the live domain; no mixed content on /checkout.
- [ ] Decline shows a friendly message and lets the user retry without losing the cart.

### 6.3 Regression

- [ ] Cart token persists across the charge call (cart not emptied until success).
- [ ] On charge-success-but-order-fail, the auto-refund fires (no orphan charge).
- [ ] `/order-confirm` renders correctly for a `bankful` order (skips BACS block, shows paid summary + `payment_method_title`).
- [ ] Wire path (if re-enabled) still works via `placeWcOrder("bacs")`.

---

## 7. Go-Live Checklist (ordered)

1. **Decide architecture** — Option A (drop `output: "export"`, deploy Node) or Option B (WP mu-plugin proxy). Record the decision; everything downstream depends on it.
2. **Get Bankful credentials** — sandbox + production: secret key, publishable/hosted-fields key, MID, SDK URL, API base, webhook secret, sandbox test-card sheet. Confirm the provisioned **statement descriptor** (≤22 chars).
3. **Scaffold env vars** — add all of §5 to `.env.local.example`; set sandbox values in the deploy environment (Node env or `wp-config.php`). Verify no secret key is in any `NEXT_PUBLIC_` slot.
4. **WooCommerce gateway** — install/activate the Bankful WC plugin OR build the custom `bankful` gateway + Store API integration (§4.1); enable it in WP Payments. Confirm `payment_method: "bankful"` is accepted by Store API `/checkout`.
5. **Backend proxy** — implement `/api/bankful-checkout` (A) or `purepep/v1/bankful-checkout` (B): recompute amount, charge, create WC order, refund-on-failure (§2.4). Add the settlement webhook (§4.4).
6. **Hosted Fields front-end** — add `<BankfulScript>`, replace cosmetic card inputs with mount containers, wire tokenize → proxy → confirm in both `CheckoutPage.tsx` and `MobileCheckout.tsx`; remove `cardNum/cardExp/cardCvv` state + formatters (§2.2, §2.5). Implement 3DS handling (§2.6) and decline mapping (§2.7).
7. **Compliance copy** — ship all §3 strings (RUO disclaimer, refund link, support email, descriptor notice, CVV/security note, chargeback line, consolidated place-note). Standardize the support email to `support@purepep.shop` and remove every `research@purepep.com` reference (CheckoutPage.tsx, MobileCheckout.tsx, order-confirm).
8. **Hide unfinished methods** — set `NEXT_PUBLIC_SHOW_CRYPTO=false`, `NEXT_PUBLIC_SHOW_WIRE=false` (or fill real wire details) so no placeholders show (§3.7, U7).
9. **Legal pages** — confirm `/legal/refund-policy`, `/legal/terms-of-service`, `/legal/privacy-policy`, `/legal/shipping-policy` are published in WP with real content (they're in POLICY_SLUGS); refund policy must state the return window + chargeback-contact-first language referenced at checkout.
10. **Descriptor consistency** — entity name "PurePep LLC", domain `purepep.shop`, descriptor `PUREPEP.SHOP`, and support email all consistent across site, WHOIS, and the bank account name (D4).
11. **Sandbox test pass** — run every §6.1 + §6.2 + §6.3 scenario in sandbox; capture screenshots/recording of an approved card flow + a decline + a 3DS challenge for the submission packet.
12. **Production keys + smoke test** — flip env to production keys, set `NEXT_PUBLIC_BANKFUL_ENV=production`; run ONE real low-value card order end-to-end; confirm it settles in the Bankful dashboard with the correct descriptor; refund it.
13. **TLS/security verification** — valid cert + HSTS on `purepep.shop`; no mixed content on /checkout; PCI SAQ-A holds (no PAN/CVV in merchant DOM/logs).
14. **Underwriting submission** — give Bankful the live URL, a walkthrough of the card flow, the legal page links, the descriptor, and the §6.2 checklist evidence. Keep Crypto/Wire hidden until approval; re-enable post-approval if desired.

---

## Appendix A — File-change map

| File | Change |
| --- | --- |
| `next.config.ts` | **Option A only:** remove `output: "export"` (and reassess `trailingSlash`, `images.unoptimized`); deploy to Node. Option B: unchanged. |
| `src/app/api/bankful-checkout/route.ts` | **New (Option A).** Server charge proxy (§2.4). |
| `wp-mu-plugins/purepep-bankful.php` | **New (Option B, or always for the WC gateway + webhook).** Charge proxy / gateway / webhook (§4). |
| `src/components/checkout/BankfulScript.tsx` | **New.** SDK loader (§2.1). |
| `src/components/v3/CheckoutPage.tsx` | Replace cosmetic card inputs with HF mounts; remove `cardNum/cardExp/cardCvv` + formatters; new `handlePlaceOrder` card branch; add §3 copy; fix support email; flag-gate Crypto/Wire. |
| `src/components/v5/MobileCheckout.tsx` | Same as above for mobile (`mob-chk-*` classes). |
| `src/app/checkout/page.tsx` | Render `<BankfulScript>` once; pass SDK-ready signal to both checkout variants. |
| `src/lib/wc-store-api.ts` | No change to `placeWcOrder` (wire path keeps it); ensure `getCartToken`/`getNonce` exported (they are). |
| `src/app/globals.css` | Add `.v3chk-hf-field` / `.mob-chk-hf-field` (iframe frame box), `.v3chk-ruo-notice`, `.v3chk-refund-note`, `.v3chk-support-line`, `.v3chk-descriptor-note`, `.v3chk-security-note`, `.v3chk-dispute-note` styles. |
| `src/app/order-confirm/page.tsx` | Replace `research@purepep.com` with `support@purepep.shop`; verify `bankful` order renders. |
| `.env.local.example` | Add all §5 vars with placeholders. |
| WordPress admin | Enable Bankful gateway; verify hold-stock won't cancel paid orders; add order-meta admin display. |

## Appendix B — Known inconsistencies to fix during this work (caught in current code)

- **Support email split:** `info@purepep.shop` (crypto/wire) vs `research@purepep.com` (errors/confirm). `.com` ≠ live domain `.shop` — a fraud signal for underwriters. Standardize on `support@purepep.shop`.
- **Cosmetic card comment in source** (`CheckoutPage.tsx` ~L95, `MobileCheckout.tsx` header) explicitly states card processing is off-site — remove once real HF is wired so the codebase matches the live claim.
- **`payment_method: "bacs"` hardcoded** in both `handlePlaceOrder`s for the card UI — this is the literal line the integration replaces for the card path.
- **Wire panel placeholders** `[Bank name pending]` / `[Routing pending]` / `[Account pending]` — must be filled or hidden before review.
