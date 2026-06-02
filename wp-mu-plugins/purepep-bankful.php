<?php
/**
 * Plugin Name: PurePep — Bankful Card Gateway + Proxy
 * Description: Server-side Bankful charge proxy for the headless static
 *              storefront. Browser tokenizes card data via Bankful Hosted
 *              Fields and POSTs the token to /purepep/v1/bankful-checkout;
 *              this plugin charges Bankful with the secret key, then creates
 *              the WooCommerce order via the Store API. Also registers a
 *              `bankful` WC gateway so Store API checkout accepts the method,
 *              a settlement webhook, and an admin order meta box.
 *
 * Version:     1.0.0
 * Author:      PurePep
 *
 * INSTALL: drop into wp-content/mu-plugins/purepep-bankful.php on the
 * WooCommerce server. Add the secret constants to wp-config.php:
 *   define('BANKFUL_API_KEY', 'sk_live_or_test_...');
 *   define('BANKFUL_MERCHANT_ID', '...');
 *   define('BANKFUL_API_BASE', 'https://api.bankful.com/v1');
 *   define('BANKFUL_WEBHOOK_SECRET', 'whsec_...');
 *   define('BANKFUL_STATEMENT_DESCRIPTOR', 'PUREPEP.SHOP');
 * mu-plugins auto-load; no activation step.
 */

defined('ABSPATH') || exit;

/* ----------------------------------------------------------------------
 * Config accessors (constant first, env fallback).
 * -------------------------------------------------------------------- */
if (!function_exists('purepep_bankful_cfg')) {
    function purepep_bankful_cfg(string $key, string $default = ''): string {
        if (defined($key)) return (string) constant($key);
        $env = getenv($key);
        return $env !== false ? (string) $env : $default;
    }
}

/* ----------------------------------------------------------------------
 * Decline-code → friendly message map (MUST match the client map).
 * -------------------------------------------------------------------- */
if (!function_exists('purepep_bankful_decline_message')) {
    function purepep_bankful_decline_message(string $code): string {
        $map = [
            'insufficient_funds' => 'Your card was declined for insufficient funds. Please use a different card.',
            'card_declined'      => 'Your card was declined. Please contact your bank or try a different card.',
            'expired_card'       => 'This card has expired. Please use a different card.',
            'incorrect_cvc'      => 'The security code (CVV) is incorrect. Please re-enter it.',
            'incorrect_number'   => 'The card number is invalid. Please check and try again.',
            'processing_error'   => "We couldn't process your card right now. Please try again in a moment.",
            'avs_mismatch'       => "Your billing ZIP code doesn't match your card. Please check it and try again.",
            'fraud_suspected'    => "This transaction couldn't be completed. Please contact support@purepep.shop.",
            'do_not_honor'       => 'Your bank declined this charge. Please contact your bank or try a different card.',
        ];
        return $map[$code] ?? "Your payment couldn't be completed. Please try a different card or contact support@purepep.shop.";
    }
}

/* ----------------------------------------------------------------------
 * CORS for the /purepep/v1/* routes (mirror cors-headless allowlist).
 * -------------------------------------------------------------------- */
if (!function_exists('purepep_bankful_cors')) {
    function purepep_bankful_cors(): void {
        $allow = [
            'https://purepep.shop',
            'https://www.purepep.shop',
            'https://phpstack-1617574-6380918.cloudwaysapps.com',
            'http://localhost:3000',
            'http://localhost:3001',
        ];
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
        if ($origin && in_array($origin, $allow, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Content-Type, Nonce, X-WC-Store-API-Nonce, Cart-Token');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
        }
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            status_header(204);
            exit;
        }
    }
}

/* ----------------------------------------------------------------------
 * The WC gateway. has_fields=false: it never renders a form — the token
 * arrives via the Store API payment_data, set by the proxy below.
 * -------------------------------------------------------------------- */
add_action('plugins_loaded', function () {
    if (!class_exists('WC_Payment_Gateway')) return;

    class WC_Gateway_Bankful extends WC_Payment_Gateway {
        public function __construct() {
            $this->id                 = 'bankful';
            $this->method_title       = 'Card (Bankful)';
            $this->method_description = 'Bankful card payments via tokenized Hosted Fields.';
            $this->has_fields         = false;
            $this->title              = 'Card (Bankful)';
            $this->enabled            = 'yes';
            $this->supports           = ['products', 'refunds'];
            $this->init_form_fields();
            $this->init_settings();
        }
        public function init_form_fields() {
            $this->form_fields = [
                'enabled' => [
                    'title'   => 'Enable/Disable',
                    'type'    => 'checkbox',
                    'label'   => 'Enable Bankful card payments',
                    'default' => 'yes',
                ],
            ];
        }
        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            $pd    = $this->get_posted_payment_data();
            $txn   = isset($pd['bankful_transaction_id']) ? sanitize_text_field($pd['bankful_transaction_id']) : '';
            if (!$txn) {
                throw new Exception('Missing Bankful transaction reference.');
            }
            $order->update_meta_data('_bankful_transaction_id', $txn);
            if (!empty($pd['bankful_auth_code'])) $order->update_meta_data('_bankful_auth_code', sanitize_text_field($pd['bankful_auth_code']));
            if (!empty($pd['bankful_avs']))        $order->update_meta_data('_bankful_avs', sanitize_text_field($pd['bankful_avs']));
            if (!empty($pd['bankful_cvv']))        $order->update_meta_data('_bankful_cvv', sanitize_text_field($pd['bankful_cvv']));
            $order->set_payment_method_title('Card (Bankful)');
            $order->payment_complete($txn);
            $order->save();
            return ['result' => 'success', 'redirect' => ''];
        }
        private function get_posted_payment_data(): array {
            $raw  = file_get_contents('php://input');
            $body = json_decode($raw, true);
            $out  = [];
            if (is_array($body) && !empty($body['payment_data']) && is_array($body['payment_data'])) {
                foreach ($body['payment_data'] as $pair) {
                    if (isset($pair['key'], $pair['value'])) $out[$pair['key']] = $pair['value'];
                }
            }
            return $out;
        }
    }

    add_filter('woocommerce_payment_gateways', function ($gw) {
        $gw[] = 'WC_Gateway_Bankful';
        return $gw;
    });
});

/* ----------------------------------------------------------------------
 * Store API / Blocks integration so payment_method "bankful" is accepted
 * and payment_data is routed to process_payment().
 * -------------------------------------------------------------------- */
add_action('woocommerce_blocks_loaded', function () {
    if (!class_exists('Automattic\\WooCommerce\\Blocks\\Payments\\Integrations\\AbstractPaymentMethodType')) return;

    class Bankful_Blocks_Integration extends \Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType {
        protected $name = 'bankful';
        public function initialize() {}
        public function is_active() { return true; }
        public function get_payment_method_script_handles() { return []; }
        public function get_payment_method_data() {
            return ['title' => 'Card (Bankful)', 'supports' => ['products', 'refunds']];
        }
    }

    add_action('woocommerce_blocks_payment_method_type_registration', function ($registry) {
        $registry->register(new Bankful_Blocks_Integration());
    });
});

/* ----------------------------------------------------------------------
 * REST: charge proxy + settlement webhook routes.
 * -------------------------------------------------------------------- */
add_action('rest_api_init', function () {
    register_rest_route('purepep/v1', '/bankful-checkout', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'purepep_bankful_checkout_handler',
    ]);
    register_rest_route('purepep/v1', '/bankful-webhook', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'purepep_bankful_webhook_handler',
    ]);
});

if (!function_exists('purepep_bankful_checkout_handler')) {
    function purepep_bankful_checkout_handler(WP_REST_Request $req) {
        purepep_bankful_cors();

        $token     = sanitize_text_field((string) $req->get_param('token'));
        $email     = sanitize_email((string) $req->get_param('email'));
        $billing   = (array) $req->get_param('billing');
        $shipping  = (array) $req->get_param('shipping');
        $cartToken = sanitize_text_field((string) $req->get_param('cartToken'));
        $nonce     = sanitize_text_field((string) $req->get_param('nonce'));
        $threeDS   = $req->get_param('threeDSResult');

        if (!$token) {
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }

        $apiKey    = purepep_bankful_cfg('BANKFUL_API_KEY');
        $apiBase   = rtrim(purepep_bankful_cfg('BANKFUL_API_BASE', 'https://api.bankful.com/v1'), '/');
        $descriptor = purepep_bankful_cfg('BANKFUL_STATEMENT_DESCRIPTOR', 'PUREPEP.SHOP');
        if (!$apiKey) {
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }

        // Authoritative amount from WC cart — never trust client-sent amount.
        $store   = home_url('/wp-json/wc/store/v1/cart');
        $cartRes = wp_remote_get($store, [
            'headers' => ['Cart-Token' => $cartToken, 'Accept' => 'application/json'],
            'timeout' => 20,
        ]);
        if (is_wp_error($cartRes)) {
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }
        $cart     = json_decode(wp_remote_retrieve_body($cartRes), true);
        $minor    = isset($cart['totals']['total_price']) ? (int) $cart['totals']['total_price'] : 0;
        $currency = $cart['totals']['currency_code'] ?? 'USD';
        if ($minor <= 0) {
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }

        // Charge Bankful.
        $chargeBody = [
            'token'       => $token,
            'amount'      => $minor,
            'currency'    => $currency,
            'descriptor'  => $descriptor,
            'merchant_id' => purepep_bankful_cfg('BANKFUL_MERCHANT_ID'),
            'email'       => $email,
            'billing'     => [
                'name'        => trim(($billing['first_name'] ?? '') . ' ' . ($billing['last_name'] ?? '')),
                'address'     => $billing['address_1'] ?? '',
                'city'        => $billing['city'] ?? '',
                'state'       => $billing['state'] ?? '',
                'postal_code' => $billing['postcode'] ?? '',
                'country'     => $billing['country'] ?? '',
            ],
        ];
        if (!empty($threeDS)) $chargeBody['three_ds_result'] = $threeDS;

        $resp = wp_remote_post($apiBase . '/charges', [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ],
            'body'    => wp_json_encode($chargeBody),
            'timeout' => 45,
        ]);
        if (is_wp_error($resp)) {
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }
        $charge = json_decode(wp_remote_retrieve_body($resp), true);
        $status = $charge['status'] ?? 'failed';

        if ($status === 'requires_action') {
            return new WP_REST_Response([
                'ok'             => false,
                'requiresAction' => true,
                'threeDS'        => $charge['next_action'] ?? $charge['three_ds'] ?? null,
            ], 200);
        }
        if ($status !== 'approved' && $status !== 'succeeded') {
            $code = $charge['decline_code'] ?? $charge['error']['code'] ?? 'card_declined';
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => $code, 'message' => purepep_bankful_decline_message($code)]], 200);
        }

        $txnId    = $charge['id'] ?? $charge['transaction_id'] ?? '';
        $authCode = $charge['auth_code'] ?? '';
        $avs      = $charge['avs_result'] ?? '';
        $cvvR     = $charge['cvv_result'] ?? '';

        // Create the WC order via Store API with our gateway + payment_data.
        $checkoutBody = [
            'billing_address'  => $billing,
            'shipping_address' => $shipping,
            'payment_method'   => 'bankful',
            'payment_data'     => [
                ['key' => 'bankful_transaction_id', 'value' => (string) $txnId],
                ['key' => 'bankful_auth_code',      'value' => (string) $authCode],
                ['key' => 'bankful_avs',            'value' => (string) $avs],
                ['key' => 'bankful_cvv',            'value' => (string) $cvvR],
            ],
        ];
        $coRes = wp_remote_post(home_url('/wp-json/wc/store/v1/checkout'), [
            'headers' => [
                'Content-Type'          => 'application/json',
                'Cart-Token'            => $cartToken,
                'Nonce'                 => $nonce,
                'X-WC-Store-API-Nonce'  => $nonce,
            ],
            'body'    => wp_json_encode($checkoutBody),
            'timeout' => 45,
        ]);

        $coOk  = !is_wp_error($coRes) && (int) wp_remote_retrieve_response_code($coRes) < 300;
        $order = $coOk ? json_decode(wp_remote_retrieve_body($coRes), true) : null;

        if (!$coOk || empty($order['order_id'])) {
            // Void/refund to prevent orphan charge.
            wp_remote_post($apiBase . '/charges/' . rawurlencode((string) $txnId) . '/refund', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ],
                'body'    => wp_json_encode(['amount' => $minor, 'reason' => 'order_creation_failed']),
                'timeout' => 45,
            ]);
            return new WP_REST_Response(['ok' => false, 'error' => ['code' => 'processing_error', 'message' => purepep_bankful_decline_message('processing_error')]], 200);
        }

        return new WP_REST_Response([
            'ok'        => true,
            'order_id'  => (int) $order['order_id'],
            'order_key' => (string) ($order['order_key'] ?? ''),
        ], 200);
    }
}

/* ----------------------------------------------------------------------
 * Settlement webhook: HMAC-verified status sync.
 * -------------------------------------------------------------------- */
if (!function_exists('purepep_bankful_webhook_handler')) {
    function purepep_bankful_webhook_handler(WP_REST_Request $req) {
        $secret = purepep_bankful_cfg('BANKFUL_WEBHOOK_SECRET');
        $raw    = $req->get_body();
        $sig    = $req->get_header('x-bankful-signature') ?? '';
        if (!$secret || !hash_equals(hash_hmac('sha256', $raw, $secret), (string) $sig)) {
            return new WP_REST_Response(['ok' => false], 401);
        }
        $event = json_decode($raw, true);
        $type  = $event['type'] ?? '';
        $txn   = $event['data']['transaction_id'] ?? $event['data']['id'] ?? '';
        if (!$txn) return new WP_REST_Response(['ok' => true], 200);

        $orders = wc_get_orders(['meta_key' => '_bankful_transaction_id', 'meta_value' => $txn, 'limit' => 1]);
        if (empty($orders)) return new WP_REST_Response(['ok' => true], 200);
        $order = $orders[0];

        switch ($type) {
            case 'charge.captured':
            case 'captured':
                if ($order->get_status() === 'on-hold') $order->update_status('processing', 'Bankful settlement captured.');
                break;
            case 'charge.refunded':
            case 'refunded':
                $order->update_status('refunded', 'Bankful refund settled.');
                break;
            case 'charge.dispute_opened':
            case 'dispute_opened':
                $order->update_status('on-hold', 'Bankful dispute/chargeback opened.');
                $order->add_order_note('Bankful dispute opened for txn ' . $txn);
                break;
        }
        return new WP_REST_Response(['ok' => true], 200);
    }
}

/* ----------------------------------------------------------------------
 * Admin order meta box — show Bankful txn details for dispute evidence.
 * -------------------------------------------------------------------- */
add_action('add_meta_boxes', function () {
    add_meta_box('purepep_bankful_meta', 'Bankful Payment', function ($post) {
        $order = wc_get_order($post->ID);
        if (!$order) return;
        $rows = [
            'Transaction ID' => $order->get_meta('_bankful_transaction_id'),
            'Auth code'      => $order->get_meta('_bankful_auth_code'),
            'AVS result'     => $order->get_meta('_bankful_avs'),
            'CVV result'     => $order->get_meta('_bankful_cvv'),
        ];
        echo '<table style="width:100%;font-size:12px">';
        foreach ($rows as $k => $v) {
            echo '<tr><td style="color:#666">' . esc_html($k) . '</td><td style="text-align:right"><code>' . esc_html($v ?: '—') . '</code></td></tr>';
        }
        echo '</table>';
    }, 'shop_order', 'side', 'default');
});
