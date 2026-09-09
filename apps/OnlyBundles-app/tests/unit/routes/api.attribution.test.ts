import { action } from "../../../app/routes/api/api.attribution";
import { matchLineItemsToBundles } from "../../../app/lib/analytics/bundle-matcher.server";

jest.mock("../../../app/lib/analytics/bundle-matcher.server", () => ({
  matchLineItemsToBundles: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    orderAttribution: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

const mockMatchLineItemsToBundles = matchLineItemsToBundles as jest.MockedFunction<typeof matchLineItemsToBundles>;
const getDb = () => require("../../../app/db.server").default;

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("https://app.example.com/api/attribution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("api.attribution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchLineItemsToBundles.mockResolvedValue([]);
  });

  it("persists sanitized custom UTM attributes on attribution rows", async () => {
    const response = await action({
      request: makeRequest({
        orderId: "gid://shopify/Order/123",
        shopId: "test.myshopify.com",
        totalPrice: "10.00",
        currencyCode: "USD",
        customUtmAttributes: {
          utm_influencer: "sam",
          "Partner-ID": "partner-1",
          email: "blocked@example.com",
        },
      }),
      params: {},
      context: {},
    });

    expect(response.status).toBe(200);
    expect(getDb().orderAttribution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customUtmAttributes: {
          utm_influencer: "sam",
          "partner-id": "partner-1",
        },
      }),
    });
  });

  it("persists offer dimensions from Shopify checkout line properties for the matched bundle", async () => {
    mockMatchLineItemsToBundles.mockResolvedValue(["bundle-123"]);

    const response = await action({
      request: makeRequest({
        orderId: "gid://shopify/Order/456",
        shopId: "test.myshopify.com",
        totalPrice: "25.00",
        currencyCode: "USD",
        lineItems: [{
          productId: "gid://shopify/Product/1",
          properties: [
            {
              key: "_wpb_offer_analytics",
              value: JSON.stringify({
                bundleId: "bundle-123",
                offerPolicyId: "policy-1",
                offerRuleVersion: 8,
                offerTierId: "tier-3",
                offerEligibilitySource: "schedule",
              }),
            },
          ],
        }],
      }),
      params: {},
      context: {},
    });

    expect(response.status).toBe(200);
    expect(getDb().orderAttribution.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        bundleId: "bundle-123",
        offerPolicyId: "policy-1",
        offerRuleVersion: 8,
        offerTierId: "tier-3",
        offerEligibilitySource: "schedule",
      })],
    });
  });

  it("does not attach offer dimensions from an unrelated or invalid cart line", async () => {
    mockMatchLineItemsToBundles.mockResolvedValue(["bundle-123"]);

    await action({
      request: makeRequest({
        orderId: "gid://shopify/Order/789",
        shopId: "test.myshopify.com",
        lineItems: [{
          productId: "gid://shopify/Product/1",
          properties: {
            _bundle_display_properties: JSON.stringify({
              offerAnalytics: {
                bundleId: "bundle-other",
                offerPolicyId: "policy-private",
                offerEligibilitySource: "customer_email",
              },
            }),
          },
        }],
      }),
      params: {},
      context: {},
    });

    expect(getDb().orderAttribution.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        bundleId: "bundle-123",
        offerPolicyId: null,
        offerRuleVersion: null,
        offerTierId: null,
        offerEligibilitySource: null,
      })],
    });
  });

  it("reads offer dimensions from the component display envelope when Cart Transform is skipped", async () => {
    mockMatchLineItemsToBundles.mockResolvedValue(["bundle-123"]);

    await action({
      request: makeRequest({
        orderId: "gid://shopify/Order/790",
        shopId: "test.myshopify.com",
        lineItems: [{
          productId: "gid://shopify/Product/1",
          properties: {
            _bundle_display_properties: JSON.stringify({
              offerAnalytics: {
                bundleId: "bundle-123",
                offerPolicyId: "policy-2",
                offerRuleVersion: 9,
                offerTierId: "tier-4",
                offerEligibilitySource: "priority",
              },
            }),
          },
        }],
      }),
      params: {},
      context: {},
    });

    expect(getDb().orderAttribution.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        bundleId: "bundle-123",
        offerPolicyId: "policy-2",
        offerRuleVersion: 9,
        offerTierId: "tier-4",
        offerEligibilitySource: "priority",
      })],
    });
  });

  it("stores Shopify checkout line value separately from whole-order revenue", async () => {
    mockMatchLineItemsToBundles.mockResolvedValue(["bundle-123"]);

    await action({
      request: makeRequest({
        orderId: "gid://shopify/Order/791",
        shopId: "test.myshopify.com",
        totalPrice: "50.00",
        currencyCode: "USD",
        lineItems: [
          {
            properties: {
              _bundle_display_properties: JSON.stringify({
                offerAnalytics: { bundleId: "bundle-123" },
              }),
            },
            finalLinePrice: { amount: 12.5 },
          },
          {
            properties: {
              _bundle_display_properties: JSON.stringify({
                offerAnalytics: { bundleId: "bundle-123" },
              }),
            },
            finalLinePrice: { amount: 7.5 },
          },
          { finalLinePrice: { amount: 30 } },
        ],
      }),
      params: {},
      context: {},
    });

    expect(getDb().orderAttribution.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        bundleId: "bundle-123",
        revenue: 5_000,
        bundleRevenue: 2_000,
      })],
    });
  });

  it.each([
    ["numeric", "123"],
    ["missing", undefined],
  ])("rejects a %s Shopify order ID", async (_label, orderId) => {
    const response = await action({
      request: makeRequest({
        orderId,
        shopId: "test.myshopify.com",
      }),
      params: {},
      context: {},
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid Shopify order ID" });
    expect(getDb().orderAttribution.create).not.toHaveBeenCalled();
    expect(getDb().orderAttribution.createMany).not.toHaveBeenCalled();
  });
});
