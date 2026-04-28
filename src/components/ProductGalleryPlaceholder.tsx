import { Eyebrow } from "@/components/Eyebrow";
import { PillVerified } from "@/components/SemanticPill";
import { clsx } from "@/lib/clsx";

/**
 * ProductGalleryPlaceholder — Batch 4 spike stand-in for the full
 * FlagshipCard + ProductGallery from
 * purepep-site/design-system/ui_kits/storefront/ProductGallery.jsx.
 *
 * Renders the cream-label aspect-square frame with the wordmark + compound
 * + dose copy in the correct positions. Full SVG vial render and thumbnail
 * row land in Batch 4 proper.
 */
export function ProductGalleryPlaceholder({
  compound = "RETA",
  cas = "2381089-83-2",
  dose = "10 mg",
  sku = "PP-RT-010",
  coaVerified = true,
  className,
}: {
  compound?: string;
  cas?: string;
  dose?: string;
  sku?: string;
  coaVerified?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-5", className)}>
      <div className="relative aspect-square w-full overflow-hidden border-[1.5px] border-ink bg-bone">
        {coaVerified && (
          <div className="absolute right-5 top-5 z-10">
            <PillVerified />
          </div>
        )}

        <div className="absolute left-7 top-9 z-[2]">
          <p className="font-display font-black tracking-[-0.04em] leading-[0.95] text-ink text-display-l">
            PurePep
          </p>
        </div>

        <div className="absolute left-7 right-7 top-[42%] z-[2]">
          <p className="font-display font-black tracking-[-0.035em] leading-tight text-ink text-display-m">
            {compound}
          </p>
          <p className="mt-3">
            <Eyebrow>CAS: {cas}</Eyebrow>
          </p>
          <p className="mt-3 font-sans font-bold tracking-[-0.01em] text-ink text-h3">{dose}</p>
        </div>

        <p className="absolute bottom-7 left-7 z-[2] max-w-[60ch] font-sans italic text-ink-muted text-body-s">
          Not for human or veterinary use
        </p>

        <p
          className="absolute right-3 top-1/2 z-[2] origin-right -translate-y-1/2 rotate-90 whitespace-nowrap font-mono font-medium uppercase tracking-[0.22em] text-ink-muted text-eyebrow"
          aria-hidden
        >
          ≥99.5% purity · research use only
        </p>

        <div className="absolute bottom-7 right-7 z-[3] flex aspect-[2/3] w-1/4 items-center justify-center border-[1.5px] border-ink bg-bone-soft">
          <p className="font-mono font-medium uppercase tracking-[0.18em] text-ink-muted text-eyebrow">
            vial render
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Eyebrow tone="ink">SKU · {sku}</Eyebrow>
        <p className="font-mono font-medium uppercase tracking-[0.18em] text-ink-muted text-eyebrow">
          Gallery · spike placeholder
        </p>
      </div>
    </div>
  );
}
