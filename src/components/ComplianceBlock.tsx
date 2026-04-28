import { compliance } from "@design/tokens";
import { clsx } from "@/lib/clsx";

/**
 * ComplianceBlock — required surface on every PDP, cart, checkout, and legal
 * page. Renders the three locked compliance strings verbatim from
 * @design/tokens (compliance.researchUseOnly / qualified21 / noRefunds).
 *
 * Never paraphrase. Never hand-type. The fence in scripts/check-tokens-fence.ts
 * fails the build if any of these strings appear inline.
 */
export function ComplianceBlock({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Compliance notice"
      className={clsx(
        "flex flex-col gap-2 border-t-[1.5px] border-ink bg-bone py-5",
        "font-mono text-mono text-ink-muted",
        className,
      )}
    >
      <p>{compliance.researchUseOnly}</p>
      <p>{compliance.qualified21}</p>
      <p>{compliance.noRefunds}</p>
    </aside>
  );
}
