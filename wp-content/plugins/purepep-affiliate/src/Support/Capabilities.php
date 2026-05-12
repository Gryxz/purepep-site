<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Support;

use WP_Error;
use WP_REST_Request;

final class Capabilities
{
    public const ADMIN_CAP = 'manage_woocommerce';

    public static function currentUserCanAdmin(): bool
    {
        return is_user_logged_in() && current_user_can(self::ADMIN_CAP);
    }

    public static function requireLoggedIn(WP_REST_Request $request): true|WP_Error
    {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'pp_aff_auth_required',
                __('Authentication required.', 'purepep-affiliate'),
                ['status' => 401]
            );
        }
        return true;
    }

    public static function requireAdmin(WP_REST_Request $request): true|WP_Error
    {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'pp_aff_auth_required',
                __('Authentication required.', 'purepep-affiliate'),
                ['status' => 401]
            );
        }
        if (!current_user_can(self::ADMIN_CAP)) {
            return new WP_Error(
                'pp_aff_forbidden',
                __('Insufficient permissions.', 'purepep-affiliate'),
                ['status' => 403]
            );
        }
        return true;
    }

    /**
     * For state-changing endpoints invoked via cookie auth, require a valid
     * wp_rest nonce. Application-password / Basic auth flows are exempt.
     */
    public static function requireNonceUnlessAppAuth(WP_REST_Request $request): true|WP_Error
    {
        if (self::isApplicationPasswordAuth()) {
            return true;
        }
        $nonce = $request->get_header('x_wp_nonce');
        if (!$nonce) {
            $nonce = $request->get_header('X-WP-Nonce');
        }
        if (!$nonce || !wp_verify_nonce((string) $nonce, 'wp_rest')) {
            return new WP_Error(
                'pp_aff_invalid_nonce',
                __('Invalid or missing nonce.', 'purepep-affiliate'),
                ['status' => 403]
            );
        }
        return true;
    }

    private static function isApplicationPasswordAuth(): bool
    {
        // wp_is_application_passwords_available is for capability not auth;
        // a Basic-Auth-authenticated REST request sets PHP_AUTH_USER and the
        // current user is logged in via the application_password_authenticate
        // filter. Use that signal.
        if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
            return false;
        }
        return is_user_logged_in();
    }
}
