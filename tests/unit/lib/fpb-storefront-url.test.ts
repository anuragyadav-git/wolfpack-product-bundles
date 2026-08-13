import {
  appendFpbPreviewToken,
  buildFpbStorefrontUrl,
  parseFpbPublicNumber,
} from "../../../app/lib/fpb-storefront-url";

describe("FPB storefront URL", () => {
  it("builds the canonical default app-proxy URL", () => {
    expect(buildFpbStorefrontUrl("https://test-shop.myshopify.com/", 1))
      .toBe("https://test-shop.myshopify.com/apps/onlybundles/wpb/1");
  });

  it("adds a draft preview token", () => {
    expect(appendFpbPreviewToken(
      buildFpbStorefrontUrl("test-shop.myshopify.com", 27),
      "preview-token",
    )).toBe("https://test-shop.myshopify.com/apps/onlybundles/wpb/27?wpb_preview=preview-token");
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
