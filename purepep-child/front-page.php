<?php
/**
 * Front page template — PurePep homepage.
 *
 * Maps 1:1 to design-system/ui_kits/storefront/home.html. This is a classic
 * PHP template (not a block template) so we can wire WooCommerce data in
 * directly. WordPress 6.0+ prefers PHP templates over .html templates with
 * the same name, so this file supersedes templates/front-page.html for the
 * homepage route.
 *
 * All marketing numerics render as [TKTK] until the brand team approves
 * production copy. Component names mirror the JSX kit so the design ports
 * 1:1.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

$pp_woo          = function_exists( 'WC' );
$pp_cart_count   = ( $pp_woo && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;
$pp_active_cat   = isset( $_GET['product_cat'] ) ? sanitize_title( wp_unslash( $_GET['product_cat'] ) ) : '';
$pp_categories   = $pp_woo
	? get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => false, 'parent' => 0 ] )
	: [];
$pp_categories   = is_wp_error( $pp_categories ) || ! is_array( $pp_categories ) ? [] : $pp_categories;

$pp_query_args = [
	'post_type'           => 'product',
	'posts_per_page'      => 9,
	'orderby'             => 'menu_order',
	'order'               => 'ASC',
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
];
if ( $pp_active_cat ) {
	$pp_query_args['tax_query'] = [
		[
			'taxonomy' => 'product_cat',
			'field'    => 'slug',
			'terms'    => $pp_active_cat,
		],
	];
}
$pp_products = $pp_woo ? new WP_Query( $pp_query_args ) : null;

$pp_cart_url   = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_shop_url   = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url = home_url( '/?s=&post_type=product' );

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php bloginfo( 'name' ); ?> — Research-grade peptides. Verified per lot.</title>
<?php wp_head(); ?>
<style>
/* page-specific layout — tokens come from tokens.css */
body.pp-locked { overflow: hidden; }

.pp-ribbon {
	background: var(--pp-bone);
	border-bottom: var(--bw) solid var(--pp-ink);
	font-family: var(--font-mono);
	font-size: var(--t-eyebrow);
	font-weight: 500;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
	color: var(--pp-ink);
}
.pp-ribbon-inner {
	max-width: var(--max-content);
	margin: 0 auto;
	padding: 9px var(--s-5);
	display: flex; gap: var(--s-4); justify-content: center;
	white-space: nowrap; flex-wrap: nowrap; overflow: hidden;
}
.pp-ribbon-inner span + span::before { content: '·'; padding: 0 12px; }

.pp-header {
	background: var(--pp-bone);
	position: relative; z-index: 10;
}
.pp-header-inner {
	max-width: var(--max-content);
	margin: 0 auto;
	padding: 20px var(--s-5);
	display: grid; grid-template-columns: 220px 1fr auto;
	align-items: center; gap: var(--s-6);
	border-bottom: var(--bw) solid var(--pp-ink);
}
.pp-lockup { display: inline-block; line-height: 0; text-decoration: none; }
.pp-lockup svg { height: 36px; width: auto; display: block; }
.pp-nav {
	display: flex; justify-content: center; gap: 36px; align-items: center;
}
.pp-nav a {
	font-family: var(--font-sans); font-weight: 500; font-size: 14px;
	color: var(--pp-ink); text-decoration: none; padding: 8px 0;
	border-bottom: var(--bw) solid transparent;
	letter-spacing: -0.005em;
	transition: border-color var(--dur-fast) var(--ease);
}
.pp-nav a:hover, .pp-nav a.is-active { border-bottom-color: var(--pp-ink); }
.pp-actions { display: flex; gap: 18px; align-items: center; }
.pp-iconbtn {
	display: inline-flex; align-items: center; justify-content: center;
	background: transparent; border: none; color: var(--pp-ink);
	cursor: pointer; padding: 6px;
}
.pp-cart {
	display: inline-flex; align-items: center; gap: 8px;
	padding: 8px 12px; background: transparent;
	border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md);
	color: var(--pp-ink); text-decoration: none;
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: 0.12em;
}

.pp-age-gate {
	position: fixed; inset: 0; z-index: 100;
	background: var(--pp-bone);
	display: flex; align-items: center; justify-content: center;
	padding: 48px var(--s-5);
}
.pp-age-gate[hidden] { display: none; }
.pp-age-gate-card { width: 100%; max-width: 520px; }
.pp-age-gate-lockup { display: flex; justify-content: center; margin-bottom: 44px; }
.pp-age-gate-lockup svg { height: 48px; width: auto; display: block; }
.pp-age-gate h1 {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(32px, 4.2vw, 42px);
	letter-spacing: -0.03em; line-height: 1.05;
	color: var(--pp-ink); text-align: center; margin: 16px 0 24px;
}
.pp-age-gate p {
	font-family: var(--font-sans); font-size: 15px; line-height: 1.65;
	color: var(--pp-ink); text-align: center;
	max-width: 440px; margin: 0 auto 14px;
}
.pp-age-gate-checks {
	border: var(--bw) solid var(--pp-ink); background: var(--pp-bone);
	padding: 20px 24px; display: grid; gap: 12px; margin: 36px 0 28px;
}
.pp-age-gate label {
	display: grid; grid-template-columns: 18px 1fr; gap: 12px;
	align-items: start; cursor: pointer;
	font-family: var(--font-sans); font-size: 14px; line-height: 1.5;
	color: var(--pp-ink);
}
.pp-age-gate input[type="checkbox"] {
	appearance: none; -webkit-appearance: none;
	width: 18px; height: 18px; margin: 2px 0 0;
	border: var(--bw) solid var(--pp-ink); border-radius: 0;
	background: var(--pp-bone); cursor: pointer;
	display: grid; place-content: center;
}
.pp-age-gate input[type="checkbox"]:checked { background: var(--pp-ink); }
.pp-age-gate input[type="checkbox"]:checked::after {
	content: ''; width: 10px; height: 6px;
	border-left: 2px solid var(--pp-bone); border-bottom: 2px solid var(--pp-bone);
	transform: rotate(-45deg) translate(1px, -1px);
}
.pp-age-gate-cta {
	width: 100%; height: 56px;
	background: var(--pp-line); color: var(--pp-ink-muted);
	border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md);
	font-family: var(--font-sans); font-weight: 700; font-size: 14px;
	letter-spacing: 0.06em; text-transform: uppercase;
	cursor: not-allowed; margin-bottom: 20px;
	transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.pp-age-gate-cta:not([disabled]) {
	background: var(--pp-ink); color: var(--pp-bone); cursor: pointer;
}
.pp-age-gate-leave {
	display: block; text-align: center; margin-bottom: 48px;
	font-family: var(--font-sans); font-size: 14px; font-weight: 500;
	color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px;
}
.pp-age-gate-disclaimer {
	text-align: center;
	font-family: var(--font-mono); font-size: 10px; font-weight: 500;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink-muted); line-height: 1.8;
}

@media (max-width: 1024px) {
	.pp-header-inner { grid-template-columns: 1fr auto; }
	.pp-nav { display: none; }
}
</style>
</head>
<body <?php body_class( 'pp-front' ); ?>>

<?php
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
?>

<!-- ==================== AGE GATE OVERLAY ==================== -->
<div class="pp-age-gate" id="pp-age-gate" hidden role="dialog" aria-modal="true" aria-labelledby="pp-age-gate-title">
	<div class="pp-age-gate-card">
		<div class="pp-age-gate-lockup" style="color: var(--pp-ink);"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<div style="text-align: center;"><span class="pp-eyebrow">Restricted access · 21+ qualified researchers</span></div>
		<h1 id="pp-age-gate-title">Verify you&rsquo;re a qualified researcher.</h1>
		<p>PurePep supplies research-grade peptides for in-vitro study only. These are not dietary supplements, therapeutics, or products for human or veterinary consumption.</p>
		<p>Access is restricted to qualified scientific researchers aged 21 or older.</p>
		<div class="pp-age-gate-checks">
			<label><input type="checkbox" data-pp-gate-check><span>I am 21 years of age or older.</span></label>
			<label><input type="checkbox" data-pp-gate-check><span>I am a qualified scientific researcher and will use these products for research purposes only.</span></label>
		</div>
		<button class="pp-age-gate-cta" data-pp-enter disabled type="button">Enter site</button>
		<a class="pp-age-gate-leave" href="https://www.google.com" rel="noopener">Leave site</a>
		<div class="pp-age-gate-disclaimer">
			For research use only · Not for human consumption<br>
			© <?php echo esc_html( gmdate( 'Y' ) ); ?> PurePep · All sales final
		</div>
	</div>
</div>

<!-- ==================== COMPLIANCE RIBBON ==================== -->
<div class="pp-ribbon">
	<div class="pp-ribbon-inner">
		<span>For research use only</span>
		<span>21+ qualified researchers</span>
		<span>All sales final</span>
	</div>
</div>

<!-- ==================== HEADER ==================== -->
<header class="pp-header">
	<div class="pp-header-inner">
		<a class="pp-lockup" href="<?php echo esc_url( home_url( '/' ) ); ?>" style="color: var(--pp-ink);"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>

		<nav class="pp-nav" aria-label="Primary">
			<a href="<?php echo esc_url( $pp_shop_url ); ?>" class="<?php echo is_shop() ? 'is-active' : ''; ?>">Catalog</a>
			<a href="<?php echo esc_url( home_url( '/product/reta-10mg/' ) ); ?>">RETA</a>
			<a href="<?php echo esc_url( home_url( '/quality/' ) ); ?>">Quality</a>
			<a href="<?php echo esc_url( home_url( '/documentation/' ) ); ?>">Documentation</a>
			<a href="<?php echo esc_url( home_url( '/affiliates/' ) ); ?>">Affiliates</a>
			<a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Account</a>
		</nav>

		<div class="pp-actions">
			<a class="pp-iconbtn" href="<?php echo esc_url( $pp_search_url ); ?>" aria-label="Search">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			</a>
			<a class="pp-cart" href="<?php echo esc_url( $pp_cart_url ); ?>" aria-label="Cart">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
				<span class="pp-cart-count"><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?></span>
			</a>
		</div>
	</div>
</header>

<style>
.pp-hero { background: var(--pp-bone); }
.pp-hero-inner {
	max-width: var(--max-content); margin: 0 auto;
	padding: 88px var(--s-5) var(--s-9);
	display: grid; grid-template-columns: 1.15fr 1fr; gap: 72px; align-items: center;
}
.pp-hero h1 {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(54px, 7vw, 96px);
	letter-spacing: -0.035em; line-height: 0.98;
	color: var(--pp-ink); margin: 28px 0; text-wrap: balance;
}
.pp-hero p {
	font-family: var(--font-sans); font-size: 18px; line-height: 1.6;
	color: var(--pp-ink); max-width: 520px; margin: 0 0 36px;
}
.pp-hero-ctas { display: flex; gap: var(--s-5); align-items: center; flex-wrap: wrap; }
.pp-btn {
	display: inline-flex; align-items: center; gap: 8px;
	background: var(--pp-ink); color: var(--pp-bone);
	border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md);
	padding: 16px 28px;
	font-family: var(--font-sans); font-weight: 600; font-size: 15px;
	letter-spacing: 0.02em; text-decoration: none; cursor: pointer;
	transition: background var(--dur-fast) var(--ease);
}
.pp-btn:hover { background: #000; color: var(--pp-bone); }
.pp-btn--lg { padding: 18px 32px; font-size: 16px; }
.pp-link {
	font-family: var(--font-sans); font-size: 14px; font-weight: 600;
	color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px;
	letter-spacing: -0.005em;
}

.pp-hero-card {
	border: var(--bw) solid var(--pp-ink); background: var(--pp-bone);
	border-radius: var(--r-md);
	aspect-ratio: 1 / 1; padding: 28px;
	display: flex; flex-direction: column; justify-content: space-between;
	position: relative; overflow: hidden;
}
.pp-hero-card .pp-lockup-mini { color: var(--pp-ink); }
.pp-hero-card .pp-lockup-mini svg { height: 22px; width: auto; display: block; }
.pp-hero-card .pp-card-meta {
	font-family: var(--font-mono); font-size: 11px; font-weight: 500;
	letter-spacing: 0.18em; text-transform: uppercase; color: var(--pp-ink-muted);
	margin-top: 6px;
}
.pp-hero-card .pp-card-bottom {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(36px, 4.4vw, 64px);
	letter-spacing: -0.035em; line-height: 0.95; color: var(--pp-ink);
}
.pp-hero-card .pp-card-bottom small {
	display: block; font-size: 0.4em; font-weight: 500;
	letter-spacing: 0.16em; text-transform: uppercase;
	color: var(--pp-ink-muted); font-family: var(--font-mono); margin-top: 10px;
}

.pp-filters {
	background: var(--pp-bone);
}
.pp-filters-inner {
	max-width: var(--max-content); margin: 0 auto;
	padding: var(--s-6) var(--s-5);
	display: flex; align-items: center; gap: var(--s-4); flex-wrap: wrap;
}
.pp-filters-label {
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink-muted); margin-right: 8px;
}
.pp-filter-pill {
	display: inline-flex; align-items: center;
	padding: 10px 16px;
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink); text-decoration: none;
	border: var(--bw) solid var(--pp-ink); border-radius: 0;
	background: var(--pp-bone);
	transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.pp-filter-pill:hover { background: var(--pp-bone-soft); }
.pp-filter-pill.is-active { background: var(--pp-ink); color: var(--pp-bone); }

@media (max-width: 1024px) {
	.pp-hero-inner { grid-template-columns: 1fr; gap: 48px; padding-top: 48px; }
}
</style>

<!-- ==================== HERO ==================== -->
<section class="pp-hero">
	<div class="pp-hero-inner">
		<div>
			<span class="pp-eyebrow">[TKTK — eyebrow line]</span>
			<h1>[TKTK — primary headline]<br>[TKTK — second line]</h1>
			<p>[TKTK — supporting paragraph. Keep to ~2 lines, monograph tone, no claims, no exclamation marks.]</p>
			<div class="pp-hero-ctas">
				<a class="pp-btn pp-btn--lg" href="<?php echo esc_url( $pp_shop_url ); ?>">[TKTK — primary CTA] &rarr;</a>
				<a class="pp-link" href="<?php echo esc_url( home_url( '/quality/' ) ); ?>">[TKTK — secondary link]</a>
			</div>
		</div>
		<div class="pp-hero-card" aria-hidden="true">
			<div>
				<div class="pp-lockup-mini"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
				<div class="pp-card-meta">CAS [TKTK]</div>
			</div>
			<div class="pp-card-bottom">
				[TKTK]
				<small>[TKTK] mg · lyophilized</small>
			</div>
		</div>
	</div>
</section>

<!-- ==================== CATEGORY PILL FILTERS ==================== -->
<section class="pp-filters" aria-label="Compound categories">
	<div class="pp-filters-inner">
		<span class="pp-filters-label">Filter</span>
		<a class="pp-filter-pill <?php echo '' === $pp_active_cat ? 'is-active' : ''; ?>" href="<?php echo esc_url( home_url( '/' ) ); ?>">All</a>
		<?php foreach ( $pp_categories as $pp_cat ) :
			$pp_cat_url = add_query_arg( 'product_cat', rawurlencode( $pp_cat->slug ), home_url( '/' ) );
			$pp_is_active = $pp_active_cat === $pp_cat->slug;
		?>
			<a class="pp-filter-pill <?php echo $pp_is_active ? 'is-active' : ''; ?>" href="<?php echo esc_url( $pp_cat_url ); ?>"><?php echo esc_html( $pp_cat->name ); ?></a>
		<?php endforeach; ?>
		<?php if ( empty( $pp_categories ) ) : ?>
			<span class="pp-eyebrow">[TKTK — no compound categories configured yet]</span>
		<?php endif; ?>
	</div>
</section>

<style>
.pp-grid-section { background: var(--pp-bone); }
.pp-grid-inner {
	max-width: var(--max-content); margin: 0 auto;
	padding: var(--s-9) var(--s-5);
}
.pp-grid-head {
	display: flex; justify-content: space-between; align-items: flex-end;
	margin-bottom: var(--s-7); flex-wrap: wrap; gap: var(--s-4);
}
.pp-grid-head h2 {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(32px, 3.4vw, 44px);
	letter-spacing: -0.025em; line-height: 1; color: var(--pp-ink);
	margin-top: 14px;
}
.pp-product-grid {
	display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-5);
}
.pp-product-card {
	background: var(--pp-bone);
	border-radius: var(--r-md);
	overflow: hidden;
	display: flex; flex-direction: column;
	transition: background var(--dur-fast) var(--ease);
}
.pp-product-card:hover { background: var(--pp-bone-soft); }
.pp-product-card a.pp-card-body {
	color: var(--pp-ink); text-decoration: none;
	padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-3);
}
.pp-product-img {
	aspect-ratio: 1 / 1; background: var(--pp-surface);
	display: grid; place-items: center; overflow: hidden;
	margin-bottom: var(--s-3);
}
.pp-product-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-product-img-fallback {
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink-muted);
}
.pp-product-name {
	font-family: var(--font-sans); font-weight: 900;
	font-size: 22px; letter-spacing: -0.02em; line-height: 1.15;
	color: var(--pp-ink); margin: 0;
}
.pp-product-meta {
	display: flex; gap: var(--s-4); flex-wrap: wrap;
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink-muted);
}
.pp-product-foot {
	display: flex; gap: var(--s-3); align-items: stretch;
	padding: 0 var(--s-5) var(--s-5);
}
.pp-product-foot .pp-btn { flex: 1; justify-content: center; padding: 14px; }
.pp-product-empty {
	grid-column: 1 / -1;
	border: var(--bw) solid var(--pp-ink); padding: var(--s-7);
	text-align: center;
	font-family: var(--font-mono); font-size: var(--t-eyebrow);
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink-muted);
}

.pp-trust {
	background: var(--pp-surface);
}
.pp-trust-inner {
	max-width: var(--max-content); margin: 0 auto;
	padding: var(--s-8) var(--s-5);
	display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
}
.pp-trust-cell {
	padding: var(--s-6) var(--s-5);
	border-left: 1px solid var(--pp-line);
	text-align: center;
}
.pp-trust-cell:first-child { border-left: 0; }
.pp-trust-stat {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(40px, 4vw, 56px);
	letter-spacing: -0.035em; line-height: 1;
	color: var(--pp-ink); margin-bottom: var(--s-3);
}
.pp-trust-label {
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: 0.18em; text-transform: uppercase; color: var(--pp-ink);
}

.pp-footer { background: var(--pp-ink); color: var(--pp-bone); }
.pp-footer-inner {
	max-width: var(--max-content); margin: 0 auto;
	padding: 72px var(--s-5) 40px;
}
.pp-footer-cols {
	display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: var(--s-7);
}
.pp-footer-brand p {
	font-family: var(--font-sans); font-size: 13.5px; line-height: 1.6;
	color: rgba(250, 247, 240, 0.75); margin-top: 18px; max-width: 280px;
}
.pp-footer-brand .pp-lockup { color: var(--pp-bone); }
.pp-footer-brand .pp-lockup svg { height: 40px; width: auto; }
.pp-footer-col h4 {
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: 0.18em; text-transform: uppercase;
	color: rgba(250, 247, 240, 0.55); margin-bottom: 14px;
}
.pp-footer-col ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.pp-footer-col a {
	font-family: var(--font-sans); font-size: 13.5px; color: var(--pp-bone);
	text-decoration: none;
}
.pp-footer-col a:hover { text-decoration: underline; }
.pp-footer-rule { height: var(--bw); background: rgba(250, 247, 240, 0.2); margin: var(--s-7) 0 var(--s-4); border: 0; }
.pp-footer-base {
	display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
	font-family: var(--font-mono); font-size: 10.5px; color: rgba(250, 247, 240, 0.55);
	letter-spacing: 0.14em; text-transform: uppercase;
}

@media (max-width: 1024px) {
	.pp-product-grid { grid-template-columns: repeat(2, 1fr); }
	.pp-trust-inner { grid-template-columns: repeat(2, 1fr); }
	.pp-trust-cell:nth-child(3) { border-left: 0; }
	.pp-trust-cell:nth-child(n+3) { border-top: 1px solid var(--pp-line); }
	.pp-footer-cols { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
	.pp-product-grid { grid-template-columns: 1fr; }
	.pp-trust-inner { grid-template-columns: 1fr; }
	.pp-trust-cell { border-left: 0; border-top: 1px solid var(--pp-line); }
	.pp-trust-cell:first-child { border-top: 0; }
	.pp-footer-cols { grid-template-columns: 1fr; gap: var(--s-5); }
}
</style>

<!-- ==================== PRODUCT GRID ==================== -->
<section class="pp-grid-section" aria-label="Featured catalog">
	<div class="pp-grid-inner">
		<div class="pp-grid-head">
			<div>
				<span class="pp-eyebrow">Featured catalog</span>
				<h2>In stock now</h2>
			</div>
			<a class="pp-eyebrow" style="color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px;" href="<?php echo esc_url( $pp_shop_url ); ?>">View full catalog &rarr;</a>
		</div>

		<div class="pp-product-grid">
		<?php
		if ( $pp_products && $pp_products->have_posts() ) :
			while ( $pp_products->have_posts() ) :
				$pp_products->the_post();
				$pp_product = wc_get_product( get_the_ID() );
				if ( ! $pp_product ) {
					continue;
				}
				$pp_cas  = get_post_meta( get_the_ID(), '_pp_cas', true );
				$pp_dose = get_post_meta( get_the_ID(), '_pp_dose', true );
				?>
				<article class="pp-product-card" data-product-id="<?php echo esc_attr( $pp_product->get_id() ); ?>">
					<a class="pp-card-body" href="<?php the_permalink(); ?>">
						<div class="pp-product-img">
							<?php if ( has_post_thumbnail() ) : ?>
								<?php the_post_thumbnail( 'medium_large', [ 'alt' => esc_attr( get_the_title() ) ] ); ?>
							<?php else : ?>
								<span class="pp-product-img-fallback">[TKTK — vial photo]</span>
							<?php endif; ?>
						</div>
						<h3 class="pp-product-name"><?php echo esc_html( get_the_title() ); ?></h3>
						<div class="pp-product-meta">
							<span>CAS <?php echo $pp_cas ? esc_html( $pp_cas ) : '[TKTK]'; ?></span>
							<span><?php echo $pp_dose ? esc_html( $pp_dose ) : '[TKTK]'; ?> · per vial</span>
						</div>
					</a>
					<div class="pp-product-foot">
						<a class="pp-btn"
							href="<?php echo esc_url( $pp_product->add_to_cart_url() ); ?>"
							data-product_id="<?php echo esc_attr( $pp_product->get_id() ); ?>"
							data-product_sku="<?php echo esc_attr( $pp_product->get_sku() ); ?>"
							rel="nofollow">
							Add to cart — [TKTK]
						</a>
					</div>
				</article>
				<?php
			endwhile;
			wp_reset_postdata();
		else :
			?>
			<div class="pp-product-empty">
				<?php if ( ! $pp_woo ) : ?>
					[TKTK — WooCommerce not active. Activate to populate the catalog grid.]
				<?php else : ?>
					[TKTK — no products published in this category yet.]
				<?php endif; ?>
			</div>
		<?php endif; ?>
		</div>
	</div>
</section>

<!-- ==================== TRUST RAIL ==================== -->
<section class="pp-trust" aria-label="Quality stats">
	<div class="pp-trust-inner">
		<div class="pp-trust-cell">
			<div class="pp-trust-stat">[TKTK]%</div>
			<div class="pp-trust-label">Purity threshold (HPLC)</div>
		</div>
		<div class="pp-trust-cell">
			<div class="pp-trust-stat">[TKTK]</div>
			<div class="pp-trust-label">Independent COA per lot</div>
		</div>
		<div class="pp-trust-cell">
			<div class="pp-trust-stat">[TKTK]</div>
			<div class="pp-trust-label">Researchers since [TKTK]</div>
		</div>
		<div class="pp-trust-cell">
			<div class="pp-trust-stat">[TKTK]</div>
			<div class="pp-trust-label">Day cold-chain shipping</div>
		</div>
	</div>
</section>

<!-- ==================== FOOTER ==================== -->
<footer class="pp-footer">
	<div class="pp-footer-inner">
		<div class="pp-footer-cols">
			<div class="pp-footer-brand">
				<a class="pp-lockup" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php echo $pp_lockup_svg; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<p>Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped. Documentation on file.</p>
			</div>
			<div class="pp-footer-col">
				<h4>Catalog</h4>
				<ul>
					<li><a href="<?php echo esc_url( home_url( '/product/reta-10mg/' ) ); ?>">RETA · Retatrutide</a></li>
					<li><a href="<?php echo esc_url( home_url( '/product/sema-5mg/' ) ); ?>">SEMA · Semaglutide</a></li>
					<li><a href="<?php echo esc_url( home_url( '/product/tirz-10mg/' ) ); ?>">TIRZ · Tirzepatide</a></li>
					<li><a href="<?php echo esc_url( $pp_shop_url ); ?>">View all</a></li>
				</ul>
			</div>
			<div class="pp-footer-col">
				<h4>Quality</h4>
				<ul>
					<li><a href="<?php echo esc_url( home_url( '/coa/' ) ); ?>">Certificates of analysis</a></li>
					<li><a href="<?php echo esc_url( home_url( '/lab-partners/' ) ); ?>">Lab partners</a></li>
					<li><a href="<?php echo esc_url( home_url( '/shipping/' ) ); ?>">Cold-chain shipping</a></li>
					<li><a href="<?php echo esc_url( home_url( '/lots/' ) ); ?>">Lot traceability</a></li>
				</ul>
			</div>
			<div class="pp-footer-col">
				<h4>Account</h4>
				<ul>
					<li><a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Sign in</a></li>
					<li><a href="<?php echo esc_url( home_url( '/verify/' ) ); ?>">Researcher verification</a></li>
					<li><a href="<?php echo esc_url( home_url( '/orders/' ) ); ?>">Order history</a></li>
					<li><a href="<?php echo esc_url( home_url( '/reorder/' ) ); ?>">Re-order</a></li>
				</ul>
			</div>
			<div class="pp-footer-col">
				<h4>Policies</h4>
				<ul>
					<li><a href="<?php echo esc_url( home_url( '/no-refund/' ) ); ?>">No-refund policy</a></li>
					<li><a href="<?php echo esc_url( home_url( '/terms/' ) ); ?>">Terms of sale</a></li>
					<li><a href="<?php echo esc_url( home_url( '/privacy/' ) ); ?>">Privacy</a></li>
					<li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></li>
				</ul>
			</div>
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
	if (!gate) return;
	try {
		if (sessionStorage.getItem(KEY) === '1') return;
	} catch (e) { /* sessionStorage blocked — show gate every visit */ }

	gate.hidden = false;
	document.body.classList.add('pp-locked');

	var checks = gate.querySelectorAll('input[data-pp-gate-check]');
	var enter = gate.querySelector('button[data-pp-enter]');

	function refresh() {
		var ok = true;
		checks.forEach(function (c) { if (!c.checked) ok = false; });
		enter.disabled = !ok;
	}
	checks.forEach(function (c) { c.addEventListener('change', refresh); });

	enter.addEventListener('click', function () {
		try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
		gate.hidden = true;
		document.body.classList.remove('pp-locked');
	});
})();
</script>

<?php wp_footer(); ?>
</body>
</html>

