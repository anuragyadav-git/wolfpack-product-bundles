import {
  action,
  normalizeCartId,
  sanitizeDisplayProperties,
} from "../../../app/routes/api/api.cart-bundle-details";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { public: { appProxy: jest.fn() } },
}));

const mockAppProxy = jest.requireMock("../../../app/shopify.server").authenticate.public.appProxy;
const mockGraphql = jest.fn();

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { error: jest.fn() },
}));

describe("cart bundle details", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppProxy.mockResolvedValue({
      session: { shop: "test.myshopify.com" },
      storefront: { graphql: mockGraphql },
    });
  });

  it("retains Wolfpack cart input normalization", () => {
    expect(normalizeCartId(null, "cart-token")).toBe("gid://shopify/Cart/cart-token");
    expect(sanitizeDisplayProperties({ Bundle: "Starter", _private: "no" }))
      .toEqual({ Bundle: "Starter" });

  });

  it("rejects a missing installed-shop session", async () => {
    mockAppProxy.mockResolvedValue({});
    await expect(action({
      request: new Request("https://app.example/api/cart-bundle-details", { method: "POST" }),
      params: {},
      context: {},
    } as any)).rejects.toMatchObject({ status: 401 });
  });

  it("merges and writes bundle details through the native Storefront client", async () => {
    let value: string | null = null;
    mockGraphql.mockImplementation(async (_query, { variables }) => ({ json: async () => {
      if (variables.metafields) {
        value = variables.metafields[0].value;
        return { data: { cartMetafieldsSet: { metafields: [{ key: 'bundle_details', value }], userErrors: [] } } };
      }
      return { data: { cart: { id: 'cart', metafields: [{ value }], lines: { nodes: [], pageInfo: { hasNextPage: false } } } } };
    } }));

    const response = await action({
      request: new Request("https://app.example/api/cart-bundle-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartToken: "cart-token",
          pendingLineCount: 1, bundleDetailsKey: "bundle-1",
          displayProperties: { Bundle: "Starter" },
          runtimeToken: "signed-runtime-token",
        }),
      }),
      params: {},
      context: {},
    } as any);

    expect(response.status).toBe(200);
    expect(mockGraphql).toHaveBeenCalledTimes(3);
    const mutationVariables = mockGraphql.mock.calls[1][1].variables;
    expect(JSON.parse(mutationVariables.metafields[0].value)).toEqual([{
      key: "bundle-1",
        displayProperties: { Bundle: "Starter" },
        runtimeToken: "signed-runtime-token",
    }]);
    expect(mockGraphql.mock.calls[1][0]).toContain("[CartMetafieldsSetInput!]!");
  });

  it("rejects display metadata that has no runtime authorization", async () => {
    const response = await action({
      request: new Request("https://app.example/api/cart-bundle-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartToken: "cart-token",
          pendingLineCount: 1, bundleDetailsKey: "bundle-1",
          displayProperties: { Bundle: "Starter" },
        }),
      }),
      params: {},
      context: {},
    } as any);

    expect(response.status).toBe(400);
    expect(mockGraphql).not.toHaveBeenCalled();
  });
});
