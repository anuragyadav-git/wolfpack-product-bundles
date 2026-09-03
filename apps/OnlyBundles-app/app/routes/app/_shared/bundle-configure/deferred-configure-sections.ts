export type DeferredConfigureSection =
  | "free_gift_addons"
  | "discount_pricing"
  | "images_visibility"
  | "bundle_settings"
  | "subscriptions"
  | "bundle_widget"
  | "bundle_embed";

export function getDeferredConfigureSection(
  activeSection: string
): DeferredConfigureSection | null {
  if (activeSection === "images_gifs" || activeSection === "bundle_visibility") {
    return "images_visibility";
  }

  switch (activeSection) {
    case "free_gift_addons":
    case "discount_pricing":
    case "bundle_settings":
    case "subscriptions":
    case "bundle_widget":
    case "bundle_embed":
      return activeSection;
    default:
      return null;
  }
}
