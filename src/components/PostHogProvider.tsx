"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, trackPageView } from "@/lib/analytics";

/**
 * Mount once at the root of the app tree (above page content).
 *
 * Responsibilities:
 *   1. Initialise PostHog on first client render — idempotent, no-op if
 *      NEXT_PUBLIC_POSTHOG_KEY is unset.
 *   2. Fire a $pageview every time the App Router pathname changes.
 *      `capture_pageview` is OFF in PostHog config so this hook is the
 *      single source of pageview events.
 *
 * Children pass through unchanged — this is a side-effect-only wrapper.
 */
export default function PostHogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    void initPostHog();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const path = qs && qs.length > 0 ? `${pathname}?${qs}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
