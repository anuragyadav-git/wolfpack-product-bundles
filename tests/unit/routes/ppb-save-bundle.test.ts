/**
 * Unit tests — PPB handleSaveBundle
 *
 * Spec: test-spec/edit-bundle-flow.spec.md § Suite 4
 * Issue: [edit-bundle-flow-tests-1]
 */

import { handleSaveBundle } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/handlers.server";
import {
  updateBundleProductMetafields,
} from "../../../app/services/bundles/metafield-sync.server";
import { syncBundleStorefrontNow } from "../../../app/services/bundles/storefront-sync.server";
import { AddOnDiscountFunctionService } from "../../../app/services/addon-discount-function-service.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn().mockResolvedValue({
    entitlements: {
      planCode: "GROWTH",
      billingInterval: "MONTHLY",
      limits: { publicBundles: null, enabledSteps: null },
      capabilities: {
        premiumTemplates: true,
        advancedDesign: true,
        advancedAnalytics: true,
        prioritySupport: true,
        unlimitedDrafts: true,
      },
    },
  }),
}));

jest.mock("../../../app/services/subscriptions/design-entitlement-state.server", () => ({
  shopUsesAdvancedDesign: jest.fn().mockResolvedValue(false),
}));

jest.mock("../../../app/services/subscriptions/bundle-entitlement-gate.server", () => ({
  updateBundleWithPublicationGate: jest.fn((input) => input.database.bundle.update({
    where: { id: input.bundleId, shopId: input.shopDomain },
    data: input.data,
    ...(input.include ? { include: input.include } : {}),
  })),
}));


jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../app/services/bundles/metafield-sync.server", () => ({
  updateBundleProductMetafields: jest.fn().mockResolvedValue(undefined),
  updateComponentProductMetafields: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../app/services/bundles/storefront-sync.server", () => ({
  compactBundleForConfigureResponse: jest.fn((bundle: any) => ({
    id: bundle.id,
    bundleType: bundle.bundleType,
    status: bundle.status,
    name: bundle.name,
    description: bundle.description ?? null,
    shopifyProductId: bundle.shopifyProductId ?? null,
    shopifyProductHandle: bundle.shopifyProductHandle ?? null,
    shopifyPageId: bundle.shopifyPageId ?? null,
    shopifyPageHandle: bundle.shopifyPageHandle ?? null,
    shopifyPreviewPageId: bundle.shopifyPreviewPageId ?? null,
    shopifyPreviewPageHandle: bundle.shopifyPreviewPageHandle ?? null,
  })),
  syncBundleStorefrontNow: jest.fn().mockResolvedValue({
    skipped: false,
    synced: true,
    stats: {},
  }),
}));

jest.mock("../../../app/services/addon-discount-function-service.server", () => ({
  AddOnDiscountFunctionService: {
    completeSubscriptionInitialSetup: jest.fn().mockResolvedValue({ success: true }),
    completeSubscriptionRecurringSetup: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("../../../app/utils/variant-lookup.server", () => ({
  getBundleProductVariantId: jest
    .fn()
    .mockResolvedValue("gid://shopify/ProductVariant/999"),
}));

jest.mock("../../../app/services/theme-colors.server", () => ({
  syncThemeColors: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../app/services/widget-installation.server", () => ({
  WidgetInstallationService: {
    validateProductBundleWidgetSetup: jest.fn(),
  },
}));

jest.mock("../../../app/services/theme-template.server", () => ({
  ThemeTemplateService: { ensureTemplates: jest.fn() },
}));

jest.mock("../../../app/lib/variant-existence.server", () => ({
  validateVariantIdFromShopify: jest.fn(async (rawVariantId: string | number) => {
    const normalized = String(rawVariantId || "").trim();
    if (!normalized) {
      return {
        numericId: "",
        isValidFormat: false,
        reason: "Variant id is required.",
      };
    }

    const gidMatch = /^gid:\/\/shopify\/ProductVariant\/(\d+)$/.exec(normalized);
    if (gidMatch) {
      return { numericId: gidMatch[1], isValidFormat: true };
    }

    if (/^\d+$/.test(normalized)) {
      return { numericId: normalized, isValidFormat: true };
    }

    return {
      numericId: "",
      isValidFormat: false,
      reason: "Variant id format is invalid. Expected numeric or gid://shopify/ProductVariant/<id>.",
    };
  }),
  batchCheckStorefrontVariants: jest.fn(async (_shop: string, ids: string[]) => new Map(
    ids.map((id) => [id, { ok: true, id, status: 200 }]),
  )),
}));

jest.mock("../../../app/lib/css-sanitizer", () => ({
  processCss: jest.fn((css: string) => ({
    sanitizedCss: css,
    isValid: true,
    warnings: [],
    syntaxErrors: [],
  })),
}));

const getDb = () => require("../../../app/db.server").default;

const MOCK_SESSION = {
  shop: "test-shop.myshopify.com",
  accessToken: "test-token",
} as any;

const MOCK_ADMIN = {
  graphql: jest.fn().mockResolvedValue({
    json: async () => ({
      data: {
        productUpdate: {
          product: { id: "gid://shopify/Product/1", status: "ACTIVE" },
          userErrors: [],
        },
      },
    }),
  }),
} as any;

function makeStep(
  overrides: Partial<{
    id: string;
    minQuantity: number | string | null;
    maxQuantity: number | string | null;
    enabled: boolean;
    pageTitle: string;
    stepImage: string | null;
    multiLangData: Record<string, Record<string, string>>;
    StepProduct: any[];
    StepCategory: any[];
    collections: any[];
  }> = {}
) {
  return {
    id: "step-1",
    name: "Step 1",
    pageTitle: "",
    minQuantity: 1,
    maxQuantity: 5,
    enabled: true,
    products: [{ id: "validation-product" }],
    collections: [],
    StepProduct: [],
    StepCategory: [],
    ...overrides,
  };
}

function makeDiscountData(overrides: Record<string, unknown> = {}) {
  const result: any = {
    discountEnabled: false,
    discountType: "percentage_off",
    discountRules: [],
    showFooter: true,
    discountMessagingEnabled: false,
    ruleMessages: {},
    displayOptions: null,
    ...overrides,
  };
  if (result.discountEnabled) {
    result.discountRules = result.discountRules.map((rule: any) => ({
      conditionType: "quantity",
      conditionValue: 1,
      ...rule,
    }));
    if (result.discountMessagingEnabled) {
      result.ruleMessages = Object.fromEntries(result.discountRules.map((rule: any) => [
        rule.id,
        result.ruleMessages?.[rule.id] ?? {
          discountText: "Add more to save",
          successMessage: "Discount applied",
        },
      ]));
      result.successMessage ||= "Discount applied";
    }
    const progress = result.displayOptions?.progressBar;
    if (progress?.enabled && progress.type === "step_based") {
      result.tierTextByRuleId = Object.fromEntries(result.discountRules.map((rule: any) => [
        rule.id,
        result.tierTextByRuleId?.[rule.id] ?? {
          tierText: "Tier",
          tierSubtext: "Savings",
        },
      ]));
    }
  }
  return result;
}

function makeFormData(overrides: Record<string, string | null> = {}): FormData {
  const fd = new FormData();
  fd.set("bundleName", "PPB Bundle");
  fd.set("bundleDescription", "A PPB bundle");
  fd.set("bundleStatus", "draft");
  fd.set("stepsData", JSON.stringify([makeStep()]));
  fd.set("discountData", JSON.stringify(makeDiscountData()));
  fd.set("stepConditions", "{}");
  fd.set("showProductPrices", "true");
  fd.set("allowQuantityChanges", "true");
  fd.set("cartRedirectToCheckout", "false");
  fd.set("sdkMode", "false");
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) fd.delete(k);
    else fd.set(k, v);
  }
  return fd;
}

function makeUpdatedBundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    name: "PPB Bundle",
    description: "A PPB bundle",
    status: "draft",
    shopifyProductId: null,
    shopifyProductHandle: null,
    bundleType: "product_page",
    templateName: null,
    steps: [],
    pricing: null,
    ...overrides,
  };
}

function makeBundleUpsellConfig(overrides: Record<string, unknown> = {}) {
  return {
    multiLangText: {},
    widgetConfiguration: {
      isEnabled: true,
      type: "OFFER_WIDGET",
      imageUrl: "https://cdn.example.test/widget.png",
      title: "Bundle & Save",
      description: "",
      buttonText: "Buy With Bundle",
      displayConfiguration: {
        showOnAllBundleProducts: true,
        selectedProducts: [],
        showOnSpecificProductPages: [],
        collectionsSelectedData: [],
        showOnSpecificCollectionPages: [],
      },
      useLinkProductAsDefaultProduct: false,
    },
    upsellConfiguration: {
      isEnabled: true,
      title: "Build Your Bundle & Save More",
      subTitle: "",
      displayConfiguration: {
        showOnAllBundleProducts: true,
        selectedProducts: [],
        showOnSpecificProductPages: [],
        collectionsSelectedData: [],
        showOnSpecificCollectionPages: [],
      },
      useLinkProductAsDefaultProduct: false,
    },
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  MOCK_ADMIN.graphql.mockResolvedValue({
    json: async () => ({
      data: {
        productUpdate: {
          product: { id: "gid://shopify/Product/1", status: "ACTIVE" },
          userErrors: [],
        },
      },
    }),
  });
  getDb().bundle.findUnique.mockResolvedValue({ shopifyProductId: null, shopifyProductHandle: null });
  getDb().bundle.update.mockResolvedValue(makeUpdatedBundle());
});

describe("PPB handleSaveBundle — no shopifyProductId (skips metafields)", () => {
  it("returns success JSON on happy path", async () => {
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData()
    );
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.message).toBe("Updated Successfully!");
  });

  it("ignores compare-at visibility fields in PPB save payloads", async () => {
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ showCompareAtPrices: "false" }),
    );

    const updateArgs = getDb().bundle.update.mock.calls[0][0];
    expect(updateArgs.data).not.toHaveProperty("showCompareAtPrices");
  });

  it("persists a normalized enabled subscription config and activates the initial-order role", async () => {
    const config = {
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
    const response = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ bundleSubscriptionConfig: JSON.stringify(config) }),
    );
    expect(response.status).toBe(200);
    const persisted = getDb().bundle.update.mock.calls[0][0].data.bundleSubscriptionConfig;
    expect(persisted).toMatchObject({
      enabled: true,
      selectedPlanIds: ["gid://shopify/SellingPlan/1"],
    });
    expect(persisted.selectedGroup.plans[0]).toHaveProperty("position", 1);
    expect(AddOnDiscountFunctionService.completeSubscriptionInitialSetup).toHaveBeenCalledWith(
      MOCK_ADMIN,
      MOCK_SESSION.shop,
    );
  });

  it("blocks enabled subscriptions for Buy X Get Y before persistence or sync", async () => {
    const config = {
      version: 1,
      enabled: true,
      selectedGroup: null,
      selectedPlanIds: [],
      defaultPurchaseOption: { kind: "one_time" },
      oneTimePurchase: { enabled: true, title: "One time", description: "" },
      copy: { title: "Purchase options", subtitle: "", unavailableMessage: "Unavailable" },
      planCopy: {}, showDiscountOnProductCards: false, recurringBundleDiscount: false, translations: {},
    };
    const response = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        bundleSubscriptionConfig: JSON.stringify(config),
        discountData: JSON.stringify(makeDiscountData({ discountType: "buy_x_get_y" })),
      }),
    );
    expect(response.status).toBe(400);
    expect(getDb().bundle.update).not.toHaveBeenCalled();
    expect(syncBundleStorefrontNow).not.toHaveBeenCalled();
  });

  it("returns structured field errors and does not persist an invalid draft", async () => {
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        bundleName: "",
        stepsData: JSON.stringify([makeStep({ products: [], StepProduct: [], collections: [] } as any)]),
      }),
    );
    const body = await res.json() as any;

    expect(res.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: "Fix the highlighted fields before saving.",
      fieldErrors: expect.arrayContaining([
        { path: "bundle.name", message: "Enter a bundle name." },
        {
          path: "steps.step-1.resources",
          message: "Add at least one product or collection.",
        },
      ]),
    });
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("persists Step 1 as enabled and allows a later step to be disabled", async () => {
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        stepsData: JSON.stringify([
          makeStep({ id: "step-1", enabled: false }),
          makeStep({ id: "step-2", enabled: false }),
        ]),
      }),
    );

    const savedSteps = getDb().bundle.update.mock.calls[0][0].data.steps.create;
    expect(savedSteps.map((step: any) => step.enabled)).toEqual([true, false]);
  });

  it("allows an exact step rule with bundle-total discount tiers and stale hidden bounds", async () => {
    const stepConditions = {
      "step-1": [
        {
          type: "quantity",
          operator: "equal_to",
          value: "2",
        },
      ],
    };
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        stepsData: JSON.stringify([makeStep({ minQuantity: 0, maxQuantity: 0 })]),
        stepConditions: JSON.stringify(stepConditions),
        discountData: JSON.stringify(makeDiscountData({
          discountEnabled: true,
          discountRules: [
            { conditionType: "quantity", conditionValue: 2, discountValue: 5 },
            { conditionType: "quantity", conditionValue: 4, discountValue: 15 },
          ],
        })),
      }),
    );

    const body = await res.json() as any;
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(getDb().bundle.update).toHaveBeenCalled();
  });

  it("rejects contradictory merchant-authored step rules", async () => {
    const stepConditions = {
      "step-1": [
        {
          type: "quantity",
          operator: "greater_than_or_equal_to",
          value: "4",
        },
        {
          type: "quantity",
          operator: "less_than_or_equal_to",
          value: "2",
        },
      ],
    };
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        stepsData: JSON.stringify([makeStep({ minQuantity: 0, maxQuantity: 0 })]),
        stepConditions: JSON.stringify(stepConditions),
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.error).toContain("cannot both be satisfied");
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("preserves an optional category step without forcing a shopper selection", async () => {
    const stepsData = [
      makeStep({
        minQuantity: 0,
        StepCategory: [
          {
            id: "category-1",
            products: [{ id: "gid://shopify/Product/123", variants: [] }],
          },
        ],
      }),
    ];

    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(getDb().bundle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          steps: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ minQuantity: 0 }),
            ]),
          }),
        }),
      }),
    );
    expect(updateBundleProductMetafields).not.toHaveBeenCalled();
  });

  it("returns 400 before Prisma when bundle status is empty", async () => {
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ bundleStatus: "" })
    );

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/invalid bundle status/i);
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("does NOT call metafield services when shopifyProductId is absent", async () => {
    await handleSaveBundle(MOCK_ADMIN, MOCK_SESSION, "bundle-1", makeFormData());
    expect(updateBundleProductMetafields).not.toHaveBeenCalled();
    expect(syncBundleStorefrontNow).not.toHaveBeenCalled();
  });

  it("preserves draft status when a step has StepProduct", async () => {
    const stepsData = [
      makeStep({
        StepProduct: [
          { id: "gid://shopify/Product/111", title: "Item A", imageUrl: null },
        ],
      }),
    ];
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) })
    );
    expect(getDb().bundle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "draft" }),
      })
    );
  });

  it("preserves draft status when a StepCategory contains products", async () => {
    const stepsData = [
      makeStep({
        StepCategory: [
          {
            name: "Cat A",
            sortOrder: 0,
            products: [{ id: "gid://shopify/Product/222", title: "P" }],
            collections: [],
          },
        ],
      }),
    ];
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) })
    );
    expect(getDb().bundle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "draft" }),
      })
    );
  });

  it("preserves active status on save", async () => {
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ bundleStatus: "active" })
    );
    expect(getDb().bundle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "active" }),
      })
    );
  });

  it("rejects a draft when its configured category is empty", async () => {
    const stepsData = [
      makeStep({
        StepCategory: [{ name: "Empty", sortOrder: 0, products: [], collections: [] }],
      }),
    ];
    const response = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) })
    );
    expect(response.status).toBe(400);
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("rejects save when a persisted variant reference has an invalid format", async () => {
    const stepsData = [
      makeStep({
        StepProduct: [
          {
            id: "gid://shopify/Product/111",
            title: "Invalid Variant Product",
            variants: [{ variantId: "bad-variant-format" }],
          },
        ],
      }),
    ];

    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.context?.route).toBe("ppb-save");
    expect(body.error).toContain("ppb-save blocked on step 1");
    expect(body.context?.reason).toBe("invalid-format");
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("rejects save when a persisted variant does not exist on Shopify", async () => {
    const { batchCheckStorefrontVariants } = require("../../../app/lib/variant-existence.server");
    (batchCheckStorefrontVariants as jest.Mock).mockResolvedValueOnce(new Map([["999", {
      ok: false, id: "999", status: 404, message: "Variant lookup failed with status 404",
    }]]));

    const stepsData = [
      makeStep({
        StepProduct: [
          {
            id: "gid://shopify/Product/111",
            title: "Missing Variant Product",
            variants: [{ variantId: "gid://shopify/ProductVariant/999" }],
          },
        ],
      }),
    ];

    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.context?.route).toBe("ppb-save");
    expect(body.error).toContain("is not available on storefront (404)");
    expect(body.context?.status).toBe(404);
    expect(getDb().bundle.update).not.toHaveBeenCalled();
  });

  it("validates unique persisted variants in one storefront batch", async () => {
    const { batchCheckStorefrontVariants } = require("../../../app/lib/variant-existence.server");
    const stepsData = [makeStep({
      StepProduct: [{
        id: "gid://shopify/Product/111",
        title: "Variants",
        variants: [
          { variantId: "gid://shopify/ProductVariant/111" },
          { variantId: "222" },
          { variantId: "gid://shopify/ProductVariant/111" },
        ],
      }],
    })];

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    expect(batchCheckStorefrontVariants).toHaveBeenCalledTimes(1);
    expect(batchCheckStorefrontVariants).toHaveBeenCalledWith(
      MOCK_SESSION.shop,
      ["111", "222"],
    );
  });

  it("passes variantSelectorEnabled=false to DB when form has false", async () => {
    const fd = makeFormData({ variantSelectorEnabled: "false" });
    await handleSaveBundle(MOCK_ADMIN, MOCK_SESSION, "bundle-1", fd);
    expect(getDb().bundle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ variantSelectorEnabled: false }),
      })
    );
  });

  it("creates StepCategory records in DB with correct shape", async () => {
    const categoryCondition = { type: "quantity", condition: "greaterThanOrEqualTo", value: "01" };
    const categoryProduct = {
      id: "gid://shopify/Product/777",
      productId: "777",
      graphqlId: "gid://shopify/Product/777",
      handle: "widget",
      title: "Widget",
      variants: [{ variantGraphqlId: "gid://shopify/ProductVariant/888" }],
    };
    const selectedCollection = {
      id: "gid://shopify/Collection/333",
      handle: "frontpage",
      title: "Home page",
      productsCount: 1,
    };
    const stepsData = [
      makeStep({
        StepCategory: [
          {
            id: "category98476",
            name: "Cat B",
            title: "Pick audit items",
            subTitle: "Choose products",
            sortOrder: 1,
            conditions: [categoryCondition],
            autoNextStepOnConditionMet: true,
            products: [categoryProduct],
            collections: [selectedCollection],
            categoryBanner: "https://cdn.example/category.png",
            displayVariantsAsIndividualProducts: true,
            variantSelectorMode: "color_swatch",
            swatchTooltipEnabled: true,
            multiLangData: { en: { title: "Pick audit items" } },
          },
        ],
      }),
    ];
    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) })
    );
    const updateCall = getDb().bundle.update.mock.calls[0][0];
    const stepCreate = updateCall.data.steps.create[0];
    expect(stepCreate.StepCategory.create[0]).toMatchObject({
      id: "category98476",
      name: "Cat B",
      title: "Pick audit items",
      subTitle: "Choose products",
      sortOrder: 1,
      conditions: [categoryCondition],
      autoNextStepOnConditionMet: true,
      products: [categoryProduct],
      collections: [selectedCollection],
      categoryBanner: "https://cdn.example/category.png",
      displayVariantsAsIndividualProducts: true,
      variantSelectorMode: "color_swatch",
      swatchTooltipEnabled: true,
      multiLangData: { en: { title: "Pick audit items" } },
    });
  });

  it("persists Product Page Step Title and translations to the step record", async () => {
    const stepsData = [
      makeStep({
        pageTitle: "Build audit bundle",
        multiLangData: {
          es: {
            productPageStepText: "Paso auditoria",
            productPageSubtext: "Construye paquete auditoria",
          },
        },
        StepProduct: [
          { id: "gid://shopify/Product/111", title: "Item A", imageUrl: null },
        ],
      }),
    ];

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.steps.create[0]).toEqual(
      expect.objectContaining({
        pageTitle: "Build audit bundle",
        multiLangData: {
          es: {
            productPageStepText: "Paso auditoria",
            productPageSubtext: "Construye paquete auditoria",
          },
        },
      }),
    );
  });

  it("persists PPB add-on tier quantity and discount configuration", async () => {
    const addonTiers = [{
      tierId: "tier-1",
      maxQuantity: 3,
      eligibilityCondition: { type: "QUANTITY", value: 2 },
      discount: { type: "PERCENTAGE", value: 25 },
    }];
    const stepsData = [makeStep({
      isFreeGift: true,
      addonLabel: "Add-on",
      addonTitle: "Choose an add-on",
      addonDisplayFree: false,
      addonTiers,
    } as any)];

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) }),
    );

    const stepCreate = getDb().bundle.update.mock.calls[0][0].data.steps.create[0];
    expect(stepCreate).toMatchObject({
      isFreeGift: true,
      addonDisplayFree: false,
      addonTiers,
    });
  });

  it("returns 500 when a StepProduct has a UUID ID", async () => {
    const stepsData = [
      makeStep({
        StepProduct: [
          {
            id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            title: "Bad",
            imageUrl: null,
          },
        ],
      }),
    ];
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ stepsData: JSON.stringify(stepsData) })
    );
    expect(res.status).toBe(500);
    const body = await res.json() as any;
    expect(body.error).toMatch(/corrupted browser state/i);
  });

  it("returns 500 and error message when DB throws", async () => {
    getDb().bundle.update.mockRejectedValue(new Error("Prisma error"));
    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData()
    );
    expect(res.status).toBe(500);
    const body = await res.json() as any;
    expect(body.error).toContain("Prisma error");
  });

  it("stores fixedBundlePrice on rule when discountType is fixed_bundle_price", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "fixed_bundle_price",
      discountRules: [{ id: "rule-1", discountValue: 7900 }],
    });
    const fd = makeFormData({ discountData: JSON.stringify(discountData) });
    await handleSaveBundle(MOCK_ADMIN, MOCK_SESSION, "bundle-1", fd);
    const updateCall = getDb().bundle.update.mock.calls[0][0];
    const pricingRules = updateCall.data.pricing.upsert.create.rules;
    expect(pricingRules[0].fixedBundlePrice).toBe(7900);
  });

  it("derives direct boxSelection from Product Page quantity discount display options", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [
        {
          id: "rule-2",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 5,
        },
      ],
      displayOptions: {
        bundleQuantityOptions: {
          enabled: true,
          defaultRuleId: "rule-2",
          optionsByRuleId: {
            "rule-2": { label: "Box of 2", subtext: "5% off" },
          },
          optionsByLocaleByRuleId: {},
        },
        progressBar: {
          enabled: true,
          type: "step_based",
          progressText: "Add {{conditionText}} to unlock {{discountText}}",
          successText: "{{discountText}} unlocked",
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ discountData: JSON.stringify(discountData) }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.boxSelection).toEqual({
      isEnabled: true,
      validateBoxSelectionQuantity: false,
      rules: [
        {
          ruleId: "rule-2",
          boxQuantity: 2,
          boxLabel: "Box of 2",
          boxSubtext: "5% off",
          isDefaultSelected: true,
        },
      ],
    });
    expect(updateCall.data.pricing.upsert.create.displayOptions).toEqual(discountData.displayOptions);
  });

  it("wires Bundle Settings quantity validation into direct Product Page boxSelection", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [
        {
          id: "rule-2",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 5,
        },
      ],
      displayOptions: {
        bundleQuantityOptions: {
          enabled: true,
          defaultRuleId: "rule-2",
          optionsByRuleId: {
            "rule-2": { label: "Box of 2", subtext: "5% off" },
          },
          optionsByLocaleByRuleId: {},
        },
        progressBar: {
          enabled: true,
          type: "step_based",
          progressText: "Add {{conditionText}} to unlock {{discountText}}",
          successText: "{{discountText}} unlocked",
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        discountData: JSON.stringify(discountData),
        productSlotsEnabled: "true",
        validateQuantityPerProduct: JSON.stringify({ isEnabled: true, allowedQuantity: 1 }),
      }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.boxSelection).toMatchObject({
      isEnabled: true,
      validateBoxSelectionQuantity: true,
      rules: [
        expect.objectContaining({
          ruleId: "rule-2",
          boxQuantity: 2,
        }),
      ],
    });
  });

  it("ignores FPB-only Product Slots while preserving Product Page box-selection quantity validation", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [
        {
          id: "rule-2",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 5,
        },
      ],
      displayOptions: {
        bundleQuantityOptions: {
          enabled: true,
          defaultRuleId: "rule-2",
          optionsByRuleId: {
            "rule-2": { label: "Box of 2", subtext: "5% off" },
          },
          optionsByLocaleByRuleId: {},
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        discountData: JSON.stringify(discountData),
        productSlotsEnabled: "true",
        validateQuantityPerProduct: JSON.stringify({ isEnabled: false, allowedQuantity: 1 }),
      }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty("productSlotsEnabled");
    expect(updateCall.data.validateQuantityPerProduct).toEqual({ isEnabled: false, allowedQuantity: 1 });
    expect(updateCall.data.boxSelection).toMatchObject({
      isEnabled: true,
      validateBoxSelectionQuantity: false,
    });
  });

  it("enables Product Page box-selection quantity validation without Product Slots config", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [
        {
          id: "rule-2",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 5,
        },
      ],
      displayOptions: {
        bundleQuantityOptions: {
          enabled: true,
          defaultRuleId: "rule-2",
          optionsByRuleId: {
            "rule-2": { label: "Box of 2", subtext: "5% off" },
          },
          optionsByLocaleByRuleId: {},
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        discountData: JSON.stringify(discountData),
        productSlotsEnabled: "false",
        validateQuantityPerProduct: JSON.stringify({ isEnabled: true, allowedQuantity: 1 }),
      }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty("productSlotsEnabled");
    expect(updateCall.data.validateQuantityPerProduct).toEqual({ isEnabled: true, allowedQuantity: 1 });
    expect(updateCall.data.boxSelection).toMatchObject({
      isEnabled: true,
      validateBoxSelectionQuantity: true,
    });
  });

  it("clears direct boxSelection for Product Page Buy X, get Y discounts", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "buy_x_get_y",
      discountRules: [
        {
          id: "rule-bxy",
          conditionType: "quantity",
          conditionValue: 2,
          customerBuys: 2,
          customerGets: 1,
          discountValue: 100,
          bxyDiscountType: "percentage",
          bxyApplyMode: "lowest_priced",
        },
      ],
      displayOptions: {
        bundleQuantityOptions: {
          enabled: true,
          defaultRuleId: "rule-bxy",
          optionsByRuleId: {
            "rule-bxy": { label: "Box of 2", subtext: "100% off" },
          },
          optionsByLocaleByRuleId: {},
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ discountData: JSON.stringify(discountData) }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.boxSelection).toBeNull();
  });

  it("persists Product Page discount success, tier, display, and locale message contracts", async () => {
    const discountData = makeDiscountData({
      discountEnabled: true,
      discountType: "percentage_off",
      discountRules: [
        { id: "rule-2", conditionType: "quantity", conditionValue: 2, discountValue: 5 },
      ],
      discountMessagingEnabled: true,
      ruleMessages: {
        "rule-2": {
          discountText: "Add {{discountConditionDiff}} product(s) to save {{discountValue}}{{discountValueUnit}}!",
          successMessage: "Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart.",
        },
      },
      successMessage: "Success! Your {{discountValue}}{{discountValueUnit}} discount has been applied to your cart.",
      successMessageByLocale: {
        fr: "Votre remise est appliquee.",
      },
      tierTextByRuleId: {
        "rule-2": { tierText: "2 Pack", tierSubtext: "Save 5%" },
      },
      tierTextByLocaleByRuleId: {
        fr: { "rule-2": { tierText: "Pack de 2", tierSubtext: "Economisez 5%" } },
      },
      ruleMessagesByLocale: {
        fr: {
          "rule-2": {
            discountText: "Ajoutez {{discountConditionDiff}} produit(s).",
            successMessage: "Votre remise est appliquee.",
          },
        },
      },
      displayOptions: {
        bundleQuantityOptions: { enabled: false, defaultRuleId: null, optionsByRuleId: {}, optionsByLocaleByRuleId: {} },
        progressBar: {
          enabled: true,
          type: "step_based",
          progressText: "Add {{conditionText}} to unlock {{discountText}}",
          successText: "{{discountText}} unlocked",
        },
      },
    });

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ discountData: JSON.stringify(discountData) }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.pricing.upsert.create.messages).toEqual({
      showDiscountDisplay: true,
      showDiscountMessaging: true,
      ruleMessages: discountData.ruleMessages,
      successMessage: (discountData as any).successMessage,
      successMessageByLocale: (discountData as any).successMessageByLocale,
      tierTextByRuleId: (discountData as any).tierTextByRuleId,
      tierTextByLocaleByRuleId: (discountData as any).tierTextByLocaleByRuleId,
    });
    expect(updateCall.data.pricing.upsert.create.displayOptions).toEqual(discountData.displayOptions);
    expect(updateCall.data.pricing.upsert.create.ruleMessagesByLocale).toEqual((discountData as any).ruleMessagesByLocale);
    expect(updateCall.data.pricing.upsert.update.messages).toEqual(updateCall.data.pricing.upsert.create.messages);
    expect(updateCall.data.pricing.upsert.update.ruleMessagesByLocale).toEqual((discountData as any).ruleMessagesByLocale);
  });

  it("persists Product Page direct Bundle Visibility config", async () => {
    const bundleUpsellConfig = makeBundleUpsellConfig();

    await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ bundleUpsellConfig: JSON.stringify(bundleUpsellConfig) }),
    );

    const updateCall = getDb().bundle.update.mock.calls[0][0];
    expect(updateCall.data.bundleUpsellConfig).toEqual(bundleUpsellConfig);
  });
});

describe("PPB handleSaveBundle — with shopifyProductId (direct storefront sync)", () => {
  const PRODUCT_ID = "gid://shopify/Product/123";

  function makeStepWithProduct() {
    return [
      makeStep({
        StepProduct: [
          { id: "gid://shopify/Product/456", title: "Component", imageUrl: null },
        ],
      }),
    ];
  }

  beforeEach(() => {
    getDb().bundle.findUnique.mockResolvedValue({
      shopifyProductId: PRODUCT_ID,
      shopifyProductHandle: "bundle-123",
    });
    getDb().bundle.update.mockResolvedValue(
      makeUpdatedBundle({
        shopifyProductId: PRODUCT_ID,
        steps: [
          {
            id: "step-db-1",
            StepProduct: [
              { productId: "gid://shopify/Product/456", title: "Component", imageUrl: null },
            ],
            StepCategory: [],
          },
        ],
      })
    );
  });

  it("syncs an existing draft product when specific-link delivery changes", async () => {
    getDb().bundle.findUnique.mockResolvedValue({
      shopifyProductId: PRODUCT_ID,
      shopifyProductHandle: "bundle-123",
      offerPolicy: {
        specificLinkRequired: false,
        ruleVersion: 1,
        conditions: [{ expiresAt: null, revokedAt: null }],
      },
    });

    const response = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({ specificLinkOfferEnabled: "true" }),
    );

    expect(response.status).toBe(200);
    expect(syncBundleStorefrontNow).toHaveBeenCalledWith({
      admin: MOCK_ADMIN,
      shopDomain: MOCK_SESSION.shop,
      bundleId: "bundle-1",
      bundleType: "product_page",
      reason: "save",
    });
  });

  it("saves the bundle and syncs storefront data through the shared service", async () => {
    const fd = makeFormData({
      stepsData: JSON.stringify(makeStepWithProduct()),
      bundleProduct: JSON.stringify({ id: PRODUCT_ID, handle: "bundle-123" }),
      bundleStatus: "active",
    });

    const res = await handleSaveBundle(MOCK_ADMIN, MOCK_SESSION, "bundle-1", fd);
    const body = await res.json() as any;

    expect(body.success).toBe(true);
    expect(body).not.toHaveProperty("storefrontSync");
    expect(syncBundleStorefrontNow).toHaveBeenCalledWith({
      admin: MOCK_ADMIN,
      shopDomain: MOCK_SESSION.shop,
      bundleId: "bundle-1",
      bundleType: "product_page",
      reason: "save",
    });
    expect(updateBundleProductMetafields).not.toHaveBeenCalled();
    expect(MOCK_ADMIN.graphql).not.toHaveBeenCalled();
  });

  it("returns an error when direct storefront sync fails", async () => {
    (syncBundleStorefrontNow as jest.Mock).mockRejectedValueOnce(
      new Error("fetch failed"),
    );

    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        stepsData: JSON.stringify(makeStepWithProduct()),
        bundleProduct: JSON.stringify({ id: PRODUCT_ID, handle: "bundle-123" }),
        bundleStatus: "active",
      }),
    );
    const body = await res.json() as any;

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe("fetch failed");
  });

  it("does not reject save inline when component products are missing from the saved bundle", async () => {
    getDb().bundle.update.mockResolvedValue(
      makeUpdatedBundle({
        shopifyProductId: PRODUCT_ID,
        steps: [{ id: "step-db-1", StepProduct: [], StepCategory: [], products: [], collections: [] }],
      })
    );

    const res = await handleSaveBundle(
      MOCK_ADMIN,
      MOCK_SESSION,
      "bundle-1",
      makeFormData({
        bundleProduct: JSON.stringify({ id: PRODUCT_ID }),
        bundleStatus: "active",
      }),
    );
    const body = await res.json() as any;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(syncBundleStorefrontNow).toHaveBeenCalledWith(expect.objectContaining({
      admin: MOCK_ADMIN,
      bundleType: "product_page",
      reason: "save",
    }));
  });
});
