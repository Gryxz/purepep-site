import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { compliance } from "@design/tokens";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import PostHogProvider from "@/components/PostHogProvider";
import { getAllProducts } from "@/lib/wc-api";
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
    "Lyophilized research peptides assayed at ≥99.5% purity by HPLC, lot-matched COA on every vial. " +
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
  // Fetched once per build (output: "export") and deduped by React's
  // request cache when other server components hit the same URL.  Used to
  // populate the Footer catalogue column with live WC products instead
  // of hard-coded slugs that 404 when the upstream renames a SKU.
  const products = await getAllProducts();
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="bg-bone text-ink antialiased">
        {/* Suspense wraps the analytics provider because useSearchParams forces
            a client-render boundary; without it the static export bails on
            every page that doesn't already opt in to dynamic rendering. */}
        <Suspense fallback={null}>
          <PostHogProvider>
            <Header />
            <main>{children}</main>
            <Footer products={products} />
            <CartDrawer />
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
