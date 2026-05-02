/**
 * PostHog EU analytics — thin wrapper around posthog-js.
 *
 * Cookieless (`persistence: "memory"`) so the storefront stays GDPR-clean
 * with no consent banner.  Autocapture, session recording, and pageviews
 * are all OFF; we fire the events we actually care about by hand from
 * components and the route-change effect in PostHogProvider.
 *
 * If `NEXT_PUBLIC_POSTHOG_KEY` is unset every helper here is a no-op, so
 * dev/preview builds never accidentally hit PostHog with the production
 * write key, and `pnpm build` succeeds whether the env is set or not.
 *
 * The key is a public write-only project key per PostHog's design — safe
 * to embed in the static export.
 */

"use client";

import type { PostHog } from "posthog-js";

let client: PostHog | null = null;
let initialised = false;

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = "https://eu.i.posthog.com";

function isEnabled(): boolean {
  return POSTHOG_KEY.length > 0 && typeof window !== "undefined";
}

/**
 * Lazy-import posthog-js + initialise.  Called once from PostHogProvider
 * on mount.  Idempotent — calling again is a no-op.
 */
export async function initPostHog(): Promise<void> {
  if (initialised || !isEnabled()) return;
  initialised = true;
  try {
    const mod = await import("posthog-js");
    client = mod.default;
    client.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Cookieless: nothing persists across reload, no consent banner needed.
      persistence: "memory",
      // We fire events explicitly; no autocapture or auto-pageview.
      autocapture: false,
      capture_pageview: false,
      // No replay, no PII recording.
      disable_session_recording: true,
      // Don't fight Safari ITP — we're cookieless anyway.
      cross_subdomain_cookie: false,
      secure_cookie: true,
    });
  } catch {
    // PostHog import or init failed — fail silent, leave client null.
    initialised = false;
  }
}

interface ProductLike {
  slug: string;
  compound: string;
  category: string;
  price: number;
  dose: string;
  wcId?: number;
}

interface CartLineLike {
  slug: string;
  compound: string;
  dose: string;
  qty: number;
  price: number;
}

function safeCapture(event: string, properties: Record<string, unknown>): void {
  if (!client) return;
  try {
    client.capture(event, properties);
  } catch {
    // never throw from a tracking call
  }
}

export function trackPageView(path: string): void {
  safeCapture("$pageview", { $current_url: path, path });
}

export function trackProductView(product: ProductLike): void {
  safeCapture("product_view", {
    product_id: product.wcId,
    product_slug: product.slug,
    compound: product.compound,
    category: product.category,
    price: product.price,
    currency: "USD",
    default_variant: product.dose,
  });
}

export function trackAddToCart(
  product: ProductLike,
  variant: string,
  qty: number,
  lineValue: number,
  variationId?: number,
): void {
  const unitPrice = qty > 0 ? lineValue / qty : 0;
  safeCapture("add_to_cart", {
    product_id: product.wcId,
    variation_id: variationId,
    product_slug: product.slug,
    compound: product.compound,
    dose: variant,
    quantity: qty,
    unit_price: Number(unitPrice.toFixed(2)),
    line_value: Number(lineValue.toFixed(2)),
    currency: "USD",
  });
}

export function trackBeginCheckout(
  items: CartLineLike[],
  cartValue: number,
): void {
  safeCapture("begin_checkout", {
    cart_value: Number(cartValue.toFixed(2)),
    currency: "USD",
    item_count: items.reduce((sum, i) => sum + i.qty, 0),
    line_count: items.length,
    items: items.map((i) => ({
      slug: i.slug,
      compound: i.compound,
      dose: i.dose,
      quantity: i.qty,
      unit_price: Number(i.price.toFixed(2)),
    })),
  });
}

interface OrderItemLike {
  name: string;
  quantity: number;
  total: number;
}

/**
 * Bind the current PostHog session to a stable user identifier so the
 * client-side `purchase` event stitches with the server-side mu-plugin
 * webhook (which uses `email:<billing_email>` as distinct_id).  No-op
 * if PostHog isn't initialised or the email is empty.
 *
 * Note: persistence is `memory` so the identification doesn't survive a
 * reload — that's fine; we only need it for the lifetime of the
 * /order-confirm/ page where the `purchase` event fires.
 */
export function identifyUserByEmail(email: string): void {
  if (!client) return;
  const trimmed = email.trim();
  if (trimmed === "") return;
  try {
    client.identify(`email:${trimmed}`);
  } catch {
    // never throw from a tracking call
  }
}

export function trackPurchase(
  orderId: number,
  total: number,
  items: OrderItemLike[],
): void {
  safeCapture("purchase", {
    order_id: orderId,
    total: Number(total.toFixed(2)),
    currency: "USD",
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    line_count: items.length,
    items: items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      line_total: Number(i.total.toFixed(2)),
    })),
  });
}

export function trackAgeGate(accepted: boolean): void {
  safeCapture("age_gate", { accepted });
}

export function trackResearcherAttestation(): void {
  safeCapture("researcher_attestation", {});
}
