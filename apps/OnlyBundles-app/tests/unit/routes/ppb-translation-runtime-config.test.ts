import {
  buildBundleBaseConfig,
  buildSyncBundleConfiguration,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server";

describe("PPB translation runtime configuration", () => {
  const step = {
    id: "step-1",
    name: "Extras",
    position: 0,
    minQuantity: 0,
    maxQuantity: 1,
    enabled: true,
    StepProduct: [],
    StepCategory: [{
      id: "category-1",
      name: "Featured",
      title: "Featured products",
      multiLangData: { fr: { name: "En vedette" } },
      products: [],
      collections: [],
    }],
    collections: [],
    isFreeGift: true,
    addonAddText: "Add extra",
    addonReplaceText: "Replace extra",
    multiLangData: { fr: { addonAddText: "Ajouter" } },
  };

  it("keeps translated PPB fields in the save-time metafield configuration", () => {
    const config = buildBundleBaseConfig({
      id: "bundle-1",
      name: "Bundle",
      description: null,
      status: "ACTIVE",
      bundleType: "product_page",
      templateName: null,
      shopifyProductId: "gid://shopify/Product/1",
      pricing: { messages: {}, displayOptions: {} },
    }, [step], {}, {
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [{
        id: "rule-1",
        conditionType: "quantity",
        conditionValue: 2,
        discountValue: 10,
        tierBadge: {
          enabled: true,
          text: "Save {{saved_percentage}}",
          shape: "pill",
          visibility: "always",
        },
      }],
      showFooter: true,
      ruleMessages: {},
      ruleMessagesByLocale: {
        fr: { "addons-step-1": { discountText: "Ajoutez-en plus" } },
      },
      displayOptions: {},
    }, null) as any;

    expect(config.steps[0]).toEqual(expect.objectContaining({
      addonAddText: "Add extra",
      addonReplaceText: "Replace extra",
      multiLangData: { fr: { addonAddText: "Ajouter" } },
    }));
    expect(config.steps[0].categories[0]).toEqual(expect.objectContaining({
      title: "Featured products",
      multiLangData: { fr: { name: "En vedette" } },
    }));
    expect(config.pricing.messages.ruleMessagesByLocale).toEqual({
      fr: { "addons-step-1": { discountText: "Ajoutez-en plus" } },
    });
    expect(config.pricing.rules[0].tierBadge).toEqual({
      enabled: true,
      text: "Save {{saved_percentage}}",
      shape: "pill",
      visibility: "always",
    });
  });

  it("keeps translated fields when rebuilding a saved bundle for Sync Bundle", () => {
    const config = buildSyncBundleConfiguration({
      id: "bundle-1",
      name: "Bundle",
      description: "",
      status: "ACTIVE",
      bundleType: "product_page",
      steps: [step],
      pricing: {
        enabled: true,
        method: "percentage_off",
        rules: [],
        messages: { ruleMessages: {} },
        ruleMessagesByLocale: {
          fr: { "addons-step-1": { successMessage: "Débloqué" } },
        },
        displayOptions: {},
      },
    }, "gid://shopify/Product/1") as any;

    expect(config.steps[0]).toEqual(expect.objectContaining({
      addonAddText: "Add extra",
      addonReplaceText: "Replace extra",
      multiLangData: { fr: { addonAddText: "Ajouter" } },
    }));
    expect(config.pricing.messages.ruleMessagesByLocale).toEqual({
      fr: { "addons-step-1": { successMessage: "Débloqué" } },
    });
  });
});
