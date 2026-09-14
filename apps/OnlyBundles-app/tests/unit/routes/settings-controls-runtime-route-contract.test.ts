/* eslint-disable import/first */
jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { error: jest.fn() },
}));

jest.mock("../../../app/db.server", () => ({
  prisma: {
    designSettings: { findUnique: jest.fn() },
    bundle: { findMany: jest.fn() },
  },
}));

var mockAuthenticateAppProxy = jest.fn();
jest.mock("../../../app/shopify.server", () => ({
  authenticate: { public: { appProxy: mockAuthenticateAppProxy } },
}));

import { prisma } from "../../../app/db.server";
import { loader } from "../../../app/routes/api/api.controls-settings";
import { buildSettingsControlsRuntime } from "../../../app/lib/settings-controls-runtime";

const findUnique = prisma.designSettings.findUnique as jest.MockedFunction<typeof prisma.designSettings.findUnique>;
const findManyBundles = prisma.bundle.findMany as jest.MockedFunction<typeof prisma.bundle.findMany>;

function request(bundleType = "product_page") {
  return new Request(`https://example.test/api/controls-settings?bundleType=${bundleType}`);
}

describe("Settings Controls storefront endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateAppProxy.mockResolvedValue({ session: { shop: "verified.myshopify.com" } });
    findManyBundles.mockResolvedValue([]);
  });

  it("returns the versioned canonical contract and requested active layout", async () => {
    const runtime = buildSettingsControlsRuntime({
      "productPage.hideOutOfStockProducts": "Checked",
    }).settingsControls;
    findUnique.mockResolvedValue({ generalSettings: { settingsControls: runtime } } as never);

    const response = await loader({
      request: request(),
      params: {},
      context: {},
    } as never);
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(body.schemaVersion).toBe(1);
    expect(body.activeControls).toEqual(runtime.productPage);
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { shopId_bundleType: expect.objectContaining({ shopId: "verified.myshopify.com" }) },
    }));
  });

  it("returns active bundle-parent links for collection quick-add routing", async () => {
    findUnique.mockResolvedValue({ generalSettings: {} } as never);
    findManyBundles.mockResolvedValue([
      { bundleType: "full_page", publicNumber: 9, shopifyProductHandle: "fpb-parent" },
      { bundleType: "product_page", publicNumber: null, shopifyProductHandle: "ppb-parent" },
    ] as never);

    const response = await loader({
      request: request("full_page"),
      params: {},
      context: {},
    } as never);
    const body = await response.json() as any;

    expect(body.bundleLinks).toEqual([
      { bundleType: "full_page", productHandle: "fpb-parent", targetUrl: "/apps/product-bundles/wpb/9" },
      { bundleType: "product_page", productHandle: "ppb-parent", targetUrl: "/products/ppb-parent" },
    ]);
  });

  it("uses the configured storefront proxy root for FPB quick-add links", async () => {
    const previousRoot = process.env.STOREFRONT_PROXY_ROOT;
    process.env.STOREFRONT_PROXY_ROOT = "/apps/product-bundles-sit";
    findUnique.mockResolvedValue({ generalSettings: {} } as never);
    findManyBundles.mockResolvedValue([
      { bundleType: "full_page", publicNumber: 9, shopifyProductHandle: "fpb-parent" },
    ] as never);

    try {
      const response = await loader({
        request: request("full_page"),
        params: {},
        context: {},
      } as never);
      const body = await response.json() as any;

      expect(body.bundleLinks).toEqual([
        { bundleType: "full_page", productHandle: "fpb-parent", targetUrl: "/apps/product-bundles-sit/wpb/9" },
      ]);
    } finally {
      if (previousRoot === undefined) delete process.env.STOREFRONT_PROXY_ROOT;
      else process.env.STOREFRONT_PROXY_ROOT = previousRoot;
    }
  });

  it("returns a non-success status when persistence cannot be read", async () => {
    findUnique.mockRejectedValue(new Error("database unavailable"));

    const response = await loader({
      request: request("full_page"),
      params: {},
      context: {},
    } as never);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Controls settings are temporarily unavailable" });
  });

  it("rejects a verified proxy request without an offline session", async () => {
    mockAuthenticateAppProxy.mockResolvedValue({ session: undefined });

    const response = await loader({ request: request(), params: {}, context: {} } as never);

    expect(response.status).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("propagates Shopify's authentication failure before tenant reads", async () => {
    const authenticationFailure = new Response("Unauthorized", { status: 401 });
    mockAuthenticateAppProxy.mockRejectedValue(authenticationFailure);

    await expect(loader({ request: request(), params: {}, context: {} } as never))
      .rejects.toBe(authenticationFailure);
    expect(findUnique).not.toHaveBeenCalled();
    expect(findManyBundles).not.toHaveBeenCalled();
  });
});
