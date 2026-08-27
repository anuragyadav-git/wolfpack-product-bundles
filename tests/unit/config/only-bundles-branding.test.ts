import fs from "node:fs";
import path from "node:path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("Only Bundles Shopify configuration", () => {
  it("rebrands production and SIT display names without changing app handles", () => {
    const production = read("shopify.app.toml");
    const sit = read("shopify.app.wolfpack-product-bundles-sit.toml");

    expect(production).toContain('name = "Only Bundles"');
    expect(production).toContain('handle = "wolfpack-product-bundles"');
    expect(sit).toContain('name = "Only Bundles SIT"');
    expect(sit).toContain('handle = "wolfpack-product-bundles-sit"');
  });

  it("uses Only Bundles in merchant-visible extension metadata", () => {
    const themeSchema = JSON.parse(
      read("extensions/bundle-builder/locales/en.default.schema.json"),
    );
    const productConfiguration = JSON.parse(
      read("extensions/bundle-product-configuration/locales/en.default.json"),
    );
    const pixelConfig = read("extensions/wolfpack-utm-pixel/shopify.extension.toml");

    expect(themeSchema.bundle_product_page.name).toBe(
      "Only Bundles - Product Page Bundle",
    );
    expect(themeSchema.bundle_full_page.name).toBe(
      "Only Bundles - Full Page Bundle",
    );
    expect(productConfiguration.name).toBe("Only Bundles");
    expect(productConfiguration.managed).toContain("Only Bundles");
    expect(pixelConfig).toContain('name = "Only Bundles Attribution"');
    expect(pixelConfig).not.toMatch(/Wolfpack app server|Wolfpack to capture/);
  });
});
