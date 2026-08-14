import {
  applySellingPlanPricingPolicies,
  buildBundlePurchaseOptionPresentation,
  buildPublicBundleSubscriptionConfig,
  getBundleSubscriptionCompatibilityIssues,
  getDefaultPurchaseOptionFromOneTimeToggle,
  normalizeBundleSubscriptionConfig,
  resolveLocalizedSubscriptionCopy,
  reconcileBundleSubscriptionPlanDiscovery,
  shouldApplyBundleDiscount,
  supportsBundleSubscriptions,
  validateBundleSubscriptionConfig,
} from "../../../app/lib/bundle-subscriptions";

const config = {
  version: 1 as const,
  enabled: true,
  selectedGroup: {
    id: "gid://shopify/SellingPlanGroup/1",
    name: "Subscribe and save",
    options: ["Delivery every"],
    plans: [{
      id: "gid://shopify/SellingPlan/11",
      sourceName: "Monthly",
      options: ["1 month"],
      position: 1,
      pricingPolicies: [{ kind: "percentage" as const, value: 10, afterCycle: 0 }],
    }],
  },
  selectedPlanIds: ["gid://shopify/SellingPlan/11"],
  defaultPurchaseOption: { kind: "selling_plan" as const, sellingPlanId: "gid://shopify/SellingPlan/11" },
  oneTimePurchase: { enabled: true, title: "One-time purchase", description: "Pay once" },
  copy: { title: "Purchase options", subtitle: "Choose how often", unavailableMessage: "This option is no longer available" },
  planCopy: {
    "gid://shopify/SellingPlan/11": { displayName: "Monthly delivery", discountPill: "Save 10%", description: "Delivered monthly" },
  },
  showDiscountOnProductCards: true,
  recurringBundleDiscount: false,
  bundleDiscountAppliesOn: "both" as const,
  translations: {
    fr: {
      title: "Options d'achat",
      oneTimePurchaseTitle: "Achat unique",
      planCopy: {
        "gid://shopify/SellingPlan/11": {
          displayName: "Livraison mensuelle",
          discountPill: "Economisez 10%",
          description: "Livre chaque mois",
        },
      },
    },
    "fr-CA": { subtitle: "Choisissez une fréquence" },
  },
};

describe("bundle subscription config", () => {
  it("normalizes a valid V1 config and removes unknown plan copy", () => {
    const normalized = normalizeBundleSubscriptionConfig({
      ...config,
      selectedPlanIds: [config.selectedPlanIds[0], config.selectedPlanIds[0]],
      planCopy: { ...config.planCopy, stale: { displayName: "Stale", discountPill: "", description: "" } },
    });
    expect(normalized.selectedPlanIds).toEqual(config.selectedPlanIds);
    expect(normalized.planCopy).toEqual(config.planCopy);
  });

  it("deduplicates duplicate plan IDs from both selected plans and plan rows", () => {
    const duplicatePlan = { ...config.selectedGroup.plans[0], id: "gid://shopify/SellingPlan/12", sourceName: "Alternate" };
    const normalized = normalizeBundleSubscriptionConfig({
      ...config,
      selectedGroup: {
        ...config.selectedGroup,
        plans: [
          config.selectedGroup.plans[0],
          config.selectedGroup.plans[0],
          duplicatePlan,
          duplicatePlan,
        ],
      },
      selectedPlanIds: [
        config.selectedPlanIds[0],
        config.selectedPlanIds[0],
        "gid://shopify/SellingPlan/12",
        "gid://shopify/SellingPlan/12",
      ],
      planCopy: {
        ...config.planCopy,
        "gid://shopify/SellingPlan/12": { displayName: "Alternate", discountPill: "Save 20%", description: "Delivered weekly" },
      },
    });
    expect(normalized.selectedGroup?.plans).toHaveLength(2);
    expect(normalized.selectedGroup?.plans.map((plan) => plan.id)).toEqual([
      "gid://shopify/SellingPlan/11",
      "gid://shopify/SellingPlan/12",
    ]);
    expect(normalized.selectedPlanIds).toEqual([
      "gid://shopify/SellingPlan/11",
      "gid://shopify/SellingPlan/12",
    ]);
    expect(normalized.planCopy).toEqual({
      ...config.planCopy,
      "gid://shopify/SellingPlan/12": {
        displayName: "Alternate",
        discountPill: "Save 20%",
        description: "Delivered weekly",
      },
    });
  });

  it("returns semantic errors for invalid enabled configurations", () => {
    const result = validateBundleSubscriptionConfig({
      ...config,
      selectedPlanIds: [],
      copy: { ...config.copy, title: "" },
      oneTimePurchase: { ...config.oneTimePurchase, title: "" },
    });
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "subscriptions.selectedPlanIds" }),
      expect.objectContaining({ path: "subscriptions.copy.title" }),
      expect.objectContaining({ path: "subscriptions.oneTimePurchase.title" }),
    ]));
  });

  it("keeps disabled draft values but omits them from public runtime", () => {
    const disabled = normalizeBundleSubscriptionConfig({ ...config, enabled: false });
    expect(disabled.selectedGroup?.id).toBe(config.selectedGroup.id);
    expect(buildPublicBundleSubscriptionConfig(disabled)).toBeNull();
  });

  it("normalizes all three bundle-discount purchase targets", () => {
    expect(normalizeBundleSubscriptionConfig({ ...config, bundleDiscountAppliesOn: "subscription" }).bundleDiscountAppliesOn).toBe("subscription");
    expect(normalizeBundleSubscriptionConfig({ ...config, bundleDiscountAppliesOn: "one_time" }).bundleDiscountAppliesOn).toBe("one_time");
    expect(normalizeBundleSubscriptionConfig({ ...config, bundleDiscountAppliesOn: "both" }).bundleDiscountAppliesOn).toBe("both");
  });

  it("resolves exact locale, language locale, then saved base copy", () => {
    expect(resolveLocalizedSubscriptionCopy(config, "fr-CA").subtitle).toBe("Choisissez une fréquence");
    expect(resolveLocalizedSubscriptionCopy(config, "fr-FR").title).toBe("Options d'achat");
    expect(resolveLocalizedSubscriptionCopy(config, "fr-FR").oneTimePurchaseTitle).toBe("Achat unique");
    expect(resolveLocalizedSubscriptionCopy(config, "fr-FR").planCopy[config.selectedPlanIds[0]].displayName).toBe("Livraison mensuelle");
    expect(resolveLocalizedSubscriptionCopy(config, "de-DE").title).toBe("Purchase options");
  });

  it("applies the Wolfpack bundle discount only to configured purchase modes", () => {
    expect(shouldApplyBundleDiscount("both", null)).toBe(true);
    expect(shouldApplyBundleDiscount("both", config.selectedPlanIds[0])).toBe(true);
    expect(shouldApplyBundleDiscount("one_time", null)).toBe(true);
    expect(shouldApplyBundleDiscount("one_time", config.selectedPlanIds[0])).toBe(false);
    expect(shouldApplyBundleDiscount("subscription", null)).toBe(false);
    expect(shouldApplyBundleDiscount("subscription", config.selectedPlanIds[0])).toBe(true);
  });

  it("maps the EB-style one-time default toggle onto the saved purchase option", () => {
    expect(getDefaultPurchaseOptionFromOneTimeToggle(config, true)).toEqual({ kind: "one_time" });
    expect(getDefaultPurchaseOptionFromOneTimeToggle(config, false)).toEqual({
      kind: "selling_plan",
      sellingPlanId: config.selectedPlanIds[0],
    });
    expect(getDefaultPurchaseOptionFromOneTimeToggle({
      ...config,
      selectedPlanIds: [],
    }, false)).toEqual({ kind: "one_time" });
    expect(getDefaultPurchaseOptionFromOneTimeToggle({
      ...config,
      selectedPlanIds: ["gid://shopify/SellingPlan/12", config.selectedPlanIds[0]],
    }, false)).toEqual(config.defaultPurchaseOption);
    expect(getDefaultPurchaseOptionFromOneTimeToggle({
      ...config,
      selectedPlanIds: ["gid://shopify/SellingPlan/12"],
    }, false)).toEqual({
      kind: "selling_plan",
      sellingPlanId: "gid://shopify/SellingPlan/12",
    });
  });

  it("refreshes provider plan data while retaining only surviving merchant copy and defaults", () => {
    const refreshedPlan = {
      ...config.selectedGroup.plans[0],
      sourceName: "Monthly updated",
      pricingPolicies: [{ kind: "percentage" as const, value: 15, afterCycle: 0 }],
    };
    const result = reconcileBundleSubscriptionPlanDiscovery(config, [{
      ...config.selectedGroup,
      plans: [refreshedPlan, {
        id: "gid://shopify/SellingPlan/12",
        sourceName: "Weekly",
        position: 2,
        options: ["1 week"],
        pricingPolicies: [],
      }],
    }]);
    expect(result.selectedGroup?.plans).toEqual([refreshedPlan, expect.objectContaining({ id: "gid://shopify/SellingPlan/12" })]);
    expect(result.selectedPlanIds).toEqual(config.selectedPlanIds);
    expect(result.planCopy).toEqual(config.planCopy);
    expect(result.defaultPurchaseOption).toEqual(config.defaultPurchaseOption);
  });

  it("calculates percentage, fixed amount, fixed price, and staged policies", () => {
    expect(applySellingPlanPricingPolicies(10000, [{ kind: "percentage", value: 10, afterCycle: 0 }], 1)).toBe(9000);
    expect(applySellingPlanPricingPolicies(10000, [{ kind: "fixed_amount", value: 1250, afterCycle: 0 }], 1)).toBe(8750);
    expect(applySellingPlanPricingPolicies(10000, [{ kind: "fixed_price", value: 7000, afterCycle: 0 }], 1)).toBe(7000);
    expect(applySellingPlanPricingPolicies(10000, [
      { kind: "percentage", value: 20, afterCycle: 0 },
      { kind: "percentage", value: 10, afterCycle: 3 },
    ], 4)).toBe(9000);
  });

  it("builds selected-plan storefront copy and per-delivery pricing", () => {
    expect(buildBundlePurchaseOptionPresentation(config, config.selectedPlanIds[0], 10000)).toEqual({
      groupName: "Subscribe and save",
      planId: "gid://shopify/SellingPlan/11",
      displayName: "Monthly delivery",
      discountPill: "Save 10%",
      description: "Delivered monthly",
      originalPrice: 10000,
      perDeliveryPrice: 9000,
    });
  });

  it("returns no selected-plan presentation in one-time mode", () => {
    expect(buildBundlePurchaseOptionPresentation(config, null, 10000)).toBeNull();
  });

  it("reports every unsupported production branch while subscriptions are enabled", () => {
    expect(getBundleSubscriptionCompatibilityIssues({
      discountType: "buy_x_get_y",
      steps: [{ isFreeGift: true }],
      personalizationEnabled: true,
    })).toEqual([
      expect.objectContaining({ path: "subscriptions.enabled", code: "buy_x_get_y" }),
      expect.objectContaining({ path: "subscriptions.enabled", code: "free_gift_or_addon" }),
      expect.objectContaining({ path: "subscriptions.enabled", code: "personalization" }),
    ]);
  });

  it("supports both storefront bundle types and rejects unrelated records", () => {
    expect(supportsBundleSubscriptions("full_page")).toBe(true);
    expect(supportsBundleSubscriptions("product_page")).toBe(true);
    expect(supportsBundleSubscriptions("billing")).toBe(false);
  });
});
