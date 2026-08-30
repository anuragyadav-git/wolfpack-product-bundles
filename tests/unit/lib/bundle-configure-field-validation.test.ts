import {
  getConfigureFieldErrorMap,
  submitValidBundleConfigureForm,
  validateBundleConfigureFormData,
} from "../../../app/lib/bundle-config/configure-validation";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("bundleName", "Starter bundle");
  data.set(
    "stepsData",
    JSON.stringify([
      {
        id: "step-1",
        name: "Choose products",
        enabled: true,
        collections: [{ id: "gid://shopify/Collection/1" }],
        StepProduct: [],
        StepCategory: [],
      },
    ]),
  );
  data.set("stepConditions", "{}");
  data.set(
    "discountData",
    JSON.stringify({ discountEnabled: false, discountRules: [] }),
  );
  data.set("bundleUpsellConfig", "{}");
  data.set("upsellWidgetEnabled", "false");
  data.set(
    "validateQuantityPerProduct",
    JSON.stringify({ isEnabled: false, allowedQuantity: 1 }),
  );
  data.set("defaultProductsData", "{}");
  Object.entries(overrides).forEach(([key, value]: any) => data.set(key, value));
  return data;
}

describe("validateBundleConfigureFormData", () => {
  it("accepts a minimum valid persisted configuration", () => {
    expect(validateBundleConfigureFormData(form(), "fpb")).toEqual([]);
  });

  it.each(["fpb", "ppb"] as const)(
    "validates enabled subscription configuration for %s",
    (kind) => {
      const issues = validateBundleConfigureFormData(
        form({
          bundleSubscriptionConfig: JSON.stringify({
            version: 1,
            enabled: true,
            selectedGroup: null,
            selectedPlanIds: [],
            defaultPurchaseOption: { kind: "one_time" },
            oneTimePurchase: { enabled: true, title: "", description: "" },
            copy: { title: "", subtitle: "", unavailableMessage: "" },
            planCopy: {},
            showDiscountOnProductCards: false,
            recurringBundleDiscount: false,
            translations: {},
          }),
        }),
        kind,
      );

      expect(issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          path: "subscriptions.selectedGroup",
          section: "subscriptions",
        }),
        expect.objectContaining({ path: "subscriptions.selectedPlanIds" }),
        expect.objectContaining({ path: "subscriptions.copy.title" }),
      ]));
    },
  );

  it("returns ordered issues for missing bundle and enabled-step requirements", () => {
    const issues = validateBundleConfigureFormData(
      form({
        bundleName: "  ",
        stepsData: JSON.stringify([
          { id: "step-1", name: "", enabled: false, StepCategory: [] },
          { id: "step-2", name: "", enabled: false, StepCategory: [] },
        ]),
      }),
      "fpb",
    );

    expect(issues.map(({ path }: any) => path)).toEqual([
      "bundle.name",
      "steps.step-1.name",
      "steps.step-1.resources",
    ]);
    expect(getConfigureFieldErrorMap(issues)).toEqual({
      "bundle.name": "Enter a bundle name.",
      "steps.step-1.name": "Enter a step name.",
      "steps.step-1.resources": "Add at least one product or collection.",
    });
  });

  it("validates active categories, conditions, and pricing rules", () => {
    const issues = validateBundleConfigureFormData(
      form({
        stepsData: JSON.stringify([
          {
            id: "step-1",
            name: "Step",
            enabled: true,
            StepCategory: [
              { id: "cat-1", name: "", products: [], collections: [] },
              { id: "cat-2", name: "Second", products: [], collections: [] },
            ],
          },
        ]),
        stepConditions: JSON.stringify({
          "step-1": [{ id: "rule-1", type: "quantity", operator: "", value: "" }],
        }),
        discountData: JSON.stringify({
          discountEnabled: true,
          discountType: "percentage_off",
          discountRules: [
            { id: "discount-1", conditionType: "quantity", conditionValue: 0, discountValue: 101 },
          ],
        }),
      }),
      "ppb",
    );

    expect(issues.map(({ path }: any) => path)).toEqual(
      expect.arrayContaining([
        "steps.step-1.categories.cat-1.name",
        "steps.step-1.categories.cat-1.resources",
        "steps.step-1.conditions.rule-1.operator",
        "steps.step-1.conditions.rule-1.value",
        "discount.rules.discount-1.conditionValue",
        "discount.rules.discount-1.discountValue",
      ]),
    );
  });

  it("validates PPB category selector mode and explicit color mappings", () => {
    const issues = validateBundleConfigureFormData(
      form({
        stepsData: JSON.stringify([
          {
            id: "step-1",
            name: "Step",
            enabled: true,
            StepCategory: [
              {
                id: "cat-1",
                name: "Colors",
                products: [{ id: "gid://shopify/Product/1" }],
                collections: [],
                variantSelectorMode: "tiles",
              },
              {
                id: "cat-2",
                name: "More colors",
                products: [{ id: "gid://shopify/Product/2" }],
                collections: [],
                variantSelectorMode: "color_swatch",
                swatchTooltipEnabled: true,
                variantColorMap: { Navy: "red;display:none" },
              },
            ],
          },
        ]),
      }),
      "ppb",
    );

    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: "steps.step-1.categories.cat-1.variantSelectorMode",
        section: "step_setup",
      }),
      expect.objectContaining({
        path: "steps.step-1.categories.cat-2.variantColorMap",
        section: "step_setup",
      }),
    ]));
  });

  it.each(["fpb", "ppb"] as const)(
    "validates tier badge copy and method-compatible variables for %s",
    (kind) => {
      const issues = validateBundleConfigureFormData(
        form({
          discountData: JSON.stringify({
            discountEnabled: true,
            discountType: "percentage_off",
            discountRules: [
              {
                id: "empty-badge",
                conditionType: "quantity",
                conditionValue: 2,
                discountValue: 10,
                tierBadge: {
                  enabled: true,
                  text: "",
                  shape: "pill",
                  visibility: "always",
                },
              },
              {
                id: "wrong-variable",
                conditionType: "quantity",
                conditionValue: 3,
                discountValue: 20,
                tierBadge: {
                  enabled: true,
                  text: "Save {{saved_total}}",
                  shape: "folded",
                  visibility: "always",
                },
              },
            ],
          }),
        }),
        kind,
      );

      expect(issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: "discount.rules.empty-badge.tierBadge.text" }),
        expect.objectContaining({ path: "discount.rules.wrong-variable.tierBadge.text" }),
      ]));
    },
  );

  it("validates enabled widget and PPB embed copy and targeting", () => {
    const issues = validateBundleConfigureFormData(
      form({
        upsellWidgetEnabled: "true",
        upsellWidgetDisplayMode: "block",
        upsellWidgetDisplayOn: "specific_products",
        bundleUpsellConfig: JSON.stringify({
          widgetConfiguration: {
            isEnabled: true,
            title: "",
            buttonText: "",
            displayConfiguration: { selectedProducts: [] },
          },
          upsellConfiguration: {
            isEnabled: true,
            title: "",
            displayConfiguration: { collectionsSelectedData: [] },
          },
        }),
        bundleEmbedDisplayOn: "specific_collections",
      }),
      "ppb",
    );

    expect(issues.map(({ path }: any) => path)).toEqual(
      expect.arrayContaining([
        "widget.title",
        "widget.buttonText",
        "widget.products",
        "embed.title",
        "embed.collections",
      ]),
    );
  });

  it("ignores disabled feature branches", () => {
    const issues = validateBundleConfigureFormData(
      form({
        upsellWidgetEnabled: "false",
        bundleUpsellConfig: JSON.stringify({
          widgetConfiguration: { isEnabled: false, title: "", buttonText: "" },
          upsellConfiguration: { isEnabled: false, title: "" },
        }),
        validateQuantityPerProduct: JSON.stringify({
          isEnabled: false,
          allowedQuantity: 0,
        }),
      }),
      "ppb",
    );

    expect(issues).toEqual([]);
  });

  it("does not submit invalid forms and submits valid forms once", () => {
    const submit = jest.fn();
    submitValidBundleConfigureForm(form({ bundleName: "" }), "fpb", submit);
    expect(submit).not.toHaveBeenCalled();

    const valid = form();
    expect(submitValidBundleConfigureForm(valid, "fpb", submit)).toEqual([]);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(valid);
  });

  it("submits a valid enabled FPB add-on configuration once", () => {
    const submit = jest.fn();
    const valid = form({
      validationAddonDraft: JSON.stringify({
        addonProductsEnabled: true,
        addonProductsTitle: "Choose an add-on",
        addonTiers: [{
          tierId: "tier-1",
          title: "Tier one",
          selectedAddonProducts: [{ id: "gid://shopify/Product/1" }],
          eligibilityValue: 2,
          discountValue: 10,
        }],
      }),
    });

    expect(submitValidBundleConfigureForm(valid, "fpb", submit)).toEqual([]);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(valid);
  });
});
