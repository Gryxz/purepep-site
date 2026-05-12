<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Service\PayoutService;
use PurePep\Affiliate\Support\Capabilities;

final class FormHandlers
{
    public function __construct(
        private PayoutService $payoutService,
        private CommissionsRepository $commissions,
        private AnalyticsService $analytics,
    ) {
    }

    public function register(): void
    {
        add_action('admin_post_pp_aff_mark_paid', [$this, 'handleMarkPaid']);
        add_action('admin_post_pp_aff_reject', [$this, 'handleReject']);
        add_action('admin_post_pp_aff_reverse_commission', [$this, 'handleReverseCommission']);
    }

    public function handleMarkPaid(): void
    {
        $this->guard();
        $payoutId = isset($_POST['payout_id']) ? (int) $_POST['payout_id'] : 0;
        if ($payoutId <= 0) {
            $this->bail(__('Invalid payout id.', 'purepep-affiliate'));
        }
        check_admin_referer('pp_aff_payout_action_' . $payoutId);

        $note = isset($_POST['admin_note'])
            ? sanitize_textarea_field(wp_unslash((string) $_POST['admin_note']))
            : '';
        $note = $note !== '' ? $note : null;

        $result = $this->payoutService->markPaid($payoutId, get_current_user_id(), $note);
        $this->redirectBackToPayouts($result === true ? 'paid' : 'failed');
    }

    public function handleReject(): void
    {
        $this->guard();
        $payoutId = isset($_POST['payout_id']) ? (int) $_POST['payout_id'] : 0;
        if ($payoutId <= 0) {
            $this->bail(__('Invalid payout id.', 'purepep-affiliate'));
        }
        check_admin_referer('pp_aff_payout_action_' . $payoutId);

        $note = isset($_POST['admin_note'])
            ? sanitize_textarea_field(wp_unslash((string) $_POST['admin_note']))
            : '';
        if (trim($note) === '') {
            $this->redirectBackToPayouts('note_required');
            return;
        }

        $result = $this->payoutService->reject($payoutId, get_current_user_id(), $note);
        $this->redirectBackToPayouts($result === true ? 'rejected' : 'failed');
    }

    public function handleReverseCommission(): void
    {
        $this->guard();
        $commissionId = isset($_POST['commission_id']) ? (int) $_POST['commission_id'] : 0;
        if ($commissionId <= 0) {
            $this->bail(__('Invalid commission id.', 'purepep-affiliate'));
        }
        check_admin_referer('pp_aff_reverse_commission_' . $commissionId);

        $reason = isset($_POST['reason'])
            ? sanitize_text_field(wp_unslash((string) $_POST['reason']))
            : '';
        $reason = mb_substr($reason, 0, 255);
        if (trim($reason) === '') {
            $this->redirectBackToCommissions('reason_required');
            return;
        }

        $row = $this->commissions->findById($commissionId);
        if ($row === null) {
            $this->redirectBackToCommissions('failed');
            return;
        }
        $ok = $this->commissions->reverse($commissionId, $reason);
        if ($ok) {
            $this->analytics->captureCommissionStatusChange($row, 'reversed', $reason);
        }
        $this->redirectBackToCommissions($ok ? 'reversed' : 'failed');
    }

    private function guard(): void
    {
        if (!is_user_logged_in() || !current_user_can(Capabilities::ADMIN_CAP)) {
            wp_die(esc_html__('Insufficient permissions.', 'purepep-affiliate'));
        }
    }

    private function bail(string $message): void
    {
        wp_die(esc_html($message));
    }

    private function redirectBackToPayouts(string $status): void
    {
        $url = add_query_arg(
            ['page' => Menu::SLUG_PAYOUTS, 'pp_aff_msg' => $status],
            admin_url('admin.php')
        );
        wp_safe_redirect($url);
        exit;
    }

    private function redirectBackToCommissions(string $status): void
    {
        $url = add_query_arg(
            ['page' => Menu::SLUG_COMMISSIONS, 'pp_aff_msg' => $status],
            admin_url('admin.php')
        );
        wp_safe_redirect($url);
        exit;
    }
}
