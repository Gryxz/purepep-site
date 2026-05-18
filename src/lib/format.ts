/** USD price formatter — one canonical money format across the storefront. */
export function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}
