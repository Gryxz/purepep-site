<?php
/**
 * Template Name: Affiliates — dashboard
 *
 * Logged-in affiliate dashboard. Mirrors design-system/ui_kits/storefront/
 * affiliates-dashboard.html and the AffiliateDashboard* components from
 * AffiliatesDashboard.jsx. Self-contained chrome (compliance ribbon, header,
 * footer, age gate) matches front-page.php.
 *
 * Loads automatically when the page slug is "affiliates-dashboard"
 * (page-affiliates-dashboard.php is part of the WP template hierarchy).
 *
 * Auth gate: visitors who are not logged in are redirected to the WC My
 * Account page (where login + registration live) with the dashboard URL
 * set as the redirect_to query arg, so they land back here after
 * authenticating.
 *
 * All marketing numerics render as [TKTK] until program launch. Real values
 * will be wired through AffiliateWP / a custom affiliate plugin later.
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
	$pp_login_redirect = function_exists( 'wc_get_page_permalink' )
		? wc_get_page_permalink( 'myaccount' )
		: wp_login_url();
	$pp_login_redirect = add_query_arg( 'redirect_to', rawurlencode( get_permalink() ), $pp_login_redirect );
	wp_safe_redirect( $pp_login_redirect );
	exit;
}

$pp_user           = wp_get_current_user();
$pp_display_name   = $pp_user && $pp_user->display_name ? $pp_user->display_name : '[TKTK — researcher]';
$pp_user_login     = $pp_user ? $pp_user->user_login : '';
$pp_referral_code  = $pp_user_login ? strtoupper( substr( preg_replace( '/[^A-Za-z0-9]/', '', $pp_user_login ), 0, 12 ) ) : '[TKTK-USER-CODE]';
$pp_referral_code  = $pp_referral_code ? $pp_referral_code : '[TKTK-USER-CODE]';
$pp_referral_url   = add_query_arg( 'ref', strtolower( $pp_referral_code ), home_url( '/' ) );
$pp_tier           = 'SILVER';

$pp_woo          = function_exists( 'WC' );
$pp_cart_count   = ( $pp_woo && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;
$pp_cart_url     = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_shop_url     = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url   = home_url( '/?s=&post_type=product' );
$pp_landing_url  = home_url( '/affiliates/' );

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
<title>Affiliate dashboard &mdash; <?php bloginfo( 'name' ); ?></title>
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
<body <?php body_class( 'pp-affiliates-dashboard' ); ?>>

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
			<a href="<?php echo esc_url( $pp_landing_url ); ?>" class="is-active">Affiliates</a>
			<a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Account</a>
		</nav>
		<div class="pp-actions">
			<a class="pp-iconbtn" href="<?php echo esc_url( $pp_search_url ); ?>" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></a>
			<a class="pp-cart-btn" href="<?php echo esc_url( $pp_cart_url ); ?>" aria-label="Cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><span><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?></span></a>
		</div>
	</div>
</header>

<style>
.pp-dash-hero { background: var(--pp-bone); }
.pp-dash-hero-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5) 44px; display: grid; grid-template-columns: 1fr auto; gap: var(--s-6); align-items: end; }
.pp-dash-hero-row { display: flex; align-items: center; gap: 18px; margin-top: 14px; flex-wrap: wrap; }
.pp-dash-hero h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(28px, 3.4vw, 42px); letter-spacing: -0.025em; line-height: 1; color: var(--pp-ink); margin: 0; }
.pp-tier-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pp-ink); border-radius: var(--r-sm); }
.pp-tier-pill::before { content: ''; width: 6px; height: 6px; background: var(--pp-emerald); display: inline-block; }
.pp-dash-payout { text-align: right; }
.pp-dash-payout-label { font-family: var(--font-mono); font-size: 10.5px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pp-ink-muted); margin-bottom: 6px; }
.pp-dash-payout-value { font-family: var(--font-sans); font-weight: 900; font-size: 28px; letter-spacing: -0.02em; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-dash-payout-meta { font-family: var(--font-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink-muted); margin-top: 4px; }
@media (max-width: 720px) { .pp-dash-hero-inner { grid-template-columns: 1fr; gap: 16px; } .pp-dash-payout { text-align: left; } }

.pp-dash-stats { background: var(--pp-surface); }
.pp-dash-stats-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5); }
.pp-dash-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-dash-stat { padding: var(--s-6) var(--s-5); border-left: var(--bw) solid var(--pp-ink); }
.pp-dash-stat:first-child { border-left: none; }
.pp-dash-stat-label { font-family: var(--font-mono); font-size: 10.5px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pp-ink-muted); margin-bottom: 14px; }
.pp-dash-stat-value { font-family: var(--font-sans); font-weight: 900; font-size: clamp(32px, 3vw, 44px); letter-spacing: -0.025em; line-height: 1; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-dash-stat-caption { font-family: var(--font-mono); font-size: 11px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink); margin-top: 10px; }
@media (max-width: 1024px) { .pp-dash-stats-grid { grid-template-columns: repeat(2, 1fr); } .pp-dash-stat:nth-child(3) { border-left: none; } .pp-dash-stat:nth-child(n+3) { border-top: 1px solid var(--pp-line); } }
@media (max-width: 640px)  { .pp-dash-stats-grid { grid-template-columns: 1fr; } .pp-dash-stat { border-left: none; border-top: 1px solid var(--pp-line); } .pp-dash-stat:first-child { border-top: none; } }

.pp-dash-ref { background: var(--pp-bone); }
.pp-dash-ref-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5); }
.pp-dash-ref-head { margin-bottom: 22px; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--s-3); }
.pp-dash-ref-row { display: grid; grid-template-columns: 1fr auto; gap: 0; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); border-radius: var(--r-md); overflow: hidden; }
.pp-dash-ref-url { padding: 18px var(--s-5); font-family: var(--font-mono); font-size: 15px; font-weight: 500; letter-spacing: 0.04em; color: var(--pp-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; user-select: all; }
.pp-dash-ref-copy { padding: 0 var(--s-6); background: var(--pp-ink); color: var(--pp-bone); border: 0; border-left: var(--bw) solid var(--pp-ink); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; transition: background var(--dur-fast) var(--ease); display: inline-flex; align-items: center; gap: 8px; }
.pp-dash-ref-copy:hover { background: #000; }
.pp-dash-ref-copy.is-copied { background: var(--pp-emerald); border-left-color: var(--pp-emerald); }
.pp-dash-ref-caption { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink-muted); margin-top: 12px; }
.pp-dash-ref-code { font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--pp-ink); padding: 4px 10px; border: var(--bw) solid var(--pp-ink); }
@media (max-width: 720px) { .pp-dash-ref-row { grid-template-columns: 1fr; } .pp-dash-ref-copy { border-left: 0; border-top: var(--bw) solid var(--pp-ink); padding: 14px; } }
</style>

<!-- ==================== DASHBOARD HERO ==================== -->
<section class="pp-dash-hero" aria-labelledby="pp-dash-title">
	<div class="pp-dash-hero-inner">
		<div>
			<span class="pp-eyebrow">Affiliate dashboard</span>
			<div class="pp-dash-hero-row">
				<h1 id="pp-dash-title"><?php echo esc_html( $pp_display_name ); ?></h1>
				<span class="pp-tier-pill">Tier &middot; <?php echo esc_html( $pp_tier ); ?></span>
			</div>
		</div>
		<div class="pp-dash-payout">
			<div class="pp-dash-payout-label">Next payout</div>
			<div class="pp-dash-payout-value">[TKTK]</div>
			<div class="pp-dash-payout-meta">[TKTK] days</div>
		</div>
	</div>
</section>

<!-- ==================== KPI STAT GRID ==================== -->
<section class="pp-dash-stats" aria-label="Performance">
	<div class="pp-dash-stats-inner">
		<div class="pp-dash-stats-grid">
			<div class="pp-dash-stat">
				<div class="pp-dash-stat-label">Clicks</div>
				<div class="pp-dash-stat-value">[TKTK]</div>
				<div class="pp-dash-stat-caption">Last 30 days</div>
			</div>
			<div class="pp-dash-stat">
				<div class="pp-dash-stat-label">Conversions</div>
				<div class="pp-dash-stat-value">[TKTK]</div>
				<div class="pp-dash-stat-caption">[TKTK]% rate</div>
			</div>
			<div class="pp-dash-stat">
				<div class="pp-dash-stat-label">Earnings</div>
				<div class="pp-dash-stat-value">$[TKTK]</div>
				<div class="pp-dash-stat-caption">Lifetime</div>
			</div>
			<div class="pp-dash-stat">
				<div class="pp-dash-stat-label">Pending</div>
				<div class="pp-dash-stat-value">$[TKTK]</div>
				<div class="pp-dash-stat-caption">Available [TKTK]</div>
			</div>
		</div>
	</div>
</section>

<!-- ==================== REFERRAL LINK + COPY ==================== -->
<section class="pp-dash-ref" aria-labelledby="pp-dash-ref-title">
	<div class="pp-dash-ref-inner">
		<div class="pp-dash-ref-head">
			<div>
				<span class="pp-eyebrow">Your referral link</span>
				<h2 id="pp-dash-ref-title" style="font-family: var(--font-sans); font-weight: 900; font-size: 22px; letter-spacing: -0.015em; color: var(--pp-ink); margin-top: 8px;">Drop it anywhere a qualified researcher already reads you.</h2>
			</div>
			<span class="pp-dash-ref-code">Code &middot; <?php echo esc_html( $pp_referral_code ); ?></span>
		</div>
		<div class="pp-dash-ref-row">
			<input class="pp-dash-ref-url" id="pp-ref-url" type="text" readonly value="<?php echo esc_attr( $pp_referral_url ); ?>" aria-label="Your referral URL">
			<button type="button" class="pp-dash-ref-copy" data-pp-copy-target="pp-ref-url" aria-label="Copy referral link">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="0"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
				<span data-pp-copy-label>Copy</span>
			</button>
		</div>
		<div class="pp-dash-ref-caption">Cookie window &middot; [TKTK] days &middot; multi-session attribution</div>
	</div>
</section>

<style>
.pp-dash-payouts { background: var(--pp-bone); }
.pp-dash-payouts-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5); }
.pp-dash-payouts-head { margin-bottom: 22px; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: var(--s-3); }
.pp-dash-payouts-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(24px, 2.6vw, 32px); letter-spacing: -0.02em; line-height: 1.1; color: var(--pp-ink); margin-top: 8px; }
.pp-payout-table { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-payout-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 0; padding: 14px var(--s-5); align-items: center; }
.pp-payout-row.is-head { background: var(--pp-surface); border-bottom: var(--bw) solid var(--pp-ink); font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pp-ink); }
.pp-payout-row + .pp-payout-row:not(.is-head) { border-top: var(--bw) solid var(--pp-line); }
.pp-payout-empty { padding: var(--s-9) var(--s-5); text-align: center; }
.pp-payout-empty-glyph { width: 56px; height: 56px; border: var(--bw) solid var(--pp-ink); display: grid; place-items: center; margin: 0 auto var(--s-4); color: var(--pp-ink-muted); }
.pp-payout-empty p { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); line-height: 1.6; max-width: 480px; margin: 0 auto; }
.pp-payout-empty p + p { margin-top: 12px; }

.pp-dash-assets { background: var(--pp-surface); }
.pp-dash-assets-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-7) var(--s-5); }
.pp-dash-assets-head { margin-bottom: 22px; }
.pp-dash-assets-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(24px, 2.6vw, 32px); letter-spacing: -0.02em; line-height: 1.1; color: var(--pp-ink); margin-top: 8px; }
.pp-dash-assets-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-dash-asset { padding: var(--s-5); border-left: var(--bw) solid var(--pp-ink); display: flex; flex-direction: column; gap: var(--s-3); min-height: 200px; }
.pp-dash-asset:first-child { border-left: none; }
.pp-dash-asset-glyph { width: 32px; height: 32px; border: var(--bw) solid var(--pp-ink); display: grid; place-items: center; color: var(--pp-ink); }
.pp-dash-asset-label { font-family: var(--font-mono); font-size: 10.5px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-dash-asset-name { font-family: var(--font-sans); font-weight: 700; font-size: 16px; letter-spacing: -0.01em; color: var(--pp-ink); }
.pp-dash-asset-meta { font-family: var(--font-mono); font-size: 10.5px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--pp-ink-muted); }
.pp-dash-asset-link { margin-top: auto; font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 700; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink); text-decoration: none; padding-top: var(--s-3); border-top: var(--bw) solid var(--pp-line); }
.pp-dash-asset-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.pp-dash-asset-link.is-disabled { color: var(--pp-ink-muted); pointer-events: none; }
@media (max-width: 1024px) { .pp-dash-assets-grid { grid-template-columns: repeat(2, 1fr); } .pp-dash-asset:nth-child(3) { border-left: none; } .pp-dash-asset:nth-child(n+3) { border-top: 1px solid var(--pp-line); } }
@media (max-width: 640px)  { .pp-dash-assets-grid { grid-template-columns: 1fr; } .pp-dash-asset { border-left: none; border-top: 1px solid var(--pp-line); } .pp-dash-asset:first-child { border-top: none; } }

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

<!-- ==================== PAYOUT HISTORY (empty state stub) ==================== -->
<section class="pp-dash-payouts" aria-labelledby="pp-dash-payouts-title">
	<div class="pp-dash-payouts-inner">
		<div class="pp-dash-payouts-head">
			<div>
				<span class="pp-eyebrow">Payout history</span>
				<h2 id="pp-dash-payouts-title">Once cleared, payouts land here.</h2>
			</div>
			<span class="pp-eyebrow">Showing [TKTK]</span>
		</div>
		<div class="pp-payout-table" aria-live="polite">
			<div class="pp-payout-row is-head">
				<span>Date</span>
				<span>Method</span>
				<span>Status</span>
				<span>Amount</span>
			</div>
			<div class="pp-payout-empty">
				<div class="pp-payout-empty-glyph" aria-hidden="true">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="0"/><path d="M3 10h18"/><path d="M7 15h2"/></svg>
				</div>
				<p>No payouts yet</p>
				<p style="color: var(--pp-ink); margin-top: 18px;">First payout clears once your balance reaches $[TKTK]. We will email you when it is queued for the next monthly run.</p>
			</div>
		</div>
	</div>
</section>

<!-- ==================== PROMOTIONAL ASSETS ==================== -->
<section class="pp-dash-assets" aria-labelledby="pp-dash-assets-title">
	<div class="pp-dash-assets-inner">
		<div class="pp-dash-assets-head">
			<span class="pp-eyebrow">Asset library</span>
			<h2 id="pp-dash-assets-title">Editorial-grade promotional kits.</h2>
		</div>
		<div class="pp-dash-assets-grid">
			<div class="pp-dash-asset">
				<div class="pp-dash-asset-glyph" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12"/><path d="M3 10h18"/></svg></div>
				<div class="pp-dash-asset-label">01 &middot; Lockups</div>
				<div class="pp-dash-asset-name">PurePep wordmark kit</div>
				<div class="pp-dash-asset-meta">SVG · PNG @1× @2× · Ink + Bone variants</div>
				<a class="pp-dash-asset-link" href="#" download>Download &rarr;</a>
			</div>
			<div class="pp-dash-asset">
				<div class="pp-dash-asset-glyph" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12"/><path d="M2 10h20"/><path d="M6 14h4"/></svg></div>
				<div class="pp-dash-asset-label">02 &middot; Banners</div>
				<div class="pp-dash-asset-name">Web banner set</div>
				<div class="pp-dash-asset-meta">300×250 · 728×90 · 970×250 · 160×600</div>
				<a class="pp-dash-asset-link" href="#" download>Download &rarr;</a>
			</div>
			<div class="pp-dash-asset">
				<div class="pp-dash-asset-glyph" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 11h6"/><path d="M12 8v8"/></svg></div>
				<div class="pp-dash-asset-label">03 &middot; Product shots</div>
				<div class="pp-dash-asset-name">Vial photography</div>
				<div class="pp-dash-asset-meta">RETA · SEMA · TIRZ · CAGRI</div>
				<a class="pp-dash-asset-link is-disabled" href="#" aria-disabled="true">[TKTK] &mdash; pending</a>
			</div>
			<div class="pp-dash-asset">
				<div class="pp-dash-asset-glyph" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 13h8"/><path d="M8 17h5"/></svg></div>
				<div class="pp-dash-asset-label">04 &middot; Copy blocks</div>
				<div class="pp-dash-asset-name">Editorial copy &amp; FTC disclosure</div>
				<div class="pp-dash-asset-meta">Markdown · plain text · RUO compliance</div>
				<a class="pp-dash-asset-link" href="#" download>Download &rarr;</a>
			</div>
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
				<li><a href="<?php echo esc_url( $pp_landing_url ); ?>">Affiliate program</a></li>
				<li><a href="<?php echo esc_url( wp_logout_url( home_url( '/' ) ) ); ?>">Sign out</a></li>
				<li><a href="<?php echo esc_url( home_url( '/orders/' ) ); ?>">Order history</a></li>
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

	// --- Copy referral link to clipboard ----------------------------------
	document.querySelectorAll('[data-pp-copy-target]').forEach(function (btn) {
		btn.addEventListener('click', function () {
			var target = document.getElementById(btn.getAttribute('data-pp-copy-target'));
			if (!target) return;
			var label = btn.querySelector('[data-pp-copy-label]');
			var done = function () {
				btn.classList.add('is-copied');
				if (label) label.textContent = 'Copied';
				setTimeout(function () {
					btn.classList.remove('is-copied');
					if (label) label.textContent = 'Copy';
				}, 1800);
			};
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(target.value).then(done).catch(function () {
					target.select();
					document.execCommand('copy');
					done();
				});
			} else {
				target.select();
				document.execCommand('copy');
				done();
			}
		});
	});
})();
</script>

<?php wp_footer(); ?>
</body>
</html>

