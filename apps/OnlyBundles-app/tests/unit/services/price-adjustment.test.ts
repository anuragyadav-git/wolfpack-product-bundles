import { buildPriceAdjustmentConfig } from "../../../app/services/bundles/metafield-sync/utils/price-adjustment";

describe("buildPriceAdjustmentConfig", () => {
  it("serializes all pricing rules for runtime tier selection", () => {
    const priceAdjustment = buildPriceAdjustmentConfig({
      enabled: true,
      method: "fixed_bundle_price",
      rules: [
        {
          id: "rule-2",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 4999,
        },
        {
          id: "rule-3",
          conditionType: "quantity",
          conditionValue: 3,
          discountValue: 6999,
        },
      ],
    });

    expect(priceAdjustment).toMatchObject({
      method: "fixed_bundle_price",
      value: 4999,
      conditions: {
        type: "quantity",
        operator: "gte",
        value: 2,
      },
      rules: [
        {
          method: "fixed_bundle_price",
          value: 4999,
          conditions: {
            type: "quantity",
            operator: "gte",
            value: 2,
          },
        },
        {
          method: "fixed_bundle_price",
          value: 6999,
          conditions: {
            type: "quantity",
            operator: "gte",
            value: 3,
          },
        },
      ],
    });
  });

  it("uses only canonical fixed-price fields and preserves the pricing operator", () => {
    const priceAdjustment = buildPriceAdjustmentConfig({
      enabled: true,
      method: "fixed_bundle_price",
      rules: [{
        id: "rule-canonical",
        conditionType: "quantity",
        conditionOperator: "lt",
        conditionValue: 4,
        discountValue: 4999,
        fixedBundlePrice: 9999,
        condition: { type: "amount", operator: "gte", value: 9000 },
        discount: { method: "percentage_off", value: 75 },
      }],
    });

    expect(priceAdjustment).toMatchObject({
      method: "fixed_bundle_price",
      value: 4999,
      conditions: { type: "quantity", operator: "lt", value: 4 },
    });
  });
});
