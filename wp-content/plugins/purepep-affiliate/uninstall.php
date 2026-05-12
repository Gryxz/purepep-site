<?php

declare(strict_types=1);

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

$tables = [
    $wpdb->prefix . 'purepep_aff_codes',
    $wpdb->prefix . 'purepep_aff_commissions',
    $wpdb->prefix . 'purepep_aff_payouts',
];

foreach ($tables as $table) {
    $wpdb->query("DROP TABLE IF EXISTS {$table}");
}

$options = [
    'pp_aff_db_version',
    'pp_aff_min_payout_cents',
    'pp_aff_cookie_days',
    'pp_aff_enabled',
    'pp_aff_commission_bps',
];
foreach ($options as $option) {
    delete_option($option);
}
