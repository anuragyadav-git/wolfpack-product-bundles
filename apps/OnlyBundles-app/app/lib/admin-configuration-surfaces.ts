import { CHECKOUT_INTEGRATION_PROVIDER_OPTIONS } from "./checkout-integrations";

export type SettingsCardId = "design" | "language" | "controls";

export type SettingsCard = {
  id: SettingsCardId;
  title: string;
  description: string;
  icon: string;
};

export type SettingsField = {
  key?: string;
  label: string;
  value?: string;
  kind?: "color" | "text" | "number" | "select" | "radio" | "toggle" | "css" | "script" | "secret" | "image" | "file" | "button" | "loadingGif" | "loadingSpinner";
  note?: string;
  description?: string;
  guideUrl?: string;
  options?: string[];
  state?: string;
  group?: string;
};

export const CHECKOUT_INTEGRATION_OPTIONS = CHECKOUT_INTEGRATION_PROVIDER_OPTIONS;

export type SettingsTab = {
  title: string;
  description: string;
  contentTitle?: string;
  contentDescription?: string;
  fields: SettingsField[];
};

export type SettingsFieldGroup = {
  title: string;
  description?: string;
  fields: SettingsField[];
};

export type SettingsPanel = {
  title: string;
  description: string;
  bullets: string[];
};

export type LanguageConfiguration = {
  enabled: boolean;
  selectedLanguage: string;
  supportedLanguages: string[];
  sharedCartFields: SettingsField[];
  templateSections: string[];
  productPageTemplateSections: string[];
  productCardFields: SettingsField[];
  templateFields: Record<string, SettingsFieldGroup[]>;
  productPageTemplateFields: Record<string, SettingsFieldGroup[]>;
};

export type ControlsLayout = {
  id: "landing-page" | "product-page";
  label: string;
  description: string;
  tabs: SettingsTab[];
};

export type IntegrationCard = {
  id: string;
  title: string;
  description: string;
  logoLabel: string;
  logoUrl?: string;
  status: "Supported" | "Guided setup" | "Assisted setup" | "Planned";
  ctaLabel: string;
  ctaType: "guide" | "chat" | "request";
  guideSummary: string[];
};

export type IntegrationCategory = {
  id: string;
  title: string;
  description: string;
  cards: IntegrationCard[];
};

export const SETTINGS_CARDS: SettingsCard[] = [
  {
    id: "design",
    title: "Design",
    description: "Modify and customize all design elements of the bundle here",
    icon: "edit",
  },
  {
    id: "language",
    title: "Language",
    description: "Configure all text, labels, and translations for your bundle here",
    icon: "language-translate",
  },
  {
    id: "controls",
    title: "Controls",
    description: "Change loading screen gif, add custom CSS, modify checkout settings and more",
    icon: "filter",
  },
];

export const SETTINGS_PANELS: Record<SettingsCardId, SettingsPanel> = {
  design: {
    title: "Design control panel",
    description: "Design settings for bundle colors, typography, corners, and media controls.",
    bullets: [
      "Brand colors control primary, button text, primary text, secondary background, and product card background colors.",
      "Typography is split between primary, secondary, and body text tokens with size and weight controls.",
      "Corners expose separate bundle button and product-card/cart radius values.",
      "Images and GIFs configure product image fit plus loading media for bundle and checkout states.",
    ],
  },
  language: {
    title: "Language configurations",
    description: "Multilingual and text-template configuration surface.",
    bullets: [
      "Multilingual configuration is enabled and defaults to English.",
      "Cart and checkout shared labels include bundle contains, original price, and cart discount display labels.",
      "Template text is grouped into product card, bundle cart, bundle, popups, toasts, addons, and messages.",
      "Product card copy includes the add-to-bundle action label.",
    ],
  },
  controls: {
    title: "Additional configurations",
    description: "Layout-specific behavior controls and integration callback settings.",
    bullets: [
      "Landing Page Layout and Product Page Layout expose different configuration sets.",
      "Controls are grouped into Configuration, CSS & Scripts, Integrations, and Advanced tabs.",
      "Checkout and cart behavior is configured through explicit target redirects or callback functions.",
      "Theme-page CSS and scripts are configured from this surface rather than from each integration card.",
    ],
  },
};

export const SUPPORTED_LANGUAGE_LABELS = [
  "English",
  "Arabic",
  "Bulgarian (BG)",
  "Catalan",
  "Chinese (CN)",
  "Chinese (TW)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "Estonian",
  "Finnish",
  "French",
  "Georgian",
  "German",
  "Greek",
  "Hebrew",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Norwegian Bokmål",
  "Polish",
  "Portuguese (BR)",
  "Portuguese (PT)",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak (SK)",
  "Slovenian (SI)",
  "Spanish",
  "Swedish",
  "Thai",
  "Turkish",
  "Vietnamese",
  "Norwegian",
];

export const DESIGN_CONFIGURATION: SettingsTab[] = [
  {
    title: "Brand Colors",
    description: "Global brand colors used by bundle cards, summary, buttons, and supporting surfaces.",
    fields: [
      { label: "Primary Color", value: "#000000", kind: "color", description: "Action buttons, progress bars, and active elements" },
      { label: "Button Text Color", value: "#ffffff", kind: "color", description: "Text displayed on primary buttons and action elements" },
      { label: "Primary Text Color", value: "#000000", kind: "color", description: "Product names, prices, labels, and main content text" },
      { label: "Secondary Color", value: "#eeeeee", kind: "color", description: "Secondary elements, empty progress bars, and inactive states" },
      { label: "Product Background Color", value: "#ffffff", kind: "color", description: "Background color for product cards and cart footer" },
      { key: "stylePresets.colors.discountTierBackgroundColor", group: "Discount feedback", label: "Tier background", value: "#D1FAE5", kind: "color", description: "Color beat shown when a shopper reaches an intermediate discount tier" },
      { key: "stylePresets.colors.discountTierTextColor", group: "Discount feedback", label: "Tier text", value: "#065F46", kind: "color", description: "Text color shown during intermediate tier feedback" },
      { key: "stylePresets.colors.discountCompletionBackgroundColor", group: "Discount feedback", label: "Completion background", value: "#047857", kind: "color", description: "Color beats shown when a shopper reaches the highest discount tier" },
      { key: "stylePresets.colors.discountCompletionTextColor", group: "Discount feedback", label: "Completion text", value: "#FFFFFF", kind: "color", description: "Text color shown during highest-tier feedback" },
    ],
  },
  {
    title: "Typography",
    description: "Text token defaults for primary, secondary, and body labels.",
    fields: [
      { label: "Primary Font Size", value: "16", kind: "number" },
      { label: "Primary Font Weight", value: "Bold", kind: "select", options: ["Regular", "Bold"] },
      { label: "Secondary Font Size", value: "14", kind: "number" },
      { label: "Secondary Font Weight", value: "Bold", kind: "select", options: ["Regular", "Bold"] },
      { label: "Body Font Size", value: "14", kind: "number" },
      { label: "Body Font Weight", value: "Regular", kind: "select", options: ["Regular", "Bold"] },
    ],
  },
  {
    title: "Corners",
    description: "Radius controls for bundle buttons and product card/cart shells.",
    fields: [
      { label: "Bundle Buttons Corner Style", value: "Base", kind: "select", options: ["Sharp", "Base", "Round"] },
      { label: "Bundle Buttons Base", value: "5px", kind: "number" },
      { label: "Product Card & Cart Corner Style", value: "Base", kind: "select", options: ["Sharp", "Base"] },
      { label: "Product Card & Cart Base", value: "10px", kind: "number" },
    ],
  },
  {
    title: "Images & GIFs",
    description: "Image-fit, slot icon, and full-page bundle loading screen controls.",
    fields: [
      { label: "Image Fit", value: "Cover", kind: "select", options: ["Cover", "Contain", "Fill"] },
      { key: "stylePresets.images.slotIconUrl", group: "Product Slot Icon", label: "Slot Icon", value: "", kind: "image", description: "Optional image displayed in empty FPB and PPB product slots." },
      { key: "stylePresets.images.slotIconFit", group: "Product Slot Icon", label: "Slot Icon Presentation", value: "Centered badge", kind: "select", options: ["Centered badge", "Cover", "Fit"], description: "Choose whether the image replaces the centered plus icon or scales relative to the full slot." },
      { key: "generalSettings.loadingGifUrl", label: "FPB Loading GIF", value: "", kind: "loadingGif", description: "Optional GIF displayed instead of the default spinner on the full-page bundle loading screen." },
      { key: "generalSettings.loadingBgColor", label: "Loading Screen Background Color", value: "#ffffff", kind: "color", description: "Background color of the full-page bundle loading screen." },
      { label: "Checkout GIF", value: "Default spinner", kind: "loadingSpinner", description: "Displayed during checkout loading unless a merchant GIF is configured." },
    ],
  },
];

export const EXPERT_COLOR_CONTROLS: Record<string, SettingsField[]> = {
  General: [
    { key: "expert.navigationBanner.navigationBannerStepCompletionColor", label: "Completed step color", value: "#000000", kind: "color", description: "Background color for completed step indicators", guideUrl: "/design-color-guide-general.avif" },
    { key: "expert.navigationBanner.navigationCheckColor", label: "Check Mark Color", value: "#FFFFFF", kind: "color", description: "Check mark icons displayed on completed bundle steps" },
    { key: "expert.navigationBanner.navigationBannerStepTextColor", label: "Step Text Color", value: "#000000", kind: "color", description: "Text color for step names and navigation labels" },
    { key: "expert.generalSettings.productPageTitleColor", label: "Product Page Title Color", value: "#000000", kind: "color", description: "Title text color on the bundle builder page" },
    { key: "expert.navigationBanner.navigationBannerStepProgressBarEmptyColor", label: "Step Progress Bar Empty Color", value: "#cccccc", kind: "color", description: "Background color for incomplete sections of progress bars" },
    { key: "expert.generalSettings.conditionToastBgColor", label: "Condition Toast Background Color", value: "#000000", kind: "color", description: "Background color for condition toast" },
    { key: "expert.generalSettings.conditionToastTextColor", label: "Condition Toast Text Color", value: "#ffffff", kind: "color", description: "Text color for condition toast" },
    { key: "expert.navigationBanner.tabsActiveBgColor", label: "Active Tab Background Color", value: "#000000", kind: "color", description: "Background color for the currently selected category tab", group: "Categories", guideUrl: "/design-color-guide-categories.avif" },
    { key: "expert.navigationBanner.tabsActiveTextColor", label: "Active Tab Text Color", value: "#F6f6f6", kind: "color", description: "Text color for the currently selected category tab", group: "Categories" },
    { key: "expert.navigationBanner.tabsInactiveBgColor", label: "Inactive Tab Background Color", value: "#FFFFFF", kind: "color", description: "Background color for unselected category tabs", group: "Categories" },
    { key: "expert.navigationBanner.tabsInactiveTextColor", label: "Inactive Tab Text Color", value: "#000000", kind: "color", description: "Text color for unselected category tabs", group: "Categories" },
  ],
  "Product Card": [
    { key: "expert.productCard.productCardBgColor", label: "Background Color", value: "#ffffff", kind: "color", description: "Background color of individual product cards", guideUrl: "/design-color-guide-product-card.avif" },
    { key: "expert.productCard.productCardTextColor", label: "Product Title Text Color", value: "#252525", kind: "color", description: "Text color for product names displayed on cards" },
    { key: "expert.productCard.productCardButtonColor", label: "Add Product Button Color", value: "#000000", kind: "color", description: "Color for the button on the product card" },
    { key: "expert.productCard.productCardButtonTextColor", label: "Add Product Button Text Color", value: "#ffffff", kind: "color", description: "Text color for the button on the product card" },
    { key: "expert.emptyStateCard.emptyStateCardBorderColor", label: "Empty State Border Color", value: "#000", kind: "color", description: "Border color for empty product slots waiting to be filled" },
    { key: "expert.emptyStateCard.emptyStateCardTextColor", label: "Empty State Text Color", value: "#3E3E3E", kind: "color", description: "Text color for placeholder messages in empty product slots" },
  ],
  "Bundle Cart": [
    { key: "expert.cartFooter.cartFooterBgColor", label: "Cart Background Color", value: "#ffffff", kind: "color", description: "Background color for bundle cart", guideUrl: "/design-color-guide-bundle-cart.avif" },
    { key: "expert.cartFooter.cartFooterTextColor", label: "Cart Text Color", value: "#000000", kind: "color", description: "Text color for cart content, totals, and labels" },
    { key: "expert.cartFooter.cartFooterNextButtonColor", label: "Next Button Color", value: "#000000", kind: "color", description: "Background color for the next step button" },
    { key: "expert.cartFooter.cartFooterNextButtonTextColor", label: "Next Button Text Color", value: "#ffffff", kind: "color", description: "Text color for the next step button" },
    { key: "expert.cartFooter.cartFooterBackButtonColor", label: "Back Button Color", value: "#6d7175", kind: "color", description: "Background color for the back step button" },
    { key: "expert.cartFooter.cartFooterBackButtonTextColor", label: "Back Button Text Color", value: "#000000", kind: "color", description: "Text color for the back step button" },
    { key: "expert.cartFooter.cartFooterDiscountTextColor", label: "Discount Text Color", value: "#000000", kind: "color", description: "Text color for discount messages" },
    { key: "expert.cartFooter.cartFooterDiscountProgressBarEmptyColor", label: "Discount Progress Bar Empty Color", value: "#C1E7C5", kind: "color", description: "Fill color for empty part of discount progress bar" },
    { key: "expert.cartFooter.cartFooterDiscountProgressBarFilledColor", label: "Discount Progress Bar Filled Color", value: "#15A524", kind: "color", description: "Fill color for completed part of discount progress bar" },
  ],
  Upsell: [
    { key: "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonBg", label: "Upsell Button Color", value: "#000000", kind: "color", description: "Background color for upsell buttons", guideUrl: "/design-color-guide-upsell.avif" },
    { key: "expert.mixAndMatchConfig.generalSettings.bundleUpsellButtonTextColor", label: "Upsell Button Text Color", value: "#ffffff", kind: "color", description: "Text color displayed on upsell buttons" },
    { key: "expert.mixAndMatchConfig.generalSettings.bundleUpsellFontColor", label: "Upsell Widget Body Text Color", value: "#000000", kind: "color", description: "Text color displayed on upsell widget" },
  ],
};

export const LANGUAGE_CONFIGURATION: LanguageConfiguration = {
  enabled: true,
  selectedLanguage: "English",
  supportedLanguages: SUPPORTED_LANGUAGE_LABELS,
  sharedCartFields: [
    { key: "shared.cartCheckout.bundleContainsLabel", label: "Bundle Contains Label", value: "Items", kind: "text" },
    { key: "shared.cartCheckout.bundleOriginalPriceLabel", label: "Bundle Original Price Label", value: "Retail Price", kind: "text" },
    { key: "shared.cartCheckout.bundleDiscountDisplayLabel", label: "Bundle Cart Discount Display Label", value: "You Save", kind: "text" },
  ],
  templateSections: ["Product Card", "Bundle Cart", "Bundle", "Popups", "Toasts", "Addons"],
  productPageTemplateSections: ["Product Card", "Bundle Cart", "Bundle", "Toasts"],
  productCardFields: [
    { key: "fpb.general.addToBoxButtonText", label: "Add Product to Bundle Button", value: "Add To Box", kind: "text" },
  ],
  templateFields: {
    "Product Card": [
      {
        title: "Button Configuration",
        description: "Product card button text and action labels",
        fields: [
          { key: "fpb.general.addToBoxButtonText", label: "Add Product to Bundle Button", value: "Add To Box", kind: "text" },
        ],
      },
    ],
    "Bundle Cart": [
      {
        title: "Navigation Buttons",
        description: "Bundle cart navigation button text and labels",
        fields: [
          { key: "fpb.general.nextButtonText", label: "Next Button Text", value: "Next", kind: "text" },
          { key: "fpb.general.addToCartButtonText", label: "Add Bundle to Cart Button", value: "Add To Cart", kind: "text" },
          { key: "fpb.general.totalLabelText", label: "Total Label", value: "Total", kind: "text" },
          { key: "fpb.general.viewCartProductsLabel", label: "View Cart Products Label", value: "View Selected Products", kind: "text" },
          { key: "fpb.general.discountBadgeSuffix", label: "Discount Badge Suffix", value: "off", kind: "text" },
          { key: "fpb.general.cartInclusionTitle", label: "Cart Inclusion Title", value: "item(s)", kind: "text" },
          { key: "fpb.general.subscriptionSelectionLabel", label: "Subscription Selection Label", value: "Select Subscription Plan", kind: "text" },
        ],
      },
    ],
    "Bundle": [
      {
        title: "General Settings",
        description: "Basic bundle configuration",
        fields: [
          { key: "fpb.general.noProductsAvailableText", label: "No Products Available label", value: "No Products Available", kind: "text" },
          { key: "fpb.general.chooseOptionsButtonText", label: "Choose Options Button", value: "Choose Options", kind: "text" },
          { key: "fpb.general.loadMoreProductsButtonText", label: "Load More Products Button", value: "Load More Products", kind: "text" },
          { key: "fpb.general.preparingBundleLabel", label: "Preparing Bundle Label", value: "Preparing Bundle...", kind: "text" },
          { key: "fpb.general.redirectingLabel", label: "Redirecting label", value: "Redirecting...", kind: "text" },
          { key: "fpb.general.addedLabel", label: "Added Label", value: "Added", kind: "text" },
          { key: "fpb.general.addButtonText", label: "Add Button Text", value: "Add", kind: "text" },
          { key: "fpb.general.reviewButtonText", label: "Review Button Text", value: "Review", kind: "text" },
          { key: "fpb.general.selectBundleProductsLabel", label: "Select Bundle Products label", value: "Select Bundle Products", kind: "text" },
        ],
      },
    ],
    Popups: [
      {
        title: "General Popup Content",
        description: "Popup dialog text, labels, and button text",
        fields: [{ key: "fpb.modals.quantityLabel", label: "Quantity Label", value: "Quantity" }],
      },
      {
        title: "Clear Cart Modal",
        description: "Clear cart confirmation modal text and buttons",
        fields: [
          { key: "fpb.modals.clearCartModalTitle", label: "Modal - Title", value: "Are you sure?" },
          {
            key: "fpb.modals.clearCartModalDescription",
            label: "Modal - Description",
            value:
              "Are you sure you want to clear all items from your cart? This action cannot be undone...",
          },
          { key: "fpb.modals.clearCartButtonText", label: "Clear Cart Button Text", value: "Clear" },
          { key: "fpb.modals.clearCartCancelButtonText", label: "Modal - Cancel Button Text", value: "Cancel" },
          { key: "fpb.modals.clearCartConfirmButtonText", label: "Modal - Confirm Button Text", value: "Clear Cart" },
        ],
      },
    ],
    Toasts: [
      {
        title: "General Toasts",
        description: "General toast messages and alerts",
        fields: [
          {
            key: "fpb.toasts.boxSelectionEligibilityToast",
            label: "Box Selection Eligibility Toast",
            value: "Remove {{boxSelectionDifference}} item(s) to select this box",
          },
          {
            key: "fpb.toasts.removeProductFromFooterText",
            label: "Remove Product from Footer Text",
            value: "Remove This Product From {{stepName}}",
          },
        ],
      },
      {
        title: "Rule Messages",
        description: "Quantity, amount, and weight rule validation messages",
        fields: [
          {
            key: "fpb.conditions.quantity.greaterThanOrEqualTo",
            label: "Greater than rule message (Quantity)",
            value: "Add at least {{conditionQuantity}} products on this step",
          },
          {
            key: "fpb.conditions.quantity.lessThanOrEqualTo",
            label: "Less than rule message (Quantity)",
            value: "Add a maximum of {{conditionQuantity}} products to continue",
          },
          {
            key: "fpb.conditions.quantity.equalTo",
            label: "Equal to rule message (Quantity)",
            value: "Add exactly {{conditionQuantity}} products on this step",
          },
          {
            key: "fpb.conditions.amount.greaterThanOrEqualTo",
            label: "Greater than rule message (Amount)",
            value: "Add products worth at least {{conditionAmount}} on this step",
          },
          {
            key: "fpb.conditions.amount.lessThanOrEqualTo",
            label: "Less than rule message (Amount)",
            value: "Add products worth maximum of {{conditionAmount}} on this step",
          },
          {
            key: "fpb.conditions.amount.equalTo",
            label: "Equal to rule message (Amount)",
            value: "Add products worth {{conditionAmount}} on this step",
          },
          {
            key: "fpb.conditions.weight.greaterThanOrEqualTo",
            label: "Greater than rule message (Weight)",
            value: "Add products weighing at least {{conditionWeight}} on this step",
          },
          {
            key: "fpb.conditions.weight.lessThanOrEqualTo",
            label: "Less than rule message (Weight)",
            value: "Add products weighing maximum of {{conditionWeight}} on this step",
          },
          {
            key: "fpb.conditions.weight.equalTo",
            label: "Equal to rule message (Weight)",
            value: "Add products weighing {{conditionWeight}} on this step",
          },
        ],
      },
    ],
    Addons: [
      {
        title: "Addon Settings",
        description: "Addon product configuration and validation messages",
        fields: [
          {
            key: "fpb.addons.maxAddonProductsAllowed",
            label: "Max Addon Products Allowed message",
            value: "Add a maximum of {{maxAllowedAddons}} addon products on this step",
          },
          {
            key: "fpb.addons.addonProductsMandatory",
            label: "Addon Products Mandatory message",
            value: "Addon product is mandatory on this step",
          },
          {
            key: "fpb.addons.mobileAddonNotification",
            label: "Mobile Add On Notification",
            value: "Additional offers to be unlocked",
          },
        ],
      },
    ],
  },
  productPageTemplateFields: {
    "Product Card": [
      {
        title: "Product Card",
        description: "Product card labels for product-page bundles",
        fields: [
          { key: "ppb.productCard.productCardAddBtnText", label: "Product Add to Cart Button", value: "Add to Cart", kind: "text" },
          { key: "ppb.productCard.productCardOutOfStockBtnText", label: "Product Out of Stock Button", value: "Out of Stock", kind: "text" },
          { key: "ppb.productCard.productVariantLabelText", label: "Product Variant Label", value: "Select variant", kind: "text" },
          { key: "ppb.productCard.productAddedBtnText", label: "Product Added label", value: "Added x{{allowedQuantity}}", kind: "text" },
          { key: "ppb.productCard.productCardAddBtnText_inPage", label: "Inline Product - Add Button Text", value: "Add +", kind: "text" },
        ],
      },
    ],
    "Bundle Cart": [
      {
        title: "Bundle Cart",
        description: "Product-page bundle cart labels and navigation",
        fields: [
          { key: "ppb.general.discountRibbonSuffix", label: "Discount Badge Suffix", value: "off", kind: "text" },
          { key: "ppb.general.selectSubscriptionPlanButtonText", label: "Subscription Selection Label", value: "Select Subscription Plan", kind: "text" },
          { key: "ppb.general.boxConditionInitialText_inPage", label: "Inline Add To Cart Button - Quantity Selection message", value: "Select {{quantityDifference}} Items", kind: "text" },
          { key: "ppb.general.bundleCartDrawerBtnText_inPage", label: "Inline Cart Drawer Button Text", value: "View Bundle Items", kind: "text" },
          { key: "ppb.general.bundleCartSelectedProductsText_inPage", label: "Inline Cart Selected Products Label", value: "Selected Products", kind: "text" },
          { key: "ppb.general.subtotalLabelText", label: "Subtotal Text", value: "Subtotal", kind: "text" },
          { key: "ppb.general.addBundleToCartBtnText", label: "Add Bundle Cart label", value: "Add Bundle to Cart", kind: "text" },
          { key: "ppb.footer.footerPrevBtnText", label: "Footer Previous Button", value: "Prev", kind: "text" },
          { key: "ppb.footer.footerNextBtnText", label: "Footer Next Button", value: "Next", kind: "text" },
          { key: "ppb.footer.footerFinishBtnText", label: "Footer Finish Button", value: "Done", kind: "text" },
        ],
      },
    ],
    Bundle: [
      {
        title: "Bundle",
        description: "Product-page bundle state labels",
        fields: [
          { key: "ppb.general.noProductsAvailable", label: "No Products Available label", value: "No Products Available", kind: "text" },
          { key: "ppb.general.addToCartBundleBtnLoadingText", label: "Add Bundle Loading label", value: "Adding Bundle...", kind: "text" },
          { key: "ppb.general.addBundleSuccessText", label: "Add Bundle Success label", value: "Bundle Added", kind: "text" },
          { key: "ppb.general.emptyCardText", label: "Add Empty Product Card Text", value: "Product", kind: "text" },
          { key: "ppb.general.stepsDrawerPillText", label: "Steps Drawer Pill Text", value: "Show all steps", kind: "text" },
        ],
      },
    ],
    Toasts: [
      {
        title: "General Toasts",
        description: "Product-page bundle toast messages",
        fields: [
          { key: "ppb.general.inventoryLimitReachedText", label: "Inventory Limit Reached Label", value: "No More Stock", kind: "text" },
          { key: "ppb.general.boxSelectionEligibilityToast_inPage", label: "Box Selection Eligibility Toast", value: "Remove {{boxSelectionDifference}} item(s) to select this box", kind: "text" },
        ],
      },
      {
        title: "Rule Messages",
        description: "Product-page quantity, amount, and weight rule messages",
        fields: [
          { key: "ppb.conditions.quantity.greaterThanOrEqualTo", label: "Greater than rule message (Quantity)", value: "Add at least {{conditionQuantity}} products on this step", kind: "text" },
          { key: "ppb.conditions.quantity.lessThanOrEqualTo", label: "Less than rule message (Quantity)", value: "Add a maximum of {{conditionQuantity}} products to continue", kind: "text" },
          { key: "ppb.conditions.quantity.equalTo", label: "Equal to rule message (Quantity)", value: "Add exactly {{conditionQuantity}} products on this step", kind: "text" },
          { key: "ppb.conditions.amount.greaterThanOrEqualTo", label: "Greater than rule message (Amount)", value: "Add products worth at least {{conditionAmount}} on this step", kind: "text" },
          { key: "ppb.conditions.amount.lessThanOrEqualTo", label: "Less than rule message (Amount)", value: "Add products worth maximum of {{conditionAmount}} on this step", kind: "text" },
          { key: "ppb.conditions.amount.equalTo", label: "Equal to rule message (Amount)", value: "Add products worth {{conditionAmount}} on this step", kind: "text" },
          { key: "ppb.conditions.weight.greaterThanOrEqualTo", label: "Greater than rule message (Weight)", value: "Add products weighing at least {{conditionWeight}} on this step", kind: "text" },
          { key: "ppb.conditions.weight.lessThanOrEqualTo", label: "Less than rule message (Weight)", value: "Add products weighing maximum of {{conditionWeight}} on this step", kind: "text" },
          { key: "ppb.conditions.weight.equalTo", label: "Equal to rule message (Weight)", value: "Add products weighing {{conditionWeight}} on this step", kind: "text" },
        ],
      },
    ],
  },
};

export const CONTROL_LAYOUTS: ControlsLayout[] = [
  {
    id: "landing-page",
    label: "Landing Page Layout",
    description: "Full-page bundle controls for the Additional Configurations surface.",
    tabs: [
      {
        title: "Configuration",
        description: "Landing-page bundle behavior toggles and checkout/cart flow controls.",
        contentTitle: "Bundle Settings",
        contentDescription: "Additional bundle level settings applicable to all bundles created",
        fields: [
          { key: "landingPage.hideIrrelevantVariantImages", label: "Hide Irrelevant variant images", kind: "toggle", group: "Bundle Settings" },
          { key: "landingPage.trackInventoryOnAddToCart", label: "Track inventory on Add To Cart (in beta)", kind: "toggle", group: "Bundle Settings", description: "Know More" },
          { key: "landingPage.redirectCollectionQuickAddToBundle", label: "Redirect Collection Page 'Quick Add' to Bundle", value: "Checked", kind: "toggle", group: "Bundle Settings" },
          { key: "shared.cartMessaging.isEnabled", label: "Cart Messaging", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Edit Language" },
          { key: "shared.cartMessaging.showBundleContains", label: "Bundle Items", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows the individual items within a bundle" },
          { key: "shared.cartMessaging.showOriginalPrice", label: "Original Bundle Price", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows the retail price before bundle discount" },
          { key: "shared.cartMessaging.discountDisplay.isEnabled", label: "Discount Display", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows how much the customer is saving on the bundle" },
          {
            key: "shared.cartMessaging.discountDisplay.format",
            label: "Discount format",
            group: "Cart Messaging",
            value: "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
            kind: "select",
            options: [
              "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
              "Amount only (Eg: \"You save $73.00\")",
              "Percentage only (Eg: \"You save 19%\")",
            ],
          },
          {
            key: "landingPage.checkout.action",
            label: "Checkout Settings",
            group: "Checkout Settings",
            value: "Redirect to Checkout",
            kind: "radio",
            description: "Customize the checkout behavior for all the bundle flows",
            options: ["Redirect to Checkout", "Redirect to Cart"],
          },
          {
            key: "landingPage.checkout.providerId",
            label: "Checkout Integration",
            kind: "select",
            value: "Shopify checkout",
            group: "Checkout Settings",
            description: "Select the checkout app installed on this store.",
            options: CHECKOUT_INTEGRATION_OPTIONS,
          },
          { key: "landingPage.checkout.executeScript", label: "Execute Script", kind: "script", group: "Checkout Settings" },
          { key: "landingPage.font.customFont", label: "Custom Font", kind: "text", group: "Font Settings", description: "Note: By default, your storefront theme font will be picked." },
        ],
      },
      {
        title: "CSS & Scripts",
        description: "Theme-page custom CSS and custom scripts used by theme and integration fixes.",
        contentTitle: "CSS",
        contentDescription: "JavaScript & Selectors",
        fields: [
          { key: "landingPage.css.bundleBuilderPages", label: "Custom CSS for bundle builder pages", kind: "css", group: "CSS", description: "The CSS written here will be applied to bundle builder pages." },
          { key: "landingPage.css.bundleDummyProductPage", label: "Custom CSS for bundle dummy product page", kind: "css", group: "CSS", description: "The CSS written here will be applied to bundle dummy product page." },
          {
            key: "landingPage.css.themePages",
            label: "Custom CSS for theme pages",
            kind: "css",
            group: "CSS",
            description: "The CSS written here will have a global impact on all store pages. Please choose classes carefully.",
            note: "Use \".wpbBundle-HTML\" as parent class for giftbox builder CSS to avoid overwriting CSS throughout the site.",
          },
          { key: "landingPage.scripts.bundlePage", label: "Custom JS Bundle Script", kind: "script", group: "JavaScript & Selectors", description: "Script, written here, would be applied only on bundle pages.", note: "Paste Custom Bundle Script here" },
          { key: "landingPage.selectors.addToCartButtons", label: "Add to Cart Button Selectors", kind: "text", group: "JavaScript & Selectors" },
          { key: "landingPage.selectors.buyNowButton", label: "Buy now button", kind: "text", group: "JavaScript & Selectors" },
        ],
      },
      {
        title: "Integrations",
        description: "Callback and redirect integration settings for checkout apps, side carts, and cart drawers.",
        contentTitle: "Integrate JS with custom elements from the store theme",
        contentDescription: "The script written here will exclusively apply to theme pages and will not affect bundle pages. Please refer to our internal Notion document(Easy Bundles Custom CSS and JS Requests).",
        fields: [
          { key: "landingPage.integrations.customThemeScriptEnabled", label: "Enable Custom Theme Integration Script", kind: "toggle", group: "Integrate JS with custom elements from the store theme" },
          {
            key: "landingPage.integrations.customThemeIntegrationScript",
            label: "Custom Theme Integration Script",
            kind: "script",
            group: "Integrate JS with custom elements from the store theme",
            note: "This script runs globally on theme pages. Review and test it before enabling.",
          },
          {
            key: "landingPage.integrations.cartIntegrationEnabled",
            label: "Enable Cart Integration",
            kind: "toggle",
            group: "Integrate JS bundle script with Cart page",
            description: "Block for Hiding Qty Selector and Overwriting Remove Button for Bundle Products in Cart: Prevents individual quantity increase for bundle items and enforces removal of all bundle products if one is removed",
          },
          { key: "landingPage.integrations.cartItemSelectors", label: "Cart Item Selectors", kind: "text", group: "Integrate JS bundle script with Cart page", description: "Note: This section is only for developers." },
          { key: "landingPage.integrations.cartItemRemoveParentSelectors", label: "Cart Item Remove Parent Selectors", kind: "text", group: "Integrate JS bundle script with Cart page" },
          { key: "landingPage.integrations.cartItemRemoveSelectors", label: "Cart Item Remove Selectors", kind: "text", group: "Integrate JS bundle script with Cart page" },
          { key: "landingPage.integrations.cartItemQuantityButtonSelectors", label: "Cart Item Quantity Button Selectors", kind: "text", group: "Integrate JS bundle script with Cart page" },
          { key: "landingPage.integrations.customCartIntegrationScript", label: "Custom Cart Integration Script", kind: "script", group: "Integrate JS bundle script with Cart page" },
          { key: "landingPage.integrations.judgeMeEnabled", label: "Enable Judge Me Integration", kind: "toggle", group: "Integrate with Judge Me", description: "Show reviews on product cards through integration with judgeme" },
          { key: "landingPage.integrations.judgeMePublicToken", label: "Public token", kind: "secret", group: "Integrate with Judge Me" },
        ],
      },
    ],
  },
  {
    id: "product-page",
    label: "Product Page Layout",
    description: "Product-page bundle controls for the Additional Configurations surface.",
    tabs: [
      {
        title: "Configuration",
        description: "Product-page bundle behavior toggles and redirect controls.",
        contentTitle: "Bundle Settings",
        contentDescription: "Additional bundle level settings applicable to all bundles created",
        fields: [
          { key: "productPage.hideOutOfStockProducts", label: "Hide Out Of Stock Products", kind: "toggle", value: "Checked", group: "Bundle Settings" },
          { key: "productPage.trackInventoryOnAddToCart", label: "Track inventory on Add To Cart (in beta)", kind: "toggle", group: "Bundle Settings" },
          { key: "productPage.addBundleToCartAfterLastStepCompleted", label: "Add bundle to cart after the last step is completed", kind: "toggle", group: "Bundle Settings" },
          { key: "productPage.displayEmptyStateBoxesBasedOnBundleCondition", label: "Display empty state boxes based on bundle condition", kind: "toggle", value: "Checked", group: "Bundle Settings" },
          { key: "productPage.hideStepTitlesInCompletedState", label: "Hide Step Titles in completed state", kind: "toggle", group: "Bundle Settings" },
          { key: "productPage.addToCartWhenProductCardClicked", label: "Add to cart when product card is clicked", kind: "toggle", value: "Checked", group: "Bundle Settings" },
          { key: "productPage.redirectCollectionQuickAddToBundle", label: "Redirect Collection Page 'Quick Add' to Bundle", value: "Checked", kind: "toggle", group: "Bundle Settings" },
          { key: "shared.cartMessaging.isEnabled", label: "Cart Messaging", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Edit Language" },
          { key: "shared.cartMessaging.showBundleContains", label: "Bundle Items", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows the individual items within a bundle" },
          { key: "shared.cartMessaging.showOriginalPrice", label: "Original Bundle Price", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows the retail price before bundle discount" },
          { key: "shared.cartMessaging.discountDisplay.isEnabled", label: "Discount Display", kind: "toggle", value: "Checked", group: "Cart Messaging", description: "Shows how much the customer is saving on the bundle" },
          {
            key: "shared.cartMessaging.discountDisplay.format",
            label: "Discount format",
            group: "Cart Messaging",
            value: "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
            kind: "select",
            options: [
              "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
              "Amount only (Eg: \"You save $73.00\")",
              "Percentage only (Eg: \"You save 19%\")",
            ],
          },
          {
            key: "productPage.redirect.action",
            label: "Redirect Settings",
            group: "Redirect Settings",
            value: "Execute Default Side Cart Update",
            kind: "select",
            description: "Customize the redirect on Add to cart",
            options: ["Execute Default Side Cart Update", "Redirect to Checkout", "Redirect to Cart"],
          },
          { key: "productPage.redirect.executeScript", label: "Execute Script", kind: "script", group: "Redirect Settings" },
        ],
      },
      {
        title: "CSS & Scripts",
        description: "Product-page custom CSS, script, and selector configuration.",
        contentTitle: "CSS",
        contentDescription: "JavaScript & Selectors",
        fields: [
          { key: "productPage.css.mixAndMatchBundles", label: "Custom CSS for Mix And Match Bundles", kind: "css", group: "CSS", description: "The CSS written here will be applied to all product page bundles." },
          { key: "productPage.scripts.executeCustomScript", label: "Execute Custom Script", kind: "script", group: "JavaScript & Selectors", description: "The Script written here will be applied after product page load" },
          { key: "productPage.selectors.sideCart", label: "Side cart selector", kind: "text", group: "JavaScript & Selectors" },
          { key: "productPage.selectors.sideCartSectionId", label: "Side cart section ID", kind: "text", group: "JavaScript & Selectors" },
          { key: "productPage.selectors.cartPageItems", label: "Cart page items selector", kind: "text", group: "JavaScript & Selectors" },
          { key: "productPage.selectors.cartPageItemsSectionId", label: "Cart page items section ID", kind: "text", group: "JavaScript & Selectors" },
          { key: "productPage.selectors.sideCartOpenButton", label: "Side cart open button selector", kind: "text", group: "JavaScript & Selectors" },
          { key: "productPage.selectors.productPagePrice", label: "Product page price selector", kind: "text", group: "JavaScript & Selectors" },
        ],
      },
    ],
  },
];

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: "reviews",
    title: "Reviews",
    description: "Show social proof by displaying product ratings within your bundles.",
    cards: [
      {
        id: "judgeme",
        title: "Judge.me",
        description: "Display star ratings and reviews on your bundles",
        logoLabel: "Judge.me",
        logoUrl: "/icons/Judgeme.avif",
        status: "Guided setup",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Configure the authenticated public token in Additional Configurations.",
          "Apply any required review badge visibility override through theme-page CSS.",
        ],
      },
    ],
  },
  {
    id: "page-builders",
    title: "Page Builders",
    description: "Place Product Page and Full Page Bundles in custom storefront layouts.",
    cards: [
      {
        id: "pagefly",
        title: "PageFly",
        description: "Place bundle builders in PageFly pages and saved sections.",
        logoLabel: "PageFly",
        logoUrl: "/icons/Pagefly.avif",
        status: "Guided setup",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Use PageFly's Shopify App Block element with the Page Builder bundle block on Online Store 2.0 themes.",
          "Use the provider-neutral HTML/Liquid marker when an app block is unavailable.",
        ],
      },
      {
        id: "gempages",
        title: "GemPages",
        description: "Place bundle builders in GemPages storefront layouts.",
        logoLabel: "GemPages",
        logoUrl: "/icons/Gempages.avif",
        status: "Guided setup",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Use the GemPages Shopify App Element with the Page Builder bundle block.",
          "Use the provider-neutral Custom Code marker when an app block is unavailable.",
        ],
      },
      {
        id: "shogun",
        title: "Shogun",
        description: "Place bundle builders in Shogun product and custom layouts.",
        logoLabel: "Shogun",
        status: "Guided setup",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Use the Page Builder bundle app block with a Shopify 2.0 or existing theme layout.",
          "Use the Liquid-free HTML marker for Shogun custom layouts.",
        ],
      },
    ],
  },
  {
    id: "checkout-side-cart",
    title: "Checkout",
    description: "Use Shopify-native checkout and cart flows for bundle conversion.",
    cards: [
      {
        id: "gokwik",
        title: "GoKwik",
        description: "Use a third-party checkout handoff flow with GoKwik.",
        logoLabel: "GoKwik",
        logoUrl: "/icons/Gokwik.avif",
        status: "Supported",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Use your store's GoKwik checkout configuration and keep native fallback routing enabled.",
          "Verify callback setup for GoKwik checkout handoff in theme script tags.",
        ],
      },
      {
        id: "shopflo",
        title: "Shopflo",
        description: "Use a third-party checkout handoff flow with Shopflo.",
        logoLabel: "Shopflo",
        logoUrl: "/icons/Shopflo.avif",
        status: "Supported",
        ctaLabel: "View Setup",
        ctaType: "guide",
        guideSummary: [
          "Enable the Shopflo checkout integration and confirm SDK loading on storefront pages.",
          "Use discount-code handoff flow so order discounting continues through checkout.",
        ],
      },
    ],
  },
];

export function getIntegrationCardCount(categories: IntegrationCategory[] = INTEGRATION_CATEGORIES) {
  return categories.reduce((total, category) => total + category.cards.length, 0);
}
