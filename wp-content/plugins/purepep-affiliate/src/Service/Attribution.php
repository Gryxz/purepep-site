<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Service;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Support\CodeGenerator;
use PurePep\Affiliate\Support\Cookie;
use WC_Order;

/**
 * Resolves attribution for a WC order. Priority: submitted field > pp_ref cookie.
 * Writes order meta and creates a 'pending' commission row.
 */
final class Attribution
{
    public function __construct(
        private CodesRepository $codes,
        private CommissionsRepository $commissions,
        private CommissionCalculator $calculator,
    ) {
    }

    /**
     * Find the active code row from a submitted-field input, or null on miss.
     * Returns null both when input is empty AND when input is non-empty but
     * doesn't match an active code.
     */
    public function resolveFromField(?string $submittedCode): ?array
    {
        if ($submittedCode === null || $submittedCode === '') {
            return null;
        }
        $normalized = CodeGenerator::normalize($submittedCode);
        if (!CodeGenerator::isWellFormed($normalized)) {
            return null;
        }
        return $this->codes->findActiveByCode($normalized);
    }

    public function resolveFromCookie(): ?array
    {
        $cookie = Cookie::read();
        if ($cookie === null) {
            return null;
        }
        return $this->codes->findActiveByCode($cookie);
    }

    /**
     * Run attribution for an order. Idempotent: if a commission row already
     * exists for the order, returns without changes.
     *
     * @return int|null commission id, or null if no attribution applied.
     */
    public function attributeOrder(WC_Order $order, ?string $submittedCode): ?int
    {
        $orderId = (int) $order->get_id();
        $existing = $this->commissions->findByOrder($orderId);
        if ($existing !== null) {
            return (int) $existing['id'];
        }

        $source = 'field';
        $codeRow = $this->resolveFromField($submittedCode);
        if ($codeRow === null) {
            $codeRow = $this->resolveFromCookie();
            $source = 'cookie';
        }
        if ($codeRow === null) {
            return null;
        }

        $affiliateUserId = (int) $codeRow['user_id'];
        $buyerUserId = (int) $order->get_customer_id();
        if ($buyerUserId > 0 && $buyerUserId === $affiliateUserId) {
            return null; // self-referral blocked
        }

        $basis = $this->calculator->basisCents($order);
        if ($basis <= 0) {
            return null;
        }
        $commissionCents = $this->calculator->commissionCents($order);
        if ($commissionCents <= 0) {
            return null;
        }

        $currency = $order->get_currency();
        if (!is_string($currency) || $currency === '') {
            $currency = 'USD';
        }

        $commissionId = $this->commissions->create([
            'code_id' => (int) $codeRow['id'],
            'user_id' => $affiliateUserId,
            'order_id' => $orderId,
            'source' => $source,
            'subtotal_basis_cents' => $basis,
            'commission_cents' => $commissionCents,
            'currency' => strtoupper($currency),
            'status' => 'pending',
        ]);

        $order->update_meta_data('_pp_aff_code', $codeRow['code']);
        $order->update_meta_data('_pp_aff_user_id', $affiliateUserId);
        $order->update_meta_data('_pp_aff_source', $source);
        $order->update_meta_data('_pp_aff_commission_id', $commissionId);
        $order->save();

        return $commissionId;
    }
}
