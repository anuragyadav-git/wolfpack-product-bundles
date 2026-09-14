import type { ComponentProps } from "react";
import { FpbBundleQuantityOptions } from "./DiscountBundleQuantityOptions";
import { FpbDiscountMessagingOptions } from "./DiscountMessagingOptions";
import { FpbProgressBarOptions } from "./DiscountProgressBarOptions";
import { DisabledConfigurationRegion } from "../../_shared/bundle-configure/DisabledConfigurationRegion";
import { translateAdmin } from "~/i18n/config";

export function FpbDiscountDisplayOptions({
  inactive,
  quantity,
  progress,
  messaging,
}: {
  inactive: boolean;
  quantity: ComponentProps<typeof FpbBundleQuantityOptions>;
  progress: ComponentProps<typeof FpbProgressBarOptions>;
  messaging: ComponentProps<typeof FpbDiscountMessagingOptions>;
}) {
  return (
    <s-section>
      <DisabledConfigurationRegion disabled={inactive}>
        <s-stack direction="block" gap="small">
          <s-stack direction="block" gap="small-400">
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountdisplayoptions.discountDisplayOptions"
              )}
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: "#6d7175" }}>
              {translateAdmin(
                "adminExtracted.appBundlesFullPageBundleConfigure.sections.discountdisplayoptions.chooseHowDiscountsAreDisplayed"
              )}
            </p>
          </s-stack>
          <FpbBundleQuantityOptions {...quantity} />
          <FpbProgressBarOptions {...progress} />
          <FpbDiscountMessagingOptions {...messaging} />
        </s-stack>
      </DisabledConfigurationRegion>
    </s-section>
  );
}
