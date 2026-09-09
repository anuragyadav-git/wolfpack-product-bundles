import { BundleGuidedTour } from "../../../../components/bundle-configure/BundleGuidedTour";
import { BundleReadinessOverlay } from "../../../../components/bundle-configure/BundleReadinessOverlay";
import { DiscardChangesModal } from "../../../../components/bundle-configure/DiscardChangesModal";
import { MultiLanguageTextModal } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import { FPB_TOUR_STEPS } from "../../../../components/bundle-configure/tourSteps";
import type { ComponentProps } from "react";

export interface FpbGlobalOverlaysProps {
  readiness: ComponentProps<typeof BundleReadinessOverlay>;
  guidedTour: Omit<ComponentProps<typeof BundleGuidedTour>, "steps">;
  language: ComponentProps<typeof MultiLanguageTextModal>;
  discard: ComponentProps<typeof DiscardChangesModal>;
}

export function FpbGlobalOverlays({
  readiness,
  guidedTour,
  language,
  discard,
}: FpbGlobalOverlaysProps) {

  return (
    <>
      <BundleReadinessOverlay {...readiness} />
      <BundleGuidedTour {...guidedTour} steps={FPB_TOUR_STEPS} />
      <MultiLanguageTextModal {...language} />
      <DiscardChangesModal {...discard} />
    </>
  );
}
