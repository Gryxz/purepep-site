"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, trackPageView } from "@/lib/analytics";

/**
 * Pageview tracker — isolated in its own subcomponent because
 * `useSearchParams` forces every Suspense boundary it sits in to
 * client-render.  Wrapping JUST this null-rendering tracker in
 * <Suspense fallback={null}> means the rest of the layout (Header,
 * main, Footer) keeps SSR'ing.  When the Suspense boundary was at the
 * layout root, every page's static HTML was empty until hydration —
 * fatal for SEO and the cause of "footer catalog column appears empty"
 * reports.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const path = qs && qs.length > 0 ? `${pathname}?${qs}` : pathname;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Mount once at the root of the app tree.
 *
 *   1. Initialise PostHog on first client render — idempotent, no-op
 *      if NEXT_PUBLIC_POSTHOG_KEY is unset.
 *   2. Fire a $pageview every time the App Router pathname changes,
 *      via the inner PageViewTracker.  `capture_pageview` is OFF in
 *      PostHog config so this is the single source of pageview events.
 *
 * Children pass through unchanged — pure side-effect wrapper.
 */
export default function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </>
  );
}
