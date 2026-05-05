"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Bankful compliance — client-side age-gate redirect.
 *
 * Replaces the `src/middleware.ts` approach because Next.js middleware
 * is incompatible with `output: 'export'` (the export build refuses to
 * compile when middleware.ts is present).  This guard mounts at the
 * layout root, reads `pp_age_verified` from document.cookie, and hard-
 * redirects to `/age-gate` if missing.  The exemption set mirrors what
 * the middleware matcher would have allowed:
 *
 *   /age-gate, /_next/*, /favicon.ico, /sitemap.xml, /robots.txt
 *
 * Renders `null` — there is no UI; it's purely a side-effect mount.
 */

const EXEMPT = [
  /^\/age-gate(?:\/|$)/,
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
];

function isExempt(path: string): boolean {
  return EXEMPT.some((re) => re.test(path));
}

function hasCookie(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${name}=1`));
}

export default function AgeGateGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || isExempt(pathname)) return;
    if (hasCookie("pp_age_verified")) return;
    // Hard nav — bypass the client router so the gate page receives a
    // fresh request and renders with no stale cookie state.
    window.location.replace("/age-gate");
  }, [pathname]);

  return null;
}
