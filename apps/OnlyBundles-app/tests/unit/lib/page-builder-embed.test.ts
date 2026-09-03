import { parsePageBuilderEmbedRequest } from "../../../app/lib/page-builder-embed";

describe("page builder embed request", () => {
  it("normalizes direct Product Page Bundle requests", () => {
    expect(parsePageBuilderEmbedRequest(new URLSearchParams({
      bundleType: "product_page",
      parentProductHandle: " Summer-Bundle ",
      locale: "fr-CA",
      country: "ca",
    }))).toEqual({
      bundleType: "product_page",
      parentProductHandle: "summer-bundle",
      locale: "fr-CA",
      countryCode: "CA",
    });
  });

  it("normalizes direct Full Page Bundle requests", () => {
    expect(parsePageBuilderEmbedRequest(new URLSearchParams({
      bundleType: "full_page",
      publicNumber: "12",
      locale: "en",
      country: "us",
    }))).toEqual({
      bundleType: "full_page",
      publicNumber: 12,
      locale: "en",
      countryCode: "US",
    });
  });

  it.each([
    { bundleType: "product_page", parentProductHandle: "", locale: "en" },
    { bundleType: "product_page", parentProductHandle: "bundle", locale: "" },
    { bundleType: "full_page", publicNumber: "0", locale: "en" },
    { bundleType: "full_page", publicNumber: "opaque", locale: "en" },
    { bundleType: "unknown", locale: "en" },
  ])("rejects invalid request context", (input) => {
    expect(parsePageBuilderEmbedRequest(
      new URLSearchParams(input as unknown as Record<string, string>),
    )).toBeNull();
  });
});
