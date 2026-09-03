import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import db from "../../../app/db.server";
import { authenticate } from "../../../app/shopify.server";
import { fetchBundleConfigureShopifyData } from "../../../app/lib/bundle-configure-loader.server";
import { loader } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route";
import { useConfigureContentState } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureContentState";
import type { ConfigureBundleFlowDraft } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/configure-flow-types";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../../../app/lib/bundle-configure-loader.server", () => ({
  fetchBundleConfigureShopifyData: jest.fn(),
}));

jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow", () => ({
  __esModule: true,
  default: () => null,
}));

const mockAuthenticate = authenticate.admin as jest.MockedFunction<
  typeof authenticate.admin
>;
const mockFindUnique = db.bundle.findUnique as jest.Mock;
const mockFindMany = db.bundle.findMany as jest.Mock;
const mockFetchShopifyData = fetchBundleConfigureShopifyData as jest.Mock;

describe("FPB configure proxy root", () => {
  const originalProxyRoot = process.env.STOREFRONT_PROXY_ROOT;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STOREFRONT_PROXY_ROOT = "/apps/product-bundles-sit";
    mockAuthenticate.mockResolvedValue({
      admin: { graphql: jest.fn() },
      session: { shop: "agent-store.myshopify.com" },
    } as any);
    mockFindUnique.mockResolvedValue({
      id: "bundle-1",
      publicNumber: 7,
      shopId: "agent-store.myshopify.com",
      bundleType: "full_page",
      status: "draft",
      steps: [],
      pricing: null,
      offerPolicy: null,
    });
    mockFindMany.mockResolvedValue([]);
    mockFetchShopifyData.mockResolvedValue({
      bundleProduct: null,
      shopCurrencyCode: "USD",
      shopLocales: [],
    });
  });

  afterAll(() => {
    if (originalProxyRoot === undefined) {
      delete process.env.STOREFRONT_PROXY_ROOT;
    } else {
      process.env.STOREFRONT_PROXY_ROOT = originalProxyRoot;
    }
  });

  it("returns the environment-specific root from the authenticated loader", async () => {
    const response = await loader({
      request: new Request(
        "https://app.example.com/app/bundles/full-page-bundle/configure/bundle-1",
      ),
      params: { bundleId: "bundle-1" },
      context: {},
    });

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        storefrontProxyRoot: "/apps/product-bundles-sit",
      }),
    );
  });

  it("builds the Admin bundle URL from the loader-provided root", () => {
    delete process.env.STOREFRONT_PROXY_ROOT;
    const flow: ConfigureBundleFlowDraft = {
      bundle: { publicNumber: 7 },
      shop: "agent-store.myshopify.com",
      storefrontProxyRoot: "/apps/product-bundles-sit",
      operationAlert: null,
      setOperationAlert: jest.fn(),
      clearOperationAlert: jest.fn(),
    };

    function Harness() {
      useConfigureContentState(flow);
      return null;
    }

    renderToStaticMarkup(React.createElement(Harness));

    expect(flow.bundlePageUrl).toBe(
      "https://agent-store.myshopify.com/apps/product-bundles-sit/wpb/7",
    );
  });
});
