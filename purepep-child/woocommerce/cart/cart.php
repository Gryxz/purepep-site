<?php
/**
 * Cart page template — PurePep.
 *
 * Self-contained WooCommerce cart override. Mirrors the cart state from
 * design-system/ui_kits/storefront/checkout.html. Includes the full PurePep
 * chrome (compliance ribbon, header, footer, age gate) so the override does
 * not depend on get_header() / get_footer().
 *
 * Note: WooCommerce normally renders this template *inside* the cart page's
 * standard wrapper (page.php). To avoid double-chrome, set the cart page's
 * template to "Page — no title (full width)" in WP Admin → Pages, or add a
 * filter to short-circuit the_content for the cart page.
 *
 * All marketing numerics render as [TKTK] until the brand team approves
 * production copy.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

$pp_woo        = function_exists( 'WC' );
$pp_cart       = $pp_woo ? WC()->cart : null;
$pp_cart_count = $pp_cart ? $pp_cart->get_cart_contents_count() : 0;
$pp_cart_items = $pp_cart ? $pp_cart->get_cart() : [];

$pp_cart_url     = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_checkout_url = $pp_woo ? wc_get_checkout_url() : home_url( '/checkout/' );
$pp_shop_url     = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url   = home_url( '/?s=&post_type=product' );

$pp_lockup_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 313 72" aria-label="PurePep">'
	. '<g fill="currentColor">'
	. '<rect x="4" y="4" width="22" height="64"/>'
	. '<rect x="26" y="22" width="8" height="2"/>'
	. '<rect x="26" y="29" width="8" height="2"/>'
	. '<rect x="34" y="4" width="22" height="36"/>'
	. '</g>'
	. '<g transform="translate(78 56)" fill="currentColor">'
	. '<g transform="translate(0.000 0) scale(0.02734 -0.02734)"><path d="M96 0V1490H738Q904 1490 1028.5 1424.5Q1153 1359 1222.5 1240.0Q1292 1121 1292 962Q1292 802 1221.0 685.5Q1150 569 1022.0 505.5Q894 442 724 442H500V0ZM500 756H642Q714 756 765.0 781.5Q816 807 843.0 853.0Q870 899 870 962Q870 1027 843.0 1072.5Q816 1118 765.0 1142.0Q714 1166 642 1166H500Z"/></g>'
	. '<g transform="translate(35.630 0) scale(0.02734 -0.02734)"><path d="M492 -14Q374 -14 286.0 40.0Q198 94 150.0 189.0Q102 284 102 406V1118H504V490Q504 407 546.0 359.5Q588 312 664 312Q714 312 750.0 333.5Q786 355 806.0 395.0Q826 435 826 490V1118H1228V0H851L844 253Q806 147 732 73Q646 -14 492 -14Z"/></g>'
	. '<g transform="translate(70.877 0) scale(0.02734 -0.02734)"><path d="M102 0V1118H492V904H504Q534 1023 600.5 1077.5Q667 1132 756 1132Q782 1132 808.0 1128.0Q834 1124 858 1116V774Q828 785 784.5 789.5Q741 794 710 794Q651 794 604.0 767.5Q557 741 530.5 693.5Q504 646 504 582V0Z"/></g>'
	. '<g transform="translate(94.038 0) scale(0.02734 -0.02734)"><path d="M638 -20Q459 -20 329.5 48.5Q200 117 131.0 246.0Q62 375 62 556Q62 729 131.5 858.5Q201 988 328.0 1060.0Q455 1132 628 1132Q755 1132 857.5 1092.5Q960 1053 1033.0 978.5Q1106 904 1145.0 798.0Q1184 692 1184 558V466H456Q458 401 480 358Q503 309 546.0 285.5Q589 262 646 262Q687 262 720.5 273.5Q754 285 778.0 306.5Q802 328 814 359L1168 307Q1140 207 1069.0 133.5Q998 60 889.5 20.0Q781 -20 638 -20ZM459 686H805Q801 725 788 755Q768 801 729.0 825.5Q690 850 632.0 850.0Q574 850 535.0 825.5Q496 801 476 755Q463 725 459 686Z"/></g>'
	. '<g transform="translate(126.879 0) scale(0.02734 -0.02734)"><path d="M96 0V1490H738Q904 1490 1028.5 1424.5Q1153 1359 1222.5 1240.0Q1292 1121 1292 962Q1292 802 1221.0 685.5Q1150 569 1022.0 505.5Q894 442 724 442H500V0ZM500 756H642Q714 756 765.0 781.5Q816 807 843.0 853.0Q870 899 870 962Q870 1027 843.0 1072.5Q816 1118 765.0 1142.0Q714 1166 642 1166H500Z"/></g>'
	. '<g transform="translate(162.509 0) scale(0.02734 -0.02734)"><path d="M638 -20Q459 -20 329.5 48.5Q200 117 131.0 246.0Q62 375 62 556Q62 729 131.5 858.5Q201 988 328.0 1060.0Q455 1132 628 1132Q755 1132 857.5 1092.5Q960 1053 1033.0 978.5Q1106 904 1145.0 798.0Q1184 692 1184 558V466H456Q458 401 480 358Q503 309 546.0 285.5Q589 262 646 262Q687 262 720.5 273.5Q754 285 778.0 306.5Q802 328 814 359L1168 307Q1140 207 1069.0 133.5Q998 60 889.5 20.0Q781 -20 638 -20ZM459 686H805Q801 725 788 755Q768 801 729.0 825.5Q690 850 632.0 850.0Q574 850 535.0 825.5Q496 801 476 755Q463 725 459 686Z"/></g>'
	. '<g transform="translate(195.350 0) scale(0.02734 -0.02734)"><path d="M102 -418V1118H500V922H510Q532 979 574.0 1027.0Q616 1075 678.5 1103.5Q741 1132 824 1132Q935 1132 1034.5 1073.0Q1134 1014 1197.0 887.5Q1260 761 1260 558Q1260 365 1200.0 238.0Q1140 111 1040.0 48.5Q940 -14 820 -14Q742 -14 680.5 12.0Q619 38 576.0 82.5Q533 127 510 184H504V-418ZM672 294Q728 294 766.5 325.5Q805 357 825.5 416.5Q846 476 846 558Q846 641 825.5 700.5Q805 760 766.5 792.0Q728 824 672 824Q617 824 577.0 792.0Q537 760 515.5 700.5Q494 641 494 558Q494 477 515.5 418.0Q537 359 577.0 326.5Q617 294 672 294Z"/></g>'
	. '</g></svg>';

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cart &mdash; <?php bloginfo( 'name' ); ?></title>
<?php wp_head(); ?>
<style>
body.pp-locked { overflow: hidden; }

.pp-ribbon { background: var(--pp-bone); border-bottom: var(--bw) solid var(--pp-ink); font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); }
.pp-ribbon-inner { max-width: var(--max-content); margin: 0 auto; padding: 9px var(--s-5); display: flex; gap: var(--s-4); justify-content: center; white-space: nowrap; flex-wrap: nowrap; overflow: hidden; }
.pp-ribbon-inner span + span::before { content: '·'; padding: 0 12px; }

.pp-header { background: var(--pp-bone); position: relative; z-index: 10; }
.pp-header-inner { max-width: var(--max-content); margin: 0 auto; padding: 20px var(--s-5); display: grid; grid-template-columns: 220px 1fr auto; align-items: center; gap: var(--s-6); border-bottom: var(--bw) solid var(--pp-ink); }
.pp-lockup { display: inline-block; line-height: 0; text-decoration: none; color: var(--pp-ink); }
.pp-lockup svg { height: 36px; width: auto; display: block; }
.pp-nav { display: flex; justify-content: center; gap: 36px; align-items: center; }
.pp-nav a { font-family: var(--font-sans); font-weight: 500; font-size: 14px; color: var(--pp-ink); text-decoration: none; padding: 8px 0; border-bottom: var(--bw) solid transparent; letter-spacing: -0.005em; transition: border-color var(--dur-fast) var(--ease); }
.pp-nav a:hover, .pp-nav a.is-active { border-bottom-color: var(--pp-ink); }
.pp-actions { display: flex; gap: 18px; align-items: center; }
.pp-iconbtn { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--pp-ink); cursor: pointer; padding: 6px; }
.pp-cart-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: transparent; border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); color: var(--pp-ink); text-decoration: none; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: 0.12em; }

.pp-age-gate { position: fixed; inset: 0; z-index: 100; background: var(--pp-bone); display: flex; align-items: center; justify-content: center; padding: 48px var(--s-5); }
.pp-age-gate[hidden] { display: none; }
.pp-age-gate-card { width: 100%; max-width: 520px; }
.pp-age-gate-lockup { display: flex; justify-content: center; margin-bottom: 44px; color: var(--pp-ink); }
.pp-age-gate-lockup svg { height: 48px; width: auto; display: block; }
.pp-age-gate h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(32px, 4.2vw, 42px); letter-spacing: -0.03em; line-height: 1.05; color: var(--pp-ink); text-align: center; margin: 16px 0 24px; }
.pp-age-gate p { font-family: var(--font-sans); font-size: 15px; line-height: 1.65; color: var(--pp-ink); text-align: center; max-width: 440px; margin: 0 auto 14px; }
.pp-age-gate-checks { border: var(--bw) solid var(--pp-ink); padding: 20px 24px; display: grid; gap: 12px; margin: 36px 0 28px; }
.pp-age-gate label { display: grid; grid-template-columns: 18px 1fr; gap: 12px; align-items: start; cursor: pointer; font-family: var(--font-sans); font-size: 14px; line-height: 1.5; color: var(--pp-ink); }
.pp-age-gate input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin: 2px 0 0; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); cursor: pointer; display: grid; place-content: center; }
.pp-age-gate input[type="checkbox"]:checked { background: var(--pp-ink); }
.pp-age-gate input[type="checkbox"]:checked::after { content: ''; width: 10px; height: 6px; border-left: 2px solid var(--pp-bone); border-bottom: 2px solid var(--pp-bone); transform: rotate(-45deg) translate(1px, -1px); }
.pp-age-gate-cta { width: 100%; height: 56px; background: var(--pp-line); color: var(--pp-ink-muted); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; cursor: not-allowed; margin-bottom: 20px; transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease); }
.pp-age-gate-cta:not([disabled]) { background: var(--pp-ink); color: var(--pp-bone); cursor: pointer; }
.pp-age-gate-leave { display: block; text-align: center; margin-bottom: 48px; font-family: var(--font-sans); font-size: 14px; font-weight: 500; color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px; }
.pp-age-gate-disclaimer { text-align: center; font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); line-height: 1.8; }

@media (max-width: 1024px) { .pp-header-inner { grid-template-columns: 1fr auto; } .pp-nav { display: none; } }
</style>
</head>
<body <?php body_class( 'pp-cart' ); ?>>

<div class="pp-age-gate" id="pp-age-gate" hidden role="dialog" aria-modal="true" aria-labelledby="pp-age-gate-title">
	<div class="pp-age-gate-card">
		<div class="pp-age-gate-lockup"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div style="text-align:center;"><span class="pp-eyebrow">Restricted access · 21+ qualified researchers</span></div>
		<h1 id="pp-age-gate-title">Verify you&rsquo;re a qualified researcher.</h1>
		<p>PurePep supplies research-grade peptides for in-vitro study only. These are not dietary supplements, therapeutics, or products for human or veterinary consumption.</p>
		<p>Access is restricted to qualified scientific researchers aged 21 or older.</p>
		<div class="pp-age-gate-checks">
			<label><input type="checkbox" data-pp-gate-check><span>I am 21 years of age or older.</span></label>
			<label><input type="checkbox" data-pp-gate-check><span>I am a qualified scientific researcher and will use these products for research purposes only.</span></label>
		</div>
		<button class="pp-age-gate-cta" data-pp-enter disabled type="button">Enter site</button>
		<a class="pp-age-gate-leave" href="https://www.google.com" rel="noopener">Leave site</a>
		<div class="pp-age-gate-disclaimer">For research use only · Not for human consumption<br>© <?php echo esc_html( gmdate( 'Y' ) ); ?> PurePep · All sales final</div>
	</div>
</div>

<div class="pp-ribbon">
	<div class="pp-ribbon-inner">
		<span>For research use only</span>
		<span>21+ qualified researchers</span>
		<span>All sales final</span>
	</div>
</div>

<header class="pp-header">
	<div class="pp-header-inner">
		<a class="pp-lockup" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
		<nav class="pp-nav" aria-label="Primary">
			<a href="<?php echo esc_url( $pp_shop_url ); ?>">Catalog</a>
			<a href="<?php echo esc_url( home_url( '/product/reta-10mg/' ) ); ?>">RETA</a>
			<a href="<?php echo esc_url( home_url( '/quality/' ) ); ?>">Quality</a>
			<a href="<?php echo esc_url( home_url( '/documentation/' ) ); ?>">Documentation</a>
			<a href="<?php echo esc_url( home_url( '/affiliates/' ) ); ?>">Affiliates</a>
			<a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Account</a>
		</nav>
		<div class="pp-actions">
			<a class="pp-iconbtn" href="<?php echo esc_url( $pp_search_url ); ?>" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></a>
			<a class="pp-cart-btn is-active" href="<?php echo esc_url( $pp_cart_url ); ?>" aria-label="Cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><span><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?></span></a>
		</div>
	</div>
</header>

<style>
.pp-cart-section { background: var(--pp-bone); }
.pp-cart-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5) var(--s-9); }
.pp-cart-head { margin-bottom: var(--s-6); display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--s-3); }
.pp-cart-head h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(48px, 6vw, 88px); letter-spacing: -0.035em; line-height: 1; color: var(--pp-ink); margin-top: 12px; }
.pp-cart-head .pp-eyebrow { color: var(--pp-ink-muted); }
.pp-cart-grid { display: grid; grid-template-columns: 7fr 5fr; gap: var(--s-7); align-items: start; }
@media (max-width: 1024px) { .pp-cart-grid { grid-template-columns: 1fr; } }

.pp-cart-table { border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); overflow: hidden; background: var(--pp-bone); }
.pp-cart-table-head { display: grid; grid-template-columns: 80px 1fr 140px 140px 100px 24px; gap: var(--s-4); padding: var(--s-4) var(--s-5); border-bottom: var(--bw) solid var(--pp-ink); align-items: baseline; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-cart-row { display: grid; grid-template-columns: 80px 1fr 140px 140px 100px 24px; gap: var(--s-4); padding: var(--s-5); border-bottom: var(--bw) solid var(--pp-line); align-items: center; }
.pp-cart-row:last-child { border-bottom: none; }
.pp-cart-thumb { width: 80px; height: 80px; border: var(--bw) solid var(--pp-ink); background: var(--pp-surface); display: grid; place-items: center; overflow: hidden; }
.pp-cart-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-cart-thumb-fallback { font-family: var(--font-mono); font-size: 9px; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); text-align: center; padding: 4px; }
.pp-cart-name { font-family: var(--font-sans); font-weight: 700; font-size: 16px; color: var(--pp-ink); letter-spacing: -0.01em; text-decoration: none; }
.pp-cart-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.pp-cart-meta { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); margin-top: 6px; }
.pp-cart-qty { display: inline-flex; border: var(--bw) solid var(--pp-ink); align-items: stretch; }
.pp-cart-qty button { background: var(--pp-bone); border: none; color: var(--pp-ink); width: 32px; cursor: pointer; font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
.pp-cart-qty button:hover { background: var(--pp-bone-soft); }
.pp-cart-qty input { width: 48px; text-align: center; border: none; border-left: var(--bw) solid var(--pp-ink); border-right: var(--bw) solid var(--pp-ink); background: var(--pp-bone); font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--pp-ink); padding: 6px 0; -moz-appearance: textfield; }
.pp-cart-qty input::-webkit-outer-spin-button, .pp-cart-qty input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.pp-cart-price, .pp-cart-line { font-family: var(--font-sans); font-weight: 600; font-size: 15px; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-cart-line { font-weight: 700; }
.pp-cart-remove { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--pp-alert); background: transparent; border: none; cursor: pointer; padding: 4px 6px; text-decoration: none; line-height: 1; }
.pp-cart-remove:hover { color: var(--pp-alert); text-decoration: underline; text-underline-offset: 3px; }

.pp-cart-empty { padding: var(--s-9) var(--s-5); text-align: center; }
.pp-cart-empty h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(28px, 3vw, 36px); letter-spacing: -0.025em; color: var(--pp-ink); margin-top: 12px; }
.pp-cart-empty p { font-family: var(--font-sans); font-size: 16px; color: var(--pp-ink); margin: 16px auto 24px; max-width: 520px; }

.pp-cart-actions { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--s-3); padding: var(--s-4) var(--s-5); border-top: var(--bw) solid var(--pp-ink); background: var(--pp-bone-soft); }
.pp-cart-update-btn, .pp-cart-coupon-btn { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; padding: 10px 16px; background: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: 0; color: var(--pp-ink); cursor: pointer; text-decoration: none; }
.pp-cart-update-btn:hover, .pp-cart-coupon-btn:hover { background: var(--pp-bone); }
.pp-cart-coupon { display: flex; gap: 8px; align-items: center; }
.pp-cart-coupon input[type="text"] { height: 38px; padding: 0 12px; border: var(--bw) solid var(--pp-ink); border-radius: 0; background: var(--pp-bone); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-ink); width: 160px; }

@media (max-width: 720px) {
	.pp-cart-table-head { display: none; }
	.pp-cart-row { grid-template-columns: 64px 1fr auto; grid-template-areas: 'thumb info remove' 'thumb meta meta' 'qty price line'; gap: var(--s-3); }
	.pp-cart-thumb { grid-area: thumb; width: 64px; height: 64px; }
}
</style>

<!-- ==================== CART ==================== -->
<section class="pp-cart-section" aria-labelledby="pp-cart-title">
	<div class="pp-cart-inner">
		<div class="pp-cart-head">
			<div>
				<span class="pp-eyebrow">Review your order before checkout</span>
				<h1 id="pp-cart-title">Cart</h1>
			</div>
			<span class="pp-eyebrow"><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?> item<?php echo 1 === $pp_cart_count ? '' : 's'; ?></span>
		</div>

		<?php if ( ! $pp_woo || empty( $pp_cart_items ) ) : ?>
			<div class="pp-cart-table">
				<div class="pp-cart-empty">
					<span class="pp-eyebrow">Empty cart</span>
					<h2>Your cart is empty.</h2>
					<p>Start with the catalog &mdash; every compound ships with a lot-matched certificate of analysis.</p>
					<a class="pp-cart-update-btn" href="<?php echo esc_url( $pp_shop_url ); ?>">Browse catalog &rarr;</a>
				</div>
			</div>
		<?php else : ?>
		<div class="pp-cart-grid">
			<form action="<?php echo esc_url( $pp_cart_url ); ?>" method="post" class="pp-cart-form woocommerce-cart-form">
				<?php do_action( 'woocommerce_before_cart_table' ); ?>

				<div class="pp-cart-table">
					<div class="pp-cart-table-head" role="row">
						<span></span>
						<span>Product</span>
						<span>Quantity</span>
						<span>Unit price</span>
						<span>Line total</span>
						<span></span>
					</div>

					<?php
					foreach ( $pp_cart_items as $cart_item_key => $cart_item ) {
						$_product   = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
						$product_id = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );
						if ( ! $_product || ! $_product->exists() || $cart_item['quantity'] <= 0 ) {
							continue;
						}
						$pp_cas    = get_post_meta( $product_id, '_pp_cas', true );
						$pp_dose   = get_post_meta( $product_id, '_pp_dose', true );
						$pp_lot    = get_post_meta( $product_id, '_pp_lot', true );
						$permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
						$thumb_id  = apply_filters( 'woocommerce_cart_item_thumbnail', $_product->get_image_id(), $cart_item, $cart_item_key );
						?>
						<div class="pp-cart-row" data-cart-item-key="<?php echo esc_attr( $cart_item_key ); ?>">
							<div class="pp-cart-thumb">
								<?php if ( $thumb_id ) : ?>
									<?php echo wp_get_attachment_image( $thumb_id, [ 80, 80 ], false, [ 'alt' => esc_attr( $_product->get_name() ) ] ); ?>
								<?php else : ?>
									<span class="pp-cart-thumb-fallback">[TKTK]</span>
								<?php endif; ?>
							</div>
							<div>
								<?php if ( $permalink ) : ?>
									<a class="pp-cart-name" href="<?php echo esc_url( $permalink ); ?>"><?php echo esc_html( $_product->get_name() ); ?></a>
								<?php else : ?>
									<span class="pp-cart-name"><?php echo esc_html( $_product->get_name() ); ?></span>
								<?php endif; ?>
								<div class="pp-cart-meta">
									<?php echo $pp_cas ? 'CAS ' . esc_html( $pp_cas ) : 'CAS [TKTK]'; ?> ·
									<?php echo $pp_dose ? esc_html( $pp_dose ) : '[TKTK]'; ?> ·
									LOT <?php echo $pp_lot ? esc_html( $pp_lot ) : '[TKTK]'; ?>
								</div>
							</div>
							<div class="pp-cart-qty">
								<button type="button" data-pp-qty="-1" data-target="pp-qty-<?php echo esc_attr( $cart_item_key ); ?>" aria-label="Decrease">&minus;</button>
								<input type="number" id="pp-qty-<?php echo esc_attr( $cart_item_key ); ?>" name="cart[<?php echo esc_attr( $cart_item_key ); ?>][qty]" value="<?php echo esc_attr( $cart_item['quantity'] ); ?>" min="0" max="<?php echo esc_attr( $_product->get_max_purchase_quantity() > 0 ? $_product->get_max_purchase_quantity() : 99 ); ?>" inputmode="numeric">
								<button type="button" data-pp-qty="+1" data-target="pp-qty-<?php echo esc_attr( $cart_item_key ); ?>" aria-label="Increase">+</button>
							</div>
							<div class="pp-cart-price">[TKTK]</div>
							<div class="pp-cart-line">[TKTK]</div>
							<div>
								<a class="pp-cart-remove" href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>" aria-label="Remove <?php echo esc_attr( $_product->get_name() ); ?>" title="Remove from cart">&times;</a>
							</div>
						</div>
						<?php
					}
					do_action( 'woocommerce_cart_contents' );
					?>

					<div class="pp-cart-actions">
						<div class="pp-cart-coupon">
							<label for="pp-coupon" class="pp-eyebrow">Coupon</label>
							<input type="text" id="pp-coupon" name="coupon_code" placeholder="[TKTK]" autocomplete="off">
							<button type="submit" class="pp-cart-coupon-btn" name="apply_coupon" value="Apply">Apply &rarr;</button>
						</div>
						<button type="submit" class="pp-cart-update-btn" name="update_cart" value="Update cart">Update cart &rarr;</button>
					</div>
				</div>
				<?php wp_nonce_field( 'woocommerce-cart' ); ?>
				<?php do_action( 'woocommerce_after_cart_contents' ); ?>
				<?php do_action( 'woocommerce_after_cart_table' ); ?>
			</form>

			<?php // ---- ORDER SUMMARY (right column) ----------------------------------- ?>
			<aside class="pp-summary" aria-label="Order summary">
				<div class="pp-summary-card">
					<div class="pp-summary-head">
						<span class="pp-eyebrow">Order summary</span>
						<h2>Totals</h2>
					</div>
					<div class="pp-summary-rows">
						<div class="pp-summary-row">
							<span class="pp-summary-label">Subtotal · <?php echo esc_html( $pp_cart_count ); ?> item<?php echo 1 === $pp_cart_count ? '' : 's'; ?></span>
							<span class="pp-summary-value">[TKTK]</span>
						</div>
						<?php if ( $pp_cart && $pp_cart->get_applied_coupons() ) : ?>
							<?php foreach ( $pp_cart->get_coupons() as $code => $coupon ) : ?>
								<div class="pp-summary-row pp-summary-row--discount">
									<span class="pp-summary-label">Coupon &middot; <?php echo esc_html( strtoupper( $code ) ); ?></span>
									<span class="pp-summary-value">&minus;[TKTK]</span>
								</div>
							<?php endforeach; ?>
						<?php endif; ?>
						<div class="pp-summary-row">
							<span class="pp-summary-label">Shipping &middot; cold-chain</span>
							<span class="pp-summary-value">[TKTK]</span>
						</div>
						<?php if ( wc_tax_enabled() ) : ?>
							<div class="pp-summary-row">
								<span class="pp-summary-label">Tax</span>
								<span class="pp-summary-value">[TKTK]</span>
							</div>
						<?php endif; ?>
					</div>
					<div class="pp-summary-total">
						<span class="pp-summary-total-label">Total</span>
						<span class="pp-summary-total-value">[TKTK]</span>
					</div>
					<a class="pp-checkout-btn" href="<?php echo esc_url( $pp_checkout_url ); ?>">
						Proceed to checkout
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
					</a>
					<a class="pp-keep-shopping" href="<?php echo esc_url( $pp_shop_url ); ?>">&larr; Keep shopping</a>
				</div>

				<div class="pp-trust-badges" aria-label="Trust signals">
					<div class="pp-trust-badge"><div class="pp-trust-badge-stat">[TKTK]%</div><div class="pp-trust-badge-label">Lab-verified purity</div></div>
					<div class="pp-trust-badge"><div class="pp-trust-badge-stat">[TKTK]</div><div class="pp-trust-badge-label">Cold-chain ship</div></div>
					<div class="pp-trust-badge"><div class="pp-trust-badge-stat">[TKTK]</div><div class="pp-trust-badge-label">USA synthesis</div></div>
					<div class="pp-trust-badge"><div class="pp-trust-badge-stat">[TKTK]</div><div class="pp-trust-badge-label">Independent COA</div></div>
				</div>

				<div class="pp-no-refund">
					<span class="pp-eyebrow" style="color: var(--pp-alert);">All sales final</span>
					<p>No refunds, no exchanges, no returns. Review the certificate of analysis for each lot before purchase. Sales restricted to qualified researchers, 21 and over.</p>
				</div>
			</aside>
		</div>
		<?php endif; ?>
	</div>
</section>

<style>
.pp-summary { display: flex; flex-direction: column; gap: var(--s-5); position: sticky; top: var(--s-5); }
@media (max-width: 1024px) { .pp-summary { position: static; } }
.pp-summary-card { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); border-radius: var(--r-md); padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.pp-summary-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: 28px; letter-spacing: -0.02em; color: var(--pp-ink); margin-top: 8px; }
.pp-summary-rows { display: flex; flex-direction: column; gap: var(--s-3); padding-bottom: var(--s-4); border-bottom: var(--bw) solid var(--pp-line); }
.pp-summary-row { display: flex; justify-content: space-between; align-items: baseline; gap: var(--s-3); }
.pp-summary-label { font-family: var(--font-sans); font-size: 14px; color: var(--pp-ink); }
.pp-summary-value { font-family: var(--font-sans); font-weight: 600; font-size: 14px; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-summary-row--discount .pp-summary-value { color: var(--pp-emerald); }
.pp-summary-total { display: flex; justify-content: space-between; align-items: baseline; padding-top: var(--s-2); }
.pp-summary-total-label { font-family: var(--font-sans); font-weight: 700; font-size: 18px; color: var(--pp-ink); }
.pp-summary-total-value { font-family: var(--font-sans); font-weight: 900; font-size: 28px; letter-spacing: -0.02em; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-checkout-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 56px; background: var(--pp-emerald); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; cursor: pointer; transition: background var(--dur-fast) var(--ease); }
.pp-checkout-btn:hover { background: #0a4d24; color: var(--pp-bone); }
.pp-keep-shopping { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); text-decoration: none; text-align: center; padding: 4px; }
.pp-keep-shopping:hover { color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px; }

.pp-trust-badges { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); border-radius: var(--r-md); overflow: hidden; }
.pp-trust-badge { padding: var(--s-4); border-right: var(--bw) solid var(--pp-line); border-bottom: var(--bw) solid var(--pp-line); text-align: center; }
.pp-trust-badge:nth-child(2n) { border-right: none; }
.pp-trust-badge:nth-child(n+3) { border-bottom: none; }
.pp-trust-badge-stat { font-family: var(--font-sans); font-weight: 900; font-size: 22px; letter-spacing: -0.02em; color: var(--pp-ink); margin-bottom: 4px; }
.pp-trust-badge-label { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink-muted); }

.pp-no-refund { padding: var(--s-4); border: var(--bw) solid var(--pp-alert); background: var(--pp-alert-soft); border-radius: var(--r-md); }
.pp-no-refund p { font-family: var(--font-sans); font-size: 13px; line-height: 1.55; color: var(--pp-ink); margin-top: 8px; }

.pp-blush-band { background: var(--pp-blush); }
.pp-blush-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5); text-align: center; }
.pp-blush-inner blockquote { font-family: var(--font-sans); font-weight: 900; font-size: clamp(28px, 3.4vw, 44px); letter-spacing: -0.025em; line-height: 1.1; color: var(--pp-ink); max-width: 880px; margin: 0 auto 24px; text-wrap: balance; }
.pp-blush-attribution { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); }

.pp-footer { background: var(--pp-ink); color: var(--pp-bone); }
.pp-footer-inner { max-width: var(--max-content); margin: 0 auto; padding: 72px var(--s-5) 40px; }
.pp-footer-cols { display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: var(--s-7); }
.pp-footer-brand p { font-family: var(--font-sans); font-size: 13.5px; line-height: 1.6; color: rgba(250, 247, 240, 0.75); margin-top: 18px; max-width: 280px; }
.pp-footer-brand .pp-lockup { color: var(--pp-bone); }
.pp-footer-brand .pp-lockup svg { height: 40px; width: auto; }
.pp-footer-col h4 { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(250, 247, 240, 0.55); margin-bottom: 14px; }
.pp-footer-col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.pp-footer-col a { font-family: var(--font-sans); font-size: 13.5px; color: var(--pp-bone); text-decoration: none; }
.pp-footer-col a:hover { text-decoration: underline; }
.pp-footer-rule { height: var(--bw); background: rgba(250, 247, 240, 0.2); margin: var(--s-7) 0 var(--s-4); border: 0; }
.pp-footer-base { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-family: var(--font-mono); font-size: 10.5px; color: rgba(250, 247, 240, 0.55); letter-spacing: 0.14em; text-transform: uppercase; }
@media (max-width: 1024px) { .pp-footer-cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px)  { .pp-footer-cols { grid-template-columns: 1fr; gap: var(--s-5); } }
</style>

<section class="pp-blush-band">
	<div class="pp-blush-inner">
		<blockquote>Every lot. Every assay. On record &mdash; before it leaves the building.</blockquote>
		<div class="pp-blush-attribution">PurePep quality standard &middot; <?php echo esc_html( gmdate( 'Y' ) ); ?></div>
	</div>
</section>

<footer class="pp-footer">
	<div class="pp-footer-inner">
		<div class="pp-footer-cols">
			<div class="pp-footer-brand">
				<a class="pp-lockup" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<p>Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped. Documentation on file.</p>
			</div>
			<div class="pp-footer-col"><h4>Catalog</h4><ul>
				<li><a href="<?php echo esc_url( home_url( '/product/reta-10mg/' ) ); ?>">RETA · Retatrutide</a></li>
				<li><a href="<?php echo esc_url( home_url( '/product/sema-5mg/' ) ); ?>">SEMA · Semaglutide</a></li>
				<li><a href="<?php echo esc_url( home_url( '/product/tirz-10mg/' ) ); ?>">TIRZ · Tirzepatide</a></li>
				<li><a href="<?php echo esc_url( $pp_shop_url ); ?>">View all</a></li>
			</ul></div>
			<div class="pp-footer-col"><h4>Quality</h4><ul>
				<li><a href="<?php echo esc_url( home_url( '/coa/' ) ); ?>">Certificates of analysis</a></li>
				<li><a href="<?php echo esc_url( home_url( '/lab-partners/' ) ); ?>">Lab partners</a></li>
				<li><a href="<?php echo esc_url( home_url( '/shipping/' ) ); ?>">Cold-chain shipping</a></li>
				<li><a href="<?php echo esc_url( home_url( '/lots/' ) ); ?>">Lot traceability</a></li>
			</ul></div>
			<div class="pp-footer-col"><h4>Account</h4><ul>
				<li><a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Sign in</a></li>
				<li><a href="<?php echo esc_url( home_url( '/verify/' ) ); ?>">Researcher verification</a></li>
				<li><a href="<?php echo esc_url( home_url( '/orders/' ) ); ?>">Order history</a></li>
				<li><a href="<?php echo esc_url( home_url( '/reorder/' ) ); ?>">Re-order</a></li>
			</ul></div>
			<div class="pp-footer-col"><h4>Policies</h4><ul>
				<li><a href="<?php echo esc_url( home_url( '/no-refund/' ) ); ?>">No-refund policy</a></li>
				<li><a href="<?php echo esc_url( home_url( '/terms/' ) ); ?>">Terms of sale</a></li>
				<li><a href="<?php echo esc_url( home_url( '/privacy/' ) ); ?>">Privacy</a></li>
				<li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></li>
			</ul></div>
		</div>
		<hr class="pp-footer-rule">
		<div class="pp-footer-base">
			<span>For research use only · Not for human consumption · 21+ qualified researchers</span>
			<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> PurePep</span>
		</div>
	</div>
</footer>

<script>
(function () {
	var KEY = 'pp_age_gate_v1';
	var gate = document.getElementById('pp-age-gate');
	if (gate) {
		var skip = false;
		try { if (sessionStorage.getItem(KEY) === '1') skip = true; } catch (e) {}
		if (!skip) {
			gate.hidden = false;
			document.body.classList.add('pp-locked');
			var checks = gate.querySelectorAll('input[data-pp-gate-check]');
			var enter  = gate.querySelector('button[data-pp-enter]');
			function refresh() { var ok = true; checks.forEach(function (c) { if (!c.checked) ok = false; }); enter.disabled = !ok; }
			checks.forEach(function (c) { c.addEventListener('change', refresh); });
			enter.addEventListener('click', function () {
				try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
				gate.hidden = true;
				document.body.classList.remove('pp-locked');
			});
		}
	}

	document.querySelectorAll('[data-pp-qty]').forEach(function (b) {
		b.addEventListener('click', function () {
			var step = parseInt(b.getAttribute('data-pp-qty'), 10) || 0;
			var input = document.getElementById(b.getAttribute('data-target'));
			if (!input) return;
			var min = parseInt(input.min || '0', 10);
			var max = parseInt(input.max || '99', 10);
			var v = parseInt(input.value || '0', 10) + step;
			if (v < min) v = min; if (v > max) v = max;
			input.value = v;
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
	});
})();
</script>

<?php wp_footer(); ?>
</body>
</html>


