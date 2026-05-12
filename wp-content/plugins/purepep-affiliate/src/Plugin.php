<?php

declare(strict_types=1);

namespace PurePep\Affiliate;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Rest\Controller as RestController;
use PurePep\Affiliate\Service\Attribution;
use PurePep\Affiliate\Service\CommissionCalculator;
use PurePep\Affiliate\Service\Lifecycle;
use PurePep\Affiliate\Woo\CheckoutField;
use PurePep\Affiliate\Woo\LandingHandler;
use PurePep\Affiliate\Woo\OrderHooks;

final class Plugin
{
    private static ?self $instance = null;
    private bool $booted = false;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function boot(): void
    {
        if ($this->booted) {
            return;
        }
        $this->booted = true;

        if (!$this->isEnabled()) {
            return;
        }

        RestController::make()->register();

        $codes = new CodesRepository();
        $commissions = new CommissionsRepository();
        $calc = new CommissionCalculator();
        $attribution = new Attribution($codes, $commissions, $calc);
        $lifecycle = new Lifecycle($commissions);

        (new CheckoutField($attribution))->register();
        (new OrderHooks($lifecycle, $attribution))->register();
        (new LandingHandler($codes))->register();
    }

    public function isEnabled(): bool
    {
        return (int) get_option('pp_aff_enabled', 1) === 1;
    }
}
