import {
  buildRuntimeTokenPayload,
  generateCartTransformRuntimeTokenSecret,
  normalizeProductVariantGid,
  signRuntimeCartToken,
  type RuntimeTokenPayload,
  validateRuntimeTokenSelection,
  validateLiveSellingPlanSelection,
  verifyRuntimeCartToken,
} from "../../../app/services/cart-transform-runtime-token.server";

it("batches live selling-plan validation across selected component variants", async () => {
  const graphql = jest.fn()
    .mockResolvedValueOnce({
      json: async () => ({
        data: {
          nodes: [
            {
              id: "gid://shopify/ProductVariant/101",
              product: { id: "gid://shopify/Product/1" },
            },
            {
              id: "gid://shopify/ProductVariant/202",
              product: { id: "gid://shopify/Product/2" },
            },
          ],
        },
      }),
    })
    .mockResolvedValueOnce({
      json: async () => ({
        data: {
          node: {
            sellingPlans: { nodes: [{ id: "gid://shopify/SellingPlan/1" }] },
            product0: true,
            variant0: false,
            product1: false,
            variant1: true,
          },
        },
      }),
    });

  await expect(validateLiveSellingPlanSelection(
    { graphql },
    {
      sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
      sellingPlanId: "gid://shopify/SellingPlan/1",
      recurringBundleDiscount: false,
    },
    [
      { variantId: "gid://shopify/ProductVariant/101", quantity: 1 },
      { variantId: "gid://shopify/ProductVariant/202", quantity: 1 },
      { variantId: "gid://shopify/ProductVariant/101", quantity: 2 },
    ],
  )).resolves.toBeUndefined();

  expect(graphql).toHaveBeenCalledTimes(2);
  expect(graphql.mock.calls[0][0]).toContain("ResolveRuntimeSellingPlanVariants");
  expect(graphql.mock.calls[0][1]).toEqual({
    variables: {
      ids: [
        "gid://shopify/ProductVariant/101",
        "gid://shopify/ProductVariant/202",
      ],
    },
  });
  expect(graphql.mock.calls[1][0]).toContain("ValidateRuntimeSellingPlanAssignments");
  expect(graphql.mock.calls[1][1]).toEqual({
    variables: {
      id: "gid://shopify/SellingPlanGroup/1",
      productId0: "gid://shopify/Product/1",
      variantId0: "gid://shopify/ProductVariant/101",
      productId1: "gid://shopify/Product/2",
      variantId1: "gid://shopify/ProductVariant/202",
    },
  });
});

function makeBundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    shopId: "test-shop.myshopify.com",
    bundleType: "full_page",
    name: "Daily Essentials",
    shopifyProductId: "gid://shopify/Product/PARENT",
    steps: [
      {
        minQuantity: 1,
        StepProduct: [
          {
            productId: "gid://shopify/Product/1",
            variants: [
              { id: "gid://shopify/ProductVariant/101" },
              { variantId: "102" },
            ],
          },
        ],
        StepCategory: [
          {
            products: [
              {
                id: "gid://shopify/Product/2",
                variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/201" }],
              },
            ],
          },
        ],
      },
    ],
    pricing: {
      enabled: true,
      method: "percentage_off",
      rules: [{ conditionType: "quantity", conditionValue: 2, discountValue: 15 }],
    },
    personalizationData: null,
    ...overrides,
  };
}

describe("cart transform runtime token service", () => {
  it("normalizes Shopify variant IDs into ProductVariant GIDs", () => {
    expect(normalizeProductVariantGid("101")).toBe("gid://shopify/ProductVariant/101");
    expect(normalizeProductVariantGid(202)).toBe("gid://shopify/ProductVariant/202");
    expect(normalizeProductVariantGid("gid://shopify/ProductVariant/303")).toBe("gid://shopify/ProductVariant/303");
    expect(normalizeProductVariantGid("gid://shopify/Product/404")).toBeNull();
  });

  it("signs and verifies the exact base64url payload string", () => {
    const payload = {
      version: 1,
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      bundleName: "Daily Essentials",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 2 }],
      addons: [],
      priceAdjustment: { method: "percentage_off", value: 15 },
    } satisfies RuntimeTokenPayload;
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "api-secret");

    const token = signRuntimeCartToken(payload, secret);

    expect(verifyRuntimeCartToken(token, secret)).toEqual(payload);
  });

  it("rejects tampered payloads", () => {
    const secret = generateCartTransformRuntimeTokenSecret("test-shop.myshopify.com", "api-secret");
    const token = signRuntimeCartToken({
      version: 1,
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      bundleName: "Daily Essentials",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 1 }],
      addons: [],
      priceAdjustment: { method: "percentage_off", value: 15 },
    }, secret);
    const [payloadPart, signaturePart] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    payload.components[0].quantity = 2;
    const tamperedPayloadPart = Buffer.from(JSON.stringify(payload)).toString("base64url");

    expect(verifyRuntimeCartToken(`${tamperedPayloadPart}.${signaturePart}`, secret)).toBeNull();
  });

  it("validates selected components against the current bundle config", () => {
    const selection = validateRuntimeTokenSelection(makeBundle(), {
      components: [
        { variantId: "101", quantity: 1 },
        { variantId: "gid://shopify/ProductVariant/201", quantity: 2 },
      ],
      addons: [],
    });

    expect(selection.components).toEqual([
      { variantId: "gid://shopify/ProductVariant/101", quantity: 1 },
      { variantId: "gid://shopify/ProductVariant/201", quantity: 2 },
    ]);
  });

  it("validates selected components from persisted category products", () => {
    const selection = validateRuntimeTokenSelection(makeBundle({
      steps: [
        {
          StepProduct: [],
          StepCategory: [
            {
              products: [
                {
                  id: "gid://shopify/Product/3",
                  variants: [{ id: "gid://shopify/ProductVariant/301" }],
                },
              ],
            },
          ],
        },
      ],
    }), {
      components: [{ variantId: "301", quantity: 1 }],
      addons: [],
    });

    expect(selection.components).toEqual([
      { variantId: "gid://shopify/ProductVariant/301", quantity: 1 },
    ]);
  });

  it("validates selected components from persisted category products with variant gid fields", () => {
    const selection = validateRuntimeTokenSelection(makeBundle({
      steps: [
        {
          StepProduct: [],
          StepCategory: [
            {
              products: [
                {
                  id: "gid://shopify/Product/4",
                  variants: [{ id: "401", gid: "gid://shopify/ProductVariant/401" }],
                },
              ],
            },
          ],
        },
      ],
    }), {
      components: [{ variantId: "gid://shopify/ProductVariant/401", quantity: 1 }],
      addons: [],
    });

    expect(selection.components).toEqual([
      { variantId: "gid://shopify/ProductVariant/401", quantity: 1 },
    ]);
  });

  it("validates hydrated category variants by matching the configured product when cached variants are empty", () => {
    const selection = validateRuntimeTokenSelection(makeBundle({
      steps: [
        {
          StepProduct: [],
          StepCategory: [
            {
              products: [
                {
                  id: "gid://shopify/Product/5",
                  variants: [],
                },
              ],
            },
          ],
        },
      ],
    }), {
      components: [
        {
          variantId: "501",
          productId: "gid://shopify/Product/5",
          quantity: 1,
        },
      ],
      addons: [],
    });

    expect(selection.components).toEqual([
      { variantId: "gid://shopify/ProductVariant/501", quantity: 1 },
    ]);
  });

  it("rejects hydrated variants that claim an unconfigured product", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle({
      steps: [
        {
          StepProduct: [],
          StepCategory: [
            {
              products: [
                {
                  id: "gid://shopify/Product/5",
                  variants: [],
                },
              ],
            },
          ],
        },
      ],
    }), {
      components: [
        {
          variantId: "501",
          productId: "gid://shopify/Product/999",
          quantity: 1,
        },
      ],
      addons: [],
    })).toThrow(/not part of bundle/i);
  });

  it("rejects selected variants outside the bundle config", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle(), {
      components: [{ variantId: "gid://shopify/ProductVariant/999", quantity: 1 }],
      addons: [],
    })).toThrow(/not part of bundle/i);
  });

  it("builds a signed payload from a validated DB bundle", () => {
    const payload = buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle(),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "FBP-bundle-1_ABC",
      bundleType: "full_page",
      selection: {
        components: [{ variantId: "102", quantity: 1 }],
        addons: [{ variantId: "gid://shopify/ProductVariant/201", quantity: 1, discount: { type: "PERCENTAGE", value: 10 } }],
      },
    });

    expect(payload).toMatchObject({
      version: 1,
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      components: [{ variantId: "gid://shopify/ProductVariant/102", quantity: 1 }],
      addons: [{ variantId: "gid://shopify/ProductVariant/201", quantity: 1, discount: { type: "PERCENTAGE", value: 10 } }],
    });
    expect(payload.priceAdjustment).toMatchObject({
      method: "percentage_off",
      value: 15,
    });
  });

  it.each(["full_page", "product_page"])(
    "includes only a saved selling plan for %s and validates recurring intent",
    (bundleType) => {
    const bundleSubscriptionConfig = {
      version: 1,
      enabled: true,
      selectedGroup: {
        id: "gid://shopify/SellingPlanGroup/1",
        name: "Subscribe",
        options: [],
        plans: [{ id: "gid://shopify/SellingPlan/1", sourceName: "Monthly", options: [], position: 1, pricingPolicies: [] }],
      },
      selectedPlanIds: ["gid://shopify/SellingPlan/1"],
      defaultPurchaseOption: { kind: "selling_plan", sellingPlanId: "gid://shopify/SellingPlan/1" },
      oneTimePurchase: { enabled: true, title: "One time", description: "" },
      copy: { title: "Purchase options", subtitle: "", unavailableMessage: "Unavailable" },
      planCopy: { "gid://shopify/SellingPlan/1": { displayName: "Monthly", discountPill: "", description: "" } },
      showDiscountOnProductCards: false,
      recurringBundleDiscount: false,
      bundleDiscountAppliesOn: "both",
      translations: {},
    };
    const payload = buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({ bundleType, bundleSubscriptionConfig }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "bundle-1_SESSION",
      bundleType,
      selection: {
        components: [{ variantId: "101", quantity: 1 }],
        subscription: {
          sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
          sellingPlanId: "gid://shopify/SellingPlan/1",
          recurringBundleDiscount: false,
        },
      },
    });
    expect(payload.subscription).toEqual({
      sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
      sellingPlanId: "gid://shopify/SellingPlan/1",
      recurringBundleDiscount: false,
    });
    expect(() => buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({ bundleType, bundleSubscriptionConfig }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "bundle-1_SESSION",
      bundleType,
      selection: {
        components: [{ variantId: "101", quantity: 1 }],
        subscription: {
          sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
          sellingPlanId: "gid://shopify/SellingPlan/1",
          recurringBundleDiscount: true,
        },
      },
    })).toThrow(/recurring bundle discount selection/i);

    const recurringPayload = buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({
        bundleType,
        bundleSubscriptionConfig: { ...bundleSubscriptionConfig, recurringBundleDiscount: true },
      }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "bundle-1_SESSION",
      bundleType,
      selection: {
        components: [{ variantId: "101", quantity: 1 }],
        subscription: {
          sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
          sellingPlanId: "gid://shopify/SellingPlan/1",
          recurringBundleDiscount: true,
        },
      },
    });
    expect(recurringPayload.subscription?.recurringBundleDiscount).toBe(true);
    },
  );

  it.each([
    ["subscription", undefined, 0],
    ["subscription", "gid://shopify/SellingPlan/1", 15],
    ["one_time", undefined, 15],
    ["one_time", "gid://shopify/SellingPlan/1", 0],
  ])("targets bundle discounts to %s purchases", (target, planId, expectedValue) => {
    const bundleSubscriptionConfig = {
      version: 1, enabled: true,
      selectedGroup: { id: "gid://shopify/SellingPlanGroup/1", name: "Subscribe", options: [], plans: [{ id: "gid://shopify/SellingPlan/1", sourceName: "Monthly", options: [], position: 1, pricingPolicies: [] }] },
      selectedPlanIds: ["gid://shopify/SellingPlan/1"],
      defaultPurchaseOption: { kind: "one_time" },
      oneTimePurchase: { enabled: true, title: "One time", description: "" },
      copy: { title: "Purchase options", subtitle: "", unavailableMessage: "Unavailable" },
      planCopy: { "gid://shopify/SellingPlan/1": { displayName: "Monthly", discountPill: "", description: "" } },
      showDiscountOnProductCards: false, recurringBundleDiscount: false,
      bundleDiscountAppliesOn: target, translations: {},
    };
    const payload = buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({ bundleSubscriptionConfig }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "bundle-1_SESSION",
      bundleType: "full_page",
      selection: {
        components: [{ variantId: "101", quantity: 1 }],
        ...(planId ? { subscription: {
          sellingPlanGroupId: "gid://shopify/SellingPlanGroup/1",
          sellingPlanId: planId,
          recurringBundleDiscount: false,
        } } : {}),
      },
    });
    expect((payload.priceAdjustment as any).value).toBe(expectedValue);
  });

  it("omits validation-only product IDs from the signed runtime token payload", () => {
    const payload = buildRuntimeTokenPayload({
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({
        steps: [
          {
            StepProduct: [],
            StepCategory: [
              {
                products: [
                  {
                    id: "gid://shopify/Product/5",
                    variants: [],
                  },
                ],
              },
            ],
          },
        ],
      }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "MIX-bundle-1_ABC",
      bundleType: "product_page",
      selection: {
        components: [{ variantId: "501", productId: "gid://shopify/Product/5", quantity: 1 }],
        addons: [],
      },
    });

    expect(payload.components).toEqual([
      { variantId: "gid://shopify/ProductVariant/501", quantity: 1 },
    ]);
  });
});
