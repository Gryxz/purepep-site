<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Woo;

use PurePep\Affiliate\Service\Attribution;
use PurePep\Affiliate\Service\Lifecycle;

final class OrderHooks
{
    public function __construct(
        private Lifecycle $lifecycle,
        private Attribution $attribution,
    ) {
    }

    public function register(): void
    {
        add_action('woocommerce_order_status_processing', [$this, 'onProcessing'], 10, 1);
        add_action('woocommerce_order_status_completed', [$this, 'onCompleted'], 10, 1);
        add_action('woocommerce_order_status_refunded', [$this, 'onRefunded'], 10, 1);
        add_action('woocommerce_order_status_cancelled', [$this, 'onCancelled'], 10, 1);
    }

    public function onProcessing(int $orderId): void
    {
        $this->lifecycle->onProcessing($orderId, function () use ($orderId): ?int {
            if (!function_exists('wc_get_order')) {
                return null;
            }
            $order = wc_get_order($orderId);
            if (!$order) {
                return null;
            }
            return $this->attribution->attributeOrder($order, null);
        });
    }

    public function onCompleted(int $orderId): void
    {
        $this->lifecycle->onCompleted($orderId);
    }

    public function onRefunded(int $orderId): void
    {
        $this->lifecycle->onRefunded($orderId);
    }

    public function onCancelled(int $orderId): void
    {
        $this->lifecycle->onCancelled($orderId);
    }
}
