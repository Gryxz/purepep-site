/**
 * WordPress Pages REST fetcher — BUILD-TIME ONLY.
 *
 * Pulls policy + contact copy from the WC server's WP REST API at static
 * export time so editorial lives in one place (WP admin) and the headless
 * storefront stays a faithful mirror.  No auth needed — published pages
 * are public.  Output runs through `sanitize-html` so a stray `<script>`
 * or `<iframe>` from WP can't enter the static bundle.
 *
 * STRICT MODE (default in production):
 *   Triggered automatically when WC_BASE_URL is set, OR explicitly by
 *   WP_MIRROR_STRICT=1.  In strict mode getPage() THROWS on any failure
 *   (no base URL / non-2xx / empty result / fetch exception / empty
 *   content) — the build fails loud rather than silently shipping a
 *   stub.  Per direction: "mirror the policy text from WC for all
 *   /legal, always".
 *
 * NON-STRICT MODE (dev / sandbox without WC creds):
 *   Falls back to the in-file stub but emits a loud console.warn so
 *   the fallback is visible in build logs.  Production CI sets
 *   WP_MIRROR_STRICT=1 so a misconfigured WC_BASE_URL secret can't
 *   silently degrade.
 *
 * The WP root is derived from `WC_BASE_URL` by stripping the
 * /wp-json/wc/v3 suffix — no new env var for the host itself.
 */

import sanitizeHtml from "sanitize-html";
import { LEGAL_FALLBACKS } from "@/content/legal-fallbacks";

const WC_BASE_URL = (process.env.WC_BASE_URL ?? "").replace(/\/+$/, "");

// Strip /wp-json/wc/v3 (the WC REST root) to get the WP root host.
const WP_BASE_URL = WC_BASE_URL.replace(/\/wp-json\/wc\/v3$/, "");

// Strict mode: throw on any failure rather than silently stub.  On
// whenever WC_BASE_URL is configured, or explicitly via the env knob
// so CI can fail loud even if the secret is missing.
const STRICT_MIRROR =
  process.env.WP_MIRROR_STRICT === "1" || WP_BASE_URL.length > 0;

const REVALIDATE_SECONDS = 3600;

// ---------------------------------------------------------------------------
// Slug allowlist
// ---------------------------------------------------------------------------

export const POLICY_SLUGS = [
  "refund-policy",
  "terms-of-service",
  "privacy-policy",
  "shipping-policy",
  "disclaimer",
  "contact",
] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export function isPolicySlug(s: string): s is PolicySlug {
  return (POLICY_SLUGS as readonly string[]).includes(s);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WpPage {
  slug: string;
  title: string;
  content: string; // sanitized HTML
  modified: string; // ISO date or empty
}

interface WpPageRaw {
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  modified?: string;
}

// ---------------------------------------------------------------------------
// Sanitizer config — locked allowlist of editorial tags.  No <script>,
// <style>, <iframe>, <object>, etc.  All anchors get rel=noopener
// noreferrer nofollow regardless of what WP emitted.
// ---------------------------------------------------------------------------

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "blockquote",
    "strong", "em", "b", "i", "u", "s",
    "a", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        rel: "noopener noreferrer nofollow",
      },
    }),
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Decode the small set of HTML entities WP emits in `title.rendered`.
 * Numeric entities (decimal + hex) handled generically via fromCodePoint
 * so we don't list them by name — that also keeps hex-numeric-literal
 * numeric-entity codes out of source where the token fence would flag
 * them as raw hex colors.
 */
function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&([a-z]+);/gi, (m) => m) // leave other named entities untouched
    .replace(/&#(\d+);/g, (_, code) => {
      const n = Number.parseInt(code, 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
      const n = Number.parseInt(code, 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : "";
    });
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function fallbackPage(slug: string): WpPage {
  // Real policy bodies in src/content/legal-fallbacks.ts ship as the
  // live content for /legal/<slug> whenever the WP mirror can't
  // reach upstream.  Each body is sanitised through the same
  // allowlist as a real WP page.  When a slug isn't in the map
  // (shouldn't happen — POLICY_SLUGS is closed) we fall back to a
  // generic-but-correct stub that points at the real support
  // channels.
  const real = LEGAL_FALLBACKS[slug];
  if (real) {
    return {
      slug,
      title: real.title,
      content: sanitizeHtml(real.contentHtml, SANITIZE_OPTIONS),
      modified: "",
    };
  }

  const contactLine =
    'email <a href="mailto:info@purepep.shop" rel="noopener noreferrer nofollow">info@purepep.shop</a> ' +
    'or call <a href="tel:+18662126466" rel="noopener noreferrer nofollow">(866) 212-6466</a>';
  return {
    slug,
    title: humanize(slug),
    content:
      '<p>This page is temporarily unavailable. For questions, please ' +
      contactLine +
      '.</p>',
    modified: "",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getPage(slug: string): Promise<WpPage> {
  if (!STRICT_MIRROR) {
    // Dev / sandbox without WC creds — fall back, but loudly.
    // eslint-disable-next-line no-console
    console.warn(
      `[wp-pages] STRICT mode OFF — fallback stub used for "/legal/${slug}". ` +
        `Set WC_BASE_URL (and WP_MIRROR_STRICT=1 in CI) to mirror the real WP page.`,
    );
    return fallbackPage(slug);
  }

  // Strict mode — base URL must be configured; every failure throws.
  if (!WP_BASE_URL) {
    throw new Error(
      `[wp-pages] STRICT mode ON but WC_BASE_URL is empty.  Set the ` +
        `WC_BASE_URL secret (e.g. https://<wp-host>/wp-json/wc/v3) so the ` +
        `WP policy mirror has a host, or unset WP_MIRROR_STRICT.`,
    );
  }

  const url = `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (err) {
    throw new Error(
      `[wp-pages] fetch failed for slug "${slug}" from ${WP_BASE_URL}: ` +
        (err instanceof Error ? err.message : String(err)),
    );
  }
  if (!res.ok) {
    throw new Error(
      `[wp-pages] HTTP ${res.status} for slug "${slug}" from ${WP_BASE_URL}`,
    );
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `[wp-pages] WP returned no page for slug "${slug}".  Create + publish ` +
        `the page in WordPress at that exact slug, or remove it from POLICY_SLUGS.`,
    );
  }
  const raw = data[0] as WpPageRaw;
  const titleRaw = raw.title?.rendered ?? humanize(slug);
  const contentRaw = raw.content?.rendered ?? "";
  if (contentRaw.trim().length === 0) {
    throw new Error(
      `[wp-pages] WP page "${slug}" exists but has empty content.  Add body ` +
        `copy in WP admin and re-publish.`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(`[wp-pages] mirrored /legal/${slug} (modified ${raw.modified ?? "?"})`);
  return {
    slug,
    title: decodeBasicEntities(titleRaw).trim() || humanize(slug),
    content: sanitizeHtml(contentRaw, SANITIZE_OPTIONS),
    modified: typeof raw.modified === "string" ? raw.modified : "",
  };
}

/**
 * Fetch every policy page in parallel.  Used by the Footer to render its
 * Policies column with the live WP titles instead of forking copy.
 */
export async function getAllPolicyPages(): Promise<WpPage[]> {
  return Promise.all(POLICY_SLUGS.map((slug) => getPage(slug)));
}
