import { recordBusinessEvent } from "../../../app/services/app-events.server";
import { recordSubscriptionEvent } from "../../../app/services/subscriptions/subscription-telemetry.server";

jest.mock("../../../app/services/app-events.server", () => ({
  recordBusinessEvent: jest.fn(),
}));

describe("recordSubscriptionEvent", () => {
  it("records approved gate dimensions without public Shopify delivery", async () => {
    await recordSubscriptionEvent({
      eventHandle: "entitlement_publish_blocked",
      shopDomain: "shop.myshopify.com",
      planCode: "FREE",
      billingInterval: "NONE",
      featureKey: "bundle.public.limit",
      gateLocation: "fpb_save",
      bundleType: "FULL_PAGE",
      action: "publish",
      result: "blocked",
      errorCode: "LIMIT_REACHED",
    });
    expect(recordBusinessEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventHandle: "entitlement_publish_blocked",
      shopDomain: "shop.myshopify.com",
      result: "blocked",
      errorCode: "LIMIT_REACHED",
      attributes: expect.objectContaining({
        plan_code: "FREE",
        feature_key: "bundle.public.limit",
        gate_location: "fpb_save",
        action: "publish",
      }),
      sendToShopify: false,
    }));
  });
});
