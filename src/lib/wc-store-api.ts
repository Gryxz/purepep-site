/**
 * WooCommerce Store API v1 — CLIENT-SIDE.
 *
 * Two pieces of state bind a request to the right anonymous cart:
 *
 *   1. `Cart-Token` — opaque session token returned by the WC server on
 *      every response.  Persisted in localStorage so the cart survives
 *      page reloads and tab restarts.  Sent on every request (GET + POST).
 *   2. `Nonce` / `X-WC-Store-API-Nonce` — short-lived (~12 h) CSRF token
 *      returned in response headers.  Sent on every POST.  Some WC builds
 *      read the canonical `X-WC-Store-API-Nonce`, others read the shorter
 *      `Nonce`; we send both — they're identical.
 *
 * Plus `credentials: "include"` so the WP session cookie tags along on
 * browsers that allow it (older WC builds fall back to it when the
 * Cart-Token can't be matched).
 *
 * On a 401 we treat the cached nonce as stale, refresh it (Cart-Token is
 * preserved so the cart's items aren't lost), and retry the request once.
 *
 * Public surface:
 *   getNonce, getCartToken, getWcCart,
 *   addToWcCart, updateWcCartItem, removeWcCartItem,
 *   placeWcOrder
 *
 * All helpers swallow upstream errors and return `null` so callers can keep
 * the optimistic Zustand state as the source of truth.
 */

const STORE_URL = (
  process.env.NEXT_PUBLIC_WC_STORE_URL ??
  "https://woocommerce-1617574-6376231.cloudwaysapps.com/wp-json/wc/store/v1"
).replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "purepep-wc-cart-token";

// ---------------------------------------------------------------------------
// Shared types — only the fields we actually consume
// ---------------------------------------------------------------------------

export interface WcCartItem {
  key: string;
  id: number;
  quantity: number;
  name?: string;
}

export interface WcCart {
  items: WcCartItem[];
  items_count?: number;
  totals?: {
    total_price?: string;
    currency_code?: string;
  };
}

export interface WcAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface WcCheckoutPayload {
  billing_address: WcAddress;
  shipping_address: WcAddress;
  payment_method: string;
}

export interface WcOrderResult {
  order_id: number;
  payment_url?: string;
}

// ---------------------------------------------------------------------------
// Session state — nonce (per-page in-memory) + Cart-Token (localStorage).
// ---------------------------------------------------------------------------

let cachedNonce: string | null = null;
let cachedCartToken: string | null = null;
let tokenHydrated = false;
let bootstrapInflight: Promise<void> | null = null;

function getCachedToken(): string | null {
  if (!tokenHydrated) {
    tokenHydrated = true;
    if (typeof window !== "undefined") {
      try {
        cachedCartToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      } catch {
        // localStorage unavailable (Safari private mode, etc.) — fall back
        // to in-memory only; cart is per-tab in that case.
      }
    }
  }
  return cachedCartToken;
}

function persistCartToken(token: string): void {
  cachedCartToken = token;
  tokenHydrated = true;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // localStorage unavailable — token still cached in memory.
  }
}

function readNonceFromHeaders(headers: Headers): string | null {
  return headers.get("Nonce") ?? headers.get("X-WC-Store-API-Nonce");
}

function readCartTokenFromHeaders(headers: Headers): string | null {
  return headers.get("Cart-Token");
}

/**
 * Capture the nonce + cart-token returned on any successful WC response.
 * Called from both bootstrap and authedFetch so caches stay fresh.
 */
function captureSession(headers: Headers): void {
  const n = readNonceFromHeaders(headers);
  if (n) cachedNonce = n;
  const t = readCartTokenFromHeaders(headers);
  if (t) persistCartToken(t);
}

/**
 * Bootstrap the session by calling GET /cart.  Captures both the nonce and
 * the cart-token from the response.  Concurrent callers share the same
 * in-flight promise so we never fire two parallel bootstraps.
 *
 * If we already have a cart-token cached we send it on the bootstrap GET so
 * the server returns the existing cart (rather than creating a fresh one).
 */
async function bootstrapSession(): Promise<void> {
  if (bootstrapInflight) return bootstrapInflight;
  bootstrapInflight = (async () => {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      const existing = getCachedToken();
      if (existing) headers["Cart-Token"] = existing;
      const res = await fetch(`${STORE_URL}/cart`, {
        method: "GET",
        credentials: "include",
        headers,
      });
      if (res.ok) {
        captureSession(res.headers);
      }
    } catch {
      // swallow — caller falls back to optimistic Zustand state
    } finally {
      bootstrapInflight = null;
    }
  })();
  return bootstrapInflight;
}

export async function getNonce(): Promise<string | null> {
  if (cachedNonce) return cachedNonce;
  await bootstrapSession();
  return cachedNonce;
}

export async function getCartToken(): Promise<string | null> {
  if (getCachedToken()) return cachedCartToken;
  await bootstrapSession();
  return cachedCartToken;
}

async function authedFetch(
  path: string,
  init: RequestInit & { method: "GET" | "POST" },
  attempt = 0,
): Promise<Response | null> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Accept", "application/json");

  // Cart-Token on every request — binds us to the right anonymous cart.
  // GET /cart bootstraps it on first use; subsequent calls echo it back.
  const token = await getCartToken();
  if (token) headers.set("Cart-Token", token);

  if (init.method === "POST") {
    headers.set("Content-Type", "application/json");
    const nonce = await getNonce();
    if (nonce) {
      // Send both header names — different WC builds read one or the other.
      headers.set("Nonce", nonce);
      headers.set("X-WC-Store-API-Nonce", nonce);
    }
  }

  try {
    const res = await fetch(`${STORE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    captureSession(res.headers);

    // 401 → almost always a stale nonce (~12 h expiry).  Refresh and retry
    // once.  We deliberately do NOT clear cachedCartToken — the cart's items
    // belong to that token; clearing would create a fresh empty cart.
    if (res.status === 401 && attempt === 0) {
      cachedNonce = null;
      await bootstrapSession();
      return authedFetch(path, init, 1);
    }

    return res;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cart operations
// ---------------------------------------------------------------------------

export async function getWcCart(): Promise<WcCart | null> {
  try {
    const res = await authedFetch("/cart", { method: "GET" });
    if (!res || !res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    return data as WcCart;
  } catch {
    return null;
  }
}

export async function addToWcCart(
  wcId: number | undefined,
  qty: number,
): Promise<WcCartItem | null> {
  if (typeof wcId !== "number" || wcId <= 0 || qty <= 0) return null;
  try {
    const res = await authedFetch("/cart/add-item", {
      method: "POST",
      body: JSON.stringify({ id: wcId, quantity: qty }),
    });
    if (!res || !res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    if ("key" in data && typeof (data as { key: unknown }).key === "string") {
      return data as WcCartItem;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateWcCartItem(
  key: string,
  qty: number,
): Promise<WcCartItem | null> {
  if (!key) return null;
  try {
    const res = await authedFetch("/cart/update-item", {
      method: "POST",
      body: JSON.stringify({ key, quantity: qty }),
    });
    if (!res || !res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    return data as WcCartItem;
  } catch {
    return null;
  }
}

export async function removeWcCartItem(key: string): Promise<boolean> {
  if (!key) return false;
  try {
    const res = await authedFetch("/cart/remove-item", {
      method: "POST",
      body: JSON.stringify({ key }),
    });
    return Boolean(res && res.ok);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export async function placeWcOrder(
  payload: WcCheckoutPayload,
): Promise<WcOrderResult | null> {
  try {
    const res = await authedFetch("/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res || !res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;
    const obj = data as { order_id?: unknown; payment_result?: { payment_details?: unknown; redirect_url?: unknown } };
    const idRaw = obj.order_id;
    const orderId =
      typeof idRaw === "number"
        ? idRaw
        : typeof idRaw === "string"
          ? Number.parseInt(idRaw, 10)
          : NaN;
    if (!Number.isFinite(orderId) || orderId <= 0) return null;
    let paymentUrl: string | undefined;
    const redirect = obj.payment_result?.redirect_url;
    if (typeof redirect === "string" && redirect.length > 0) {
      paymentUrl = redirect;
    }
    return { order_id: orderId, payment_url: paymentUrl };
  } catch {
    return null;
  }
}
