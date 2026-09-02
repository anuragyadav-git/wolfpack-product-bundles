import {
  getBundleProductImageUrl,
  shouldResetConfigureNavigation,
} from "../../../app/hooks/useBundleConfigurationState";

describe("getBundleProductImageUrl", () => {
  it("reads the current Shopify featuredMedia image URL", () => {
    expect(
      getBundleProductImageUrl({
        featuredMedia: {
          image: { url: "https://cdn.shopify.com/featured-media.png" },
        },
      }),
    ).toBe("https://cdn.shopify.com/featured-media.png");
  });

  it("falls back to the first media image node", () => {
    expect(
      getBundleProductImageUrl({
        media: {
          nodes: [
            null,
            { image: { url: "https://cdn.shopify.com/media-node.png" } },
          ],
        },
      }),
    ).toBe("https://cdn.shopify.com/media-node.png");
  });
});

describe("shouldResetConfigureNavigation", () => {
  it("resets for the first bundle and when bundle identity changes", () => {
    expect(shouldResetConfigureNavigation(null, "bundle-1")).toBe(true);
    expect(shouldResetConfigureNavigation("bundle-1", "bundle-2")).toBe(true);
  });

  it("preserves navigation when the same bundle is revalidated after save", () => {
    expect(shouldResetConfigureNavigation("bundle-1", "bundle-1")).toBe(false);
  });
});
