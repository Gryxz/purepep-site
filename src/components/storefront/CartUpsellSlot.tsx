"use client";
/**
 * CartUpsellSlot — feature-flagged placeholder for cart-page upsell content.
 * Disabled by default; flip `enabled={true}` from the call site once the
 * merchandising copy / bundle data is wired up. Until then this renders nothing
 * so the surface stays unchanged.
 */
export function CartUpsellSlot({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) return null;
  return null;
}
