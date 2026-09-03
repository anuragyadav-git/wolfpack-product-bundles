import {
  buildPublicBundleSubscriptionConfig,
  normalizeBundleSubscriptionConfig,
  validateBundleSubscriptionConfig,
} from "../../../app/lib/bundle-subscriptions";

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

describe("bundle subscription configuration behavior", () => {
  it("preserves a valid provider-neutral plan selection for storefront sync", () => {
    expect(validateBundleSubscriptionConfig(validConfig)).toEqual([]);
    const publicConfig = buildPublicBundleSubscriptionConfig(validConfig);
    expect(publicConfig).toMatchObject({
      enabled: true,
      selectedPlanIds: ["gid://shopify/SellingPlan/1"],
    });
    expect(publicConfig?.selectedGroup?.plans[0]).toHaveProperty("position", 1);
  });

  it("preserves disabled draft values but omits subscription behavior publicly", () => {
    const disabled = normalizeBundleSubscriptionConfig({ ...validConfig, enabled: false });

    expect(disabled.selectedPlanIds).toEqual(["gid://shopify/SellingPlan/1"]);
    expect(buildPublicBundleSubscriptionConfig(disabled)).toBeNull();
  });

  it("rejects an enabled selection when its default plan is no longer selected", () => {
    const issues = validateBundleSubscriptionConfig({
      ...validConfig,
      selectedPlanIds: [],
    });

    expect(issues.map((issue) => issue.path)).toEqual(expect.arrayContaining([
      "subscriptions.selectedPlanIds",
      "subscriptions.defaultPurchaseOption",
    ]));
  });
});
