/**
 * PaymentLogos — minimal Visa + Mastercard marks for the footer trust
 * row.  Inline SVGs so they SSR with the rest of the static export and
 * carry no external asset dependencies.  Brand colors come from CSS
 * vars defined in globals.css (`--pp-visa-blue`, `--pp-mc-red`,
 * `--pp-mc-yellow`) so no hex literals leak into the TSX source.
 *
 * Sized to roughly h-7 for the trust row; container can override.
 */

export function PaymentLogos({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 ${className ?? ""}`}
      aria-label="Accepted card networks"
    >
      {/* Visa */}
      <span
        className="inline-flex h-7 items-center justify-center rounded bg-bone px-2"
        aria-label="Visa"
      >
        <svg
          width="32"
          height="12"
          viewBox="0 0 32 12"
          fill="var(--pp-visa-blue)"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <text
            x="0"
            y="10"
            fontFamily="Inter, sans-serif"
            fontSize="13"
            fontWeight="900"
            fontStyle="italic"
            letterSpacing="-0.02em"
          >
            VISA
          </text>
        </svg>
      </span>

      {/* Mastercard — interlocking circles mark */}
      <span
        className="inline-flex h-7 items-center justify-center rounded bg-bone px-2"
        aria-label="Mastercard"
      >
        <svg
          width="28"
          height="18"
          viewBox="0 0 28 18"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="10" cy="9" r="7.5" fill="var(--pp-mc-red)" />
          <circle cx="18" cy="9" r="7.5" fill="var(--pp-mc-yellow)" opacity="0.85" />
        </svg>
      </span>
    </div>
  );
}
