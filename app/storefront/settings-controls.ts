import { replaceManagedStyle } from "../assets/widgets/shared/managed-style";

type RuntimeWindow = Window & Record<string, unknown>;

type GlobalSettingsControls = {
  landingPage?: {
    redirectCollectionQuickAddToBundle?: boolean;
    css?: { themePages?: string; bundleDummyProductPage?: string };
    selectors?: { addToCartButtons?: string; buyNowButton?: string };
    integrations?: {
      customThemeScriptEnabled?: boolean;
      customThemeIntegrationScript?: string;
      cartIntegrationEnabled?: boolean;
      customCartIntegrationScript?: string;
      cartItemSelectors?: string;
      cartItemRemoveParentSelectors?: string;
      cartItemRemoveSelectors?: string;
      cartItemQuantityButtonSelectors?: string;
    };
  };
  productPage?: {
    redirectCollectionQuickAddToBundle?: boolean;
  };
};

type BundleQuickAddLink = {
  bundleType: "full_page" | "product_page";
  productHandle: string;
  targetUrl: string;
};

export function executeMerchantStorefrontScript(source: unknown, runtimeWindow: RuntimeWindow) {
  const script = typeof source === "string" ? source.trim() : "";
  if (!script) return true;

  try {
    Function("window", "document", `"use strict";\n${script}`)(runtimeWindow, runtimeWindow.document);
    return true;
  } catch (error: any) {
    console.warn("[Wolfpack Bundles] Merchant Settings script failed", error);
    return false;
  }
}

export function executeMerchantCartIntegration(source: unknown, runtimeWindow: RuntimeWindow) {
  const script = typeof source === "string" ? source.trim() : "";
  if (!script) return true;

  try {
    const Integration = Function(
      "window",
      "document",
      `"use strict"; return (${script});`,
    )(runtimeWindow, runtimeWindow.document);
    if (typeof Integration !== "function") return false;
    const instance = new Integration();
    if (typeof instance.init !== "function") return false;
    instance.init();
    return true;
  } catch (error: any) {
    console.warn("[Wolfpack Bundles] Merchant cart integration failed", error);
    return false;
  }
}

function getProductHandle(href: string) {
  try {
    const path = new URL(href, "https://storefront.invalid").pathname;
    const match = path.match(/^\/products\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch (_: any) {
    return null;
  }
}

export function resolveBundleQuickAddTarget(
  href: string,
  links: BundleQuickAddLink[],
  settingsControls: GlobalSettingsControls,
) {
  const handle = getProductHandle(href);
  if (!handle) return null;
  const link = links.find((candidate) => candidate.productHandle === handle);
  if (!link) return null;
  const enabled = link.bundleType === "full_page"
    ? settingsControls.landingPage?.redirectCollectionQuickAddToBundle === true
    : settingsControls.productPage?.redirectCollectionQuickAddToBundle === true;
  return enabled ? link.targetUrl : null;
}

function applyCollectionQuickAddLinks(
  settingsControls: GlobalSettingsControls,
  links: BundleQuickAddLink[],
  runtimeWindow: RuntimeWindow,
  runtimeDocument: Document,
) {
  if (links.length === 0 || !runtimeDocument.querySelectorAll) return;

  runtimeDocument.querySelectorAll<HTMLAnchorElement>('a[href*="/products/"]').forEach((anchor) => {
    const targetUrl = resolveBundleQuickAddTarget(anchor.getAttribute("href") || "", links, settingsControls);
    if (!targetUrl) return;
    anchor.href = targetUrl;

    const card = anchor.closest('li, product-card, .card-wrapper, .product-card, [data-product-card]');
    const configuredSelectors = [
      settingsControls.landingPage?.selectors?.addToCartButtons,
      settingsControls.landingPage?.selectors?.buyNowButton,
    ].map((value) => String(value || "").trim()).filter(Boolean).join(", ");
    const form = card?.querySelector('form[action*="/cart/add"]');
    const quickAdd = (configuredSelectors ? card?.querySelector<HTMLElement>(configuredSelectors) : null)
      || form?.querySelector<HTMLElement>('button, input[type="submit"]');
    if (!quickAdd || quickAdd.dataset.wpbBundleQuickAddBound === "true") return;
    quickAdd.dataset.wpbBundleQuickAddBound = "true";
    quickAdd.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      runtimeWindow.location.assign(targetUrl);
    });
  });
}

function installDynamicControlsObserver(
  settingsControls: GlobalSettingsControls,
  links: BundleQuickAddLink[],
  runtimeWindow: RuntimeWindow,
  runtimeDocument: Document,
) {
  const Observer = runtimeWindow.MutationObserver as typeof MutationObserver | undefined;
  if (!Observer || !runtimeDocument.body) return;

  const previous = runtimeWindow.__WPB_SETTINGS_CONTROLS_OBSERVER__ as MutationObserver | undefined;
  previous?.disconnect();
  const integrations = settingsControls.landingPage?.integrations;
  const cartSelector = String(integrations?.cartItemSelectors || "").trim();
  const seenCartItems = new WeakSet<Element>();
  const applyDynamicControls = () => {
    applyCollectionQuickAddLinks(settingsControls, links, runtimeWindow, runtimeDocument);
    if (!integrations?.cartIntegrationEnabled || !cartSelector) return;
    const cartItems = Array.from(runtimeDocument.querySelectorAll(cartSelector));
    if (!cartItems.some((item) => !seenCartItems.has(item))) return;
    cartItems.forEach((item) => seenCartItems.add(item));
    executeMerchantCartIntegration(integrations.customCartIntegrationScript, runtimeWindow);
  };
  applyDynamicControls();
  const observer = new Observer(applyDynamicControls);
  observer.observe(runtimeDocument.body, { childList: true, subtree: true });
  runtimeWindow.__WPB_SETTINGS_CONTROLS_OBSERVER__ = observer;
}

export function applyGlobalSettingsControls(
  settingsControls: GlobalSettingsControls,
  runtimeWindow: RuntimeWindow = window as unknown as RuntimeWindow,
  runtimeDocument: Document = document,
  bundleLinks: BundleQuickAddLink[] = [],
) {
  const landing = settingsControls?.landingPage;
  if (!landing) return;

  const themeCss = String(landing.css?.themePages ?? "").trim();
  replaceManagedStyle(runtimeDocument, "settings-controls-theme", themeCss);

  const currentHandle = getProductHandle(String(runtimeWindow.location?.href || ""));
  const isFpbDummyProduct = Boolean(currentHandle && bundleLinks.some((link) => (
    link.bundleType === "full_page" && link.productHandle === currentHandle
  )));
  const dummyProductCss = isFpbDummyProduct
    ? String(landing.css?.bundleDummyProductPage ?? "").trim()
    : "";
  replaceManagedStyle(runtimeDocument, "settings-controls-dummy-product", dummyProductCss);

  const integrations = landing.integrations;
  runtimeWindow.__WPB_CART_INTEGRATION_SELECTORS__ = integrations ? {
    cartItems: integrations.cartItemSelectors ?? "",
    removeParents: integrations.cartItemRemoveParentSelectors ?? "",
    removeButtons: integrations.cartItemRemoveSelectors ?? "",
    quantityButtons: integrations.cartItemQuantityButtonSelectors ?? "",
  } : {};

  if (integrations?.customThemeScriptEnabled) {
    executeMerchantStorefrontScript(integrations.customThemeIntegrationScript, runtimeWindow);
  }
  if (integrations?.cartIntegrationEnabled) {
    if (!String(integrations.cartItemSelectors || "").trim()) {
      executeMerchantCartIntegration(integrations.customCartIntegrationScript, runtimeWindow);
    }
  }
  applyCollectionQuickAddLinks(settingsControls, bundleLinks, runtimeWindow, runtimeDocument);
  installDynamicControlsObserver(settingsControls, bundleLinks, runtimeWindow, runtimeDocument);
}

export async function loadAndApplyGlobalSettingsControls(
  endpoint: string,
  runtimeWindow: RuntimeWindow = window as unknown as RuntimeWindow,
  runtimeDocument: Document = document,
) {
  if (!endpoint) return false;
  try {
    const response = await runtimeWindow.fetch(endpoint, { credentials: "same-origin" });
    if (!response.ok) return false;
    const payload = await response.json() as {
      settingsControls?: GlobalSettingsControls;
      bundleLinks?: BundleQuickAddLink[];
    };
    if (!payload.settingsControls) return false;
    applyGlobalSettingsControls(payload.settingsControls, runtimeWindow, runtimeDocument, payload.bundleLinks ?? []);
    return true;
  } catch (error: any) {
    console.warn("[Wolfpack Bundles] Failed to load global Settings Controls", error);
    return false;
  }
}
