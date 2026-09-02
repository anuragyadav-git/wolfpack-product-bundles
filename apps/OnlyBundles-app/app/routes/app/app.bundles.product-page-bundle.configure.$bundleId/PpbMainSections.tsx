import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AdminSectionLoadingState } from "../../../components/AdminSectionLoadingState";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { PpbStepSetupSection } from "./PpbStepSetupSection";
import { ConfigureValidationSummary } from "../_shared/bundle-configure/ConfigureValidationSummary";
import { getDeferredConfigureSection } from "../_shared/bundle-configure/deferred-configure-sections";

const PpbDiscountPricingSection = lazy(() =>
  import("./PpbDiscountPricingSection").then((module) => ({
    default: module.PpbDiscountPricingSection,
  }))
);
const PpbBundleVisibilitySection = lazy(() =>
  import("./PpbBundleVisibilitySection").then((module) => ({
    default: module.PpbBundleVisibilitySection,
  }))
);
const PpbBundleWidgetSection = lazy(() =>
  import("./PpbBundleWidgetSection").then((module) => ({
    default: module.PpbBundleWidgetSection,
  }))
);
const PpbBundleEmbedSection = lazy(() =>
  import("./PpbBundleEmbedSection").then((module) => ({
    default: module.PpbBundleEmbedSection,
  }))
);
const PpbImagesGifsSection = lazy(() =>
  import("./PpbImagesGifsSection").then((module) => ({
    default: module.PpbImagesGifsSection,
  }))
);
const PpbBundleSettingsSection = lazy(() =>
  import("./PpbBundleSettingsSection").then((module) => ({
    default: module.PpbBundleSettingsSection,
  }))
);
const PpbSubscriptionsSection = lazy(() =>
  import("./PpbSubscriptionsSection").then((module) => ({
    default: module.PpbSubscriptionsSection,
  }))
);
const PpbFreeGiftAddonsSection = lazy(() =>
  import("./PpbFreeGiftAddonsSection").then((module) => ({
    default: module.PpbFreeGiftAddonsSection,
  }))
);

export function PpbMainSections() {
  const { t } = useTranslation();
  const flow = usePpbConfigureContext();
  const deferredSection = getDeferredConfigureSection(flow.activeSection);

  return (
    <>
      <AdminTaskAlertBanner
        alert={flow.operationAlert}
        onDismiss={flow.clearOperationAlert}
      />
      <ConfigureValidationSummary
        activeSection={flow.activeSection}
        issues={flow.validationIssues}
      />
      {flow.activeSection === "step_setup" ? <PpbStepSetupSection /> : null}
      <Suspense
        fallback={
          <AdminSectionLoadingState label={t("common.loading.workspace")} />
        }
      >
        {deferredSection === "discount_pricing" ? (
          <PpbDiscountPricingSection />
        ) : null}
        {flow.activeSection === "bundle_visibility" ? (
          <PpbBundleVisibilitySection />
        ) : null}
        {deferredSection === "bundle_widget" ? (
          <PpbBundleWidgetSection />
        ) : null}
        {deferredSection === "bundle_embed" ? <PpbBundleEmbedSection /> : null}
        {flow.activeSection === "images_gifs" ? <PpbImagesGifsSection /> : null}
        {deferredSection === "bundle_settings" ? (
          <PpbBundleSettingsSection />
        ) : null}
        {deferredSection === "subscriptions" ? (
          <PpbSubscriptionsSection />
        ) : null}
        {deferredSection === "free_gift_addons" ? (
          <PpbFreeGiftAddonsSection />
        ) : null}
      </Suspense>
    </>
  );
}
