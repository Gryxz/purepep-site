<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Support\Capabilities;
use PurePep\Affiliate\Support\Money;

final class SettingsPage
{
    private const GROUP = 'pp_aff_settings';
    private const SECTION = 'pp_aff_main';

    public function register(): void
    {
        register_setting(self::GROUP, 'pp_aff_min_payout_cents', [
            'type' => 'integer',
            'sanitize_callback' => function ($value): int {
                $dollars = is_numeric($value) ? (float) $value : 0.0;
                if ($dollars < 0) {
                    $dollars = 0.0;
                }
                return Money::dollarsToCents($dollars);
            },
            'default' => 9000,
        ]);
        register_setting(self::GROUP, 'pp_aff_cookie_days', [
            'type' => 'integer',
            'sanitize_callback' => static function ($value): int {
                $v = (int) $value;
                return $v > 0 ? min($v, 365) : 30;
            },
            'default' => 30,
        ]);
        register_setting(self::GROUP, 'pp_aff_enabled', [
            'type' => 'integer',
            'sanitize_callback' => static fn ($v): int => (int) (bool) $v,
            'default' => 1,
        ]);

        add_settings_section(
            self::SECTION,
            __('Affiliate Program', 'purepep-affiliate'),
            static function (): void {
                echo '<p>' . esc_html__('Core configuration for the PurePep affiliate program.', 'purepep-affiliate') . '</p>';
            },
            self::GROUP
        );

        add_settings_field(
            'pp_aff_enabled_field',
            __('Plugin enabled', 'purepep-affiliate'),
            [$this, 'renderEnabled'],
            self::GROUP,
            self::SECTION
        );
        add_settings_field(
            'pp_aff_min_payout_field',
            __('Minimum payout (USD)', 'purepep-affiliate'),
            [$this, 'renderMinPayout'],
            self::GROUP,
            self::SECTION
        );
        add_settings_field(
            'pp_aff_cookie_days_field',
            __('Attribution cookie window (days)', 'purepep-affiliate'),
            [$this, 'renderCookieDays'],
            self::GROUP,
            self::SECTION
        );
    }

    public function render(): void
    {
        if (!current_user_can(Capabilities::ADMIN_CAP)) {
            wp_die(esc_html__('Insufficient permissions.', 'purepep-affiliate'));
        }
        echo '<div class="wrap"><h1>' . esc_html__('Affiliate Settings', 'purepep-affiliate') . '</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields(self::GROUP);
        do_settings_sections(self::GROUP);
        submit_button();
        echo '</form></div>';
    }

    public function renderEnabled(): void
    {
        $value = (int) get_option('pp_aff_enabled', 1);
        echo '<label><input type="checkbox" name="pp_aff_enabled" value="1" ' . checked(1, $value, false) . ' /> '
            . esc_html__('Enable affiliate attribution', 'purepep-affiliate') . '</label>';
    }

    public function renderMinPayout(): void
    {
        $cents = (int) get_option('pp_aff_min_payout_cents', 9000);
        $dollars = number_format($cents / 100, 2, '.', '');
        echo '<input type="number" step="0.01" min="0" name="pp_aff_min_payout_cents" value="'
            . esc_attr($dollars) . '" /> ';
        echo '<p class="description">' . esc_html__('Affiliates must reach this approved balance before requesting a payout.', 'purepep-affiliate') . '</p>';
    }

    public function renderCookieDays(): void
    {
        $days = (int) get_option('pp_aff_cookie_days', 30);
        echo '<input type="number" step="1" min="1" max="365" name="pp_aff_cookie_days" value="'
            . esc_attr((string) $days) . '" /> ';
        echo '<p class="description">' . esc_html__('How long the pp_ref attribution cookie persists.', 'purepep-affiliate') . '</p>';
    }
}
