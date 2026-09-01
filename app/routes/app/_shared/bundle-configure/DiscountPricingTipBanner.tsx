import { useBannerSessionState } from "../../../../lib/banner-session-state";

export const DISCOUNT_PRICING_TIP_BANNER_KEY = "configure_discount_pricing_tip";

export function DiscountPricingTipBanner() {
  const [dismissed, dismiss] = useBannerSessionState(
    DISCOUNT_PRICING_TIP_BANNER_KEY,
  );

  if (dismissed) return null;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="info"
        heading="Discount setup tip"
        dismissible
        onDismiss={dismiss}
      >
        Tip: Discounts are calculated based on the products in cart, make sure to
        add the &quot;Default Product&quot; quantity or amount while configuring
        discounts.
      </s-banner>
    </s-box>
  );
}
