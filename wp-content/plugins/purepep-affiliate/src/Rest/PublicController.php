<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Rest;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Support\CodeGenerator;
use PurePep\Affiliate\Support\Cookie;
use PurePep\Affiliate\Support\RateLimiter;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class PublicController
{
    public function __construct(private CodesRepository $codes)
    {
    }

    public function register(): void
    {
        register_rest_route(Controller::NAMESPACE, '/validate', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'validate'],
                'permission_callback' => '__return_true',
                'args' => [
                    'code' => ['type' => 'string', 'required' => true],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/track', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'track'],
                'permission_callback' => '__return_true',
            ],
        ]);
    }

    public function validate(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $ip = RateLimiter::clientIp();
        if (!RateLimiter::hit('validate_' . $ip, 30, MINUTE_IN_SECONDS)) {
            return new WP_Error(
                'pp_aff_rate_limited',
                __('Too many requests.', 'purepep-affiliate'),
                ['status' => 429]
            );
        }

        $code = (string) ($request->get_param('code') ?? '');
        $code = CodeGenerator::normalize(sanitize_text_field($code));

        if (!CodeGenerator::isWellFormed($code)) {
            return new WP_REST_Response(['valid' => false], 200);
        }

        $row = $this->codes->findActiveByCode($code);
        if ($row === null) {
            return new WP_REST_Response(['valid' => false], 200);
        }

        $user = get_userdata((int) $row['user_id']);
        $display = $user ? $user->display_name : '';

        return new WP_REST_Response([
            'valid' => true,
            'owner_display_name' => (string) $display,
        ], 200);
    }

    public function track(WP_REST_Request $request): WP_REST_Response
    {
        $code = (string) ($request->get_param('code') ?? '');
        $code = CodeGenerator::normalize(sanitize_text_field($code));

        // Always 204. Anti-enumeration: do not leak validity in response.
        if (CodeGenerator::isWellFormed($code)) {
            $row = $this->codes->findActiveByCode($code);
            if ($row !== null) {
                Cookie::set($code);
            }
        }

        return new WP_REST_Response(null, 204);
    }
}
