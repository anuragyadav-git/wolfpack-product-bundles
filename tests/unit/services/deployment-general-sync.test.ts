import {
  parseDeploymentGeneralSyncEnv,
  runDeploymentGeneralSync,
} from "../../../app/services/deployment-general-sync.server";

function makeDeps() {
  const admin = { graphql: jest.fn() };
  return {
    prisma: {
      shop: {
        findMany: jest.fn().mockResolvedValue([
          { shopDomain: "alpha.myshopify.com" },
          { shopDomain: "beta.myshopify.com" },
        ]),
      },
      bundle: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "bundle-1",
            shopId: "alpha.myshopify.com",
            bundleType: "full_page",
            personalizationData: {
              addonProducts: { isEnabled: true },
            },
          },
          {
            id: "bundle-2",
            shopId: "beta.myshopify.com",
            bundleType: "product_page",
            personalizationData: null,
          },
        ]),
      },
    },
    getAdmin: jest.fn().mockResolvedValue(admin),
    ensureMetafieldDefinitions: jest.fn().mockResolvedValue(true),
    syncBundle: jest.fn().mockResolvedValue({ synced: true }),
    setupAddonDiscount: jest.fn().mockResolvedValue({ success: true }),
    syncBundleMetaobjects: jest.fn().mockResolvedValue(0),
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
      metaobjectValuesSynced: 0,
      addonDiscountShopsSynced: 1,
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
    expect(deps.syncBundleMetaobjects).toHaveBeenCalledTimes(2);
    expect(deps.setupAddonDiscount).toHaveBeenCalledTimes(1);
    expect(deps.setupAddonDiscount).toHaveBeenCalledWith(
      expect.objectContaining({ graphql: expect.any(Function) }),
      "alpha.myshopify.com",
    );
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
    }]);

    const result = await runDeploymentGeneralSync(
      parseDeploymentGeneralSyncEnv({
        WPB_DEPLOYMENT_GENERAL_SYNC: "true",
      }),
      deps,
    );

    expect(result.failedBundles).toBe(1);
    expect(deps.syncBundle).not.toHaveBeenCalled();
    expect(deps.syncBundleMetaobjects).not.toHaveBeenCalled();
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
