import {
  PpbBundleStatusCard,
  type PpbBundleStatusCardProps,
} from "./PpbBundleStatusCard";
import {
  PpbBundleBannerSettings,
  type PpbBundleBannerSettingsProps,
} from "./PpbBundleSettingsControls.banner";
import {
  PpbCategoryStepSettings,
  type PpbCategoryStepSettingsProps,
} from "./PpbBundleSettingsControls.categorySteps";
import {
  PpbBundleLevelCssSettings,
  type PpbBundleLevelCssSettingsProps,
} from "./PpbBundleSettingsControls.bundleCss";
import {
  PpbCartDiscountDisplaySettings,
  type PpbCartDiscountDisplaySettingsProps,
} from "./PpbBundleSettingsControls.discount";
import {
  PpbDefaultProductsSettings,
  type PpbDefaultProductsSettingsProps,
} from "./PpbBundleSettingsControls.defaultProducts";
import {
  PpbQuantitySettings,
  type PpbQuantitySettingsProps,
} from "./PpbBundleSettingsControls.quantity";
import {
  PpbStickyAddToCartSettings,
  type PpbStickyAddToCartSettingsProps,
} from "./PpbBundleSettingsControls.stickyAddToCart";
import {
  PpbCountdownSettings,
  type PpbCountdownSettingsProps,
} from "./PpbBundleSettingsControls.countdown";

export type PpbBundleSettingsControlsProps = {
  banner: PpbBundleBannerSettingsProps;
  bundleLevelCss: PpbBundleLevelCssSettingsProps;
  categorySteps: PpbCategoryStepSettingsProps;
  countdown: PpbCountdownSettingsProps;
  defaultProducts: PpbDefaultProductsSettingsProps;
  discountDisplay: PpbCartDiscountDisplaySettingsProps;
  quantity: PpbQuantitySettingsProps;
  status: PpbBundleStatusCardProps;
  stickyAddToCart: PpbStickyAddToCartSettingsProps;
};

export function PpbBundleSettingsControls({
  banner,
  bundleLevelCss,
  categorySteps,
  countdown,
  defaultProducts,
  discountDisplay,
  quantity,
  status,
  stickyAddToCart,
}: PpbBundleSettingsControlsProps) {
  return (
    <div data-tour-target="ppb-bundle-status">
      <s-stack direction="block" gap="base">
        <PpbDefaultProductsSettings {...defaultProducts} />
        <PpbQuantitySettings {...quantity} />
        <PpbStickyAddToCartSettings {...stickyAddToCart} />
        <PpbCountdownSettings {...countdown} />
        <PpbCategoryStepSettings {...categorySteps} />
        <PpbCartDiscountDisplaySettings {...discountDisplay} />
        <PpbBundleBannerSettings {...banner} />
        <PpbBundleLevelCssSettings {...bundleLevelCss} />
        <PpbBundleStatusCard {...status} />
      </s-stack>
    </div>
  );
}
