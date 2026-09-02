import { useBannerSessionState } from "../../../../lib/banner-session-state";
import { translateAdmin } from "~/i18n/config";

export const DISCOUNT_PRICING_TIP_BANNER_KEY = "configure_discount_pricing_tip";

export function DiscountPricingTipBanner() {
  const [dismissed, dismiss] = useBannerSessionState(
    DISCOUNT_PRICING_TIP_BANNER_KEY
  );

  if (dismissed) return null;

  return (
    <s-box paddingBlockEnd="small-200">
      <s-banner
        tone="info"
        heading={translateAdmin("adminAttributes.discountSetupTip")}
        dismissible
        onDismiss={dismiss}
      >
        {translateAdmin(
          "adminExtracted.shared.bundleConfigure.discountpricingtipbanner.tipDiscountsAreCalculatedBasedOnTheProductsInCartMakeSureToAddTh"
        )}
      </s-banner>
    </s-box>
  );
}
