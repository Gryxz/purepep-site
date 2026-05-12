<?php

declare(strict_types=1);

namespace PurePep\Affiliate;

final class Activation
{
    public static function activate(): void
    {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        foreach (Schema::ddl() as $statement) {
            dbDelta($statement);
        }

        $currentVersion = get_option('pp_aff_db_version');
        if ($currentVersion !== Schema::VERSION) {
            update_option('pp_aff_db_version', Schema::VERSION, false);
        }

        if (get_option('pp_aff_min_payout_cents', null) === null) {
            add_option('pp_aff_min_payout_cents', 9000, '', false);
        }
        if (get_option('pp_aff_cookie_days', null) === null) {
            add_option('pp_aff_cookie_days', 30, '', false);
        }
        if (get_option('pp_aff_enabled', null) === null) {
            add_option('pp_aff_enabled', 1, '', false);
        }
        if (get_option('pp_aff_commission_bps', null) === null) {
            add_option('pp_aff_commission_bps', 2000, '', false);
        }
    }
}
