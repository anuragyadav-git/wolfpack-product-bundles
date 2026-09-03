import {
  ACTIVE_WEBHOOK_TOPICS,
  isActiveWebhookTopic,
} from "../../../../app/services/webhooks/topics";

describe("Shopify webhook topic contract", () => {
  it("contains only the operational and compliance topics the app handles", () => {
    expect([...ACTIVE_WEBHOOK_TOPICS].sort()).toEqual([
      "app/scopes_update",
      "app/uninstalled",
      "customers/data_request",
      "customers/redact",
      "products/delete",
      "shop/redact",
    ]);
  });

  it.each([
    "app_purchases_one_time/update",
    "app_subscriptions/update",
    "inventory_levels/update",
    "orders/create",
    "products/update",
    "unexpected/topic",
  ])("rejects inactive topic %s", (topic) => {
    expect(isActiveWebhookTopic(topic)).toBe(false);
  });

  it("accepts a current operational topic", () => {
    expect(isActiveWebhookTopic("products/delete")).toBe(true);
  });
});
