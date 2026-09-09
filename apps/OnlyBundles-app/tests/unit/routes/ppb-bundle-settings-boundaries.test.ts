import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleStatus } from "../../../app/constants/bundle";
import { PpbBundleStatusCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleStatusCard";
import { PpbBundleBannerSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.banner";
import { PpbBundleLevelCssSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.bundleCss";
import { PpbCategoryStepSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.categorySteps";
import { PpbCountdownSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.countdown";
import { PpbCartDiscountDisplaySettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.discount";
import { PpbDefaultProductsSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts";
import { PpbQuantitySettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity";
import { PpbStickyAddToCartSettings } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.stickyAddToCart";

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({
    resourcePicker: jest.fn(),
    saveBar: { leaveConfirmation: jest.fn() },
  }),
}));

jest.mock("@remix-run/react", () => ({
  useNavigate: () => jest.fn(),
}));

describe("PPB bundle settings leaf boundaries", () => {
  it("renders status, CSS, category-step, and sticky-cart values from explicit props", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(PpbBundleStatusCard, {
          status: BundleStatus.ACTIVE,
          onChange: jest.fn(),
        }),
        React.createElement(PpbBundleLevelCssSettings, {
          bundleLevelCss: "merchant-css-draft",
          bundleLevelCssExpanded: true,
          markAsDirty: jest.fn(),
          setBundleLevelCss: jest.fn(),
          setBundleLevelCssExpanded: jest.fn(),
        }),
        React.createElement(PpbCategoryStepSettings, {
          markAsDirty: jest.fn(),
          setUseSingleStepCategoriesAsBundleSteps: jest.fn(),
          useSingleStepCategoriesAsBundleSteps: true,
        }),
        React.createElement(PpbStickyAddToCartSettings, {
          markAsDirty: jest.fn(),
          setStickyAddToCartAction: jest.fn(),
          setStickyAddToCartEnabled: jest.fn(),
          setStickyAddToCartShowDesktop: jest.fn(),
          setStickyAddToCartShowMobile: jest.fn(),
          stickyAddToCartAction: "add_selected_offer",
          stickyAddToCartEnabled: true,
          stickyAddToCartShowDesktop: true,
          stickyAddToCartShowMobile: false,
        }),
      ),
    );

    expect(view).toContain('value="active"');
    expect(view).toContain("merchant-css-draft");
    expect(view).toContain("Use categories as bundle steps");
    expect(view).toContain('value="add_selected_offer"');
  });

  it("renders the remaining setting owners from explicit feature props", () => {
    const view = renderToStaticMarkup(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(PpbBundleBannerSettings, {
          bundleBannerDesktopUrl: "https://cdn.test/desktop.jpg",
          bundleBannerMobileUrl: "",
          markAsDirty: jest.fn(),
          setBundleBannerDesktopUrl: jest.fn(),
          setBundleBannerMobileUrl: jest.fn(),
        }),
        React.createElement(PpbCountdownSettings, {
          countdownEnabled: true,
          countdownExpiredMessage: "Offer ended",
          countdownExpiryAction: "show_message",
          countdownLayout: "compact",
          countdownPosition: "above",
          countdownTitle: "Ends soon",
          markAsDirty: jest.fn(),
          scheduledEndsAt: null,
          setCountdownEnabled: jest.fn(),
          setCountdownExpiredMessage: jest.fn(),
          setCountdownExpiryAction: jest.fn(),
          setCountdownLayout: jest.fn(),
          setCountdownPosition: jest.fn(),
          setCountdownTitle: jest.fn(),
        }),
        React.createElement(PpbDefaultProductsSettings, {
          clearValidationError: jest.fn(),
          defaultProductsData: {
            isDefaultProductsEnabled: false,
            defaultProductsTitle: "",
            products: [],
          },
          markAsDirty: jest.fn(),
          setDefaultProductsData: jest.fn(),
          validationErrors: {},
        }),
        React.createElement(PpbCartDiscountDisplaySettings, {
          markAsDirty: jest.fn(),
          setTextOverrides: jest.fn(),
          textOverrides: {},
        }),
        React.createElement(PpbQuantitySettings, {
          clearValidationError: jest.fn(),
          lowStockAlertEnabled: false,
          lowStockAlertMessage: "Only {{stock}} left",
          lowStockAlertThreshold: "5",
          markAsDirty: jest.fn(),
          maxQtyPerProduct: "1",
          quantityValidationEnabled: false,
          setLowStockAlertEnabled: jest.fn(),
          setLowStockAlertMessage: jest.fn(),
          setLowStockAlertThreshold: jest.fn(),
          setMaxQtyPerProduct: jest.fn(),
          setQuantityValidationEnabled: jest.fn(),
          setVariantSelectorEnabled: jest.fn(),
          validationErrors: {},
          variantSelectorEnabled: true,
        }),
      ),
    );

    expect(view).toContain("https://cdn.test/desktop.jpg");
    expect(view).toContain("Ends soon");
    expect(view).toContain("Default products title");
    expect(view).toContain("Edit Defaults");
    expect(view).toContain("Maximum allowed quantity per product");
  });
});
