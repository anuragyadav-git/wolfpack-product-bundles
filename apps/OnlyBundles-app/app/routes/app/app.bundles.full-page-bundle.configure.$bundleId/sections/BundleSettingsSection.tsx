import {
  FpbBundleCssSettings,
  type FpbBundleCssSettingsProps,
} from "./BundleSettingsCss";
import {
  FpbDefaultProductsSettings,
  type FpbDefaultProductsSettingsProps,
} from "./BundleSettingsDefaultProducts";
import {
  FpbQuantitySettings,
  type FpbQuantitySettingsProps,
} from "./BundleSettingsQuantity";
import {
  FpbBundleCartSettings,
  type FpbBundleCartSettingsProps,
} from "./BundleSettingsBundleCart";
import {
  FpbSummaryTextSettings,
  type FpbSummaryTextSettingsProps,
} from "./BundleSettingsSummaryText";
import {
  FpbBundleTemplateSettings,
  type FpbBundleTemplateSettingsProps,
} from "./BundleSettingsTemplate";
import {
  FpbTimelineSettings,
  type FpbTimelineSettingsProps,
} from "./BundleSettingsTimeline";

interface BundleSettingsSectionProps {
  activeSection: string;
  bundleCart: FpbBundleCartSettingsProps;
  css: FpbBundleCssSettingsProps;
  defaultProducts: FpbDefaultProductsSettingsProps;
  quantity: FpbQuantitySettingsProps;
  summaryText: FpbSummaryTextSettingsProps;
  template: FpbBundleTemplateSettingsProps;
  timeline: FpbTimelineSettingsProps;
}

export function BundleSettingsSection({
  activeSection,
  bundleCart,
  css,
  defaultProducts,
  quantity,
  summaryText,
  template,
  timeline,
}: BundleSettingsSectionProps) {

  if (activeSection !== "bundle_settings") return null;

  return (
    <div data-tour-target="fpb-bundle-settings">
      <s-stack direction="block" gap="base">
        <FpbDefaultProductsSettings {...defaultProducts} />
        <FpbQuantitySettings {...quantity} />
        <FpbSummaryTextSettings {...summaryText} />
        <FpbBundleCartSettings {...bundleCart} />
        <FpbBundleTemplateSettings {...template} />
        <FpbTimelineSettings {...timeline} />
        <FpbBundleCssSettings {...css} />
      </s-stack>
    </div>
  );
}
