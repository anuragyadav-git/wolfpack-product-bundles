import { applyBrowsedProductPreselection } from "../assets/widgets/product-page/embed-preselection.js";

export { applyBrowsedProductPreselection };

type EmbedContext = {
  productId: string;
  productHandle: string;
  collectionIds: string[];
  locale: string;
  endpointUrl: string;
  selectedVariantId: string;
};

type EmbedPayload = {
  bundle: Record<string, any>;
  title: string;
  subTitle: string;
  preselectBrowsedProduct: boolean;
};

type EmbedState = {
  contextKey: string;
  context: EmbedContext;
  embed: EmbedPayload | null;
};

let state: EmbedState | null = null;
let requestState: { contextKey: string; promise: Promise<EmbedPayload | null> } | null = null;

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute?.("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

export function findPpbBundleEmbedMount(root: ParentNode = document): {
  kind: "custom" | "before";
  element: HTMLElement;
} | null {
  const custom = Array.from(
    root.querySelectorAll<HTMLElement>("[data-wpb-ppb-embed-anchor]"),
  ).find(isVisible);
  if (custom) return { kind: "custom", element: custom };
  const selectors = [
    'form[action*="/cart/add"] button[name="add"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'product-form button[name="add"]',
    '[data-type="add-to-cart-form"] button[type="submit"]',
    'input[name="add"][type="submit"]',
  ];
  for (const selector of selectors) {
    const button = Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
      (candidate) =>
        isVisible(candidate) &&
        !(candidate as HTMLButtonElement).disabled &&
        !candidate.closest?.("[data-wpb-ppb-embed-root]"),
    );
    if (button) return { kind: "before", element: button };
  }
  return null;
}

export function shouldInitializePpbBundleEmbed(
  context: Pick<EmbedContext, "productId" | "endpointUrl">,
  root: ParentNode = document,
) {
  if (!context.productId || !context.endpointUrl) return false;
  const existing = root.querySelector<HTMLElement>("#bundle-builder-app");
  return !existing || existing.dataset.wpbPpbEmbedSource === "true";
}

function createContext(embed: HTMLElement): EmbedContext {
  return {
    productId: embed.dataset.productId ?? "",
    productHandle: embed.dataset.productHandle ?? "",
    collectionIds: (embed.dataset.collectionIds ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    locale: embed.dataset.locale ?? "",
    endpointUrl: embed.dataset.ppbEmbedEndpoint ?? "",
    selectedVariantId: embed.dataset.selectedVariantId ?? "",
  };
}

function resolveCurrentVariantId(context: EmbedContext, root: ParentNode) {
  const forms = [
    ...Array.from(root.querySelectorAll<HTMLElement>('form[action*="/cart/add"]')),
    ...Array.from(root.querySelectorAll<HTMLElement>('product-form form')),
  ];
  const form = forms.find(isVisible);
  const selected = form?.querySelector<HTMLInputElement | HTMLSelectElement>(
    '[name="id"]:checked, select[name="id"], input[name="id"]',
  );
  return String(selected?.value || context.selectedVariantId || "").trim();
}

async function fetchEmbed(context: EmbedContext) {
  const url = new URL(context.endpointUrl, window.location.origin);
  url.searchParams.set("productId", context.productId);
  url.searchParams.set("locale", context.locale);
  if (context.productHandle) url.searchParams.set("productHandle", context.productHandle);
  context.collectionIds.forEach((collectionId) =>
    url.searchParams.append("collectionId", collectionId),
  );
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.embed && typeof payload.embed === "object"
    ? (payload.embed as EmbedPayload)
    : null;
}

function ensureStylesheet(href: string | undefined, marker: string) {
  if (!href) return;
  const exists = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ).some((link) => link.href === href || link.getAttribute("href") === href);
  if (exists) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset[marker] = "true";
  document.head.append(link);
}

function exposeProductContext(embed: HTMLElement, context: EmbedContext) {
  const runtime = window as Window & Record<string, any>;
  runtime.currentProductId = context.productId;
  runtime.currentProductGid = `gid://shopify/Product/${context.productId}`;
  runtime.currentProductHandle = context.productHandle;
  runtime.currentProductCollections = context.collectionIds;
  runtime.__WOLFPACK_PPB_TEMPLATE_CSS_URLS__ = {
    GRID: embed.dataset.ppbGridStyleUrl,
    LIST: embed.dataset.ppbCascadeStyleUrl,
    HORIZONTAL_SLOTS: embed.dataset.ppbModalStyleUrl,
    VERTICAL_SLOTS: embed.dataset.ppbModalStyleUrl,
  };
}

function ensureProductPageRuntime(embed: HTMLElement) {
  const runtime = window as Window & {
    __WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__?: (root?: Document) => void;
  };
  if (runtime.__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__) {
    runtime.__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__(document);
    return;
  }
  const src = embed.dataset.productPageScriptUrl;
  if (!src) return;
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    existing.addEventListener("load", () =>
      runtime.__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__?.(document),
    { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.body.append(script);
}

function createHost(embedElement: HTMLElement, resolution: EmbedPayload, context: EmbedContext) {
  const host = document.createElement("section");
  host.className = "wpb-ppb-embed";
  host.dataset.wpbPpbEmbedRoot = "true";
  host.dataset.bundleId = String(resolution.bundle.id ?? "");
  const heading = document.createElement("header");
  heading.className = "wpb-ppb-embed__header";
  const title = document.createElement("h2");
  title.className = "wpb-ppb-embed__title";
  title.textContent = resolution.title;
  heading.append(title);
  if (resolution.subTitle) {
    const subTitle = document.createElement("p");
    subTitle.className = "wpb-ppb-embed__subtitle";
    subTitle.textContent = resolution.subTitle;
    heading.append(subTitle);
  }
  host.append(heading);
  const container = document.createElement("div");
  container.id = "bundle-builder-app";
  container.className = "bundle-widget-container bundle-widget-container--embed-source";
  Object.assign(container.dataset, {
    bundleId: String(resolution.bundle.id ?? ""),
    bundleType: "product_page",
    bundleConfig: JSON.stringify(resolution.bundle),
    bundleConfigSource: "ppb-embed-endpoint",
    wpbPpbEmbedSource: "true",
    preselectBrowsedProduct: String(resolution.preselectBrowsedProduct),
    selectedVariantId: context.selectedVariantId,
    hideDefaultButtons: "false",
    isContainerProduct: "false",
  });
  host.append(container);
  exposeProductContext(embedElement, context);
  return host;
}

function mountWithRetry(embedElement: HTMLElement, current: EmbedState, root: ParentNode) {
  if (!current.embed) return;
  let host = root.querySelector<HTMLElement>("[data-wpb-ppb-embed-root]");
  const mount = () => {
    const target = findPpbBundleEmbedMount(root);
    if (!target) return false;
    if (!host) {
      host = createHost(embedElement, current.embed!, {
        ...current.context,
        selectedVariantId: resolveCurrentVariantId(current.context, root),
      });
    }
    if (target.kind === "custom") {
      if (host.parentElement !== target.element) target.element.append(host);
    } else if (host.nextElementSibling !== target.element) {
      target.element.before(host);
    }
    ensureStylesheet(embedElement.dataset.productPageStyleUrl, "wpbPpbEmbedStyle");
    if (embedElement.dataset.designSettingsStyleUrl) {
      ensureStylesheet(embedElement.dataset.designSettingsStyleUrl, "wpbPpbDesignStyle");
    }
    ensureProductPageRuntime(embedElement);
    return true;
  };
  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (mount()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 5000);
}

export function reconcilePpbBundleEmbedPlacement(root: ParentNode = document) {
  const host = root.querySelector<HTMLElement>("[data-wpb-ppb-embed-root]");
  const custom = Array.from(
    root.querySelectorAll<HTMLElement>("[data-wpb-ppb-embed-anchor]"),
  ).find(isVisible);
  if (host && custom && host.parentElement !== custom) custom.append(host);
  return host;
}

export async function initializePpbBundleEmbed(
  embedElement: HTMLElement,
  root: ParentNode = document,
) {
  const context = createContext(embedElement);
  if (!shouldInitializePpbBundleEmbed(context, root) || !context.locale) return;
  const contextKey = JSON.stringify(context);
  if (state?.contextKey === contextKey) {
    mountWithRetry(embedElement, state, root);
    return;
  }
  let resolution: EmbedPayload | null;
  if (requestState?.contextKey === contextKey) {
    resolution = await requestState.promise;
  } else {
    const promise = fetchEmbed(context).catch(() => null);
    requestState = { contextKey, promise };
    resolution = await promise;
    if (requestState?.promise === promise) requestState = null;
  }
  state = { contextKey, context, embed: resolution };
  embedElement.dataset.wpbPpbEmbedInitialized = "true";
  mountWithRetry(embedElement, state, root);
}
