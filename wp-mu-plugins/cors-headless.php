<?php
/**
 * Plugin Name: PurePep — Headless Storefront CORS
 * Description: Echoes allowlisted storefront origins back as
 *              Access-Control-Allow-Origin on /wc/store/v1/* requests, and
 *              short-circuits OPTIONS preflights with a 204.  Required for
 *              the headless Next.js storefront on a different Cloudways
 *              subdomain to call the Store API with credentials: "include".
 *
 * Version:     1.0.0
 * Author:      PurePep
 *
 * INSTALL: drop into wp-content/mu-plugins/cors-headless.php on the
 * WooCommerce server (the WC Cloudways app, NOT the storefront app).
 * mu-plugins are auto-loaded; no activation step.
 *
 * SCOPE: only affects requests whose path contains /wc/store/v1.  wp-admin,
 * wp-login, and the rest of the WP REST API are untouched.
 *
 * WHY: the live WC server has access-control-allow-credentials: true and a
 * Vary: Origin header but its CORS handler stops echoing
 * access-control-allow-origin for cross-origin callers, so the browser
 * blocks every storefront → /cart preflight.  This plugin overrides the
 * upstream policy with a static allowlist.
 */

defined('ABSPATH') || exit;

// Namespaceless on purpose — mu-plugins are loaded as plain include files
// and namespacing pulls in opcache fingerprint surprises on some hosts.

if (!function_exists('purepep_headless_cors_allowed_origins')) {
    /**
     * Allowlist of storefront origins permitted to call /wc/store/v1/*.
     *
     * Filterable via the `purepep_headless_cors_origins` filter so future
     * domains (staging, preview, custom) can be added without editing the
     * plugin file.
     */
    function purepep_headless_cors_allowed_origins(): array {
        $defaults = [
            'https://phpstack-1617574-6380918.cloudwaysapps.com',
            'https://purepep.shop',
            'https://www.purepep.shop',
            'http://localhost:3000',
            'http://localhost:3001',
        ];
        /** @var string[] $list */
        $list = apply_filters('purepep_headless_cors_origins', $defaults);
        return array_values(array_unique(array_filter(array_map('strval', $list))));
    }
}

if (!function_exists('purepep_headless_cors_is_store_route')) {
    function purepep_headless_cors_is_store_route(): bool {
        $uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
        if ($uri === '') {
            return false;
        }
        // Catches both pretty-permalink (/wp-json/wc/store/v1/...) and the
        // index.php?rest_route=/wc/store/v1/... fallback.
        if (strpos($uri, '/wc/store/v1') !== false) {
            return true;
        }
        if (strpos($uri, 'rest_route=/wc/store/v1') !== false) {
            return true;
        }
        return false;
    }
}

if (!function_exists('purepep_headless_cors_pick_origin')) {
    function purepep_headless_cors_pick_origin(): ?string {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
        if ($origin === '') {
            return null;
        }
        $allowed = purepep_headless_cors_allowed_origins();
        return in_array($origin, $allowed, true) ? $origin : null;
    }
}

if (!function_exists('purepep_headless_cors_emit')) {
    /**
     * Emit the full CORS header set for an allowlisted origin.  Uses the
     * `replace=true` form so we override anything the upstream WC handler
     * already sent earlier in the request.
     */
    function purepep_headless_cors_emit(string $origin): void {
        // Spec requires an explicit origin (not *) when credentials are sent.
        header('Access-Control-Allow-Origin: ' . $origin, true);
        header('Access-Control-Allow-Credentials: true', true);
        header(
            'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS',
            true
        );
        header(
            'Access-Control-Allow-Headers: Authorization, Content-Type, '
            . 'Cart-Token, Nonce, X-WP-Nonce, X-WC-Store-API-Nonce, '
            . 'Content-Disposition, Content-MD5',
            true
        );
        // Cart-Token + Nonce must be exposed so the JS client can read them
        // off the response and re-send on the next request.
        header(
            'Access-Control-Expose-Headers: Cart-Token, Nonce, '
            . 'X-WC-Store-API-Nonce, X-WP-Total, X-WP-TotalPages, Link',
            true
        );
        header('Access-Control-Max-Age: 600', true);
        // Vary stacks — don't replace, append.
        header('Vary: Origin', false);
    }
}

/**
 * 1) Catch the OPTIONS preflight as early as possible — before WC's REST
 *    auth checks fire and potentially 401 the request.  Reply 204 with the
 *    full header set so the browser proceeds to the real request.
 */
add_action('init', static function (): void {
    $method = isset($_SERVER['REQUEST_METHOD']) ? (string) $_SERVER['REQUEST_METHOD'] : '';
    if ($method !== 'OPTIONS') {
        return;
    }
    if (!purepep_headless_cors_is_store_route()) {
        return;
    }
    $origin = purepep_headless_cors_pick_origin();
    if ($origin === null) {
        // Not in the allowlist — let WP/WC handle the rejection so the
        // browser gets a clean failure rather than a half-correct one.
        return;
    }
    purepep_headless_cors_emit($origin);
    status_header(204);
    // No body for 204; close the request immediately.
    exit;
}, 0);

/**
 * 2) For real GET/POST/etc requests, override the headers WC's CORS policy
 *    emitted with our allowlisted echo.  rest_pre_serve_request fires after
 *    routing but before the body is written, which is the last hook where
 *    headers are still mutable.
 */
add_filter('rest_pre_serve_request', static function ($served) {
    if (!purepep_headless_cors_is_store_route()) {
        return $served;
    }
    $origin = purepep_headless_cors_pick_origin();
    if ($origin === null) {
        return $served;
    }
    purepep_headless_cors_emit($origin);
    return $served;
}, 999);

/**
 * 3) Belt-and-suspenders: also emit on send_headers for any code path that
 *    skips rest_pre_serve_request (early auth errors, rate-limit middleware,
 *    cache plugins).  No-op on non-store-API routes.
 */
add_action('send_headers', static function (): void {
    if (!purepep_headless_cors_is_store_route()) {
        return;
    }
    $origin = purepep_headless_cors_pick_origin();
    if ($origin === null) {
        return;
    }
    purepep_headless_cors_emit($origin);
}, 999);
