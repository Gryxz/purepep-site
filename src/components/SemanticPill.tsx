import { clsx } from "@/lib/clsx";

type Variant = "stock" | "out" | "verified";

export function SemanticPill({
  variant,
  soft = false,
  children,
  className,
}: {
  variant: Variant;
  soft?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const isPositive = variant === "stock" || variant === "verified";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 border-[1.5px] px-3 py-[6px]",
        "font-mono text-eyebrow font-semibold uppercase tracking-[0.16em] leading-none",
        isPositive
          ? clsx("border-emerald text-emerald", soft ? "bg-emerald-soft" : "bg-bone")
          : clsx("border-alert text-alert", soft ? "bg-alert-soft" : "bg-bone"),
        className,
      )}
    >
      {variant === "verified" ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6.3l2.3 2.3L9.5 3.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}

export function PillStock(props: { soft?: boolean; className?: string }) {
  return (
    <SemanticPill variant="stock" {...props}>
      In stock
    </SemanticPill>
  );
}
export function PillOut(props: { soft?: boolean; className?: string }) {
  return (
    <SemanticPill variant="out" {...props}>
      Out of stock
    </SemanticPill>
  );
}
export function PillVerified({
  soft = false,
  className,
  children,
}: {
  soft?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SemanticPill variant="verified" soft={soft} className={className}>
      {children ?? "COA verified"}
    </SemanticPill>
  );
}
