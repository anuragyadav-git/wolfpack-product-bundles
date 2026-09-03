import { handleGetThemeTemplates } from "../../../app/services/bundles/bundle-configure-handlers.server";

describe("handleGetThemeTemplates", () => {
  const session = {
    shop: "test-shop.myshopify.com",
    id: "offline_test-shop.myshopify.com",
    state: "active",
    isOnline: false,
    accessToken: "test-token",
  } as any;

  it("queries the published main theme and returns filtered product templates via GraphQL", async () => {
    const mockGraphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          themes: {
            nodes: [
              {
                id: "gid://shopify/OnlineStoreTheme/123456789",
                name: "Dawn",
                role: "MAIN",
                files: {
                  nodes: [
                    { filename: "templates/product.json" },
                    { filename: "templates/product.custom-bundle.json" },
                    { filename: "templates/product.liquid" },
                    { filename: "templates/collection.json" },
                    { filename: "templates/page.json" },
                  ],
                },
              },
            ],
          },
        },
      }),
    });

    const admin = { graphql: mockGraphql } as any;

    const response = await handleGetThemeTemplates(admin, session);
    const data = (await response.json()) as any;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.themeId).toBe("123456789");
    expect(data.themeName).toBe("Dawn");
    expect(data.templates).toEqual([
      {
        id: "product",
        title: "product",
        handle: "product",
        description: "templates/product.json",
        recommended: true,
        bundleRelevant: true,
        fileType: "JSON",
        fullKey: "templates/product.json",
      },
      {
        id: "product",
        title: "product",
        handle: "product",
        description: "templates/product.liquid",
        recommended: true,
        bundleRelevant: true,
        fileType: "Liquid",
        fullKey: "templates/product.liquid",
      },
      {
        id: "product.custom-bundle",
        title: "product.custom-bundle",
        handle: "product.custom-bundle",
        description: "templates/product.custom-bundle.json",
        recommended: false,
        bundleRelevant: true,
        fileType: "JSON",
        fullKey: "templates/product.custom-bundle.json",
      },
    ]);

    expect(mockGraphql).toHaveBeenCalled();
  });

  it("filters theme files to product templates at the GraphQL boundary", async () => {
    const mockGraphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          themes: {
            nodes: [
              {
                id: "gid://shopify/OnlineStoreTheme/123456789",
                name: "Horizon",
                role: "MAIN",
                files: {
                  nodes: [{ filename: "templates/product.json" }],
                },
              },
            ],
          },
        },
      }),
    });

    const admin = { graphql: mockGraphql } as any;

    await handleGetThemeTemplates(admin, session);

    const query = mockGraphql.mock.calls[0][0] as string;
    expect(query).toContain(
      'files(first: 250, filenames: ["templates/product*.json", "templates/product*.liquid"])',
    );
  });

  it("handles case where no published theme is found", async () => {
    const mockGraphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          themes: {
            nodes: [],
          },
        },
      }),
    });

    const admin = { graphql: mockGraphql } as any;

    const response = await handleGetThemeTemplates(admin, session);
    const data = (await response.json()) as any;

    expect(data.success).toBe(false);
    expect(data.error).toBe("No published theme found");
  });

  it("handles GraphQL query failures gracefully", async () => {
    const mockGraphql = jest.fn().mockRejectedValue(new Error("GraphQL network failure"));
    const admin = { graphql: mockGraphql } as any;

    const response = await handleGetThemeTemplates(admin, session);
    const data = (await response.json()) as any;

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("GraphQL network failure");
  });
});
