/**
 * Barrel re-export of the static product fixture.
 *
 * The runtime catalog is sourced from WooCommerce REST at build time via
 * src/lib/wc-api.ts. This file exists so that any caller still importing from
 * `@/data/products` resolves to the same static fallback shape.
 */

export type { Product, StockState, Category } from "./products.static";
export { PRODUCTS, getProduct, getProductSlugs, getRelated } from "./products.static";
