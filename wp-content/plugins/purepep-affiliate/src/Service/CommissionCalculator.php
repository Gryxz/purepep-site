<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Service;

use PurePep\Affiliate\Support\Money;
use WC_Order;

final class CommissionCalculator
{
    public function defaultBps(): int
    {
        $bps = (int) get_option('pp_aff_commission_bps', 2000);
        if ($bps < 0) {
            return 0;
        }
        if ($bps > 10000) {
            return 10000;
        }
        return $bps;
    }

    /**
     * Line-item subtotal (pre-tax, pre-shipping, pre-fees), in cents.
     */
    public function basisCents(WC_Order $order): int
    {
        $subtotal = 0.0;
        foreach ($order->get_items() as $item) {
            if (method_exists($item, 'get_subtotal')) {
                $subtotal += (float) $item->get_subtotal();
            }
        }
        return Money::dollarsToCents($subtotal);
    }

    public function commissionCents(WC_Order $order, ?int $bpsOverride = null): int
    {
        $bps = $bpsOverride ?? $this->defaultBps();
        return Money::applyBps($this->basisCents($order), $bps);
    }
}
