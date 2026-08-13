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
  Object.entries(overrides).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("validateBundleConfigureFormData", () => {
  it("accepts a minimum valid persisted configuration", () => {
    expect(validateBundleConfigureFormData(form(), "fpb")).toEqual([]);
  });

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

    expect(issues.map(({ path }) => path)).toEqual([
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

    expect(issues.map(({ path }) => path)).toEqual(
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

    expect(issues.map(({ path }) => path)).toEqual(
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
});
