import type { Metadata } from "next";
import { QualityPage } from "@/components/v3/QualityPage";
import { getAllProducts } from "@/lib/wc-api";

export const metadata: Metadata = {
  title: "Quality — methods, lots, and Certificate of Analysis",
  description:
    "Three independent measurements per lot — purity by HPLC, identity by mass spectrometry, endotoxin by LAL — published as a downloadable Certificate of Analysis.",
};

export default async function Page() {
  const products = await getAllProducts();
  return <QualityPage productCount={products.length} />;
}
