import { getAllProducts } from "@/lib/wc-api";
import { CatalogPage } from "@/components/v3/CatalogPage";

export default async function ShopPage() {
  const products = await getAllProducts();
  return <CatalogPage products={products} />;
}
