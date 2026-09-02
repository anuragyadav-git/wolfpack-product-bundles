import { BundleType } from "../constants/bundle";

type JsonObject = Record<string, unknown>;
type LanguageBundleType = typeof BundleType.PRODUCT_PAGE | typeof BundleType.FULL_PAGE;

type LanguageField = {
  id: string;
  label: string;
  type: "text";
  value: string;
};

type SharedCartLabels = {
  bundleContainsLabel: string;
  bundleOriginalPriceLabel: string;
  bundleDiscountDisplayLabel: string;
};

export type SettingsLanguageDocument = {
  languageMode: "SINGLE" | "MULTIPLE";
  en: JsonObject;
  mixAndMatchTextData: Record<string, JsonObject> & { en: JsonObject };
  sharedComponents: Record<string, {
    cartAndCheckout: Record<keyof SharedCartLabels, LanguageField>;
  }> & {
    en: {
      cartAndCheckout: Record<keyof SharedCartLabels, LanguageField>;
    };
  };
} & Record<string, unknown>;

export const SETTINGS_LANGUAGE_LOCALES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "bg-BG", label: "Bulgarian (BG)" },
  { code: "ca", label: "Catalan" },
  { code: "zh-CN", label: "Chinese (CN)" },
  { code: "zh-TW", label: "Chinese (TW)" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "et", label: "Estonian" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "ka", label: "Georgian" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "he", label: "Hebrew" },
  { code: "hu", label: "Hungarian" },
  { code: "id", label: "Indonesian" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "lv", label: "Latvian" },
  { code: "lt", label: "Lithuanian" },
  { code: "nb", label: "Norwegian Bokmål" },
  { code: "pl", label: "Polish" },
  { code: "pt-BR", label: "Portuguese (BR)" },
  { code: "pt-PT", label: "Portuguese (PT)" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sr", label: "Serbian" },
  { code: "sk-SK", label: "Slovak (SK)" },
  { code: "sl-SI", label: "Slovenian (SI)" },
  { code: "es", label: "Spanish" },
  { code: "sv", label: "Swedish" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "vi", label: "Vietnamese" },
  { code: "no", label: "Norwegian" },
] as const;

const DEFAULT_SHARED_CART_LABELS: SharedCartLabels = {
  bundleContainsLabel: "Items",
  bundleOriginalPriceLabel: "Retail Price",
  bundleDiscountDisplayLabel: "You Save",
};

const FPB_DEFAULTS = {
  addToBoxButtonText: "Add To Box",
  nextButtonText: "Next",
  addToCartButtonText: "Add To Cart",
  totalLabelText: "Total",
  viewCartProductsLabel: "View Selected Products",
  discountBadgeSuffix: "off",
  cartInclusionTitle: "item(s)",
  subscriptionSelectionLabel: "Select Subscription Plan",
  noProductsAvailableText: "No Products Available",
  chooseOptionsButtonText: "Choose Options",
  loadMoreProductsButtonText: "Load More Products",
  preparingBundleLabel: "Preparing Bundle...",
  redirectingLabel: "Redirecting...",
  addedLabel: "Added",
  addButtonText: "Add",
  reviewButtonText: "Review",
  selectBundleProductsLabel: "Select Bundle Products",
  quantityLabel: "Quantity",
  clearCartModalTitle: "Are you sure?",
  clearCartModalDescription: "Are you sure you want to clear all items from your cart? This action cannot be undone...",
  clearCartButtonText: "Clear",
  clearCartCancelButtonText: "Cancel",
  clearCartConfirmButtonText: "Clear Cart",
  boxSelectionEligibilityToast: "Remove {{boxSelectionDifference}} item(s) to select this box",
  removeProductFromFooterText: "Remove This Product From {{stepName}}",
  quantityGreaterThanOrEqualTo: "Add at least {{conditionQuantity}} products on this step",
  quantityLessThanOrEqualTo: "Add a maximum of {{conditionQuantity}} products to continue",
  quantityEqualTo: "Add exactly {{conditionQuantity}} products on this step",
  amountGreaterThanOrEqualTo: "Add products worth at least {{conditionAmount}} on this step",
  amountLessThanOrEqualTo: "Add products worth maximum of {{conditionAmount}} on this step",
  amountEqualTo: "Add products worth {{conditionAmount}} on this step",
  weightGreaterThanOrEqualTo: "Add products weighing at least {{conditionWeight}} on this step",
  weightLessThanOrEqualTo: "Add products weighing maximum of {{conditionWeight}} on this step",
  weightEqualTo: "Add products weighing {{conditionWeight}} on this step",
  maxAddonProductsAllowed: "Add a maximum of {{maxAllowedAddons}} addon products on this step",
  addonProductsMandatory: "Addon product is mandatory on this step",
  mobileAddonNotification: "Additional offers to be unlocked",
};

const PPB_DEFAULTS = {
  productCardAddBtnText: "Add to Cart",
  productCardOutOfStockBtnText: "Out of Stock",
  productDetailsUpdateButtonText: "Update",
  productVariantLabelText: "Select variant",
  productAddedBtnText: "Added x{{allowedQuantity}}",
  productCardAddBtnTextInPage: "Add +",
  discountRibbonSuffix: "off",
  selectSubscriptionPlanButtonText: "Select Subscription Plan",
  boxConditionInitialTextInPage: "Select {{quantityDifference}} Items",
  bundleCartDrawerBtnTextInPage: "View Bundle Items",
  bundleCartSelectedProductsTextInPage: "Selected Products",
  subtotalLabelText: "Subtotal",
  addToCartBundleBtnText: "Add Bundle to Cart",
  footerPrevBtnText: "Prev",
  footerNextBtnText: "Next",
  footerFinishBtnText: "Done",
  noProductsAvailable: "No Products Available",
  addToCartBundleBtnLoadingText: "Adding Bundle...",
  addBundleSuccessText: "Bundle Added",
  emptyCardText: "Product",
  stepsDrawerPillText: "Show all steps",
  inventoryLimitReachedText: "No More Stock",
  boxSelectionEligibilityToastInPage: "Remove {{boxSelectionDifference}} item(s) to select this box",
  quantityGreaterThanOrEqualTo: "Add at least {{conditionQuantity}} products on this step",
  quantityLessThanOrEqualTo: "Add a maximum of {{conditionQuantity}} products to continue",
  quantityEqualTo: "Add exactly {{conditionQuantity}} products on this step",
  amountGreaterThanOrEqualTo: "Add products worth at least {{conditionAmount}} on this step",
  amountLessThanOrEqualTo: "Add products worth maximum of {{conditionAmount}} on this step",
  amountEqualTo: "Add products worth {{conditionAmount}} on this step",
  weightGreaterThanOrEqualTo: "Add products weighing at least {{conditionWeight}} on this step",
  weightLessThanOrEqualTo: "Add products weighing maximum of {{conditionWeight}} on this step",
  weightEqualTo: "Add products weighing {{conditionWeight}} on this step",
};

export const SETTINGS_LANGUAGE_BUNDLE_TYPES = [
  BundleType.PRODUCT_PAGE,
  BundleType.FULL_PAGE,
] as const;

function getField(values: Record<string, unknown>, key: string, fallback: string) {
  const value = values[key];
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function languageField(id: string, label: string, value: string): LanguageField {
  return { id, label, type: "text", value };
}

function conditionField(label: string, value: string): LanguageField {
  return languageField(label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), label, value);
}

function buildSharedCartFields(values: Record<string, unknown>) {
  return {
    bundleContainsLabel: languageField(
      "bundleContainsLabel",
      "Bundle Contains Label",
      getField(values, "shared.cartCheckout.bundleContainsLabel", DEFAULT_SHARED_CART_LABELS.bundleContainsLabel),
    ),
    bundleOriginalPriceLabel: languageField(
      "bundleOriginalPriceLabel",
      "Bundle Original Price Label",
      getField(values, "shared.cartCheckout.bundleOriginalPriceLabel", DEFAULT_SHARED_CART_LABELS.bundleOriginalPriceLabel),
    ),
    bundleDiscountDisplayLabel: languageField(
      "bundleDiscountDisplayLabel",
      "Bundle Cart Discount Display Label",
      getField(values, "shared.cartCheckout.bundleDiscountDisplayLabel", DEFAULT_SHARED_CART_LABELS.bundleDiscountDisplayLabel),
    ),
  };
}

function buildFpbLanguage(values: Record<string, unknown>) {
  const general = {
    addToBoxButtonText: languageField("addToBoxButtonText", "Add Product to Bundle Button", getField(values, "fpb.general.addToBoxButtonText", FPB_DEFAULTS.addToBoxButtonText)),
    nextButtonText: languageField("nextButtonText", "Next Button Text", getField(values, "fpb.general.nextButtonText", FPB_DEFAULTS.nextButtonText)),
    addToCartButtonText: languageField("addToCartButtonText", "Add Bundle to Cart Button", getField(values, "fpb.general.addToCartButtonText", FPB_DEFAULTS.addToCartButtonText)),
    totalLabelText: languageField("totalLabelText", "Total Label", getField(values, "fpb.general.totalLabelText", FPB_DEFAULTS.totalLabelText)),
    viewCartProductsLabel: languageField("viewCartProductsLabel", "View Cart Products Label", getField(values, "fpb.general.viewCartProductsLabel", FPB_DEFAULTS.viewCartProductsLabel)),
    discountBadgeSuffix: languageField("discountBadgeSuffix", "Discount Badge Suffix", getField(values, "fpb.general.discountBadgeSuffix", FPB_DEFAULTS.discountBadgeSuffix)),
    cartInclusionTitle: languageField("cartInclusionTitle", "Cart Inclusion Title", getField(values, "fpb.general.cartInclusionTitle", FPB_DEFAULTS.cartInclusionTitle)),
    subscriptionSelectionLabel: languageField("subscriptionSelectionLabel", "Subscription Selection Label", getField(values, "fpb.general.subscriptionSelectionLabel", FPB_DEFAULTS.subscriptionSelectionLabel)),
    noProductsAvailableText: languageField("noProductsAvailableText", "No Products Available label", getField(values, "fpb.general.noProductsAvailableText", FPB_DEFAULTS.noProductsAvailableText)),
    chooseOptionsButtonText: languageField("chooseOptionsButtonText", "Choose Options Button", getField(values, "fpb.general.chooseOptionsButtonText", FPB_DEFAULTS.chooseOptionsButtonText)),
    loadMoreProductsButtonText: languageField("loadMoreProductsButtonText", "Load More Products Button", getField(values, "fpb.general.loadMoreProductsButtonText", FPB_DEFAULTS.loadMoreProductsButtonText)),
    preparingBundleLabel: languageField("preparingBundleLabel", "Preparing Bundle Label", getField(values, "fpb.general.preparingBundleLabel", FPB_DEFAULTS.preparingBundleLabel)),
    redirectingLabel: languageField("redirectingLabel", "Redirecting label", getField(values, "fpb.general.redirectingLabel", FPB_DEFAULTS.redirectingLabel)),
    addedLabel: languageField("addedLabel", "Added Label", getField(values, "fpb.general.addedLabel", FPB_DEFAULTS.addedLabel)),
    addButtonText: languageField("addButtonText", "Add Button Text", getField(values, "fpb.general.addButtonText", FPB_DEFAULTS.addButtonText)),
    reviewButtonText: languageField("reviewButtonText", "Review Button Text", getField(values, "fpb.general.reviewButtonText", FPB_DEFAULTS.reviewButtonText)),
    selectBundleProductsLabel: languageField("selectBundleProductsLabel", "Select Bundle Products label", getField(values, "fpb.general.selectBundleProductsLabel", FPB_DEFAULTS.selectBundleProductsLabel)),
  };

  const modals = {
    quantityLabel: languageField("quantityLabel", "Quantity Label", getField(values, "fpb.modals.quantityLabel", FPB_DEFAULTS.quantityLabel)),
    clearCart: {
      title: languageField("clearCartModalTitle", "Modal - Title", getField(values, "fpb.modals.clearCartModalTitle", FPB_DEFAULTS.clearCartModalTitle)),
      description: languageField("clearCartModalDescription", "Modal - Description", getField(values, "fpb.modals.clearCartModalDescription", FPB_DEFAULTS.clearCartModalDescription)),
      clearButtonText: languageField("clearCartButtonText", "Clear Cart Button Text", getField(values, "fpb.modals.clearCartButtonText", FPB_DEFAULTS.clearCartButtonText)),
      cancelButtonText: languageField("clearCartCancelButtonText", "Modal - Cancel Button Text", getField(values, "fpb.modals.clearCartCancelButtonText", FPB_DEFAULTS.clearCartCancelButtonText)),
      confirmButtonText: languageField("clearCartConfirmButtonText", "Modal - Confirm Button Text", getField(values, "fpb.modals.clearCartConfirmButtonText", FPB_DEFAULTS.clearCartConfirmButtonText)),
    },
  };

  const conditions = {
    quantity: {
      greaterThanOrEqualTo: conditionField("Greater than rule message (Quantity)", getField(values, "fpb.conditions.quantity.greaterThanOrEqualTo", FPB_DEFAULTS.quantityGreaterThanOrEqualTo)),
      lessThanOrEqualTo: conditionField("Less than rule message (Quantity)", getField(values, "fpb.conditions.quantity.lessThanOrEqualTo", FPB_DEFAULTS.quantityLessThanOrEqualTo)),
      equalTo: conditionField("Equal to rule message (Quantity)", getField(values, "fpb.conditions.quantity.equalTo", FPB_DEFAULTS.quantityEqualTo)),
    },
    amount: {
      greaterThanOrEqualTo: conditionField("Greater than rule message (Amount)", getField(values, "fpb.conditions.amount.greaterThanOrEqualTo", FPB_DEFAULTS.amountGreaterThanOrEqualTo)),
      lessThanOrEqualTo: conditionField("Less than rule message (Amount)", getField(values, "fpb.conditions.amount.lessThanOrEqualTo", FPB_DEFAULTS.amountLessThanOrEqualTo)),
      equalTo: conditionField("Equal to rule message (Amount)", getField(values, "fpb.conditions.amount.equalTo", FPB_DEFAULTS.amountEqualTo)),
    },
    weight: {
      greaterThanOrEqualTo: conditionField("Greater than rule message (Weight)", getField(values, "fpb.conditions.weight.greaterThanOrEqualTo", FPB_DEFAULTS.weightGreaterThanOrEqualTo)),
      lessThanOrEqualTo: conditionField("Less than rule message (Weight)", getField(values, "fpb.conditions.weight.lessThanOrEqualTo", FPB_DEFAULTS.weightLessThanOrEqualTo)),
      equalTo: conditionField("Equal to rule message (Weight)", getField(values, "fpb.conditions.weight.equalTo", FPB_DEFAULTS.weightEqualTo)),
    },
  };

  return {
    landingPage: {},
    navigationSteps: {},
    productPage: {},
    reviewPage: {},
    discountRules: {},
    sortBy: {},
    conditions,
    general,
    multipleCategoriesPage: {},
    multipleCategories: {},
    addons: {
      maxAddonProductsAllowed: languageField("maxAddonProductsAllowed", "Max Addon Products Allowed message", getField(values, "fpb.addons.maxAddonProductsAllowed", FPB_DEFAULTS.maxAddonProductsAllowed)),
      addonProductsMandatory: languageField("addonProductsMandatory", "Addon Products Mandatory message", getField(values, "fpb.addons.addonProductsMandatory", FPB_DEFAULTS.addonProductsMandatory)),
      mobileAddonNotification: languageField("mobileAddonNotification", "Mobile Add On Notification", getField(values, "fpb.addons.mobileAddonNotification", FPB_DEFAULTS.mobileAddonNotification)),
    },
    modals,
    toasts: {
      boxSelectionEligibilityToast: languageField("boxSelectionEligibilityToast", "Box Selection Eligibility Toast", getField(values, "fpb.toasts.boxSelectionEligibilityToast", FPB_DEFAULTS.boxSelectionEligibilityToast)),
      removeProductFromFooterText: languageField("removeProductFromFooterText", "Remove Product from Footer Text", getField(values, "fpb.toasts.removeProductFromFooterText", FPB_DEFAULTS.removeProductFromFooterText)),
    },
  };
}

function buildPpbLanguage(values: Record<string, unknown>) {
  return {
    productCard: {
      productCardAddBtnText: languageField("productCardAddBtnText", "Product Add to Cart Button", getField(values, "ppb.productCard.productCardAddBtnText", PPB_DEFAULTS.productCardAddBtnText)),
      productCardOutOfStockBtnText: languageField("productCardOutOfStockBtnText", "Product Out of Stock Button", getField(values, "ppb.productCard.productCardOutOfStockBtnText", PPB_DEFAULTS.productCardOutOfStockBtnText)),
      productVariantLabelText: languageField("productVariantLabelText", "Product Variant Label", getField(values, "ppb.productCard.productVariantLabelText", PPB_DEFAULTS.productVariantLabelText)),
      productAddedBtnText: languageField("productAddedBtnText", "Product Added label", getField(values, "ppb.productCard.productAddedBtnText", PPB_DEFAULTS.productAddedBtnText)),
      productCardAddBtnText_inPage: languageField("productCardAddBtnText_inPage", "Inline Product - Add Button Text", getField(values, "ppb.productCard.productCardAddBtnText_inPage", PPB_DEFAULTS.productCardAddBtnTextInPage)),
    },
    general: {
      discountRibbonSuffix: languageField("discountRibbonSuffix", "Discount Badge Suffix", getField(values, "ppb.general.discountRibbonSuffix", PPB_DEFAULTS.discountRibbonSuffix)),
      selectSubscriptionPlanButtonText: languageField("selectSubscriptionPlanButtonText", "Subscription Selection Label", getField(values, "ppb.general.selectSubscriptionPlanButtonText", PPB_DEFAULTS.selectSubscriptionPlanButtonText)),
      boxConditionInitialText_inPage: languageField("boxConditionInitialText_inPage", "Inline Add To Cart Button - Quantity Selection message", getField(values, "ppb.general.boxConditionInitialText_inPage", PPB_DEFAULTS.boxConditionInitialTextInPage)),
      bundleCartDrawerBtnText_inPage: languageField("bundleCartDrawerBtnText_inPage", "Inline Cart Drawer Button Text", getField(values, "ppb.general.bundleCartDrawerBtnText_inPage", PPB_DEFAULTS.bundleCartDrawerBtnTextInPage)),
      bundleCartSelectedProductsText_inPage: languageField("bundleCartSelectedProductsText_inPage", "Inline Cart Selected Products Label", getField(values, "ppb.general.bundleCartSelectedProductsText_inPage", PPB_DEFAULTS.bundleCartSelectedProductsTextInPage)),
      subtotalLabelText: languageField("subtotalLabelText", "Subtotal Text", getField(values, "ppb.general.subtotalLabelText", PPB_DEFAULTS.subtotalLabelText)),
      addBundleToCartBtnText: languageField("addBundleToCartBtnText", "Add Bundle Cart label", getField(values, "ppb.general.addBundleToCartBtnText", PPB_DEFAULTS.addToCartBundleBtnText)),
      noProductsAvailable: languageField("noProductsAvailable", "No Products Available label", getField(values, "ppb.general.noProductsAvailable", PPB_DEFAULTS.noProductsAvailable)),
      addToCartBundleBtnLoadingText: languageField("addToCartBundleBtnLoadingText", "Add Bundle Loading label", getField(values, "ppb.general.addToCartBundleBtnLoadingText", PPB_DEFAULTS.addToCartBundleBtnLoadingText)),
      addBundleSuccessText: languageField("addBundleSuccessText", "Add Bundle Success label", getField(values, "ppb.general.addBundleSuccessText", PPB_DEFAULTS.addBundleSuccessText)),
      emptyCardText: languageField("emptyCardText", "Add Empty Product Card Text", getField(values, "ppb.general.emptyCardText", PPB_DEFAULTS.emptyCardText)),
      stepsDrawerPillText: languageField("stepsDrawerPillText", "Steps Drawer Pill Text", getField(values, "ppb.general.stepsDrawerPillText", PPB_DEFAULTS.stepsDrawerPillText)),
      inventoryLimitReachedText: languageField("inventoryLimitReachedText", "Inventory Limit Reached Label", getField(values, "ppb.general.inventoryLimitReachedText", PPB_DEFAULTS.inventoryLimitReachedText)),
      boxSelectionEligibilityToast_inPage: languageField("boxSelectionEligibilityToast_inPage", "Box Selection Eligibility Toast", getField(values, "ppb.general.boxSelectionEligibilityToast_inPage", PPB_DEFAULTS.boxSelectionEligibilityToastInPage)),
    },
    footer: {
      footerPrevBtnText: languageField("footerPrevBtnText", "Footer Previous Button", getField(values, "ppb.footer.footerPrevBtnText", PPB_DEFAULTS.footerPrevBtnText)),
      footerNextBtnText: languageField("footerNextBtnText", "Footer Next Button", getField(values, "ppb.footer.footerNextBtnText", PPB_DEFAULTS.footerNextBtnText)),
      footerFinishBtnText: languageField("footerFinishBtnText", "Footer Finish Button", getField(values, "ppb.footer.footerFinishBtnText", PPB_DEFAULTS.footerFinishBtnText)),
    },
    conditions: {
      amount: {
        greaterThanOrEqualTo: conditionField("Greater than rule message (Amount)", getField(values, "ppb.conditions.amount.greaterThanOrEqualTo", PPB_DEFAULTS.amountGreaterThanOrEqualTo)),
        lessThanOrEqualTo: conditionField("Less than rule message (Amount)", getField(values, "ppb.conditions.amount.lessThanOrEqualTo", PPB_DEFAULTS.amountLessThanOrEqualTo)),
        equalTo: conditionField("Equal to rule message (Amount)", getField(values, "ppb.conditions.amount.equalTo", PPB_DEFAULTS.amountEqualTo)),
      },
      quantity: {
        greaterThanOrEqualTo: conditionField("Greater than rule message (Quantity)", getField(values, "ppb.conditions.quantity.greaterThanOrEqualTo", PPB_DEFAULTS.quantityGreaterThanOrEqualTo)),
        lessThanOrEqualTo: conditionField("Less than rule message (Quantity)", getField(values, "ppb.conditions.quantity.lessThanOrEqualTo", PPB_DEFAULTS.quantityLessThanOrEqualTo)),
        equalTo: conditionField("Equal to rule message (Quantity)", getField(values, "ppb.conditions.quantity.equalTo", PPB_DEFAULTS.quantityEqualTo)),
      },
      weight: {
        greaterThanOrEqualTo: conditionField("Greater than rule message (Weight)", getField(values, "ppb.conditions.weight.greaterThanOrEqualTo", PPB_DEFAULTS.weightGreaterThanOrEqualTo)),
        lessThanOrEqualTo: conditionField("Less than rule message (Weight)", getField(values, "ppb.conditions.weight.lessThanOrEqualTo", PPB_DEFAULTS.weightLessThanOrEqualTo)),
        equalTo: conditionField("Equal to rule message (Weight)", getField(values, "ppb.conditions.weight.equalTo", PPB_DEFAULTS.weightEqualTo)),
      },
    },
  };
}

function getSharedCartLabels(sharedCartAndCheckout: Record<keyof SharedCartLabels, LanguageField>): SharedCartLabels {
  return {
    bundleContainsLabel: sharedCartAndCheckout.bundleContainsLabel.value,
    bundleOriginalPriceLabel: sharedCartAndCheckout.bundleOriginalPriceLabel.value,
    bundleDiscountDisplayLabel: sharedCartAndCheckout.bundleDiscountDisplayLabel.value,
  };
}

export function buildPpbCustomTextSettings(ppbLanguage: JsonObject) {
  const productCard = ppbLanguage.productCard as Record<string, LanguageField>;
  const general = ppbLanguage.general as Record<string, LanguageField>;
  const footer = ppbLanguage.footer as Record<string, LanguageField>;
  const conditions = ppbLanguage.conditions as JsonObject;

  return {
    productCardAddBtnText: productCard.productCardAddBtnText.value,
    productCardOutOfStockBtnText: productCard.productCardOutOfStockBtnText.value,
    productVariantLabelText: productCard.productVariantLabelText.value,
    footerPrevBtnText: footer.footerPrevBtnText.value,
    footerNextBtnText: footer.footerNextBtnText.value,
    footerFinishBtnText: footer.footerFinishBtnText.value,
    addToCartBundleBtnText: general.addBundleToCartBtnText.value,
    subtotalLabelText: general.subtotalLabelText.value,
    addToCartBundleBtnLoadingText: general.addToCartBundleBtnLoadingText.value,
    addBundleSuccessText: general.addBundleSuccessText.value,
    noProductsAvailable: general.noProductsAvailable.value,
    inventoryLimitReachedText: general.inventoryLimitReachedText.value,
    emptyCardText: general.emptyCardText.value,
    conditions,
    boxSelectionEligibilityToast_inPage: general.boxSelectionEligibilityToast_inPage.value,
    productCardAddBtnText_inPage: productCard.productCardAddBtnText_inPage.value,
    discountAppliedPillText_inPage: "You're saving {{PRICE_DIFF}}",
    subtotalLabelText_inPage: general.subtotalLabelText.value,
    boxConditionInitialText_inPage: general.boxConditionInitialText_inPage.value,
    productAddedBtnText: productCard.productAddedBtnText.value,
    bundleCartDrawerBtnText_inPage: general.bundleCartDrawerBtnText_inPage.value,
    bundleCartSelectedProductsText_inPage: general.bundleCartSelectedProductsText_inPage.value,
    discountRibbonSuffix: general.discountRibbonSuffix.value,
    selectSubscriptionPlanButtonText: general.selectSubscriptionPlanButtonText.value,
    stepsDrawerPillText: general.stepsDrawerPillText.value,
    defaultProductUnavailableBtnText: productCard.productCardOutOfStockBtnText.value,
  };
}

function buildFpbTextOverrides(fpbLanguage: JsonObject) {
  const general = fpbLanguage.general as Record<string, LanguageField>;
  const modals = fpbLanguage.modals as Record<string, unknown>;
  const clearCart = modals.clearCart as Record<string, LanguageField>;
  const toasts = fpbLanguage.toasts as Record<string, LanguageField>;
  const addons = fpbLanguage.addons as Record<string, LanguageField>;
  const conditions = fpbLanguage.conditions as JsonObject;
  const quantityConditions = conditions.quantity as Record<string, LanguageField>;
  const amountConditions = conditions.amount as Record<string, LanguageField>;
  const weightConditions = conditions.weight as Record<string, LanguageField>;
  return {
    productAddButton: general.addToBoxButtonText.value,
    addToCartButton: general.addToCartButtonText.value,
    nextButton: general.nextButtonText.value,
    noProductsAvailable: general.noProductsAvailableText.value,
    chooseOptionsButton: general.chooseOptionsButtonText.value,
    loadMoreProductsButton: general.loadMoreProductsButtonText.value,
    addingToCart: general.preparingBundleLabel.value,
    includedBadge: general.addedLabel.value,
    reviewButton: general.reviewButtonText.value,
    totalLabelText: general.totalLabelText.value,
    viewCartProductsLabel: general.viewCartProductsLabel.value,
    discountBadgeSuffix: general.discountBadgeSuffix.value,
    cartInclusionTitle: general.cartInclusionTitle.value,
    subscriptionSelectionLabel: general.subscriptionSelectionLabel.value,
    redirectingLabel: general.redirectingLabel.value,
    addedLabel: general.addedLabel.value,
    addButtonText: general.addButtonText.value,
    selectBundleProductsLabel: general.selectBundleProductsLabel.value,
    quantityLabel: (modals.quantityLabel as LanguageField).value,
    clearCartModalTitle: clearCart.title.value,
    clearCartModalDescription: clearCart.description.value,
    clearCartButtonText: clearCart.clearButtonText.value,
    clearCartCancelButtonText: clearCart.cancelButtonText.value,
    clearCartConfirmButtonText: clearCart.confirmButtonText.value,
    boxSelectionEligibilityToast: toasts.boxSelectionEligibilityToast.value,
    removeProductFromFooterText: toasts.removeProductFromFooterText.value,
    maxAddonProductsAllowed: addons.maxAddonProductsAllowed.value,
    addonProductsMandatory: addons.addonProductsMandatory.value,
    mobileAddonNotification: addons.mobileAddonNotification.value,
    conditionQuantityGreaterThanOrEqualTo: quantityConditions.greaterThanOrEqualTo.value,
    conditionQuantityLessThanOrEqualTo: quantityConditions.lessThanOrEqualTo.value,
    conditionQuantityEqualTo: quantityConditions.equalTo.value,
    conditionAmountGreaterThanOrEqualTo: amountConditions.greaterThanOrEqualTo.value,
    conditionAmountLessThanOrEqualTo: amountConditions.lessThanOrEqualTo.value,
    conditionAmountEqualTo: amountConditions.equalTo.value,
    conditionWeightGreaterThanOrEqualTo: weightConditions.greaterThanOrEqualTo.value,
    conditionWeightLessThanOrEqualTo: weightConditions.lessThanOrEqualTo.value,
    conditionWeightEqualTo: weightConditions.equalTo.value,
  };
}

function buildPpbTextOverrides(customTextSettings: Record<string, unknown>) {
  const conditions = customTextSettings.conditions as JsonObject | undefined;
  const quantityConditions = conditions?.quantity as Record<string, LanguageField> | undefined;
  const amountConditions = conditions?.amount as Record<string, LanguageField> | undefined;
  const weightConditions = conditions?.weight as Record<string, LanguageField> | undefined;

  return {
    productCardAddButton: String(customTextSettings.productCardAddBtnText),
    productCardOutOfStockButton: String(customTextSettings.productCardOutOfStockBtnText),
    productCardInlineAddButton: String(customTextSettings.productCardAddBtnText_inPage),
    productDetailsUpdateButton: PPB_DEFAULTS.productDetailsUpdateButtonText,
    productVariantLabel: String(customTextSettings.productVariantLabelText),
    addToCartButton: String(customTextSettings.addToCartBundleBtnText),
    addingToCart: String(customTextSettings.addToCartBundleBtnLoadingText),
    addBundleSuccess: String(customTextSettings.addBundleSuccessText),
    nextButton: String(customTextSettings.footerNextBtnText),
    doneButton: String(customTextSettings.footerFinishBtnText),
    includedBadge: String(customTextSettings.productAddedBtnText),
    noProductsAvailable: String(customTextSettings.noProductsAvailable),
    viewBundleItems: String(customTextSettings.bundleCartDrawerBtnText_inPage),
    bundleCartSelectedProductsText: String(customTextSettings.bundleCartSelectedProductsText_inPage),
    subtotalLabelText: String(customTextSettings.subtotalLabelText),
    previousButton: String(customTextSettings.footerPrevBtnText),
    discountRibbonSuffix: String(customTextSettings.discountRibbonSuffix),
    subscriptionSelectionLabel: String(customTextSettings.selectSubscriptionPlanButtonText),
    boxConditionInitialText: String(customTextSettings.boxConditionInitialText_inPage),
    emptyCardText: String(customTextSettings.emptyCardText),
    stepsDrawerPillText: String(customTextSettings.stepsDrawerPillText),
    inventoryLimitReachedText: String(customTextSettings.inventoryLimitReachedText),
    boxSelectionEligibilityToast_inPage: String(customTextSettings.boxSelectionEligibilityToast_inPage),
    conditionQuantityGreaterThanOrEqualTo: String(quantityConditions?.greaterThanOrEqualTo?.value),
    conditionQuantityLessThanOrEqualTo: String(quantityConditions?.lessThanOrEqualTo?.value),
    conditionQuantityEqualTo: String(quantityConditions?.equalTo?.value),
    conditionAmountGreaterThanOrEqualTo: String(amountConditions?.greaterThanOrEqualTo?.value),
    conditionAmountLessThanOrEqualTo: String(amountConditions?.lessThanOrEqualTo?.value),
    conditionAmountEqualTo: String(amountConditions?.equalTo?.value),
    conditionWeightGreaterThanOrEqualTo: String(weightConditions?.greaterThanOrEqualTo?.value),
    conditionWeightLessThanOrEqualTo: String(weightConditions?.lessThanOrEqualTo?.value),
    conditionWeightEqualTo: String(weightConditions?.equalTo?.value),
  };
}

export function buildSettingsLanguageRuntime(payload: Record<string, unknown>) {
  const submittedLocales = payload.localeFieldValues && typeof payload.localeFieldValues === "object"
    ? payload.localeFieldValues as Record<string, Record<string, unknown>>
    : {};
  const localeValues = Object.keys(submittedLocales).length > 0 ? submittedLocales : { en: {} };
  if (!localeValues.en) localeValues.en = {};
  const languageMode = payload.languageMode === "SINGLE" ? "SINGLE" : "MULTIPLE";
  const fpbLocales: Record<string, JsonObject> = {};
  const ppbLocales: Record<string, JsonObject> = {};
  const sharedLocales: Record<string, { cartAndCheckout: Record<keyof SharedCartLabels, LanguageField> }> = {};
  for (const [locale, values] of Object.entries(localeValues)) {
    fpbLocales[locale] = buildFpbLanguage(values);
    ppbLocales[locale] = buildPpbLanguage(values);
    sharedLocales[locale] = { cartAndCheckout: buildSharedCartFields(values) };
  }
  const settingsLanguage = {
    languageMode,
    ...fpbLocales,
    mixAndMatchTextData: ppbLocales,
    sharedComponents: sharedLocales,
  } as SettingsLanguageDocument;
  const englishGeneral = settingsLanguage.en.general as Record<string, LanguageField>;

  return {
    buttonAddToCartText: englishGeneral.addToBoxButtonText.value,
    settingsLanguage,
  };
}

function resolveLocale(document: SettingsLanguageDocument, requestedLocale?: string | null) {
  if (document.languageMode === "SINGLE") return "en";
  const requested = String(requestedLocale ?? "").trim().toLowerCase();
  if (!requested) return "en";
  const locales = Object.keys(document.mixAndMatchTextData);
  const exact = locales.find((locale) => locale.toLowerCase() === requested);
  if (exact) return exact;
  const base = requested.split("-")[0];
  return locales.find((locale) => locale.toLowerCase() === base) ?? "en";
}

export function removeSettingsLanguageLocale(document: SettingsLanguageDocument, locale: string) {
  if (locale === "en") return document;
  const { [locale]: _removedFpb, ...fpbRoots } = document;
  const { [locale]: _removedPpb, ...mixAndMatchTextData } = document.mixAndMatchTextData;
  const { [locale]: _removedShared, ...sharedComponents } = document.sharedComponents;
  return { ...fpbRoots, mixAndMatchTextData, sharedComponents } as SettingsLanguageDocument;
}

function collectFieldValues(target: Record<string, string>, prefix: string, value: unknown) {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.value === "string") {
    target[prefix] = record.value;
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    collectFieldValues(target, prefix ? `${prefix}.${key}` : key, child);
  }
}

function isSettingsLanguageDocument(value: unknown): value is SettingsLanguageDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Record<string, unknown>;
  const mixAndMatchTextData = document.mixAndMatchTextData;
  const sharedComponents = document.sharedComponents;
  return (document.languageMode === "SINGLE" || document.languageMode === "MULTIPLE")
    && Boolean(document.en && typeof document.en === "object")
    && Boolean(mixAndMatchTextData && typeof mixAndMatchTextData === "object" && "en" in mixAndMatchTextData)
    && Boolean(sharedComponents && typeof sharedComponents === "object" && "en" in sharedComponents);
}

export function buildSettingsLanguageFormState(settingsLanguage: unknown) {
  const document = isSettingsLanguageDocument(settingsLanguage)
    ? settingsLanguage
    : buildSettingsLanguageRuntime({ languageMode: "MULTIPLE", localeFieldValues: { en: {} } }).settingsLanguage;
  const locales = Object.keys(document.mixAndMatchTextData);
  const currentDefaults = buildSettingsLanguageRuntime({
    languageMode: document.languageMode,
    localeFieldValues: Object.fromEntries(locales.map((locale) => [locale, {}])),
  }).settingsLanguage;
  const localeFieldValues: Record<string, Record<string, string>> = {};
  for (const locale of locales) {
    const values: Record<string, string> = {};
    collectFieldValues(values, "fpb", currentDefaults[locale]);
    collectFieldValues(values, "ppb", currentDefaults.mixAndMatchTextData[locale]);
    collectFieldValues(values, "shared", currentDefaults.sharedComponents[locale]);
    collectFieldValues(values, "fpb", document[locale]);
    collectFieldValues(values, "ppb", document.mixAndMatchTextData[locale]);
    collectFieldValues(values, "shared", document.sharedComponents[locale]);
    for (const [key, value] of Object.entries({ ...values })) {
      if (key.startsWith("shared.cartAndCheckout.")) {
        values[key.replace("shared.cartAndCheckout.", "shared.cartCheckout.")] = value;
        delete values[key];
      }
    }
    const clearCartAliases: Record<string, string> = {
      "fpb.modals.clearCart.title": "fpb.modals.clearCartModalTitle",
      "fpb.modals.clearCart.description": "fpb.modals.clearCartModalDescription",
      "fpb.modals.clearCart.clearButtonText": "fpb.modals.clearCartButtonText",
      "fpb.modals.clearCart.cancelButtonText": "fpb.modals.clearCartCancelButtonText",
      "fpb.modals.clearCart.confirmButtonText": "fpb.modals.clearCartConfirmButtonText",
    };
    for (const [source, target] of Object.entries(clearCartAliases)) {
      if (values[source] !== undefined) values[target] = values[source];
      delete values[source];
    }
    localeFieldValues[locale] = values;
  }
  return { languageMode: document.languageMode, localeFieldValues };
}

export function buildSettingsLanguageResponse(settingsLanguage: unknown, bundleType: LanguageBundleType | string, requestedLocale?: string | null) {
  const savedDocument = isSettingsLanguageDocument(settingsLanguage)
    ? settingsLanguage
    : buildSettingsLanguageRuntime({}).settingsLanguage;
  const document = buildSettingsLanguageRuntime(
    buildSettingsLanguageFormState(savedDocument),
  ).settingsLanguage;
  const activeLocale = resolveLocale(document, requestedLocale);
  const fpbLocale = document[activeLocale] as JsonObject;
  const ppbLocale = document.mixAndMatchTextData[activeLocale];
  const sharedCartAndCheckout = document.sharedComponents[activeLocale].cartAndCheckout;
  const sharedCartLabels = getSharedCartLabels(sharedCartAndCheckout);
  const ppbCustomTextSettings = buildPpbCustomTextSettings(ppbLocale);
  const normalizedBundleType = bundleType === BundleType.FULL_PAGE ? BundleType.FULL_PAGE : BundleType.PRODUCT_PAGE;
  const textOverrides = normalizedBundleType === BundleType.FULL_PAGE
    ? buildFpbTextOverrides(fpbLocale)
    : buildPpbTextOverrides(ppbCustomTextSettings);

  return {
    bundleType: normalizedBundleType,
    languageMode: document.languageMode,
    activeLocale,
    languageData: document,
    activeLanguageData: normalizedBundleType === BundleType.FULL_PAGE
      ? fpbLocale
      : ppbLocale,
    fpbLanguageData: { ...fpbLocale, sharedComponents: document.sharedComponents[activeLocale] },
    ppbCustomTextSettings,
    sharedCartLabels,
    textOverrides,
  };
}
