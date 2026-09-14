import { lazy, Suspense, useEffect, useState } from "react";
import { BundleReadinessOverlay } from "../../../components/bundle-configure/BundleReadinessOverlay";
import productPageBundleStyles from "../../../styles/routes/product-page-bundle-configure.module.css";

import { CommonConfigureShell } from "../_shared/bundle-configure/CommonConfigureShell";
import { revealDeferredConfigureOverlays } from "../_shared/bundle-configure/deferred-configure-overlays";
import { PpbCanvasHeader } from "./PpbCanvasHeader";
import {
  PpbConfigureSidebar,
  PpbConfigureSupplement,
} from "./PpbConfigureSidebar";
import { PpbMainSections } from "./PpbMainSections";
import { PpbSaveForm } from "./PpbSaveForm";
import {
  usePpbConfigureFlow,
  type PpbConfigureFlow,
} from "./usePpbConfigureFlow";

const PpbConfigureOverlays = lazy(() =>
  import("./PpbConfigureOverlays").then((module) => ({
    default: module.PpbConfigureOverlays,
  }))
);

function ConfigureBundleCanvas({ flow }: { flow: PpbConfigureFlow }) {
  const { blockConfigurationChangeWhileSaving, isSaveInFlight } = flow;
  const [showOverlays, setShowOverlays] = useState(false);

  useEffect(() => {
    const show = () =>
      window.requestIdleCallback(() => {
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
      styles={productPageBundleStyles}
      saveForm={
        <PpbSaveForm
          bundleProduct={flow.bundleProduct}
          conditionsState={flow.conditionsState}
          discountMessagingMultiLanguageEnabled={
            flow.discountMessagingMultiLanguageEnabled
          }
          fetcher={flow.fetcher}
          formState={flow.formState}
          handleSave={flow.handleSave}
          isDirty={flow.isDirty}
          pricingState={flow.pricingState}
          progressBarEnabled={flow.progressBarEnabled}
          progressBarProgressText={flow.progressBarProgressText}
          progressBarSuccessText={flow.progressBarSuccessText}
          progressBarType={flow.progressBarType}
          qtyOptionsDefaultRuleId={flow.qtyOptionsDefaultRuleId}
          qtyOptionsEnabled={flow.qtyOptionsEnabled}
          qtyRuleLabels={flow.qtyRuleLabels}
          qtyRuleSubtexts={flow.qtyRuleSubtexts}
          qtyRuleTextsByLocaleByRuleId={flow.qtyRuleTextsByLocaleByRuleId}
          ruleMessages={flow.ruleMessages}
          ruleMessagesByLocale={flow.ruleMessagesByLocale}
          saveBarRef={flow.saveBarRef}
          setShowDiscardModal={flow.setShowDiscardModal}
          stepsState={flow.stepsState}
          tierTextByLocaleByRuleId={flow.tierTextByLocaleByRuleId}
          tierTextByRuleId={flow.tierTextByRuleId}
        />
      }
      header={
        <PpbCanvasHeader
          appEmbedEnabled={flow.appEmbedEnabled}
          bundle={flow.bundle}
          fetcher={flow.fetcher}
          handleBackClick={flow.handleBackClick}
          handlePreviewBundle={flow.handlePreviewBundle}
          isPreviewBundleLoading={flow.isPreviewBundleLoading}
          loadedBundleProduct={flow.loadedBundleProduct}
          openThemeEditorForAppEmbed={flow.openThemeEditorForAppEmbed}
          openProductInAdmin={flow.openProductInAdmin}
          operationAlert={flow.operationAlert}
          parentProductStatusUi={flow.parentProductStatusUi}
          readinessScore={flow.readinessScore}
          shop={flow.shop}
          themeEditorUrl={flow.themeEditorUrl}
        />
      }
      sidebar={
        <PpbConfigureSidebar
          activeSection={flow.activeSection}
          appEmbedEnabled={flow.appEmbedEnabled}
          bundle={flow.bundle}
          bundleProduct={flow.bundleProduct}
          formState={flow.formState}
          handleBundleProductSelect={flow.handleBundleProductSelect}
          handleSectionChange={flow.handleSectionChange}
          handleSyncProduct={flow.handleSyncProduct}
          openProductInAdmin={flow.openProductInAdmin}
          openSelectTemplateModal={flow.openSelectTemplateModal}
          parentProductStatusUi={flow.parentProductStatusUi}
          pricingState={flow.pricingState}
          productImageUrl={flow.productImageUrl}
          productTitle={flow.productTitle}
          selectTemplateOpenButtonRef={flow.selectTemplateOpenButtonRef}
        />
      }
      supplementaryContent={
        <PpbConfigureSupplement
          handlePlaceWidget={flow.handlePlaceWidget}
          isPreparingPlacementTemplates={flow.isPreparingPlacementTemplates}
        />
      }
      overlays={
        <>
          <BundleReadinessOverlay
            items={flow.readinessItems}
            open={flow.readinessOpen}
            onOpenChange={flow.setReadinessOpen}
            onItemClick={flow.handleReadinessItemClick}
          />
          {showOverlays ? (
            <Suspense fallback={null}>
              <PpbConfigureOverlays flow={flow} />
            </Suspense>
          ) : null}
        </>
      }
    >
      <PpbMainSections flow={flow} />
    </CommonConfigureShell>
  );
}

export default function ConfigureBundleFlow() {
  const flow = usePpbConfigureFlow();

  return <ConfigureBundleCanvas flow={flow} />;
}
