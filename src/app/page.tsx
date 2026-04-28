import Link from "next/link";
import { compliance } from "@design/tokens";

export default function Home() {
  return (
    <main className="layout-content py-24">
      <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-ink-muted">
        Storefront — foundation
      </p>
      <h1 className="mt-6 font-display text-display-m font-black tracking-[-0.02em] leading-tight">
        PurePep
      </h1>
      <p className="mt-6 max-w-[60ch] text-body-l leading-relaxed">
        Foundation page. The RETA product detail hero spike lives at{" "}
        <Link href={"/shop/reta" as never} className="underline underline-offset-4">
          /shop/reta
        </Link>
        .
      </p>
      <p className="mt-12 font-mono text-mono text-ink-muted">{compliance.researchUseOnly}</p>
      <p className="mt-2 font-mono text-mono text-ink-muted">{compliance.qualified21}</p>
      <p className="mt-2 font-mono text-mono text-ink-muted">{compliance.noRefunds}</p>
    </main>
  );
}
