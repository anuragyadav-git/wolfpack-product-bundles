import { useState } from "react";

export function DefaultProductDiscountTipBanner() {
  const [discountTipDismissed, setDiscountTipDismissed] = useState(false);

  if (discountTipDismissed) return null;

  return (
    <s-banner
      tone="info"
      title="Discount tip"
      dismissible
      onDismiss={() => setDiscountTipDismissed(true)}
    >
      Tip: Discounts are based on all items in your cart. Don&apos;t forget to
      include the Pre Selected Product&apos;s quantity or amount when setting up
      discounts.
    </s-banner>
  );
}
