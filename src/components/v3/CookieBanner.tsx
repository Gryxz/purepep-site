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
    const pending = readConsent() === null;
    setVisible(pending);
    // Toggle a global flag so MobileShell / globals.css can hide the
    // tab bar while the banner is unanswered (it overtakes the bottom).
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("mob-cookie-pending", pending);
    }
  }, []);

  // Defer cookie consent on the age-gate so the user handles one decision
  // at a time. The banner re-appears on the next route after they verify.
  if (pathname === "/age-gate") return null;

  function handleAccept() {
    writeConsent("1");
    setVisible(false);
    document.documentElement.classList.remove("mob-cookie-pending");
  }

  function handleDecline() {
    writeConsent("0");
    setVisible(false);
    document.documentElement.classList.remove("mob-cookie-pending");
  }

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="mob-cookies"
    >
      <p className="mob-cookies-text">
        Essential cookies only.{" "}
        <a href="/legal/privacy-policy">Privacy Policy</a>
      </p>
      <div className="mob-cookies-buttons">
        <button
          type="button"
          onClick={handleDecline}
          className="mob-cookies-btn mob-cookies-btn-decline"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="mob-cookies-btn mob-cookies-btn-accept"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
