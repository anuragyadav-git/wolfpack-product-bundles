import {
  buildBundleLinkModel,
  buildEmbedStatusModel,
} from "../../../lib/bundle-config/common-configure-page-model";
import { CommonBundleVisibilityOverview } from "../_shared/bundle-configure/CommonBundleVisibilityOverview";
import { usePpbConfigureContext } from "./PpbConfigureContext";

export function PpbBundleVisibilitySection() {
  const flow = usePpbConfigureContext();
  const link = buildBundleLinkModel({
    bundleType: "product_page",
    shop: flow.shop,
    productHandle: flow.bundle.shopifyProductHandle,
  });

  return (
    <div data-tour-target="ppb-bundle-visibility">
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
    </div>
  );
}
