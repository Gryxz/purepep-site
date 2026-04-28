import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type" | "children">) {
  const sizeClass = {
    sm: "h-9 px-4 text-mono",
    md: "h-12 px-5 text-mono",
    lg: "h-14 px-6 text-body-s",
  }[size];

  const variantClass = {
    primary:
      "border-[1.5px] border-ink bg-ink text-bone hover:bg-black disabled:bg-line disabled:text-ink-muted disabled:border-line",
    secondary:
      "border-[1.5px] border-ink bg-bone text-ink hover:bg-bone-soft",
    ghost: "border-0 bg-transparent text-ink underline underline-offset-[3px] hover:text-ink-muted",
  }[variant];

  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-sm",
        "font-sans font-semibold uppercase tracking-[0.04em]",
        "transition-colors duration-[160ms]",
        "disabled:cursor-not-allowed",
        sizeClass,
        variantClass,
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
