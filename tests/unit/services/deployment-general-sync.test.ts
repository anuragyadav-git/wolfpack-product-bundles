import {
  parseDeploymentGeneralSyncEnv,
  runDeploymentGeneralSync,
} from "../../../app/services/deployment-general-sync.server";

jest.mock("../../../app/lib/variant-existence.server", () => ({
  validateVariantIdFromShopify: jest.fn(async (rawVariantId: string | number) => {
    const normalized = String(rawVariantId || "").trim();
    if (!normalized) {
      return { numericId: "", isValidFormat: false, reason: "Variant id is required." };
    }

    if (/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(normalized)) {
      return { numericId: normalized.split("/").pop() || "", isValidFormat: true };
    }

    if (/^\\d+$/.test(normalized)) {
      return { numericId: normalized, isValidFormat: true };
    }

    return {
      numericId: "",
      isValidFormat: false,
      reason: "Variant id format is invalid. Expected numeric or gid://shopify/ProductVariant/<id>.",
    };
  }),
  isVariantExistsOnShopifyStorefront: jest.fn(async (_shopDomain: string, variantNumericId: string) => {
    if (variantNumericId === "101" || variantNumericId === "102") {
      return { ok: true, id: variantNumericId, status: 200 };
    }
    return { ok: false, id: variantNumericId, status: 404, message: "Variant lookup failed with status 404" };
  }),
}));

function makeDeps() {
  const admin = { graphql: jest.fn() };
  const persistedBundleRows = [
    {
      id: "bundle-1",
      shopId: "alpha.myshopify.com",
      bundleType: "full_page",
      personalizationData: {
        addonProducts: { isEnabled: true },
      },
      steps: [],
    },
    {
      id: "bundle-2",
      shopId: "beta.myshopify.com",
      bundleType: "product_page",
      personalizationData: null,
      steps: [],
    },
  ];
  return {
    prisma: {
      shop: {
        findMany: jest.fn().mockResolvedValue([
          { shopDomain: "alpha.myshopify.com" },
          { shopDomain: "beta.myshopify.com" },
        ]),
      },
      bundle: {
        findMany: jest.fn().mockResolvedValue(persistedBundleRows),
      },
      stepProduct: {
        update: jest.fn().mockResolvedValue({}),
      },
    },
    updateStepProductVariants: jest.fn().mockResolvedValue({}),
    getAdmin: jest.fn().mockResolvedValue(admin),
    ensureMetafieldDefinitions: jest.fn().mockResolvedValue(true),
    syncBundle: jest.fn().mockResolvedValue({ synced: true }),
    setupAddonDiscount: jest.fn().mockResolvedValue({ success: true }),
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
}

describe("deployment general sync", () => {
  it("is disabled unless the true/false flag is true", async () => {
    const deps = makeDeps();

    expect(parseDeploymentGeneralSyncEnv({}).enabled).toBe(false);
    expect(parseDeploymentGeneralSyncEnv({
      WPB_DEPLOYMENT_GENERAL_SYNC: "false",
    }).enabled).toBe(false);

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({}),
      deps,
    );

    expect(result.mode).toBe("disabled");
    expect(deps.prisma.shop.findMany).not.toHaveBeenCalled();
    expect(deps.syncBundle).not.toHaveBeenCalled();
  });

  it("replays definitions and save-equivalent bundle sync from persisted rows", async () => {
    const deps = makeDeps();

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result).toMatchObject({
      mode: "apply",
      scannedShops: 2,
      scannedBundles: 2,
      syncedBundles: 2,
      failedBundles: 0,
      failedShops: 0,
      metafieldDefinitionShopsSynced: 2,
      addonDiscountShopsSynced: 1,
      variantRemediation: {
        scannedBundles: 2,
        scannedStepProducts: 0,
        scannedVariants: 0,
        removedVariants: 0,
        updatedBundles: 0,
        failures: [],
      },
    });
    expect(deps.ensureMetafieldDefinitions).toHaveBeenCalledTimes(2);
    expect(deps.syncBundle).toHaveBeenCalledWith({
      admin: expect.objectContaining({ graphql: expect.any(Function) }),
      shopDomain: "alpha.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      reason: "sync_bundle",
    });
    expect(deps.syncBundle).toHaveBeenCalledWith({
      admin: expect.objectContaining({ graphql: expect.any(Function) }),
      shopDomain: "beta.myshopify.com",
      bundleId: "bundle-2",
      bundleType: "product_page",
      reason: "sync_bundle",
    });
    expect(deps.setupAddonDiscount).toHaveBeenCalledTimes(1);
    expect(deps.setupAddonDiscount).toHaveBeenCalledWith(
      expect.objectContaining({ graphql: expect.any(Function) }),
      "alpha.myshopify.com",
    );
  });

  it("removes invalid persisted StepProduct variant refs and tracks remediation", async () => {
    const deps = makeDeps();
    deps.prisma.bundle.findMany.mockResolvedValueOnce([
      {
      id: "bundle-1",
      shopId: "alpha.myshopify.com",
      bundleType: "full_page",
      personalizationData: { addonProducts: { isEnabled: true } },
      steps: [
        {
          id: "step-1",
          StepProduct: [
            {
              id: "step-product-1",
              variants: [
                { variantId: "gid://shopify/ProductVariant/101" },
                { variantId: "gid://shopify/ProductVariant/999" },
              ],
            },
          ],
        },
      ],
    },
      {
        id: "bundle-2",
        shopId: "beta.myshopify.com",
        bundleType: "product_page",
        personalizationData: null,
        steps: [],
      },
    ]);

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.variantRemediation.scannedStepProducts).toBe(1);
    expect(result.variantRemediation.scannedVariants).toBe(2);
    expect(result.variantRemediation.removedVariants).toBe(1);
    expect(result.variantRemediation.updatedBundles).toBe(1);
    expect(result.variantRemediation.failures).toHaveLength(1);
    expect(result.variantRemediation.failures[0]).toMatchObject({
      shopDomain: "alpha.myshopify.com",
      bundleId: "bundle-1",
      stepProductId: "step-product-1",
      variantId: "gid://shopify/ProductVariant/999",
    });
    expect(deps.updateStepProductVariants).toHaveBeenCalledWith({
      stepProductId: "step-product-1",
      variants: [{ variantId: "gid://shopify/ProductVariant/101" }],
    });
  });

  it("records bundle failures and continues syncing other bundles", async () => {
    const deps = makeDeps();
    deps.syncBundle
      .mockRejectedValueOnce(new Error("metafield write failed"))
      .mockResolvedValueOnce({ synced: true });

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.syncedBundles).toBe(1);
    expect(result.failedBundles).toBe(1);
    expect(result.failures).toEqual([{
      shopDomain: "alpha.myshopify.com",
      bundleId: "bundle-1",
      error: "metafield write failed",
    }]);
    expect(deps.syncBundle).toHaveBeenCalledTimes(2);
  });

  it("records unsupported persisted bundle types without invoking sync", async () => {
    const deps = makeDeps();
    deps.prisma.bundle.findMany.mockResolvedValueOnce([{
      id: "bundle-3",
      shopId: "alpha.myshopify.com",
      bundleType: "unknown",
      personalizationData: null,
      steps: [],
    }]);

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.failedBundles).toBe(1);
    expect(deps.syncBundle).not.toHaveBeenCalled();
  });

  it("records shop setup failures and skips that shop's bundles", async () => {
    const deps = makeDeps();
    deps.ensureMetafieldDefinitions.mockRejectedValueOnce(
      new Error("definition sync failed"),
    );

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.failedShops).toBe(1);
    expect(result.syncedBundles).toBe(1);
    expect(deps.syncBundle).not.toHaveBeenCalledWith(
      expect.objectContaining({ shopDomain: "alpha.myshopify.com" }),
    );
  });

  it("records add-on setup failures without losing completed bundle syncs", async () => {
    const deps = makeDeps();
    deps.setupAddonDiscount.mockRejectedValueOnce(
      new Error("discount setup failed"),
    );

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.syncedBundles).toBe(2);
    expect(result.failedShops).toBe(1);
    expect(result.shopFailures).toContainEqual({
      shopDomain: "alpha.myshopify.com",
      error: "discount setup failed",
    });
  });

  it("uses only the deployment general sync true or false flag", () => {
    expect(parseDeploymentGeneralSyncEnv({
      WPB_DEPLOYMENT_GENERAL_SYNC: "true",
    })).toEqual({ enabled: true });
    expect(parseDeploymentGeneralSyncEnv({
      WPB_DEPLOYMENT_GENERAL_SYNC: "false",
    })).toEqual({ enabled: false });
  });
});
