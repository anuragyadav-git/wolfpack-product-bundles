export type HelpTooltipKey =
  | "stepFlow"
  | "category"
  | "rulesConfiguration"
  | "bundleQuantityOptions"
  | "productSlots"
  | "discountProgressBar"
  | "discountMessaging"
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
  | "bundleSubscriptions"
  | "floatingPromoBadge";

type HelpTooltipVisualEvidence =
  | "settings-design-production-renderer"
  | "agent-storefront";

interface HelpTooltipDetails {
  imageSrc?: string;
  aspectRatio?: `${number}/${number}`;
  visualEvidence?: HelpTooltipVisualEvidence;
}

export const HELP_TOOLTIPS: Record<HelpTooltipKey, HelpTooltipDetails> = {
  stepFlow: {
    imageSrc: "/tooltip-step-setup.avif",
    aspectRatio: "430/77",
    visualEvidence: "settings-design-production-renderer",
  },
  category: {
    imageSrc: "/tooltip-category.avif",
    aspectRatio: "732/410",
    visualEvidence: "settings-design-production-renderer",
  },
  rulesConfiguration: {
    imageSrc: "/tooltip-rules-configuration.avif",
    aspectRatio: "360/56",
    visualEvidence: "settings-design-production-renderer",
  },
  bundleQuantityOptions: {
    imageSrc: "/tooltip-bundle-quantity-options.avif",
    aspectRatio: "329/176",
    visualEvidence: "settings-design-production-renderer",
  },
  productSlots: {
    imageSrc: "/tooltip-product-slots.avif",
    aspectRatio: "357/218",
    visualEvidence: "settings-design-production-renderer",
  },
  discountProgressBar: {
    imageSrc: "/tooltip-discount-progress.avif",
    aspectRatio: "329/176",
    visualEvidence: "settings-design-production-renderer",
  },
  discountMessaging: {
    imageSrc: "/tooltip-discount-messaging.avif",
    aspectRatio: "329/176",
    visualEvidence: "settings-design-production-renderer",
  },
  variantSelector: {
    imageSrc: "/tooltip-variant-selector.avif",
    aspectRatio: "485/88",
    visualEvidence: "settings-design-production-renderer",
  },
  showTextOnAddButton: {
    imageSrc: "/tooltip-add-to-cart.avif",
    aspectRatio: "236/335",
    visualEvidence: "settings-design-production-renderer",
  },
  cartLineItemDiscountDisplay: {},
  swatchTooltip: {
    imageSrc: "/tooltip-swatch-tooltip.avif",
    aspectRatio: "485/88",
    visualEvidence: "settings-design-production-renderer",
  },
  tierBadge: {
    imageSrc: "/tooltip-tier-badge.avif",
    aspectRatio: "329/176",
    visualEvidence: "settings-design-production-renderer",
  },
  freeGiftAddons: {
    imageSrc: "/tooltip-free-gift-addons.avif",
    aspectRatio: "500/532",
    visualEvidence: "settings-design-production-renderer",
  },
  specificLinkAccess: {},
  offerOperations: {},
  countryTargeting: {},
  bundleWidget: {
    imageSrc: "/tooltip-bundle-widget.avif",
    aspectRatio: "493/301",
    visualEvidence: "settings-design-production-renderer",
  },
  bundleEmbed: {
    imageSrc: "/tooltip-bundle-embed.avif",
    aspectRatio: "500/784",
    visualEvidence: "settings-design-production-renderer",
  },
  preselectedProducts: {
    imageSrc: "/tooltip-preselected-products.avif",
    aspectRatio: "245/305",
    visualEvidence: "settings-design-production-renderer",
  },
  quantityValidation: {
    imageSrc: "/tooltip-quantity-validation.avif",
    aspectRatio: "244/295",
    visualEvidence: "settings-design-production-renderer",
  },
  lowStockAlert: {
    imageSrc: "/tooltip-low-stock-alert.avif",
    aspectRatio: "236/287",
    visualEvidence: "settings-design-production-renderer",
  },
  stickyAddToCart: {
    imageSrc: "/tooltip-sticky-add-to-cart.avif",
    aspectRatio: "544/72",
    visualEvidence: "settings-design-production-renderer",
  },
  countdownTimer: {
    imageSrc: "/tooltip-countdown-timer.avif",
    aspectRatio: "360/44",
    visualEvidence: "settings-design-production-renderer",
  },
  bundleSubscriptions: {
    imageSrc: "/tooltip-bundle-subscriptions.avif",
    aspectRatio: "500/210",
    visualEvidence: "settings-design-production-renderer",
  },
  floatingPromoBadge: {
    imageSrc: "/tooltip-floating-promo-badge.avif",
    aspectRatio: "320/160",
    visualEvidence: "agent-storefront",
  },
};
