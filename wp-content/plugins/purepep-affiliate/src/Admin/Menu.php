<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Admin;

use PurePep\Affiliate\Support\Capabilities;

final class Menu
{
    public const SLUG_ROOT = 'purepep-affiliate';
    public const SLUG_AFFILIATES = 'purepep-affiliate';
    public const SLUG_COMMISSIONS = 'purepep-affiliate-commissions';
    public const SLUG_PAYOUTS = 'purepep-affiliate-payouts';
    public const SLUG_SETTINGS = 'purepep-affiliate-settings';

    public function __construct(
        private AffiliatesListTable $affiliates,
        private CommissionsListTable $commissions,
        private PayoutsListTable $payouts,
        private SettingsPage $settings,
    ) {
    }

    public function register(): void
    {
        add_action('admin_menu', [$this, 'addMenu']);
        add_action('admin_init', [$this->settings, 'register']);
    }

    public function addMenu(): void
    {
        $cap = Capabilities::ADMIN_CAP;

        add_menu_page(
            __('Affiliates', 'purepep-affiliate'),
            __('Affiliates', 'purepep-affiliate'),
            $cap,
            self::SLUG_AFFILIATES,
            [$this, 'renderAffiliates'],
            'dashicons-groups',
            56
        );

        add_submenu_page(
            self::SLUG_ROOT,
            __('Affiliates', 'purepep-affiliate'),
            __('Affiliates', 'purepep-affiliate'),
            $cap,
            self::SLUG_AFFILIATES,
            [$this, 'renderAffiliates']
        );

        add_submenu_page(
            self::SLUG_ROOT,
            __('Commissions', 'purepep-affiliate'),
            __('Commissions', 'purepep-affiliate'),
            $cap,
            self::SLUG_COMMISSIONS,
            [$this, 'renderCommissions']
        );

        add_submenu_page(
            self::SLUG_ROOT,
            __('Payouts', 'purepep-affiliate'),
            __('Payouts', 'purepep-affiliate'),
            $cap,
            self::SLUG_PAYOUTS,
            [$this, 'renderPayouts']
        );

        add_submenu_page(
            self::SLUG_ROOT,
            __('Settings', 'purepep-affiliate'),
            __('Settings', 'purepep-affiliate'),
            $cap,
            self::SLUG_SETTINGS,
            [$this->settings, 'render']
        );
    }

    public function renderAffiliates(): void
    {
        if (!current_user_can(Capabilities::ADMIN_CAP)) {
            wp_die(esc_html__('Insufficient permissions.', 'purepep-affiliate'));
        }
        echo '<div class="wrap"><h1>' . esc_html__('Affiliates', 'purepep-affiliate') . '</h1>';
        $this->affiliates->prepare_items();
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="' . esc_attr(self::SLUG_AFFILIATES) . '" />';
        $this->affiliates->search_box(__('Search', 'purepep-affiliate'), 'pp-aff-search');
        $this->affiliates->display();
        echo '</form></div>';
    }

    public function renderCommissions(): void
    {
        if (!current_user_can(Capabilities::ADMIN_CAP)) {
            wp_die(esc_html__('Insufficient permissions.', 'purepep-affiliate'));
        }
        echo '<div class="wrap"><h1>' . esc_html__('Commissions', 'purepep-affiliate') . '</h1>';
        $this->commissions->prepare_items();
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="' . esc_attr(self::SLUG_COMMISSIONS) . '" />';
        $this->commissions->display();
        echo '</form></div>';
    }

    public function renderPayouts(): void
    {
        if (!current_user_can(Capabilities::ADMIN_CAP)) {
            wp_die(esc_html__('Insufficient permissions.', 'purepep-affiliate'));
        }
        echo '<div class="wrap"><h1>' . esc_html__('Payouts', 'purepep-affiliate') . '</h1>';
        $this->payouts->prepare_items();
        echo '<form method="get">';
        echo '<input type="hidden" name="page" value="' . esc_attr(self::SLUG_PAYOUTS) . '" />';
        $this->payouts->display();
        echo '</form></div>';
    }
}
