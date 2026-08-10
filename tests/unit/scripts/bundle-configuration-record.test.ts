import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildConfigurationHash,
  diffConfigurations,
  normalizeFpbConfiguration,
  renderConfigurationMarkdown,
  validateBundleForRecord,
  writeConfigurationSnapshot,
} from "../../../scripts/lib/bundle-configuration-record";

function makeBundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    shopId: "agent-5sfidg3m.myshopify.com",
    bundleType: "full_page",
    name: "Daily Essentials",
    description: "",
    status: "active",
    bundleDesignTemplate: "FBP_SIDE_FOOTER",
    bundleDesignPresetId: "STANDARD",
    templateName: null,
    promoBannerBgImage: null,
    loadingGif: null,
    tierConfig: null,
    showStepTimeline: null,
    floatingBadgeEnabled: false,
    floatingBadgeText: "",
    showProductPrices: true,
    showCompareAtPrices: false,
    cartRedirectToCheckout: false,
    allowQuantityChanges: true,
    searchBarEnabled: false,
    textOverrides: { yourBundle: "Daily Essentials" },
    textOverridesByLocale: null,
    upsellWidgetEnabled: false,
    upsellWidgetDisplayMode: null,
    upsellWidgetDisplayOn: null,
    autoSelectBrowsedProduct: false,
    maxQtyPerProduct: null,
    productSlotsEnabled: false,
    productSlotIconUrl: null,
    variantSelectorEnabled: true,
    showTextOnAddButton: true,
    bundleBannerDesktopUrl: null,
    bundleBannerMobileUrl: null,
    bundleLevelCss: null,
    defaultProductsData: {},
    boxSelection: null,
    bundleUpsellConfig: {
      widgetConfiguration: { isEnabled: false, title: "Bundle & Save" },
    },
    bundleTextConfig: {
      bundleSummary: {
        title: "Daily Essentials",
        subTitle: "Two essentials unlock savings",
      },
    },
    personalizationData: null,
    discountDisplayOverride: null,
    individualSellingPlanSelection: {
      isEnabled: false,
      showFor: "ALL_PRODUCTS",
    },
    validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 1 },
    useSingleStepCategoriesAsBundleSteps: false,
    shopifyProductId: "gid://shopify/Product/999",
    updatedAt: new Date("2026-08-10T18:47:40.694Z"),
    steps: [
      {
        id: "step-1",
        name: "Step 1",
        icon: "box",
        position: 1,
        enabled: true,
        pageTitle: null,
        minQuantity: 0,
        maxQuantity: 0,
        displayVariantsAsIndividual: false,
        conditionType: null,
        conditionOperator: null,
        conditionValue: null,
        conditionOperator2: null,
        conditionValue2: null,
        autoNextStepOnConditionMet: false,
        isFreeGift: false,
        freeGiftName: null,
        addonLabel: null,
        addonTitle: null,
        addonAddText: null,
        addonReplaceText: null,
        addonIconUrl: null,
        addonDisplayFree: true,
        addonTiers: [],
        addonUnlockAfterCompletion: true,
        isDefault: false,
        defaultVariantId: null,
        imageUrl: null,
        bannerImageUrl: null,
        timelineIconUrl: null,
        multiLangData: {},
        filters: [],
        primaryVariantOption: null,
        StepProduct: [
          {
            id: "step-product-1",
            productId: "gid://shopify/Product/1",
            title: "Product One",
            minQuantity: 0,
            maxQuantity: 1,
            position: 1,
            variants: [
              {
                id: "gid://shopify/ProductVariant/11",
                title: "Default Title",
                price: "10.00",
                available: true,
              },
            ],
          },
        ],
        StepCategory: [
          {
            id: "category-db-id",
            name: "Essentials",
            title: "Choose essentials",
            subTitle: "",
            sortOrder: 0,
            products: [
              {
                selectionId: "gid://shopify/Product/1",
                title: "Product One",
                variants: [
                  {
                    selectionId: "gid://shopify/ProductVariant/11",
                    title: "Default Title",
                    price: "10.00",
                  },
                ],
              },
            ],
            collections: [],
            conditions: [],
            categoryBanner: null,
            categoryImg: null,
            autoNextStepOnConditionMet: false,
            displayVariantsAsIndividualProducts: false,
            displayVariantsAsSwatches: false,
            multiLangData: {},
          },
        ],
      },
    ],
    pricing: {
      enabled: true,
      method: "percentage_off",
      rules: [
        {
          id: "rule-1",
          conditionType: "quantity",
          conditionValue: 2,
          discountValue: 5,
        },
      ],
      showFooter: true,
      showProgressBar: false,
      messages: {
        ruleMessages: {
          "rule-1": {
            discountText: "Add one more",
            successMessage: "Discount applied",
          },
        },
      },
      ruleMessagesByLocale: null,
      displayOptions: { progressBar: { enabled: false } },
    },
    ...overrides,
  };
}

describe("bundle configuration record", () => {
  it("normalizes merchant FPB configuration and excludes operational fields", () => {
    const normalized = normalizeFpbConfiguration(makeBundle());

    expect(normalized.identity).toEqual({
      name: "Daily Essentials",
      description: "",
      status: "active",
    });
    expect(normalized.template).toEqual(expect.objectContaining({
      designTemplate: "FBP_SIDE_FOOTER",
      designPreset: "STANDARD",
      tierConfiguration: null,
    }));
    expect(normalized.steps[0].products[0]).toEqual({
      productId: "gid://shopify/Product/1",
      title: "Product One",
      position: 1,
      minimumQuantity: 0,
      maximumQuantity: 1,
      variants: [
        {
          variantId: "gid://shopify/ProductVariant/11",
          title: "Default Title",
        },
      ],
    });
    expect(normalized.steps[0].icon).toBe("box");
    expect(normalized.steps[0].categories[0].id).toBe("category-db-id");
    expect(normalized).not.toHaveProperty("shopifyProductId");
    expect(JSON.stringify(normalized)).not.toContain("storefrontSyncStatus");
    expect(JSON.stringify(normalized)).not.toContain("10.00");
  });

  it("keeps false, null, empty arrays, and empty objects distinct", () => {
    const normalized = normalizeFpbConfiguration(makeBundle());

    expect(normalized.presentation.loadingAnimation).toBeNull();
    expect(normalized.presentation.floatingBadge.enabled).toBe(false);
    expect(normalized.defaults.products).toEqual({});
    expect(normalized.steps[0].filters).toEqual([]);
  });

  it("produces a stable hash for equivalent object key order", () => {
    const first = normalizeFpbConfiguration(makeBundle({
      textOverrides: { yourBundle: "Daily", reviewBundle: "Review" },
    }));
    const second = normalizeFpbConfiguration(makeBundle({
      textOverrides: { reviewBundle: "Review", yourBundle: "Daily" },
    }));

    expect(buildConfigurationHash(first)).toBe(buildConfigurationHash(second));
  });

  it("renders classified Markdown with explicit state labels and frontmatter", () => {
    const configuration = normalizeFpbConfiguration(makeBundle());
    const markdown = renderConfigurationMarkdown({
      bundleId: "bundle-1",
      shop: "agent-5sfidg3m.myshopify.com",
      label: "standard-template-baseline",
      capturedAt: "2026-08-11T10:00:00.000Z",
      configuration,
      configurationHash: buildConfigurationHash(configuration),
      changes: { added: [], changed: [], removed: [] },
    });

    expect(markdown).toMatch(/^---\nschema_version: 1\nid:/);
    expect(markdown).toContain("## Template and presentation");
    expect(markdown).toContain("## Identity and status");
    expect(markdown).toContain("## Selection and quantity");
    expect(markdown).toContain("## Pricing, discounts, messages, and progress");
    expect(markdown).toContain("## Product and variant presentation");
    expect(markdown).toContain("## Summary, media, and CSS");
    expect(markdown).toContain("## Gifts, add-ons, and upsells");
    expect(markdown).toContain("## Storefront behavior and visibility");
    expect(markdown).toContain("| Progress bar | Disabled |");
    expect(markdown).toContain("| Loading animation | Not configured |");
    expect(markdown).toContain("Product One");
    expect(markdown).toContain("### Categories");
    expect(markdown).toContain("Essentials");
  });

  it("classifies added, changed, and removed configuration paths", () => {
    const previous = normalizeFpbConfiguration(makeBundle());
    const current = normalizeFpbConfiguration(makeBundle({
      description: "New description",
      loadingGif: "https://cdn.example/loading.gif",
      textOverridesByLocale: { fr: { yourBundle: "Mon offre" } },
    }));
    delete (current.presentation as Record<string, unknown>).promoBannerBackground;

    const diff = diffConfigurations(previous, current);

    expect(diff.added).toContain("text.overridesByLocale.fr.yourBundle");
    expect(diff.changed).toContain("identity.description");
    expect(diff.changed).toContain("presentation.loadingAnimation");
    expect(diff.removed).toContain("presentation.promoBannerBackground");
  });

  it("writes immutable JSON and Markdown snapshots plus a history index", async () => {
    const outputRoot = await mkdtemp(path.join(tmpdir(), "bundle-config-record-"));

    try {
      const result = await writeConfigurationSnapshot({
        bundle: makeBundle(),
        expectedShop: "agent-5sfidg3m.myshopify.com",
        label: "Standard Template Baseline",
        capturedAt: new Date("2026-08-11T10:00:00.000Z"),
        outputRoot,
      });

      expect(path.basename(result.jsonPath)).toBe(
        "2026-08-11T10-00-00-000Z--standard-template-baseline.json",
      );
      expect(JSON.parse(await readFile(result.jsonPath, "utf8"))).toEqual(
        expect.objectContaining({ schema_version: 1, bundle_id: "bundle-1" }),
      );
      expect(await readFile(result.markdownPath, "utf8")).toContain(
        "# FPB Configuration: Standard Template Baseline",
      );
      expect(await readFile(result.indexPath, "utf8")).toContain(
        "standard-template-baseline",
      );

      await expect(writeConfigurationSnapshot({
        bundle: makeBundle(),
        expectedShop: "agent-5sfidg3m.myshopify.com",
        label: "Standard Template Baseline",
        capturedAt: new Date("2026-08-11T10:00:00.000Z"),
        outputRoot,
      })).rejects.toThrow("already exists");
    } finally {
      await rm(outputRoot, { recursive: true, force: true });
    }
  });

  it("rejects shop mismatches and non-FPB bundles", () => {
    expect(() => validateBundleForRecord(
      makeBundle(),
      "other-shop.myshopify.com",
    )).toThrow("does not belong to shop");

    expect(() => validateBundleForRecord(
      makeBundle({ bundleType: "product_page" }),
      "agent-5sfidg3m.myshopify.com",
    )).toThrow("not a full-page bundle");
  });
});
