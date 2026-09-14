import { useAppBridge } from "@shopify/app-bridge-react";
import {
  buildBundleLinkModel,
  buildEmbedStatusModel,
} from "../../../../lib/bundle-config/common-configure-page-model";
import { CommonBundleVisibilityOverview } from "../../_shared/bundle-configure/CommonBundleVisibilityOverview";

export interface FpbBundleVisibilityPanelProps {
  activeSection: string;
  appEmbedEnabled: boolean;
  bundlePageUrl: string;
  handleSectionChange: (section: string) => void;
  openThemeEditorForAppEmbed: () => void;
  themeEditorUrl: string | null;
}

export function FpbBundleVisibilityPanel({
  activeSection,
  appEmbedEnabled,
  bundlePageUrl,
  handleSectionChange,
  openThemeEditorForAppEmbed,
  themeEditorUrl,
}: FpbBundleVisibilityPanelProps) {
  const shopify = useAppBridge();
  const link = buildBundleLinkModel({
    bundleType: "full_page",
    fullPageUrl: bundlePageUrl,
  });

  return CommonBundleVisibilityOverview({
    active: activeSection === "bundle_visibility",
    embedStatus: buildEmbedStatusModel("full_page", appEmbedEnabled),
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
    ],
    themeEditorUrl,
  });
}
