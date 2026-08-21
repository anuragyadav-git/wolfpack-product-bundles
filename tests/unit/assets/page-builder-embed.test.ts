import {
  findPageBuilderEmbedMarker,
  getPageBuilderEmbedMode,
  initializePageBuilderEmbed,
  suppressesAutomaticPpbEmbed,
} from "../../../app/storefront/page-builder-embed";

describe("page builder storefront marker behavior", () => {
  it("uses the first valid page-builder marker", () => {
    const invalid = { dataset: { embedMode: "unknown" } };
    const valid = { dataset: { embedMode: "full-page-bundle", publicNumber: "7" } };
    const root = { querySelectorAll: () => [invalid, valid] };
    expect(findPageBuilderEmbedMarker(root as unknown as ParentNode)).toBe(valid);
  });

  it("keeps eligible-product mode on the existing PPB resolution path", () => {
    const marker = { dataset: { embedMode: "eligible-product" } };
    expect(getPageBuilderEmbedMode(marker as unknown as HTMLElement)).toBe("eligible-product");
    expect(suppressesAutomaticPpbEmbed(marker as unknown as HTMLElement)).toBe(false);
  });

  it.each([
    { embedMode: "product-page-bundle", parentProductHandle: "summer-bundle" },
    { embedMode: "full-page-bundle", publicNumber: "7" },
  ])(
    "suppresses the automatic PPB builder for direct mode %s",
    (dataset) => {
      const marker = { dataset };
      expect(suppressesAutomaticPpbEmbed(marker as unknown as HTMLElement)).toBe(true);
    },
  );

  it("reuses a direct resolution across repeated initialization", async () => {
    const marker = {
      dataset: {
        embedMode: "product-page-bundle",
        parentProductHandle: "repeatable-bundle",
      },
      contains: () => false,
      querySelector: () => null,
    };
    const root = {
      querySelectorAll: () => [marker],
      querySelector: () => null,
    };
    const appEmbed = {
      dataset: {
        pageBuilderEmbedEndpoint: "/apps/product-bundles/api/page-builder-embed.json",
        locale: "en",
      },
    };
    const previousWindow = global.window;
    const previousFetch = global.fetch;
    const fetchMock = jest.fn().mockResolvedValue(new Response(JSON.stringify({ embed: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    global.window = { location: { origin: "https://shop.myshopify.com" } } as unknown as Window & typeof globalThis;
    global.fetch = fetchMock;
    try {
      await initializePageBuilderEmbed(appEmbed as unknown as HTMLElement, root as unknown as ParentNode);
      await initializePageBuilderEmbed(appEmbed as unknown as HTMLElement, root as unknown as ParentNode);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      global.window = previousWindow;
      global.fetch = previousFetch;
    }
  });
});
