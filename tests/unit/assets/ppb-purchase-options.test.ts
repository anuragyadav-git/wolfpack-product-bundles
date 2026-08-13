import {
  getDefaultSellingPlanId,
  isPurchaseOptionSelected,
} from "../../../app/assets/widgets/shared/components/purchase-options";

describe("PPB purchase options", () => {
  it("selects the saved selling-plan default", () => {
    const planId = "gid://shopify/SellingPlan/1";

    expect(getDefaultSellingPlanId({
      defaultPurchaseOption: { kind: "selling_plan", sellingPlanId: planId },
    })).toBe(planId);
    expect(isPurchaseOptionSelected("subscription", planId)).toBe(true);
    expect(isPurchaseOptionSelected("one_time", planId)).toBe(false);
  });

  it("selects one-time only when no selling plan is active", () => {
    expect(isPurchaseOptionSelected("one_time", null)).toBe(true);
    expect(isPurchaseOptionSelected("subscription", null)).toBe(false);
  });
});
