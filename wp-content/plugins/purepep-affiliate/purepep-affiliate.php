<?php
/**
 * Plugin Name: PurePep Affiliate
 * Description: Referral/affiliate program for the PurePep WooCommerce storefront.
 * Version: 0.1.0
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 * Author: PurePep
 * License: Proprietary
 * Text Domain: purepep-affiliate
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

define('PUREPEP_AFF_VERSION', '0.1.0');
define('PUREPEP_AFF_DB_VERSION', '1');
define('PUREPEP_AFF_FILE', __FILE__);
define('PUREPEP_AFF_DIR', plugin_dir_path(__FILE__));
define('PUREPEP_AFF_URL', plugin_dir_url(__FILE__));

$autoload = PUREPEP_AFF_DIR . 'vendor/autoload.php';
if (file_exists($autoload)) {
    require_once $autoload;
} else {
    spl_autoload_register(static function (string $class): void {
        $prefix = 'PurePep\\Affiliate\\';
        if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
            return;
        }
        $relative = substr($class, strlen($prefix));
        $path = PUREPEP_AFF_DIR . 'src/' . str_replace('\\', '/', $relative) . '.php';
        if (is_readable($path)) {
            require_once $path;
        }
    });
}

register_activation_hook(__FILE__, [\PurePep\Affiliate\Activation::class, 'activate']);

add_action('plugins_loaded', static function (): void {
    \PurePep\Affiliate\Plugin::instance()->boot();
}, 20);

add_action('before_woocommerce_init', static function (): void {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
    }
});
