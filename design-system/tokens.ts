/**
 * PurePep design tokens — typed module.
 *
 * Mirrors design-system/tokens.json. Imported by TypeScript consumers
 * (tailwind.config.ts in the Next.js storefront, primitive components,
 * brand asset generators) so token values reach the type system.
 *
 * Source of truth lives in tokens.json. This file is hand-authored to
 * stay in sync; a runtime check in `scripts/check-tokens-sync.ts`
 * (forthcoming) verifies the two are equivalent.
 *
 * Hard rules:
 *  - Amber is favicon-only — do not import it into UI code.
 *  - No shadows, gradients, duotone, or fluid type at the framework
 *    level. Use the locked palette + geometry instead.
 */

export const color = {
  ink:          '#1F1F1F',
  inkMuted:     '#6E6E6E',
  bone:         '#FAF7F0',
  boneSoft:     '#F5F1E6',
  surface:      '#F1EDE3',
  blush:        '#F2D7D7',
  line:         '#E4DFCF',
  white:        '#FFFFFF',
  emerald:      '#0F5132',
  emeraldSoft:  '#E8F0EB',
  alert:        '#C83E4D',
  alertSoft:    '#F7E4E6',
  /** FAVICON ONLY. Never in UI, type, buttons, or merchandise. */
  amberFaviconOnly: '#DC9814',
  scrim:        'rgb(31 31 31 / 0.40)',
} as const;

export type Color = keyof typeof color;

export const font = {
  display: {
    stack: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    weights: [400, 500, 600, 700, 900] as const,
  },
  sans: {
    stack: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    weights: [400, 500, 600, 700, 900] as const,
  },
  mono: {
    stack: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
    weights: [400, 500, 600] as const,
  },
} as const;

export const fontSize = {
  displayXl: '112px',
  displayL:  '80px',
  displayM:  '64px',
  h1:        '48px',
  h2:        '32px',
  h3:        '22px',
  bodyL:     '18px',
  body:      '16px',
  bodyS:     '14px',
  caption:   '13px',
  eyebrow:   '11px',
  mono:      '13px',
} as const;

export const lineHeight = {
  tight:   '1.02',
  snug:    '1.15',
  normal:  '1.55',
  relaxed: '1.65',
} as const;

export const tracking = {
  display: '-0.02em',
  heading: '-0.01em',
  eyebrow: '0.16em',
} as const;

export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '24px',
  6:  '32px',
  7:  '48px',
  8:  '64px',
  9:  '96px',
  10: '128px',
} as const;

export const radius = {
  none: '0px',
  sm:   '2px',
} as const;

export const border = {
  width:     '1.5px',
  ruleWidth: '4px',
  color:     color.ink,
} as const;

export const motion = {
  ease: 'cubic-bezier(0.2, 0.6, 0.2, 1)',
  duration: {
    fast: '160ms',
    base: '240ms',
    slow: '400ms',
  },
} as const;

export const layout = {
  maxContent: '1280px',
  gutter:     '24px',
} as const;

export const blur = {
  /** Permitted ONLY on the sticky header backdrop and modal scrims. */
  header: '12px',
} as const;

/**
 * Compliance copy — quote verbatim. Never paraphrase. Render on every
 * product surface, in cart, checkout, and policy pages.
 */
export const compliance = {
  researchUseOnly: 'For research use only. Not for human consumption.',
  qualified21:     'Sales restricted to qualified researchers, 21 and over.',
  noRefunds:       'All sales final. No refunds, no exchanges, no returns.',
} as const;

export const constraints = {
  shadows:   false,
  gradients: false,
  duotone:   false,
  fluidType: false,
} as const;

const tokens = {
  color,
  font,
  fontSize,
  lineHeight,
  tracking,
  spacing,
  radius,
  border,
  motion,
  layout,
  blur,
  compliance,
  constraints,
} as const;

export default tokens;
export type Tokens = typeof tokens;
