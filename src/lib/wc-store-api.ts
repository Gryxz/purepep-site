/**
 * WooCommerce Store API v1 — CLIENT-SIDE.
 *
 * No auth: the Store API is session-cookie scoped and uses a per-request nonce
 * for write operations. Every fetch carries `credentials: "include"` so the
 * browser propagates the WC session cookie and `X-WC-Store-API-Nonce` so the
 * upstream accepts mutations.
 *
 * Public surface:
 *   getNonce, getWcCart,
 *   addToWcCart, updateWcCartItem, removeWcCartItem,
 *   placeWcOrder
 *
 * All helpers swallow upstream errors and return `null` so callers can keep
 * the optimistic Zustand state as the source of truth and decide what to do.
 */

const STORE_URL = (
  process.env.NEXT_PUBLIC_WC_STORE_URL ??
  "https://woocommerce-1617574-6376231.cloudwaysapps.com/wp-json/wc/store/v1"
).replace(/\/+$/, "");

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
// Nonce — cached for the lifetime of the page so we don't refetch on every op
// ---------------------------------------------------------------------------

let cachedNonce: string | null = null;

function readNonceFromHeaders(headers: Headers): string | null {
  return headers.get("Nonce") ?? headers.get("X-WC-Store-API-Nonce");
}

/**
 * Fetch a fresh nonce.  The WC Store API returns the nonce in the `Nonce`
 * response header on every successful GET (there is no dedicated endpoint).
 * Hitting `/cart` is the canonical bootstrap call — it both establishes the
 * session cookie and returns the nonce we cache for subsequent mutations.
 */
export async function getNonce(): Promise<string | null> {
  if (cachedNonce) return cachedNonce;
  try {
    const res = await fetch(`${STORE_URL}/cart`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const fromHeader = readNonceFromHeaders(res.headers);
    if (fromHeader) {
      cachedNonce = fromHeader;
      return fromHeader;
    }
    return null;
  } catch {
    return null;
  }
}

async function authedFetch(
  path: string,
  init: RequestInit & { method: "GET" | "POST" },
): Promise<Response | null> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Accept", "application/json");
  if (init.method === "POST") {
    headers.set("Content-Type", "application/json");
    const nonce = await getNonce();
    if (nonce) headers.set("X-WC-Store-API-Nonce", nonce);
  }
  try {
    const res = await fetch(`${STORE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
    const refreshed = readNonceFromHeaders(res.headers);
    if (refreshed) cachedNonce = refreshed;
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
