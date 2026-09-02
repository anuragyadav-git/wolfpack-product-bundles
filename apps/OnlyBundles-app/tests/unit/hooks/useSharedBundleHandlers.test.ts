import { buildClonedStepPayload } from "../../../app/hooks/useSharedBundleHandlers";

describe("buildClonedStepPayload", () => {
  it("isolates cloned step product/category references and rewrites ids", () => {
    const sourceStep = {
      id: "step-1",
      name: "Standard",
      StepProduct: [
        {
          id: "step-product-1",
          productId: "gid://shopify/Product/11",
          variants: [
            { id: "gid://shopify/ProductVariant/21", title: "S" },
          ],
          collections: [{ id: "collection-1", title: "Summer" }],
          multiLangData: { en: { title: "Standard" } },
        },
      ],
      StepCategory: [
        {
          id: "cat-1",
          title: "Category 1",
          products: [{ id: "product-1" }],
          collections: [{ id: "collection-1" }],
          conditions: [{ condition: "greaterThanOrEqualTo", value: 2 }],
          multiLangData: { en: { title: "Category 1" } },
        },
      ],
    };

    const cloned = buildClonedStepPayload(sourceStep, 1720000000000);

    expect(cloned.id).toBe("step-1720000000000");
    expect(cloned.name).toBe("Standard (Copy)");
    expect(cloned).not.toBe(sourceStep);
    expect(cloned.StepProduct).not.toBe(sourceStep.StepProduct);
    expect(cloned.StepProduct[0]).not.toBe(sourceStep.StepProduct[0]);
    expect(cloned.StepProduct[0].variants).not.toBe(sourceStep.StepProduct[0].variants);
    expect(cloned.StepProduct[0].variants[0]).not.toBe(sourceStep.StepProduct[0].variants[0]);
    expect(cloned.StepProduct[0].collections).not.toBe(sourceStep.StepProduct[0].collections);
    expect(cloned.StepProduct[0].collections[0]).not.toBe(sourceStep.StepProduct[0].collections[0]);
    expect(cloned.StepProduct[0].multiLangData).toEqual(sourceStep.StepProduct[0].multiLangData);
    expect(cloned.StepProduct[0].multiLangData).not.toBe(sourceStep.StepProduct[0].multiLangData);
    expect(cloned.StepProduct[0].multiLangData.en).not.toBe(sourceStep.StepProduct[0].multiLangData.en);

    expect(cloned.StepCategory).not.toBe(sourceStep.StepCategory);
    expect(cloned.StepCategory[0]).not.toBe(sourceStep.StepCategory[0]);
    expect(cloned.StepCategory[0].id).toBe("cat-1720000000000-0");
    expect(cloned.StepCategory[0].products).not.toBe(sourceStep.StepCategory[0].products);
    expect(cloned.StepCategory[0].products[0]).not.toBe(sourceStep.StepCategory[0].products[0]);
    expect(cloned.StepCategory[0].collections).not.toBe(sourceStep.StepCategory[0].collections);
    expect(cloned.StepCategory[0].conditions).not.toBe(sourceStep.StepCategory[0].conditions);
    expect(cloned.StepCategory[0].conditions[0]).not.toBe(sourceStep.StepCategory[0].conditions[0]);
    expect(cloned.StepCategory[0].multiLangData).not.toBe(sourceStep.StepCategory[0].multiLangData);
    expect(cloned.StepCategory[0].multiLangData.en).not.toBe(sourceStep.StepCategory[0].multiLangData.en);

    sourceStep.StepProduct[0].variants[0].title = "M";
    sourceStep.StepCategory[0].products[0].id = "changed";

    expect(cloned.StepProduct[0].variants[0].title).toBe("S");
    expect(cloned.StepCategory[0].products[0].id).toBe("product-1");
  });

  it("keeps step-level fields intact while cloning", () => {
    const sourceStep = {
      id: "step-1",
      name: "Standard",
      type: "CATEGORY",
      StepProduct: null,
      StepCategory: null,
    };

    const cloned = buildClonedStepPayload(sourceStep, 1720000000001);

    expect(cloned.id).toBe("step-1720000000001");
    expect(cloned.name).toBe("Standard (Copy)");
    expect(cloned.type).toBe("CATEGORY");
    expect(cloned.StepProduct).toEqual([]);
    expect(cloned.StepCategory).toEqual([]);
  });
});
