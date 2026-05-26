"use client";

import { useState } from "react";
import { CheckoutPage } from "@/components/v3/CheckoutPage";
import { MobileCheckout } from "@/components/v5/MobileCheckout";
import { BankfulScript } from "@/components/checkout/BankfulScript";

export default function Checkout() {
  // false = loading/unknown, true = SDK ready, "failed" = load error
  const [sdkReady, setSdkReady] = useState<boolean | "failed">(false);

  return (
    <>
      <BankfulScript onReady={(ok) => setSdkReady(ok ? true : "failed")} />
      <div className="desktop-only">
        <CheckoutPage sdkReady={sdkReady} />
      </div>
      <div className="mob-only">
        <MobileCheckout sdkReady={sdkReady} />
      </div>
    </>
  );
}
