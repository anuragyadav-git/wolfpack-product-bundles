import { runSubscriptionReconciliation } from "../../../app/services/subscriptions/subscription-reconciliation-runner.server";

jest.mock("../../../app/shopify.server", () => ({
  unauthenticated: { admin: jest.fn() },
}));

describe("runSubscriptionReconciliation", () => {
  it("applies the Free policy only after a verified Free result", async () => {
    const applyFreePlanPolicy = jest.fn().mockResolvedValue(undefined);
    const result = await runSubscriptionReconciliation({
      listInstalledShops: jest.fn().mockResolvedValue([
        { shopDomain: "free.myshopify.com", shopifyShopGid: "gid://shopify/Shop/1" },
        { shopDomain: "growth.myshopify.com", shopifyShopGid: "gid://shopify/Shop/2" },
      ]),
      verify: jest.fn()
        .mockResolvedValueOnce({ planCode: "FREE" })
        .mockResolvedValueOnce({ planCode: "GROWTH" }),
      applyFreePlanPolicy,
    });

    expect(result).toEqual({ verified: 2, failed: 0, skipped: 0 });
    expect(applyFreePlanPolicy).toHaveBeenCalledTimes(1);
    expect(applyFreePlanPolicy).toHaveBeenCalledWith("free.myshopify.com");
  });

  it("returns skipped and failed counts for operator visibility", async () => {
    const result = await runSubscriptionReconciliation({
      listInstalledShops: jest.fn().mockResolvedValue([
        { shopDomain: "missing-id.myshopify.com", shopifyShopGid: null },
        { shopDomain: "failed.myshopify.com", shopifyShopGid: "gid://shopify/Shop/2" },
      ]),
      verify: jest.fn().mockRejectedValue(new Error("provider unavailable")),
      applyFreePlanPolicy: jest.fn(),
    });

    expect(result).toEqual({ verified: 0, failed: 1, skipped: 1 });
  });
});
