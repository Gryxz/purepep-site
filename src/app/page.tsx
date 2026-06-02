import { getAllProducts } from "@/lib/wc-api";
import { HomePage } from "@/components/v3/HomePage";
import { MobileHomePage } from "@/components/v5/MobileHomePage";

export default async function Page() {
  const products = await getAllProducts();
  return (
    <>
      {/* Desktop ≥769px — existing v3 Apple Swiss homepage, unchanged. */}
      <div className="desktop-only">
        <HomePage products={products} />
      </div>
      {/* Mobile ≤768px — new v5 mobile-first homepage. */}
      <div className="mob-only">
        <MobileHomePage products={products} />
      </div>
    </>
  );
}
