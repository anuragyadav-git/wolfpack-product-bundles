import {
  getDefaultSellingPlanId,
  getDisplayedSellingPlanId,
  isPurchaseOptionSelected,
  resolveCompactPlanSupportingCopy,
  resolvePurchaseOptionsMounts,
} from "../../../app/assets/widgets/shared/components/purchase-options";

describe("shared FPB and PPB purchase options", () => {
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

  it("keeps a plan mounted in the subscription card while one-time is selected", () => {
    const plans = [{ id: "gid://shopify/SellingPlan/1" }, { id: "gid://shopify/SellingPlan/2" }];
    expect(getDisplayedSellingPlanId(null, plans)).toBe("gid://shopify/SellingPlan/1");
    expect(getDisplayedSellingPlanId("gid://shopify/SellingPlan/2", plans)).toBe("gid://shopify/SellingPlan/2");
  });

  it("renders one compact supporting line without duplicating plan copy", () => {
    expect(resolveCompactPlanSupportingCopy({
      displayName: "Deliver every month, 10% off",
      description: "Delivered every month",
    })).toBe("Delivered every month");
    expect(resolveCompactPlanSupportingCopy({
      displayName: "Deliver every month, 10% off",
      description: "",
    })).toBe("Deliver every month, 10% off");
  });

  it("keeps every unique registered summary mount in a stable order", () => {
    const desktop = { id: "desktop" } as unknown as Element;
    const mobile = { id: "mobile" } as unknown as Element;
    const stale = { id: "stale", isConnected: false } as unknown as Element;

    expect(resolvePurchaseOptionsMounts({
      desktop,
      mobile,
      duplicateDesktop: desktop,
      stale,
      unavailable: null,
    })).toEqual([desktop, mobile]);
  });
});
