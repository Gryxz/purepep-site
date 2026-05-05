/**
 * Pluralization + count formatting helpers.
 *
 * Body copy must use `plural()` so "1 peptide" / "7 peptides" agree.  Mono
 * eyebrow tags ("01 ITEMS", "02 DELIVERY") keep their zero-pad — that's a
 * design choice — and use `padded2()` instead.  These are deliberately the
 * only two count formatters; everything else is a regression.
 */

export function plural(count: number, singular: string, pluralForm?: string): string {
  const noun = count === 1 ? singular : pluralForm ?? `${singular}s`;
  return `${count} ${noun}`;
}

/** Two-digit zero-padded count — mono eyebrow tags only. */
export function padded2(n: number): string {
  return String(n).padStart(2, "0");
}
