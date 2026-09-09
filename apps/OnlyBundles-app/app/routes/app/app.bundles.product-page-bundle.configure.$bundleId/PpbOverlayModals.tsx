import { BundleGuidedTour } from "../../../components/bundle-configure/BundleGuidedTour";
import { EnablePreviewModal } from "../../../components/EnablePreviewModal";
import { MultiLanguageTextModal } from "../../../components/bundle-configure/MultiLanguageTextModal";
import { PPB_TOUR_STEPS } from "../../../components/bundle-configure/tourSteps";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

export type PpbOverlayModalsProps = Pick<
  PpbConfigureFlow,
  | "activeMultiLanguageValues"
  | "enablePreviewGate"
  | "handleGuidedTourStepChange"
  | "isMultiLanguageModalOpen"
  | "loaderData"
  | "multiLanguageFields"
  | "multiLanguageTitle"
  | "saveStepSetupMultiLanguageValues"
  | "setIsMultiLanguageModalOpen"
  | "setTextOverridesLocale"
  | "shop"
  | "shopLocales"
  | "textOverridesLocale"
>;

export function PpbOverlayModals({
  activeMultiLanguageValues,
  enablePreviewGate,
  handleGuidedTourStepChange,
  isMultiLanguageModalOpen,
  loaderData,
  multiLanguageFields,
  multiLanguageTitle,
  saveStepSetupMultiLanguageValues,
  setIsMultiLanguageModalOpen,
  setTextOverridesLocale,
  shop,
  shopLocales,
  textOverridesLocale,
}: PpbOverlayModalsProps) {

  return (
    <>
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
