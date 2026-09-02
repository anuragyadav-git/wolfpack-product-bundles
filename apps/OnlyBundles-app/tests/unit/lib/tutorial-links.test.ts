import {
  TUTORIAL_LIBRARY_URL,
  TUTORIAL_LINKS,
} from "../../../app/lib/tutorial-links";

describe("Only Bundles tutorial links", () => {
  it("uses the current Workers tutorial library as the canonical destination", () => {
    expect(TUTORIAL_LIBRARY_URL).toBe(
      "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/",
    );
  });

  it("maps every merchant help topic to a specific tutorial", () => {
    expect(TUTORIAL_LINKS).toEqual({
      createBundle:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/create-your-first-bundle/",
      fullPageSetup:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/build-a-full-page-bundle/",
      productPageSetup:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/build-a-product-page-bundle/",
      fullPageRules:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/build-a-full-page-bundle/#4-configure-selection-and-quantity-rules",
      productPageRules:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/build-a-product-page-bundle/#3-set-a-satisfiable-selection-rule",
      fullPageGiftsAndAddons:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/configure-gifts-add-ons-and-messages/",
      productPageGiftsAndAddons:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/configure-product-page-gifts-and-add-ons/",
      subscriptions:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/sell-bundle-subscriptions/",
      analytics:
        "https://only-bundles-website.onlybundlesapp.workers.dev/blogs/measure-bundle-performance/#5-evaluate-campaigns-and-custom-utms",
    });
  });

  it("contains no legacy video or partner-profile destination", () => {
    const destinations = JSON.stringify(TUTORIAL_LINKS);
    expect(destinations).not.toContain("youtube.com");
    expect(destinations).not.toContain("apps.shopify.com/partners");
  });
});
