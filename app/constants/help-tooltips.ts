export type HelpTooltipKey =
  | "stepFlow"
  | "category"
  | "rulesConfiguration"
  | "bundleQuantityOptions"
  | "productSlots"
  | "discountProgressBar"
  | "discountMessaging"
  | "loadingAnimation"
  | "bundleVisibilityPending"
  | "variantSelector"
  | "showTextOnAddButton"
  | "cartLineItemDiscountDisplay"
  | "swatchTooltip"
  | "tierBadge"
  | "freeGiftAddons"
  | "specificLinkAccess"
  | "offerOperations"
  | "countryTargeting"
  | "bundleWidget"
  | "bundleEmbed"
  | "preselectedProducts"
  | "quantityValidation"
  | "lowStockAlert"
  | "stickyAddToCart"
  | "countdownTimer"
  | "bundleSubscriptions";

export interface HelpTooltipDetails {
  imageSrc?: string;
}

export const HELP_TOOLTIPS: Record<HelpTooltipKey, HelpTooltipDetails> = {
  stepFlow: {
    imageSrc: "/tooltip-step-setup.avif",
  },
  category: {
    imageSrc: "/tooltip-category.avif",
  },
  rulesConfiguration: {
    imageSrc: "/tooltip-rules-configuration.avif",
  },
  bundleQuantityOptions: {
    imageSrc: "/tooltip-bundle-quantity-options.avif",
  },
  productSlots: {
    imageSrc: "/tooltip-product-slots.avif",
  },
  discountProgressBar: {
    imageSrc: "/tooltip-discount-progress.avif",
  },
  discountMessaging: {
    imageSrc: "/tooltip-discount-messaging.avif",
  },
  loadingAnimation: {
    imageSrc: "/tooltip-loading-animation.avif",
  },
  bundleVisibilityPending: {},
  variantSelector: {
    imageSrc: "/tooltip-variant-selector.avif",
  },
  showTextOnAddButton: {
    imageSrc: "/tooltip-add-to-cart.avif",
  },
  cartLineItemDiscountDisplay: {
    imageSrc: "/tooltip-cart-line-item.avif",
  },
  swatchTooltip: { imageSrc: "/tooltip-swatch-tooltip.avif" },
  tierBadge: { imageSrc: "/tooltip-tier-badge.avif" },
  freeGiftAddons: { imageSrc: "/tooltip-free-gift-addons.avif" },
  specificLinkAccess: { imageSrc: "/tooltip-specific-link-access.avif" },
  offerOperations: { imageSrc: "/tooltip-offer-operations.avif" },
  countryTargeting: { imageSrc: "/tooltip-country-targeting.avif" },
  bundleWidget: { imageSrc: "/tooltip-bundle-widget.avif" },
  bundleEmbed: { imageSrc: "/tooltip-bundle-embed.avif" },
  preselectedProducts: { imageSrc: "/tooltip-preselected-products.avif" },
  quantityValidation: { imageSrc: "/tooltip-quantity-validation.avif" },
  lowStockAlert: { imageSrc: "/tooltip-low-stock-alert.avif" },
  stickyAddToCart: { imageSrc: "/tooltip-sticky-add-to-cart.avif" },
  countdownTimer: { imageSrc: "/tooltip-countdown-timer.avif" },
  bundleSubscriptions: { imageSrc: "/tooltip-bundle-subscriptions.avif" },
};
