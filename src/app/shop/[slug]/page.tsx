import { notFound } from "next/navigation";
import { getAllSlugs, getProductBySlug } from "@/lib/wc-api";
import { PDPHero } from "@/components/v3/PDPHero";
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

  return <PDPHero product={product} />;
}
