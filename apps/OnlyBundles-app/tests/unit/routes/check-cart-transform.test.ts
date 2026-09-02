import { loader } from "../../../app/routes/api/api.check-cart-transform";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

const { authenticate: { admin: requireAdminSession } } = jest.requireMock("../../../app/shopify.server");

describe("api.check-cart-transform route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns activated: true when active CartTransform matches functionId", async () => {
    const mockGraphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          cartTransforms: {
            edges: [
              {
                node: {
                  id: "gid://shopify/CartTransform/100",
                  functionId: "gid://shopify/ShopifyFunction/999",
                },
              },
            ],
          },
          shopifyFunctions: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ShopifyFunction/999",
                  title: "Bundle Cart Transform (Rust)",
                  apiType: "cart_transform",
                  description: "Rust/WASM port",
                },
              },
            ],
          },
        },
      }),
    });

    requireAdminSession.mockResolvedValue({
      admin: { graphql: mockGraphql },
      session: { shop: "test.myshopify.com" },
    });

    const request = new Request("https://app.example.com/api/check-cart-transform");
    const response = await loader({ request, params: {}, context: {} });
    const data: any = await response.json();

    expect(data.activated).toBe(true);
    expect(data.cartTransformId).toBe("gid://shopify/CartTransform/100");
    expect(data.rustFunctionId).toBe("gid://shopify/ShopifyFunction/999");
    expect(data.totalTransforms).toBe(1);
    expect(data.staleTransforms).toEqual([]);
  });

  it("detects stale transforms when active transform has mismatched functionId", async () => {
    const mockGraphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          cartTransforms: {
            edges: [
              {
                node: {
                  id: "gid://shopify/CartTransform/old-1",
                  functionId: "gid://shopify/ShopifyFunction/old-fn",
                },
              },
            ],
          },
          shopifyFunctions: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ShopifyFunction/999",
                  title: "Bundle Cart Transform (Rust)",
                  apiType: "cart_transform",
                  description: "Rust/WASM port",
                },
              },
            ],
          },
        },
      }),
    });

    requireAdminSession.mockResolvedValue({
      admin: { graphql: mockGraphql },
      session: { shop: "test.myshopify.com" },
    });

    const request = new Request("https://app.example.com/api/check-cart-transform");
    const response = await loader({ request, params: {}, context: {} });
    const data: any = await response.json();

    expect(data.activated).toBe(false);
    expect(data.cartTransformId).toBeNull();
    expect(data.rustFunctionId).toBe("gid://shopify/ShopifyFunction/999");
    expect(data.staleTransforms).toEqual(["gid://shopify/CartTransform/old-1"]);
  });

  it("handles GraphQL failure gracefully", async () => {
    requireAdminSession.mockResolvedValue({
      admin: {
        graphql: jest.fn().mockRejectedValue(new Error("Network error")),
      },
      session: { shop: "test.myshopify.com" },
    });

    const request = new Request("https://app.example.com/api/check-cart-transform");
    const response = await loader({ request, params: {}, context: {} });
    const data: any = await response.json();

    expect(data.activated).toBe(false);
    expect(data.error).toBe("Failed to check cart transform status");
  });
});
