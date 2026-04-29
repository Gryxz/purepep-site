<?php
/**
 * Template Name: Affiliates — landing
 *
 * Affiliates program landing page. Mirrors design-system/ui_kits/storefront/
 * affiliates.html (and the AffiliateHero / AffiliateStepsBlock /
 * AffiliateTierTable / AffiliateFAQAccordion / AffiliateApplyForm components
 * from Affiliates.jsx). Self-contained chrome (compliance ribbon, header,
 * footer, age gate) matches front-page.php.
 *
 * Loads automatically when WordPress renders the page with slug "affiliates"
 * (page-affiliates.php is part of the WP template hierarchy). Can also be
 * selected manually as the "Affiliates — landing" template on any page.
 *
 * Guardrails per brief: no countdown timers, no income screenshots, no
 * public leaderboards, no "limited spots" language. All numerics [TKTK].
 *
 * @package PurePep
 */

defined( 'ABSPATH' ) || exit;

$pp_woo          = function_exists( 'WC' );
$pp_cart_count   = ( $pp_woo && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;
$pp_cart_url     = $pp_woo ? wc_get_cart_url() : home_url( '/cart/' );
$pp_shop_url     = $pp_woo ? wc_get_page_permalink( 'shop' ) : home_url( '/shop/' );
$pp_search_url   = home_url( '/?s=&post_type=product' );
$pp_dashboard_url = home_url( '/affiliates/dashboard/' );

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
<title>Affiliate program &mdash; <?php bloginfo( 'name' ); ?></title>
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
<body <?php body_class( 'pp-affiliates' ); ?>>

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
			<a href="<?php echo esc_url( home_url( '/affiliates/' ) ); ?>" class="is-active">Affiliates</a>
			<a href="<?php echo esc_url( $pp_woo ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' ) ); ?>">Account</a>
		</nav>
		<div class="pp-actions">
			<a class="pp-iconbtn" href="<?php echo esc_url( $pp_search_url ); ?>" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></a>
			<a class="pp-cart-btn" href="<?php echo esc_url( $pp_cart_url ); ?>" aria-label="Cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg><span><?php echo esc_html( str_pad( (string) $pp_cart_count, 2, '0', STR_PAD_LEFT ) ); ?></span></a>
		</div>
	</div>
</header>

<style>
.pp-aff-hero { background: var(--pp-bone); }
.pp-aff-hero-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5) var(--s-10); }
.pp-aff-hero-card { max-width: 860px; }
.pp-aff-hero h1 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(48px, 6.4vw, 92px); letter-spacing: -0.035em; line-height: 0.98; color: var(--pp-ink); margin: 28px 0; text-wrap: balance; }
.pp-aff-hero p.pp-aff-lede { font-family: var(--font-sans); font-size: 19px; line-height: 1.6; color: var(--pp-ink); max-width: 620px; margin: 0 0 var(--s-7); }
.pp-aff-hero-ctas { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.pp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--pp-ink); color: var(--pp-bone); border: var(--bw) solid var(--pp-ink); border-radius: var(--r-md); padding: 16px 28px; font-family: var(--font-sans); font-weight: 600; font-size: 15px; letter-spacing: 0.02em; text-decoration: none; cursor: pointer; transition: background var(--dur-fast) var(--ease); }
.pp-btn:hover { background: #000; color: var(--pp-bone); }
.pp-btn--lg { padding: 18px 32px; font-size: 16px; }
.pp-link { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--pp-ink); text-decoration: underline; text-underline-offset: 4px; letter-spacing: -0.005em; }

.pp-aff-benefits { background: var(--pp-bone); }
.pp-aff-benefits-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5); }
.pp-aff-benefits-head { max-width: 720px; margin-bottom: var(--s-7); }
.pp-aff-benefits-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(32px, 3.6vw, 48px); letter-spacing: -0.03em; line-height: 1; color: var(--pp-ink); margin-top: 16px; }
.pp-aff-benefits-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.pp-aff-benefit {
	padding: var(--s-7) var(--s-6);
	border: var(--bw) solid var(--pp-ink);
	margin-left: -1.5px;
	background: var(--pp-bone);
	display: flex; flex-direction: column; gap: var(--s-3);
}
.pp-aff-benefit:first-child { margin-left: 0; }
.pp-aff-benefit-glyph {
	width: 44px; height: 44px;
	border: var(--bw) solid var(--pp-ink); display: grid; place-items: center;
	margin-bottom: var(--s-3); color: var(--pp-ink);
}
.pp-aff-benefit h3 { font-family: var(--font-sans); font-weight: 900; font-size: 22px; letter-spacing: -0.02em; line-height: 1.15; color: var(--pp-ink); margin: 0; }
.pp-aff-benefit p { font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--pp-ink); margin: 0; }

.pp-aff-steps { background: var(--pp-surface); }
.pp-aff-steps-inner { max-width: var(--max-content); margin: 0 auto; padding: var(--s-9) var(--s-5); }
.pp-aff-steps-head { max-width: 640px; margin-bottom: var(--s-7); }
.pp-aff-steps-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(32px, 3.8vw, 52px); letter-spacing: -0.03em; line-height: 1; color: var(--pp-ink); margin-top: 18px; }
.pp-aff-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.pp-aff-step {
	padding: var(--s-7) var(--s-6);
	border: var(--bw) solid var(--pp-ink);
	margin-left: -1.5px;
	background: var(--pp-bone);
	border-radius: var(--r-md);
}
.pp-aff-step:first-child { margin-left: 0; }
.pp-aff-step-num { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--pp-ink-muted); margin-bottom: var(--s-5); }
.pp-aff-step h3 { font-family: var(--font-sans); font-weight: 900; font-size: 28px; letter-spacing: -0.025em; line-height: 1.1; color: var(--pp-ink); margin: 0 0 14px; }
.pp-aff-step p { font-family: var(--font-sans); font-size: 15px; line-height: 1.6; color: var(--pp-ink); margin: 0; }

@media (max-width: 1024px) {
	.pp-aff-benefits-grid, .pp-aff-steps-grid { grid-template-columns: 1fr; }
	.pp-aff-benefit, .pp-aff-step { margin-left: 0; margin-top: -1.5px; }
	.pp-aff-benefit:first-child, .pp-aff-step:first-child { margin-top: 0; }
}
</style>

<!-- ==================== HERO ==================== -->
<section class="pp-aff-hero">
	<div class="pp-aff-hero-inner">
		<div class="pp-aff-hero-card">
			<span class="pp-eyebrow">PurePep affiliate program</span>
			<h1>Earn [TKTK]% on every verified researcher you refer.</h1>
			<p class="pp-aff-lede">Lot-matched COA means your audience trusts the product. That trust converts. Documentation is on file for every vial that leaves the building &mdash; share with confidence.</p>
			<div class="pp-aff-hero-ctas">
				<a class="pp-btn pp-btn--lg" href="#pp-apply">Apply now &rarr;</a>
				<a class="pp-link" href="<?php echo esc_url( $pp_dashboard_url ); ?>">Already an affiliate? Access dashboard &rarr;</a>
			</div>
		</div>
	</div>
</section>

<!-- ==================== THREE BENEFIT CARDS ==================== -->
<section class="pp-aff-benefits" aria-labelledby="pp-aff-benefits-title">
	<div class="pp-aff-benefits-inner">
		<div class="pp-aff-benefits-head">
			<span class="pp-eyebrow">Why partner with PurePep</span>
			<h2 id="pp-aff-benefits-title">A program built on documentation, not hype.</h2>
		</div>
		<div class="pp-aff-benefits-grid">
			<div class="pp-aff-benefit">
				<div class="pp-aff-benefit-glyph">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
				</div>
				<h3>Real product, real proof</h3>
				<p>Every order ships with an independent third-party COA: HPLC purity, mass confirmation, endotoxin. You refer a product your audience can verify, not a promise.</p>
			</div>
			<div class="pp-aff-benefit">
				<div class="pp-aff-benefit-glyph">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
				</div>
				<h3>[TKTK]-day cookie window</h3>
				<p>Generous attribution that respects how research-grade buyers actually shop &mdash; multi-session, comparison-driven, deliberate. We do not penalize considered purchases.</p>
			</div>
			<div class="pp-aff-benefit">
				<div class="pp-aff-benefit-glyph">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v4H3z"/><path d="M5 7v13h14V7"/><path d="M9 12h6"/></svg>
				</div>
				<h3>Asset library on file</h3>
				<p>Brand lockups, banner sets, COA-as-content, and copy blocks &mdash; all editorial, all RUO-compliant. Drop the link and run with assets that already match the standard.</p>
			</div>
		</div>
	</div>
</section>

<!-- ==================== HOW IT WORKS — 3 STEPS ==================== -->
<section class="pp-aff-steps" aria-labelledby="pp-aff-steps-title">
	<div class="pp-aff-steps-inner">
		<div class="pp-aff-steps-head">
			<span class="pp-eyebrow">How it works</span>
			<h2 id="pp-aff-steps-title">Three steps. No gimmicks.</h2>
		</div>
		<div class="pp-aff-steps-grid">
			<div class="pp-aff-step">
				<div class="pp-aff-step-num">01 &middot; Share</div>
				<h3>Share</h3>
				<p>Get your unique referral link. Drop it in research forums, lab newsletters, video descriptions, or DMs &mdash; anywhere a qualified researcher already reads you.</p>
			</div>
			<div class="pp-aff-step">
				<div class="pp-aff-step-num">02 &middot; Convert</div>
				<h3>Convert</h3>
				<p>Your audience orders. Cookie tracks for [TKTK] days. Multi-session attribution credits the click that started the consideration cycle, not just the final visit.</p>
			</div>
			<div class="pp-aff-step">
				<div class="pp-aff-step-num">03 &middot; Earn</div>
				<h3>Earn</h3>
				<p>Payouts issued on the [TKTK] of every month once your balance hits $[TKTK]. PayPal, ACH, or crypto &mdash; your choice at the dashboard.</p>
			</div>
		</div>
	</div>
</section>

<style>
.pp-aff-tiers { background: var(--pp-bone); }
.pp-aff-tiers-inner { max-width: 1080px; margin: 0 auto; padding: var(--s-9) var(--s-5); }
.pp-aff-tiers-head { margin-bottom: var(--s-6); }
.pp-aff-tiers-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(30px, 3.4vw, 44px); letter-spacing: -0.025em; line-height: 1; color: var(--pp-ink); margin-top: 16px; }
.pp-tier-table { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-tier-row { display: grid; grid-template-columns: 1.2fr 1.8fr 1fr 1fr; gap: 0; padding: var(--s-4) var(--s-5); align-items: center; }
.pp-tier-row.is-head { background: var(--pp-surface); border-bottom: var(--bw) solid var(--pp-ink); padding: 14px var(--s-5); font-family: var(--font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pp-ink); }
.pp-tier-row + .pp-tier-row:not(.is-head) { border-top: var(--bw) solid var(--pp-line); }
.pp-tier-row:nth-child(odd):not(.is-head) { background: var(--pp-bone-soft); }
.pp-tier-name { font-family: var(--font-sans); font-weight: 700; font-size: 16px; letter-spacing: -0.01em; color: var(--pp-ink); }
.pp-tier-rev { font-family: var(--font-mono); font-size: 13px; font-weight: 500; letter-spacing: 0.04em; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-tier-rate { font-family: var(--font-sans); font-weight: 700; font-size: 18px; letter-spacing: -0.015em; color: var(--pp-ink); font-variant-numeric: tabular-nums; }
.pp-tier-bonus { font-family: var(--font-mono); font-size: 13px; font-weight: 500; letter-spacing: 0.04em; color: var(--pp-ink-muted); }
.pp-tier-foot { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); margin-top: var(--s-4); }

@media (max-width: 720px) {
	.pp-tier-row { grid-template-columns: 1fr 1fr; row-gap: 8px; column-gap: var(--s-4); }
	.pp-tier-row.is-head { display: none; }
	.pp-tier-name { grid-column: 1 / -1; font-size: 18px; }
	.pp-tier-rev { grid-column: 1 / -1; }
}

.pp-aff-faq { background: var(--pp-surface); }
.pp-aff-faq-inner { max-width: 880px; margin: 0 auto; padding: var(--s-9) var(--s-5); }
.pp-aff-faq-head { margin-bottom: var(--s-6); }
.pp-aff-faq-head h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(30px, 3.4vw, 44px); letter-spacing: -0.025em; line-height: 1; color: var(--pp-ink); margin-top: 16px; }
.pp-faq-list { border: var(--bw) solid var(--pp-ink); background: var(--pp-bone); }
.pp-faq-item { border-bottom: var(--bw) solid var(--pp-line); }
.pp-faq-item:last-child { border-bottom: 0; }
.pp-faq-item summary {
	list-style: none; cursor: pointer;
	padding: var(--s-5);
	font-family: var(--font-sans); font-weight: 700; font-size: 17px;
	letter-spacing: -0.01em; line-height: 1.3; color: var(--pp-ink);
	display: flex; justify-content: space-between; gap: var(--s-3); align-items: center;
}
.pp-faq-item summary::-webkit-details-marker { display: none; }
.pp-faq-item summary::after {
	content: '+';
	font-family: var(--font-mono); font-size: 22px; font-weight: 400;
	color: var(--pp-ink); flex: 0 0 auto;
	transition: transform var(--dur-fast) var(--ease);
}
.pp-faq-item[open] summary::after { content: '\2212'; }
.pp-faq-item summary:hover { background: var(--pp-bone-soft); }
.pp-faq-body {
	padding: 0 var(--s-5) var(--s-5);
	font-family: var(--font-sans); font-size: 15px; line-height: 1.65;
	color: var(--pp-ink); max-width: 720px;
}
.pp-faq-body p + p { margin-top: 12px; }

.pp-aff-apply { background: var(--pp-bone); scroll-margin-top: 24px; }
.pp-aff-apply-inner { max-width: 880px; margin: 0 auto; padding: var(--s-9) var(--s-5); text-align: center; }
.pp-aff-apply h2 { font-family: var(--font-sans); font-weight: 900; font-size: clamp(36px, 4vw, 60px); letter-spacing: -0.03em; line-height: 1; color: var(--pp-ink); margin-top: 18px; text-wrap: balance; }
.pp-aff-apply p { font-family: var(--font-sans); font-size: 18px; line-height: 1.6; color: var(--pp-ink); max-width: 600px; margin: 24px auto 32px; }
.pp-aff-apply-ctas { display: flex; gap: var(--s-5); justify-content: center; flex-wrap: wrap; }
.pp-aff-apply-microcopy { font-family: var(--font-mono); font-size: var(--t-eyebrow); font-weight: 500; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--pp-ink-muted); margin-top: var(--s-6); }

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

<!-- ==================== COMMISSION TIER TABLE ==================== -->
<section class="pp-aff-tiers" aria-labelledby="pp-aff-tiers-title">
	<div class="pp-aff-tiers-inner">
		<div class="pp-aff-tiers-head">
			<span class="pp-eyebrow">Commission structure</span>
			<h2 id="pp-aff-tiers-title">Tiers evaluated monthly.</h2>
		</div>
		<div class="pp-tier-table">
			<div class="pp-tier-row is-head">
				<span>Tier</span>
				<span>Monthly referred revenue</span>
				<span>Commission</span>
				<span>Bonus</span>
			</div>
			<div class="pp-tier-row">
				<span class="pp-tier-name">Base</span>
				<span class="pp-tier-rev">$0 &ndash; $[TKTK]</span>
				<span class="pp-tier-rate">[TKTK]%</span>
				<span class="pp-tier-bonus">&mdash;</span>
			</div>
			<div class="pp-tier-row">
				<span class="pp-tier-name">Silver</span>
				<span class="pp-tier-rev">$[TKTK] &ndash; $[TKTK]</span>
				<span class="pp-tier-rate">[TKTK]%</span>
				<span class="pp-tier-bonus">[TKTK]</span>
			</div>
			<div class="pp-tier-row">
				<span class="pp-tier-name">Gold</span>
				<span class="pp-tier-rev">$[TKTK] &ndash; $[TKTK]</span>
				<span class="pp-tier-rate">[TKTK]%</span>
				<span class="pp-tier-bonus">[TKTK]</span>
			</div>
			<div class="pp-tier-row">
				<span class="pp-tier-name">Platinum</span>
				<span class="pp-tier-rev">$[TKTK]+</span>
				<span class="pp-tier-rate">[TKTK]%</span>
				<span class="pp-tier-bonus">[TKTK]</span>
			</div>
		</div>
		<div class="pp-tier-foot">Tiers reset on the [TKTK] of each month &middot; All values illustrative until program launch</div>
	</div>
</section>

<!-- ==================== FAQ ACCORDION (pure CSS details/summary) ==================== -->
<section class="pp-aff-faq" aria-labelledby="pp-aff-faq-title">
	<div class="pp-aff-faq-inner">
		<div class="pp-aff-faq-head">
			<span class="pp-eyebrow">Common questions</span>
			<h2 id="pp-aff-faq-title">Frequently asked.</h2>
		</div>
		<div class="pp-faq-list">
			<details class="pp-faq-item">
				<summary>What counts as a qualified referral?</summary>
				<div class="pp-faq-body">
					<p>A referral is qualified when the visitor lands through your tracking link, completes age and researcher verification, and places an order that is not refunded or charged back. Self-purchases do not qualify.</p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>How long is the cookie window?</summary>
				<div class="pp-faq-body">
					<p>Attribution cookies are stored for [TKTK] days from the click. Multi-session attribution credits the most recent affiliate touch within the window.</p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>Where can I share my link?</summary>
				<div class="pp-faq-body">
					<p>Owned channels (your blog, newsletter, podcast, video description, professional profile) and research-context communities where you have established readership. Promotional restrictions: no paid search bidding on PurePep brand terms, no spam, no networks that buy traffic.</p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>Are there promotional restrictions?</summary>
				<div class="pp-faq-body">
					<p>Yes. Affiliates may not run paid ads on PurePep trademarks, may not make therapeutic, medical, weight-loss, or wellness claims, and may not place links on sites that would imply endorsement for human consumption. The locked compliance copy must accompany any product mention: <em>For research use only. Not for human consumption.</em></p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>How and when do payouts happen?</summary>
				<div class="pp-faq-body">
					<p>Payouts are issued on the [TKTK] of every month for balances that exceed $[TKTK]. PayPal, ACH, and crypto are all supported &mdash; you choose at the dashboard. Earnings are locked for [TKTK] days after the order to clear refund and chargeback windows before they become payable.</p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>What tax forms do I need?</summary>
				<div class="pp-faq-body">
					<p>US affiliates earning over $[TKTK] in a calendar year submit a W-9. Non-US affiliates submit a W-8BEN. The dashboard will prompt for the relevant form once your earnings approach the threshold.</p>
				</div>
			</details>
			<details class="pp-faq-item">
				<summary>Can I be demoted from a tier?</summary>
				<div class="pp-faq-body">
					<p>Tier evaluation runs monthly. If your trailing-30-day referred revenue drops below the threshold for your current tier, you move to the next tier down on the next evaluation. There is no retroactive clawback &mdash; commissions earned at the higher tier stay paid.</p>
				</div>
			</details>
		</div>
	</div>
</section>

<!-- ==================== APPLY CTA ==================== -->
<section class="pp-aff-apply" id="pp-apply" data-apply-anchor>
	<div class="pp-aff-apply-inner">
		<span class="pp-eyebrow">Ready when you are</span>
		<h2>Apply once. Share with confidence.</h2>
		<p>Applications are reviewed within [TKTK] business days. We accept researchers, educators, science writers, and labs who already have an audience that benefits from documented, lot-traceable peptides.</p>
		<div class="pp-aff-apply-ctas">
			<a class="pp-btn pp-btn--lg" href="<?php echo esc_url( home_url( '/affiliates/apply/' ) ); ?>">Apply now &rarr;</a>
			<a class="pp-btn" style="background: var(--pp-bone); color: var(--pp-ink);" href="<?php echo esc_url( $pp_dashboard_url ); ?>">Sign in to dashboard</a>
		</div>
		<div class="pp-aff-apply-microcopy">No leaderboards &middot; No public payouts &middot; No "limited spots" pressure</div>
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
	var enter  = gate.querySelector('button[data-pp-enter]');
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

