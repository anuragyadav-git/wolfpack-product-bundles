import { PpbBundleStatusCard } from "./PpbBundleStatusCard";
import { PpbBundleBannerSettings } from "./PpbBundleSettingsControls.banner";
import { PpbCategoryStepSettings } from "./PpbBundleSettingsControls.categorySteps";
import { PpbBundleLevelCssSettings } from "./PpbBundleSettingsControls.css";
import { PpbCartDiscountDisplaySettings } from "./PpbBundleSettingsControls.discount";
import { PpbDefaultProductsSettings } from "./PpbBundleSettingsControls.defaultProducts";
import { PpbQuantitySettings } from "./PpbBundleSettingsControls.quantity";
import { PpbStickyAddToCartSettings } from "./PpbBundleSettingsControls.stickyAddToCart";
import { PpbCountdownSettings } from "./PpbBundleSettingsControls.countdown";

export function PpbBundleSettingsControls() {
  return (
    <div data-tour-target="ppb-bundle-status">
      <s-stack direction="block" gap="base">
        <PpbDefaultProductsSettings />
        <PpbQuantitySettings />
        <PpbStickyAddToCartSettings />
        <PpbCountdownSettings />
        <PpbCategoryStepSettings />
        <PpbCartDiscountDisplaySettings />
        <PpbBundleBannerSettings />
        <PpbBundleLevelCssSettings />
        <PpbBundleStatusCard />
      </s-stack>
    </div>
  );
}
