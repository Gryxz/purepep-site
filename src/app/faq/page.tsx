import type { Metadata } from "next";
import { getPage } from "@/lib/wp-pages";

/**
 * /faq — frequently-asked questions, mirrored from WordPress at build
 * time via the same headless-forwarding path as /legal/[slug]
 * (src/lib/wp-pages.ts).  The slug is hard-pinned to "faq" so there is
 * no arbitrary-slug surface; content is server-side sanitized through
 * the locked allowlist.  When WP is unreachable it falls back to the
 * shared stub so the static export never breaks.
 *
 * Single shared layout (the `.legal-*` prose styles) → identical on
 * mobile and desktop by construction.
 */

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("faq");
  return {
    title: page.title || "FAQ",
    description:
      "Answers about Certificates of Analysis, lot traceability, third-party " +
      "testing, shipping, and research-use terms for PurePep peptides.",
    robots: { index: true, follow: true },
  };
}

export default async function FaqPage() {
  const page = await getPage("faq");

  return (
    <article className="legal-page">
      <div className="legal-container">
        <p className="legal-eyebrow">FAQ</p>
        <h1 className="legal-title">{page.title || "Frequently asked questions"}</h1>
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
          // Server-side sanitized via sanitize-html with a locked
          // allowlist (no <script>/<iframe>/<style>/<object>); every
          // anchor force-rewritten to rel="noopener noreferrer
          // nofollow". Safe to inject as HTML.
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}
