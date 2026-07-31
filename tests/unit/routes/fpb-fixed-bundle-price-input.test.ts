import { fixedBundlePriceInputToCents } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules";

describe("fixedBundlePriceInputToCents", () => {
  it.each([
    ["1000", 100_000],
    ["1000.25", 100_025],
    ["", 0],
  ])("converts %p to canonical cents", (input, expected) => {
    expect(fixedBundlePriceInputToCents(input)).toBe(expected);
  });
});
