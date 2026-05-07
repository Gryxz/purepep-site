/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * CookieBanner — fixed bottom consent strip.
 *
 * Shown until the user takes a decision: writes `pp_cookie_consent=1`
 * (Accept) or `pp_cookie_consent=0` (Decline) to document.cookie.  The
 * banner only mounts client-side so SSR HTML doesn't ship a flash of
 * the bar to users who already consented.  `mounted` flips after the
 * first effect to avoid hydration mismatch warnings (server: hidden,
 * client: depends on cookie).
 *
 * Bone background, ink text, amber Accept button, ghost Decline.  No
 * tracking calls — this is a UI primitive only; the analytics layer
 * reads the cookie itself if it cares.
 */

const COOKIE_NAME = "pp_cookie_consent";

function readConsent(): "1" | "0" | null {
  if (typeof document === "undefined") return null;
  for (const c of document.cookie.split("; ")) {
    if (c.startsWith(`${COOKIE_NAME}=`)) {
      const v = c.slice(COOKIE_NAME.length + 1);
      if (v === "1" || v === "0") return v;
    }
  }
  return null;
}

function writeConsent(value: "1" | "0"): void {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export default function CookieBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(readConsent() === null);
  }, []);

  // Defer cookie consent on the age-gate so the user handles one decision
  // at a time. The banner re-appears on the next route after they verify.
  if (pathname === "/age-gate") return null;

  function handleAccept() {
    writeConsent("1");
    setVisible(false);
  }

  function handleDecline() {
    writeConsent("0");
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/15 bg-bone shadow-[0_-1px_0_rgb(31_31_31_/_5%)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)" }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
        <p className="text-[13px] leading-relaxed text-ink/75">
          We use essential cookies to operate this site. By continuing, you
          agree to our{" "}
          <a href="/legal/privacy-policy" className="underline hover:text-ink">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex flex-shrink-0 items-center gap-3 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleDecline}
            className="inline-flex h-10 max-h-10 min-h-10 flex-1 cursor-pointer items-center justify-center rounded-full border border-ink/20 bg-transparent px-5 text-[13px] font-medium leading-none text-ink transition-colors hover:bg-surface-2 sm:flex-none"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex h-10 max-h-10 min-h-10 flex-1 cursor-pointer items-center justify-center rounded-full bg-amber px-5 text-[13px] font-semibold leading-none text-ink transition-colors hover:bg-amber-hover sm:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
