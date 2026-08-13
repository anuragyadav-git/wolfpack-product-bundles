import { useState } from "react";

export function DiscountPricingTipBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <s-banner
      tone="info"
      heading="Discount setup tip"
      dismissible
      onDismiss={() => setDismissed(true)}
    >
      Tip: Discounts are calculated based on the products in cart, make sure to
      add the &quot;Default Product&quot; quantity or amount while configuring
      discounts.
    </s-banner>
  );
}
