import {
  buildRuntimeTokenPayload,
  generateCartTransformRuntimeTokenSecret,
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
          {
            productId: "gid://shopify/Product/2",
            variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/201" }],
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
      rules: [{
        id: "rule-1",
        conditionType: "quantity",
        conditionValue: 2,
        discountValue: 15,
      }],
    },
    personalizationData: null,
    ...overrides,
  };
}

describe("cart transform runtime token service", () => {
  it("signs and verifies the exact base64url payload string", () => {
    const payload = {
      version: 1,
    revision: "rev-1",
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      bundleName: "Daily Essentials",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 2 }],
      addons: [],
      countryRule: "",
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
    revision: "rev-1",
      shop: "test-shop.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      offerGroupId: "FBP-bundle-1_ABC",
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      bundleName: "Daily Essentials",
      components: [{ variantId: "gid://shopify/ProductVariant/101", quantity: 1 }],
      addons: [],
      countryRule: "",
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

  it("rejects selected components found only in persisted category products", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle({
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
    })).toThrow(/no cached selectable variants/i);
  });

  it("rejects category-only variants even when they contain variant gid fields", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle({
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
    })).toThrow(/no cached selectable variants/i);
  });

  it("rejects hydrated variants for products found only in category JSON", () => {
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
          productId: "gid://shopify/Product/5",
          quantity: 1,
        },
      ],
      addons: [],
    })).toThrow(/no cached selectable variants/i);
  });

  it("rejects hydrated variants that claim an unconfigured product", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle({
      steps: [
        {
          StepProduct: [
            {
              productId: "gid://shopify/Product/5",
              variants: [],
            },
          ],
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

  it("rejects variants present only in the legacy step JSON products field", () => {
    expect(() => validateRuntimeTokenSelection(makeBundle({
      steps: [{
        StepProduct: [],
        StepCategory: [],
        products: [{
          productId: "gid://shopify/Product/9",
          variants: [{ id: "gid://shopify/ProductVariant/901" }],
        }],
      }],
    }), {
      components: [{ variantId: "gid://shopify/ProductVariant/901", quantity: 1 }],
      addons: [],
    })).toThrow(/no cached selectable variants/i);
  });

  it("builds a signed payload from a validated DB bundle", () => {
    const payload = buildRuntimeTokenPayload({
      revision: "test-revision",
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({ steps: [makeBundle().steps[0], {
        isFreeGift: true, addonTiers: [{ discount: { type: 'PERCENTAGE', value: 10 } }],
        StepProduct: [{ productId: 'gid://shopify/Product/2', variants: [{ id: '201' }] }],
      }] }),
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
      revision: "test-revision",
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
    expect(payload.countryRule).toBe("");
  });

  it("signs the normalized persisted country rule into the payload", () => {
    const payload = buildRuntimeTokenPayload({
      revision: "test-revision",
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({
        offerPolicy: {
          countryTargetingEnabled: true,
          countryTargetingMode: "exclude",
          countryCodes: ["us", "CA", "ca"],
        },
      }),
      parentVariantId: "gid://shopify/ProductVariant/PARENT",
      offerGroupId: "FBP-bundle-1_ABC",
      bundleType: "full_page",
      selection: {
        components: [{ variantId: "102", quantity: 1 }],
        addons: [],
      },
    });

    expect(payload.countryRule).toBe("exclude:CA,US");
  });

  it.each(["full_page", "product_page"])(
    "includes only a saved selling plan for %s and validates recurring intent",
    (bundleType) => {
    const bundleSubscriptionConfig = {
      version: 1,
    revision: "rev-1",
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
      revision: "test-revision",
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
      revision: "test-revision",
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
      revision: "test-revision",
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
      version: 1,
    revision: "rev-1", enabled: true,
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
      revision: "test-revision",
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

  it("omits validation-only canonical product IDs from the signed runtime token payload", () => {
    const payload = buildRuntimeTokenPayload({
      resolvedProducts: new Map([["gid://shopify/ProductVariant/501", "gid://shopify/Product/5"]]),
      revision: "test-revision",
      shop: "test-shop.myshopify.com",
      bundle: makeBundle({
        steps: [
          {
            StepProduct: [
              {
                productId: "gid://shopify/Product/5",
                variants: [],
              },
            ],
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

it('does not authorize an arbitrary variant from a browser-supplied configured product ID', () => {
  expect(() => validateRuntimeTokenSelection(makeBundle(), {
    components: [{ variantId: '999', productId: 'gid://shopify/Product/1', quantity: 1 }], addons: [],
  })).toThrow('not part of bundle');
});
it('allows a new variant only with a Shopify-resolved configured product relationship', () => {
  expect(validateRuntimeTokenSelection(makeBundle(), {
    components: [{ variantId: '999', productId: 'gid://shopify/Product/2', quantity: 1 }], addons: [],
  }, new Map([['gid://shopify/ProductVariant/999', 'gid://shopify/Product/1']])).components[0].variantId)
    .toBe('gid://shopify/ProductVariant/999');
});
it('resolves missing cached variant membership using Shopify nodes and rejects incomplete answers', async () => {
  const { resolveRuntimeSelectionProducts } = await import('../../../app/services/cart-transform-runtime-token.server');
  const selection = { components: [{ variantId: '999', quantity: 1 }], addons: [] };
  const admin = { graphql: jest.fn().mockResolvedValue({ json: async () => ({ data: { nodes: [{ id: 'gid://shopify/ProductVariant/999', product: { id: 'gid://shopify/Product/1' } }] } }) }) };
  expect(await resolveRuntimeSelectionProducts(admin, makeBundle(), selection)).toEqual(new Map([['gid://shopify/ProductVariant/999', 'gid://shopify/Product/1']]));
  admin.graphql.mockResolvedValueOnce({ json: async () => ({ data: { nodes: [null] } }) });
  await expect(resolveRuntimeSelectionProducts(admin, makeBundle(), selection)).rejects.toThrow();
});

it('rejects add-on savings for ordinary components and percentages above the configured ceiling', () => {
  const selection = { components: [{ variantId: '101', quantity: 1 }], addons: [{ variantId: '201', quantity: 1, discount: { type: 'PERCENTAGE', value: 100 } }] };
  expect(() => validateRuntimeTokenSelection(makeBundle(), selection)).toThrow('add-on');
  const bundle = makeBundle({ steps: [makeBundle().steps[0], { isFreeGift: true, addonDisplayFree: false, addonTiers: [{ discount: { type: 'PERCENTAGE', value: 10 } }], StepProduct: [{ productId: 'gid://shopify/Product/2', variants: [{ id: '201' }] }] }] });
  expect(() => validateRuntimeTokenSelection(bundle, selection)).toThrow('configured');
  selection.addons[0].discount.value = 10;
  expect(validateRuntimeTokenSelection(bundle, selection).addons[0].discount?.value).toBe(10);
});

it('rejects an oversized selection before authorizing variants', () => {
  expect(() => validateRuntimeTokenSelection({}, { components: Array.from({ length: 11 }, () => ({ variantId: '1', quantity: 1 })) })).toThrow('BUNDLE_CART_LINE_LIMIT_EXCEEDED');
});
