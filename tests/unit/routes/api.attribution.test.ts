import { action } from "../../../app/routes/api/api.attribution";
import { matchLineItemsToBundles } from "../../../app/lib/analytics/bundle-matcher.server";

jest.mock("../../../app/lib/analytics/bundle-matcher.server", () => ({
  matchLineItemsToBundles: jest.fn(),
  normalizeToOrderGid: (orderId: string) => (
    orderId.startsWith("gid://shopify/Order/")
      ? orderId
      : `gid://shopify/Order/${orderId}`
  ),
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
        orderId: "123",
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
        orderId: "456",
        shopId: "test.myshopify.com",
        totalPrice: "25.00",
        currencyCode: "USD",
        lineItems: [{
          productId: "gid://shopify/Product/1",
          properties: [
            { key: "_wpb_bundle_id", value: "bundle-123" },
            { key: "_wpb_offer_policy_id", value: "policy-1" },
            { key: "_wpb_offer_rule_version", value: "8" },
            { key: "_wpb_offer_tier_id", value: "tier-3" },
            { key: "_wpb_offer_eligibility_source", value: "schedule" },
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
        orderId: "789",
        shopId: "test.myshopify.com",
        lineItems: [{
          productId: "gid://shopify/Product/1",
          properties: {
            _wpb_bundle_id: "bundle-other",
            _wpb_offer_policy_id: "policy-private",
            _wpb_offer_eligibility_source: "customer_email",
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
});
