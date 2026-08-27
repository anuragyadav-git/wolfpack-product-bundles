import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommonConfigureSidebar } from "../../../app/routes/app/_shared/bundle-configure/CommonConfigureSidebar";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const styles = new Proxy({}, {
  get: (_target, property) => String(property),
});

function renderSidebar(parentProductStatusUi: {
  isLoading: boolean;
  label: "Unlisted" | null;
  tone: "warning" | null;
  showUnlistedBanner: boolean;
}) {
  return renderToStaticMarkup(
    React.createElement(CommonConfigureSidebar, {
      adapter: {
        activeSection: "step_setup",
        appEmbedEnabled: true,
        bundle: {},
        bundleProduct: null,
        bundleSetupItems: [],
        bundleVisibilityChildItems: [],
        formState: { bundleName: "Bundle" },
        handleBundleProductSelect: jest.fn(),
        handleSectionChange: jest.fn(),
        handleSyncProduct: jest.fn(),
        openProductInAdmin: jest.fn(),
        openSelectTemplateModal: jest.fn(),
        parentProductStatusUi,
        pricingState: { discountEnabled: false, discountType: "" },
        productMenuOpen: false,
        setProductMenuOpen: jest.fn(),
        styles,
        VisibilityBadge: () => React.createElement("span"),
      },
    }),
  );
}

describe("Parent Product status loading", () => {
  it("shows a native inline spinner without a fallback badge while loading", () => {
    const view = renderSidebar({
      isLoading: true,
      label: null,
      tone: null,
      showUnlistedBanner: false,
    });

    expect(view).toContain("Parent Product Status");
    expect(view).toContain("<s-spinner");
    expect(view).toContain("common.parentProductStatus.loadingTitle");
    expect(view).not.toContain("<s-badge");
    expect(view).not.toContain("Unknown");
  });

  it("shows the Unlisted badge after the shared status resolves", () => {
    const view = renderSidebar({
      isLoading: false,
      label: "Unlisted",
      tone: "warning",
      showUnlistedBanner: true,
    });

    expect(view).toContain("<s-badge");
    expect(view).toContain("Unlisted");
    expect(view).not.toContain("<s-spinner");
  });
});
