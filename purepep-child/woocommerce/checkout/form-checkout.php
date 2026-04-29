<?php
/**
 * Checkout form template — PurePep.
 *
 * Self-contained WooCommerce checkout override. Mirrors the checkout state
 * from design-system/ui_kits/storefront/checkout.html. Includes the full
 * PurePep chrome (compliance ribbon, header, footer, age gate) so the
 * override does not depend on get_header() / get_footer().
 *
 * Note: WooCommerce normally renders this template *inside* the checkout
 * page's standard wrapper (page.php). To avoid double-chrome, set the
 * checkout page's template to "Page — no title (full width)" in WP Admin →
 * Pages.
 *
 * Layout: 7/5 grid. Left column = woocommerce_checkout_billing +
 * woocommerce_checkout_shipping hooks. Right column =
 * woocommerce_checkout_order_review hook + ack checkbox + place-order button.
 *
 * All marketing numerics render as [TKTK].
 *
 * @package PurePep
 *
 * @var WC_Checkout|null $checkout WooCommerce passes the checkout instance
 *                                 through to this template.
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'WOOCOMMERCE_CHECKOUT' ) ) {
	define( 'WOOCOMMERCE_CHECKOUT', true );
}

$pp_woo      = function_exists( 'WC' );
$pp_checkout = isset( $checkout ) && $checkout instanceof WC_Checkout
	? $checkout
	: ( $pp_woo ? WC()->checkout() : null );

$pp_cart       = $pp_woo ? WC()->cart : null;
$pp_cart_count = $pp_cart ? $pp_cart->get_cart_contents_count() : 0;

$pp_cart_url     = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_checkout_url = $pp_woo ? wc_get_checkout_url() : home_url( '/checkout/' );
$pp_shop_url     = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url   = home_url( '/?s=&post_type=product' );

if ( $pp_checkout && ! $pp_checkout->get_checkout_fields() ) {
	echo '<p class="pp-empty-checkout">' . esc_html__( 'Sorry, your session has expired.', 'purepep' ) . ' <a href="' . esc_url( home_url() ) . '">' . esc_html__( 'Return to homepage', 'purepep' ) . '</a></p>';
	return;
}

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
<title>Checkout &mdash; <?php bloginfo( 'name' ); ?></title>
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
.pp-header-secure { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); display: inline-flex; align-items: center; gap: 8px; }

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

@media (max-width: 1024px) { .pp-header-inner { grid-template-columns: 1fr auto; } }
</style>
</head>
<body <?php body_class( 'pp-checkout-page' ); ?>>

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
		<div></div>
		<span class="pp-header-secure">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			Secure checkout
		</span>
	</div>
</header>

<style>
.pp-checkout-section { background: var(--pp-bone); }
.pp-checkout-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5) var(--s-9); }
.pp-checkout-head { margin-bottom: var(--s-7); display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--s-3); }
.pp-checkout-head h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(40px, 5vw, 72px); letter-spacing: -0.035em; line-height: 1; color: var(--pp-ink); margin-top: 12px; }
.pp-checkout-grid { display: grid; grid-template-columns: 7fr 5fr; gap: var(--s-7); align-items: start; }
@media (max-width: 1024px) { .pp-checkout-grid { grid-template-columns: 1fr; } }

.pp-checkout-card { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); border-radius: var(--r-md); padding: var(--s-6); display: flex; flex-direction: column; gap: var(--s-4); }
.pp-checkout-card + .pp-checkout-card { margin-top: var(--s-5); }
.pp-checkout-card-head { display: flex; align-items: baseline; gap: var(--s-3); padding-bottom: var(--s-4); border-bottom: var(--bw) solid var(--pp-line); }
.pp-checkout-card-head .pp-step { font-family: var(--font-sans); font-weight: 900; font-size: 28px; letter-spacing: -0.02em; color: var(--pp-ink); }
.pp-checkout-card-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: 22px; letter-spacing: -0.015em; color: var(--pp-ink); }

/* WooCommerce field overrides — target WC-emitted markup. */
.pp-checkout-fields .form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--s-4); }
.pp-checkout-fields .form-row-first, .pp-checkout-fields .form-row-last { display: inline-flex; flex-direction: column; width: calc(50% - 8px); }
.pp-checkout-fields .form-row-first { margin-right: 16px; }
.pp-checkout-fields label { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); }
.pp-checkout-fields .required { color: var(--pp-alert); }
.pp-checkout-fields input[type="text"],
.pp-checkout-fields input[type="email"],
.pp-checkout-fields input[type="tel"],
.pp-checkout-fields input[type="password"],
.pp-checkout-fields input[type="number"],
.pp-checkout-fields select,
.pp-checkout-fields textarea,
.pp-checkout-fields .select2-selection {
	height: 44px; padding: 0 14px;
	border: var(--bw) solid var(--pp-ink); border-radius: 0;
	background: var(--pp-bone);
	font-family: var(--font-sans); font-size: 15px; color: var(--pp-ink);
	width: 100%;
}
.pp-checkout-fields textarea { height: auto; min-height: 96px; padding: 12px 14px; }
.pp-checkout-fields input:focus, .pp-checkout-fields select:focus, .pp-checkout-fields textarea:focus { outline: 2px solid var(--pp-ink); outline-offset: 2px; }
.pp-checkout-fields .description { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-checkout-fields .woocommerce-input-wrapper { display: block; }

@media (max-width: 640px) {
	.pp-checkout-fields .form-row-first, .pp-checkout-fields .form-row-last { width: 100%; margin-right: 0; }
}

.pp-account-toggle { padding: var(--s-4); border: var(--bw) solid var(--pp-line); background: var(--pp-bone-soft); margin-bottom: var(--s-4); display: flex; gap: var(--s-3); align-items: baseline; flex-wrap: wrap; font-family: var(--font-sans); font-size: 14px; color: var(--pp-ink); }
.pp-account-toggle a { color: var(--pp-ink); text-decoration: underline; text-underline-offset: 3px; }
</style>

<!-- ==================== CHECKOUT ==================== -->
<section class="pp-checkout-section" aria-labelledby="pp-checkout-title">
	<div class="pp-checkout-inner">

		<div class="pp-checkout-head">
			<div>
				<span class="pp-eyebrow">Step 02 · Confirm and pay</span>
				<h1 id="pp-checkout-title">Checkout</h1>
			</div>
			<a class="pp-eyebrow" style="color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px;" href="<?php echo esc_url( $pp_cart_url ); ?>">&larr; Edit cart</a>
		</div>

		<?php
		// Notices (errors, coupon messages, etc.) at the top of the form so users
		// see validation problems above the fold.
		do_action( 'woocommerce_before_checkout_form', $pp_checkout );
		?>

		<form name="checkout" method="post" class="checkout woocommerce-checkout pp-checkout-form" action="<?php echo esc_url( $pp_checkout_url ); ?>" enctype="multipart/form-data">
			<div class="pp-checkout-grid">

				<!-- LEFT: Billing + shipping -->
				<div class="pp-checkout-left">
					<?php if ( $pp_checkout && $pp_checkout->get_checkout_fields() ) : ?>
						<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

						<?php if ( ! is_user_logged_in() ) : ?>
							<div class="pp-account-toggle">
								<span class="pp-eyebrow">Researcher account</span>
								<span>Already verified?
									<a href="<?php echo esc_url( wp_login_url( $pp_checkout_url ) ); ?>">Sign in to autofill &rarr;</a>
								</span>
							</div>
						<?php endif; ?>

						<div class="pp-checkout-card">
							<div class="pp-checkout-card-head">
								<span class="pp-step">01</span>
								<h2>Contact &amp; shipping</h2>
							</div>
							<div class="pp-checkout-fields">
								<?php do_action( 'woocommerce_checkout_billing' ); ?>
							</div>
						</div>

						<div class="pp-checkout-card">
							<div class="pp-checkout-card-head">
								<span class="pp-step">02</span>
								<h2>Ship to</h2>
							</div>
							<div class="pp-checkout-fields">
								<?php do_action( 'woocommerce_checkout_shipping' ); ?>
							</div>
						</div>

						<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
					<?php endif; ?>
				</div>

				<!-- RIGHT: Order review + place order -->
				<aside class="pp-checkout-right" aria-label="Order review">
					<div class="pp-checkout-card pp-review-card">
						<div class="pp-checkout-card-head">
							<span class="pp-step">03</span>
							<h2>Your order</h2>
						</div>
						<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
						<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
						<div id="order_review" class="woocommerce-checkout-review-order pp-order-review">
							<?php do_action( 'woocommerce_checkout_order_review' ); ?>
						</div>
						<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
					</div>

					<div class="pp-checkout-card pp-ack-card">
						<div class="pp-ack-row" data-pp-ack-row>
							<label>
								<input type="checkbox" data-pp-ack required>
								<span>I am a qualified researcher, 21+, and acknowledge that these compounds are for in-vitro research use only.</span>
							</label>
							<span class="pp-ack-finalrow">All sales final &middot; No refunds &middot; No returns</span>
						</div>
						<button type="submit" class="pp-place-order-btn" name="woocommerce_checkout_place_order" id="place_order" data-pp-place-order disabled value="<?php esc_attr_e( 'Place order', 'woocommerce' ); ?>" data-value="<?php esc_attr_e( 'Place order', 'woocommerce' ); ?>">
							Place order &mdash; [TKTK]
						</button>
						<?php if ( $pp_checkout ) { wp_nonce_field( 'woocommerce-process_checkout', 'woocommerce-process-checkout-nonce' ); } ?>
						<div class="pp-secure-badges">
							<span class="pp-secure-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>SSL secured</span>
							<span class="pp-secure-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>RUO compliant</span>
							<span class="pp-secure-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>21+ verified</span>
						</div>
					</div>

					<div class="pp-no-refund">
						<span class="pp-eyebrow" style="color: var(--pp-alert);">All sales final</span>
						<p>No refunds, no exchanges, no returns. Your card is charged when you place this order. Sales restricted to qualified researchers, 21 and over.</p>
					</div>
				</aside>

			</div>
		</form>

		<?php do_action( 'woocommerce_after_checkout_form', $pp_checkout ); ?>
	</div>
</section>

<style>
.pp-review-card .shop_table { width: 100%; border-collapse: collapse; }
.pp-review-card .shop_table th { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); text-align: left; padding: 10px 0; border-bottom: var(--bw) solid var(--pp-line); }
.pp-review-card .shop_table td { font-family: var(--font-sans); font-size: 14px; color: var(--pp-ink); padding: 12px 0; border-bottom: var(--bw) solid var(--pp-line); vertical-align: top; }
.pp-review-card .shop_table tfoot th, .pp-review-card .shop_table tfoot td { padding: 12px 0; border-bottom: var(--bw) solid var(--pp-line); }
.pp-review-card .shop_table .order-total th, .pp-review-card .shop_table .order-total td { font-family: var(--font-sans); font-weight: 900; font-size: 18px; letter-spacing: -0.01em; color: var(--pp-ink); border-bottom: none; padding-top: 16px; }
.pp-review-card .product-name { font-weight: 600; }
.pp-review-card .product-quantity { font-family: var(--font-mono); color: var(--pp-ink-muted); }
.pp-review-card .product-total, .pp-review-card .amount { font-variant-numeric: tabular-nums; }
.pp-review-card .woocommerce-shipping-methods { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.pp-review-card .woocommerce-shipping-methods label { font-family: var(--font-sans); font-size: 14px; color: var(--pp-ink); }

.pp-ack-card { padding: 0; }
.pp-ack-row { padding: var(--s-4); background: var(--pp-alert-soft); border-bottom: var(--bw) solid var(--pp-alert); transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
.pp-ack-row.is-checked { background: var(--pp-emerald-soft); border-bottom-color: var(--pp-emerald); }
.pp-ack-row label { display: grid; grid-template-columns: 18px 1fr; gap: 12px; cursor: pointer; font-family: var(--font-sans); font-size: 14px; line-height: 1.5; color: var(--pp-ink); }
.pp-ack-row input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin-top: 2px; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); cursor: pointer; display: grid; place-content: center; }
.pp-ack-row input[type="checkbox"]:checked { background: var(--pp-ink); }
.pp-ack-row input[type="checkbox"]:checked::after { content: ''; width: 10px; height: 6px; border-left: 2px solid var(--pp-bone); border-bottom: 2px solid var(--pp-bone); transform: rotate(-45deg) translate(1px, -1px); }
.pp-ack-finalrow { display: block; margin-top: 8px; padding-left: 30px; font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }

.pp-place-order-btn { width: calc(100% - 32px); margin: var(--s-4) 16px var(--s-4); height: 56px; background: var(--pp-ink); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 15px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background var(--dur-fast) var(--ease); }
.pp-place-order-btn:hover { background: #000; }
.pp-place-order-btn[disabled] { background: var(--pp-line); color: var(--pp-ink-muted); cursor: not-allowed; }

.pp-secure-badges { display: flex; gap: var(--s-3); justify-content: center; flex-wrap: wrap; padding: 0 var(--s-4) var(--s-4); }
.pp-secure-badge { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink-muted); }

.pp-no-refund { padding: var(--s-4); border: var(--bw) solid var(--pp-alert); background: var(--pp-alert-soft); border-radius: var(--r-md); margin-top: var(--s-5); }
.pp-no-refund p { font-family: var(--font-sans); font-size: 13px; line-height: 1.55; color: var(--pp-ink); margin-top: 8px; }

.pp-empty-checkout { padding: var(--s-9) var(--s-5); text-align: center; font-family: var(--font-sans); font-size: 16px; color: var(--pp-ink); }

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
	// --- Age gate ---------------------------------------------------------
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

	// --- Researcher ack gates the place-order button ----------------------
	var ack    = document.querySelector('[data-pp-ack]');
	var place  = document.querySelector('[data-pp-place-order]');
	var ackRow = document.querySelector('[data-pp-ack-row]');
	if (ack && place) {
		ack.addEventListener('change', function () {
			place.disabled = !ack.checked;
			if (ackRow) ackRow.classList.toggle('is-checked', ack.checked);
		});
	}
})();
</script>

<?php wp_footer(); ?>
</body>
</html>


