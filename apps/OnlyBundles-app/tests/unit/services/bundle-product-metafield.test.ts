import { syncScheduledBundleDiscounts } from '../../../app/services/scheduled-bundle-discount.server';
import { BundleType } from "../../../app/constants/bundle";
import { updateBundleProductMetafields } from "../../../app/services/bundles/metafield-sync/operations/bundle-product.server";
import {
  getFirstVariantId,
  batchGetFirstVariantsWithPrices,
} from "../../../app/utils/variant-lookup.server";

jest.mock('../../../app/services/scheduled-bundle-discount.server', () => ({ syncScheduledBundleDiscounts: jest.fn().mockResolvedValue({}) }));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../app/utils/variant-lookup.server", () => ({
  getFirstVariantId: jest.fn(),
  batchGetFirstVariantsWithPrices: jest.fn(),
}));

const mockGetFirstVariantId = getFirstVariantId as jest.MockedFunction<typeof getFirstVariantId>;
const mockBatchGetFirstVariantsWithPrices = batchGetFirstVariantsWithPrices as jest.MockedFunction<typeof batchGetFirstVariantsWithPrices>;

function makeAdmin() {
  return {
    graphql: jest.fn().mockImplementation(async (_query: string, options?: any) => ({
      json: async () => ({ data: {
        productVariantsBulkUpdate: { productVariants: options?.variables?.variants ?? [], userErrors: [] },
        shop: { id: "gid://shopify/Shop/1", policy: null },
        metafieldsSet: { metafields: options?.variables?.metafields ?? [], userErrors: [] },
      } }),
    })),
  };
}

function makeBundleConfig(bundleType: BundleType, overrides: Record<string, unknown> = {}) {
  return {
    shopId: "test-shop.myshopify.com",
    id: "bundle-1",
    bundleId: "bundle-1",
    name: "Test Bundle",
    description: "Bundle description",
    status: "active",
    bundleType,
    shopifyProductId: "gid://shopify/Product/999",
    steps: [
      {
        id: "step-1",
        name: "Step 1",
        position: 0,
        minQuantity: 1,
        maxQuantity: 1,
        StepProduct: [{ productId: "gid://shopify/Product/123" }],
        collections: [],
      },
    ],
    pricing: {
      enabled: true,
      method: "percentage_off",
      rules: [
        {
          id: "rule-1",
          conditionType: "quantity",
          conditionValue: 1,
          discountValue: 10,
        },
      ],
      messages: {
        progress: "Add more",
        qualified: "Qualified",
        showDiscountMessaging: true,
      },
    },
    ...overrides,
  };
}

function getMetafieldsSetPayload(admin: ReturnType<typeof makeAdmin>) {
  const call = admin.graphql.mock.calls.find((entry: any[]) => entry[1]?.variables?.metafields);
  return call?.[1].variables.metafields;
}

describe("updateBundleProductMetafields", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFirstVariantId.mockResolvedValue({
      success: true,
      variantId: "gid://shopify/ProductVariant/111",
    } as any);

    mockBatchGetFirstVariantsWithPrices.mockResolvedValue(
      new Map([
        [
          "123",
          {
            success: true,
            variantId: "gid://shopify/ProductVariant/222",
            priceCents: 1200,
            title: "Component Product",
          },
        ],
      ]),
    );
  });

  it.each([undefined, "unknown"])(
    "rejects non-canonical bundle type %s before Shopify access",
    async (bundleType) => {
      const admin = makeAdmin();
      const config = makeBundleConfig(BundleType.PRODUCT_PAGE, { bundleType });

      await expect(
        updateBundleProductMetafields(
          admin,
          "gid://shopify/Product/999",
          config,
        ),
      ).rejects.toThrow("bundle_ui_config requires an exact bundleType");

      expect(mockGetFirstVariantId).not.toHaveBeenCalled();
      expect(admin.graphql).not.toHaveBeenCalled();
    },
  );

  it("publishes one canonical bundle identifier", async () => {
    const admin = makeAdmin();
    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const uiConfig = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );
    expect(uiConfig.id).toBe("bundle-1");
    expect(uiConfig).not.toHaveProperty("bundleId");
  });

  it.each([
    [BundleType.FULL_PAGE, { countryTargetingEnabled: true, countryTargetingMode: "include", countryCodes: ["ca", "US", "CA"] }, "include:CA,US"],
    [BundleType.PRODUCT_PAGE, { countryTargetingEnabled: true, countryTargetingMode: "exclude", countryCodes: ["US"] }, "exclude:US"],
    [BundleType.FULL_PAGE, { countryTargetingEnabled: false, countryCodes: ["US"] }, ""],
  ])("publishes parent country policy for %s", async (bundleType, offerPolicy, countryRule) => {
    const admin = makeAdmin();
    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", makeBundleConfig(bundleType as BundleType, { offerPolicy }));
    const fields = getMetafieldsSetPayload(admin);
    const pricing = JSON.parse(fields.find((field: any) => field.key === "price_adjustment").value);
    expect(pricing.countryRule).toBe(countryRule);
    expect(pricing.method).toBe("percentage_off");
    expect(fields.find((field: any) => field.key === "component_pricing")).toBeDefined();
  });

  it.each([
    { errors: [{ message: 'Access denied' }] },
    { data: {} },
    { data: { metafieldsSet: null } },
    { data: { metafieldsSet: { userErrors: [], metafields: null } } },
    { data: { metafieldsSet: { userErrors: [], metafields: [] } } },
    { data: { metafieldsSet: { userErrors: [{ code: 'STALE_OBJECT', message: 'Policy changed concurrently' }], metafields: [] } } },
  ])('rejects failed or incomplete metafield publication: %j', async (result) => {
    const admin = makeAdmin();
    const original = admin.graphql.getMockImplementation()!;
    admin.graphql.mockImplementation(async (query: string, options: any) => query.includes('SetBundleVariantMetafields')
      ? { json: async () => result } : original(query, options));
    await expect(updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', makeBundleConfig(BundleType.FULL_PAGE))).rejects.toThrow();
  });

  it('accepts Shopify JSON formatting without accepting changed values', async () => {
    const admin = makeAdmin();
    const original = admin.graphql.getMockImplementation()!;
    let corrupt = false;
    admin.graphql.mockImplementation(async (query: string, options?: any) => {
      if (!query.includes('SetBundleVariantMetafields')) return original(query, options);
      return { json: async () => ({ data: { metafieldsSet: { userErrors: [], metafields: options.variables.metafields.map((field: any) => ({
        ...field, value: JSON.stringify(corrupt && field.key === 'price_adjustment' ? {} : JSON.parse(field.value), null, 2),
      })) } } }) };
    });
    await expect(updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', makeBundleConfig(BundleType.FULL_PAGE))).resolves.toBeDefined();
    corrupt = true;
    await expect(updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', makeBundleConfig(BundleType.FULL_PAGE))).rejects.toThrow('confirm every');
  });

  it.each([
    { errors: [{ message: 'Denied' }] },
    { data: {} },
    { data: { productVariantsBulkUpdate: { userErrors: [{ message: 'Invalid variant' }], productVariants: [] } } },
    { data: { productVariantsBulkUpdate: { userErrors: [], productVariants: [] } } },
    { data: { productVariantsBulkUpdate: { userErrors: [], productVariants: [{ id: 'gid://shopify/ProductVariant/111', requiresComponents: false }] } } },
  ])('stops before publication when the native parent requirement is unconfirmed: %j', async (result) => {
    const admin = makeAdmin();
    admin.graphql.mockResolvedValue({ json: async () => result });
    await expect(updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', makeBundleConfig(BundleType.FULL_PAGE))).rejects.toThrow();
    expect(getMetafieldsSetPayload(admin)).toBeUndefined();
  });

  it('verifies native scheduled ownership before publishing its policy', async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, { offerPolicy: { scheduleMode: 'one_time', endsAt: '2030-01-01T00:00:00Z' } });
    await updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', config);
    expect(syncScheduledBundleDiscounts).toHaveBeenCalledWith(expect.objectContaining({ policy: expect.objectContaining({ bundleId: 'bundle-1', pricingMode: 'scheduled' }) }));
    const fields = getMetafieldsSetPayload(admin);
    const parent = JSON.parse(fields.find((f: any) => f.key === 'price_adjustment').value);
    const published = JSON.parse(fields.find((f: any) => f.key === 'ppb_policy_revisions').value)['bundle-1'];
    expect(parent).toMatchObject({ bundleId: 'bundle-1', revision: published.revision, shop: config.shopId });
    expect(published.pricingMode).toBe('scheduled');
    (syncScheduledBundleDiscounts as jest.Mock).mockRejectedValueOnce(new Error('Native capacity exhausted'));
    const failed = makeAdmin();
    await expect(updateBundleProductMetafields(failed as any, 'gid://shopify/Product/999', config)).rejects.toThrow('capacity');
    expect(getMetafieldsSetPayload(failed)).toBeUndefined();
  });

  it('projects quantities into critical pricing while preserving the public quantity field', async () => {
    const admin = makeAdmin();
    await updateBundleProductMetafields(admin as any, 'gid://shopify/Product/999', makeBundleConfig(BundleType.FULL_PAGE));
    const fields = getMetafieldsSetPayload(admin);
    expect(JSON.parse(fields.find((f: any) => f.key === 'price_adjustment').value).componentQuantities)
      .toEqual(JSON.parse(fields.find((f: any) => f.key === 'component_quantities').value));
  });

  it("rejects a storefront snapshot without its canonical id", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, { id: "" });

    await expect(updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      config,
    )).rejects.toThrow();
  });

  it("rejects critical pricing above the Function limit before metafieldsSet", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE);
    config.pricing.rules = Array.from({ length: 200 }, (_, index) => ({
      id: `rule-${index}`, conditionType: "quantity", conditionValue: index + 1, discountValue: 10,
    }));
    await expect(updateBundleProductMetafields(admin, "gid://shopify/Product/999", config))
      .rejects.toThrow("10000 bytes");
    expect(getMetafieldsSetPayload(admin)).toBeUndefined();
  });

  it("ignores legacy step JSON products during storefront serialization", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      steps: [
        {
          id: "step-legacy-json",
          name: "Legacy JSON only",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [],
          products: [
            {
              id: "gid://shopify/Product/999999",
              title: "Stale JSON product",
              variants: [
                {
                  id: "gid://shopify/ProductVariant/999999",
                  price: "42.00",
                },
              ],
            },
          ],
          collections: [],
        },
      ],
    });

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      config,
    );

    const metafields = getMetafieldsSetPayload(admin);
    const uiConfig = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );
    const componentReferences = JSON.parse(
      metafields.find((field: any) => field.key === "component_reference").value,
    );
    const componentQuantities = JSON.parse(
      metafields.find((field: any) => field.key === "component_quantities").value,
    );
    const componentPricing = JSON.parse(
      metafields.find((field: any) => field.key === "component_pricing").value,
    );

    expect(uiConfig.steps[0].products).toEqual([]);
    expect(componentReferences).toEqual([]);
    expect(componentQuantities).toEqual([]);
    expect(componentPricing).toEqual([]);
  });

  it("keeps optional step semantics while writing Shopify-valid component quantities", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      steps: [
        {
          id: "step-optional",
          name: "Optional step",
          position: 0,
          minQuantity: 0,
          maxQuantity: 10,
          StepProduct: [{ productId: "gid://shopify/Product/123" }],
          collections: [],
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    expect(JSON.parse(metafields.find((field: any) => field.key === "component_quantities").value)).toEqual([1]);
    const uiConfig = JSON.parse(metafields.find((field: any) => field.key === "bundle_ui_config").value);
    expect(uiConfig.steps[0].minQuantity).toBe(0);
  });

  it("does not publish the retired step imageUrl key", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [{ productId: "gid://shopify/Product/123" }],
          collections: [],
          imageUrl: "https://cdn.shopify.com/step-icon.png",
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0]).not.toHaveProperty("imageUrl");
  });

  it("emits the FPB public number for storefront redirects", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      publicNumber: 12,
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );

    expect(parsed.publicNumber).toBe(12);
  });

  it("does not invent the retired step imageUrl key", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", makeBundleConfig(BundleType.FULL_PAGE));

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0]).not.toHaveProperty("imageUrl");
  });

  it("maps stored Step Config image to public stepImage only", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [{ productId: "gid://shopify/Product/123" }],
          collections: [],
          timelineIconUrl: "https://cdn.example.test/step.png",
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0].stepImage).toBe("https://cdn.example.test/step.png");
    expect(parsed.steps[0]).not.toHaveProperty("timelineIconUrl");
  });

  it("passes Product Page Step Title through to bundle_ui_config steps", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1 - PPB Audit",
          pageTitle: "Build audit bundle",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [{ productId: "gid://shopify/Product/123" }],
          collections: [],
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0]).toEqual(
      expect.objectContaining({
        name: "Step 1 - PPB Audit",
        pageTitle: "Build audit bundle",
      }),
    );
  });

  it("does not publish the retired step bannerImageUrl key", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [{ productId: "gid://shopify/Product/123" }],
          collections: [],
          bannerImageUrl: "https://cdn.shopify.com/step-banner.jpg",
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0]).not.toHaveProperty("bannerImageUrl");
  });

  it("does not invent the retired step bannerImageUrl key", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", makeBundleConfig(BundleType.FULL_PAGE));

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0]).not.toHaveProperty("bannerImageUrl");
  });

  it("does not publish a Shopify Page handle for full-page bundles", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.FULL_PAGE),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const bundleUiConfigField = metafields.find((field: any) => field.key === "bundle_ui_config");
    const parsed = JSON.parse(bundleUiConfigField.value);

    expect(parsed.bundleType).toBe(BundleType.FULL_PAGE);
    expect(parsed).not.toHaveProperty("fullPagePageHandle");
  });

  it("does not publish a Shopify Page handle for product-page bundles", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const bundleUiConfigField = metafields.find((field: any) => field.key === "bundle_ui_config");
    const parsed = JSON.parse(bundleUiConfigField.value);

    expect(parsed.bundleType).toBe(BundleType.PRODUCT_PAGE);
    expect(parsed).not.toHaveProperty("fullPagePageHandle");
  });

  it("keeps compare-at visibility enabled when the persisted setting is false", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE, { showCompareAtPrices: false }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );

    expect(parsed.showProductComparedAtPrice).toBe(true);
  });

  it("keeps StepCategory products under categories in product-page bundle_ui_config steps", async () => {
    const admin = makeAdmin();
    const condition = { type: "quantity", condition: "greaterThanOrEqualTo", value: "01" };
    const selectedCollection = { id: "gid://shopify/Collection/333", handle: "frontpage", title: "Home page" };
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [{
            productId: "gid://shopify/Product/9427287703811",
            title: "123Luxury Armor Matte Case",
            variants: [
              { id: "gid://shopify/ProductVariant/48191691456771", price: "123.00" },
            ],
          }],
          StepCategory: [
            {
              id: "category98476",
              name: "Category 1 Direct Product Category",
              title: "Pick audit items",
              subTitle: "Choose products",
              sortOrder: 1,
              conditions: [condition],
              collections: [selectedCollection],
              categoryBanner: "https://cdn.example/category.png",
              displayVariantsAsIndividualProducts: true,
              variantSelectorMode: "color_swatch",
              swatchTooltipEnabled: true,
              multiLangData: { en: { title: "Pick audit items" } },
              products: [
                {
                  id: "gid://shopify/Product/9427287703811",
                  title: "123Luxury Armor Matte Case",
                  variants: [
                    { id: "gid://shopify/ProductVariant/48191691456771", price: "123.00" },
                  ],
                },
              ],
            },
          ],
          collections: [],
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0].products).toEqual([{ id: "gid://shopify/Product/9427287703811" }]);
    expect(parsed.steps[0].collections).toEqual([]);
    expect(parsed.steps[0].categories).toEqual([
      {
        id: "category98476",
        name: "Category 1 Direct Product Category",
        title: "Pick audit items",
        subTitle: "Choose products",
        sortOrder: 1,
        products: [
          {
            selectionId: "gid://shopify/Product/9427287703811",
            title: "123Luxury Armor Matte Case",
            variants: [
              {
                selectionId: "gid://shopify/ProductVariant/48191691456771",
                price: "123.00",
              },
            ],
          },
        ],
        collections: [selectedCollection],
        conditions: [condition],
        categoryBanner: "https://cdn.example/category.png",
        categoryImg: "",
        autoNextStepOnConditionMet: false,
        displayVariantsAsIndividualProducts: true,
        variantSelectorMode: "color_swatch",
        swatchTooltipEnabled: true,
        multiLangData: { en: { title: "Pick audit items" } },
      },
    ]);
  });

  it("resolves a repeated collection handle once across steps and categories", async () => {
    const admin = makeAdmin();
    admin.graphql.mockImplementation(async (query: string, options?: any) => {
      if (query.includes("BatchCollectionProductIds")) {
        return {
          json: async () => ({
            data: {
              collection0: {
                products: {
                  nodes: [{ id: "gid://shopify/Product/777" }],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
            },
          }),
        } as any;
      }
      return {
        json: async () => ({
          data: {
            shop: { id: "gid://shopify/Shop/1", policy: null },
            productVariantsBulkUpdate: { productVariants: options?.variables?.variants ?? [], userErrors: [] },
            metafieldsSet: {
              metafields: options?.variables?.metafields ?? [],
              userErrors: [],
            },
          },
        }),
      } as any;
    });
    mockBatchGetFirstVariantsWithPrices.mockResolvedValue(
      new Map([
        [
          "777",
          {
            success: true,
            variantId: "gid://shopify/ProductVariant/888",
            priceCents: 1500,
            title: "Collection Product",
          },
        ],
      ]),
    );
    const repeatedCollection = {
      id: "gid://shopify/Collection/333",
      handle: "frontpage",
      title: "Home page",
    };
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [],
          collections: [repeatedCollection],
          StepCategory: [
            {
              id: "category-1",
              name: "Category 1",
              products: [],
              collections: [repeatedCollection],
            },
          ],
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const collectionQueries = admin.graphql.mock.calls.filter(([query]) =>
      String(query).includes("collectionByIdentifier"),
    );
    expect(collectionQueries).toHaveLength(1);
    expect(mockBatchGetFirstVariantsWithPrices).toHaveBeenCalledWith(
      admin,
      ["gid://shopify/Product/777"],
    );
  });

  it("ignores StepCategory cached variants without canonical StepProduct membership", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.FULL_PAGE, {
      steps: [
        {
          id: "step-1",
          name: "Step 1",
          position: 0,
          minQuantity: 1,
          maxQuantity: 1,
          StepProduct: [],
          StepCategory: [
            {
              name: "Category 1",
              products: [
                {
                  id: "gid://shopify/Product/9427287703811",
                  title: "123Luxury Armor Matte Case",
                  variants: [
                    {
                      id: "gid://shopify/ProductVariant/48191691424003",
                      price: "123.00",
                    },
                    {
                      id: "gid://shopify/ProductVariant/48191691456771",
                      price: "123.00",
                    },
                  ],
                },
              ],
            },
          ],
          collections: [],
        },
      ],
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const componentReferences = JSON.parse(metafields.find((field: any) => field.key === "component_reference").value);

    expect(componentReferences).not.toEqual(expect.arrayContaining([
      "gid://shopify/ProductVariant/48191691424003",
      "gid://shopify/ProductVariant/48191691456771",
    ]));
  });

  it("emits direct Bundle Settings contracts into product-page bundle_ui_config without FPB Product Slots", async () => {
    const admin = makeAdmin();
    const directContracts = {
      defaultProductsData: {
        isDefaultProductsEnabled: true,
        defaultProductsTitle: "Preselected",
        products: [
          {
            productId: "9427287703811",
            graphqlId: "gid://shopify/Product/9427287703811",
            requiredQuantity: 1,
          },
        ],
      },
      validateQuantityPerProduct: {
        isEnabled: true,
        allowedQuantity: 1,
      },
      bundleTextConfig: {
        bundleSummary: {
          title: "Your Bundle",
          subTitle: "Review your bundle",
        },
      },
      bundleLevelCss: ".bundle-widget-product-page { outline: 1px solid blue; }",
    };

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE, {
        ...directContracts,
        productSlotsEnabled: true,
        productSlotIconUrl: "https://cdn.example.test/slot-icon.png",
      }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed).toEqual(expect.objectContaining(directContracts));
    expect(parsed.productSlotsEnabled).toBe(false);
    expect(parsed.productSlotIconUrl).toBeNull();
  });

  it("emits the low-stock contract into Shopify's product-page bundle_ui_config", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE, {
        lowStockAlertEnabled: true,
        lowStockAlertThreshold: 8,
        lowStockAlertMessage: "Hurry, {{stock}} remaining",
      }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );

    expect(parsed.lowStockAlert).toEqual({
      enabled: true,
      threshold: 8,
      message: "Hurry, {{stock}} remaining",
    });
  });

  it("emits the sticky add-to-cart contract into Shopify's product-page bundle_ui_config", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE, {
        stickyAddToCartEnabled: true,
        stickyAddToCartShowDesktop: false,
        stickyAddToCartShowMobile: true,
        stickyAddToCartAction: "add_selected_offer",
      }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );

    expect(parsed.stickyAddToCart).toEqual({
      enabled: true,
      showDesktop: false,
      showMobile: true,
      action: "add_selected_offer",
    });
  });

  it("emits countdown presentation with the scheduled offer end into bundle_ui_config", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE, {
        countdown: {
          layout: "full",
          position: "below",
          title: "Ends soon",
          expiryAction: "show_message",
          expiredMessage: "This offer has ended",
          endsAt: "2030-01-02T03:04:05.000Z",
        },
      }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );

    expect(parsed.countdown).toEqual({
      layout: "full",
      position: "below",
      title: "Ends soon",
      expiryAction: "show_message",
      expiredMessage: "This offer has ended",
      endsAt: "2030-01-02T03:04:05.000Z",
    });
  });

  it("emits direct full-page Add-ons personalization contract into bundle_ui_config", async () => {
    const admin = makeAdmin();
    const personalizationData = {
      isPersonalizationEnabled: true,
      addonProducts: {
        isEnabled: true,
        title: "Optional audit extras",
        type: "MULTI_TIER",
        tiers: [
          {
            tierId: "tier74285",
            title: "Audit Tier 1",
            selectedAddonProducts: [
              {
                id: "gid://shopify/Product/8322626126020",
                productId: "8322626126020",
                graphqlId: "gid://shopify/Product/8322626126020",
                title: "14k Dangling Obsidian Earrings",
                variants: [
                  {
                    variantId: "45038877868228",
                    variantGraphqlId: "gid://shopify/ProductVariant/45038877868228",
                    price: "829.00",
                    variantTitle: "Default Title",
                  },
                ],
              },
            ],
            eligibilityCondition: {
              type: "AMOUNT",
              value: 1,
              isValidateEligibilityConditionEnabled: true,
            },
            discount: { type: "PERCENTAGE", value: 10 },
            displayVariantsAsIndividualProducts_addons: false,
            conditions: [],
          },
        ],
        multiLangData: {},
        addonsMessaging: {
          isEnabled: true,
          tier1: {
            ineligibleState: "Add product(s) worth at least ##addonsConditionDiff## ##currencyUnit## more to claim ##addonsDiscountValue####addonsDiscountValueUnit## off on Add ons",
            eligibleState: "Congrats you are eligible for ##addonsDiscountValue####addonsDiscountValueUnit## off on Add ons",
          },
        },
      },
    };

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.FULL_PAGE, { personalizationData }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.personalizationData).toEqual(personalizationData);
  });

  it("includes direct full-page Add-ons selected variants in parent component metadata", async () => {
    const admin = makeAdmin();
    const personalizationData = {
      isPersonalizationEnabled: true,
      addonProducts: {
        isEnabled: true,
        tiers: [
          {
            selectedAddonProducts: [
              {
                graphqlId: "gid://shopify/Product/9999",
                title: "Selected Add-on",
                imageUrl: "https://cdn.shopify.com/addon.jpg",
                variants: [
                  {
                    variantGraphqlId: "gid://shopify/ProductVariant/ADDON",
                    price: "600.00",
                    variantTitle: "Default Title",
                  },
                ],
              },
            ],
            discount: { type: "PERCENTAGE", value: 10 },
          },
        ],
      },
    };

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.FULL_PAGE, { personalizationData }),
    );

    const metafields = getMetafieldsSetPayload(admin);
    const componentReferences = JSON.parse(metafields.find((field: any) => field.key === "component_reference").value);
    expect(componentReferences).toHaveLength(2);
    expect(componentReferences).toEqual(expect.arrayContaining([
      "gid://shopify/ProductVariant/222",
      "gid://shopify/ProductVariant/ADDON",
    ]));
    expect(JSON.parse(metafields.find((field: any) => field.key === "component_quantities").value)).toEqual([1, 1]);

    const componentPricing = JSON.parse(metafields.find((field: any) => field.key === "component_pricing").value);
    expect(componentPricing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variantId: "gid://shopify/ProductVariant/ADDON",
          retailPrice: 60000,
          imageUrl: "https://cdn.shopify.com/addon.jpg",
        }),
      ]),
    );
  });

  it("stores Buy X get Y price adjustment with buy/get metadata and total threshold", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      pricing: {
        enabled: true,
        method: "buy_x_get_y",
        rules: [
          {
            id: "rule-bxy",
            conditionType: "quantity",
            conditionValue: 2,
            discountValue: 100,
            customerBuys: 2,
            customerGets: 1,
            bxyDiscountType: "percentage",
            bxyApplyMode: "lowest_priced",
          },
        ],
        messages: {
          progress: "Add more",
          qualified: "Qualified",
          showDiscountMessaging: true,
        },
      },
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const priceAdjustmentField = metafields.find((field: any) => field.key === "price_adjustment");
    expect(JSON.parse(priceAdjustmentField.value)).toMatchObject({
      countryRule: "",
      method: "buy_x_get_y",
      value: 100,
      customerBuys: 2,
      customerGets: 1,
      discountType: "percentage",
      applyDiscountTo: "lowest_priced",
      conditions: {
        type: "quantity",
        operator: "gte",
        value: 3,
      },
      rules: [{
        method: "buy_x_get_y",
        value: 100,
        customerBuys: 2,
        customerGets: 1,
        discountType: "percentage",
        applyDiscountTo: "lowest_priced",
        conditions: {
          type: "quantity",
          operator: "gte",
          value: 3,
        },
      }],
    });
  });

  it.each([BundleType.FULL_PAGE, BundleType.PRODUCT_PAGE])(
    "writes only the normalized public subscription configuration for %s",
    async (bundleType) => {
      const admin = makeAdmin();
      const subscription = {
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
      translations: {},
      };

      await updateBundleProductMetafields(
        admin,
        "gid://shopify/Product/999",
        makeBundleConfig(bundleType, { bundleSubscriptionConfig: subscription }),
      );

      const metafields = getMetafieldsSetPayload(admin);
      const uiConfig = JSON.parse(metafields.find((field: any) => field.key === "bundle_ui_config").value);
      expect(uiConfig.subscription).toMatchObject({
        enabled: true,
        selectedPlanIds: ["gid://shopify/SellingPlan/1"],
      });
      expect(uiConfig.subscription.selectedGroup.plans[0]).toHaveProperty("position", 1);
    },
  );

  it.each([BundleType.FULL_PAGE, BundleType.PRODUCT_PAGE])(
    "omits disabled subscription drafts from bundle_ui_config for %s",
    async (bundleType) => {
      const admin = makeAdmin();

      await updateBundleProductMetafields(
        admin,
        "gid://shopify/Product/999",
        makeBundleConfig(bundleType, {
          bundleSubscriptionConfig: { enabled: false, selectedPlanIds: ["draft-plan"] },
        }),
      );

      const metafields = getMetafieldsSetPayload(admin);
      const uiConfig = JSON.parse(metafields.find((field: any) => field.key === "bundle_ui_config").value);
      expect(uiConfig).not.toHaveProperty("subscription");
    },
  );

  it("writes localized pricing and PPB add-on copy into bundle_ui_config", async () => {
    const admin = makeAdmin();
    const config = makeBundleConfig(BundleType.PRODUCT_PAGE, {
      steps: [{
        id: "step-1",
        name: "Extras",
        position: 0,
        minQuantity: 0,
        maxQuantity: 1,
        StepProduct: [{
          productId: "gid://shopify/Product/123",
          variants: [{ id: "gid://shopify/ProductVariant/222", price: "12.00" }],
        }],
        collections: [],
        isFreeGift: true,
        addonAddText: "Add extra",
        addonReplaceText: "Replace extra",
        multiLangData: { fr: { addonAddText: "Ajouter" } },
      }],
      pricing: {
        enabled: true,
        method: "percentage_off",
        rules: [],
        messages: { ruleMessages: { "addons-step-1": { discountText: "Add more" } } },
        ruleMessagesByLocale: {
          fr: { "addons-step-1": { discountText: "Ajoutez-en plus" } },
        },
        displayOptions: {
          bundleQuantityOptions: {
            optionsByLocaleByRuleId: { fr: { "rule-1": { label: "Deux" } } },
          },
        },
      },
    });

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", config);

    const metafields = getMetafieldsSetPayload(admin);
    const uiConfig = JSON.parse(
      metafields.find((field: any) => field.key === "bundle_ui_config").value,
    );
    expect(uiConfig.steps[0]).toEqual(expect.objectContaining({
      addonAddText: "Add extra",
      addonReplaceText: "Replace extra",
      multiLangData: { fr: { addonAddText: "Ajouter" } },
    }));
    expect(uiConfig.pricing.messages.ruleMessagesByLocale).toEqual({
      fr: { "addons-step-1": { discountText: "Ajoutez-en plus" } },
    });
    expect(uiConfig.pricing.displayOptions.bundleQuantityOptions.optionsByLocaleByRuleId)
      .toEqual({ fr: { "rule-1": { label: "Deux" } } });
  });

  it("writes the schema-v3 snapshot and current shop policy revision atomically", async () => {
    const admin: any = {
      graphql: jest.fn(async (query: string, _options?: any) => ({
        json: async () => {
          if (query.includes("BundlePolicyRevisions")) {
            return { data: { shop: {
              id: "gid://shopify/Shop/1",
              policy: { value: '{"bundle-1":"old"}', compareDigest: 'digest' },
            } } };
          }
          return { data: { productVariantsBulkUpdate: { productVariants: _options?.variables?.variants ?? [], userErrors: [] }, metafieldsSet: { metafields: _options?.variables?.metafields ?? [], userErrors: [] } } };
        },
      })),
    };

    await updateBundleProductMetafields(
      admin,
      "gid://shopify/Product/999",
      makeBundleConfig(BundleType.PRODUCT_PAGE),
    );

    const write = admin.graphql.mock.calls.find((call: any[]) => call[0].includes("SetBundleVariantMetafields"));
    const metafields = write?.[1]?.variables?.metafields ?? [];
    const snapshot = JSON.parse(metafields.find((field: any) => field.key === "bundle_ui_config").value);
    const revisionMap = JSON.parse(metafields.find((field: any) => field.key === "ppb_policy_revisions").value);

    expect(snapshot).toMatchObject({ schemaVersion: 3, runtimeAuthorization: { version: 2 } });
    expect(revisionMap["bundle-1"]).toEqual({ revision: snapshot.runtimeAuthorization.revision, pricingMode: "standard" });
  });
});
