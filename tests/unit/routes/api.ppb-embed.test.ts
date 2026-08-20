/* eslint-disable import/first */
jest.mock("../../../app/lib/logger", () => ({ AppLogger: { error: jest.fn() } }));
jest.mock("../../../app/db.server", () => ({ __esModule: true, default: { bundle: { findMany: jest.fn() } } }));
jest.mock("../../../app/shopify.server", () => ({ authenticate: { public: { appProxy: jest.fn() } } }));
jest.mock("../../../app/lib/bundle-formatter.server", () => ({ formatBundleForWidget: jest.fn((bundle) => ({ id: bundle.id, steps: bundle.steps })) }));

import { loader } from "../../../app/routes/api/api.ppb-embed[.]json";
import { authenticate } from "../../../app/shopify.server";

const findMany = () => require("../../../app/db.server").default.bundle.findMany as jest.MockedFunction<any>;
const mockAppProxy = authenticate.public.appProxy as jest.MockedFunction<any>;

function request(extra: Record<string, string | string[]> = {}, headers: Record<string, string> = {}) {
  const params = new URLSearchParams({ shop: "test.myshopify.com", productId: "123", productHandle: "sample", locale: "en" });
  for (const [key, value] of Object.entries(extra)) {
    params.delete(key);
    (Array.isArray(value) ? value : [value]).forEach((item) => params.append(key, item));
  }
  return new Request(`https://test.myshopify.com/apps/product-bundles/api/ppb-embed.json?${params}`, { headers });
}

describe("api.ppb-embed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppProxy.mockResolvedValue({ session: { shop: "test.myshopify.com" } });
  });

  it("rejects invalid signatures and missing required context without querying", async () => {
    mockAppProxy.mockRejectedValueOnce(new Response(null, { status: 401 }));
    await expect(loader({ request: request(), params: {}, context: {} } as any)).rejects.toBeInstanceOf(Response);
    expect(findMany()).not.toHaveBeenCalled();
    const response = await loader({ request: request({ productId: "" }), params: {}, context: {} } as any);
    expect(response.status).toBe(400);
    expect(findMany()).not.toHaveBeenCalled();
  });

  it("queries active or unlisted PPBs for only the signed shop", async () => {
    findMany().mockResolvedValue([]);
    await loader({ request: request({ collectionId: ["456", "789"] }), params: {}, context: {} } as any);
    expect(findMany()).toHaveBeenCalledWith(expect.objectContaining({
      where: { shopId: "test.myshopify.com", bundleType: "product_page", status: { in: ["active", "unlisted"] } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }));
  });

  it("returns the canonical response with private cache headers and ETag revalidation", async () => {
    findMany().mockResolvedValue([]);
    const first = await loader({ request: request(), params: {}, context: {} } as any);
    expect(await first.json()).toEqual({ embed: null });
    expect(first.headers.get("Cache-Control")).toBe("private, max-age=30, must-revalidate");
    const second = await loader({ request: request({}, { "If-None-Match": first.headers.get("ETag")! }), params: {}, context: {} } as any);
    expect(second.status).toBe(304);
  });

  it("fails closed without caching database errors", async () => {
    findMany().mockRejectedValue(new Error("db unavailable"));
    const response = await loader({ request: request(), params: {}, context: {} } as any);
    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ embed: null });
  });
});
