import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PpbStepSetupSection } from "./PpbStepSetupSection";
import { PpbDiscountPricingSection } from "./PpbDiscountPricingSection";
import { PpbBundleVisibilitySection } from "./PpbBundleVisibilitySection";
import { PpbBundleWidgetSection } from "./PpbBundleWidgetSection";
import { PpbBundleEmbedSection } from "./PpbBundleEmbedSection";
import { PpbImagesGifsSection } from "./PpbImagesGifsSection";
import { PpbBundleSettingsSection } from "./PpbBundleSettingsSection";
import { PpbSubscriptionsSection } from "./PpbSubscriptionsSection";
import { PpbFreeGiftAddonsSection } from "./PpbFreeGiftAddonsSection";
import { ConfigureValidationSummary } from "../_shared/bundle-configure/ConfigureValidationSummary";

export function PpbMainSections() {
  const flow = usePpbConfigureContext();

  return (
    <>
      <ConfigureValidationSummary
        activeSection={flow.activeSection}
        issues={flow.validationIssues}
      />
      <PpbStepSetupSection /> <PpbDiscountPricingSection />
      <PpbBundleVisibilitySection /> <PpbBundleWidgetSection />
      <PpbBundleEmbedSection /> <PpbImagesGifsSection />
      <PpbBundleSettingsSection /> <PpbSubscriptionsSection />
      <PpbFreeGiftAddonsSection />
    </>
  );
}
