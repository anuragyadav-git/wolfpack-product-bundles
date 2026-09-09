import {
  buildBundleLinkModel,
  buildEmbedStatusModel,
} from "../../../lib/bundle-config/common-configure-page-model";
import { useAppBridge } from "@shopify/app-bridge-react";
import { CommonBundleVisibilityOverview } from "../_shared/bundle-configure/CommonBundleVisibilityOverview";
import { SpecificLinkOfferSection } from "../shared/SpecificLinkOfferSection";
import { OfferOperationsSection } from "../shared/OfferOperationsSection";
import { CountryTargetingSection } from "../shared/CountryTargetingSection";
import type { PpbConfigureFlow } from "./usePpbConfigureFlow";

type PpbBundleVisibilityFlowProps = Pick<
  PpbConfigureFlow,
  | "activeSection"
  | "appEmbedEnabled"
  | "copySpecificLinkOffer"
  | "generatedSpecificLink"
  | "generateSpecificLinkOffer"
  | "handleSectionChange"
  | "offerDeliveryState"
  | "openThemeEditorForAppEmbed"
  | "revokeSpecificLinkOffer"
  | "setCountryCodes"
  | "setCountryTargetingEnabled"
  | "setCountryTargetingMode"
  | "setOfferEndsAt"
  | "setOfferPriority"
  | "setOfferRecurrenceAnchorDate"
  | "setOfferRecurrenceEndsOn"
  | "setOfferRecurrenceFrequency"
  | "setOfferRecurrenceRunCount"
  | "setOfferRecurrenceTermination"
  | "setOfferRecurrenceWindowEnd"
  | "setOfferRecurrenceWindowStart"
  | "setOfferScheduleMode"
  | "setOfferStartsAt"
  | "setOfferStopLowerPriority"
  | "setSpecificLinkOfferEnabled"
  | "shop"
  | "specificLinkOfferBusy"
  | "themeEditorUrl"
>;

export type PpbBundleVisibilitySectionProps =
  PpbBundleVisibilityFlowProps & {
    bundle: Pick<PpbConfigureFlow["bundle"], "shopifyProductHandle">;
  };

export function PpbBundleVisibilitySection({
  activeSection,
  appEmbedEnabled,
  bundle,
  copySpecificLinkOffer,
  generatedSpecificLink,
  generateSpecificLinkOffer,
  handleSectionChange,
  offerDeliveryState,
  openThemeEditorForAppEmbed,
  revokeSpecificLinkOffer,
  setCountryCodes,
  setCountryTargetingEnabled,
  setCountryTargetingMode,
  setOfferEndsAt,
  setOfferPriority,
  setOfferRecurrenceAnchorDate,
  setOfferRecurrenceEndsOn,
  setOfferRecurrenceFrequency,
  setOfferRecurrenceRunCount,
  setOfferRecurrenceTermination,
  setOfferRecurrenceWindowEnd,
  setOfferRecurrenceWindowStart,
  setOfferScheduleMode,
  setOfferStartsAt,
  setOfferStopLowerPriority,
  setSpecificLinkOfferEnabled,
  shop,
  specificLinkOfferBusy,
  themeEditorUrl,
}: PpbBundleVisibilitySectionProps) {
  const shopify = useAppBridge();
  const link = buildBundleLinkModel({
    bundleType: "product_page",
    shop,
    productHandle: bundle.shopifyProductHandle,
  });

  return (
    <div data-tour-target="ppb-bundle-visibility">
      <s-stack direction="block" gap="base">
        {CommonBundleVisibilityOverview({
          active: activeSection === "bundle_visibility",
          embedStatus: buildEmbedStatusModel(
            "product_page",
            appEmbedEnabled
          ),
          link,
          onCopyLink: () => {
            void navigator.clipboard?.writeText(link.url);
            shopify.toast.show("Bundle link copied", {
              isError: false,
            });
          },
          onEnableEmbed: openThemeEditorForAppEmbed,
          placementOptions: [
            {
              title: "Bundle Widget",
              description:
                "Show an upsell button or block on selected product pages.",
              actionLabel: "Set up Bundle Widget",
              variant: "primary",
              onAction: () => handleSectionChange("bundle_widget"),
            },
            {
              title: "Bundle Embed",
              description:
                "Place the bundle builder directly on selected product pages.",
              actionLabel: "Set up Bundle Embed",
              variant: "secondary",
              onAction: () => handleSectionChange("bundle_embed"),
            },
          ],
          themeEditorUrl,
        })}
        <SpecificLinkOfferSection
          active={activeSection === "bundle_visibility"}
          busy={specificLinkOfferBusy}
          generatedLink={generatedSpecificLink}
          state={offerDeliveryState}
          onEnabledChange={setSpecificLinkOfferEnabled}
          onGenerate={generateSpecificLinkOffer}
          onCopy={copySpecificLinkOffer}
          onRevoke={revokeSpecificLinkOffer}
        />
        <OfferOperationsSection
          active={activeSection === "bundle_visibility"}
          state={offerDeliveryState}
          onPriorityChange={setOfferPriority}
          onStopLowerPriorityChange={setOfferStopLowerPriority}
          onScheduleModeChange={setOfferScheduleMode}
          onStartsAtChange={setOfferStartsAt}
          onEndsAtChange={setOfferEndsAt}
          onRecurrenceFrequencyChange={setOfferRecurrenceFrequency}
          onRecurrenceAnchorDateChange={setOfferRecurrenceAnchorDate}
          onRecurrenceWindowStartChange={setOfferRecurrenceWindowStart}
          onRecurrenceWindowEndChange={setOfferRecurrenceWindowEnd}
          onRecurrenceTerminationChange={setOfferRecurrenceTermination}
          onRecurrenceEndsOnChange={setOfferRecurrenceEndsOn}
          onRecurrenceRunCountChange={setOfferRecurrenceRunCount}
        />
        <CountryTargetingSection
          active={activeSection === "bundle_visibility"}
          state={offerDeliveryState}
          onEnabledChange={setCountryTargetingEnabled}
          onModeChange={setCountryTargetingMode}
          onCountryCodesChange={setCountryCodes}
        />
      </s-stack>
    </div>
  );
}
