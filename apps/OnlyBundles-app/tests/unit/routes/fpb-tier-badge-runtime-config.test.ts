import {
  buildFpbBaseConfig,
  buildFullPageBundleMetafieldConfig,
} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server";

const tierBadge = {
  enabled: true,
  text: "Save {{saved_percentage}}",
  shape: "folded",
  visibility: "always",
};

describe("FPB tier badge runtime configuration", () => {
  it("projects a saved tier badge into a synchronized metafield config", () => {
    const config = buildFullPageBundleMetafieldConfig({
      id: "bundle-1",
      name: "Bundle",
      description: "",
      status: "active",
      bundleType: "full_page",
      steps: [],
      pricing: {
        enabled: true,
        method: "percentage_off",
        rules: [{
          id: "rule-1",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 10,
          tierBadge,
        }],
        messages: {},
      },
    }) as any;

    expect(config.pricing.rules[0].tierBadge).toEqual(tierBadge);
  });

  it("projects an edited tier badge into the save-time runtime config", () => {
    const config = buildFpbBaseConfig({
      id: "bundle-1",
      name: "Bundle",
      description: null,
      status: "active",
      bundleType: "full_page",
      templateName: null,
      shopifyProductId: null,
    }, [], {}, {
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [{
        id: "rule-1",
        conditionType: "quantity",
        conditionValue: 2,
        discountValue: 10,
        tierBadge,
      }],
      ruleMessages: {},
    }, null) as any;

    expect(config.pricing.rules[0].tierBadge).toEqual(tierBadge);
  });
});
