import { clsx } from "@/lib/clsx";

export function Eyebrow({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "ink" | "alert" | "emerald";
  className?: string;
}) {
  const toneClass = {
    muted: "text-ink-muted",
    ink: "text-ink",
    alert: "text-alert",
    emerald: "text-emerald",
  }[tone];

  return (
    <span
      className={clsx(
        "font-mono text-eyebrow font-medium uppercase tracking-[0.16em]",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
