import { BundleType } from "../../../app/constants/bundle";
import { buildSyncBundleConfiguration } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server";

function bundle(bundleType?: string) {
  return {
    id: "bundle-1",
    shopId: "test-shop.myshopify.com",
    name: "Test bundle",
    status: "ACTIVE",
    bundleType,
    steps: [],
  };
}

describe("PPB sync bundle type", () => {
  it("preserves the canonical Product Page type", () => {
    const config = buildSyncBundleConfiguration(
      bundle(BundleType.PRODUCT_PAGE),
      "gid://shopify/Product/1"
    );

    expect(config.id).toBe("bundle-1");
    expect(config).not.toHaveProperty("bundleId");
    expect(config).not.toHaveProperty("updatedAt");
    expect(config.bundleType).toBe(BundleType.PRODUCT_PAGE);
  });

  it.each([undefined, BundleType.FULL_PAGE])(
    "rejects non-PPB bundle type %s",
    (bundleType) => {
      expect(() =>
        buildSyncBundleConfiguration(
          bundle(bundleType),
          "gid://shopify/Product/1"
        )
      ).toThrow("PPB sync requires bundleType product_page");
    }
  );
});
