<?php
/**
 * Plugin Name: PurePep — PostHog Order Webhook
 * Description: Sends a `purchase` event to PostHog EU when a WooCommerce
 *              order moves to processing or completed, and an inverse
 *              `refund` event when the order is refunded.  Server-side
 *              capture is the backup for the client-side `purchase` event
 *              that the storefront fires from /order-confirm/ — this
 *              catches sessions that never reach the confirmation page
 *              (closed tab, ad block, async gateway webhooks).
 *
 * Version:     1.0.0
 * Author:      PurePep
 *
 * INSTALL: drop into wp-content/mu-plugins/purepep-posthog-webhook.php
 * on the WC Cloudways app (the one whose public_html contains
 * wp-config.php).  mu-plugins auto-load — no activation step.
 *
 * CONFIG: WP admin → Settings → PurePep PostHog.  Paste the EU project
 * key (the same `phc_…` value the storefront uses as
 * NEXT_PUBLIC_POSTHOG_KEY).  No key → the plugin is a no-op.
 */

defined('ABSPATH') || exit;

// Namespaceless on purpose — mu-plugins are loaded as plain include files
// and namespacing pulls in opcache fingerprint surprises on some hosts.

const PUREPEP_POSTHOG_OPTION_KEY = 'purepep_posthog_api_key';
const PUREPEP_POSTHOG_HOST       = 'https://eu.i.posthog.com';
const PUREPEP_POSTHOG_FIRED_META = '_purepep_posthog_purchase_fired';

if (!function_exists('purepep_posthog_get_key')) {
    /**
     * Read the PostHog project key from wp_options.  Filterable so tests
     * can short-circuit without touching the option row.
     */
    function purepep_posthog_get_key(): string {
        $opt = (string) get_option(PUREPEP_POSTHOG_OPTION_KEY, '');
        /** @var string $key */
        $key = apply_filters('purepep_posthog_api_key', $opt);
        return (string) $key;
    }
}

if (!function_exists('purepep_posthog_capture')) {
    /**
     * Fire-and-forget POST to PostHog's /capture/ endpoint.  Non-blocking
     * so the order status transition isn't slowed by a slow PostHog
     * response.  No key → no-op.
     */
    function purepep_posthog_capture(string $event, string $distinct_id, array $properties): void {
        $key = purepep_posthog_get_key();
        if ($key === '') {
            return;
        }

        $payload = [
            'api_key'     => $key,
            'event'       => $event,
            'distinct_id' => $distinct_id,
            'properties'  => $properties,
            'timestamp'   => gmdate('c'),
        ];

        $body = wp_json_encode($payload);
        if (!is_string($body)) {
            return;
        }

        wp_remote_post(PUREPEP_POSTHOG_HOST . '/capture/', [
            'method'   => 'POST',
            'timeout'  => 5,
            'blocking' => false,
            'headers'  => ['Content-Type' => 'application/json'],
            'body'     => $body,
        ]);
    }
}

if (!function_exists('purepep_posthog_distinct_id')) {
    /**
     * Prefer the customer's billing email as the PostHog distinct_id so
     * server-side events stitch with the storefront's `purchase` event
     * (which currently fires anonymously, but a future identify() call
     * on the order-confirm page will use the same email).  Falls back to
     * an order-scoped anonymous id for guest checkouts with no email.
     */
    function purepep_posthog_distinct_id(\WC_Order $order): string {
        $email = trim((string) $order->get_billing_email());
        if ($email !== '') {
            return 'email:' . $email;
        }
        return 'order:' . (string) $order->get_id();
    }
}

if (!function_exists('purepep_posthog_build_order_properties')) {
    /**
     * Project a WC_Order down to a plain array of properties safe to send
     * to PostHog.  No PII beyond billing email (which is already used as
     * the distinct_id), no shipping address — keep the analytics payload
     * lean and out of the regulated-data path.
     */
    function purepep_posthog_build_order_properties(\WC_Order $order): array {
        $items = [];
        foreach ($order->get_items() as $item) {
            if (!$item instanceof \WC_Order_Item_Product) {
                continue;
            }
            $items[] = [
                'name'         => (string) $item->get_name(),
                'product_id'   => (int) $item->get_product_id(),
                'variation_id' => (int) $item->get_variation_id(),
                'quantity'     => (int) $item->get_quantity(),
                'line_total'   => (float) $item->get_total(),
            ];
        }

        return [
            'order_id'             => (int) $order->get_id(),
            'order_key'            => (string) $order->get_order_key(),
            'status'               => (string) $order->get_status(),
            'total'                => (float) $order->get_total(),
            'currency'             => (string) $order->get_currency(),
            'payment_method'       => (string) $order->get_payment_method(),
            'payment_method_title' => (string) $order->get_payment_method_title(),
            'item_count'           => (int) array_sum(array_column($items, 'quantity')),
            'line_count'           => count($items),
            'items'                => $items,
            'created_via'          => (string) $order->get_created_via(),
        ];
    }
}

if (!function_exists('purepep_posthog_has_fired')) {
    function purepep_posthog_has_fired(\WC_Order $order): bool {
        return (bool) $order->get_meta(PUREPEP_POSTHOG_FIRED_META, true);
    }
}

if (!function_exists('purepep_posthog_mark_fired')) {
    function purepep_posthog_mark_fired(\WC_Order $order): void {
        $order->update_meta_data(PUREPEP_POSTHOG_FIRED_META, '1');
        $order->save_meta_data();
    }
}

// ── Order completed / processing ───────────────────────────────────────

/**
 * Same handler bound to both `processing` and `completed` because either
 * is "money received" depending on payment method (BACS sits on hold →
 * processing once admin marks it paid; card gateways jump straight to
 * processing/completed).  The order-meta flag guarantees one event per
 * order even if the status hops processing → completed later.
 */
add_action('woocommerce_order_status_processing', static function (int $order_id): void {
    $order = wc_get_order($order_id);
    if (!$order instanceof \WC_Order || purepep_posthog_has_fired($order)) {
        return;
    }
    purepep_posthog_capture(
        'purchase',
        purepep_posthog_distinct_id($order),
        purepep_posthog_build_order_properties($order)
    );
    purepep_posthog_mark_fired($order);
});

add_action('woocommerce_order_status_completed', static function (int $order_id): void {
    $order = wc_get_order($order_id);
    if (!$order instanceof \WC_Order || purepep_posthog_has_fired($order)) {
        return;
    }
    purepep_posthog_capture(
        'purchase',
        purepep_posthog_distinct_id($order),
        purepep_posthog_build_order_properties($order)
    );
    purepep_posthog_mark_fired($order);
});

// ── Refunds ────────────────────────────────────────────────────────────

add_action('woocommerce_order_refunded', static function (int $order_id, int $refund_id): void {
    $order  = wc_get_order($order_id);
    $refund = wc_get_order($refund_id);
    if (!$order instanceof \WC_Order || !$refund instanceof \WC_Order_Refund) {
        return;
    }
    purepep_posthog_capture(
        'refund',
        purepep_posthog_distinct_id($order),
        [
            'order_id'      => (int) $order->get_id(),
            'refund_id'     => (int) $refund->get_id(),
            'refund_amount' => (float) $refund->get_amount(),
            'currency'      => (string) $order->get_currency(),
            'reason'        => (string) $refund->get_reason(),
        ]
    );
}, 10, 2);

// ── WP admin settings page (Settings → PurePep PostHog) ────────────────

add_action('admin_init', static function (): void {
    register_setting('purepep_posthog', PUREPEP_POSTHOG_OPTION_KEY, [
        'type'              => 'string',
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);

    add_settings_section(
        'purepep_posthog_section',
        'PostHog EU project key',
        static function (): void {
            echo '<p>Paste your PostHog EU project key here (the same <code>phc_…</code> value the storefront uses as <code>NEXT_PUBLIC_POSTHOG_KEY</code>). Leave blank to disable server-side capture.</p>';
        },
        'purepep_posthog'
    );

    add_settings_field(
        PUREPEP_POSTHOG_OPTION_KEY,
        'API key',
        static function (): void {
            $val = (string) get_option(PUREPEP_POSTHOG_OPTION_KEY, '');
            printf(
                '<input type="text" name="%s" value="%s" class="regular-text code" autocomplete="off" placeholder="phc_…" />',
                esc_attr(PUREPEP_POSTHOG_OPTION_KEY),
                esc_attr($val)
            );
        },
        'purepep_posthog',
        'purepep_posthog_section'
    );
});

add_action('admin_menu', static function (): void {
    add_options_page(
        'PurePep PostHog',
        'PurePep PostHog',
        'manage_options',
        'purepep_posthog',
        static function (): void {
            if (!current_user_can('manage_options')) {
                return;
            }
            echo '<div class="wrap">';
            echo '<h1>PurePep — PostHog Webhook</h1>';
            echo '<form action="options.php" method="post">';
            settings_fields('purepep_posthog');
            do_settings_sections('purepep_posthog');
            submit_button();
            echo '</form>';
            echo '</div>';
        }
    );
});
