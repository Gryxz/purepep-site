import { getAllProducts } from "@/lib/wc-api";
import { HomePage } from "@/components/v3/HomePage";

export default async function Page() {
  const products = await getAllProducts();
  return <HomePage products={products} />;
}
