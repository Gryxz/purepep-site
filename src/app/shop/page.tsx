import { getAllProducts } from "@/lib/wc-api";
import { CatalogClient } from "./CatalogClient";

export default async function ShopPage() {
  const products = await getAllProducts();
  return <CatalogClient products={products} />;
}
