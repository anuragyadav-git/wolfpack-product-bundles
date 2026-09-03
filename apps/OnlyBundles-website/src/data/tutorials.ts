export const tutorialPresentation = {
  "create-your-first-bundle": { order: 1, readingTime: "11 min read", image: "/tutorial-create.jpg", imageAlt: "Only Bundles screen for choosing a Product Page or Full Page bundle builder" },
  "build-a-full-page-bundle": { order: 2, readingTime: "14 min read", image: "/tutorial-fpb.jpg", imageAlt: "Full Page Bundle configuration workspace in Only Bundles" },
  "build-a-product-page-bundle": { order: 3, readingTime: "13 min read", image: "/tutorial-ppb.jpg", imageAlt: "Product Page Bundle step and product configuration in Only Bundles" },
  "configure-discounts-and-pricing": { order: 4, readingTime: "12 min read", image: "/tutorial-discounts.jpg", imageAlt: "Discount and pricing controls in the Only Bundles bundle editor" },
  "place-bundles-on-your-storefront": { order: 5, readingTime: "10 min read", image: "/tutorial-visibility.jpg", imageAlt: "Bundle visibility and storefront placement controls in Only Bundles" },
  "customize-design-and-language": { order: 6, readingTime: "12 min read", image: "/tutorial-design.jpg", imageAlt: "Only Bundles design workspace with template and live preview controls" },
  "configure-gifts-add-ons-and-messages": { order: 7, readingTime: "12 min read", image: "/tutorial-fpb.jpg", imageAlt: "Full Page Bundle editor containing gift and add-on configuration" },
  "configure-product-page-gifts-and-add-ons": { order: 8, readingTime: "10 min read", image: "/tutorial-ppb.jpg", imageAlt: "Product Page Bundle gift and add-on configuration in Only Bundles" },
  "sell-bundle-subscriptions": { order: 9, readingTime: "11 min read", image: "/tutorial-subscriptions.jpg", imageAlt: "Bundle subscription settings and selling plan controls in Only Bundles" },
  "measure-bundle-performance": { order: 10, readingTime: "10 min read", image: "/tutorial-analytics.jpg", imageAlt: "Only Bundles analytics dashboard showing the bundle conversion funnel" },
  "control-bundle-visibility": { order: 11, readingTime: "10 min read", image: "/tutorial-visibility.jpg", imageAlt: "Publishing status, app embed status, and bundle placement options" },
  "embed-bundles-in-page-builders": { order: 12, readingTime: "13 min read", image: "/tutorial-integrations.jpg", imageAlt: "Only Bundles integrations page for PageFly, GemPages, and Shogun" },
} as const;

export type TutorialId = keyof typeof tutorialPresentation;

export function getTutorialPresentation(id: string) {
  const presentation = tutorialPresentation[id as TutorialId];
  if (!presentation) throw new Error(`Missing tutorial presentation metadata for ${id}`);
  return presentation;
}
