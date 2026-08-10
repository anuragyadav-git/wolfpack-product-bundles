import { ProductPageConfigLifecycleMethods } from "../../../app/assets/widgets/product-page/methods/config-lifecycle-methods";

describe("PPB config lifecycle module boundary", () => {
  it("normalizes the selected bundle through its directly imported category expander", () => {
    const bundle = {
      id: "bundle-1",
      name: "Draft PPB",
      status: "draft",
      bundleType: "product_page",
      shopifyProductId: "gid://shopify/Product/1111",
      useSingleStepCategoriesAsBundleSteps: false,
      steps: [{ id: "step-1", enabled: true }],
    };
    const context = {
      bundleData: { "bundle-1": bundle },
      config: { bundleId: "bundle-1", currentProductId: "1111" },
      selectedBundle: null,
      widgetStyle: null,
      updateMessagesFromBundle: jest.fn(),
    };

    ProductPageConfigLifecycleMethods.selectBundle.call(context);

    expect(context.selectedBundle).toBe(bundle);
    expect(context.widgetStyle).toBe("bottom-sheet");
    expect(context.updateMessagesFromBundle).toHaveBeenCalledTimes(1);
  });
});
