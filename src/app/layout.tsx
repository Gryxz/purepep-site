import type { Metadata } from "next";
import { compliance } from "@design/tokens";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bone text-ink antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
