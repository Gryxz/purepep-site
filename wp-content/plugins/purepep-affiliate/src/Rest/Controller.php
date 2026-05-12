<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Rest;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
use PurePep\Affiliate\Service\AnalyticsService;
use PurePep\Affiliate\Service\PayoutService;

final class Controller
{
    public const NAMESPACE = 'purepep-affiliate/v1';

    public function __construct(
        private MeController $me,
        private PublicController $public,
        private AdminController $admin,
    ) {
    }

    public static function make(?AnalyticsService $analytics = null): self
    {
        $analytics ??= AnalyticsService::fromConfig();
        $codes = new CodesRepository();
        $commissions = new CommissionsRepository();
        $payouts = new PayoutsRepository();
        $payoutService = new PayoutService($commissions, $payouts, $analytics);

        return new self(
            new MeController($codes, $commissions, $payouts, $payoutService, $analytics),
            new PublicController($codes),
            new AdminController($commissions, $payouts, $payoutService, $analytics),
        );
    }

    public function register(): void
    {
        add_action('rest_api_init', function (): void {
            $this->me->register();
            $this->public->register();
            $this->admin->register();
        });
    }
}
