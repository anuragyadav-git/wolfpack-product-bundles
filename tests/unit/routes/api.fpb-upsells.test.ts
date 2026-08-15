/* eslint-disable import/first */
jest.mock("../../../app/lib/logger", () => ({ AppLogger: { warn: jest.fn(), error: jest.fn() } }));
jest.mock("../../../app/db.server", () => ({ __esModule: true, default: { bundle: { findMany: jest.fn() } } }));

import { createHmac } from "node:crypto";
import { loader } from "../../../app/routes/api/api.fpb-upsells[.]json";

const findMany = () => require("../../../app/db.server").default.bundle.findMany as jest.MockedFunction<any>;

function request(extra: Record<string, string | string[]> = {}, signed = true, headers: Record<string, string> = {}) {
  const params = new URLSearchParams({ shop: "test.myshopify.com", timestamp: "123", productId: "123", locale: "en" });
  for (const [key, value] of Object.entries(extra)) {
    params.delete(key);
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item));
  }
  if (signed) {
    const message = [...params.entries()].reduce((map, [key, value]) => map.set(key, [...(map.get(key) ?? []), value]), new Map<string, string[]>());
    const canonical = [...message.entries()].map(([key, values]) => `${key}=${values.join(",")}`).sort().join("");
    params.set("signature", createHmac("sha256", "test_api_secret").update(canonical).digest("hex"));
  }
  return new Request(`https://test.myshopify.com/apps/product-bundles/api/fpb-upsells.json?${params}`, { headers });
}

describe("api.fpb-upsells", () => {
  const originalSecret = process.env.SHOPIFY_API_SECRET;
  beforeEach(() => { jest.clearAllMocks(); process.env.SHOPIFY_API_SECRET = "test_api_secret"; });
  afterAll(() => { process.env.SHOPIFY_API_SECRET = originalSecret; });

  it("rejects unsigned and missing-context requests without querying bundles", async () => {
    expect((await loader({ request: request({}, false), params: {}, context: {} } as any)).status).toBe(401);
    expect((await loader({ request: request({ productId: "" }), params: {}, context: {} } as any)).status).toBe(400);
    expect(findMany()).not.toHaveBeenCalled();
  });

  it("scopes the query to the signed shop and public FPBs", async () => {
    findMany().mockResolvedValue([]);
    const response = await loader({ request: request({ collectionId: ["456", "789"] }), params: {}, context: {} } as any);
    expect(response.status).toBe(200);
    expect(findMany()).toHaveBeenCalledWith(expect.objectContaining({ where: { shopId: "test.myshopify.com", bundleType: "full_page", status: { in: ["active", "unlisted"] }, publicNumber: { not: null }, upsellWidgetEnabled: true } }));
  });

  it("returns a private short cache with ETag revalidation", async () => {
    findMany().mockResolvedValue([]);
    const first = await loader({ request: request(), params: {}, context: {} } as any);
    const etag = first.headers.get("ETag")!;
    expect(first.headers.get("Cache-Control")).toContain("private");
    const second = await loader({ request: request({}, true, { "If-None-Match": etag }), params: {}, context: {} } as any);
    expect(second.status).toBe(304);
  });
});
