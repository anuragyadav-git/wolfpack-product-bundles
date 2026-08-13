import {
  buildPublicPpbSubscriptionConfig,
  normalizePpbSubscriptionConfig,
  validatePpbSubscriptionConfig,
} from "../../../app/lib/ppb-subscriptions";

const validConfig = {
  version: 1,
  enabled: true,
  selectedGroup: {
    id: "gid://shopify/SellingPlanGroup/1",
    name: "Subscribe",
    options: ["Delivery every"],
    plans: [{
      id: "gid://shopify/SellingPlan/1",
      sourceName: "Monthly",
      options: ["Month"],
      position: 1,
      pricingPolicies: [],
    }],
  },
  selectedPlanIds: ["gid://shopify/SellingPlan/1"],
  defaultPurchaseOption: {
    kind: "selling_plan",
    sellingPlanId: "gid://shopify/SellingPlan/1",
  },
  oneTimePurchase: { enabled: true, title: "One time", description: "" },
  copy: { title: "Purchase options", subtitle: "", unavailableMessage: "Unavailable" },
  planCopy: {
    "gid://shopify/SellingPlan/1": {
      displayName: "Monthly",
      discountPill: "",
      description: "",
    },
  },
  showDiscountOnProductCards: false,
  recurringBundleDiscount: false,
  translations: {},
};

describe("PPB subscription configuration behavior", () => {
  it("preserves a valid provider-neutral plan selection for storefront sync", () => {
    expect(validatePpbSubscriptionConfig(validConfig)).toEqual([]);
    const publicConfig = buildPublicPpbSubscriptionConfig(validConfig);
    expect(publicConfig).toMatchObject({
      enabled: true,
      selectedPlanIds: ["gid://shopify/SellingPlan/1"],
    });
    expect(publicConfig?.selectedGroup?.plans[0]).not.toHaveProperty("position");
  });

  it("preserves disabled draft values but omits subscription behavior publicly", () => {
    const disabled = normalizePpbSubscriptionConfig({ ...validConfig, enabled: false });

    expect(disabled.selectedPlanIds).toEqual(["gid://shopify/SellingPlan/1"]);
    expect(buildPublicPpbSubscriptionConfig(disabled)).toBeNull();
  });

  it("rejects an enabled selection when its default plan is no longer selected", () => {
    const issues = validatePpbSubscriptionConfig({
      ...validConfig,
      selectedPlanIds: [],
    });

    expect(issues.map((issue) => issue.path)).toEqual(expect.arrayContaining([
      "subscriptions.selectedPlanIds",
      "subscriptions.defaultPurchaseOption",
    ]));
  });
});
