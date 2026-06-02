import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Open a support request with the PurePep research team — order status, " +
    "shipping, Certificates of Analysis, returns, and account questions. " +
    "We reply within one business day at info@purepep.shop.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage />;
}
