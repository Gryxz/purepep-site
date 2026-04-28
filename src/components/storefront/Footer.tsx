import Link from "next/link";
import { Lockup } from "./primitives";

function FootCol({ title, items }: { title: string; items: { label: string; href?: string }[] }) {
  return (
    <div>
      <div className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/55">
        {title}
      </div>
      <ul className="grid list-none gap-2 p-0 m-0">
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href as never} className="font-sans text-[13.5px] text-bone no-underline hover:text-bone/80">
                {item.label}
              </Link>
            ) : (
              <span className="font-sans text-[13.5px] text-bone/75">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <footer className="bg-ink py-5 text-center font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-bone">
        © 2026 PurePep · For research use only · Not for human consumption
      </footer>
    );
  }

  return (
    <footer className="bg-ink text-bone">
      <div className="layout-content pb-10 pt-[72px]">
        <div className="grid grid-cols-[1.4fr_repeat(4,_1fr)] gap-12">
          <div>
            <Lockup className="h-10 w-auto text-bone" />
            <p className="mt-4.5 max-w-[280px] font-sans text-[13.5px] leading-relaxed text-bone/75">
              Research-grade peptides. Triplicate HPLC per lot. Cold-chain shipped. Documentation on file.
            </p>
          </div>
          <FootCol
            title="Catalog"
            items={[
              { label: "RETA · Retatrutide", href: "/shop/reta" },
              { label: "SEMA · Semaglutide", href: "/shop/sema" },
              { label: "TIRZ · Tirzepatide", href: "/shop/tirz" },
              { label: "View all", href: "/shop" },
            ]}
          />
          <FootCol
            title="Quality"
            items={[
              { label: "Certificates of analysis" },
              { label: "Lab partners" },
              { label: "Cold-chain shipping" },
              { label: "Lot traceability" },
            ]}
          />
          <FootCol
            title="Account"
            items={[
              { label: "Sign in" },
              { label: "Researcher verification", href: "/researcher-access" },
              { label: "Order history" },
              { label: "Re-order" },
            ]}
          />
          <FootCol
            title="Policies"
            items={[
              { label: "No-refund policy" },
              { label: "Terms of sale" },
              { label: "Privacy" },
              { label: "Contact" },
            ]}
          />
        </div>

        <div className="my-12 h-px bg-bone/20" />

        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone/55">
          <span>For research use only · Not for human consumption · 21+ qualified researchers</span>
          <span>© 2026 PurePep</span>
        </div>
      </div>
    </footer>
  );
}
