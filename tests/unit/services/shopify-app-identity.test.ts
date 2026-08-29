import {
  getCurrentShopifyAppIdentity,
  getInstalledShopifyAppIdentity,
  ShopifyAppIdentityError,
} from "../../../app/services/subscriptions/shopify-app-identity.server";

const mockUnauthenticatedAdmin = jest.fn();

jest.mock("../../../app/shopify.server", () => ({
  unauthenticated: { admin: mockUnauthenticatedAdmin },
}));

describe("getCurrentShopifyAppIdentity", () => {
  it("derives the current app GID and handle from Shopify Admin", async () => {
    const graphql = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        app: {
          id: "gid://shopify/App/299492081665",
          handle: "wolfpack-product-bundles-sit",
        },
      },
    }), { status: 200 }));

    await expect(getCurrentShopifyAppIdentity({ graphql })).resolves.toEqual({
      id: "gid://shopify/App/299492081665",
      handle: "wolfpack-product-bundles-sit",
    });
    expect(graphql).toHaveBeenCalledWith(expect.stringContaining("app {"));
  });

  it("fails closed when Shopify does not return a valid current app", async () => {
    const graphql = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: { app: { id: null, handle: null } },
    }), { status: 200 }));

    await expect(getCurrentShopifyAppIdentity({ graphql })).rejects.toBeInstanceOf(
      ShopifyAppIdentityError,
    );
  });

  it("uses the app's offline Admin context for background verification", async () => {
    const graphql = jest.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        app: {
          id: "gid://shopify/App/299492081665",
          handle: "wolfpack-product-bundles-sit",
        },
      },
    }), { status: 200 }));
    mockUnauthenticatedAdmin.mockResolvedValue({ admin: { graphql } });

    await expect(
      getInstalledShopifyAppIdentity("test-shop.myshopify.com"),
    ).resolves.toMatchObject({ handle: "wolfpack-product-bundles-sit" });
    expect(mockUnauthenticatedAdmin).toHaveBeenCalledWith("test-shop.myshopify.com");
  });
});
