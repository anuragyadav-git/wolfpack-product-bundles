import type { ConfigureBundleFlowContext } from "../useConfigureBundleFlow";
import { FpbBundleVisibilityPanel } from "./BundleVisibilityPanel";
import { FpbImagesGifsPanel } from "./ImagesGifsPanel";
import { SpecificLinkOfferSection } from "../../shared/SpecificLinkOfferSection";

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
        <FpbImagesGifsPanel flow={flow} />
      </s-stack>
    </div>
  );
}
