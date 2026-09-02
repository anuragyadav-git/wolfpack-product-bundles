const TUTORIAL_WEBSITE_ORIGIN =
  "https://only-bundles-website.onlybundlesapp.workers.dev";

export const TUTORIAL_LIBRARY_URL = `${TUTORIAL_WEBSITE_ORIGIN}/blogs/`;

export const TUTORIAL_LINKS = {
  createBundle: `${TUTORIAL_LIBRARY_URL}create-your-first-bundle/`,
  fullPageSetup: `${TUTORIAL_LIBRARY_URL}build-a-full-page-bundle/`,
  productPageSetup: `${TUTORIAL_LIBRARY_URL}build-a-product-page-bundle/`,
  fullPageRules: `${TUTORIAL_LIBRARY_URL}build-a-full-page-bundle/#4-configure-selection-and-quantity-rules`,
  productPageRules: `${TUTORIAL_LIBRARY_URL}build-a-product-page-bundle/#3-set-a-satisfiable-selection-rule`,
  fullPageGiftsAndAddons: `${TUTORIAL_LIBRARY_URL}configure-gifts-add-ons-and-messages/`,
  productPageGiftsAndAddons: `${TUTORIAL_LIBRARY_URL}configure-product-page-gifts-and-add-ons/`,
  subscriptions: `${TUTORIAL_LIBRARY_URL}sell-bundle-subscriptions/`,
  analytics: `${TUTORIAL_LIBRARY_URL}measure-bundle-performance/#5-evaluate-campaigns-and-custom-utms`,
} as const;
