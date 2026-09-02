import {
  appendFpbPreviewToken,
  buildFpbStorefrontUrl,
  parseFpbPublicNumber,
} from "../../../app/lib/fpb-storefront-url";

describe("FPB storefront URL", () => {
  it("builds the canonical default app-proxy URL", () => {
    expect(buildFpbStorefrontUrl("https://test-shop.myshopify.com/", 1))
      .toBe("https://test-shop.myshopify.com/apps/product-bundles/wpb/1");
  });

  it("adds a draft preview token", () => {
    expect(appendFpbPreviewToken(
      buildFpbStorefrontUrl("test-shop.myshopify.com", 27),
      "preview-token",
    )).toBe("https://test-shop.myshopify.com/apps/product-bundles/wpb/27?wpb_preview=preview-token");
  });

  it("builds an isolated SIT app-proxy URL", () => {
    expect(buildFpbStorefrontUrl(
      "test-shop.myshopify.com",
      3,
      "/apps/product-bundles-sit",
    )).toBe(
      "https://test-shop.myshopify.com/apps/product-bundles-sit/wpb/3",
    );
  });

  it("uses the configured server proxy root by default", () => {
    const previousRoot = process.env.STOREFRONT_PROXY_ROOT;
    process.env.STOREFRONT_PROXY_ROOT = "/apps/product-bundles-sit";

    try {
      expect(buildFpbStorefrontUrl("test-shop.myshopify.com", 5)).toBe(
        "https://test-shop.myshopify.com/apps/product-bundles-sit/wpb/5",
      );
    } finally {
      if (previousRoot === undefined) {
        delete process.env.STOREFRONT_PROXY_ROOT;
      } else {
        process.env.STOREFRONT_PROXY_ROOT = previousRoot;
      }
    }
  });

  it.each([
    ["1", 1],
    ["27", 27],
    ["0", null],
    ["-1", null],
    ["1.5", null],
    ["bundle-1", null],
    ["", null],
  ])("parses public path segment %p", (value, expected) => {
    expect(parseFpbPublicNumber(value)).toBe(expected);
  });
});
