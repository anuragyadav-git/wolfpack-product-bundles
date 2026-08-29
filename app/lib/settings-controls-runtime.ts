import { BundleType } from "../constants/bundle";
import {
  CHECKOUT_INTEGRATION_PROVIDER_LABELS,
  normalizeCheckoutIntegrationProvider,
  type CheckoutIntegrationProviderId,
} from "./checkout-integrations";
import { processCss } from "./css-sanitizer";

export const SETTINGS_CONTROLS_SCHEMA_VERSION = 1 as const;
export const SETTINGS_CONTROLS_BUNDLE_TYPES = [BundleType.PRODUCT_PAGE, BundleType.FULL_PAGE] as const;

type ControlsPayload = Record<string, unknown>;
export type ControlsRedirectAction = "side_cart" | "checkout" | "cart";

export type BundleCartLineMessagingRuntime = {
  isEnabled: boolean;
  showBundleContains: boolean;
  showOriginalPrice: boolean;
  discountDisplay: {
    isEnabled: boolean;
    format: "amount_percentage" | "amount_only" | "percentage_only";
  };
};

export type SettingsControlsRuntime = {
  schemaVersion: typeof SETTINGS_CONTROLS_SCHEMA_VERSION;
  shared: { cartMessaging: BundleCartLineMessagingRuntime };
  landingPage: {
    hideIrrelevantVariantImages: boolean;
    trackInventoryOnAddToCart: boolean;
    redirectCollectionQuickAddToBundle: boolean;
    checkout: {
      action: Exclude<ControlsRedirectAction, "side_cart">;
      providerId: CheckoutIntegrationProviderId;
      executeScript: string;
    };
    font: { customFont: string };
    css: { bundleBuilderPages: string; bundleDummyProductPage: string; themePages: string };
    scripts: { bundlePage: string };
    selectors: { addToCartButtons: string; buyNowButton: string };
    integrations: {
      customThemeScriptEnabled: boolean;
      customThemeIntegrationScript: string;
      cartIntegrationEnabled: boolean;
      cartItemSelectors: string;
      cartItemRemoveParentSelectors: string;
      cartItemRemoveSelectors: string;
      cartItemQuantityButtonSelectors: string;
      customCartIntegrationScript: string;
      judgeMeEnabled: boolean;
      judgeMePublicToken: string;
    };
  };
  productPage: {
    hideOutOfStockProducts: boolean;
    trackInventoryOnAddToCart: boolean;
    addBundleToCartAfterLastStepCompleted: boolean;
    showCompareAtPrices: boolean;
    displayEmptyStateBoxesBasedOnBundleCondition: boolean;
    hideStepTitlesInCompletedState: boolean;
    validateConditionsBeforeAddToCart: boolean;
    addToCartWhenProductCardClicked: boolean;
    redirectCollectionQuickAddToBundle: boolean;
    redirect: { action: ControlsRedirectAction; executeScript: string };
    css: { mixAndMatchBundles: string };
    scripts: { executeCustomScript: string };
    selectors: {
      sideCart: string;
      sideCartSectionId: string;
      cartPageItems: string;
      cartPageItemsSectionId: string;
      sideCartOpenButton: string;
      productPagePrice: string;
    };
  };
};

export type SettingsControlsRuntimeResult = {
  settingsControls: SettingsControlsRuntime;
  bundleCartLineMessaging: BundleCartLineMessagingRuntime;
  fullPageCustomCss: string | null;
  productPageCustomCss: string | null;
};

const textValue = (payload: ControlsPayload, key: string) => String(payload[key] ?? "").trim();
const cssValue = (payload: ControlsPayload, key: string) => (
  processCss(textValue(payload, key)).sanitizedCss
);

function booleanValue(payload: ControlsPayload, key: string, fallback = false) {
  const raw = payload[key];
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    if (normalized === "checked" || normalized === "true") return true;
    if (normalized === "" || normalized === "unchecked" || normalized === "false") return false;
  }
  return fallback;
}

function discountFormat(payload: ControlsPayload): BundleCartLineMessagingRuntime["discountDisplay"]["format"] {
  const selected = textValue(payload, "shared.cartMessaging.discountDisplay.format");
  if (selected.includes("Amount only")) return "amount_only";
  if (selected.includes("Percentage only")) return "percentage_only";
  return "amount_percentage";
}

function productRedirect(payload: ControlsPayload): ControlsRedirectAction {
  const selected = textValue(payload, "productPage.redirect.action");
  if (selected === "Redirect to Checkout") return "checkout";
  if (selected === "Redirect to Cart") return "cart";
  return "side_cart";
}

function joinCss(parts: string[]) {
  return parts.filter(Boolean).join("\n\n") || null;
}

export function buildSettingsControlsRuntime(payload: ControlsPayload): SettingsControlsRuntimeResult {
  const cartMessaging: BundleCartLineMessagingRuntime = {
    isEnabled: booleanValue(payload, "shared.cartMessaging.isEnabled", true),
    showBundleContains: booleanValue(payload, "shared.cartMessaging.showBundleContains", true),
    showOriginalPrice: booleanValue(payload, "shared.cartMessaging.showOriginalPrice", true),
    discountDisplay: {
      isEnabled: booleanValue(payload, "shared.cartMessaging.discountDisplay.isEnabled", true),
      format: discountFormat(payload),
    },
  };

  const settingsControls: SettingsControlsRuntime = {
    schemaVersion: SETTINGS_CONTROLS_SCHEMA_VERSION,
    shared: { cartMessaging },
    landingPage: {
      hideIrrelevantVariantImages: booleanValue(payload, "landingPage.hideIrrelevantVariantImages"),
      trackInventoryOnAddToCart: booleanValue(payload, "landingPage.trackInventoryOnAddToCart"),
      redirectCollectionQuickAddToBundle: booleanValue(payload, "landingPage.redirectCollectionQuickAddToBundle", true),
      checkout: {
        action: textValue(payload, "landingPage.checkout.action") === "Redirect to Cart" ? "cart" : "checkout",
        providerId: normalizeCheckoutIntegrationProvider(textValue(payload, "landingPage.checkout.providerId")),
        executeScript: textValue(payload, "landingPage.checkout.executeScript"),
      },
      font: { customFont: textValue(payload, "landingPage.font.customFont") },
      css: {
        bundleBuilderPages: cssValue(payload, "landingPage.css.bundleBuilderPages"),
        bundleDummyProductPage: cssValue(payload, "landingPage.css.bundleDummyProductPage"),
        themePages: cssValue(payload, "landingPage.css.themePages"),
      },
      scripts: { bundlePage: textValue(payload, "landingPage.scripts.bundlePage") },
      selectors: {
        addToCartButtons: textValue(payload, "landingPage.selectors.addToCartButtons"),
        buyNowButton: textValue(payload, "landingPage.selectors.buyNowButton"),
      },
      integrations: {
        customThemeScriptEnabled: booleanValue(payload, "landingPage.integrations.customThemeScriptEnabled"),
        customThemeIntegrationScript: textValue(payload, "landingPage.integrations.customThemeIntegrationScript"),
        cartIntegrationEnabled: booleanValue(payload, "landingPage.integrations.cartIntegrationEnabled"),
        cartItemSelectors: textValue(payload, "landingPage.integrations.cartItemSelectors"),
        cartItemRemoveParentSelectors: textValue(payload, "landingPage.integrations.cartItemRemoveParentSelectors"),
        cartItemRemoveSelectors: textValue(payload, "landingPage.integrations.cartItemRemoveSelectors"),
        cartItemQuantityButtonSelectors: textValue(payload, "landingPage.integrations.cartItemQuantityButtonSelectors"),
        customCartIntegrationScript: textValue(payload, "landingPage.integrations.customCartIntegrationScript"),
        judgeMeEnabled: booleanValue(payload, "landingPage.integrations.judgeMeEnabled"),
        judgeMePublicToken: textValue(payload, "landingPage.integrations.judgeMePublicToken"),
      },
    },
    productPage: {
      hideOutOfStockProducts: booleanValue(payload, "productPage.hideOutOfStockProducts", true),
      trackInventoryOnAddToCart: booleanValue(payload, "productPage.trackInventoryOnAddToCart"),
      addBundleToCartAfterLastStepCompleted: booleanValue(payload, "productPage.addBundleToCartAfterLastStepCompleted"),
      showCompareAtPrices: booleanValue(payload, "productPage.showCompareAtPrices"),
      displayEmptyStateBoxesBasedOnBundleCondition: booleanValue(payload, "productPage.displayEmptyStateBoxesBasedOnBundleCondition", true),
      hideStepTitlesInCompletedState: booleanValue(payload, "productPage.hideStepTitlesInCompletedState"),
      validateConditionsBeforeAddToCart: booleanValue(payload, "productPage.validateConditionsBeforeAddToCart", true),
      addToCartWhenProductCardClicked: booleanValue(payload, "productPage.addToCartWhenProductCardClicked", true),
      redirectCollectionQuickAddToBundle: booleanValue(payload, "productPage.redirectCollectionQuickAddToBundle", true),
      redirect: {
        action: productRedirect(payload),
        executeScript: textValue(payload, "productPage.redirect.executeScript"),
      },
      css: { mixAndMatchBundles: cssValue(payload, "productPage.css.mixAndMatchBundles") },
      scripts: { executeCustomScript: textValue(payload, "productPage.scripts.executeCustomScript") },
      selectors: {
        sideCart: textValue(payload, "productPage.selectors.sideCart"),
        sideCartSectionId: textValue(payload, "productPage.selectors.sideCartSectionId"),
        cartPageItems: textValue(payload, "productPage.selectors.cartPageItems"),
        cartPageItemsSectionId: textValue(payload, "productPage.selectors.cartPageItemsSectionId"),
        sideCartOpenButton: textValue(payload, "productPage.selectors.sideCartOpenButton"),
        productPagePrice: textValue(payload, "productPage.selectors.productPagePrice"),
      },
    },
  };

  return {
    settingsControls,
    bundleCartLineMessaging: cartMessaging,
    fullPageCustomCss: null,
    productPageCustomCss: joinCss([settingsControls.productPage.css.mixAndMatchBundles]),
  };
}

export function buildSettingsControlsResponse(
  settingsControls: unknown,
  bundleType: BundleType.PRODUCT_PAGE | BundleType.FULL_PAGE,
) {
  const candidate = settingsControls
    && typeof settingsControls === "object"
    && (settingsControls as Partial<SettingsControlsRuntime>).schemaVersion === SETTINGS_CONTROLS_SCHEMA_VERSION
    ? settingsControls as SettingsControlsRuntime
    : buildSettingsControlsRuntime({}).settingsControls;
  const runtime: SettingsControlsRuntime = {
    ...candidate,
    landingPage: {
      ...candidate.landingPage,
      css: {
        bundleBuilderPages: processCss(String(candidate.landingPage.css?.bundleBuilderPages ?? "")).sanitizedCss,
        bundleDummyProductPage: processCss(String(candidate.landingPage.css?.bundleDummyProductPage ?? "")).sanitizedCss,
        themePages: processCss(String(candidate.landingPage.css?.themePages ?? "")).sanitizedCss,
      },
    },
    productPage: {
      ...candidate.productPage,
      css: {
        mixAndMatchBundles: processCss(String(candidate.productPage.css?.mixAndMatchBundles ?? "")).sanitizedCss,
      },
    },
  };

  return {
    schemaVersion: SETTINGS_CONTROLS_SCHEMA_VERSION,
    bundleType,
    settingsControls: runtime,
    activeControls: bundleType === BundleType.FULL_PAGE ? runtime.landingPage : runtime.productPage,
  };
}

const checkedValue = (enabled: boolean) => enabled ? "Checked" : "";

export function buildSettingsControlsFormValues(runtime: SettingsControlsRuntime) {
  const cart = runtime.shared.cartMessaging;
  const landing = runtime.landingPage;
  const product = runtime.productPage;
  const discountFormat = {
    amount_percentage: "Amount and percentage (Eg: \"You save $73.00 (19%)\")",
    amount_only: "Amount only (Eg: \"You save $73.00\")",
    percentage_only: "Percentage only (Eg: \"You save 19%\")",
  }[cart.discountDisplay.format];

  return {
    "shared.cartMessaging.isEnabled": checkedValue(cart.isEnabled),
    "shared.cartMessaging.showBundleContains": checkedValue(cart.showBundleContains),
    "shared.cartMessaging.showOriginalPrice": checkedValue(cart.showOriginalPrice),
    "shared.cartMessaging.discountDisplay.isEnabled": checkedValue(cart.discountDisplay.isEnabled),
    "shared.cartMessaging.discountDisplay.format": discountFormat,
    "landingPage.hideIrrelevantVariantImages": checkedValue(landing.hideIrrelevantVariantImages),
    "landingPage.trackInventoryOnAddToCart": checkedValue(landing.trackInventoryOnAddToCart),
    "landingPage.redirectCollectionQuickAddToBundle": checkedValue(landing.redirectCollectionQuickAddToBundle),
    "landingPage.checkout.action": landing.checkout.action === "cart" ? "Redirect to Cart" : "Redirect to Checkout",
    "landingPage.checkout.providerId": CHECKOUT_INTEGRATION_PROVIDER_LABELS[landing.checkout.providerId],
    "landingPage.checkout.executeScript": landing.checkout.executeScript,
    "landingPage.font.customFont": landing.font.customFont,
    "landingPage.css.bundleBuilderPages": landing.css.bundleBuilderPages,
    "landingPage.css.bundleDummyProductPage": landing.css.bundleDummyProductPage,
    "landingPage.css.themePages": landing.css.themePages,
    "landingPage.scripts.bundlePage": landing.scripts.bundlePage,
    "landingPage.selectors.addToCartButtons": landing.selectors.addToCartButtons,
    "landingPage.selectors.buyNowButton": landing.selectors.buyNowButton,
    "landingPage.integrations.customThemeScriptEnabled": checkedValue(landing.integrations.customThemeScriptEnabled),
    "landingPage.integrations.customThemeIntegrationScript": landing.integrations.customThemeIntegrationScript,
    "landingPage.integrations.cartIntegrationEnabled": checkedValue(landing.integrations.cartIntegrationEnabled),
    "landingPage.integrations.cartItemSelectors": landing.integrations.cartItemSelectors,
    "landingPage.integrations.cartItemRemoveParentSelectors": landing.integrations.cartItemRemoveParentSelectors,
    "landingPage.integrations.cartItemRemoveSelectors": landing.integrations.cartItemRemoveSelectors,
    "landingPage.integrations.cartItemQuantityButtonSelectors": landing.integrations.cartItemQuantityButtonSelectors,
    "landingPage.integrations.customCartIntegrationScript": landing.integrations.customCartIntegrationScript,
    "landingPage.integrations.judgeMeEnabled": checkedValue(landing.integrations.judgeMeEnabled),
    "landingPage.integrations.judgeMePublicToken": landing.integrations.judgeMePublicToken,
    "productPage.hideOutOfStockProducts": checkedValue(product.hideOutOfStockProducts),
    "productPage.trackInventoryOnAddToCart": checkedValue(product.trackInventoryOnAddToCart),
    "productPage.addBundleToCartAfterLastStepCompleted": checkedValue(product.addBundleToCartAfterLastStepCompleted),
    "productPage.displayEmptyStateBoxesBasedOnBundleCondition": checkedValue(product.displayEmptyStateBoxesBasedOnBundleCondition),
    "productPage.hideStepTitlesInCompletedState": checkedValue(product.hideStepTitlesInCompletedState),
    "productPage.addToCartWhenProductCardClicked": checkedValue(product.addToCartWhenProductCardClicked),
    "productPage.redirectCollectionQuickAddToBundle": checkedValue(product.redirectCollectionQuickAddToBundle),
    "productPage.redirect.action": product.redirect.action === "checkout"
      ? "Redirect to Checkout"
      : product.redirect.action === "cart" ? "Redirect to Cart" : "Execute Default Side Cart Update",
    "productPage.redirect.executeScript": product.redirect.executeScript,
    "productPage.css.mixAndMatchBundles": product.css.mixAndMatchBundles,
    "productPage.scripts.executeCustomScript": product.scripts.executeCustomScript,
    "productPage.selectors.sideCart": product.selectors.sideCart,
    "productPage.selectors.sideCartSectionId": product.selectors.sideCartSectionId,
    "productPage.selectors.cartPageItems": product.selectors.cartPageItems,
    "productPage.selectors.cartPageItemsSectionId": product.selectors.cartPageItemsSectionId,
    "productPage.selectors.sideCartOpenButton": product.selectors.sideCartOpenButton,
    "productPage.selectors.productPagePrice": product.selectors.productPagePrice,
  };
}
