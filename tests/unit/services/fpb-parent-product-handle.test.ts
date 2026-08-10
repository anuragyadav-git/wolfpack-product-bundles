import db from "../../../app/db.server";
import { ensureBundleParentProduct } from "../../../app/services/bundles/bundle-parent-product.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { bundle: { update: jest.fn() } },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

function response(data: Record<string, unknown>) {
  return { json: async () => data };
}

function makeAdmin(returnedHandle: string) {
  return {
    graphql: jest.fn(async (query: string) => {
      if (query.includes("GetBundleParentShop")) {
        return response({ data: { shop: { name: "Merchant Shop" } } });
      }
      if (query.includes("CreateBundleParentProduct")) {
        return response({
          data: {
            productCreate: {
              product: {
                id: "gid://shopify/Product/10",
                handle: returnedHandle,
                status: "UNLISTED",
                variants: { nodes: [{ id: "gid://shopify/ProductVariant/20" }] },
              },
              userErrors: [],
            },
          },
        });
      }
      if (query.includes("ConfigureBundleParentVariant")) {
        return response({ data: { productVariantsBulkUpdate: { userErrors: [] } } });
      }
      if (query.includes("GetOnlineStorePublication")) {
        return response({ data: { publications: { nodes: [{
          id: "gid://shopify/Publication/1",
          name: "Online Store",
          catalog: { title: "Channel Catalog 1 for Online Store" },
        }] } } });
      }
      if (query.includes("PublishBundleParentProduct")) {
        return response({ data: { publishablePublish: { userErrors: [] } } });
      }
      throw new Error(`Unexpected GraphQL operation: ${query}`);
    }),
  } as any;
}

function makeExistingAdmin(bundleType: "full_page" | "product_page") {
  const redirects = new Map<string, { id: string; path: string; target: string }>();
  return {
    graphql: jest.fn(async (query: string, options?: any) => {
      if (query.includes("GetBundleParentProduct")) {
        return response({ data: { product: {
          id: "gid://shopify/Product/10",
          handle: "merchant-facing-handle",
          status: "UNLISTED",
          variants: { nodes: [{ id: "gid://shopify/ProductVariant/20" }] },
        } } });
      }
      if (query.includes("FindUrlRedirect")) {
        const path = String(options?.variables?.query).match(/path:"([^"]+)/)?.[1] ?? "";
        return response({ data: { urlRedirects: { nodes: redirects.has(path) ? [redirects.get(path)] : [] } } });
      }
      if (query.includes("CreateUrlRedirect")) {
        const urlRedirect = options?.variables?.urlRedirect;
        const created = { id: "gid://shopify/UrlRedirect/1", ...urlRedirect };
        redirects.set(urlRedirect.path, created);
        return response({ data: { urlRedirectCreate: { urlRedirect: created, userErrors: [] } } });
      }
      if (query.includes("UpdateFpbParentProductHandle")) {
        return response({ data: { productUpdate: { product: {
          id: "gid://shopify/Product/10",
          handle: "wpb-parent-bundle-1",
        }, userErrors: [] } } });
      }
      if (query.includes("ConfigureBundleParentVariant")) {
        return response({ data: { productVariantsBulkUpdate: { userErrors: [] } } });
      }
      if (query.includes("GetOnlineStorePublication")) {
        return response({ data: { publications: { nodes: [{
          id: "gid://shopify/Publication/1",
          name: "Online Store",
          catalog: { title: "Channel Catalog 1 for Online Store" },
        }] } } });
      }
      if (query.includes("PublishBundleParentProduct")) {
        return response({ data: { publishablePublish: { userErrors: [] } } });
      }
      throw new Error(`Unexpected ${bundleType} GraphQL operation: ${query}`);
    }),
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  (db.bundle.update as jest.Mock).mockResolvedValue({});
});

describe("FPB parent product handle ownership", () => {
  it("creates a new FPB parent with a deterministic internal handle", async () => {
    const admin = makeAdmin("wpb-parent-bundle-1");

    await ensureBundleParentProduct({
      admin,
      shopDomain: "test-shop.myshopify.com",
      appUrl: "https://app.example.test",
      bundle: {
        id: "bundle-1",
        name: "Build Your Box",
        bundleType: "full_page",
        shopifyProductId: null,
        shopifyProductHandle: null,
      },
    });

    const createCall = admin.graphql.mock.calls.find(([query]: [string]) =>
      query.includes("CreateBundleParentProduct"),
    );
    expect(createCall?.[1]).toEqual(expect.objectContaining({
      variables: expect.objectContaining({
        product: expect.objectContaining({ handle: "wpb-parent-bundle-1" }),
      }),
    }));
  });

  it("preserves the generated merchant-facing handle for PPB creation", async () => {
    const admin = makeAdmin("build-your-box");

    await ensureBundleParentProduct({
      admin,
      shopDomain: "test-shop.myshopify.com",
      appUrl: "https://app.example.test",
      bundle: {
        id: "bundle-1",
        name: "Build Your Box",
        bundleType: "product_page",
        shopifyProductId: null,
        shopifyProductHandle: null,
      },
    });

    const createCall = admin.graphql.mock.calls.find(([query]: [string]) =>
      query.includes("CreateBundleParentProduct"),
    );
    expect(createCall?.[1]).toEqual(expect.objectContaining({
      variables: expect.objectContaining({
        product: expect.objectContaining({ handle: "build-your-box" }),
      }),
    }));
  });

  it("moves an existing FPB parent without changing its cart or merchandising contract", async () => {
    const admin = makeExistingAdmin("full_page");

    const result = await ensureBundleParentProduct({
      admin,
      shopDomain: "test-shop.myshopify.com",
      appUrl: "https://app.example.test",
      bundle: {
        id: "bundle-1",
        name: "Build Your Box",
        bundleType: "full_page",
        shopifyProductId: "gid://shopify/Product/10",
        shopifyProductHandle: "merchant-facing-handle",
      },
    });

    expect(result.handle).toBe("wpb-parent-bundle-1");
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("UpdateFpbParentProductHandle"),
      { variables: { product: {
        id: "gid://shopify/Product/10",
        handle: "wpb-parent-bundle-1",
        redirectNewHandle: false,
      } } },
    );
    expect(db.bundle.update).toHaveBeenCalledWith({
      where: { id: "bundle-1", shopId: "test-shop.myshopify.com" },
      data: { shopifyProductHandle: "wpb-parent-bundle-1" },
    });
  });

  it("updates Shopify's percent-encoded redirect for a Unicode parent handle", async () => {
    const legacyHandle = "customize-your-own-box-👉";
    const encodedPath = "/products/customize-your-own-box-%f0%9f%91%89";
    const admin = makeExistingAdmin("full_page");
    const original = admin.graphql.getMockImplementation()!;
    admin.graphql.mockImplementation(async (query: string, options?: any) => {
      if (query.includes("GetBundleParentProduct")) {
        return response({ data: { product: {
          id: "gid://shopify/Product/10",
          handle: legacyHandle,
          status: "UNLISTED",
          variants: { nodes: [{ id: "gid://shopify/ProductVariant/20" }] },
        } } });
      }
      if (query.includes("FindUrlRedirect")) {
        return response({ data: { urlRedirects: { nodes: [{
          id: "gid://shopify/UrlRedirect/1",
          path: encodedPath,
          target: "/pages/legacy-bundle",
        }] } } });
      }
      if (query.includes("UpdateUrlRedirect")) {
        return response({ data: { urlRedirectUpdate: {
          urlRedirect: { id: "gid://shopify/UrlRedirect/1" },
          userErrors: [],
        } } });
      }
      return original(query, options);
    });

    await ensureBundleParentProduct({
      admin,
      shopDomain: "test-shop.myshopify.com",
      appUrl: "https://app.example.test",
      bundle: {
        id: "bundle-1",
        name: "Build Your Box",
        bundleType: "full_page",
        shopifyProductId: "gid://shopify/Product/10",
        shopifyProductHandle: legacyHandle,
      },
    });

    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("UpdateUrlRedirect"),
      expect.objectContaining({ variables: expect.objectContaining({
        id: "gid://shopify/UrlRedirect/1",
        urlRedirect: expect.objectContaining({
          target: "/apps/product-bundles/wpb/bundle-1",
        }),
      }) }),
    );
    expect(admin.graphql).not.toHaveBeenCalledWith(
      expect.stringContaining("CreateUrlRedirect"),
      expect.anything(),
    );
  });

  it("does not move an existing PPB parent", async () => {
    const admin = makeExistingAdmin("product_page");

    const result = await ensureBundleParentProduct({
      admin,
      shopDomain: "test-shop.myshopify.com",
      appUrl: "https://app.example.test",
      bundle: {
        id: "bundle-1",
        name: "Build Your Box",
        bundleType: "product_page",
        shopifyProductId: "gid://shopify/Product/10",
        shopifyProductHandle: "merchant-facing-handle",
      },
    });

    expect(result.handle).toBe("merchant-facing-handle");
    expect(admin.graphql).not.toHaveBeenCalledWith(
      expect.stringContaining("UpdateFpbParentProductHandle"),
      expect.anything(),
    );
  });
});
