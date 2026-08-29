import {
  THEME_EXTENSION_RESOURCES,
  buildThemeAppEmbedEditorUrl,
  normalizeThemeExtensionResources,
  type ShopifyThemeExtensionInfo,
} from "../../../app/lib/theme-extension-status";

describe("theme extension status normalization", () => {
  it("tracks the unified upsell placement resource", () => {
    expect(THEME_EXTENSION_RESOURCES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ handle: "bundle-upsell" }),
        expect.objectContaining({ handle: "bundle-product-page-embed" }),
        expect.objectContaining({ handle: "bundle-page-builder-embed" }),
      ]),
    );
    expect(
      THEME_EXTENSION_RESOURCES.some(({ handle }: any) =>
        ["bundle-upsell-button", "bundle-upsell-block"].includes(handle),
      ),
    ).toBe(false);
  });

  it("returns every configured resource with explicit status", () => {
    const response: ShopifyThemeExtensionInfo[] = [{
      handle: "bundle-builder",
      type: "theme_app_extension",
      activations: [
        { handle: "bundle-app-embed", name: "Only Bundles", target: "body", status: "active", activations: [] },
        { handle: "bundle-product-page", name: "Bundle Builder", target: "section", status: "available", activations: [] },
      ],
    }];

    const result = normalizeThemeExtensionResources(response);
    expect(result).toHaveLength(THEME_EXTENSION_RESOURCES.length);
    expect(result.find((item) => item.handle === "bundle-app-embed")?.status).toBe("active");
    expect(result.find((item) => item.handle === "bundle-app-embed")?.enabled).toBe(true);
    expect(result.find((item) => item.handle === "bundle-product-page")?.status).toBe("available");
    expect(result.find((item) => item.handle === "bundle-product-page")?.enabled).toBe(false);
    expect(result.map((item) => item.handle)).not.toContain("bundle-full-page");
  });

  it("does not treat unrelated extensions as Only Bundles resources", () => {
    const result = normalizeThemeExtensionResources([
      { handle: "other-extension", type: "theme_app_extension", activations: [] },
    ]);
    expect(result.every((item) => item.status === "unavailable")).toBe(true);
    expect(result.every((item) => item.enabled === false)).toBe(true);
  });

  it("builds Shopify's current-theme app-embed editor deep link", () => {
    expect(buildThemeAppEmbedEditorUrl(
      "test.myshopify.com",
      "test-api-key",
      "bundle-app-embed",
    )).toBe(
      "https://test.myshopify.com/admin/themes/current/editor?context=apps&activateAppId=test-api-key%2Fbundle-app-embed",
    );
  });
});
