<?php

declare(strict_types=1);

namespace PurePep\Affiliate\Woo;

use PurePep\Affiliate\Service\Attribution;
use PurePep\Affiliate\Support\CodeGenerator;

final class CheckoutField
{
    public const FIELD_NAME = 'pp_aff_code';

    public function __construct(private Attribution $attribution)
    {
    }

    public function register(): void
    {
        add_action('woocommerce_after_order_notes', [$this, 'render']);
        add_action('woocommerce_checkout_process', [$this, 'maybeWarnInvalid']);
        add_action('woocommerce_checkout_update_order_meta', [$this, 'attribute'], 10, 1);
    }

    public function render(): void
    {
        $value = '';
        if (isset($_POST[self::FIELD_NAME])) {
            $value = CodeGenerator::normalize(
                sanitize_text_field(wp_unslash((string) $_POST[self::FIELD_NAME]))
            );
        }
        echo '<p class="form-row form-row-wide" id="pp_aff_code_field">';
        echo '<label for="pp_aff_code">' . esc_html__('Referral code', 'purepep-affiliate')
            . ' <span class="optional">(' . esc_html__('optional', 'purepep-affiliate') . ')</span></label>';
        echo '<input type="text" class="input-text" name="' . esc_attr(self::FIELD_NAME) . '"'
            . ' id="pp_aff_code"'
            . ' maxlength="8"'
            . ' pattern="[A-Z0-9]{8}"'
            . ' style="text-transform:uppercase"'
            . ' placeholder="' . esc_attr__('Got a referral code?', 'purepep-affiliate') . '"'
            . ' value="' . esc_attr($value) . '" />';
        echo '</p>';
    }

    public function maybeWarnInvalid(): void
    {
        if (!isset($_POST[self::FIELD_NAME])) {
            return;
        }
        $raw = sanitize_text_field(wp_unslash((string) $_POST[self::FIELD_NAME]));
        if ($raw === '') {
            return;
        }
        $normalized = CodeGenerator::normalize($raw);
        if (!CodeGenerator::isWellFormed($normalized)) {
            if (function_exists('wc_add_notice')) {
                wc_add_notice(
                    esc_html__("That code wasn't recognized.", 'purepep-affiliate'),
                    'notice'
                );
            }
            return;
        }
        $row = $this->attribution->resolveFromField($normalized);
        if ($row === null && function_exists('wc_add_notice')) {
            wc_add_notice(
                esc_html__("That code wasn't recognized.", 'purepep-affiliate'),
                'notice'
            );
        }
    }

    public function attribute(int $orderId): void
    {
        if (!function_exists('wc_get_order')) {
            return;
        }
        $order = wc_get_order($orderId);
        if (!$order) {
            return;
        }
        $submitted = null;
        if (isset($_POST[self::FIELD_NAME])) {
            $submitted = sanitize_text_field(wp_unslash((string) $_POST[self::FIELD_NAME]));
        }
        $this->attribution->attributeOrder($order, $submitted);
    }
}
