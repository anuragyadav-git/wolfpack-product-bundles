import {
  resolveSubscriptionState,
  type ProviderVerification,
} from "../../../app/services/subscriptions/subscription-resolution.server";
import {
  getPartnerApiAccessToken,
  ShopifyAppPricingClient,
} from "../../../app/services/subscriptions/shopify-app-pricing.server";

const NOW = new Date("2026-08-28T12:00:00.000Z");

function verification(overrides: Partial<ProviderVerification> = {}): ProviderVerification {
  return {
    provider: "SHOPIFY_APP_PRICING",
    outcome: "NO_PAID_CONTRACT",
    status: "ACTIVE",
    planCode: "FREE",
    billingInterval: "NONE",
    verifiedAt: NOW,
    ...overrides,
  };
}

describe("resolveSubscriptionState", () => {
  it("maps active monthly and annual managed plans to Growth", () => {
    for (const billingInterval of ["MONTHLY", "ANNUAL"] as const) {
      expect(resolveSubscriptionState({
        now: NOW,
        managed: verification({ outcome: "ACTIVE_GROWTH", planCode: "GROWTH", billingInterval }),
      })).toMatchObject({ planCode: "GROWTH", billingInterval, provider: "SHOPIFY_APP_PRICING" });
    }
  });

  it("maps a verified absence of a paid contract to Free", () => {
    expect(resolveSubscriptionState({ now: NOW, managed: verification() }))
      .toMatchObject({ planCode: "FREE", status: "ACTIVE" });
  });

  it("uses a recent managed Growth snapshot during a provider outage", () => {
    expect(resolveSubscriptionState({
      now: NOW,
      managed: verification({ outcome: "UNKNOWN", status: "UNKNOWN", planCode: null }),
      cached: verification({
        outcome: "ACTIVE_GROWTH",
        planCode: "GROWTH",
        billingInterval: "ANNUAL",
        verifiedAt: new Date("2026-08-28T00:30:00.000Z"),
      }),
    })).toMatchObject({ planCode: "GROWTH", isOutageGrace: true });
  });

  it("returns Unknown when managed pricing cannot be verified without paid grace", () => {
    expect(resolveSubscriptionState({
      now: NOW,
      managed: verification({ outcome: "UNKNOWN", status: "UNKNOWN", planCode: null }),
    })).toMatchObject({ planCode: null, status: "UNKNOWN" });
  });
});

describe("ShopifyAppPricingClient", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it("queries the Partner API and maps the configured Growth handle", async () => {
    const fetchMock = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { activeSubscription: {
        billingPeriod: "ANNUAL",
        cancelAtEndOfCycle: false,
        trialEndsAt: null,
        currentBillingCycle: null,
        items: [{ handle: "growth", price: { active: true } }],
        pendingUpdate: null,
      } },
    }), { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
    const client = new ShopifyAppPricingClient({
      accessToken: "partner-secret",
      appId: "gid://shopify/App/10",
    });
    await expect(client.verify("gid://shopify/Shop/20")).resolves.toMatchObject({
      outcome: "ACTIVE_GROWTH",
      planCode: "GROWTH",
      billingInterval: "ANNUAL",
    });
  });

  it("grants Growth during Shopify's trial without a local trial ledger", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { activeSubscription: {
        billingPeriod: "EVERY_30_DAYS",
        cancelAtEndOfCycle: false,
        trialEndsAt: "2026-09-12T12:00:00.000Z",
        currentBillingCycle: null,
        items: [{ handle: "growth", price: { active: true } }],
        pendingUpdate: null,
      } },
    }), { status: 200 })) as typeof fetch;
    const client = new ShopifyAppPricingClient({
      accessToken: "partner-secret",
      appId: "gid://shopify/App/10",
    });

    await expect(client.verify("gid://shopify/Shop/20")).resolves.toMatchObject({
      outcome: "ACTIVE_GROWTH",
      planCode: "GROWTH",
      billingInterval: "MONTHLY",
    });
  });

  it("fails closed for an unrecognized active item handle", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { activeSubscription: {
        billingPeriod: "EVERY_30_DAYS",
        cancelAtEndOfCycle: false,
        trialEndsAt: null,
        currentBillingCycle: null,
        items: [{ handle: "unexpected-item", price: { active: true } }],
        pendingUpdate: null,
      } },
    }), { status: 200 })) as typeof fetch;
    const client = new ShopifyAppPricingClient({
      accessToken: "partner-secret",
      appId: "gid://shopify/App/10",
    });
    await expect(client.verify("gid://shopify/Shop/20")).resolves.toMatchObject({
      outcome: "UNKNOWN",
      planCode: null,
    });
  });

  it("reads only the Partner API access token from environment configuration", () => {
    expect(getPartnerApiAccessToken({
      SHOPIFY_PARTNER_API_ACCESS_TOKEN: " partner-secret ",
    })).toBe("partner-secret");
    expect(getPartnerApiAccessToken({})).toBeNull();
  });
});
