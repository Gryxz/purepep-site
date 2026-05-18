/**
 * Shared navigation destinations.
 *
 * Single source so the desktop Header, desktop TabBar, mobile
 * MobileShell, and mobile MoreMenu can never point the same logical
 * link at different routes.
 */

// TODO: when the WC product slug is renamed from `purepep-reta-test`
// to `reta` in WP admin, switch this to "/shop/reta". Hard-pinned to
// the live WC slug to avoid a 404 today.
export const RETA_HREF = "/shop/purepep-reta-test";

/** "Account" / researcher area — was a dead "#" on desktop. */
export const ACCOUNT_HREF = "/researcher-access";
