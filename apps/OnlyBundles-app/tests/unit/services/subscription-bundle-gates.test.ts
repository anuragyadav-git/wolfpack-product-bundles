import {
  assertBundlePublicationAllowed,
  updateBundleWithPublicationGate,
} from "../../../app/services/subscriptions/bundle-entitlement-gate.server";
import {
  EntitlementDeniedError,
  getPlanEntitlements,
  type BundleEntitlementCandidate,
} from "../../../app/lib/subscriptions/entitlements";

function candidate(
  overrides: Partial<BundleEntitlementCandidate> = {},
): BundleEntitlementCandidate {
  return {
    bundleType: "FULL_PAGE",
    status: "ACTIVE",
    enabledStepCount: 1,
    designTemplate: "FBP_SIDE_FOOTER",
    designPresetId: "STANDARD",
    usesAdvancedDesign: false,
    ...overrides,
  };
}

describe("assertBundlePublicationAllowed", () => {
  it("allows any candidate that remains Draft", () => {
    expect(() => assertBundlePublicationAllowed({
      candidate: candidate({
        status: "DRAFT",
        enabledStepCount: 10,
        designPresetId: "CLASSIC",
        usesAdvancedDesign: true,
      }),
      entitlements: null,
      otherPublicBundleCount: 99,
    })).not.toThrow();
  });

  it("allows one compatible Free public bundle", () => {
    expect(() => assertBundlePublicationAllowed({
      candidate: candidate(),
      entitlements: getPlanEntitlements("FREE", "NONE"),
      otherPublicBundleCount: 0,
    })).not.toThrow();
  });

  it("blocks a second Free public bundle", () => {
    expect(() => assertBundlePublicationAllowed({
      candidate: candidate(),
      entitlements: getPlanEntitlements("FREE", "NONE"),
      otherPublicBundleCount: 1,
    })).toThrow(expect.objectContaining({
      code: "LIMIT_REACHED",
      entitlement: "bundle.public.limit",
      currentUsage: 1,
      limit: 1,
    }));
  });

  it("blocks more than two enabled steps for either Free bundle type", () => {
    for (const bundleType of ["FULL_PAGE", "PRODUCT_PAGE"] as const) {
      expect(() => assertBundlePublicationAllowed({
        candidate: candidate({ bundleType, enabledStepCount: 3 }),
        entitlements: getPlanEntitlements("FREE", "NONE"),
        otherPublicBundleCount: 0,
      })).toThrow(expect.objectContaining({
        code: "LIMIT_REACHED",
        entitlement: "bundle.steps.limit",
        currentUsage: 3,
        limit: 2,
      }));
    }
  });

  it("blocks Free premium templates and advanced Design", () => {
    for (const gatedCandidate of [
      candidate({ designPresetId: "CLASSIC" }),
      candidate({ usesAdvancedDesign: true }),
    ]) {
      expect(() => assertBundlePublicationAllowed({
        candidate: gatedCandidate,
        entitlements: getPlanEntitlements("FREE", "NONE"),
        otherPublicBundleCount: 0,
      })).toThrow(EntitlementDeniedError);
    }
  });

  it("fails closed when billing cannot be verified", () => {
    expect(() => assertBundlePublicationAllowed({
      candidate: candidate(),
      entitlements: null,
      otherPublicBundleCount: 0,
    })).toThrow(expect.objectContaining({
      code: "BILLING_UNVERIFIED",
      status: 503,
    }));
  });

  it.each(["MONTHLY", "ANNUAL"] as const)(
    "allows Growth publication for %s billing",
    (interval) => {
      expect(() => assertBundlePublicationAllowed({
        candidate: candidate({
          enabledStepCount: 10,
          designPresetId: "CLASSIC",
          usesAdvancedDesign: true,
        }),
        entitlements: getPlanEntitlements("GROWTH", interval),
        otherPublicBundleCount: 20,
      })).not.toThrow();
    },
  );
});

describe("updateBundleWithPublicationGate", () => {
  it("locks the Shop row, counts other public bundles, and updates in one transaction", async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: "shop-db-id" }]),
      bundle: {
        findUnique: jest.fn().mockResolvedValue({
          status: "draft",
          publishedAt: null,
        }),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({ id: "bundle-1", status: "active" }),
      },
    };
    const database = {
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      bundle: { update: jest.fn() },
    };

    await expect(updateBundleWithPublicationGate({
      database: database as any,
      shopDomain: "shop.myshopify.com",
      bundleId: "bundle-1",
      candidate: candidate(),
      entitlements: getPlanEntitlements("FREE", "NONE"),
      data: { status: "active" },
      include: { steps: true },
      enforce: true,
      now: new Date("2026-08-28T12:00:00.000Z"),
    })).resolves.toMatchObject({ id: "bundle-1" });

    expect(database.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { timeout: 10_000 },
    );
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.bundle.count).toHaveBeenCalledWith({
      where: {
        shopId: "shop.myshopify.com",
        id: { not: "bundle-1" },
        status: { in: ["active", "unlisted"] },
      },
    });
    expect(tx.bundle.update).toHaveBeenCalledWith({
      where: { id: "bundle-1", shopId: "shop.myshopify.com" },
      data: expect.objectContaining({
        status: "active",
        publishedAt: new Date("2026-08-28T12:00:00.000Z"),
      }),
      include: { steps: true },
    });
    expect(tx.$queryRaw.mock.invocationCallOrder[0])
      .toBeLessThan(tx.bundle.count.mock.invocationCallOrder[0]);
    expect(tx.bundle.count.mock.invocationCallOrder[0])
      .toBeLessThan(tx.bundle.update.mock.invocationCallOrder[0]);
  });

  it("preserves the original publication timestamp when an already-public bundle is saved", async () => {
    const originalPublishedAt = new Date("2026-08-20T08:00:00.000Z");
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: "shop-db-id" }]),
      bundle: {
        findUnique: jest.fn().mockResolvedValue({
          status: "active",
          publishedAt: originalPublishedAt,
        }),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn().mockResolvedValue({ id: "bundle-1", status: "active" }),
      },
    };
    const database = {
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
      bundle: { update: jest.fn() },
    };

    await updateBundleWithPublicationGate({
      database: database as any,
      shopDomain: "shop.myshopify.com",
      bundleId: "bundle-1",
      candidate: candidate(),
      entitlements: getPlanEntitlements("FREE", "NONE"),
      data: { status: "active" },
      now: new Date("2026-08-29T12:00:00.000Z"),
    });

    expect(tx.bundle.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ publishedAt: originalPublishedAt }),
    }));
  });

  it("updates Drafts without requiring billing verification", async () => {
    const database = {
      $transaction: jest.fn(),
      bundle: {
        update: jest.fn().mockResolvedValue({ id: "bundle-1", status: "draft" }),
      },
    };

    await updateBundleWithPublicationGate({
      database: database as any,
      shopDomain: "shop.myshopify.com",
      bundleId: "bundle-1",
      candidate: candidate({ status: "DRAFT", usesAdvancedDesign: true }),
      entitlements: null,
      data: { status: "draft" },
      enforce: true,
    });

    expect(database.$transaction).not.toHaveBeenCalled();
    expect(database.bundle.update).toHaveBeenCalled();
  });
});
