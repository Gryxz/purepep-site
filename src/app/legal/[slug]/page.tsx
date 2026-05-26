import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";
import { getPage, isPolicySlug, POLICY_SLUGS } from "@/lib/wp-pages";

/**
 * /legal/[slug] — statically prerendered policy + contact pages mirrored
 * from WordPress at build time. Slugs are constrained by the locked
 * allowlist in src/lib/wp-pages.ts so we can never accidentally expose a
 * draft / unpublished WP page through the headless storefront.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isPolicySlug(slug)) return {};
  const page = await getPage(slug);
  return {
    title: page.title,
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const page = await getPage(slug);

  return <LegalPageView page={page} />;
}
