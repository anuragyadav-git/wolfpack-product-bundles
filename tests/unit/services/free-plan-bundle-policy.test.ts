import {
  applyFreePlanBundlePolicy,
  selectRetainedFreeBundle,
} from "../../../app/services/subscriptions/free-plan-bundle-policy.server";

describe("selectRetainedFreeBundle", () => {
  it("keeps the most recently published Free-compatible bundle", () => {
    expect(selectRetainedFreeBundle([
      { id: "older", status: "ACTIVE", publishedAt: new Date("2026-08-01"), requiresGrowth: false },
      { id: "newer", status: "UNLISTED", publishedAt: new Date("2026-08-20"), requiresGrowth: false },
    ])?.id).toBe("newer");
  });

  it("does not retain a public bundle that requires Growth", () => {
    expect(selectRetainedFreeBundle([
      { id: "growth", status: "ACTIVE", publishedAt: new Date("2026-08-20"), requiresGrowth: true },
    ])).toBeNull();
  });
});

describe("applyFreePlanBundlePolicy", () => {
  function createDatabase() {
    const transaction = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: "shop-1" }]),
      bundle: {
        findMany: jest.fn()
          .mockResolvedValueOnce([
            {
              id: "retained",
              status: "active",
              bundleType: "full_page",
              bundleDesignTemplate: "FBP_SIDE_FOOTER",
              bundleDesignPresetId: "STANDARD",
              publishedAt: new Date("2026-08-20"),
              steps: [{ enabled: true }, { enabled: true }],
            },
            {
              id: "demoted",
              status: "unlisted",
              bundleType: "product_page",
              bundleDesignTemplate: "PDP_MODAL",
              bundleDesignPresetId: "SIMPLIFIED",
              publishedAt: new Date("2026-08-25"),
              steps: [{ enabled: true }],
            },
          ])
          .mockResolvedValueOnce([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      designSettings: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const database = {
      $transaction: jest.fn(async (callback: (client: typeof transaction) => unknown) => callback(transaction)),
      bundle: { update: jest.fn().mockResolvedValue({}) },
    };
    return { database, transaction };
  }

  it("retains one compatible public bundle and marks the other for storefront removal", async () => {
    const { database, transaction } = createDatabase();
    const onBundleUnpublished = jest.fn().mockResolvedValue(undefined);

    await expect(applyFreePlanBundlePolicy({
      shopDomain: "shop.myshopify.com",
      database: database as never,
      now: new Date("2026-08-28T10:00:00Z"),
      onBundleUnpublished,
    })).resolves.toEqual({
      retainedBundleId: "retained",
      unpublishedBundleIds: ["demoted"],
    });

    expect(transaction.bundle.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: { in: ["demoted"] }, shopId: "shop.myshopify.com" },
      data: expect.objectContaining({
        status: "draft",
        planRestrictionReason: "free_plan_storefront_sync_pending",
      }),
    }));
    expect(onBundleUnpublished).toHaveBeenCalledWith({
      shopDomain: "shop.myshopify.com",
      bundleId: "demoted",
      bundleType: "product_page",
    });
    expect(database.bundle.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { planRestrictionReason: "free_plan_enforced" },
    }));
  });

  it("leaves the pending marker in place when storefront removal fails", async () => {
    const { database } = createDatabase();
    await expect(applyFreePlanBundlePolicy({
      shopDomain: "shop.myshopify.com",
      database: database as never,
      onBundleUnpublished: jest.fn().mockRejectedValue(new Error("sync failed")),
    })).rejects.toThrow("sync failed");

    expect(database.bundle.update).not.toHaveBeenCalled();
  });
});
