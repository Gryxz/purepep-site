"use client";

import Script from "next/script";

/**
 * Loads the Bankful Hosted Fields browser SDK once for the checkout route.
 * The SDK URL and publishable key are browser-safe (tokenize-only; they
 * cannot move money). The secret-keyed charge happens server-side in the
 * WP mu-plugin proxy — never here.
 *
 * Calls onReady(true) on success and onReady(false) on failure so checkout
 * components can degrade gracefully when the SDK is unavailable.
 */
export function BankfulScript({ onReady }: { onReady: (ok: boolean) => void }) {
  const src = process.env.NEXT_PUBLIC_BANKFUL_SDK_URL;
  if (!src) {
    if (typeof window !== "undefined") {
      queueMicrotask(() => onReady(false));
    }
    return null;
  }
  return (
    <Script
      src={src}
      strategy="afterInteractive"
      onLoad={() => onReady(true)}
      onError={() => onReady(false)}
    />
  );
}
