import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BundleStatus } from "../../../app/constants/bundle";

import { PpbBundleSettingsControls } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls";

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleStatusCard",
  () => ({ PpbBundleStatusCard: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.banner",
  () => ({ PpbBundleBannerSettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.categorySteps",
  () => ({ PpbCategoryStepSettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.bundleCss",
  () => ({ PpbBundleLevelCssSettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.discount",
  () => ({ PpbCartDiscountDisplaySettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts",
  () => ({ PpbDefaultProductsSettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity",
  () => ({ PpbQuantitySettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.stickyAddToCart",
  () => ({ PpbStickyAddToCartSettings: () => createElement("span") }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.countdown",
  () => ({ PpbCountdownSettings: () => createElement("span") }),
);

describe("PPB compare-at price setting control", () => {
  it("does not expose a compare-at visibility control", () => {
    const view = renderToStaticMarkup(createElement(PpbBundleSettingsControls, {
      banner: {
        bundleBannerDesktopUrl: "",
        bundleBannerMobileUrl: "",
        markAsDirty: jest.fn(),
        setBundleBannerDesktopUrl: jest.fn(),
        setBundleBannerMobileUrl: jest.fn(),
      },
      bundleLevelCss: {
        bundleLevelCss: "",
        bundleLevelCssExpanded: false,
        markAsDirty: jest.fn(),
        setBundleLevelCss: jest.fn(),
        setBundleLevelCssExpanded: jest.fn(),
      },
      categorySteps: {
        markAsDirty: jest.fn(),
        setUseSingleStepCategoriesAsBundleSteps: jest.fn(),
        useSingleStepCategoriesAsBundleSteps: false,
      },
      countdown: {
        countdownEnabled: false,
        countdownExpiredMessage: "",
        countdownExpiryAction: "hide",
        countdownLayout: "compact",
        countdownPosition: "above",
        countdownTitle: "",
        markAsDirty: jest.fn(),
        scheduledEndsAt: null,
        setCountdownEnabled: jest.fn(),
        setCountdownExpiredMessage: jest.fn(),
        setCountdownExpiryAction: jest.fn(),
        setCountdownLayout: jest.fn(),
        setCountdownPosition: jest.fn(),
        setCountdownTitle: jest.fn(),
      },
      defaultProducts: {
        clearValidationError: jest.fn(),
        defaultProductsData: {
          isDefaultProductsEnabled: false,
          defaultProductsTitle: "",
          products: [],
        },
        markAsDirty: jest.fn(),
        setDefaultProductsData: jest.fn(),
        validationErrors: {},
      },
      discountDisplay: {
        markAsDirty: jest.fn(),
        setTextOverrides: jest.fn(),
        textOverrides: {},
      },
      quantity: {
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
      },
      status: {
        status: BundleStatus.DRAFT,
        onChange: jest.fn(),
      },
      stickyAddToCart: {
        markAsDirty: jest.fn(),
        setStickyAddToCartAction: jest.fn(),
        setStickyAddToCartEnabled: jest.fn(),
        setStickyAddToCartShowDesktop: jest.fn(),
        setStickyAddToCartShowMobile: jest.fn(),
        stickyAddToCartAction: "scroll_to_offers",
        stickyAddToCartEnabled: false,
        stickyAddToCartShowDesktop: true,
        stickyAddToCartShowMobile: true,
      },
    }));

    expect(view).not.toContain("Show Compare At Price");
  });
});
