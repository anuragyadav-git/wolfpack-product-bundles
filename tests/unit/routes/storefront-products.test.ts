import { loader } from "../../../app/routes/api/api.storefront-products";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { public: { appProxy: jest.fn() } },
}));

const mockAppProxy = jest.requireMock("../../../app/shopify.server").authenticate.public.appProxy;
const mockGraphql = jest.fn();

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

describe("signed storefront products loader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppProxy.mockResolvedValue({
      session: {
        shop: "test.myshopify.com",
        scope: "unauthenticated_read_product_inventory",
      },
      storefront: { graphql: mockGraphql },
    });
  });

  it("rejects a missing installed-shop session", async () => {
    mockAppProxy.mockResolvedValue({ session: undefined, storefront: undefined });

    await expect(loader({
      request: new Request("https://app.example/api/storefront-products?ids=1"),
      params: {},
      context: {},
    } as any)).rejects.toMatchObject({ status: 401 });
  });

  it("rejects malformed product IDs before Storefront GraphQL", async () => {
    const response = await loader({
      request: new Request("https://app.example/api/storefront-products?ids=1,invalid"),
      params: {},
      context: {},
    } as any);

    expect(response.status).toBe(400);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it("normalizes IDs and maps inventory through the native Storefront client", async () => {
    mockGraphql.mockResolvedValueOnce({
        json: async () => ({
          data: { nodes: [{
            id: "gid://shopify/Product/1",
            title: "Product",
            handle: "product",
            description: "Description",
            descriptionHtml: "<p>Description</p>",
            featuredImage: null,
            images: { edges: [] },
            options: [{
              id: "gid://shopify/ProductOption/1",
              name: "Color",
              optionValues: [{
                id: "gid://shopify/ProductOptionValue/1",
                name: "Gold",
                swatch: { color: "#D4AF37", image: null },
              }],
            }],
            variants: {
              pageInfo: { hasNextPage: false, endCursor: null },
              edges: [{ node: {
              id: "gid://shopify/ProductVariant/2",
              title: "Default Title",
              availableForSale: true,
              quantityAvailable: 0,
              currentlyNotInStock: false,
              price: { amount: "10.00" },
              compareAtPrice: null,
              weight: 0,
              weightUnit: "GRAMS",
              image: null,
              selectedOptions: [{ name: "Color", value: "Gold" }],
              } }],
            },
          }] },
        }),
      });

    const response = await loader({
      request: new Request("https://app.example/api/storefront-products?ids=1"),
      params: {},
      context: {},
    } as any);
    const payload = await response.json() as any;

    expect(mockGraphql.mock.calls[0][1].variables.ids)
      .toEqual(["gid://shopify/Product/1"]);
    expect(mockGraphql.mock.calls[0][0]).toContain("quantityAvailable");
    expect(mockGraphql.mock.calls[0][0]).toContain("variants(first: 250)");
    expect(mockGraphql).toHaveBeenCalledTimes(1);
    expect(payload.products[0].variants[0]).toMatchObject({
      available: true,
      quantityAvailable: null,
      currentlyNotInStock: false,
    });
    expect(mockGraphql.mock.calls[0][0]).toContain("optionValues");
    expect(mockGraphql.mock.calls[0][0]).toContain("swatch");
    expect(payload.products[0].options[0].optionValues[0]).toEqual({
      id: "gid://shopify/ProductOptionValue/1",
      name: "Gold",
      swatch: { color: "#D4AF37", image: null },
    });
    expect(payload.products[0].variants[0].selectedOptions).toEqual([
      { name: "Color", value: "Gold" },
    ]);
  });

  it("requests only variant overflow pages after the initial product batch", async () => {
    mockGraphql
      .mockResolvedValueOnce({
        json: async () => ({
          data: { nodes: [{
            id: "gid://shopify/Product/1",
            title: "Product",
            handle: "product",
            description: "",
            descriptionHtml: "",
            featuredImage: null,
            images: { edges: [] },
            variants: {
              pageInfo: { hasNextPage: true, endCursor: "variant-250" },
              edges: [{ node: {
                id: "gid://shopify/ProductVariant/1",
                title: "First",
                availableForSale: true,
                quantityAvailable: 3,
                currentlyNotInStock: false,
                price: { amount: "10.00" },
                compareAtPrice: null,
                weight: 0,
                weightUnit: "GRAMS",
                image: null,
              } }],
            },
          }] },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: { product: { variants: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [{ node: {
              id: "gid://shopify/ProductVariant/251",
              title: "Overflow",
              availableForSale: true,
              quantityAvailable: 2,
              currentlyNotInStock: false,
              price: { amount: "12.00" },
              compareAtPrice: null,
              weight: 0,
              weightUnit: "GRAMS",
              image: null,
            } }],
          } } },
        }),
      });

    const response = await loader({
      request: new Request("https://app.example/api/storefront-products?ids=1"),
      params: {},
      context: {},
    } as any);
    const payload = await response.json() as any;

    expect(mockGraphql).toHaveBeenCalledTimes(2);
    expect(mockGraphql.mock.calls[1][1].variables).toMatchObject({
      id: "gid://shopify/Product/1",
      cursor: "variant-250",
    });
    expect(payload.products[0].variants.map((variant: any) => variant.id)).toEqual([
      "gid://shopify/ProductVariant/1",
      "gid://shopify/ProductVariant/251",
    ]);
  });
});
