import { CheckoutPage } from "@/components/v3/CheckoutPage";
import { MobileCheckout } from "@/components/v5/MobileCheckout";

export default function Checkout() {
  return (
    <>
      <div className="desktop-only">
        <CheckoutPage />
      </div>
      <div className="mob-only">
        <MobileCheckout />
      </div>
    </>
  );
}
