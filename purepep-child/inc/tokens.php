<?php
/**
 * PurePep design tokens — PHP mirror of design-system/colors_and_type.css.
 *
 * Source of truth: design-system/colors_and_type.css at the repo root.
 * Keep this file in sync when tokens change. Never invent values.
 *
 * @package PurePep
 */

namespace PurePep;

defined( 'ABSPATH' ) || exit;

final class Tokens {

	/* ---------- Palette (locked) ---------- */
	const COLOR_INK          = '#1F1F1F';
	const COLOR_INK_MUTED    = '#6E6E6E';
	const COLOR_BONE         = '#FAF7F0';
	const COLOR_BONE_SOFT    = '#F5F1E6';
	const COLOR_SURFACE      = '#F1EDE3';
	const COLOR_BLUSH        = '#F2D7D7';
	const COLOR_LINE         = '#E4DFCF';
	const COLOR_WHITE        = '#FFFFFF';

	/* Semantic accents */
	const COLOR_EMERALD      = '#0F5132';
	const COLOR_EMERALD_SOFT = '#E8F0EB';
	const COLOR_ALERT        = '#C83E4D';
	const COLOR_ALERT_SOFT   = '#F7E4E6';

	/* Favicon-only — never use in UI, type, or buttons. */
	const COLOR_AMBER_FAVICON_ONLY = '#DC9814';

	/* ---------- Typography ---------- */
	const FONT_SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
	const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace";

	/* Type scale */
	const T_DISPLAY_XL = '112px';
	const T_DISPLAY_L  = '80px';
	const T_DISPLAY_M  = '64px';
	const T_H1         = '48px';
	const T_H2         = '32px';
	const T_H3         = '22px';
	const T_BODY_L     = '18px';
	const T_BODY       = '16px';
	const T_BODY_S     = '14px';
	const T_CAPTION    = '13px';
	const T_EYEBROW    = '11px';
	const T_MONO       = '13px';

	const LH_TIGHT   = '1.02';
	const LH_SNUG    = '1.15';
	const LH_NORMAL  = '1.55';
	const LH_RELAXED = '1.65';

	const TRACKING_DISPLAY = '-0.02em';
	const TRACKING_HEADING = '-0.01em';
	const TRACKING_EYEBROW = '0.16em';

	/* ---------- Spacing (8 px base, 4 px half-step) ---------- */
	const S_1  = '4px';
	const S_2  = '8px';
	const S_3  = '12px';
	const S_4  = '16px';
	const S_5  = '24px';
	const S_6  = '32px';
	const S_7  = '48px';
	const S_8  = '64px';
	const S_9  = '96px';
	const S_10 = '128px';

	/* ---------- Radii (brutalist — 0 / 2 only) ---------- */
	const R_NONE = '0px';
	const R_SM   = '2px';

	/* ---------- Borders ---------- */
	const BW      = '1.5px';
	const BW_RULE = '4px';

	/* ---------- Motion ---------- */
	const EASE     = 'cubic-bezier(0.2, 0.6, 0.2, 1)';
	const DUR_FAST = '160ms';
	const DUR_BASE = '240ms';
	const DUR_SLOW = '400ms';

	/* ---------- Layout ---------- */
	const MAX_CONTENT = '1280px';
	const GUTTER      = '24px';

	/* ---------- Scrim ---------- */
	const SCRIM = 'rgb(31 31 31 / 0.40)';

	/**
	 * All tokens as a flat slug => value map. Keys mirror the CSS custom-property
	 * names (without the leading `--`) so callers can emit `:root { --pp-ink: #1F1F1F; ... }`
	 * directly from this map.
	 */
	public static function all(): array {
		return [
			'pp-ink'          => self::COLOR_INK,
			'pp-ink-muted'    => self::COLOR_INK_MUTED,
			'pp-bone'         => self::COLOR_BONE,
			'pp-bone-soft'    => self::COLOR_BONE_SOFT,
			'pp-surface'      => self::COLOR_SURFACE,
			'pp-blush'        => self::COLOR_BLUSH,
			'pp-line'         => self::COLOR_LINE,
			'pp-white'        => self::COLOR_WHITE,
			'pp-emerald'      => self::COLOR_EMERALD,
			'pp-emerald-soft' => self::COLOR_EMERALD_SOFT,
			'pp-alert'        => self::COLOR_ALERT,
			'pp-alert-soft'   => self::COLOR_ALERT_SOFT,

			'pp-bg'           => 'var(--pp-bone)',
			'pp-text'         => 'var(--pp-ink)',
			'pp-text-muted'   => 'var(--pp-ink-muted)',
			'pp-border'       => 'var(--pp-ink)',

			'font-display'    => self::FONT_SANS,
			'font-sans'       => self::FONT_SANS,
			'font-mono'       => self::FONT_MONO,

			't-display-xl'    => self::T_DISPLAY_XL,
			't-display-l'     => self::T_DISPLAY_L,
			't-display-m'     => self::T_DISPLAY_M,
			't-h1'            => self::T_H1,
			't-h2'            => self::T_H2,
			't-h3'            => self::T_H3,
			't-body-l'        => self::T_BODY_L,
			't-body'          => self::T_BODY,
			't-body-s'        => self::T_BODY_S,
			't-caption'       => self::T_CAPTION,
			't-eyebrow'       => self::T_EYEBROW,
			't-mono'          => self::T_MONO,

			'lh-tight'        => self::LH_TIGHT,
			'lh-snug'         => self::LH_SNUG,
			'lh-normal'       => self::LH_NORMAL,
			'lh-relaxed'      => self::LH_RELAXED,

			'tracking-display' => self::TRACKING_DISPLAY,
			'tracking-heading' => self::TRACKING_HEADING,
			'tracking-eyebrow' => self::TRACKING_EYEBROW,

			's-1'  => self::S_1,
			's-2'  => self::S_2,
			's-3'  => self::S_3,
			's-4'  => self::S_4,
			's-5'  => self::S_5,
			's-6'  => self::S_6,
			's-7'  => self::S_7,
			's-8'  => self::S_8,
			's-9'  => self::S_9,
			's-10' => self::S_10,

			'r-none' => self::R_NONE,
			'r-sm'   => self::R_SM,

			'bw'      => self::BW,
			'bw-rule' => self::BW_RULE,

			'ease'     => self::EASE,
			'dur-fast' => self::DUR_FAST,
			'dur-base' => self::DUR_BASE,
			'dur-slow' => self::DUR_SLOW,

			'max-content' => self::MAX_CONTENT,
			'gutter'      => self::GUTTER,

			'scrim' => self::SCRIM,
		];
	}

	/**
	 * Look up a single palette color by slug ("ink", "bone", "blush", etc.).
	 * Returns empty string when the slug is unknown.
	 */
	public static function color( string $slug ): string {
		$constant = 'COLOR_' . strtoupper( str_replace( '-', '_', $slug ) );
		$ref      = "self::{$constant}";
		return defined( $ref ) ? constant( $ref ) : '';
	}
}
