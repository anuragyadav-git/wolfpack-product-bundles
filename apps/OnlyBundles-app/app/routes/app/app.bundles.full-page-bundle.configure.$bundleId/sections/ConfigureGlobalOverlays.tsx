import { BundleGuidedTour } from "../../../../components/bundle-configure/BundleGuidedTour";
import { DiscardChangesModal } from "../../../../components/bundle-configure/DiscardChangesModal";
import { MultiLanguageTextModal } from "../../../../components/bundle-configure/MultiLanguageTextModal";
import { FPB_TOUR_STEPS } from "../../../../components/bundle-configure/tourSteps";
import type { ComponentProps } from "react";

export interface FpbGlobalOverlaysProps {
  guidedTour: Omit<ComponentProps<typeof BundleGuidedTour>, "steps">;
  language: ComponentProps<typeof MultiLanguageTextModal>;
  discard: ComponentProps<typeof DiscardChangesModal>;
}

export function FpbGlobalOverlays({
  guidedTour,
  language,
  discard,
}: FpbGlobalOverlaysProps) {

  return (
    <>
      <BundleGuidedTour {...guidedTour} steps={FPB_TOUR_STEPS} />
      <MultiLanguageTextModal {...language} />
      <DiscardChangesModal {...discard} />
    </>
  );
}
