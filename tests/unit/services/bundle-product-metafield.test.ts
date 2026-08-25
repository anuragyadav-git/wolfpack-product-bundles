import { BundleType } from "../../../app/constants/bundle";
import { updateBundleProductMetafields } from "../../../app/services/bundles/metafield-sync/operations/bundle-product.server";
import {
  getFirstVariantId,
  batchGetFirstVariantsWithPrices,
} from "../../../app/utils/variant-lookup.server";

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
    graphql: jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          shop: { id: "gid://shopify/Shop/1", policy: null },
          metafieldsSet: {
            metafields: [
              {
                key: "bundle_ui_config",
                value: "{}",
              },
            ],
            userErrors: [],
          },
        },
      }),
    }),
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
    shopifyPageHandle: bundleType === BundleType.FULL_PAGE ? "build-your-bundle" : null,
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

  it("passes imageUrl through to step map when present", async () => {
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

    expect(parsed.steps[0].imageUrl).toBe("https://cdn.shopify.com/step-icon.png");
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

  it("passes imageUrl as null when absent from step", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", makeBundleConfig(BundleType.FULL_PAGE));

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0].imageUrl).toBeNull();
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

  it("passes bannerImageUrl through to step map when present", async () => {
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

    expect(parsed.steps[0].bannerImageUrl).toBe("https://cdn.shopify.com/step-banner.jpg");
  });

  it("passes bannerImageUrl as null when absent from step", async () => {
    const admin = makeAdmin();

    await updateBundleProductMetafields(admin, "gid://shopify/Product/999", makeBundleConfig(BundleType.FULL_PAGE));

    const metafields = getMetafieldsSetPayload(admin);
    const parsed = JSON.parse(metafields.find((f: any) => f.key === "bundle_ui_config").value);

    expect(parsed.steps[0].bannerImageUrl).toBeNull();
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
          StepProduct: [],
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
              displayVariantsAsSwatches: false,
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
        displayVariantsAsSwatches: false,
        multiLangData: { en: { title: "Pick audit items" } },
      },
    ]);
  });

  it("includes StepCategory cached variants in parent component metadata", async () => {
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

    expect(componentReferences).toEqual(expect.arrayContaining([
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
            conditionType: "quantity",
            conditionValue: 2,
            discountValue: 100,
            customerBuys: 2,
            customerGets: 1,
            discountType: "percentage",
            applyDiscountTo: "lowest_priced",
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
    expect(JSON.parse(priceAdjustmentField.value)).toEqual({
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
          if (query.includes("PpbPolicyRevisions")) {
            return { data: { shop: {
              id: "gid://shopify/Shop/1",
              policy: { value: '{"bundle-1":"old"}' },
            } } };
          }
          return { data: { metafieldsSet: { metafields: [], userErrors: [] } } };
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
    expect(revisionMap["bundle-1"]).toBe(snapshot.runtimeAuthorization.revision);
  });
});
