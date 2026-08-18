import { useBannerSessionState } from "../../../../lib/banner-session-state";

export const DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY = "configure_default_product_discount_tip";

export function DefaultProductDiscountTipBanner() {
  const [discountTipDismissed, dismiss] = useBannerSessionState(
    DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY,
  );

  if (discountTipDismissed) return null;

  return (
    <s-banner
      tone="info"
      title="Discount tip"
      dismissible
      onDismiss={dismiss}
    >
      Tip: Discounts are based on all items in your cart. Don&apos;t forget to
      include the Pre Selected Product&apos;s quantity or amount when setting up
      discounts.
    </s-banner>
  );
}
