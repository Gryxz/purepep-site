import { EntityDisclosure } from "@/components/EntityDisclosure";
import type { WpPage } from "@/lib/wp-pages";

export function LegalPageView({ page }: { page: WpPage }) {
  return (
    <article className="legal-page">
      <div className="legal-container">
        <p className="legal-eyebrow">Policy</p>
        <h1 className="legal-title">{page.title}</h1>
        <div className="mt-6">
          <EntityDisclosure />
        </div>
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
          // nofollow". Safe to inject as HTML.
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </article>
  );
}
