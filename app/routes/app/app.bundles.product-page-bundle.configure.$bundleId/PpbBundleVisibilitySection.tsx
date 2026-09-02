import {
  buildBundleLinkModel,
  buildEmbedStatusModel,
} from "../../../lib/bundle-config/common-configure-page-model";
import { CommonBundleVisibilityOverview } from "../_shared/bundle-configure/CommonBundleVisibilityOverview";
import { usePpbConfigureContext } from "./PpbConfigureContext";
import { SpecificLinkOfferSection } from "../shared/SpecificLinkOfferSection";
import { OfferOperationsSection } from "../shared/OfferOperationsSection";
import { CountryTargetingSection } from "../shared/CountryTargetingSection";

export function PpbBundleVisibilitySection() {
  const flow = usePpbConfigureContext();
  const link = buildBundleLinkModel({
    bundleType: "product_page",
    shop: flow.shop,
    productHandle: flow.bundle.shopifyProductHandle,
  });

  return (
    <div data-tour-target="ppb-bundle-visibility">
      <s-stack direction="block" gap="base">
        {CommonBundleVisibilityOverview({
          active: flow.activeSection === "bundle_visibility",
          embedStatus: buildEmbedStatusModel(
            "product_page",
            flow.appEmbedEnabled
          ),
          link,
          onCopyLink: () => {
            void navigator.clipboard?.writeText(link.url);
            flow.shopify.toast.show("Bundle link copied", {
              isError: false,
            });
          },
          onEnableEmbed: flow.openThemeEditorForAppEmbed,
          placementOptions: [
            {
              title: "Bundle Widget",
              description:
                "Show an upsell button or block on selected product pages.",
              actionLabel: "Set up Bundle Widget",
              variant: "primary",
              onAction: () => flow.handleSectionChange("bundle_widget"),
            },
            {
              title: "Bundle Embed",
              description:
                "Place the bundle builder directly on selected product pages.",
              actionLabel: "Set up Bundle Embed",
              variant: "secondary",
              onAction: () => flow.handleSectionChange("bundle_embed"),
            },
          ],
          themeEditorUrl: flow.themeEditorUrl,
        })}
        <SpecificLinkOfferSection
          active={flow.activeSection === "bundle_visibility"}
          busy={flow.specificLinkOfferBusy}
          generatedLink={flow.generatedSpecificLink}
          state={flow.offerDeliveryState}
          onEnabledChange={flow.setSpecificLinkOfferEnabled}
          onGenerate={flow.generateSpecificLinkOffer}
          onCopy={flow.copySpecificLinkOffer}
          onRevoke={flow.revokeSpecificLinkOffer}
        />
        <OfferOperationsSection
          active={flow.activeSection === "bundle_visibility"}
          state={flow.offerDeliveryState}
          onPriorityChange={flow.setOfferPriority}
          onStopLowerPriorityChange={flow.setOfferStopLowerPriority}
          onScheduleModeChange={flow.setOfferScheduleMode}
          onStartsAtChange={flow.setOfferStartsAt}
          onEndsAtChange={flow.setOfferEndsAt}
          onRecurrenceFrequencyChange={flow.setOfferRecurrenceFrequency}
          onRecurrenceAnchorDateChange={flow.setOfferRecurrenceAnchorDate}
          onRecurrenceWindowStartChange={flow.setOfferRecurrenceWindowStart}
          onRecurrenceWindowEndChange={flow.setOfferRecurrenceWindowEnd}
          onRecurrenceTerminationChange={flow.setOfferRecurrenceTermination}
          onRecurrenceEndsOnChange={flow.setOfferRecurrenceEndsOn}
          onRecurrenceRunCountChange={flow.setOfferRecurrenceRunCount}
        />
        <CountryTargetingSection
          active={flow.activeSection === "bundle_visibility"}
          state={flow.offerDeliveryState}
          onEnabledChange={flow.setCountryTargetingEnabled}
          onModeChange={flow.setCountryTargetingMode}
          onCountryCodesChange={flow.setCountryCodes}
        />
      </s-stack>
    </div>
  );
}
