export const UTM_PIXEL_PRIVACY_MESSAGE =
  "Only Bundles uses Shopify's pixel privacy controls and only records campaign details when Shopify allows tracking. Your store data stays in your app, and privacy requests are handled through Shopify's required compliance process.";

export type UtmPixelStatusBannerModel = {
  description: string;
  actionLabel: "Learn more" | null;
};

export function getUtmPixelStatusBannerModel(active: boolean): UtmPixelStatusBannerModel {
  if (active) {
    return {
      description: "Campaign attribution is active and following Shopify's customer privacy choices.",
      actionLabel: null,
    };
  }

  return {
    description: "Activate tracking to connect UTM-tagged visits with bundle orders.",
    actionLabel: "Learn more",
  };
}
