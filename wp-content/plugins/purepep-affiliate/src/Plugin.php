<?php

declare(strict_types=1);

namespace PurePep\Affiliate;

use PurePep\Affiliate\Admin\FormHandlers;
use PurePep\Affiliate\Admin\Menu;
use PurePep\Affiliate\Admin\SettingsPage;
use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
use PurePep\Affiliate\Rest\Controller as RestController;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Service\Attribution;
use PurePep\Affiliate\Service\CommissionCalculator;
use PurePep\Affiliate\Service\Lifecycle;
use PurePep\Affiliate\Service\PayoutService;
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

        $analytics = AnalyticsService::fromConfig();

        $codes = new CodesRepository();
        $commissions = new CommissionsRepository();
        $payouts = new PayoutsRepository();
        $calc = new CommissionCalculator();
        $attribution = new Attribution($codes, $commissions, $calc, $analytics);
        $lifecycle = new Lifecycle($commissions, $analytics);
        $payoutService = new PayoutService($commissions, $payouts, $analytics);

        RestController::make($analytics)->register();

        (new CheckoutField($attribution))->register();
        (new OrderHooks($lifecycle, $attribution))->register();
        (new LandingHandler($codes, $analytics))->register();

        add_action('shutdown', static function () use ($analytics): void {
            $analytics->flush();
        });

        if (is_admin()) {
            $menu = new Menu($codes, $commissions, $payouts, new SettingsPage());
            $menu->register();
            (new FormHandlers($payoutService, $commissions, $analytics))->register();
        }
    }

    public function isEnabled(): bool
    {
        return (int) get_option('pp_aff_enabled', 1) === 1;
    }
}
