import { action, loader } from "../../../app/routes/app/app.billing";
import { authenticate } from "../../../app/shopify.server";
import { BundleAnalyticsService } from "../../../app/services/bundle-analytics.server";
import { resolveShopEntitlements } from "../../../app/services/subscriptions/subscription-service.server";
import { getCurrentShopifyAppIdentity } from "../../../app/services/subscriptions/shopify-app-identity.server";
import { getShopifyAppPricingUrl } from "../../../app/services/subscriptions/app-pricing-navigation.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/services/bundle-analytics.server", () => ({
  BundleAnalyticsService: { getQuickStats: jest.fn() },
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/shopify-app-identity.server", () => ({
  getCurrentShopifyAppIdentity: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/app-pricing-navigation.server", () => ({
  getShopifyAppPricingUrl: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { bundle: { count: jest.fn() } },
}));

const authenticateAdmin = authenticate.admin as jest.MockedFunction<typeof authenticate.admin>;
const getQuickStats = BundleAnalyticsService.getQuickStats as jest.MockedFunction<
  typeof BundleAnalyticsService.getQuickStats
>;
const resolveEntitlements = resolveShopEntitlements as jest.MockedFunction<
  typeof resolveShopEntitlements
>;
const currentAppIdentity = getCurrentShopifyAppIdentity as jest.MockedFunction<
  typeof getCurrentShopifyAppIdentity
>;
const pricingUrl = getShopifyAppPricingUrl as jest.MockedFunction<
  typeof getShopifyAppPricingUrl
>;
const getDb = () => require("../../../app/db.server").default;

function makeActionRequest(intent: string) {
  return new Request("https://app.example.com/app/billing", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ intent }),
  });
}

describe("app billing route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      admin: {},
      session: { shop: "test-shop.myshopify.com" },
    } as any);
    resolveEntitlements.mockResolvedValue({
      planCode: "GROWTH",
      status: "ACTIVE",
      billingInterval: "ANNUAL",
      entitlements: { limits: { publicBundles: null } },
    } as any);
    getQuickStats.mockResolvedValue({
      activeBundles: 2,
      totalSteps: 5,
      bundleTypes: { productPage: 1, fullPage: 1 },
    } as any);
    getDb().bundle.count.mockResolvedValue(2);
    currentAppIdentity.mockResolvedValue({
      id: "gid://shopify/App/299492081665",
      handle: "wolfpack-product-bundles-sit",
    });
    pricingUrl.mockReturnValue(
      "https://admin.shopify.com/store/test-shop/charges/wolfpack-product-bundles-sit/pricing_plans",
    );
  });

  it("loads verified Growth billing and usage data", async () => {
    const response = await loader({
      request: new Request("https://app.example.com/app/billing?upgraded=true"),
      params: {},
      context: {},
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      subscription: {
        plan: "growth",
        status: "active",
        billingInterval: "ANNUAL",
        currentBundleCount: 2,
        canCreateBundle: true,
      },
      upgraded: true,
    });
  });

  it("returns a 500 payload when billing cannot be verified", async () => {
    resolveEntitlements.mockRejectedValueOnce(new Error("provider unavailable"));

    const response = await loader({
      request: new Request("https://app.example.com/app/billing"),
      params: {},
      context: {},
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toMatchObject({
      error: "Failed to load billing information",
      subscription: null,
    });
  });

  it.each(["upgrade", "cancel"])(
    "opens Shopify-hosted plan management for %s",
    async (intent) => {
      const response = await action({
        request: makeActionRequest(intent),
        params: {},
        context: {},
      });
      const data = await response.json() as { hostedPlanUrl?: string };

      expect(response.status).toBe(200);
      expect(data.hostedPlanUrl).toContain("/pricing_plans");
      expect(pricingUrl).toHaveBeenCalledWith(
        "test-shop.myshopify.com",
        "wolfpack-product-bundles-sit",
      );
    },
  );

  it("rejects unknown billing actions", async () => {
    const response = await action({
      request: makeActionRequest("legacy-cancel"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(400);
    expect(currentAppIdentity).not.toHaveBeenCalled();
  });

  it("returns an error when Shopify plan management cannot be opened", async () => {
    currentAppIdentity.mockRejectedValueOnce(new Error("identity unavailable"));

    const response = await action({
      request: makeActionRequest("upgrade"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(500);
  });
});
