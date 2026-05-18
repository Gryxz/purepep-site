/**
 * Shared referral-program copy + terms.
 *
 * Desktop (components/v3/HomePage) and mobile (components/v5/
 * MobileHomePage) render the referral teaser from these constants so
 * wording, stat labels and — critically — the program terms stay
 * identical. Desktop previously omitted the terms line entirely; both
 * surfaces now carry it.
 */
export const REFERRAL = {
  eyebrow: "Researcher referral",
  headline: "Refer a colleague. Both of you save $25.",
  body:
    "Share your personal referral link. Your colleague gets $25 off their " +
    "first order; you receive $25 store credit when their order ships.",
  stats: [
    { value: "$25", label: "Off their first order" },
    { value: "$25", label: "Credit to your account" },
    { value: "∞", label: "No referral cap" },
  ],
  primary: { label: "Get your referral link", href: "/referral" },
  secondary: { label: "Learn about the program", href: "/referral" },
  terms: "Min. order $150 · Credit applied 7 days after delivery confirmation.",
} as const;
