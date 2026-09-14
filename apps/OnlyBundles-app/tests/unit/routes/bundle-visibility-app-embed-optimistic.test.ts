import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ConfigureSidebar } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureSidebar";
import { FpbBundleVisibilityPanel } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleVisibilityPanel";
import {
  PpbBundleVisibilitySection,
  type PpbBundleVisibilitySectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleVisibilitySection";
import { openThemeEditorInNewTab } from "../../../app/lib/theme-editor-navigation.client";

const mockFpbToastShow = jest.fn();

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({toast: {show: mockFpbToastShow}}),
}));

jest.mock("../../../app/lib/theme-editor-navigation.client", () => ({
  openThemeEditorInNewTab: jest.fn(),
}));

function findElementByText(
  node: React.ReactNode,
  text: string,
): React.ReactElement | null {
  if (!React.isValidElement(node)) return null;
  const children = React.Children.toArray(node.props.children);
  if (children.some((child) => child === text)) return node;
  for (const child of children) {
    const match = findElementByText(child, text);
    if (match) return match;
  }
  return null;
}

const visibilityStyles = new Proxy({}, {
  get: (_target, property) => String(property),
});

function makeFpbProps(overrides: Record<string, unknown> = {}) {
  return {
    activeSection: "bundle_visibility",
    appEmbedEnabled: false,
    bundlePageUrl: "https://shop.test/apps/product-bundles/wpb/bundle-1",
    handleSectionChange: jest.fn(),
    openThemeEditorForAppEmbed: jest.fn(),
    themeEditorUrl: "https://theme-editor.test",
    ...overrides,
  };
}

function makePpbProps(
  overrides: Partial<PpbBundleVisibilitySectionProps> = {},
): PpbBundleVisibilitySectionProps {
  return {
    activeSection: "bundle_visibility",
    appEmbedEnabled: false,
    bundle: { shopifyProductHandle: "bundle-product" },
    copySpecificLinkOffer: jest.fn(),
    generatedSpecificLink: "",
    generateSpecificLinkOffer: jest.fn(),
    handleSectionChange: jest.fn(),
    offerDeliveryState:
      {} as unknown as PpbBundleVisibilitySectionProps["offerDeliveryState"],
    openThemeEditorForAppEmbed: jest.fn(),
    revokeSpecificLinkOffer: jest.fn(),
    setCountryCodes: jest.fn(),
    setCountryTargetingEnabled: jest.fn(),
    setCountryTargetingMode: jest.fn(),
    setOfferEndsAt: jest.fn(),
    setOfferPriority: jest.fn(),
    setOfferRecurrenceAnchorDate: jest.fn(),
    setOfferRecurrenceEndsOn: jest.fn(),
    setOfferRecurrenceFrequency: jest.fn(),
    setOfferRecurrenceRunCount: jest.fn(),
    setOfferRecurrenceTermination: jest.fn(),
    setOfferRecurrenceWindowEnd: jest.fn(),
    setOfferRecurrenceWindowStart: jest.fn(),
    setOfferScheduleMode: jest.fn(),
    setOfferStartsAt: jest.fn(),
    setOfferStopLowerPriority: jest.fn(),
    setSpecificLinkOfferEnabled: jest.fn(),
    shop: "shop.test",
    specificLinkOfferBusy: false,
    themeEditorUrl: "https://theme-editor.test",
    ...overrides,
  };
}

describe("Bundle Visibility app embed optimistic status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("FPB uses the shared optimistic enable handler without revalidating on render", () => {
    const props = makeFpbProps();
    const checkAppEmbedStatusBeforePreview = jest.fn();
    const element = FpbBundleVisibilityPanel(props as any);

    expect(checkAppEmbedStatusBeforePreview).not.toHaveBeenCalled();

    findElementByText(element, "Enable Here")?.props.onClick();

    expect(props.openThemeEditorForAppEmbed).toHaveBeenCalledTimes(1);
    expect(openThemeEditorInNewTab).not.toHaveBeenCalled();
  });

  it("PPB uses the shared optimistic enable handler without revalidating on render", () => {
    const props = makePpbProps();
    const checkAppEmbedStatusBeforePreview = jest.fn();
    const element = PpbBundleVisibilitySection(props);

    expect(checkAppEmbedStatusBeforePreview).not.toHaveBeenCalled();

    findElementByText(element, "Enable Here")?.props.onClick();

    expect(props.openThemeEditorForAppEmbed).toHaveBeenCalledTimes(1);
    expect(openThemeEditorInNewTab).not.toHaveBeenCalled();
  });

  it("FPB sidebar marks Bundle Visibility optimised from optimistic app embed state", () => {
    const html = renderToStaticMarkup(
      React.createElement(ConfigureSidebar, {
        activeSection: "step_setup",
        appEmbedEnabled: true,
        bundle: { bundleType: "full_page" },
        bundleProduct: null,
        formState: { bundleName: "Bundle" },
        handleBundleProductSelect: jest.fn(),
        handleSectionChange: jest.fn(),
        handleSyncProduct: jest.fn(),
        openProductInAdmin: jest.fn(),
        openSelectTemplateModal: jest.fn(),
        parentProductStatusUi: { tone: "success", label: "Active" },
        pricingState: { discountEnabled: false },
        productImageUrl: null,
        productTitle: "Bundle",
        selectTemplateOpenButtonRef: { current: null },
        styles: visibilityStyles,
      } as any),
    );

    expect(html).toContain("Optimised");
    expect(html).not.toContain("Pending");
  });
});
