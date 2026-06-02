import { getAllProducts } from "@/lib/wc-api";
import { CatalogPage } from "@/components/v3/CatalogPage";
import { MobileShopPage } from "@/components/v5/MobileShopPage";

export default async function ShopPage() {
  const products = await getAllProducts();
  return (
    <>
      <div className="desktop-only">
        <CatalogPage products={products} />
      </div>
      <div className="mob-only">
        <MobileShopPage products={products} />
      </div>
    </>
  );
}
