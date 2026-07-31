import {
  THEME_EXTENSION_RESOURCES,
  normalizeThemeExtensionResources,
  type ShopifyThemeExtensionInfo,
} from "../../../app/lib/theme-extension-status";

describe("theme extension status normalization", () => {
  it("returns every configured resource with explicit status", () => {
    const response: ShopifyThemeExtensionInfo[] = [{
      handle: "bundle-builder",
      type: "theme_app_extension",
      activations: [
        { handle: "bundle-app-embed", name: "Wolfpack Bundle", target: "body", status: "active", activations: [] },
        { handle: "bundle-product-page", name: "Bundle Builder", target: "section", status: "available", activations: [] },
      ],
    }];

    const result = normalizeThemeExtensionResources(response);
    expect(result).toHaveLength(THEME_EXTENSION_RESOURCES.length);
    expect(result.find((item) => item.handle === "bundle-app-embed")?.status).toBe("active");
    expect(result.find((item) => item.handle === "bundle-app-embed")?.enabled).toBe(true);
    expect(result.find((item) => item.handle === "bundle-product-page")?.status).toBe("available");
    expect(result.find((item) => item.handle === "bundle-product-page")?.enabled).toBe(false);
    expect(result.find((item) => item.handle === "bundle-full-page")?.status).toBe("unavailable");
    expect(result.find((item) => item.handle === "bundle-full-page")?.enabled).toBe(false);
  });

  it("does not treat unrelated extensions as Wolfpack resources", () => {
    const result = normalizeThemeExtensionResources([
      { handle: "other-extension", type: "theme_app_extension", activations: [] },
    ]);
    expect(result.every((item) => item.status === "unavailable")).toBe(true);
    expect(result.every((item) => item.enabled === false)).toBe(true);
  });
});
