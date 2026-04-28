import { clsx } from "@/lib/clsx";

export function Hairline({
  soft = false,
  className,
}: {
  soft?: boolean;
  className?: string;
}) {
  return (
    <hr
      className={clsx(
        "h-0 w-full border-0 border-t-[1.5px]",
        soft ? "border-line" : "border-ink",
        className,
      )}
    />
  );
}
