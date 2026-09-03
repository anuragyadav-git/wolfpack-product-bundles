import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbOverlayModals() {
  const {
    BundleGuidedTour,
    BundleReadinessOverlay,
    EnablePreviewModal,
    MultiLanguageTextModal,
    PPB_TOUR_STEPS,
    activeMultiLanguageValues,
    enablePreviewGate,
    handleGuidedTourStepChange,
    handleReadinessItemClick,
    isMultiLanguageModalOpen,
    loaderData,
    multiLanguageFields,
    multiLanguageTitle,
    readinessItems,
    readinessOpen,
    saveStepSetupMultiLanguageValues,
    setIsMultiLanguageModalOpen,
    setReadinessOpen,
    setTextOverridesLocale,
    shop,
    shopLocales,
    textOverridesLocale,
  } = usePpbConfigureContext();

  return (
    <>
      <BundleReadinessOverlay
        items={readinessItems}
        open={readinessOpen}
        onOpenChange={setReadinessOpen}
        onItemClick={handleReadinessItemClick}
      />
      <BundleGuidedTour
        steps={PPB_TOUR_STEPS}
        shop={shop}
        enabled={loaderData.showFirstLoadTour === true}
        onStepChange={handleGuidedTourStepChange}
      />
      <MultiLanguageTextModal
        open={isMultiLanguageModalOpen}
        title={multiLanguageTitle}
        locales={shopLocales}
        activeLocale={textOverridesLocale}
        fields={multiLanguageFields}
        valuesByLocale={activeMultiLanguageValues}
        onActiveLocaleChange={setTextOverridesLocale}
        onSave={saveStepSetupMultiLanguageValues}
        onClose={() => setIsMultiLanguageModalOpen(false)}
      />
      <EnablePreviewModal {...enablePreviewGate.modalProps} />
    </>
  );
}
