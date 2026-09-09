import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  PpbDiscountPricingSection,
  type PpbDiscountPricingSectionProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountPricingSection";

const mockRules = jest.fn<unknown, [Record<string, unknown>]>(() => null);
const mockDisplay = jest.fn<unknown, [Record<string, unknown>]>(() => null);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel",
  () => ({
    PpbDiscountRulesPanel: (props: Record<string, unknown>) => mockRules(props),
  }),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountDisplayOptions",
  () => ({
    PpbDiscountDisplayOptions: (props: Record<string, unknown>) =>
      mockDisplay(props),
  }),
);
describe("PPB Discount and Pricing composition boundary", () => {
  it("delegates named feature contracts without reading route context", () => {
    const rules = { pricingState: { discountRules: [] } };
    const display = { displayOptionsInactive: false };
    const props = {
      activeSection: "discount_pricing",
      display,
      rules,
    } as unknown as PpbDiscountPricingSectionProps;

    renderToStaticMarkup(
      React.createElement(PpbDiscountPricingSection, props),
    );

    expect(mockRules).toHaveBeenCalledWith(rules);
    expect(mockDisplay).toHaveBeenCalledWith(display);
  });
});
