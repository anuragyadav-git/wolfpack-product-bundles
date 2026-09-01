import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.css",
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

describe("PPB compare-at price setting control", () => {
  it("does not expose a compare-at visibility control", () => {
    const markup = renderToStaticMarkup(createElement(PpbBundleSettingsControls));

    expect(markup).not.toContain("Show Compare At Price");
  });
});
