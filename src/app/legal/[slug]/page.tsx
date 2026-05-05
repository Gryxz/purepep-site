import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, isPolicySlug, POLICY_SLUGS } from "@/lib/wp-pages";

/**
 * /legal/[slug] — statically prerendered policy + contact pages mirrored
 * from WordPress at build time.  Slugs are constrained by the locked
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

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const page = await getPage(slug);

  return (
    <article className="legal-page">
      <div className="legal-container">
        <p className="legal-eyebrow">Policy</p>
        <h1 className="legal-title">{page.title}</h1>
        {page.modified && (
          <p className="legal-modified">
            Last updated{" "}
            <time dateTime={page.modified}>
              {new Date(page.modified).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        )}
        <div
          className="legal-body"
          // Content is server-side sanitized through sanitize-html with a
          // locked allowlist (no <script>/<iframe>/<style>/<object>) and
          // every anchor force-rewritten to rel="noopener noreferrer
          // nofollow".  Safe to inject as HTML.
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}
