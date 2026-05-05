import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Canonical button for the v3 Apple Swiss surfaces.  Two locked variants:
 *
 *   primary  — amber background, ink label.  Used for the dominant CTA
 *              on a section: "Add to cart", "Browse catalogue",
 *              "Place order".
 *   ghost    — transparent background, ink label, 1 px ink/15 stroke,
 *              surface-2 hover wash.  Used for secondary affordances next
 *              to a primary: "Compare configurations", "Read FAQ".
 *
 * Don't introduce new variants without updating the brand bible.  The v2
 * storefront chrome (Header, CartDrawer, Footer) still ships its own
 * bg-ink/text-bone primitives — those are a separate, retained design
 * system, not a v3 button variant.
 *
 * Implementation note: variants delegate to the `.v3-pill` CSS classes in
 * globals.css so the styling stays in one place and any future palette
 * tweak hits both inline and component-driven buttons identically.
 */

type Variant = "primary" | "ghost";
type Size = "default" | "sm";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "v3-pill v3-pill-primary",
  ghost: "v3-pill v3-pill-ghost",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type NativeButtonProps = Omit<ComponentProps<"button">, keyof BaseProps>;
type LinkComponentProps = Omit<ComponentProps<typeof Link>, keyof BaseProps>;

function classFor(variant: Variant, size: Size, extra?: string): string {
  return clsx(VARIANT_CLASS[variant], size === "sm" && "v3-pill-sm", extra);
}

export function Button({
  variant = "primary",
  size = "default",
  children,
  className,
  type = "button",
  ...rest
}: BaseProps & NativeButtonProps) {
  return (
    <button type={type} className={classFor(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "default",
  children,
  className,
  ...rest
}: BaseProps & LinkComponentProps) {
  return (
    <Link className={classFor(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
