/**
 * Shared cart/checkout content + constants.
 *
 * FREE_SHIP_THRESHOLD was hand-duplicated in six cart/checkout
 * components; a single source removes the drift risk (change it once,
 * every surface agrees). Empty-cart copy is unified here too — desktop
 * and mobile previously worded it differently.
 *
 * Pure content/constants — no cart-store or checkout-flow logic.
 */

/** Order subtotal (USD) at/above which shipping is free. */
export const FREE_SHIP_THRESHOLD = 200;

export const CART_EMPTY_TITLE = "Your cart is empty";
export const CART_EMPTY_SUB = "Add a compound from the catalog to get started.";
