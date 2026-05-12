<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Service;

use PurePep\Affiliate\Repository\CommissionsRepository;

final class Lifecycle
{
    public function __construct(private CommissionsRepository $commissions)
    {
    }

    /**
     * Ensure a commission row exists in 'pending' for the order. Called from
     * woocommerce_order_status_processing in case meta was set later than
     * checkout. Re-runs attribution via the supplied resolver.
     *
     * @param callable():?int $ensurePending Closure that performs attribution
     *                                       if no row exists; returns the
     *                                       commission id or null.
     */
    public function onProcessing(int $orderId, callable $ensurePending): void
    {
        $existing = $this->commissions->findByOrder($orderId);
        if ($existing !== null) {
            return;
        }
        $ensurePending();
    }

    public function onCompleted(int $orderId): void
    {
        $row = $this->commissions->findByOrder($orderId);
        if ($row === null || $row['status'] !== 'pending') {
            return;
        }
        $this->commissions->approve((int) $row['id']);
    }

    public function onRefunded(int $orderId): void
    {
        $row = $this->commissions->findByOrder($orderId);
        if ($row === null) {
            return;
        }
        if (!in_array($row['status'], ['pending', 'approved'], true)) {
            return;
        }
        $this->commissions->reverse((int) $row['id'], 'order_refunded');
    }

    public function onCancelled(int $orderId): void
    {
        $row = $this->commissions->findByOrder($orderId);
        if ($row === null) {
            return;
        }
        if (!in_array($row['status'], ['pending', 'approved'], true)) {
            return;
        }
        $this->commissions->reverse((int) $row['id'], 'order_cancelled');
    }
}
