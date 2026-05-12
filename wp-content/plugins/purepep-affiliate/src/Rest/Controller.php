<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Rest;

use PurePep\Affiliate\Repository\CodesRepository;
use PurePep\Affiliate\Repository\CommissionsRepository;
use PurePep\Affiliate\Repository\PayoutsRepository;
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

    public static function make(): self
    {
        $codes = new CodesRepository();
        $commissions = new CommissionsRepository();
        $payouts = new PayoutsRepository();
        $payoutService = new PayoutService($commissions, $payouts);

        return new self(
            new MeController($codes, $commissions, $payouts, $payoutService),
            new PublicController($codes),
            new AdminController($commissions, $payouts, $payoutService),
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
