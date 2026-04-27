<?php
/**
 * Page + nav menu setup — PurePep child theme.
 *
 * Two responsibilities, both hooked to after_setup_theme:
 *
 *  1. purepep_create_policy_pages() — idempotent seeder for the policy pages
 *     the storefront chrome links to (privacy, terms, age verification).
 *     Skips any page whose slug already exists; never overwrites or
 *     re-publishes pages that were edited in WP Admin.
 *
 *  2. purepep_register_nav_menus() — registers the six menu locations the
 *     header and footer reference (primary nav, plus five footer columns).
 *     Locations are wired in code; the menus themselves are managed in
 *     WP Admin → Appearance → Menus.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', 'purepep_create_policy_pages' );
add_action( 'after_setup_theme', 'purepep_register_nav_menus' );

/**
 * Seed the storefront policy pages on theme setup.
 *
 * Iterates a slug → {title, content} map. For each entry, looks up the slug
 * via get_page_by_path(); if a page already exists, the entry is skipped so
 * editorial changes made in WP Admin are never clobbered. New pages are
 * inserted as published static pages with comments and pings disabled.
 *
 * Re-runs on every after_setup_theme firing but the per-slug check makes
 * the operation cheap once the pages exist.
 */
function purepep_create_policy_pages(): void {
	$pages = [
		'privacy-policy' => [
			'title'   => 'Privacy Policy',
			'content' => purepep_page_content_privacy(),
		],
		'terms-of-service' => [
			'title'   => 'Terms of Service',
			'content' => purepep_page_content_terms(),
		],
		'age-verification' => [
			'title'   => 'Age Verification',
			'content' => purepep_page_content_age_verification(),
		],
	];

	foreach ( $pages as $slug => $page ) {
		if ( get_page_by_path( $slug, OBJECT, 'page' ) ) {
			continue;
		}

		wp_insert_post(
			[
				'post_type'      => 'page',
				'post_status'    => 'publish',
				'post_name'      => $slug,
				'post_title'     => $page['title'],
				'post_content'   => $page['content'],
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
			],
			false
		);
	}
}

/**
 * Privacy Policy block content.
 *
 * RUO research-supply policy. Standard Gutenberg paragraph + heading blocks
 * so the page is fully editable in the block editor after seeding.
 */
function purepep_page_content_privacy(): string {
	return <<<'HTML'
<!-- wp:paragraph -->
<p><em>Last updated [TKTK]</em></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This privacy policy explains how PurePep collects, uses, and shares information when you visit purepep.shop or place an order with us. PurePep supplies research-grade peptides for in-vitro study only; this site is restricted to qualified researchers.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Information we collect</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To process an order we collect the information you provide at checkout: your name, email address, shipping address, and billing address. We do not collect or store payment card numbers, CVVs, or expiration dates. Card data is captured directly by our payment gateway and never touches our servers.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>We also collect basic technical information that your browser sends automatically: IP address, user-agent string, referring URL, and the timestamps of pages you visit on the site. This is standard web-server log data, retained for security and operational diagnostics.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">How we use your information</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The information you provide is used to fulfill your order: process payment, ship product to the address you provided, send transactional email about the order (confirmation, shipping notification, certificate of analysis), and respond if you contact us with a question about that order.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>We do not send marketing email without your explicit, opt-in consent. If you sign up for lot release announcements or COA archive access, you will receive only the email type you signed up for, and you can unsubscribe at any time using the link in any email.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Cookies</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>PurePep uses two categories of cookies. The first is a session cookie that keeps you signed in while you browse. The second is the WooCommerce cart cookie that remembers what you have added to your cart between page loads. Both expire when you close your browser or after a short inactivity window.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>We do not use third-party advertising cookies, cross-site tracking pixels, or behavioral analytics that follow you to other sites.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Third parties</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Two third parties receive a subset of your information so we can fulfill your order. The payment processor receives the information required to authorize the transaction. The shipping carrier receives your name and shipping address so they can deliver the package. Neither party is permitted to use your information for any purpose other than completing the service we contracted them for.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Your choices</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>You can request a copy of the information we hold about you, ask us to correct inaccurate information, or ask us to delete your account and the associated order history (subject to record-keeping obligations we may be required to satisfy). Email the address below to make a request.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Contact</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Questions about this policy can be sent to <a href="mailto:[TKTK]">[TKTK]</a>. We respond to privacy requests within a reasonable time and at the latest within the period required by applicable law.</p>
<!-- /wp:paragraph -->
HTML;
}

/**
 * Terms of Service block content.
 *
 * Research-use-only peptide supply terms. Standard Gutenberg paragraph +
 * heading blocks. Numerics, jurisdictions, and similar values that the
 * legal team must approve are flagged [TKTK].
 */
function purepep_page_content_terms(): string {
	return <<<'HTML'
<!-- wp:paragraph -->
<p><em>Last updated [TKTK]</em></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>These terms govern your use of purepep.shop and any purchase you make from PurePep. By placing an order, you confirm that you have read, understood, and agree to be bound by these terms.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Research use only</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>All products sold by PurePep are supplied for in-vitro research use only. They are not dietary supplements, therapeutics, cosmetics, or products intended for human or veterinary consumption. Products are not approved by the FDA for human or animal use, and no medical, therapeutic, dosage, weight-loss, or wellness claim is made by PurePep about any product.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>You agree that any product you purchase will be used solely for legitimate scientific research conducted in an appropriate setting by qualified personnel. You accept full responsibility for compliance with the laws and regulations that govern handling of research-grade peptides in your jurisdiction.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Age and eligibility</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>You must be at least 18 years of age to place an order. By submitting an order, you affirm that you are 18 or older and that you are a licensed, qualified, or otherwise appropriate scientific researcher acquiring product for research purposes. PurePep reserves the right to verify any of these representations and to refuse or cancel any order at its discretion.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Orders and payment</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>An order placed through the site is an offer to purchase. PurePep accepts the offer only when payment clears and the order is dispatched; until that point we may decline or cancel for any reason, including suspected misuse, sanctioned destinations, payment risk, or stock issues. Prices and product availability shown on the site can change without notice.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Payment is processed by a third-party payment gateway. PurePep does not store payment card numbers. Currency is United States dollars unless explicitly indicated otherwise.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Shipping and returns</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Shipping origin, carrier, and transit times are described on the product page and during checkout. Title and risk of loss pass to you when the carrier accepts the package from us [TKTK].</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>All sales are final. No refunds. No exchanges. No returns.</strong> This policy reflects the nature of research-grade material, which cannot be re-sold once it has left our facility. The only exceptions are made when a package fails to arrive, is delivered damaged in transit, or is materially different from what was ordered. In those cases, contact us within seven days of the delivery scan and we will arrange a replacement at our discretion.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Limitation of liability</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>To the maximum extent permitted by law, PurePep is not liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or use, arising from or relating to your purchase or use of any product, even if PurePep has been advised of the possibility of such damages. PurePep&rsquo;s aggregate liability for any claim related to a product is limited to the amount you paid for that product.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nothing in these terms excludes or limits liability for death, personal injury caused by negligence, fraud, or any other liability that cannot be excluded under applicable law.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Governing law</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>These terms are governed by the laws of [TKTK jurisdiction] without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these terms or your use of the site will be brought exclusively in the courts located in [TKTK jurisdiction], and you consent to the personal jurisdiction of those courts.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Changes to these terms</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>PurePep may revise these terms at any time. Material changes will be reflected by updating the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of the site after a revision constitutes acceptance of the revised terms.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Questions about these terms can be sent to <a href="mailto:[TKTK]">[TKTK]</a>.</p>
<!-- /wp:paragraph -->
HTML;
}

/**
 * Age verification block content.
 *
 * Brief explainer of the site-wide age gate. Single paragraph explaining
 * the 18+ + researcher requirement, plus a button block back to the shop.
 */
function purepep_page_content_age_verification(): string {
	$shop = function_exists( 'wc_get_page_permalink' )
		? wc_get_page_permalink( 'shop' )
		: home_url( '/shop/' );

	return sprintf(
		<<<'HTML'
<!-- wp:paragraph -->
<p>Access to purepep.shop is restricted to qualified researchers aged 18 or older. Before you can browse the catalog or place an order, the site asks you to confirm two things: that you are at least 18 years old, and that you are acquiring research-grade peptides for legitimate in-vitro research, not for human or veterinary consumption.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The age gate appears the first time you visit the site and any time your browser session expires. Confirming the two boxes stores a per-session marker so the gate does not appear again until you close your browser. No personally identifying information is captured by the gate itself; it is a simple acknowledgement of the terms under which the site is offered. Order checkout independently confirms your eligibility through the information you provide at the billing step.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>If you cannot confirm both statements, please leave the site. If you confirmed in error, clear your browser&rsquo;s session storage or close all tabs of purepep.shop to reset the acknowledgement.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button" href="%s">Return to shop</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
HTML,
		esc_url( $shop )
	);
}

/**
 * Register the menu locations the storefront chrome references.
 *
 * Locations only — the menus themselves are managed in WP Admin →
 * Appearance → Menus and assigned to these locations there. The header
 * uses primary-nav; the footer uses footer-col-1 through footer-col-5.
 */
function purepep_register_nav_menus(): void {
	register_nav_menus(
		[
			'primary-nav'  => __( 'Primary navigation', 'purepep' ),
			'footer-col-1' => __( 'Footer · column 1 (Catalog)', 'purepep' ),
			'footer-col-2' => __( 'Footer · column 2 (Quality)', 'purepep' ),
			'footer-col-3' => __( 'Footer · column 3 (Account)', 'purepep' ),
			'footer-col-4' => __( 'Footer · column 4 (Policies)', 'purepep' ),
			'footer-col-5' => __( 'Footer · column 5 (Compliance)', 'purepep' ),
		]
	);
}
