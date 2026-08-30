import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminSectionLoadingState } from "../../../components/AdminSectionLoadingState";
import { AdminTaskAlertBanner } from "../../../components/AdminTaskAlertBanner";
import fullPageBundleStyles from "../../../styles/routes/full-page-bundle-configure.module.css";
import { CommonConfigureShell } from "../_shared/bundle-configure/CommonConfigureShell";
import { getDeferredConfigureSection } from "../_shared/bundle-configure/deferred-configure-sections";
import { revealDeferredConfigureOverlays } from "../_shared/bundle-configure/deferred-configure-overlays";
import { ConfigureCanvasHeader } from "./ConfigureCanvasHeader";
import { ConfigureHiddenInputs } from "./ConfigureHiddenInputs";
import { ConfigureSidebar } from "./ConfigureSidebar";
import { useConfigureBundleFlow } from "./useConfigureBundleFlow";
import { StepSetupSection } from "./sections/StepSetupSection";
import { ConfigureValidationSummary } from "../_shared/bundle-configure/ConfigureValidationSummary";
import { ConfigureContextualSaveBar } from "../_shared/bundle-configure/ConfigureContextualSaveBar";

const FreeGiftAddonsSection = lazy(() => import("./sections/FreeGiftAddonsSection").then((module) => ({ default: module.FreeGiftAddonsSection })));
const DiscountPricingSection = lazy(() => import("./sections/DiscountPricingSection").then((module) => ({ default: module.DiscountPricingSection })));
const ImagesVisibilitySection = lazy(() => import("./sections/ImagesVisibilitySection").then((module) => ({ default: module.ImagesVisibilitySection })));
const BundleSettingsSection = lazy(() => import("./sections/BundleSettingsSection").then((module) => ({ default: module.BundleSettingsSection })));
const BundleWidgetSection = lazy(() => import("./sections/BundleWidgetSection").then((module) => ({ default: module.BundleWidgetSection })));
const BundleSubscriptionsSection = lazy(() => import("../_shared/bundle-configure/BundleSubscriptionsSection").then((module) => ({ default: module.BundleSubscriptionsSection })));
const ConfigureRouteModals = lazy(() => import("./sections/ConfigureRouteModals").then((module) => ({ default: module.ConfigureRouteModals })));

function ConfigureBundleFlow() {
  const { t } = useTranslation();
  const flow = useConfigureBundleFlow();
  const {
    blockConfigurationChangeWhileSaving,
    fetcher,
    handleSave,
    isDirty,
    isSaveInFlight,
    saveBarRef,
    setShowDiscardModal,
  } = flow;
  const [showOverlays, setShowOverlays] = useState(false);
  const deferredSection = getDeferredConfigureSection(flow.activeSection);

  useEffect(() => {
    const show = () => window.requestIdleCallback(() => {
      revealDeferredConfigureOverlays(() => setShowOverlays(true));
    });
    if (document.readyState === "complete") {
      show();
      return;
    }
    window.addEventListener("load", show, { once: true });
    return () => window.removeEventListener("load", show);
  }, []);

  return (
    <CommonConfigureShell
      blockConfigurationChangeWhileSaving={blockConfigurationChangeWhileSaving}
      isSaveInFlight={isSaveInFlight}
      styles={fullPageBundleStyles}
      saveForm={
        <form
          data-save-lock-allow="true"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          onReset={(e) => {
            e.preventDefault();
            setShowDiscardModal(true);
          }}
        >
          <ConfigureContextualSaveBar
            isOpen={isDirty}
            isSaving={fetcher.state !== "idle"}
            onSave={() => void handleSave()}
            onDiscard={() => setShowDiscardModal(true)}
            saveBarRef={saveBarRef}
          />
          <ConfigureHiddenInputs flow={flow} />
        </form>
      }
      header={<ConfigureCanvasHeader flow={flow} />}
      sidebar={<ConfigureSidebar flow={flow} />}
      overlays={showOverlays ? (
        <Suspense fallback={null}>
          <ConfigureRouteModals flow={flow} />
        </Suspense>
      ) : null}
    >
      <AdminTaskAlertBanner
        alert={flow.operationAlert}
        onDismiss={flow.clearOperationAlert}
      />
      <ConfigureValidationSummary
        activeSection={flow.activeSection}
        issues={flow.validationIssues}
      />
      {flow.activeSection === "step_setup" ? <StepSetupSection flow={flow} /> : null}
      <Suspense
        fallback={(
          <AdminSectionLoadingState label={t("common.loading.workspace")} />
        )}
      >
        {deferredSection === "free_gift_addons" ? <FreeGiftAddonsSection flow={flow} /> : null}
        {deferredSection === "discount_pricing" ? <DiscountPricingSection flow={flow} /> : null}
        {deferredSection === "images_visibility" ? <ImagesVisibilitySection flow={flow} /> : null}
        {deferredSection === "bundle_settings" ? <BundleSettingsSection flow={flow} /> : null}
        {deferredSection === "subscriptions" ? (
          <BundleSubscriptionsSection
            activeSection={flow.activeSection}
            bundle={flow.bundle}
            pricingState={flow.pricingState}
            setShowSubscriptionSetupGuide={flow.setShowSubscriptionSetupGuide}
            showSubscriptionSetupGuide={flow.showSubscriptionSetupGuide}
            shopLocales={flow.shopLocales}
            stepsState={flow.stepsState}
            subscriptionConfig={flow.subscriptionConfig}
            setSubscriptionConfig={flow.setSubscriptionConfig}
            subscriptionFetcher={flow.subscriptionFetcher}
            validationErrors={flow.validationErrors}
          />
        ) : null}
        {deferredSection === "bundle_widget" ? <BundleWidgetSection flow={flow} /> : null}
      </Suspense>
    </CommonConfigureShell>
  );
}

export default ConfigureBundleFlow;
