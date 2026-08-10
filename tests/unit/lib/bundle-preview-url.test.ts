import {
  appendBundlePreviewToken,
  buildBundleConfigApiUrl,
} from "../../../app/lib/bundle-preview-url";

describe("bundle preview URL", () => {
  it("preserves Shopify preview parameters while adding bundle authorization", () => {
    expect(appendBundlePreviewToken(
      "https://shop.test/products/bundle?preview_theme_id=123",
      "signed-token",
    )).toBe(
      "https://shop.test/products/bundle?preview_theme_id=123&wpb_preview=signed-token",
    );
  });

  it("forwards preview authorization to the signed bundle config request", () => {
    expect(buildBundleConfigApiUrl(
      "bundle/1",
      "?preview_theme_id=123&wpb_preview=signed.token",
    )).toBe(
      "/apps/product-bundles/api/bundle/bundle%2F1.json?wpb_preview=signed.token",
    );
  });

  it("keeps public bundle config requests token-free", () => {
    expect(buildBundleConfigApiUrl("bundle-1", "?preview_theme_id=123")).toBe(
      "/apps/product-bundles/api/bundle/bundle-1.json",
    );
  });
});
