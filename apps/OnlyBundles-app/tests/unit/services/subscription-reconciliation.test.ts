import { reconcileSubscriptionShops } from "../../../app/services/subscriptions/subscription-reconciliation.server";

describe("reconcileSubscriptionShops", () => {
  it("force-refreshes every eligible shop", async () => {
    const verify = jest.fn().mockResolvedValue(undefined);
    const result = await reconcileSubscriptionShops({
      shops: [
        { shopDomain: "a.myshopify.com", shopifyShopGid: "gid://shopify/Shop/1" },
        { shopDomain: "b.myshopify.com", shopifyShopGid: "gid://shopify/Shop/2" },
      ],
      verify,
    });
    expect(verify).toHaveBeenCalledTimes(2);
    expect(verify).toHaveBeenCalledWith(expect.objectContaining({ forceRefresh: true }));
    expect(result).toEqual({ verified: 2, failed: 0, skipped: 0 });
  });

  it("continues after a shop verification failure", async () => {
    const verify = jest.fn()
      .mockRejectedValueOnce(new Error("provider unavailable"))
      .mockResolvedValueOnce(undefined);
    const result = await reconcileSubscriptionShops({
      shops: [
        { shopDomain: "a.myshopify.com", shopifyShopGid: "gid://shopify/Shop/1" },
        { shopDomain: "b.myshopify.com", shopifyShopGid: "gid://shopify/Shop/2" },
      ],
      verify,
    });
    expect(result).toEqual({ verified: 1, failed: 1, skipped: 0 });
  });

  it("skips shops missing the Partner API identity", async () => {
    const verify = jest.fn();
    const result = await reconcileSubscriptionShops({
      shops: [{ shopDomain: "a.myshopify.com", shopifyShopGid: null }],
      verify,
    });
    expect(verify).not.toHaveBeenCalled();
    expect(result).toEqual({ verified: 0, failed: 0, skipped: 1 });
  });

  it("reports the current verified plan to the bundle policy", async () => {
    const onVerified = jest.fn();
    await reconcileSubscriptionShops({
      shops: [{ shopDomain: "a.myshopify.com", shopifyShopGid: "gid://shopify/Shop/1" }],
      verify: jest.fn().mockResolvedValue({ planCode: "FREE" }),
      onVerified,
    });
    expect(onVerified).toHaveBeenCalledWith(expect.objectContaining({
      currentPlanCode: "FREE",
    }));
  });
});
