import { getAllProducts } from "@/lib/wc-api";
import { CartPage } from "@/components/cart/CartPage";
import { MobileCartPage } from "@/components/v5/MobileCartPage";

export default async function Cart() {
  const products = await getAllProducts();
  return (
    <>
      <div className="desktop-only">
        <CartPage products={products} />
      </div>
      <div className="mob-only">
        <MobileCartPage />
      </div>
    </>
  );
}
