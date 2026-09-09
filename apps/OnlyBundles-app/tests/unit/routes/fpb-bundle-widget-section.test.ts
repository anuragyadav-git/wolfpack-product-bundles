import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {BundleWidgetSection} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection";

jest.mock(
  "../../../app/routes/app/_shared/bundle-configure/CommonBundleWidgetSection",
  () => ({
    CommonBundleWidgetSection: () =>
      React.createElement("span", null, "bundle-widget"),
  }),
);
jest.mock("../../../app/components/shared/AssetUpload", () => ({
  AssetUpload: () => null,
}));

describe("BundleWidgetSection", () => {
  it("renders nothing outside the Bundle Widget section", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleWidgetSection, {
        activeSection: "step_setup",
        widget: {},
      } as any),
    );

    expect(view).toBe("");
  });

  it("renders the shared widget feature while active", () => {
    const view = renderToStaticMarkup(
      React.createElement(BundleWidgetSection, {
        activeSection: "bundle_widget",
        widget: {},
      } as any),
    );

    expect(view).toContain("bundle-widget");
  });
});
