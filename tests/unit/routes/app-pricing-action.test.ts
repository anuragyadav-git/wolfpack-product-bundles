import { action, loader } from "../../../app/routes/app/app.pricing";
import { authenticate } from "../../../app/shopify.server";
import { getShopifyAppPricingUrl } from "../../../app/services/subscriptions/app-pricing-navigation.server";
import { recordBusinessEvent } from "../../../app/services/app-events.server";
import { getCurrentShopifyAppIdentity } from "../../../app/services/subscriptions/shopify-app-identity.server";
import { resolveShopEntitlements } from "../../../app/services/subscriptions/subscription-service.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/services/subscriptions/app-pricing-navigation.server", () => ({
  getShopifyAppPricingUrl: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/shopify-app-identity.server", () => ({
  getCurrentShopifyAppIdentity: jest.fn(),
}));

jest.mock("../../../app/services/app-events.server", () => ({
  recordBusinessEvent: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { bundle: { count: jest.fn() } },
}));

const authenticateAdmin = authenticate.admin as jest.MockedFunction<typeof authenticate.admin>;
const pricingUrl = getShopifyAppPricingUrl as jest.MockedFunction<typeof getShopifyAppPricingUrl>;
const recordEvent = recordBusinessEvent as jest.MockedFunction<typeof recordBusinessEvent>;
const currentAppIdentity = getCurrentShopifyAppIdentity as jest.MockedFunction<
  typeof getCurrentShopifyAppIdentity
>;
const resolveEntitlements = resolveShopEntitlements as jest.MockedFunction<
  typeof resolveShopEntitlements
>;
const getDb = () => require("../../../app/db.server").default;

function makeRequest(plan: string): Request {
  return new Request("https://app.example.com/app/pricing", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ plan }),
  });
}

describe("app pricing action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      admin: {},
      session: { shop: "test-shop.myshopify.com" },
    } as any);
    pricingUrl.mockReturnValue(
      "https://admin.shopify.com/store/test-shop/charges/wolfpack-product-bundles/pricing_plans",
    );
    currentAppIdentity.mockResolvedValue({
      id: "gid://shopify/App/299492081665",
      handle: "wolfpack-product-bundles-sit",
    });
    recordEvent.mockResolvedValue(undefined as never);
    resolveEntitlements.mockResolvedValue({
      planCode: "FREE",
      entitlements: {
        limits: { publicBundles: 1 },
      },
    } as any);
    getDb().bundle.count.mockResolvedValue(0);
  });

  it("loads verified Free usage and limit data", async () => {
    const response = await loader({
      request: new Request("https://app.example.com/app/pricing"),
      params: {},
      context: {},
    });
    const subscription = await (response as any).data.subscription;

    expect(subscription).toMatchObject({
      currentPlan: "free",
      currentBundleCount: 0,
      bundleLimit: 1,
      canCreateBundle: true,
    });
  });

  it("returns a safe error payload when subscription verification fails", async () => {
    resolveEntitlements.mockRejectedValueOnce(new Error("provider unavailable"));

    const response = await loader({
      request: new Request("https://app.example.com/app/pricing"),
      params: {},
      context: {},
    });
    const subscription = await (response as any).data.subscription;

    expect(subscription).toMatchObject({
      error: "Failed to load pricing information",
      currentPlan: "free",
    });
  });

  it("returns the shop-specific hosted page for the single Growth plan", async () => {
    const response = await action({
      request: makeRequest("growth"),
      params: {},
      context: {},
    });

    const responseData = await response.json();
    expect(currentAppIdentity).toHaveBeenCalledWith({});
    expect(pricingUrl).toHaveBeenCalledWith(
      "test-shop.myshopify.com",
      "wolfpack-product-bundles-sit",
    );
    expect(responseData).toEqual({
      success: true,
      hostedPlanUrl:
        "https://admin.shopify.com/store/test-shop/charges/wolfpack-product-bundles/pricing_plans",
    });
    expect(response.status).toBe(200);
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      attributes: { plan_code: "GROWTH" },
    }));
  });

  it("rejects unknown plans", async () => {
    const response = await action({
      request: makeRequest("unsupported-plan"),
      params: {},
      context: {},
    });

    expect(response.status).toBe(400);
    expect(pricingUrl).not.toHaveBeenCalled();
  });
});
