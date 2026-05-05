import { getAllProducts } from "@/lib/wc-api";
import { CartPage } from "@/components/v3/CartPage";

export default async function Cart() {
  const products = await getAllProducts();
  return <CartPage products={products} />;
}
