# PurePep Affiliate

Custom WordPress plugin that powers the PurePep referral / affiliate program for the WooCommerce storefront. Backend only — the Next.js storefront in `src/` consumes the REST API documented in [API.md](./API.md).

## What it does

- One permanent referral code per WooCommerce customer. Regenerating replaces the active code; the old code is marked inactive but historical attributions stay intact (commissions reference the immutable `code_id`).
- Attribution at checkout follows priority order: **submitted field** > **`pp_ref` cookie**. Self-referral (buyer == affiliate) is blocked.
- The cookie is set on landing pages via `?ref=CODE` (30-day default, last-touch wins).
- Invalid codes at checkout never block the order — a soft notice is shown and the cookie is used as fallback if present.
- 20% commission on the **line-item subtotal** (excludes shipping, tax, and fees).
- Commission lifecycle: `pending` on `processing` → `approved` on `completed` → `reversed` on `refunded` or `cancelled`.
- Manual payouts: affiliates can request a payout when the claimable balance ≥ `$90` (configurable). Admin marks paid or rejects via the WordPress admin.

## Requirements

- WordPress 6.4+
- WooCommerce 8+ (HPOS compatible)
- PHP 8.1+

## Install / Activate

1. Copy this folder to `wp-content/plugins/purepep-affiliate/`.
2. Run `composer install --no-dev` inside the plugin folder (optional — a PSR-4 fallback autoloader is bundled).
3. In the WP admin, go to **Plugins** and activate **PurePep Affiliate**.

On activation, the plugin runs `dbDelta()` to create three tables:

- `wp_purepep_aff_codes`
- `wp_purepep_aff_commissions`
- `wp_purepep_aff_payouts`

The schema version is stamped in `wp_options` as `pp_aff_db_version` so future migrations can run idempotently.

Default options are seeded (only if missing):

| Option | Default | Notes |
|---|---|---|
| `pp_aff_enabled` | `1` | Master kill switch |
| `pp_aff_min_payout_cents` | `9000` | $90 minimum payout |
| `pp_aff_cookie_days` | `30` | `pp_ref` cookie window |
| `pp_aff_commission_bps` | `2000` | 20% (basis points; not exposed in v1 UI) |

## Settings (Affiliates → Settings)

1. **Plugin enabled** — master toggle; disabling stops attribution and admin pages.
2. **Minimum payout (USD)** — entered in dollars, stored as cents.
3. **Attribution cookie window (days)** — between 1 and 365.

## Admin walkthrough

1. **Affiliates** (Affiliates → Affiliates): paginated list of every customer who has generated a code, with active code, attributed-order count, lifetime gross, pending/claimable balance, and lifetime paid. Search by email, username, display name, or code.
2. **Commissions** (Affiliates → Commissions): filterable by status / user / order. Each row links back to the WooCommerce order.
3. **Payouts** (Affiliates → Payouts): inline **Mark paid** and **Reject** forms on each `requested` row. Both submit to `admin-post.php` with a per-payout nonce. Reject requires a non-empty admin note.
4. **Settings** (Affiliates → Settings): as listed above. Uses the WordPress Settings API.

## REST API

See [API.md](./API.md) for the full reference, cookie protocol, checkout-field contract, and error catalogue. Base URL: `/wp-json/purepep-affiliate/v1`.

## Where future hooks would go (not wired in v1)

- **Email notifications**: `woocommerce_order_status_processing` and `pp_aff_payout_marked_paid` are the natural extension points. v1 ships without SMTP wiring.
- **Webhook out**: a `pp_aff_commission_status_changed` `do_action` could be added in `CommissionsRepository::approve()` / `reverse()`.

## Out of scope for v1

- Multi-tier referrals (affiliate-of-affiliate)
- Click and impression tracking / analytics
- Fraud detection
- Automated payouts and payment processor integration (PayPal, Wise, ACH, etc.)
- Tax form collection (W-9, 1099)
- Multi-currency commissions (currency column exists for forward compat, but USD-only logic today)
- Affiliate signup flow — **every WooCommerce customer is automatically an affiliate** the moment they generate a code via `POST /me/code/regenerate`
- Partial refunds — v1 only handles full order refund / cancellation; partial refunds do not adjust commission
- Email notifications

## Uninstall

Removing the plugin via **Plugins → Delete** triggers `uninstall.php`, which drops the three custom tables and deletes the seeded `pp_aff_*` options.
