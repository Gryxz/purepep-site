/**
 * WordPress Pages REST fetcher — BUILD-TIME ONLY.
 *
 * Pulls policy + contact copy from the WC server's WP REST API at static
 * export time so editorial lives in one place (WP admin) and the headless
 * storefront stays a faithful mirror.  No auth needed — published pages
 * are public.  Output runs through `sanitize-html` so a stray `<script>`
 * or `<iframe>` from WP can't enter the static bundle.
 *
 * If `WC_BASE_URL` is unset OR the upstream fetch fails, every page
 * falls back to a stub ("Policy temporarily unavailable …") so the build
 * never breaks on missing creds or a flaky CMS.
 *
 * The WP root is derived from `WC_BASE_URL` by stripping the
 * /wp-json/wc/v3 suffix — no new env var.
 */

import sanitizeHtml from "sanitize-html";

const WC_BASE_URL = (process.env.WC_BASE_URL ?? "").replace(/\/+$/, "");

// Strip /wp-json/wc/v3 (the WC REST root) to get the WP root host.
const WP_BASE_URL = WC_BASE_URL.replace(/\/wp-json\/wc\/v3$/, "");

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
  // The `contact` slug has a fully-featured in-repo portal at /contact —
  // when the WP mirror is unavailable, send users there instead of a
  // dead stub.  Other policy slugs get a corrected generic stub with the
  // real support channels (email + business phone).
  const contactLine =
    'email <a href="mailto:info@purepep.shop" rel="noopener noreferrer nofollow">info@purepep.shop</a> ' +
    'or call <a href="tel:+18662126466" rel="noopener noreferrer nofollow">(866) 212-6466</a>';
  const content =
    slug === "contact"
      ? '<p>Reach the PurePep research team through our ' +
        '<a href="/contact">support portal</a>, or ' +
        contactLine +
        '. Support hours: Mon–Fri 9:00–17:00, reply within one business day.</p>'
      : '<p>This page is temporarily unavailable. For questions, please ' +
        contactLine +
        '.</p>';
  return {
    slug,
    title: humanize(slug),
    content,
    modified: "",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getPage(slug: string): Promise<WpPage> {
  if (!WP_BASE_URL) return fallbackPage(slug);
  try {
    const res = await fetch(
      `${WP_BASE_URL}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return fallbackPage(slug);
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) return fallbackPage(slug);
    const raw = data[0] as WpPageRaw;
    const titleRaw = raw.title?.rendered ?? humanize(slug);
    const contentRaw = raw.content?.rendered ?? "";
    return {
      slug,
      title: decodeBasicEntities(titleRaw).trim() || humanize(slug),
      content: sanitizeHtml(contentRaw, SANITIZE_OPTIONS),
      modified: typeof raw.modified === "string" ? raw.modified : "",
    };
  } catch {
    return fallbackPage(slug);
  }
}

/**
 * Fetch every policy page in parallel.  Used by the Footer to render its
 * Policies column with the live WP titles instead of forking copy.
 */
export async function getAllPolicyPages(): Promise<WpPage[]> {
  return Promise.all(POLICY_SLUGS.map((slug) => getPage(slug)));
}
