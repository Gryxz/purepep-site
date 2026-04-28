import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1280px] px-6 py-24">
      <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-ink-muted">
        404 — Not found
      </p>
      <h1 className="mt-6 font-display text-display-m font-black tracking-[-0.02em] leading-tight">
        Page not found
      </h1>
      <p className="mt-6 max-w-[60ch] text-body-l leading-relaxed">
        The page you were looking for is not here. Return to the{" "}
        <Link href={"/" as never} className="underline underline-offset-4">
          home page
        </Link>
        .
      </p>
    </main>
  );
}
