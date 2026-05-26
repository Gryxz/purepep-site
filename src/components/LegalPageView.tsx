import { EntityDisclosure } from "@/components/EntityDisclosure";
import { ENTITY } from "@/lib/entity";
import type { WpPage } from "@/lib/wp-pages";

const GOVERNANCE_SUBJECT: Partial<Record<string, "These Terms" | "This Policy">> = {
  "terms-of-service": "These Terms",
  "refund-policy": "This Policy",
  "shipping-policy": "This Policy",
};

function governanceCopy(slug: string): string | null {
  const subject = GOVERNANCE_SUBJECT[slug];
  if (!subject) return null;
  const verb = subject === "These Terms" ? "govern" : "governs";
  return `${subject} ${verb} the relationship between you ("Customer," "Researcher") and ${ENTITY.legalName} (referred to herein as "Company," "we," "us," or "${ENTITY.brand}"), the operator of ${ENTITY.domain}.`;
}

export function LegalPageView({ page }: { page: WpPage }) {
  const governanceText = governanceCopy(page.slug);

  return (
    <article className="legal-page">
      <div className="legal-container">
        <p className="legal-eyebrow">Policy</p>
        <h1 className="legal-title">{page.title}</h1>
        {governanceText && (
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink">{governanceText}</p>
        )}
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
