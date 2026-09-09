import {
  buildFpbBaseConfig,
  buildFullPageBundleMetafieldConfig,
} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server";

describe("FPB runtime metafield config", () => {
  const product = {
    productId: "gid://shopify/Product/123",
    title: "Runtime Product",
    imageUrl: "https://cdn.shopify.com/product.jpg",
    price: 1999,
    compareAtPrice: 2499,
    variants: [
      {
        id: "gid://shopify/ProductVariant/111",
        title: "Small",
        price: 1999,
        compareAtPrice: 2499,
        available: true,
      },
      {
        id: "gid://shopify/ProductVariant/222",
        title: "Large",
        price: 2199,
        available: true,
      },
    ],
  };

  it("preserves the canonical Full Page type", () => {
    const config = buildFullPageBundleMetafieldConfig({
      id: "bundle-1",
      name: "Bundle",
      status: "active",
      bundleType: "full_page",
      publicNumber: 1,
      steps: [],
    });

    expect(config.bundleType).toBe("full_page");
  });

  it.each([undefined, "product_page"])(
    "rejects non-FPB bundle type %s",
    (bundleType) => {
      expect(() =>
        buildFullPageBundleMetafieldConfig({
          id: "bundle-1",
          name: "Bundle",
          status: "active",
          bundleType,
          publicNumber: 1,
          steps: [],
        }),
      ).toThrow("FPB metafield config requires bundleType full_page");
    },
  );

  it("preserves enriched products in the full-page metafield config", () => {
    const config = buildFullPageBundleMetafieldConfig({
      id: "bundle-1",
      name: "Bundle",
      description: "",
      status: "active",
      bundleType: "full_page",
      fullPageLayout: null,
      templateName: null,
      shopifyProductId: "gid://shopify/Product/999",
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          StepProduct: [product],
          StepCategory: [
            {
              id: "cat-1",
              title: "Category 1",
              products: [{ id: "gid://shopify/Product/123" }],
            },
          ],
        },
      ],
      pricing: null,
    } as any) as any;

    expect(config.steps[0].products).toEqual([]);
    expect(config.steps[0].categories[0].products[0]).toMatchObject({
      selectionId: "gid://shopify/Product/123",
      price: 1999,
      variants: expect.arrayContaining([
        expect.objectContaining({ selectionId: "gid://shopify/ProductVariant/111", price: 1999 }),
      ]),
    });
  });

  it("serializes fixed bundle price through canonical discountValue only", () => {
    const config = buildFpbBaseConfig(
      {
        id: "bundle-1",
        name: "Bundle",
        description: "",
        status: "active",
        bundleType: "full_page",
        fullPageLayout: null,
        templateName: null,
        shopifyProductId: "gid://shopify/Product/999",
      } as any,
      [
        {
          id: "step-1",
          name: "Step 1",
          StepProduct: [product],
        },
      ],
      {},
      {
        discountEnabled: true,
        discountType: "fixed_bundle_price",
        discountRules: [
          {
            id: "rule-1",
            conditionType: "quantity",
            conditionOperator: "lt",
            conditionValue: 2,
            discountValue: 4999,
            fixedBundlePrice: 9999,
          },
        ],
      },
      "gid://shopify/ProductVariant/999",
    ) as any;

    expect(config.steps[0].products[0]).toMatchObject({
      selectionId: "gid://shopify/Product/123",
      price: 1999,
      variants: expect.arrayContaining([
        expect.objectContaining({ selectionId: "gid://shopify/ProductVariant/111", price: 1999 }),
      ]),
    });
    expect(config.pricing.rules[0]).toMatchObject({
      conditionOperator: "lt",
      discountValue: 4999,
    });
    expect(config.pricing.rules[0]).not.toHaveProperty("fixedBundlePrice");
    expect(config).not.toHaveProperty("fullPageLayout");
  });
});
