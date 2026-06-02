import { notFound } from "next/navigation";
import { getAllSlugs, getProductBySlug, getAllProducts } from "@/lib/wc-api";
import { PDPHero } from "@/components/v3/PDPHero";
import { MobilePDP } from "@/components/v5/MobilePDP";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.compound} · ${product.name} ${product.dose}`,
    description: product.description.slice(0, 155),
  };
}

export default async function PDPPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Related products for the mobile carousel — same-category first, then
  // others, capped to 8 cards. Fetched at build time alongside the product.
  const all = await getAllProducts();
  const sameCat = all.filter((p) => p.slug !== slug && p.category === product.category);
  const others  = all.filter((p) => p.slug !== slug && p.category !== product.category);
  const related = [...sameCat, ...others].slice(0, 8);

  return (
    <>
      <div className="desktop-only">
        <PDPHero product={product} />
      </div>
      <div className="mob-only">
        <MobilePDP product={product} related={related} />
      </div>
    </>
  );
}
