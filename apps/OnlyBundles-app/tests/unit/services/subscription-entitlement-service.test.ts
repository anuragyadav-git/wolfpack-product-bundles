import {
  SubscriptionEntitlementService,
  type SubscriptionStateRepository,
} from "../../../app/services/subscriptions/subscription-entitlement-service.server";
import type { ProviderVerification } from "../../../app/services/subscriptions/subscription-resolution.server";
import { PrismaSubscriptionStateRepository } from "../../../app/services/subscriptions/subscription-state-repository.server";

const NOW = new Date("2026-08-28T12:00:00.000Z");
const managedResult = (overrides: Partial<ProviderVerification> = {}): ProviderVerification => ({
  provider: "SHOPIFY_APP_PRICING",
  outcome: "NO_PAID_CONTRACT",
  status: "ACTIVE",
  planCode: "FREE",
  billingInterval: "NONE",
  verifiedAt: new Date("2026-08-28T11:55:00.000Z"),
  ...overrides,
});

function repository(overrides: Partial<SubscriptionStateRepository> = {}): SubscriptionStateRepository {
  return {
    getShop: jest.fn().mockResolvedValue({
      id: "shop-db-id",
      shopDomain: "shop.myshopify.com",
      shopifyShopGid: "gid://shopify/Shop/1",
    }),
    getLatestVerification: jest.fn().mockResolvedValue(managedResult()),
    saveVerification: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("SubscriptionEntitlementService", () => {
  it("uses a fresh managed-pricing snapshot without a network call", async () => {
    const provider = { verify: jest.fn() };
    const service = new SubscriptionEntitlementService({
      repository: repository(), managedProvider: provider, now: () => NOW,
    });
    await expect(service.resolve({ shopDomain: "shop.myshopify.com" }))
      .resolves.toMatchObject({ planCode: "FREE" });
    expect(provider.verify).not.toHaveBeenCalled();
  });

  it("force refreshes and persists only Shopify App Pricing", async () => {
    const repo = repository();
    const provider = { verify: jest.fn().mockResolvedValue(managedResult({
      outcome: "ACTIVE_GROWTH", planCode: "GROWTH", billingInterval: "ANNUAL", verifiedAt: NOW,
    })) };
    const service = new SubscriptionEntitlementService({
      repository: repo, managedProvider: provider, now: () => NOW,
    });
    await expect(service.resolve({ shopDomain: "shop.myshopify.com", forceRefresh: true }))
      .resolves.toMatchObject({ planCode: "GROWTH", billingInterval: "ANNUAL" });
    expect(provider.verify).toHaveBeenCalledWith(
      "gid://shopify/Shop/1",
      "shop.myshopify.com",
    );
    expect(repo.saveVerification).toHaveBeenCalledTimes(1);
  });

  it("returns no entitlements when managed pricing cannot be verified", async () => {
    const service = new SubscriptionEntitlementService({
      repository: repository({ getLatestVerification: jest.fn().mockResolvedValue(null) }),
      managedProvider: { verify: jest.fn().mockResolvedValue(managedResult({
        outcome: "UNKNOWN", status: "UNKNOWN", planCode: null, verifiedAt: NOW,
      })) },
      now: () => NOW,
    });
    await expect(service.resolve({ shopDomain: "shop.myshopify.com", forceRefresh: true }))
      .resolves.toMatchObject({ planCode: null, entitlements: null });
  });
});

describe("PrismaSubscriptionStateRepository", () => {
  it("reads only the managed-pricing snapshot", async () => {
    const db = { subscription: { findFirst: jest.fn().mockResolvedValue({
      provider: "shopify_app_pricing", plan: "growth", status: "active",
      billingInterval: "annual", lastVerifiedAt: NOW,
      itemHandles: ["growth-recurring"],
      verificationErrorCode: null,
    }) } };
    const repo = new PrismaSubscriptionStateRepository(db as any);
    await expect(repo.getLatestVerification("shop-db-id")).resolves.toMatchObject({
      provider: "SHOPIFY_APP_PRICING", planCode: "GROWTH", billingInterval: "ANNUAL",
    });
    expect(db.subscription.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ provider: "shopify_app_pricing" }),
    }));
  });
});
