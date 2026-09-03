import { DiscountMethod } from "../../../app/types/pricing";
import { getDiscountPricingStatusBadge } from "../../../app/routes/app/_shared/bundle-configure/CommonConfigureSidebar";

describe("Admin Discount & Pricing navigation badge", () => {
  it("shows None when discounts are disabled", () => {
    expect(getDiscountPricingStatusBadge(false, DiscountMethod.PERCENTAGE_OFF)).toEqual({
      label: "None",
    });
  });

  it.each([
    [DiscountMethod.PERCENTAGE_OFF, "% off"],
    [DiscountMethod.FIXED_AMOUNT_OFF, "$ off"],
    [DiscountMethod.FIXED_BUNDLE_PRICE, "fixed"],
    [DiscountMethod.BUY_X_GET_Y, "BXGY"],
  ])("shows the configured %s method with a success tone", (discountType, label) => {
    expect(getDiscountPricingStatusBadge(true, discountType)).toEqual({
      label,
      tone: "success",
    });
  });

  it("does not show an incorrect badge for an unsupported method", () => {
    expect(getDiscountPricingStatusBadge(true, "unsupported")).toBeNull();
  });
});
