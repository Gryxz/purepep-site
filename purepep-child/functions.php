<?php
/**
 * PurePep child theme bootstrap.
 *
 * Enqueues parent + child styles, declares WooCommerce support, and emits the
 * locked design tokens as CSS custom properties on every front-end response.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/inc/tokens.php';
require_once __DIR__ . '/inc/setup-pages.php';

/**
 * Enqueue the parent theme stylesheet, then the PurePep token sheet, then the
 * child theme stylesheet. Order matters: tokens must load before any component
 * CSS that references them.
 */
add_action( 'wp_enqueue_scripts', static function (): void {
	$version = wp_get_theme()->get( 'Version' );

	wp_enqueue_style(
		'twentytwentyfive-style',
		get_template_directory_uri() . '/style.css',
		[],
		$version
	);

	wp_enqueue_style(
		'purepep-tokens',
		get_stylesheet_directory_uri() . '/assets/css/tokens.css',
		[ 'twentytwentyfive-style' ],
		$version
	);

	wp_enqueue_style(
		'purepep-style',
		get_stylesheet_directory_uri() . '/style.css',
		[ 'purepep-tokens' ],
		$version
	);
} );

/**
 * Declare theme features. WooCommerce is the storefront engine; product gallery
 * features are enabled so single-product templates render zoom + lightbox.
 */
add_action( 'after_setup_theme', static function (): void {
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
} );

/**
 * Emit the locked PurePep palette + scale as CSS custom properties at :root.
 * Mirrors design-system/colors_and_type.css. Inlined early in <head> so token
 * vars are available to any inline style emitted by blocks or WooCommerce.
 */
add_action( 'wp_head', static function (): void {
	$declarations = '';
	foreach ( \PurePep\Tokens::all() as $name => $value ) {
		$declarations .= '--' . $name . ':' . $value . ';';
	}

	echo "<style id=\"purepep-tokens-inline\">:root{" . $declarations . "}</style>\n";
}, 1 );
