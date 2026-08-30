import { loader } from "../../../app/routes/app/app.billing.return";
import { authenticate } from "../../../app/shopify.server";
import { resolveShopEntitlements } from "../../../app/services/subscriptions/subscription-service.server";
import { applyFreePlanBundlePolicy } from "../../../app/services/subscriptions/free-plan-bundle-policy.server";
import { recordBusinessEvent } from "../../../app/services/app-events.server";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/services/subscriptions/subscription-service.server", () => ({
  resolveShopEntitlements: jest.fn(),
}));

jest.mock("../../../app/services/subscriptions/free-plan-bundle-policy.server", () => ({
  applyFreePlanBundlePolicy: jest.fn(),
}));

jest.mock("../../../app/services/app-events.server", () => ({
  recordBusinessEvent: jest.fn(),
}));

jest.mock("../../../app/services/bundles/storefront-sync.server", () => ({
  syncBundleStorefrontNow: jest.fn(),
}));

const authenticateAdmin = authenticate.admin as jest.MockedFunction<typeof authenticate.admin>;
const resolveEntitlements = resolveShopEntitlements as jest.MockedFunction<
  typeof resolveShopEntitlements
>;
const applyFreePolicy = applyFreePlanBundlePolicy as jest.MockedFunction<
  typeof applyFreePlanBundlePolicy
>;
const recordEvent = recordBusinessEvent as jest.MockedFunction<typeof recordBusinessEvent>;
const embeddedRedirect = jest.fn((destination: string) =>
  new Response(null, { status: 302, headers: { Location: destination } }),
);

describe("App Pricing return loader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authenticateAdmin.mockResolvedValue({
      admin: {},
      session: { shop: "test-shop.myshopify.com" },
      redirect: embeddedRedirect,
    } as any);
    applyFreePolicy.mockResolvedValue({
      retainedBundleId: null,
      unpublishedBundleIds: [],
    });
    recordEvent.mockResolvedValue(undefined as never);
  });

  it("grants Growth only after a forced provider verification", async () => {
    resolveEntitlements.mockResolvedValue({
      planCode: "GROWTH",
      billingInterval: "MONTHLY",
    } as any);

    const response = await loader({
      request: new Request(
        "https://app.example.com/app/billing/return?plan_handle=free",
      ),
      params: {},
      context: {},
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/app/billing?upgraded=true");
    expect(embeddedRedirect).toHaveBeenCalledWith("/app/billing?upgraded=true");
    expect(resolveEntitlements).toHaveBeenCalledWith({
      shopDomain: "test-shop.myshopify.com",
      forceRefresh: true,
    });
    expect(applyFreePolicy).not.toHaveBeenCalled();
  });

  it("applies the Free policy after Shopify verifies Free", async () => {
    resolveEntitlements.mockResolvedValue({
      planCode: "FREE",
      billingInterval: "NONE",
    } as any);

    const response = await loader({
      request: new Request("https://app.example.com/app/billing/return"),
      params: {},
      context: {},
    });

    expect(response.headers.get("Location")).toBe("/app/billing");
    expect(embeddedRedirect).toHaveBeenCalledWith("/app/billing");
    expect(applyFreePolicy).toHaveBeenCalledWith(expect.objectContaining({
      shopDomain: "test-shop.myshopify.com",
    }));
  });

  it("does not grant a plan when provider verification is unknown", async () => {
    resolveEntitlements.mockResolvedValue({
      planCode: null,
      billingInterval: "NONE",
    } as any);

    const response = await loader({
      request: new Request(
        "https://app.example.com/app/billing/return?plan_handle=growth",
      ),
      params: {},
      context: {},
    });

    expect(response.headers.get("Location")).toBe(
      "/app/billing?error=billing_unverified",
    );
    expect(embeddedRedirect).toHaveBeenCalledWith(
      "/app/billing?error=billing_unverified",
    );
    expect(applyFreePolicy).not.toHaveBeenCalled();
    expect(recordEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventHandle: "subscription_verification_failed",
      errorCode: "billing_unverified",
    }));
  });
});
