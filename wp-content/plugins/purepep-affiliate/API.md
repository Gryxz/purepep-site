# PurePep Affiliate REST API

Base URL: `/wp-json/purepep-affiliate/v1`

All responses are JSON. Errors use the WordPress REST shape:

```json
{ "code": "pp_aff_*", "message": "Human readable", "data": { "status": 422 } }
```

HTTP status codes used: 200, 201, 204, 400, 401, 403, 404, 422, 429, 500.

## Authentication

| Audience | Mechanism |
|---|---|
| Same-origin (Next.js storefront / WP admin) | WordPress login cookie + `X-WP-Nonce: <wp_rest>` header on state-changing requests |
| Server-to-server | [WordPress application passwords](https://wordpress.org/documentation/article/application-passwords/) — HTTP Basic auth |
| Public endpoints | None (rate-limited) |

State-changing endpoints under `/me/*` and `/admin/*` require a valid `wp_rest` nonce **unless** the request is authenticated via application passwords (Basic auth).

Admin endpoints additionally require the `manage_woocommerce` capability.

---

## Endpoints

### Affiliate (logged-in customer)

#### `GET /me`

Auth: logged-in customer.

Returns the caller's active referral code (if any) and aggregate stats.

Response 200:

```json
{
  "code": {
    "value": "K7M2X9PQ",
    "status": "active",
    "created_at": "2026-05-10 14:23:11"
  },
  "stats": {
    "attributed_orders_count": 14,
    "gross_referred_revenue_cents": 184250,
    "pending_balance_cents": 8400,
    "approved_balance_cents": 22500,
    "lifetime_paid_cents": 13500,
    "currency": "USD"
  }
}
```

If the user has never generated a code, `code` is `null`.

Errors: `pp_aff_auth_required` (401).

curl:

```bash
curl -b cookies.txt -H "X-WP-Nonce: $NONCE" \
  https://example.com/wp-json/purepep-affiliate/v1/me
```

---

#### `POST /me/code/regenerate`

Auth: logged-in customer + nonce/app-password.
Rate limit: 5 per user per hour.

Generates a new active referral code. The previous active code (if any) is marked `inactive`. Historical attributions remain intact because commissions reference the immutable `code_id`, not the string.

Body: none.

Response 200:

```json
{ "code": { "value": "TZ4QW82M", "status": "active", "created_at": "2026-05-12 18:00:01" } }
```

Errors:

- `pp_aff_auth_required` (401)
- `pp_aff_invalid_nonce` (403) — cookie auth without valid `X-WP-Nonce`
- `pp_aff_rate_limited` (429)
- `pp_aff_regen_failed` (500)

curl:

```bash
curl -X POST -b cookies.txt -H "X-WP-Nonce: $NONCE" \
  https://example.com/wp-json/purepep-affiliate/v1/me/code/regenerate
```

---

#### `GET /me/commissions`

Auth: logged-in customer.

Query params:

- `status` — optional, one of `pending`, `approved`, `reversed`
- `limit` — integer, default 25, max 100
- `offset` — integer, default 0

Response 200:

```json
{
  "items": [
    {
      "id": 412,
      "order_id": 9911,
      "source": "field",
      "subtotal_basis_cents": 12500,
      "commission_cents": 2500,
      "currency": "USD",
      "status": "approved",
      "created_at": "2026-05-09 11:21:55",
      "approved_at": "2026-05-10 09:00:00",
      "reversed_at": null,
      "reversed_reason": null
    }
  ],
  "total": 14,
  "limit": 25,
  "offset": 0
}
```

Errors: `pp_aff_auth_required` (401).

---

#### `GET /me/payouts`

Auth: logged-in customer.

Returns the caller's payout requests, newest first.

Query params: `limit` (default 25, max 100), `offset` (default 0).

Response 200:

```json
{
  "items": [
    {
      "id": 7,
      "amount_cents": 9000,
      "currency": "USD",
      "status": "paid",
      "requested_at": "2026-04-21 16:00:00",
      "paid_at": "2026-04-23 12:34:00",
      "admin_note": "Sent via PayPal."
    }
  ],
  "total": 3,
  "limit": 25,
  "offset": 0
}
```

Errors: `pp_aff_auth_required` (401).

---

#### `POST /me/payouts`

Auth: logged-in customer + nonce/app-password.

Body:

- `amount_cents` — optional integer. If omitted, the full claimable balance is requested.

Validation:

- `amount_cents` must be `<=` the user's claimable balance (approved sum minus already-requested/paid).
- `amount_cents` must be `>=` `pp_aff_min_payout_cents` (default 9000 = $90).

Response 201:

```json
{
  "id": 12,
  "amount_cents": 22500,
  "currency": "USD",
  "status": "requested",
  "requested_at": "2026-05-12 18:05:30",
  "paid_at": null,
  "admin_note": null
}
```

Errors:

- `pp_aff_auth_required` (401)
- `pp_aff_invalid_nonce` (403)
- `pp_aff_invalid_amount` (422) — non-positive integer supplied
- `pp_aff_no_balance` (422) — no claimable balance
- `pp_aff_amount_exceeds_balance` (422) — `data.available_cents` echoed
- `pp_aff_below_threshold` (422) — `data.threshold_cents` echoed

curl:

```bash
curl -X POST -b cookies.txt -H "X-WP-Nonce: $NONCE" \
  -H "Content-Type: application/json" \
  -d '{"amount_cents":9000}' \
  https://example.com/wp-json/purepep-affiliate/v1/me/payouts
```

---

### Public

#### `GET /validate`

Auth: none.
Rate limit: 30 per IP per minute.

Query params:

- `code` — required string (will be uppercased server-side; must match `[A-Z0-9]{8}`).

Response 200 (valid):

```json
{ "valid": true, "owner_display_name": "Jane Doe" }
```

Response 200 (invalid or malformed):

```json
{ "valid": false }
```

> **Anti-enumeration**: this endpoint discloses validity by design (so the storefront can confirm a code at landing or checkout). The 30/min/IP throttle is the only abuse brake. Don't expose this endpoint behind a permissive cache.

Errors: `pp_aff_rate_limited` (429).

curl:

```bash
curl 'https://example.com/wp-json/purepep-affiliate/v1/validate?code=K7M2X9PQ'
```

---

#### `POST /track`

Auth: none.

Body:

- `code` — string. Optional / ignored on malformed input.

Always returns **HTTP 204** with no body, regardless of code validity. This prevents enumeration: callers cannot distinguish valid from invalid codes from this endpoint.

If the code is valid and active, the server sets the `pp_ref` cookie (see [Cookie Protocol](#cookie-protocol)).

curl:

```bash
curl -X POST -c cookies.txt -H "Content-Type: application/json" \
  -d '{"code":"K7M2X9PQ"}' \
  https://example.com/wp-json/purepep-affiliate/v1/track
```

---

### Admin (capability: `manage_woocommerce`)

All admin endpoints require the `manage_woocommerce` capability AND, on state-changing routes (POST), a valid `X-WP-Nonce` (or application-password auth).

#### `GET /admin/payouts`

Query params: `status` (`requested|paid|rejected`, optional), `limit` (default 25, max 100), `offset` (default 0).

Response 200: `{ "items": [...], "total": N, "limit": L, "offset": O }` — each item: `id`, `user_id`, `amount_cents`, `currency`, `status`, `requested_at`, `paid_at`, `admin_note`, `admin_user_id`.

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403).

#### `POST /admin/payouts/{id}/mark-paid`

Body: `admin_note` (optional string, max 2000 chars).

Marks a `requested` payout as `paid`. No-op for any other state.

Response 200: `{ "ok": true, "id": 12 }`.

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403), `pp_aff_invalid_nonce` (403), `pp_aff_not_found` (404), `pp_aff_invalid_state` (422), `pp_aff_update_failed` (500).

#### `POST /admin/payouts/{id}/reject`

Body: `admin_note` (required, non-empty string, max 2000 chars).

Response 200: `{ "ok": true, "id": 12 }`.

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403), `pp_aff_invalid_nonce` (403), `pp_aff_note_required` (422), `pp_aff_not_found` (404), `pp_aff_invalid_state` (422).

#### `GET /admin/commissions`

Query params: `status` (`pending|approved|reversed`), `user_id`, `order_id`, `limit` (default 25, max 100), `offset` (default 0).

Response 200: `{ "items": [...], "total": N, "limit": L, "offset": O }`.

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403).

#### `POST /admin/commissions/{id}/reverse`

Body:

- `reason` — required string, max 255 chars.

Response 200: `{ "ok": true, "id": 412 }`.

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403), `pp_aff_invalid_nonce` (403), `pp_aff_reason_required` (422), `pp_aff_not_found` (404), `pp_aff_invalid_state` (422).

#### `GET /admin/affiliates`

Auth: `manage_woocommerce`.

Query params: `search` (matches user email/login/display name or referral code), `limit` (default 25, max 100), `offset` (default 0).

Errors: `pp_aff_auth_required` (401), `pp_aff_forbidden` (403).

Response 200:

```json
{
  "items": [
    {
      "user_id": 42,
      "display_name": "Jane Doe",
      "email": "jane@example.com",
      "attributed_orders_count": 14,
      "gross_referred_revenue_cents": 184250,
      "pending_balance_cents": 8400,
      "approved_balance_cents": 22500,
      "lifetime_paid_cents": 13500
    }
  ],
  "total": 87,
  "limit": 25,
  "offset": 0
}
```

---

## Cookie Protocol

| Property | Value |
|---|---|
| Name | `pp_ref` |
| Value | 8-char uppercase alphanumeric matching `[A-Z0-9]{8}` (excluding `0OI1` server-side at generation time) |
| Path | `/` |
| Expiry | `pp_aff_cookie_days` option (default 30 days) |
| `SameSite` | `Lax` |
| `Secure` | true when the request is HTTPS |
| `HttpOnly` | **false** (so analytics JS can read it) |

Last-touch wins: any newer valid landing (`?ref=CODE` or `POST /track`) overwrites the previous cookie. Invalid codes never set or clear the cookie.

A headless storefront that doesn't want to round-trip to `POST /track` can set the same cookie client-side with these exact attributes.

---

## Checkout Field

For headless checkouts replicating the WooCommerce checkout submission:

| Property | Value |
|---|---|
| Field name | `pp_aff_code` |
| Max length | 8 |
| Pattern | `[A-Z0-9]{8}` |
| Required | No |
| Placeholder | `Got a referral code?` |
| Display | `text-transform: uppercase` (case-insensitive submission accepted; normalized server-side) |

If the submitted value is non-empty but does not match an active code, WooCommerce displays a soft **`notice`** (not an `error`) via `wc_add_notice`:

> "That code wasn't recognized."

The order proceeds regardless. The server then falls back to the `pp_ref` cookie when attributing the order.

Attribution priority: submitted field (if valid) > `pp_ref` cookie (if valid). Self-referral (buyer == affiliate) is blocked.

---

## Errors

Every `code` value the API may return:

| Code | Status | Meaning |
|---|---|---|
| `pp_aff_auth_required` | 401 | The endpoint requires login and no authenticated user was found |
| `pp_aff_forbidden` | 403 | Authenticated but missing `manage_woocommerce` capability |
| `pp_aff_invalid_nonce` | 403 | Cookie-auth state-changing request without a valid `wp_rest` nonce |
| `pp_aff_rate_limited` | 429 | Per-IP or per-user rate limit exceeded |
| `pp_aff_regen_failed` | 500 | Server failed to generate a unique code after retries |
| `pp_aff_no_balance` | 422 | Payout requested with no claimable balance |
| `pp_aff_amount_exceeds_balance` | 422 | Requested amount > claimable balance; `data.available_cents` provided |
| `pp_aff_below_threshold` | 422 | Requested amount < minimum payout; `data.threshold_cents` provided |
| `pp_aff_invalid_amount` | 422 | Non-positive `amount_cents` supplied |
| `pp_aff_note_required` | 422 | Reject requires `admin_note`; reverse-commission requires `reason` |
| `pp_aff_reason_required` | 422 | Same as above for `reverse_commission` |
| `pp_aff_not_found` | 404 | Payout or commission id does not exist |
| `pp_aff_invalid_state` | 422 | The target row is not in a state that allows the requested transition |
| `pp_aff_update_failed` | 500 | The state transition was attempted but the DB write returned 0 affected rows |
