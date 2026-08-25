import { BundleGuidedTour } from "../../../../components/bundle-configure/BundleGuidedTour";
import { BundleReadinessOverlay } from "../../../../components/bundle-configure/BundleReadinessOverlay";
import { DiscardChangesModal } from "../../../../components/bundle-configure/DiscardChangesModal";
import { MultiLanguageTextModal } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import { FPB_TOUR_STEPS } from "../../../../components/bundle-configure/tourSteps";
import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";

export function FpbGlobalOverlays({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const {
    activeMultiLanguageValues,
    closeDiscardModal,
    handleConfirmDiscard,
    handleGuidedTourStepChange,
    handleReadinessItemClick,
    isMultiLanguageModalOpen,
    loaderData,
    multiLanguageFields,
    multiLanguageLayout,
    multiLanguageTitle,
    readinessItems,
    readinessOpen,
    saveStepSetupMultiLanguageValues,
    setIsMultiLanguageModalOpen,
    setReadinessOpen,
    setTextOverridesLocale,
    shop,
    shopLocales,
    showDiscardModal,
    textOverridesLocale,
  } = flow;

  return (
    <>
      <BundleReadinessOverlay
        items={readinessItems}
        open={readinessOpen}
        onOpenChange={setReadinessOpen}
        onItemClick={handleReadinessItemClick}
      />
      <BundleGuidedTour
        steps={FPB_TOUR_STEPS}
        shop={shop}
        enabled={loaderData.showFirstLoadTour === true}
        onStepChange={handleGuidedTourStepChange}
      />
      <MultiLanguageTextModal
        open={isMultiLanguageModalOpen}
        title={multiLanguageTitle}
        layout={multiLanguageLayout}
        saveLabel={
          multiLanguageLayout === "compact" ? "Save and close" : undefined
        }
        locales={shopLocales}
        activeLocale={textOverridesLocale}
        fields={multiLanguageFields}
        valuesByLocale={activeMultiLanguageValues}
        onActiveLocaleChange={setTextOverridesLocale}
        onSave={saveStepSetupMultiLanguageValues}
        onClose={() => setIsMultiLanguageModalOpen(false)}
      />
      <DiscardChangesModal
        open={showDiscardModal}
        onDiscard={handleConfirmDiscard}
        onContinue={closeDiscardModal}
      />
    </>
  );
}
