import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {BundleSettingsSection} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSection";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts",
  () => ({
    FpbDefaultProductsSettings: () =>
      React.createElement("span", null, "default-products"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity",
  () => ({
    FpbQuantitySettings: () => React.createElement("span", null, "quantity"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText",
  () => ({
    FpbSummaryTextSettings: () =>
      React.createElement("span", null, "summary-text"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsBundleCart",
  () => ({
    FpbBundleCartSettings: () =>
      React.createElement("span", null, "bundle-cart"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsTemplate",
  () => ({
    FpbBundleTemplateSettings: () =>
      React.createElement("span", null, "template"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsTimeline",
  () => ({
    FpbTimelineSettings: () => React.createElement("span", null, "timeline"),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss",
  () => ({
    FpbBundleCssSettings: () => React.createElement("span", null, "css"),
  }),
);

const featureProps = {
  bundleCart: {},
  css: {},
  defaultProducts: {},
  quantity: {},
  summaryText: {},
  template: {},
  timeline: {},
} as any;

describe("BundleSettingsSection", () => {
  it("renders nothing outside the Bundle Settings section", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleSettingsSection, {
        activeSection: "step_setup",
        ...featureProps,
      }),
    );

    expect(view).toBe("");
  });

  it("composes every Bundle Settings feature while active", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleSettingsSection, {
        activeSection: "bundle_settings",
        ...featureProps,
      }),
    );

    expect(view).toContain("default-products");
    expect(view).toContain("quantity");
    expect(view).toContain("summary-text");
    expect(view).toContain("bundle-cart");
    expect(view).toContain("template");
    expect(view).toContain("timeline");
    expect(view).toContain("css");
  });
});
