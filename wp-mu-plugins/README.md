# wp-mu-plugins

Server-side WordPress mu-plugins that need to live on the **WooCommerce
backend**, not the storefront.  These travel with the storefront repo for
versioning + review, but install onto the WC Cloudways app (the one whose
`public_html` contains `wp-config.php`), not the storefront app.

## cors-headless.php

CORS allowlist for the headless Next.js storefront calling `/wc/store/v1/*`
across origins.  Without this plugin, the browser blocks every preflight
because the WC server's default CORS handler stops echoing
`Access-Control-Allow-Origin` for cross-origin callers.

### Install

SFTP / SSH into the WC Cloudways app:

```
# Cloudways host: 134.209.168.98 (port 4200 SSH, port 22 SFTP)
# WC app: find via `ls /home/master/applications/` — the one whose
#         public_html contains wp-config.php (NOT tupbkzzpnc which is
#         the storefront).

cd /home/master/applications/<wc-app-id>/public_html
mkdir -p wp-content/mu-plugins
# Upload cors-headless.php to wp-content/mu-plugins/cors-headless.php
chmod 644 wp-content/mu-plugins/cors-headless.php
```

mu-plugins auto-load — no activation step.

### Verify

From the storefront origin (browser DevTools console on
`https://phpstack-1617574-6380918.cloudwaysapps.com`):

```js
// 1. CORS GET — should return 200 with the storefront origin echoed back.
const r = await fetch(
  'https://woocommerce-1617574-6376231.cloudwaysapps.com/wp-json/wc/store/v1/cart',
  { credentials: 'include' }
);
console.log(r.status, r.headers.get('Access-Control-Allow-Origin'),
            r.headers.get('Cart-Token'), r.headers.get('Nonce'));

// 2. CORS POST — should add a real line item to the WC cart.
const nonce = r.headers.get('Nonce');
const add = await fetch(
  'https://woocommerce-1617574-6376231.cloudwaysapps.com/wp-json/wc/store/v1/cart/add-item',
  {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Nonce': nonce,
    },
    body: JSON.stringify({ id: 14, quantity: 1 }),
  }
);
console.log(add.status, await add.json());
```

### Allowlist

Defaults:

- `https://phpstack-1617574-6380918.cloudwaysapps.com` (live storefront)
- `https://purepep.shop` + `https://www.purepep.shop` (production domain)
- `http://localhost:3000` / `:3001` (local dev)

To extend without editing the plugin, add a small companion mu-plugin that
filters `purepep_headless_cors_origins`.

### Scope

Only requests whose URI contains `/wc/store/v1` are touched.  `wp-admin`,
`wp-login`, REST `/wp/v2/*`, and the rest of WordPress remain on whatever
CORS policy WP defaults to.
