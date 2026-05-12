<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Service;

use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
use WP_Error;

final class PayoutService
{
    public function __construct(
        private CommissionsRepository $commissions,
        private PayoutsRepository $payouts,
        private AnalyticsService $analytics,
    ) {
    }

    public function minPayoutCents(): int
    {
        $cents = (int) get_option('pp_aff_min_payout_cents', 9000);
        return $cents > 0 ? $cents : 9000;
    }

    /**
     * Request a payout for the given user.
     *
     * @return int|WP_Error new payout id on success.
     */
    public function request(int $userId, ?int $amountCents): int|WP_Error
    {
        $available = $this->commissions->approvedBalanceCents($userId);
        $amount = $amountCents !== null && $amountCents > 0 ? $amountCents : $available;

        if ($amount <= 0) {
            return new WP_Error(
                'pp_aff_no_balance',
                __('No claimable balance.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        if ($amount > $available) {
            return new WP_Error(
                'pp_aff_amount_exceeds_balance',
                __('Requested amount exceeds claimable balance.', 'purepep-affiliate'),
                ['status' => 422, 'available_cents' => $available]
            );
        }
        $threshold = $this->minPayoutCents();
        if ($amount < $threshold) {
            return new WP_Error(
                'pp_aff_below_threshold',
                __('Requested amount is below the minimum payout threshold.', 'purepep-affiliate'),
                ['status' => 422, 'threshold_cents' => $threshold]
            );
        }

        $payoutId = $this->payouts->create($userId, $amount);

        $this->analytics->capture('payout_requested', $userId, [
            'payout_id' => $payoutId,
            'amount_cents' => $amount,
            'currency' => 'USD',
        ]);

        return $payoutId;
    }

    public function markPaid(int $payoutId, int $adminUserId, ?string $adminNote): true|WP_Error
    {
        $row = $this->payouts->findById($payoutId);
        if ($row === null) {
            return new WP_Error(
                'pp_aff_not_found',
                __('Payout not found.', 'purepep-affiliate'),
                ['status' => 404]
            );
        }
        if ($row['status'] !== 'requested') {
            return new WP_Error(
                'pp_aff_invalid_state',
                __('Payout is not in a requested state.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        if (!$this->payouts->markPaid($payoutId, $adminUserId, $adminNote)) {
            return new WP_Error(
                'pp_aff_update_failed',
                __('Failed to update payout.', 'purepep-affiliate'),
                ['status' => 500]
            );
        }
        $this->analytics->capture('payout_paid', (int) $row['user_id'], [
            'payout_id' => $payoutId,
            'amount_cents' => (int) $row['amount_cents'],
            'admin_user_id' => $adminUserId,
        ]);
        return true;
    }

    public function reject(int $payoutId, int $adminUserId, string $adminNote): true|WP_Error
    {
        if (trim($adminNote) === '') {
            return new WP_Error(
                'pp_aff_note_required',
                __('Admin note is required when rejecting a payout.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        $row = $this->payouts->findById($payoutId);
        if ($row === null) {
            return new WP_Error(
                'pp_aff_not_found',
                __('Payout not found.', 'purepep-affiliate'),
                ['status' => 404]
            );
        }
        if ($row['status'] !== 'requested') {
            return new WP_Error(
                'pp_aff_invalid_state',
                __('Payout is not in a requested state.', 'purepep-affiliate'),
                ['status' => 422]
            );
        }
        if (!$this->payouts->reject($payoutId, $adminUserId, $adminNote)) {
            return new WP_Error(
                'pp_aff_update_failed',
                __('Failed to update payout.', 'purepep-affiliate'),
                ['status' => 500]
            );
        }
        $this->analytics->capture('payout_rejected', (int) $row['user_id'], [
            'payout_id' => $payoutId,
            'admin_note' => $adminNote,
            'admin_user_id' => $adminUserId,
        ]);
        return true;
    }
}
