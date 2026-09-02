import { useBannerSessionState } from "../../../../lib/banner-session-state";
import { translateAdmin } from "~/i18n/config";

export const DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY =
  "configure_default_product_discount_tip";

export function DefaultProductDiscountTipBanner() {
  const [discountTipDismissed, dismiss] = useBannerSessionState(
    DEFAULT_PRODUCT_DISCOUNT_TIP_BANNER_KEY
  );

  if (discountTipDismissed) return null;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="info"
        heading={translateAdmin("adminAttributes.discountTip")}
        dismissible
        onDismiss={dismiss}
      >
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.defaultproductdiscounttipbanner.tipDiscountsAreBasedOnAllItemsInYourCartDonAposTForgetToIncludeT"
        )}
      </s-banner>
    </s-box>
  );
}
