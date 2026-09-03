/**
 * Unit Tests: Webhook Worker → Inngest integration
 *
 * Verifies:
 *  - inngest.send() is called with correct event name and payload shape
 *  - inactive topics and irrelevant product deletions are not enqueued
 *  - HTTP 200 is returned to Shopify even when inngest.send() throws
 *  - The old fire-and-forget WebhookProcessor call is removed
 */

import { createHmac } from "node:crypto";

import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
// Mock inngest client BEFORE importing the worker
var mockSend = jest.fn();
var mockIsTrackedBundleProductDelete = jest.fn();
jest.mock("../../../app/inngest/client", () => ({
  inngest: { send: mockSend },
}));

jest.mock("../../../app/services/webhooks/product-delete-relevance.server", () => ({
  isTrackedBundleProductDelete: mockIsTrackedBundleProductDelete,
}));

// Mock WebhookProcessor — it should NOT be called directly by the worker anymore
jest.mock("../../../app/services/webhooks/processor.server", () => ({
  WebhookProcessor: {
    processWebhookMessage: jest.fn(),
  },
}));

// Mock logger to suppress output
jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

const { WebhookProcessor } = require("../../../app/services/webhooks/processor.server");
const { handleRequest } = require("../../../app/services/webhook-worker.server");

const mockProcessWebhook = WebhookProcessor.processWebhookMessage as jest.Mock;

// Helper: build a valid HMAC for the given body
function makeHmac(body: string): string {
  return createHmac("sha256", process.env.SHOPIFY_API_SECRET!)
    .update(Buffer.from(body))
    .digest("base64");
}

// Helper: build a minimal mock IncomingMessage + ServerResponse pair
function buildReqRes(
  body: string,
  headers: Record<string, string> = {},
): { req: IncomingMessage; res: ServerResponse; resData: { statusCode?: number; ended: boolean; body: string } } {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = "POST";
  req.url = "/webhooks";

  const defaultHeaders = {
    "x-shopify-topic": "app/scopes_update",
    "x-shopify-shop-domain": "test.myshopify.com",
    "x-shopify-webhook-id": "wh-001",
    "x-shopify-api-version": "2025-10",
    "x-shopify-hmac-sha256": makeHmac(body),
    "content-type": "application/json",
  };

  Object.assign(req.headers, defaultHeaders, headers);

  const resData = { statusCode: undefined as number | undefined, ended: false, body: "" };
  const res = new ServerResponse(req);
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = (statusCode: number, ...args: any[]) => {
    resData.statusCode = statusCode;
    return origWriteHead(statusCode, ...args);
  };
  const origEnd = res.end.bind(res);
  res.end = (chunk?: any) => {
    resData.ended = true;
    resData.body = chunk ? chunk.toString() : "";
    return origEnd(chunk);
  };

  return { req, res, resData };
}

// Fire body data into the request stream
function emitBody(req: IncomingMessage, body: string) {
  process.nextTick(() => {
    req.emit("data", Buffer.from(body));
    req.emit("end");
  });
}

describe("Webhook worker → Inngest integration", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockProcessWebhook.mockReset();
    mockIsTrackedBundleProductDelete.mockReset();
    mockSend.mockResolvedValue(undefined);
    mockIsTrackedBundleProductDelete.mockResolvedValue(true);
  });

  it("calls inngest.send with 'shopify/webhook' event and correct payload fields", async () => {
    const body = JSON.stringify({ current: ["read_products"] });
    const { req, res, resData } = buildReqRes(body);


    emitBody(req, body);
    await new Promise<void>((resolve) => {
      const origEnd = res.end.bind(res);
      res.end = (chunk?: any) => {
        origEnd(chunk);
        resolve();
        return res;
      };
      handleRequest(req, res);
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const [sentEvent] = mockSend.mock.calls[0];
    expect(sentEvent.name).toBe("shopify/webhook");
    expect(sentEvent.data.topic).toBe("app/scopes_update");
    expect(sentEvent.data.shopDomain).toBe("test.myshopify.com");
    expect(sentEvent.data.webhookId).toBe("wh-001");
    expect(sentEvent.data.apiVersion).toBe("2025-10");
    // rawPayload must be base64-encoded body
    expect(Buffer.from(sentEvent.data.rawPayload, "base64").toString()).toBe(body);
    expect(resData.statusCode).toBe(200);
    expect(mockIsTrackedBundleProductDelete).not.toHaveBeenCalled();
  });

  it.each([
    "app_purchases_one_time/update",
    "app_subscriptions/update",
    "inventory_levels/update",
    "orders/create",
    "products/update",
    "unexpected/topic",
  ])("acknowledges inactive topic %s without sending it to Inngest", async (topic) => {
    const body = JSON.stringify({ id: 123 });
    const { req, res, resData } = buildReqRes(body, {
      "x-shopify-topic": topic,
    });

    emitBody(req, body);
    await handleRequest(req, res);

    expect(resData.statusCode).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
    expect(mockIsTrackedBundleProductDelete).not.toHaveBeenCalled();
  });

  it("does not enqueue an unreferenced product deletion", async () => {
    mockIsTrackedBundleProductDelete.mockResolvedValue(false);
    const body = JSON.stringify({ id: 123 });
    const { req, res, resData } = buildReqRes(body, {
      "x-shopify-topic": "products/delete",
    });

    emitBody(req, body);
    await handleRequest(req, res);

    expect(resData.statusCode).toBe(200);
    expect(mockIsTrackedBundleProductDelete).toHaveBeenCalledWith({
      rawBody: expect.any(Buffer),
      shopDomain: "test.myshopify.com",
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("enqueues a referenced product deletion", async () => {
    const body = JSON.stringify({ id: 123 });
    const { req, res } = buildReqRes(body, {
      "x-shopify-topic": "products/delete",
    });

    emitBody(req, body);
    await handleRequest(req, res);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      name: "shopify/webhook",
      data: expect.objectContaining({ topic: "products/delete" }),
    }));
  });

  it("fails open when product deletion relevance cannot be checked", async () => {
    mockIsTrackedBundleProductDelete.mockRejectedValue(new Error("Database unavailable"));
    const body = JSON.stringify({ id: 123 });
    const { req, res } = buildReqRes(body, {
      "x-shopify-topic": "products/delete",
    });

    emitBody(req, body);
    await handleRequest(req, res);

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("returns 200 even when inngest.send() throws", async () => {
    mockSend.mockRejectedValue(new Error("Inngest unreachable"));
    const body = JSON.stringify({ test: true });
    const { req, res, resData } = buildReqRes(body);

    if (!handleRequest) return;

    emitBody(req, body);
    await new Promise<void>((resolve) => {
      const origEnd = res.end.bind(res);
      res.end = (chunk?: any) => {
        origEnd(chunk);
        resolve();
        return res;
      };
      handleRequest(req, res);
    });

    expect(resData.statusCode).toBe(200);
    expect(resData.ended).toBe(true);
  });

  it("does NOT call WebhookProcessor.processWebhookMessage directly", async () => {
    mockSend.mockResolvedValue(undefined);
    const body = JSON.stringify({ test: true });
    const { req, res } = buildReqRes(body);

    if (!handleRequest) return;

    emitBody(req, body);
    await new Promise<void>((resolve) => {
      const origEnd = res.end.bind(res);
      res.end = (chunk?: any) => {
        origEnd(chunk);
        resolve();
        return res;
      };
      handleRequest(req, res);
    });

    // Give async operations time to settle
    await new Promise((r) => setTimeout(r, 50));
    expect(mockProcessWebhook).not.toHaveBeenCalled();
  });
});
