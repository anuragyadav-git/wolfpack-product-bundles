import type { ComponentProps } from "react";
import {
  FpbBundleVisibilityPanel,
  type FpbBundleVisibilityPanelProps,
} from "./BundleVisibilityPanel";
import {
  FpbImagesGifsPanel,
  type FpbImagesGifsPanelProps,
} from "./ImagesGifsPanel";
import { SpecificLinkOfferSection } from "../../shared/SpecificLinkOfferSection";
import { OfferOperationsSection } from "../../shared/OfferOperationsSection";
import { CountryTargetingSection } from "../../shared/CountryTargetingSection";

interface ImagesVisibilitySectionProps {
  activeSection: string;
  countryTargeting: ComponentProps<typeof CountryTargetingSection>;
  media: FpbImagesGifsPanelProps;
  offerOperations: ComponentProps<typeof OfferOperationsSection>;
  specificLinkOffer: ComponentProps<typeof SpecificLinkOfferSection>;
  visibility: FpbBundleVisibilityPanelProps;
}

export function ImagesVisibilitySection({
  activeSection,
  countryTargeting,
  media,
  offerOperations,
  specificLinkOffer,
  visibility,
}: ImagesVisibilitySectionProps) {

  if (
    activeSection !== "images_gifs" &&
    activeSection !== "bundle_visibility"
  ) {
    return null;
  }

  return (
    <div data-tour-target="fpb-design-settings">
      <s-stack direction="block" gap="base">
        <FpbBundleVisibilityPanel {...visibility} />
        <SpecificLinkOfferSection {...specificLinkOffer} />
        <OfferOperationsSection {...offerOperations} />
        <CountryTargetingSection {...countryTargeting} />
        <FpbImagesGifsPanel {...media} />
      </s-stack>
    </div>
  );
}
