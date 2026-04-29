import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://purepep.shop";

export default function robots(): MetadataRoute.Robots {
  const enabled = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";
  return enabled
    ? {
        rules: [{ userAgent: "*", allow: "/" }],
        sitemap: `${SITE_URL}/sitemap.xml`,
      }
    : {
        rules: [{ userAgent: "*", disallow: "/" }],
      };
}
