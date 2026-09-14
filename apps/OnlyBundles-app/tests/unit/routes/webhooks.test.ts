/* eslint-disable import/first */
var mockAuthenticateWebhook = jest.fn();
var mockSend = jest.fn();
var mockIsTrackedBundleProductDelete = jest.fn();

jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    admin: jest.fn(),
    public: { appProxy: jest.fn() },
    webhook: mockAuthenticateWebhook,
  },
}));

jest.mock("../../../app/inngest/client", () => ({
  inngest: { send: mockSend },
}));

jest.mock("../../../app/services/webhooks/product-delete-relevance.server", () => ({
  isTrackedBundleProductDelete: mockIsTrackedBundleProductDelete,
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { action } from "../../../app/routes/api/webhooks";

function request() {
  return new Request("https://app.test/webhooks", { method: "POST", body: "{}" });
}

function authenticatedWebhook(topic: string, payload: Record<string, unknown> = { id: 123 }) {
  return {
    apiVersion: "2026-07",
    payload,
    shop: "test.myshopify.com",
    topic,
    webhookId: "webhook-1",
  };
}

describe("Shopify webhook Remix action", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateWebhook.mockResolvedValue(authenticatedWebhook("APP_SCOPES_UPDATE"));
    mockSend.mockResolvedValue(undefined);
    mockIsTrackedBundleProductDelete.mockResolvedValue(true);
  });

  it("propagates Shopify webhook authentication failures", async () => {
    const rejection = new Response(null, { status: 401 });
    mockAuthenticateWebhook.mockRejectedValue(rejection);

    await expect(action({ request: request(), params: {}, context: {} } as never))
      .rejects.toBe(rejection);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it.each([
    ["APP_UNINSTALLED", "app/uninstalled"],
    ["APP_SCOPES_UPDATE", "app/scopes_update"],
    ["PRODUCTS_DELETE", "products/delete"],
    ["CUSTOMERS_DATA_REQUEST", "customers/data_request"],
    ["CUSTOMERS_REDACT", "customers/redact"],
    ["SHOP_REDACT", "shop/redact"],
  ])("awaits durable enqueueing for %s", async (authenticatedTopic, processorTopic) => {
    mockAuthenticateWebhook.mockResolvedValue(authenticatedWebhook(authenticatedTopic));

    const response = await action({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(200);
    expect(mockSend).toHaveBeenCalledWith({
      name: "shopify/webhook",
      data: expect.objectContaining({
        apiVersion: "2026-07",
        shopDomain: "test.myshopify.com",
        topic: processorTopic,
        webhookId: "webhook-1",
      }),
    });
  });

  it("acknowledges an inactive topic without enqueueing it", async () => {
    mockAuthenticateWebhook.mockResolvedValue(authenticatedWebhook("PRODUCTS_UPDATE"));

    const response = await action({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does not enqueue an unreferenced product deletion", async () => {
    mockAuthenticateWebhook.mockResolvedValue(authenticatedWebhook("PRODUCTS_DELETE", { id: 456 }));
    mockIsTrackedBundleProductDelete.mockResolvedValue(false);

    const response = await action({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(200);
    expect(mockIsTrackedBundleProductDelete).toHaveBeenCalledWith({
      rawBody: Buffer.from(JSON.stringify({ id: 456 })),
      shopDomain: "test.myshopify.com",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("enqueues a product deletion when relevance lookup fails", async () => {
    mockAuthenticateWebhook.mockResolvedValue(authenticatedWebhook("PRODUCTS_DELETE"));
    mockIsTrackedBundleProductDelete.mockRejectedValue(new Error("database unavailable"));

    const response = await action({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("returns a retryable error when durable enqueueing fails", async () => {
    mockSend.mockRejectedValue(new Error("Inngest unavailable"));

    const response = await action({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ received: false });
  });
});
