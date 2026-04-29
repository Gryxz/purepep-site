<?php
/**
 * Single product (PDP) template — PurePep flagship.
 *
 * Maps 1:1 to design-system/ui_kits/storefront/index.html (the RETA · 10 mg
 * product detail page). Self-contained chrome (compliance ribbon, header,
 * footer, age gate) mirrors front-page.php / archive-product.php.
 *
 * Pure PHP + WooCommerce — no Gutenberg dependencies. ResearcherAccess gate
 * shows for non-logged-in visitors. Sticky buy bar appears once the buy box
 * scrolls past the viewport.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

$pp_woo        = function_exists( 'WC' );
$pp_cart_count = ( $pp_woo && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;

if ( $pp_woo ) {
	while ( have_posts() ) {
		the_post();
		break;
	}
	$pp_product = wc_get_product( get_the_ID() );
} else {
	$pp_product = null;
}

$pp_compound  = $pp_product ? $pp_product->get_name() : '[TKTK — compound]';
$pp_short     = $pp_product ? $pp_product->get_short_description() : '';
$pp_sku       = $pp_product ? $pp_product->get_sku() : '';
$pp_atc_url   = $pp_product ? $pp_product->add_to_cart_url() : '#';
$pp_in_stock  = $pp_product ? $pp_product->is_in_stock() : false;
$pp_stock_qty = $pp_product ? $pp_product->get_stock_quantity() : null;

$pp_cas    = $pp_product ? get_post_meta( $pp_product->get_id(), '_pp_cas', true ) : '';
$pp_dose   = $pp_product ? get_post_meta( $pp_product->get_id(), '_pp_dose', true ) : '';
$pp_lot    = $pp_product ? get_post_meta( $pp_product->get_id(), '_pp_lot', true ) : '';
$pp_purity = $pp_product ? get_post_meta( $pp_product->get_id(), '_pp_purity', true ) : '';
$pp_assay  = $pp_product ? get_post_meta( $pp_product->get_id(), '_pp_assay_date', true ) : '';

$pp_categories = ( $pp_product && function_exists( 'wp_get_post_terms' ) )
	? wp_get_post_terms( $pp_product->get_id(), 'product_cat' )
	: [];
$pp_categories = is_wp_error( $pp_categories ) ? [] : $pp_categories;
$pp_first_cat  = ! empty( $pp_categories ) ? $pp_categories[0] : null;

$pp_related = [];
if ( $pp_woo && $pp_product ) {
	$pp_related_ids = wc_get_related_products( $pp_product->get_id(), 3 );
	foreach ( $pp_related_ids as $pp_rid ) {
		$pp_rp = wc_get_product( $pp_rid );
		if ( $pp_rp ) {
			$pp_related[] = $pp_rp;
		}
	}
}

$pp_cart_url   = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_shop_url   = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url = home_url( '/?s=&post_type=product' );
$pp_logged_in  = is_user_logged_in();

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
<title><?php echo esc_html( $pp_compound ); ?> &mdash; <?php bloginfo( 'name' ); ?></title>
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
.pp-cart { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: transparent; border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); color: var(--pp-ink); text-decoration: none; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: 0.12em; }

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

.pp-breadcrumb { background: var(--pp-bone); }
.pp-breadcrumb-inner { max-width: var(--max-content); margin: 0 auto; padding: 18px var(--s-5); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; }
.pp-breadcrumb a { color: var(--pp-ink-muted); text-decoration: none; }
.pp-breadcrumb a:hover { color: var(--pp-ink); }
.pp-breadcrumb .pp-current { color: var(--pp-ink); }
.pp-breadcrumb .pp-sep { color: var(--pp-ink-muted); }

@media (max-width: 1024px) { .pp-header-inner { grid-template-columns: 1fr auto; } .pp-nav { display: none; } }
</style>
</head>
<body <?php body_class( 'pp-pdp' ); ?>>

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
			<a href="<?php echo esc_url( get_permalink() ); ?>" class="is-active"><?php echo esc_html( $pp_compound ); ?></a>
			<a href="<?php echo esc_url( home_url( '/quality/' ) ); ?>">Quality</a>
			<a href="<?php echo esc_url( home_url( '/documentation/' ) ); ?>">Documentation</a>
			<a href="<?php echo esc_url( home_url( '/affiliates/' ) ); ?>">Affiliates</a>
			<a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Account</a>
		</nav>
		<div class="pp-actions">
			<a class="pp-iconbtn" href="<?php echo esc_url( $pp_search_url ); ?>" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></a>
			<a class="pp-cart" href="<?php echo esc_url( $pp_cart_url ); ?>" aria-label="Cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><span class="pp-cart-count"><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?></span></a>
		</div>
	</div>
</header>

<!-- ==================== BREADCRUMB ==================== -->
<nav class="pp-breadcrumb" aria-label="Breadcrumb">
	<div class="pp-breadcrumb-inner">
		<a href="<?php echo esc_url( $pp_shop_url ); ?>">Catalog</a>
		<?php if ( $pp_first_cat ) : ?>
			<span class="pp-sep">/</span>
			<a href="<?php echo esc_url( get_term_link( $pp_first_cat ) ); ?>"><?php echo esc_html( $pp_first_cat->name ); ?></a>
		<?php endif; ?>
		<span class="pp-sep">/</span>
		<span class="pp-current"><?php echo esc_html( $pp_compound ); ?></span>
	</div>
</nav>

<style>
.pp-pdp-main { background: var(--pp-bone); }
.pp-pdp-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5) var(--s-9); }
.pp-pdp-grid { display: grid; grid-template-columns: 7fr 5fr; gap: var(--s-8); align-items: start; }
@media (max-width: 1024px) { .pp-pdp-grid { grid-template-columns: 1fr; gap: var(--s-7); } }

.pp-gallery { background: var(--pp-blush); border-radius: var(--r-md); aspect-ratio: 1 / 1; position: relative; display: grid; place-items: center; padding: var(--s-7); overflow: hidden; box-shadow: var(--pp-shadow-product); }
.pp-gallery img { max-width: 80%; max-height: 80%; object-fit: contain; }
.pp-gallery-fallback { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-gallery-stamp {
	position: absolute; top: 16px; right: 16px;
	border: 1.5px dashed var(--pp-alert); color: var(--pp-alert);
	font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;
	letter-spacing: 0.18em; text-transform: uppercase;
	padding: 6px 10px; transform: rotate(-1.5deg); background: rgba(250,247,240,0.9);
}
.pp-gallery-instock {
	position: absolute; top: 16px; left: 16px;
	background: var(--pp-emerald); color: var(--pp-bone);
	font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;
	letter-spacing: 0.18em; text-transform: uppercase;
	padding: 6px 10px; display: inline-flex; align-items: center; gap: 6px;
}

.pp-thumbs { margin-top: var(--s-4); display: flex; gap: var(--s-3); }
.pp-thumb { aspect-ratio: 1 / 1; flex: 1; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); display: grid; place-items: center; cursor: pointer; }
.pp-thumb-fallback { font-family: var(--font-mono); font-size: 9px; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }

.pp-coa-panel { border: 2px solid var(--pp-ink); background: var(--pp-bone); margin-top: var(--s-7); border-radius: var(--r-md); overflow: hidden; }
.pp-coa-head { padding: var(--s-5); border-bottom: var(--bw) solid var(--pp-ink); display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--s-3); }
.pp-coa-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: var(--t-h3); letter-spacing: -0.01em; color: var(--pp-ink); }
.pp-coa-released { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-emerald); padding: 4px 10px; border: var(--bw) solid var(--pp-emerald); background: var(--pp-emerald-soft); }
.pp-coa-rows { padding: 0; }
.pp-coa-row { display: grid; grid-template-columns: 220px 1fr auto; gap: var(--s-5); padding: var(--s-4) var(--s-5); border-bottom: var(--bw) solid var(--pp-line); align-items: baseline; }
.pp-coa-row:nth-child(even) { background: var(--pp-surface); }
.pp-coa-row:last-child { border-bottom: none; }
.pp-coa-label { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-coa-value { font-family: var(--font-sans); font-weight: 500; font-size: 15px; color: var(--pp-ink); letter-spacing: -0.005em; }
.pp-coa-pass { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-emerald); padding: 4px 10px; border: var(--bw) solid var(--pp-emerald); background: var(--pp-emerald-soft); }
.pp-coa-foot { padding: var(--s-4) var(--s-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--s-3); border-top: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-coa-foot .pp-eyebrow { color: var(--pp-emerald); }

.pp-buybox { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); border-radius: var(--r-md); padding: var(--s-7); display: flex; flex-direction: column; gap: var(--s-5); }
.pp-buybox h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(44px, 5.5vw, 76px); letter-spacing: -0.035em; line-height: 1; color: var(--pp-ink); margin-top: 12px; }
.pp-buybox .pp-cas { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-buybox .pp-dose-badge { display: inline-flex; align-items: center; padding: 8px 14px; border: var(--bw) solid var(--pp-ink); font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); align-self: flex-start; }
.pp-buybox .pp-short { font-family: var(--font-sans); font-size: 16px; line-height: 1.55; color: var(--pp-ink); margin: 0; }
.pp-buybox .pp-price-row { padding: var(--s-4) 0 var(--s-3); border-top: var(--bw) solid var(--pp-line); border-bottom: var(--bw) solid var(--pp-ink); }
.pp-price-value { font-family: var(--font-sans); font-weight: 900; font-size: 44px; letter-spacing: -0.03em; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-price-meta { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); margin-top: 4px; }

.pp-qty-row { display: grid; grid-template-columns: auto 1fr; gap: var(--s-4); align-items: center; }
.pp-qty-label { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-qty-stepper { display: inline-flex; border: var(--bw) solid var(--pp-ink); border-radius: 0; align-items: stretch; }
.pp-qty-stepper button { background: var(--pp-bone); border: none; color: var(--pp-ink); width: 40px; cursor: pointer; font-family: var(--font-mono); font-size: 16px; font-weight: 600; }
.pp-qty-stepper button:hover { background: var(--pp-bone-soft); }
.pp-qty-stepper input { width: 60px; text-align: center; border: none; border-left: var(--bw) solid var(--pp-ink); border-right: var(--bw) solid var(--pp-ink); background: var(--pp-bone); font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--pp-ink); padding: 8px 0; -moz-appearance: textfield; }
.pp-qty-stepper input::-webkit-outer-spin-button, .pp-qty-stepper input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.pp-atc-form { display: flex; flex-direction: column; gap: var(--s-3); }
.pp-atc-btn { width: 100%; height: 56px; background: var(--pp-ink); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background var(--dur-fast) var(--ease); }
.pp-atc-btn:hover { background: #000; }
.pp-atc-btn[disabled] { background: var(--pp-line); color: var(--pp-ink-muted); cursor: not-allowed; }

.pp-compliance-row { background: var(--pp-alert-soft); border: var(--bw) solid var(--pp-alert); padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-2); transition: background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
.pp-compliance-row.is-checked { background: var(--pp-emerald-soft); border-color: var(--pp-emerald); }
.pp-compliance-row label { display: grid; grid-template-columns: 18px 1fr; gap: 12px; font-family: var(--font-sans); font-size: 14px; line-height: 1.5; color: var(--pp-ink); cursor: pointer; }
.pp-compliance-row input[type="checkbox"] { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin-top: 2px; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); cursor: pointer; display: grid; place-content: center; }
.pp-compliance-row input[type="checkbox"]:checked { background: var(--pp-ink); }
.pp-compliance-row input[type="checkbox"]:checked::after { content: ''; width: 10px; height: 6px; border-left: 2px solid var(--pp-bone); border-bottom: 2px solid var(--pp-bone); transform: rotate(-45deg) translate(1px, -1px); }
.pp-compliance-row .pp-finalrow { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
</style>

<!-- ==================== PDP MAIN GRID ==================== -->
<main class="pp-pdp-main">
	<div class="pp-pdp-inner">
		<div class="pp-pdp-grid">

			<!-- LEFT: Gallery + COA panel -->
			<div>
				<div class="pp-gallery" data-pp-gallery>
					<?php if ( $pp_in_stock ) : ?>
						<span class="pp-gallery-instock">
							<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
							In stock
						</span>
					<?php endif; ?>
					<span class="pp-gallery-stamp">Lot <?php echo $pp_lot ? esc_html( $pp_lot ) : '[TKTK]'; ?></span>
					<?php if ( $pp_product && has_post_thumbnail( $pp_product->get_id() ) ) : ?>
						<?php echo get_the_post_thumbnail( $pp_product->get_id(), 'large', [ 'alt' => esc_attr( $pp_compound ) ] ); ?>
					<?php else : ?>
						<span class="pp-gallery-fallback">[TKTK — vial photo]</span>
					<?php endif; ?>
				</div>
				<div class="pp-thumbs" aria-hidden="true">
					<div class="pp-thumb"><span class="pp-thumb-fallback">[TKTK]</span></div>
					<div class="pp-thumb"><span class="pp-thumb-fallback">[TKTK]</span></div>
					<div class="pp-thumb"><span class="pp-thumb-fallback">[TKTK]</span></div>
				</div>

				<section class="pp-coa-panel" aria-labelledby="pp-coa-title">
					<div class="pp-coa-head">
						<div>
							<span class="pp-eyebrow" style="color: var(--pp-ink-muted);">Certificate of analysis</span>
							<h2 id="pp-coa-title">Independent third-party assay.</h2>
						</div>
						<span class="pp-coa-released">Lot released [TKTK]</span>
					</div>
					<div class="pp-coa-rows">
						<div class="pp-coa-row">
							<span class="pp-coa-label">Lot number</span>
							<span class="pp-coa-value"><?php echo $pp_lot ? esc_html( $pp_lot ) : '[TKTK]'; ?></span>
							<span class="pp-coa-pass"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>PASS</span>
						</div>
						<div class="pp-coa-row">
							<span class="pp-coa-label">Purity (HPLC)</span>
							<span class="pp-coa-value"><?php echo $pp_purity ? esc_html( $pp_purity ) : '[TKTK]%'; ?></span>
							<span class="pp-coa-pass"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>PASS</span>
						</div>
						<div class="pp-coa-row">
							<span class="pp-coa-label">Mass confirmation</span>
							<span class="pp-coa-value">[TKTK] · ESI-MS</span>
							<span class="pp-coa-pass"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>PASS</span>
						</div>
						<div class="pp-coa-row">
							<span class="pp-coa-label">Endotoxin</span>
							<span class="pp-coa-value">[TKTK] EU/mg</span>
							<span class="pp-coa-pass"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>PASS</span>
						</div>
						<div class="pp-coa-row">
							<span class="pp-coa-label">Test date</span>
							<span class="pp-coa-value"><?php echo $pp_assay ? esc_html( $pp_assay ) : '[TKTK]'; ?></span>
							<span class="pp-coa-pass"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>PASS</span>
						</div>
					</div>
					<div class="pp-coa-foot">
						<span class="pp-eyebrow">Independent verification by [TKTK — lab]</span>
						<a class="pp-eyebrow" style="color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px;" href="#">Download full COA (PDF) &rarr;</a>
					</div>
				</section>
			</div>

			<!-- RIGHT: Buy box -->
			<div data-pp-buybox>
				<div class="pp-buybox">
					<span class="pp-eyebrow"><?php echo $pp_compound ? esc_html( strtoupper( $pp_compound ) ) : '[TKTK]'; ?> · Lyophilized</span>
					<h1><?php echo esc_html( $pp_compound ); ?></h1>
					<div class="pp-cas">CAS <?php echo $pp_cas ? esc_html( $pp_cas ) : '[TKTK]'; ?> · SKU <?php echo $pp_sku ? esc_html( $pp_sku ) : '[TKTK]'; ?></div>
					<span class="pp-dose-badge"><?php echo $pp_dose ? esc_html( $pp_dose ) : '[TKTK]'; ?> · per vial</span>
					<?php if ( $pp_short ) : ?>
						<p class="pp-short"><?php echo wp_kses_post( $pp_short ); ?></p>
					<?php else : ?>
						<p class="pp-short">[TKTK — short monograph description, ~3 lines, no claims, no exclamation marks.]</p>
					<?php endif; ?>

					<div class="pp-price-row">
						<div class="pp-price-value">[TKTK]</div>
						<div class="pp-price-meta">Per vial · USD · all sales final</div>
					</div>

					<form class="pp-atc-form" method="post" action="<?php echo esc_url( $pp_cart_url ); ?>" enctype="multipart/form-data">
						<div class="pp-qty-row">
							<span class="pp-qty-label">Quantity</span>
							<div class="pp-qty-stepper">
								<button type="button" data-pp-qty="-1" aria-label="Decrease">&minus;</button>
								<input type="number" name="quantity" id="pp-qty-input" value="1" min="1" max="<?php echo $pp_stock_qty ? esc_attr( $pp_stock_qty ) : '99'; ?>" inputmode="numeric">
								<button type="button" data-pp-qty="+1" aria-label="Increase">+</button>
							</div>
						</div>

						<div class="pp-compliance-row" data-pp-compliance>
							<label>
								<input type="checkbox" data-pp-ack required>
								<span>I am a qualified researcher, 21+, and acknowledge research-use-only.</span>
							</label>
							<span class="pp-finalrow">All sales final · No refunds · No returns</span>
						</div>

						<input type="hidden" name="add-to-cart" value="<?php echo esc_attr( $pp_product ? $pp_product->get_id() : '' ); ?>">
						<button type="submit" class="pp-atc-btn" data-pp-atc disabled <?php echo $pp_in_stock ? '' : 'disabled'; ?>>
							<?php echo $pp_in_stock ? 'Add to cart — [TKTK]' : 'Notify when back'; ?>
						</button>
					</form>
				</div>
			</div>

		</div>
	</div>
</main>

<style>
.pp-sticky-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; transform: translateY(100%); transition: transform var(--dur-base) var(--ease); background: var(--pp-ink); color: var(--pp-bone); border-top: var(--bw) solid var(--pp-ink); }
.pp-sticky-bar.is-visible { transform: translateY(0); }
.pp-sticky-inner { max-width: var(--max-content); margin: 0 auto; padding: 16px var(--s-5); display: grid; grid-template-columns: 1fr auto auto; gap: var(--s-5); align-items: center; }
.pp-sticky-name { font-family: var(--font-sans); font-weight: 700; font-size: 16px; color: var(--pp-bone); letter-spacing: -0.01em; }
.pp-sticky-meta { font-family: var(--font-mono); font-size: 10px; font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: rgba(250,247,240,0.7); margin-top: 2px; }
.pp-sticky-price { font-family: var(--font-sans); font-weight: 700; font-size: 18px; color: var(--pp-bone); font-variant-numeric: tabular-nums; }
.pp-sticky-cta { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: var(--pp-bone); color: var(--pp-ink); border: var(--bw) solid var(--pp-bone); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; }
.pp-sticky-cta:hover { background: var(--pp-bone-soft); color: var(--pp-ink); }
@media (max-width: 720px) { .pp-sticky-bar { display: none; } }

.pp-researcher-access { background: var(--pp-bone); }
.pp-researcher-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5); display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-7); align-items: center; }
@media (max-width: 820px) { .pp-researcher-inner { grid-template-columns: 1fr; } }
.pp-researcher-inner h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(28px, 3.2vw, 40px); letter-spacing: -0.025em; line-height: 1.05; color: var(--pp-ink); margin-top: 12px; }
.pp-researcher-form { display: flex; gap: 10px; }
.pp-researcher-form input[type="email"] { flex: 1; height: 52px; padding: 0 16px; border: var(--bw) solid var(--pp-ink); border-radius: 0; background: var(--pp-bone); font-family: var(--font-sans); font-size: 15px; color: var(--pp-ink); }
.pp-researcher-form input[type="email"]:focus { outline: 2px solid var(--pp-ink); outline-offset: 2px; }
.pp-researcher-form button { height: 52px; padding: 0 24px; background: var(--pp-ink); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); font-family: var(--font-sans); font-weight: 700; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.pp-researcher-microcopy { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); margin-top: 12px; }

.pp-related { background: var(--pp-bone); }
.pp-related-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5); }
.pp-related-head { margin-bottom: var(--s-6); }
.pp-related-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(28px, 3vw, 36px); letter-spacing: -0.025em; line-height: 1.1; color: var(--pp-ink); margin-top: 12px; }
.pp-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-5); }
@media (max-width: 1024px) { .pp-related-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .pp-related-grid { grid-template-columns: 1fr; } }
.pp-related-card { background: var(--pp-bone); border-radius: var(--r-md); overflow: hidden; display: flex; flex-direction: column; transition: background var(--dur-fast) var(--ease); }
.pp-related-card:hover { background: var(--pp-bone-soft); }
.pp-related-card a.pp-card-body { color: var(--pp-ink); text-decoration: none; padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-3); }
.pp-related-img { aspect-ratio: 1 / 1; background: var(--pp-surface); border: var(--bw) solid var(--pp-ink); display: grid; place-items: center; overflow: hidden; }
.pp-related-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-related-img-fallback { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-related-name { font-family: var(--font-sans); font-weight: 900; font-size: 20px; letter-spacing: -0.02em; line-height: 1.15; color: var(--pp-ink); margin: 0; }
.pp-related-meta { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-related-empty { grid-column: 1 / -1; border: var(--bw) solid var(--pp-ink); padding: var(--s-7); text-align: center; font-family: var(--font-mono); font-size: var(--t-eyebrow); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }

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

<?php if ( ! $pp_logged_in ) : ?>
<!-- ==================== RESEARCHER ACCESS GATE ==================== -->
<section class="pp-researcher-access" aria-labelledby="pp-researcher-title">
	<div class="pp-researcher-inner">
		<div>
			<span class="pp-eyebrow">Researcher access</span>
			<h2 id="pp-researcher-title">[TKTK]% on your first order. New lot announcements. COA archive access.</h2>
		</div>
		<div>
			<form class="pp-researcher-form" method="post" action="<?php echo esc_url( wp_login_url( get_permalink() ) ); ?>">
				<input type="email" name="pp_email" placeholder="researcher@institution.edu" required aria-label="Email address">
				<button type="submit">Request access &rarr;</button>
			</form>
			<div class="pp-researcher-microcopy">One email per lot release. No marketing spam. <a href="<?php echo esc_url( wp_login_url( get_permalink() ) ); ?>" style="color: var(--pp-ink-muted);">Already verified? Sign in &rarr;</a></div>
		</div>
	</div>
</section>
<?php endif; ?>

<!-- ==================== RELATED RAIL ==================== -->
<section class="pp-related" aria-labelledby="pp-related-title">
	<div class="pp-related-inner">
		<div class="pp-related-head">
			<span class="pp-eyebrow">Related compounds</span>
			<h2 id="pp-related-title">Researchers studying <?php echo esc_html( $pp_compound ); ?> also ordered</h2>
		</div>
		<div class="pp-related-grid">
		<?php if ( ! empty( $pp_related ) ) : ?>
			<?php foreach ( $pp_related as $pp_rp ) :
				$pp_r_id   = $pp_rp->get_id();
				$pp_r_cas  = get_post_meta( $pp_r_id, '_pp_cas', true );
				$pp_r_dose = get_post_meta( $pp_r_id, '_pp_dose', true );
			?>
				<article class="pp-related-card" data-product-id="<?php echo esc_attr( $pp_r_id ); ?>">
					<a class="pp-card-body" href="<?php echo esc_url( get_permalink( $pp_r_id ) ); ?>">
						<div class="pp-related-img">
							<?php if ( has_post_thumbnail( $pp_r_id ) ) : ?>
								<?php echo get_the_post_thumbnail( $pp_r_id, 'medium', [ 'alt' => esc_attr( $pp_rp->get_name() ) ] ); ?>
							<?php else : ?>
								<span class="pp-related-img-fallback">[TKTK — vial photo]</span>
							<?php endif; ?>
						</div>
						<h3 class="pp-related-name"><?php echo esc_html( $pp_rp->get_name() ); ?></h3>
						<div class="pp-related-meta">
							<?php echo $pp_r_cas ? 'CAS ' . esc_html( $pp_r_cas ) : 'CAS [TKTK]'; ?> ·
							<?php echo $pp_r_dose ? esc_html( $pp_r_dose ) : '[TKTK]'; ?> · [TKTK]
						</div>
					</a>
				</article>
			<?php endforeach; ?>
		<?php else : ?>
			<div class="pp-related-empty">[TKTK — no related compounds in this category yet.]</div>
		<?php endif; ?>
		</div>
	</div>
</section>

<!-- ==================== STICKY BUY BAR ==================== -->
<aside class="pp-sticky-bar" id="pp-sticky-bar" aria-label="Sticky buy bar" hidden>
	<div class="pp-sticky-inner">
		<div>
			<div class="pp-sticky-name"><?php echo esc_html( $pp_compound ); ?> · <?php echo $pp_dose ? esc_html( $pp_dose ) : '[TKTK]'; ?></div>
			<div class="pp-sticky-meta">For research use only · 21+ qualified researchers</div>
		</div>
		<div class="pp-sticky-price">[TKTK]</div>
		<a class="pp-sticky-cta" href="<?php echo esc_url( $pp_atc_url ); ?>" rel="nofollow">Add to cart &rarr;</a>
	</div>
</aside>

<!-- ==================== FOOTER ==================== -->
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
	// --- Age gate ----------------------------------------------------------
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

	// --- Quantity stepper --------------------------------------------------
	var qtyInput = document.getElementById('pp-qty-input');
	if (qtyInput) {
		document.querySelectorAll('[data-pp-qty]').forEach(function (b) {
			b.addEventListener('click', function () {
				var step = parseInt(b.getAttribute('data-pp-qty'), 10) || 0;
				var min = parseInt(qtyInput.min || '1', 10);
				var max = parseInt(qtyInput.max || '99', 10);
				var v = parseInt(qtyInput.value || '1', 10) + step;
				if (v < min) v = min; if (v > max) v = max;
				qtyInput.value = v;
			});
		});
	}

	// --- Compliance ack gates the ATC button -------------------------------
	var ack    = document.querySelector('[data-pp-ack]');
	var atcBtn = document.querySelector('[data-pp-atc]');
	var compRow = document.querySelector('[data-pp-compliance]');
	if (ack && atcBtn) {
		ack.addEventListener('change', function () {
			atcBtn.disabled = !ack.checked;
			if (compRow) compRow.classList.toggle('is-checked', ack.checked);
		});
	}

	// --- Sticky buy bar ----------------------------------------------------
	var bar      = document.getElementById('pp-sticky-bar');
	var trigger  = document.querySelector('[data-pp-buybox]');
	var footerEl = document.querySelector('.pp-footer');
	if (bar && trigger && 'IntersectionObserver' in window) {
		bar.hidden = false;
		var pastBuyBox = false;
		var inFooter   = false;
		function syncBar() { bar.classList.toggle('is-visible', pastBuyBox && !inFooter); }
		new IntersectionObserver(function (entries) {
			entries.forEach(function (e) { pastBuyBox = !e.isIntersecting && e.boundingClientRect.bottom < 0; });
			syncBar();
		}, { threshold: 0 }).observe(trigger);
		if (footerEl) {
			new IntersectionObserver(function (entries) {
				entries.forEach(function (e) { inFooter = e.isIntersecting; });
				syncBar();
			}, { threshold: 0 }).observe(footerEl);
		}
	}
})();
</script>

<?php wp_footer(); ?>
</body>
</html>

