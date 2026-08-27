import { loader } from "../../../app/routes/api/api.storefront-collections";

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { public: { appProxy: jest.fn() } },
}));

const mockAppProxy = jest.requireMock("../../../app/shopify.server").authenticate.public.appProxy;
const mockGraphql = jest.fn();

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: { debug: jest.fn(), error: jest.fn() },
}));

describe("signed storefront collections loader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppProxy.mockResolvedValue({
      session: { shop: "test.myshopify.com", scope: "" },
      storefront: { graphql: mockGraphql },
    });
  });

  it("rejects a missing installed-shop session", async () => {
    mockAppProxy.mockResolvedValue({});
    await expect(loader({
      request: new Request("https://app.example/api/storefront-collections?handles=rings"),
      params: {},
      context: {},
    } as any)).rejects.toMatchObject({ status: 401 });
  });

  it("deduplicates products while preserving collection membership", async () => {
    const product = {
      id: "gid://shopify/Product/1",
      title: "Ring",
      handle: "ring",
      description: "",
      descriptionHtml: "",
      featuredImage: null,
      images: { edges: [] },
      options: [],
      variants: { edges: [] },
    };
    mockGraphql.mockResolvedValue({ json: async () => ({
      data: { collections: { edges: [
        { node: { handle: "rings", products: { edges: [{ node: product }] } } },
        { node: { handle: "featured", products: { edges: [{ node: product }] } } },
      ] } },
    }) });

    const response = await loader({
      request: new Request("https://app.example/api/storefront-collections?handles=rings,featured"),
      params: {},
      context: {},
    } as any);
    const payload = await response.json() as any;

    expect(payload.products).toHaveLength(1);
    expect(payload.byCollection).toEqual({
      rings: ["gid://shopify/Product/1"],
      featured: ["gid://shopify/Product/1"],
    });
    expect(mockGraphql.mock.calls[0][0]).not.toContain("quantityAvailable");
  });
});
