import { BundleGuidedTour } from "../../../components/bundle-configure/BundleGuidedTour";
import { BundleReadinessOverlay } from "../../../components/bundle-configure/BundleReadinessOverlay";
import { EnablePreviewModal } from "../../../components/EnablePreviewModal";
import { MultiLanguageTextModal } from "../../../components/bundle-configure/MultiLanguageTextModal";
import { PPB_TOUR_STEPS } from "../../../components/bundle-configure/tourSteps";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbOverlayModalsProps = Pick<
  PpbConfigureFlow,
  | "activeMultiLanguageValues"
  | "enablePreviewGate"
  | "handleGuidedTourStepChange"
  | "handleReadinessItemClick"
  | "isMultiLanguageModalOpen"
  | "loaderData"
  | "multiLanguageFields"
  | "multiLanguageTitle"
  | "readinessItems"
  | "readinessOpen"
  | "saveStepSetupMultiLanguageValues"
  | "setIsMultiLanguageModalOpen"
  | "setReadinessOpen"
  | "setTextOverridesLocale"
  | "shop"
  | "shopLocales"
  | "textOverridesLocale"
>;

export function PpbOverlayModals({
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
}: PpbOverlayModalsProps) {

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
