<?php
/**
 * Catalog (product archive) template — PurePep.
 *
 * Maps 1:1 to design-system/ui_kits/storefront/catalog.html. Mirrors the
 * chrome from front-page.php (compliance ribbon, header, footer, age gate)
 * so the page is fully self-contained and does not depend on get_header()
 * or get_footer() partials.
 *
 * Loaded by WooCommerce when displaying the shop archive or any
 * `product_cat` taxonomy archive. Ignores the default WC sidebar.
 *
 * All marketing numerics render as [TKTK] until the brand team approves
 * production copy.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

$pp_woo          = function_exists( 'WC' );
$pp_cart_count   = ( $pp_woo && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;
$pp_active_cat   = isset( $_GET['product_cat'] ) ? sanitize_title( wp_unslash( $_GET['product_cat'] ) ) : '';
$pp_categories   = $pp_woo ? get_terms( [
	'taxonomy'   => 'product_cat',
	'hide_empty' => false,
	'parent'     => 0,
] ) : [];
$pp_categories   = is_wp_error( $pp_categories ) || ! is_array( $pp_categories ) ? [] : $pp_categories;

if ( is_tax( 'product_cat' ) ) {
	$pp_term       = get_queried_object();
	$pp_active_cat = $pp_term ? $pp_term->slug : $pp_active_cat;
}

$pp_cart_url   = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_shop_url   = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url = home_url( '/?s=&post_type=product' );

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
<title>Catalog &mdash; <?php bloginfo( 'name' ); ?></title>
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

@media (max-width: 1024px) { .pp-header-inner { grid-template-columns: 1fr auto; } .pp-nav { display: none; } }
</style>
</head>
<body <?php body_class( 'pp-catalog' ); ?>>

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
			<a href="<?php echo esc_url( $pp_shop_url ); ?>" class="is-active">Catalog</a>
			<a href="<?php echo esc_url( home_url( '/product/reta-10mg/' ) ); ?>">RETA</a>
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

<style>
.pp-cat-hero { background: var(--pp-bone); }
.pp-cat-hero-inner { max-width: var(--max-content); margin: 0 auto; padding: 56px var(--s-5) 40px; }
.pp-cat-hero h1 {
	font-family: var(--font-sans); font-weight: 900;
	font-size: clamp(48px, 6vw, 88px);
	letter-spacing: -0.035em; line-height: 1;
	color: var(--pp-ink); margin-top: 18px;
}
.pp-cat-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 36px; }
.pp-cat-pill {
	display: inline-flex; align-items: center;
	padding: 10px 18px;
	font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600;
	letter-spacing: var(--tracking-eyebrow); text-transform: uppercase;
	color: var(--pp-ink); text-decoration: none;
	border: var(--bw) solid var(--pp-ink); border-radius: 0;
	background: var(--pp-bone);
	transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.pp-cat-pill:hover { background: var(--pp-bone-soft); }
.pp-cat-pill.is-active { background: var(--pp-ink); color: var(--pp-bone); }
</style>

<!-- ==================== CATALOG HEADER ==================== -->
<section class="pp-cat-hero">
	<div class="pp-cat-hero-inner">
		<span class="pp-eyebrow">All compounds · lab-tested · lot-traceable</span>
		<h1>Catalog</h1>
		<div class="pp-cat-pills" role="tablist" aria-label="Compound categories">
			<a class="pp-cat-pill <?php echo '' === $pp_active_cat ? 'is-active' : ''; ?>" href="<?php echo esc_url( $pp_shop_url ); ?>">All</a>
			<?php foreach ( $pp_categories as $pp_cat ) :
				$pp_cat_url   = get_term_link( $pp_cat );
				$pp_is_active = $pp_active_cat === $pp_cat->slug;
				if ( is_wp_error( $pp_cat_url ) ) {
					$pp_cat_url = add_query_arg( 'product_cat', rawurlencode( $pp_cat->slug ), $pp_shop_url );
				}
			?>
				<a class="pp-cat-pill <?php echo $pp_is_active ? 'is-active' : ''; ?>" href="<?php echo esc_url( $pp_cat_url ); ?>"><?php echo esc_html( $pp_cat->name ); ?></a>
			<?php endforeach; ?>
			<?php if ( empty( $pp_categories ) ) : ?>
				<span class="pp-eyebrow">[TKTK — no compound categories configured yet]</span>
			<?php endif; ?>
		</div>
	</div>
</section>

<style>
.pp-grid-section { background: var(--pp-bone); }
.pp-grid-inner { max-width: var(--max-content); margin: 0 auto; padding: 56px var(--s-5) var(--s-9); }
.pp-product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.pp-product-card {
	background: var(--pp-bone);
	border-radius: var(--r-md); overflow: hidden;
	display: flex; flex-direction: column;
	transition: background var(--dur-fast) var(--ease);
}
.pp-product-card:hover { background: var(--pp-bone-soft); }
.pp-product-card.is-out { opacity: 0.85; }
.pp-product-card a.pp-card-body { color: var(--pp-ink); text-decoration: none; padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-3); }
.pp-product-img { aspect-ratio: 1 / 1; background: var(--pp-surface); display: grid; place-items: center; overflow: hidden; }
.pp-product-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-product-img-fallback { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-product-name { font-family: var(--font-sans); font-weight: 900; font-size: 22px; letter-spacing: -0.02em; line-height: 1.15; color: var(--pp-ink); margin: 0; }
.pp-product-meta { display: flex; flex-direction: column; gap: 4px; font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-product-bottom { padding: 0 var(--s-5) var(--s-5); display: flex; justify-content: space-between; align-items: center; gap: var(--s-3); }
.pp-product-price { font-family: var(--font-sans); font-weight: 700; font-size: 17px; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-product-price.is-out { color: var(--pp-ink-muted); text-decoration: line-through; }
.pp-stock-pill { display: inline-flex; align-items: center; padding: 4px 10px; font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; border: var(--bw) solid currentColor; border-radius: 0; }
.pp-stock-pill.is-in { color: var(--pp-emerald); background: var(--pp-emerald-soft); }
.pp-stock-pill.is-low { color: var(--pp-alert); background: var(--pp-alert-soft); }
.pp-stock-pill.is-out { color: var(--pp-alert); background: var(--pp-alert-soft); }
.pp-product-foot { padding: 0 var(--s-5) var(--s-5); display: flex; gap: var(--s-3); }
.pp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--pp-ink); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); padding: 14px 20px; font-family: var(--font-sans); font-weight: 600; font-size: 14px; letter-spacing: 0.02em; text-decoration: none; cursor: pointer; transition: background var(--dur-fast) var(--ease); flex: 1; }
.pp-btn:hover { background: #000; color: var(--pp-bone); }
.pp-btn[disabled], .pp-btn.is-disabled { background: var(--pp-line); color: var(--pp-ink-muted); cursor: not-allowed; }
.pp-product-empty { grid-column: 1 / -1; border: var(--bw) solid var(--pp-ink); padding: var(--s-7); text-align: center; font-family: var(--font-mono); font-size: var(--t-eyebrow); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-pagination { margin-top: var(--s-7); display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
.pp-pagination a, .pp-pagination span { display: inline-flex; align-items: center; padding: 10px 16px; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); text-decoration: none; border: var(--bw) solid var(--pp-ink); }
.pp-pagination .current { background: var(--pp-ink); color: var(--pp-bone); }

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

@media (max-width: 1024px) { .pp-product-grid { grid-template-columns: repeat(2, 1fr); } .pp-footer-cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px)  { .pp-product-grid { grid-template-columns: 1fr; } .pp-footer-cols { grid-template-columns: 1fr; gap: var(--s-5); } }
</style>

<!-- ==================== PRODUCT GRID ==================== -->
<section class="pp-grid-section" aria-label="Catalog grid">
	<div class="pp-grid-inner">
		<div class="pp-product-grid">
		<?php
		if ( $pp_woo && have_posts() ) :
			while ( have_posts() ) :
				the_post();
				$pp_product = wc_get_product( get_the_ID() );
				if ( ! $pp_product ) {
					continue;
				}
				$pp_cas    = get_post_meta( get_the_ID(), '_pp_cas', true );
				$pp_dose   = get_post_meta( get_the_ID(), '_pp_dose', true );
				$pp_stock  = $pp_product->get_stock_status();
				$pp_lowqty = (int) $pp_product->get_low_stock_amount();
				$pp_qty    = $pp_product->get_stock_quantity();
				$pp_state  = 'in';
				if ( 'outofstock' === $pp_stock ) {
					$pp_state = 'out';
				} elseif ( null !== $pp_qty && $pp_lowqty > 0 && $pp_qty <= $pp_lowqty ) {
					$pp_state = 'low';
				}
				?>
				<article class="pp-product-card <?php echo 'out' === $pp_state ? 'is-out' : ''; ?>" data-product-id="<?php echo esc_attr( $pp_product->get_id() ); ?>">
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
							<span><?php echo $pp_cas ? 'CAS ' . esc_html( $pp_cas ) : 'CAS [TKTK]'; ?></span>
							<span><?php echo $pp_dose ? esc_html( $pp_dose ) : '[TKTK]'; ?> · per vial</span>
						</div>
					</a>
					<div class="pp-product-bottom">
						<?php if ( 'out' === $pp_state ) : ?>
							<span class="pp-stock-pill is-out">Out of stock</span>
						<?php elseif ( 'low' === $pp_state ) : ?>
							<span class="pp-stock-pill is-low">Low stock — <?php echo esc_html( (string) $pp_qty ); ?> left</span>
						<?php else : ?>
							<span class="pp-stock-pill is-in">In stock</span>
						<?php endif; ?>
						<span class="pp-product-price <?php echo 'out' === $pp_state ? 'is-out' : ''; ?>">[TKTK]</span>
					</div>
					<div class="pp-product-foot">
						<?php if ( 'out' === $pp_state ) : ?>
							<a class="pp-btn is-disabled" href="<?php the_permalink(); ?>" aria-disabled="true">Notify when back</a>
						<?php else : ?>
							<a class="pp-btn"
								href="<?php echo esc_url( $pp_product->add_to_cart_url() ); ?>"
								data-product_id="<?php echo esc_attr( $pp_product->get_id() ); ?>"
								data-product_sku="<?php echo esc_attr( $pp_product->get_sku() ); ?>"
								rel="nofollow">
								Add to cart — [TKTK]
							</a>
						<?php endif; ?>
					</div>
				</article>
				<?php
			endwhile;
		else :
			?>
			<div class="pp-product-empty">
				<?php if ( ! $pp_woo ) : ?>
					[TKTK — WooCommerce not active. Activate to populate the catalog.]
				<?php else : ?>
					[TKTK — no products published in this category yet.]
				<?php endif; ?>
			</div>
		<?php endif; ?>
		</div>

		<?php if ( $pp_woo && function_exists( 'wc_get_loop_prop' ) ) : ?>
			<nav class="pp-pagination" aria-label="Catalog pagination">
				<?php
				$pp_total = wc_get_loop_prop( 'total_pages' );
				if ( $pp_total > 1 ) {
					echo paginate_links( [
						'base'      => esc_url_raw( str_replace( 999999999, '%#%', remove_query_arg( 'add-to-cart', get_pagenum_link( 999999999, false ) ) ) ),
						'format'    => '',
						'current'   => max( 1, (int) wc_get_loop_prop( 'current_page' ) ),
						'total'     => $pp_total,
						'prev_text' => '&larr; Prev',
						'next_text' => 'Next &rarr;',
						'type'      => 'plain',
					] ); // phpcs:ignore WordPress.Security.EscapeOutput
				}
				?>
			</nav>
		<?php endif; ?>
	</div>
</section>

<!-- ==================== BLUSH EDITORIAL BAND ==================== -->
<section class="pp-blush-band">
	<div class="pp-blush-inner">
		<blockquote>Every lot. Every assay. On record.</blockquote>
		<div class="pp-blush-attribution">PurePep quality standard · <?php echo esc_html( gmdate( 'Y' ) ); ?></div>
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
	if (!gate) return;
	try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}
	gate.hidden = false;
	document.body.classList.add('pp-locked');
	var checks = gate.querySelectorAll('input[data-pp-gate-check]');
	var enter = gate.querySelector('button[data-pp-enter]');
	function refresh() { var ok = true; checks.forEach(function (c) { if (!c.checked) ok = false; }); enter.disabled = !ok; }
	checks.forEach(function (c) { c.addEventListener('change', refresh); });
	enter.addEventListener('click', function () {
		try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
		gate.hidden = true;
		document.body.classList.remove('pp-locked');
	});
})();
</script>

<?php wp_footer(); ?>
</body>
</html>

