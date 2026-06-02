import type { Metadata } from "next";
import { LegalPageView } from "@/components/LegalPageView";
import { getPage } from "@/lib/wp-pages";

const SLUG = "terms-of-service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(SLUG);
  return {
    title: page.title,
    robots: { index: true, follow: true },
  };
}

export default async function Page() {
  const page = await getPage(SLUG);
  return <LegalPageView page={page} />;
}
