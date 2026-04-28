"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-[1280px] px-6 py-24">
      <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-alert">
        Error
      </p>
      <h1 className="mt-6 font-display text-display-m font-black tracking-[-0.02em] leading-tight">
        Something went wrong
      </h1>
      <p className="mt-6 max-w-[60ch] text-body-l leading-relaxed">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-12 items-center justify-center border-[1.5px] border-ink bg-ink px-6 font-mono text-mono uppercase tracking-[0.16em] text-bone hover:bg-bone hover:text-ink"
      >
        Try again
      </button>
    </main>
  );
}
