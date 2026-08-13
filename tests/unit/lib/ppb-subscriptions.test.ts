import {
  applySellingPlanPricingPolicies,
  buildPublicPpbSubscriptionConfig,
  normalizePpbSubscriptionConfig,
  resolveLocalizedSubscriptionCopy,
  validatePpbSubscriptionConfig,
} from "../../../app/lib/ppb-subscriptions";

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
  translations: {
    fr: { title: "Options d'achat" },
    "fr-CA": { subtitle: "Choisissez une fréquence" },
  },
};

describe("PPB subscription config", () => {
  it("normalizes a valid V1 config and removes unknown plan copy", () => {
    const normalized = normalizePpbSubscriptionConfig({
      ...config,
      selectedPlanIds: [config.selectedPlanIds[0], config.selectedPlanIds[0]],
      planCopy: { ...config.planCopy, stale: { displayName: "Stale", discountPill: "", description: "" } },
    });
    expect(normalized.selectedPlanIds).toEqual(config.selectedPlanIds);
    expect(normalized.planCopy).toEqual(config.planCopy);
  });

  it("returns semantic errors for invalid enabled configurations", () => {
    const result = validatePpbSubscriptionConfig({
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
    const disabled = normalizePpbSubscriptionConfig({ ...config, enabled: false });
    expect(disabled.selectedGroup?.id).toBe(config.selectedGroup.id);
    expect(buildPublicPpbSubscriptionConfig(disabled)).toBeNull();
  });

  it("fails closed when recurring bundle pricing is submitted before live proof", () => {
    expect(validatePpbSubscriptionConfig({
      ...config,
      recurringBundleDiscount: true,
    })).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: "subscriptions.recurringBundleDiscount" }),
    ]));
  });

  it("resolves exact locale, language locale, then saved base copy", () => {
    expect(resolveLocalizedSubscriptionCopy(config, "fr-CA").subtitle).toBe("Choisissez une fréquence");
    expect(resolveLocalizedSubscriptionCopy(config, "fr-FR").title).toBe("Options d'achat");
    expect(resolveLocalizedSubscriptionCopy(config, "de-DE").title).toBe("Purchase options");
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
});
