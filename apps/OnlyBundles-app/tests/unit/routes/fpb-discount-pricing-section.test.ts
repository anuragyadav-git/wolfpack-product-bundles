import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DiscountPricingSection } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingSection";

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules",
  () => ({
    FpbDiscountRulesSection: () => React.createElement("div", null, "rules"),
  })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountDisplayOptions",
  () => ({
    FpbDiscountDisplayOptions: () =>
      React.createElement("div", null, "display options"),
  })
);

describe("DiscountPricingSection", () => {
  it("renders nothing when another configure section is active", () => {
    const view = renderToStaticMarkup(
      React.createElement(DiscountPricingSection, {
        activeSection: "step_setup",
        rules: {} as never,
        displayOptions: {} as never,
      })
    );

    expect(view).toBe("");
  });

  it("composes rules and display options from feature props", () => {
    const view = renderToStaticMarkup(
      React.createElement(DiscountPricingSection, {
        activeSection: "discount_pricing",
        rules: {} as never,
        displayOptions: {} as never,
      })
    );

    expect(view).toContain("rules");
    expect(view).toContain("display options");
  });
});
