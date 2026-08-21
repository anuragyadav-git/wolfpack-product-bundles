/* eslint-disable import/first */
jest.mock("../../../app/lib/logger", () => ({ AppLogger: { error: jest.fn() } }));
jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: { findFirst: jest.fn() },
    designSettings: { findUnique: jest.fn() },
  },
}));
jest.mock("../../../app/shopify.server", () => ({ authenticate: { public: { appProxy: jest.fn() } } }));
jest.mock("../../../app/lib/bundle-formatter.server", () => ({
  formatBundleForWidget: jest.fn((bundle) => ({ id: bundle.id, bundleType: bundle.bundleType, steps: bundle.steps ?? [] })),
}));

import { loader } from "../../../app/routes/api/api.page-builder-embed[.]json";
import { authenticate } from "../../../app/shopify.server";

const getDb = () => require("../../../app/db.server").default;
const mockAppProxy = authenticate.public.appProxy as jest.MockedFunction<any>;

function request(query = "bundleType=product_page&parentProductHandle=summer-bundle&locale=en", headers: Record<string, string> = {}) {
  return new Request(`https://test.myshopify.com/apps/product-bundles/api/page-builder-embed.json?${query}`, { headers });
}

describe("api.page-builder-embed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppProxy.mockResolvedValue({ session: { shop: "test.myshopify.com" } });
  });

  it("rejects invalid signatures and invalid input without querying", async () => {
    mockAppProxy.mockRejectedValueOnce(new Response(null, { status: 401 }));
    await expect(loader({ request: request(), params: {}, context: {} } as any)).rejects.toBeInstanceOf(Response);
    expect(getDb().bundle.findFirst).not.toHaveBeenCalled();

    const response = await loader({ request: request("bundleType=full_page&publicNumber=0&locale=en"), params: {}, context: {} } as any);
    expect(response.status).toBe(400);
    expect(getDb().bundle.findFirst).not.toHaveBeenCalled();
  });

  it("returns a formatted PPB with private ETag caching", async () => {
    getDb().bundle.findFirst.mockResolvedValue({ id: "ppb-1", bundleType: "product_page", steps: [] });
    const first = await loader({ request: request(), params: {}, context: {} } as any);
    expect(await first.json()).toEqual({
      embed: {
        bundleType: "product_page",
        bundle: { id: "ppb-1", bundleType: "product_page", steps: [] },
      },
    });
    expect(first.headers.get("Cache-Control")).toBe("private, max-age=30, must-revalidate");

    const second = await loader({
      request: request(undefined, { "If-None-Match": first.headers.get("ETag")! }),
      params: {},
      context: {},
    } as any);
    expect(second.status).toBe(304);
  });

  it("returns FPB loading settings and fails closed without caching errors", async () => {
    getDb().bundle.findFirst.mockResolvedValueOnce({ id: "fpb-1", bundleType: "full_page", steps: [] });
    getDb().designSettings.findUnique.mockResolvedValueOnce(null);
    const success = await loader({
      request: request("bundleType=full_page&publicNumber=3&locale=en"),
      params: {},
      context: {},
    } as any);
    expect(await success.json()).toEqual({
      embed: {
        bundleType: "full_page",
        bundle: { id: "fpb-1", bundleType: "full_page", steps: [] },
        loadingScreen: { gifUrl: null, backgroundColor: "#ffffff" },
      },
    });

    getDb().bundle.findFirst.mockRejectedValueOnce(new Error("database unavailable"));
    const failure = await loader({ request: request(), params: {}, context: {} } as any);
    expect(failure.status).toBe(500);
    expect(failure.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await failure.json()).toEqual({ embed: null });
  });
});
