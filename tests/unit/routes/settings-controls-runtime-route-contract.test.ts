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

import { prisma } from "../../../app/db.server";
import { loader } from "../../../app/routes/api/api.controls-settings.$shopDomain";
import { buildSettingsControlsRuntime } from "../../../app/lib/settings-controls-runtime";

const findUnique = prisma.designSettings.findUnique as jest.MockedFunction<typeof prisma.designSettings.findUnique>;
const findManyBundles = prisma.bundle.findMany as jest.MockedFunction<typeof prisma.bundle.findMany>;

function request(bundleType = "product_page") {
  return new Request(`https://example.test/api/controls-settings/test.myshopify.com?bundleType=${bundleType}`);
}

describe("Settings Controls storefront endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findManyBundles.mockResolvedValue([]);
  });

  it("returns the versioned canonical contract and requested active layout", async () => {
    const runtime = buildSettingsControlsRuntime({
      "productPage.hideOutOfStockProducts": "Checked",
    }).settingsControls;
    findUnique.mockResolvedValue({ generalSettings: { settingsControls: runtime } } as never);

    const response = await loader({
      request: request(),
      params: { shopDomain: "test.myshopify.com" },
      context: {},
    } as never);
    const body = await response.json() as any;

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");
    expect(body.schemaVersion).toBe(1);
    expect(body.activeControls).toEqual(runtime.productPage);
  });

  it("returns active bundle-parent links for collection quick-add routing", async () => {
    findUnique.mockResolvedValue({ generalSettings: {} } as never);
    findManyBundles.mockResolvedValue([
      { bundleType: "full_page", publicNumber: 9, shopifyProductHandle: "fpb-parent" },
      { bundleType: "product_page", publicNumber: null, shopifyProductHandle: "ppb-parent" },
    ] as never);

    const response = await loader({
      request: request("full_page"),
      params: { shopDomain: "test.myshopify.com" },
      context: {},
    } as never);
    const body = await response.json() as any;

    expect(body.bundleLinks).toEqual([
      { bundleType: "full_page", productHandle: "fpb-parent", targetUrl: "/apps/product-bundles/wpb/9" },
      { bundleType: "product_page", productHandle: "ppb-parent", targetUrl: "/products/ppb-parent" },
    ]);
  });

  it("returns a non-success status when persistence cannot be read", async () => {
    findUnique.mockRejectedValue(new Error("database unavailable"));

    const response = await loader({
      request: request("full_page"),
      params: { shopDomain: "test.myshopify.com" },
      context: {},
    } as never);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Controls settings are temporarily unavailable" });
  });
});
