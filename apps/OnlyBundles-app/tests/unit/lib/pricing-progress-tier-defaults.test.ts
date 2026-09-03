import {
  applyProgressTierRuleUpdate,
  ensureProgressTierDefaults,
  getBogoDiscountInputValue,
  getBogoDiscountStoredValue,
  getDefaultProgressTierText,
  removeProgressTierRule,
} from "../../../app/lib/pricing-progress-tier-defaults";
import { DiscountMethod, type PricingRule } from "../../../app/types/pricing";

const quantityRule: PricingRule = {
  id: "rule-1",
  conditionType: "quantity",
  conditionValue: 2,
  discountValue: 5,
};

describe("progress tier default templates", () => {
  it("keeps BOGO fixed-amount inputs in major units and storage in cents", () => {
    expect(getBogoDiscountStoredValue(5.5, "fixed_amount")).toBe(550);
    expect(getBogoDiscountInputValue(550, "fixed_amount")).toBe(5.5);
    expect(getBogoDiscountStoredValue(15, "percentage")).toBe(15);
  });

  it.each([
    [DiscountMethod.PERCENTAGE_OFF, quantityRule, "2 Pack", "Save 5%"],
    [
      DiscountMethod.PERCENTAGE_OFF,
      { ...quantityRule, conditionType: "amount", conditionValue: 5000 },
      "Spend $50",
      "Save 5%",
    ],
    [
      DiscountMethod.FIXED_AMOUNT_OFF,
      { ...quantityRule, discountValue: 500 },
      "2 Pack",
      "Save $5",
    ],
    [
      DiscountMethod.FIXED_AMOUNT_OFF,
      {
        ...quantityRule,
        conditionType: "amount",
        conditionValue: 5000,
        discountValue: 550,
      },
      "Spend $50",
      "Save $5.5",
    ],
    [
      DiscountMethod.FIXED_BUNDLE_PRICE,
      { ...quantityRule, discountValue: 5000 },
      "2 Pack",
      "Save $50",
    ],
    [
      DiscountMethod.BUY_X_GET_Y,
      {
        ...quantityRule,
        discountValue: 100,
        customerBuys: 2,
        customerGets: 1,
        bxyDiscountType: "percentage",
      },
      "Add 3",
      "1 Product(s) @ 100% off",
    ],
    [
      DiscountMethod.BUY_X_GET_Y,
      {
        ...quantityRule,
        discountValue: 500,
        customerBuys: 2,
        customerGets: 1,
        bxyDiscountType: "fixed_amount",
      },
      "Add 3",
      "1 Product(s) @ $5 off",
    ],
  ])("formats %s defaults", (method, rule, tierText, tierSubtext) => {
    expect(getDefaultProgressTierText(rule as PricingRule, method, "USD")).toEqual({
      tierText,
      tierSubtext,
    });
  });
});

describe("progress tier state transitions", () => {
  it("adds only missing defaults and preserves saved custom or blank entries", () => {
    const saved = {
      "rule-1": { tierText: "", tierSubtext: "Merchant copy" },
      stale: { tierText: "Keep", tierSubtext: "Keep" },
    };

    expect(
      ensureProgressTierDefaults(
        [quantityRule, { ...quantityRule, id: "rule-2", conditionValue: 4 }],
        DiscountMethod.PERCENTAGE_OFF,
        "USD",
        saved,
      ),
    ).toEqual({
      ...saved,
      "rule-2": { tierText: "4 Pack", tierSubtext: "Save 5%" },
    });
  });

  it("regenerates only the title for condition changes", () => {
    const state = {
      tierTextByRuleId: {
        "rule-1": { tierText: "Custom title", tierSubtext: "Custom subtext" },
      },
      tierTextByLocaleByRuleId: {
        fr: {
          "rule-1": { tierText: "Titre", tierSubtext: "Sous-texte" },
        },
      },
    };

    expect(
      applyProgressTierRuleUpdate({
        state,
        rule: { ...quantityRule, conditionValue: 4 },
        updates: { conditionValue: 4 },
        method: DiscountMethod.PERCENTAGE_OFF,
        currencyCode: "USD",
      }),
    ).toEqual({
      tierTextByRuleId: {
        "rule-1": { tierText: "4 Pack", tierSubtext: "Custom subtext" },
      },
      tierTextByLocaleByRuleId: {
        fr: { "rule-1": { tierText: "4 Pack", tierSubtext: "Sous-texte" } },
      },
    });
  });

  it("regenerates only the subtext for discount changes", () => {
    const result = applyProgressTierRuleUpdate({
      state: {
        tierTextByRuleId: {
          "rule-1": { tierText: "Custom title", tierSubtext: "Custom subtext" },
        },
        tierTextByLocaleByRuleId: {},
      },
      rule: { ...quantityRule, discountValue: 15 },
      updates: { discountValue: 15 },
      method: DiscountMethod.PERCENTAGE_OFF,
      currencyCode: "USD",
    });

    expect(result.tierTextByRuleId["rule-1"]).toEqual({
      tierText: "Custom title",
      tierSubtext: "Save 15%",
    });
  });

  it("regenerates both dependent BOGO fields when customer gets changes", () => {
    const rule = {
      ...quantityRule,
      customerBuys: 2,
      customerGets: 2,
      discountValue: 100,
      bxyDiscountType: "percentage" as const,
    };
    const result = applyProgressTierRuleUpdate({
      state: {
        tierTextByRuleId: {
          "rule-1": { tierText: "Custom title", tierSubtext: "Custom subtext" },
        },
        tierTextByLocaleByRuleId: {},
      },
      rule,
      updates: { customerGets: 2 },
      method: DiscountMethod.BUY_X_GET_Y,
      currencyCode: "USD",
    });

    expect(result.tierTextByRuleId["rule-1"]).toEqual({
      tierText: "Add 4",
      tierSubtext: "2 Product(s) @ 100% off",
    });
  });

  it("removes the rule from base and localized tier state", () => {
    expect(
      removeProgressTierRule(
        {
          tierTextByRuleId: {
            "rule-1": { tierText: "A", tierSubtext: "B" },
            "rule-2": { tierText: "C", tierSubtext: "D" },
          },
          tierTextByLocaleByRuleId: {
            fr: {
              "rule-1": { tierText: "A", tierSubtext: "B" },
              "rule-2": { tierText: "C", tierSubtext: "D" },
            },
          },
        },
        "rule-1",
      ),
    ).toEqual({
      tierTextByRuleId: {
        "rule-2": { tierText: "C", tierSubtext: "D" },
      },
      tierTextByLocaleByRuleId: {
        fr: { "rule-2": { tierText: "C", tierSubtext: "D" } },
      },
    });
  });
});
