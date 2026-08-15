import {
  applyStorefrontSellingPlanPricing,
  applyStorefrontSellingPlanPricingToUnitPrices,
  buildStorefrontPlanPresentation,
  resolveStorefrontSubscriptionPresentation,
  shouldApplyStorefrontBundleDiscount,
  resolveSubscriptionProductCardPrice,
} from "../../../app/assets/widgets/shared/engine/selling-plan-pricing";
import {
  bundleSubscriptionStorefrontMethods,
  calculateBundleDiscountForPurchaseOption,
} from "../../../app/assets/widgets/shared/subscription-storefront-methods";

const subscription = {
  enabled: true,
  selectedPlanIds: ["gid://shopify/SellingPlan/1"],
  selectedGroup: {
    id: "gid://shopify/SellingPlanGroup/1",
    name: "Subscribe and save",
    plans: [{
      id: "gid://shopify/SellingPlan/1",
      sourceName: "Monthly",
      pricingPolicies: [{ kind: "percentage", value: 10, afterCycle: 0 }],
    }],
  },
  planCopy: {
    "gid://shopify/SellingPlan/1": {
      displayName: "Monthly delivery",
      discountPill: "Save 10%",
      description: "Delivered monthly",
    },
  },
  oneTimePurchase: { enabled: true, title: "One-time purchase" },
  copy: { title: "Purchase options", subtitle: "Choose one" },
  bundleDiscountAppliesOn: "both",
  translations: {
    fr: {
      title: "Options d'achat",
      oneTimePurchaseTitle: "Achat unique",
      planCopy: {
        "gid://shopify/SellingPlan/1": { displayName: "Livraison mensuelle" },
      },
    },
    "fr-CA": { subtitle: "Choisissez une option" },
  },
};

describe("shared storefront selling-plan presentation", () => {
  it("applies percentage, fixed amount, fixed price, and staged policies", () => {
    expect(applyStorefrontSellingPlanPricing(10000, [{ kind: "percentage", value: 10, afterCycle: 0 }])).toBe(9000);
    expect(applyStorefrontSellingPlanPricing(10000, [{ kind: "fixed_amount", value: 1500, afterCycle: 0 }])).toBe(8500);
    expect(applyStorefrontSellingPlanPricing(10000, [{ kind: "fixed_price", value: 7000, afterCycle: 0 }])).toBe(7000);
    expect(applyStorefrontSellingPlanPricing(10000, [
      { kind: "percentage", value: 20, afterCycle: 0 },
      { kind: "percentage", value: 10, afterCycle: 3 },
    ], 4)).toBe(9000);
    expect(applyStorefrontSellingPlanPricingToUnitPrices(
      [5000, 5000],
      [{ kind: "fixed_amount", value: 1500, afterCycle: 0 }],
    )).toEqual({ unitPrices: [3500, 3500], totalPrice: 7000 });
  });

  it("builds the same selected-plan presentation for either widget controller", () => {
    expect(buildStorefrontPlanPresentation(
      subscription,
      "gid://shopify/SellingPlan/1",
      10000,
    )).toEqual({
      groupName: "Subscribe and save",
      planId: "gid://shopify/SellingPlan/1",
      displayName: "Monthly delivery",
      discountPill: "Save 10%",
      description: "Delivered monthly",
      originalPrice: 10000,
      perDeliveryPrice: 9000,
    });
  });

  it("adjusts product-card prices only when the merchant enables that display", () => {
    expect(resolveSubscriptionProductCardPrice(
      subscription,
      "gid://shopify/SellingPlan/1",
      2500,
    )).toBe(2500);
    expect(resolveSubscriptionProductCardPrice(
      { ...subscription, showDiscountOnProductCards: true },
      "gid://shopify/SellingPlan/1",
      2500,
    )).toBe(2250);
  });

  it("calculates subscription-aware totals from adjusted component unit prices", () => {
    const context = {
      selectedBundle: {
        subscription: {
          ...subscription,
          selectedGroup: {
            ...subscription.selectedGroup,
            plans: [{
              ...subscription.selectedGroup.plans[0],
              pricingPolicies: [{ kind: "fixed_amount", value: 1500, afterCycle: 0 }],
            }],
          },
        },
      },
      selectedSellingPlanId: "gid://shopify/SellingPlan/1",
    };

    expect(bundleSubscriptionStorefrontMethods.calculateBundleTotalForPurchaseOption.call(
      context,
      [{ "gid://shopify/ProductVariant/1": 2 }],
      [[{ selectionId: "gid://shopify/ProductVariant/1", price: 5000 }]],
    )).toEqual({
      totalQuantity: 2,
      totalPrice: 7000,
      unitPrices: [3500, 3500],
    });
  });

  it("resolves exact locale, language locale, and base presentation copy", () => {
    const resolved = resolveStorefrontSubscriptionPresentation(subscription, "fr-CA");
    expect(resolved.copy).toEqual({ title: "Options d'achat", subtitle: "Choisissez une option" });
    expect(resolved.oneTimePurchase.title).toBe("Achat unique");
    expect(resolved.planCopy["gid://shopify/SellingPlan/1"]).toEqual({
      displayName: "Livraison mensuelle",
      discountPill: "Save 10%",
      description: "Delivered monthly",
    });
  });

  it("applies bundle discounts only to the configured purchase mode", () => {
    expect(shouldApplyStorefrontBundleDiscount({ bundleDiscountAppliesOn: "both" }, null)).toBe(true);
    expect(shouldApplyStorefrontBundleDiscount({ bundleDiscountAppliesOn: "subscription" }, null)).toBe(false);
    expect(shouldApplyStorefrontBundleDiscount({ bundleDiscountAppliesOn: "subscription" }, "plan")).toBe(true);
    expect(shouldApplyStorefrontBundleDiscount({ bundleDiscountAppliesOn: "one_time" }, "plan")).toBe(false);
  });

  it("suppresses the displayed Wolfpack discount outside the configured purchase mode", () => {
    const controller = {
      selectedSellingPlanId: null,
      selectedBundle: {
        subscription: { ...subscription, bundleDiscountAppliesOn: "subscription" },
        pricing: {
          enabled: true,
          method: "percentage_off",
          rules: [{ conditionType: "quantity", conditionValue: 1, discountValue: 20 }],
        },
      },
    };
    expect(calculateBundleDiscountForPurchaseOption(controller, 10000, 1, [10000])).toMatchObject({
      hasDiscount: false,
      finalPrice: 10000,
    });
  });
});
