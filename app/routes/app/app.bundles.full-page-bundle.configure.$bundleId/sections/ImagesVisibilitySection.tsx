import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbBundleVisibilityPanel } from "./BundleVisibilityPanel";
import { FpbImagesGifsPanel } from "./ImagesGifsPanel";
import { SpecificLinkOfferSection } from "../../shared/SpecificLinkOfferSection";
import { OfferOperationsSection } from "../../shared/OfferOperationsSection";
import { CountryTargetingSection } from "../../shared/CountryTargetingSection";

export function ImagesVisibilitySection({
  flow,
}: {
  flow: ConfigureBundleFlowContext;
}) {
  const { activeSection } = flow;

  if (
    activeSection !== "images_gifs" &&
    activeSection !== "bundle_visibility"
  ) {
    return null;
  }

  return (
    <div data-tour-target="fpb-design-settings">
      <s-stack direction="block" gap="base">
        <FpbBundleVisibilityPanel flow={flow} />
        <SpecificLinkOfferSection
          active={activeSection === "bundle_visibility"}
          busy={flow.specificLinkOfferBusy}
          generatedLink={flow.generatedSpecificLink}
          state={flow.offerDeliveryState}
          onEnabledChange={flow.setSpecificLinkOfferEnabled}
          onGenerate={flow.generateSpecificLinkOffer}
          onCopy={flow.copySpecificLinkOffer}
          onRevoke={flow.revokeSpecificLinkOffer}
        />
        <OfferOperationsSection
          active={activeSection === "bundle_visibility"}
          state={flow.offerDeliveryState}
          onPriorityChange={flow.setOfferPriority}
          onStopLowerPriorityChange={flow.setOfferStopLowerPriority}
          onStartsAtChange={flow.setOfferStartsAt}
          onEndsAtChange={flow.setOfferEndsAt}
        />
        <CountryTargetingSection
          active={activeSection === "bundle_visibility"}
          state={flow.offerDeliveryState}
          onEnabledChange={flow.setCountryTargetingEnabled}
          onModeChange={flow.setCountryTargetingMode}
          onCountryCodesChange={flow.setCountryCodes}
        />
        <FpbImagesGifsPanel flow={flow} />
      </s-stack>
    </div>
  );
}
