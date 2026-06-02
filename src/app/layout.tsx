import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { compliance } from "@design/tokens";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import PostHogProvider from "@/components/PostHogProvider";
import AgeGateGuard from "@/components/AgeGateGuard";
import CookieBanner from "@/components/v3/CookieBanner";
import { TabBar } from "@/components/v3/TabBar";
import { MobileShell } from "@/components/v5/MobileShell";
import { MobileCartDrawer } from "@/components/v5/MobileCartDrawer";
import { ENTITY } from "@/lib/entity";
import { getAllProducts } from "@/lib/wc-api";
import { getAllPolicyPages } from "@/lib/wp-pages";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://purepep.shop";
const INDEX_ENABLED = process.env.NEXT_PUBLIC_INDEXING_ENABLED === "true";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PurePep — research-grade peptides",
    template: "%s — PurePep",
  },
  description:
    "Lyophilized research peptides assayed at ≥99.5% purity by HPLC. " +
    compliance.researchUseOnly,
  applicationName: "PurePep",
  robots: INDEX_ENABLED
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    title: "PurePep — research-grade peptides",
    siteName: "PurePep",
    type: "website",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ENTITY.brand,
    legalName: ENTITY.legalName,
    alternateName: ENTITY.legalNameJa,
    url: ENTITY.website,
    email: ENTITY.email,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "JP Corporate Number",
      value: ENTITY.corporateNumber,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${ENTITY.address.line1}, ${ENTITY.address.line2}`,
      addressLocality: "Sakai",
      addressRegion: ENTITY.address.region,
      postalCode: ENTITY.address.postalCode,
      addressCountry: ENTITY.address.countryCode,
    },
  };

  // Fetched once per build (output: "export") and deduped by React's
  // request cache when other server components hit the same URL.  Products
  // populate the Footer catalogue column; policies populate the Policies
  // column with the live WP titles so editorial stays single-sourced.
  const [products, policies] = await Promise.all([getAllProducts(), getAllPolicyPages()]);
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-bone text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* PostHogProvider keeps its own Suspense boundary internally
            (around the useSearchParams-driven pageview tracker), so the
            rest of this tree SSRs normally — header, content, and
            footer all land in the static HTML for SEO + first paint. */}
        <PostHogProvider>
          <AgeGateGuard />
          {/* Desktop chrome — v3 header + bottom tab bar.  Hidden at
              ≤768px by .desktop-only; mobile users get MobileShell. */}
          <div className="desktop-only">
            <Header />
          </div>
          <main className="pb-[74px] md:pb-0">{children}</main>
          <div className="desktop-only">
            <Footer products={products} policies={policies} />
          </div>
          {/* Cart drawers — both listen to useCartStore.isOpen but only
              one renders per viewport via the .mob-only / .desktop-only
              CSS swap so users see exactly one cart UI. */}
          <div className="desktop-only">
            <CartDrawer />
          </div>
          <div className="mob-only">
            <MobileCartDrawer />
          </div>
          <CookieBanner />
          <div className="desktop-only">
            <TabBar />
          </div>
          {/* Mobile chrome — only renders ≤768px (mob-only inside). */}
          <MobileShell />
        </PostHogProvider>
      </body>
    </html>
  );
}
