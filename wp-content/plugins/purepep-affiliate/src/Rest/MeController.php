<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Rest;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Service\PayoutService;
use PurePep\Affiliate\Support\Capabilities;
use PurePep\Affiliate\Support\RateLimiter;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class MeController
{
    public function __construct(
        private CodesRepository $codes,
        private CommissionsRepository $commissions,
        private PayoutsRepository $payouts,
        private PayoutService $payoutService,
        private AnalyticsService $analytics,
    ) {
    }

    public function register(): void
    {
        register_rest_route(Controller::NAMESPACE, '/me', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'getMe'],
                'permission_callback' => [Capabilities::class, 'requireLoggedIn'],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/me/code/regenerate', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'regenerate'],
                'permission_callback' => function (WP_REST_Request $request) {
                    $r = Capabilities::requireLoggedIn($request);
                    if ($r !== true) {
                        return $r;
                    }
                    return Capabilities::requireNonceUnlessAppAuth($request);
                },
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/me/commissions', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'listCommissions'],
                'permission_callback' => [Capabilities::class, 'requireLoggedIn'],
                'args' => [
                    'status' => ['type' => 'string', 'required' => false],
                    'limit' => ['type' => 'integer', 'required' => false, 'default' => 25],
                    'offset' => ['type' => 'integer', 'required' => false, 'default' => 0],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/me/payouts', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'listPayouts'],
                'permission_callback' => [Capabilities::class, 'requireLoggedIn'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'requestPayout'],
                'permission_callback' => function (WP_REST_Request $request) {
                    $r = Capabilities::requireLoggedIn($request);
                    if ($r !== true) {
                        return $r;
                    }
                    return Capabilities::requireNonceUnlessAppAuth($request);
                },
            ],
        ]);
    }

    public function getMe(WP_REST_Request $request): WP_REST_Response
    {
        $userId = get_current_user_id();
        $codeRow = $this->codes->getActiveForUser($userId);

        $code = $codeRow === null
            ? null
            : [
                'value' => (string) $codeRow['code'],
                'status' => (string) $codeRow['status'],
                'created_at' => (string) $codeRow['created_at'],
            ];

        $stats = [
            'attributed_orders_count' => $this->commissions->attributedOrdersCount($userId),
            'gross_referred_revenue_cents' => $this->commissions->grossReferredRevenueCents($userId),
            'pending_balance_cents' => $this->commissions->pendingBalanceCents($userId),
            'approved_balance_cents' => $this->commissions->approvedBalanceCents($userId),
            'lifetime_paid_cents' => $this->commissions->lifetimePaidCents($userId),
            'currency' => self::currency(),
        ];

        return new WP_REST_Response([
            'code' => $code,
            'stats' => $stats,
        ], 200);
    }

    public function regenerate(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $userId = get_current_user_id();

        $key = 'regen_user_' . $userId;
        if (!RateLimiter::hit($key, 5, HOUR_IN_SECONDS)) {
            return new WP_Error(
                'pp_aff_rate_limited',
                __('Too many regeneration attempts. Try again later.', 'purepep-affiliate'),
                ['status' => 429]
            );
        }

        $oldRow = $this->codes->getActiveForUser($userId);
        $oldCode = $oldRow !== null ? (string) $oldRow['code'] : null;

        try {
            $row = $this->codes->regenerateForUser($userId);
        } catch (\Throwable $e) {
            return new WP_Error(
                'pp_aff_regen_failed',
                __('Could not generate a new referral code.', 'purepep-affiliate'),
                ['status' => 500]
            );
        }

        $this->analytics->capture('affiliate_code_regenerated', $userId, [
            'old_code' => $oldCode,
            'new_code' => (string) $row['code'],
        ]);

        return new WP_REST_Response([
            'code' => [
                'value' => (string) $row['code'],
                'status' => (string) $row['status'],
                'created_at' => (string) $row['created_at'],
            ],
        ], 200);
    }

    public function listCommissions(WP_REST_Request $request): WP_REST_Response
    {
        $userId = get_current_user_id();
        $status = $request->get_param('status');
        $status = is_string($status) && $status !== '' ? sanitize_text_field($status) : null;
        $limit = (int) ($request->get_param('limit') ?? 25);
        $offset = (int) ($request->get_param('offset') ?? 0);

        $result = $this->commissions->listForUser($userId, $status, $limit, $offset);
        $result['items'] = array_map([$this, 'shapeCommission'], $result['items']);
        return new WP_REST_Response($result, 200);
    }

    public function listPayouts(WP_REST_Request $request): WP_REST_Response
    {
        $userId = get_current_user_id();
        $limit = (int) ($request->get_param('limit') ?? 25);
        $offset = (int) ($request->get_param('offset') ?? 0);

        $result = $this->payouts->listForUser($userId, $limit, $offset);
        $result['items'] = array_map([$this, 'shapePayout'], $result['items']);
        return new WP_REST_Response($result, 200);
    }

    public function requestPayout(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $userId = get_current_user_id();
        $amount = $request->get_param('amount_cents');
        $amountCents = $amount === null || $amount === '' ? null : (int) $amount;
        if ($amountCents !== null && $amountCents <= 0) {
            return new WP_Error(
                'pp_aff_invalid_amount',
                __('amount_cents must be a positive integer.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }

        $result = $this->payoutService->request($userId, $amountCents);
        if ($result instanceof WP_Error) {
            return $result;
        }

        $row = $this->payouts->findById($result);
        return new WP_REST_Response($this->shapePayout($row ?? []), 201);
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function shapeCommission(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'order_id' => (int) $row['order_id'],
            'source' => (string) $row['source'],
            'subtotal_basis_cents' => (int) $row['subtotal_basis_cents'],
            'commission_cents' => (int) $row['commission_cents'],
            'currency' => (string) $row['currency'],
            'status' => (string) $row['status'],
            'created_at' => (string) $row['created_at'],
            'approved_at' => $row['approved_at'] !== null ? (string) $row['approved_at'] : null,
            'reversed_at' => $row['reversed_at'] !== null ? (string) $row['reversed_at'] : null,
            'reversed_reason' => $row['reversed_reason'] !== null ? (string) $row['reversed_reason'] : null,
        ];
    }

    /**
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private function shapePayout(array $row): array
    {
        return [
            'id' => isset($row['id']) ? (int) $row['id'] : 0,
            'amount_cents' => isset($row['amount_cents']) ? (int) $row['amount_cents'] : 0,
            'currency' => isset($row['currency']) ? (string) $row['currency'] : 'USD',
            'status' => isset($row['status']) ? (string) $row['status'] : '',
            'requested_at' => isset($row['requested_at']) ? (string) $row['requested_at'] : '',
            'paid_at' => isset($row['paid_at']) && $row['paid_at'] !== null ? (string) $row['paid_at'] : null,
            'admin_note' => isset($row['admin_note']) && $row['admin_note'] !== null ? (string) $row['admin_note'] : null,
        ];
    }

    private static function currency(): string
    {
        if (function_exists('get_woocommerce_currency')) {
            return (string) \get_woocommerce_currency();
        }
        return 'USD';
    }
}
