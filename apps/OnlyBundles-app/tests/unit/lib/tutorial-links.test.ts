import {
  TUTORIAL_LIBRARY_URL,
  TUTORIAL_LINKS,
  SDK_DOCUMENTATION_URL,
} from "../../../app/lib/tutorial-links";

describe("Only Bundles tutorial links", () => {
  it("uses the Only Bundles domain tutorial library as the canonical destination", () => {
    expect(TUTORIAL_LIBRARY_URL).toBe(
      "https://onlybundles.com/blogs/",
    );
  });

  it("maps every merchant help topic to a specific tutorial", () => {
    expect(TUTORIAL_LINKS).toEqual({
      createBundle:
        "https://onlybundles.com/blogs/create-your-first-bundle/",
      fullPageSetup:
        "https://onlybundles.com/blogs/build-a-full-page-bundle/",
      productPageSetup:
        "https://onlybundles.com/blogs/build-a-product-page-bundle/",
      fullPageRules:
        "https://onlybundles.com/blogs/build-a-full-page-bundle/#4-configure-selection-and-quantity-rules",
      productPageRules:
        "https://onlybundles.com/blogs/build-a-product-page-bundle/#3-set-a-satisfiable-selection-rule",
      fullPageGiftsAndAddons:
        "https://onlybundles.com/blogs/configure-gifts-add-ons-and-messages/",
      productPageGiftsAndAddons:
        "https://onlybundles.com/blogs/configure-product-page-gifts-and-add-ons/",
      subscriptions:
        "https://onlybundles.com/blogs/sell-bundle-subscriptions/",
      analytics:
        "https://onlybundles.com/blogs/measure-bundle-performance/#5-evaluate-campaigns-and-custom-utms",
    });
  });

  it("contains no legacy video or partner-profile destination", () => {
    const destinations = JSON.stringify(TUTORIAL_LINKS);
    expect(destinations).not.toContain("youtube.com");
    expect(destinations).not.toContain("apps.shopify.com/partners");
  });

  it("publishes the canonical SDK documentation destination", () => {
    expect(SDK_DOCUMENTATION_URL).toBe(
      "https://onlybundles.com/developers/sdk/",
    );
  });
});
