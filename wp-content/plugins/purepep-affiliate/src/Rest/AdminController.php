<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Rest;

use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
use PurePep\Affiliate\Schema;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Service\PayoutService;
use PurePep\Affiliate\Support\Capabilities;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class AdminController
{
    public function __construct(
        private CommissionsRepository $commissions,
        private PayoutsRepository $payouts,
        private PayoutService $payoutService,
        private AnalyticsService $analytics,
    ) {
    }

    public function register(): void
    {
        $writeGate = function (WP_REST_Request $request) {
            $r = Capabilities::requireAdmin($request);
            if ($r !== true) {
                return $r;
            }
            return Capabilities::requireNonceUnlessAppAuth($request);
        };

        register_rest_route(Controller::NAMESPACE, '/admin/payouts', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'listPayouts'],
                'permission_callback' => [Capabilities::class, 'requireAdmin'],
                'args' => [
                    'status' => ['type' => 'string', 'required' => false],
                    'limit' => ['type' => 'integer', 'required' => false, 'default' => 25],
                    'offset' => ['type' => 'integer', 'required' => false, 'default' => 0],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/admin/payouts/(?P<id>\d+)/mark-paid', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'markPaid'],
                'permission_callback' => $writeGate,
                'args' => [
                    'id' => ['type' => 'integer', 'required' => true],
                    'admin_note' => ['type' => 'string', 'required' => false],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/admin/payouts/(?P<id>\d+)/reject', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'reject'],
                'permission_callback' => $writeGate,
                'args' => [
                    'id' => ['type' => 'integer', 'required' => true],
                    'admin_note' => ['type' => 'string', 'required' => true],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/admin/commissions', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'listCommissions'],
                'permission_callback' => [Capabilities::class, 'requireAdmin'],
                'args' => [
                    'status' => ['type' => 'string', 'required' => false],
                    'user_id' => ['type' => 'integer', 'required' => false],
                    'order_id' => ['type' => 'integer', 'required' => false],
                    'limit' => ['type' => 'integer', 'required' => false, 'default' => 25],
                    'offset' => ['type' => 'integer', 'required' => false, 'default' => 0],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/admin/commissions/(?P<id>\d+)/reverse', [
            [
                'methods' => 'POST',
                'callback' => [$this, 'reverseCommission'],
                'permission_callback' => $writeGate,
                'args' => [
                    'id' => ['type' => 'integer', 'required' => true],
                    'reason' => ['type' => 'string', 'required' => true],
                ],
            ],
        ]);

        register_rest_route(Controller::NAMESPACE, '/admin/affiliates', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'listAffiliates'],
                'permission_callback' => [Capabilities::class, 'requireAdmin'],
                'args' => [
                    'search' => ['type' => 'string', 'required' => false],
                    'limit' => ['type' => 'integer', 'required' => false, 'default' => 25],
                    'offset' => ['type' => 'integer', 'required' => false, 'default' => 0],
                ],
            ],
        ]);
    }

    public function listPayouts(WP_REST_Request $request): WP_REST_Response
    {
        $status = $request->get_param('status');
        $status = is_string($status) && $status !== '' ? sanitize_text_field($status) : null;
        $limit = (int) ($request->get_param('limit') ?? 25);
        $offset = (int) ($request->get_param('offset') ?? 0);

        return new WP_REST_Response($this->payouts->adminList($status, $limit, $offset), 200);
    }

    public function markPaid(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $id = (int) $request['id'];
        $note = $request->get_param('admin_note');
        $note = is_string($note) ? sanitize_textarea_field($note) : null;

        $result = $this->payoutService->markPaid($id, get_current_user_id(), $note);
        if ($result instanceof WP_Error) {
            return $result;
        }
        return new WP_REST_Response(['ok' => true, 'id' => $id], 200);
    }

    public function reject(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $id = (int) $request['id'];
        $note = (string) ($request->get_param('admin_note') ?? '');
        $note = sanitize_textarea_field($note);

        $result = $this->payoutService->reject($id, get_current_user_id(), $note);
        if ($result instanceof WP_Error) {
            return $result;
        }
        return new WP_REST_Response(['ok' => true, 'id' => $id], 200);
    }

    public function listCommissions(WP_REST_Request $request): WP_REST_Response
    {
        $filters = [
            'status' => $request->get_param('status'),
            'user_id' => $request->get_param('user_id'),
            'order_id' => $request->get_param('order_id'),
        ];
        $limit = (int) ($request->get_param('limit') ?? 25);
        $offset = (int) ($request->get_param('offset') ?? 0);

        return new WP_REST_Response(
            $this->commissions->adminList($filters, $limit, $offset),
            200
        );
    }

    public function reverseCommission(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        $id = (int) $request['id'];
        $reason = (string) ($request->get_param('reason') ?? '');
        $reason = sanitize_text_field($reason);
        if ($reason === '') {
            return new WP_Error(
                'pp_aff_reason_required',
                __('Reason is required.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        $reason = mb_substr($reason, 0, 255);

        $row = $this->commissions->findById($id);
        if ($row === null) {
            return new WP_Error(
                'pp_aff_not_found',
                __('Commission not found.', 'purepep-affiliate'),
                ['status' => 404]
            );
        }
        if (!$this->commissions->reverse($id, $reason)) {
            return new WP_Error(
                'pp_aff_invalid_state',
                __('Commission is already reversed.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        $this->analytics->captureCommissionStatusChange($row, 'reversed', $reason);
        return new WP_REST_Response(['ok' => true, 'id' => $id], 200);
    }

    public function listAffiliates(WP_REST_Request $request): WP_REST_Response
    {
        global $wpdb;
        $codes = Schema::tableCodes();
        $limit = max(1, min(100, (int) ($request->get_param('limit') ?? 25)));
        $offset = max(0, (int) ($request->get_param('offset') ?? 0));
        $search = (string) ($request->get_param('search') ?? '');
        $search = sanitize_text_field($search);

        if ($search !== '') {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $userIdsByMail = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT ID FROM {$wpdb->users}
                     WHERE user_email LIKE %s OR user_login LIKE %s OR display_name LIKE %s",
                    $like,
                    $like,
                    $like
                )
            );
            $userIds = array_map('intval', $userIdsByMail ?: []);

            if ($userIds === []) {
                $userIdsByCode = $wpdb->get_col(
                    $wpdb->prepare(
                        "SELECT DISTINCT user_id FROM {$codes} WHERE code LIKE %s",
                        $like
                    )
                );
                $userIds = array_map('intval', $userIdsByCode ?: []);
            }

            if ($userIds === []) {
                return new WP_REST_Response([
                    'items' => [],
                    'total' => 0,
                    'limit' => $limit,
                    'offset' => $offset,
                ], 200);
            }

            $placeholders = implode(',', array_fill(0, count($userIds), '%d'));
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT DISTINCT user_id FROM {$codes}
                     WHERE user_id IN ({$placeholders})
                     ORDER BY user_id ASC LIMIT %d OFFSET %d",
                    array_merge($userIds, [$limit, $offset])
                ),
                ARRAY_A
            );
            $total = count($userIds);
        } else {
            $rows = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT DISTINCT user_id FROM {$codes}
                     ORDER BY user_id ASC LIMIT %d OFFSET %d",
                    $limit,
                    $offset
                ),
                ARRAY_A
            );
            $total = (int) $wpdb->get_var("SELECT COUNT(DISTINCT user_id) FROM {$codes}");
        }

        $items = [];
        foreach ($rows ?: [] as $row) {
            $uid = (int) $row['user_id'];
            $user = get_userdata($uid);
            $items[] = [
                'user_id' => $uid,
                'display_name' => $user ? $user->display_name : '',
                'email' => $user ? $user->user_email : '',
                'attributed_orders_count' => $this->commissions->attributedOrdersCount($uid),
                'gross_referred_revenue_cents' => $this->commissions->grossReferredRevenueCents($uid),
                'pending_balance_cents' => $this->commissions->pendingBalanceCents($uid),
                'approved_balance_cents' => $this->commissions->approvedBalanceCents($uid),
                'lifetime_paid_cents' => $this->commissions->lifetimePaidCents($uid),
            ];
        }

        return new WP_REST_Response([
            'items' => $items,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ], 200);
    }
}
