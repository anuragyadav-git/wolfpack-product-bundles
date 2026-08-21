import {
  getFpbStylesheetUrls,
  type FpbDesignPreset,
} from "./fpb-template-assets.js";

export type PageBuilderEmbedMode =
  | "eligible-product"
  | "product-page-bundle"
  | "full-page-bundle";

type PageBuilderEmbedPayload = {
  bundleType: "product_page" | "full_page";
  bundle: Record<string, any>;
  loadingScreen?: { gifUrl?: string | null; backgroundColor?: string };
};

type DirectContext = {
  key: string;
  endpointUrl: string;
  locale: string;
  mode: Exclude<PageBuilderEmbedMode, "eligible-product">;
  parentProductHandle: string;
  publicNumber: string;
};

let directState: { key: string; payload: PageBuilderEmbedPayload | null } | null = null;
let directRequest: { key: string; promise: Promise<PageBuilderEmbedPayload | null> } | null = null;

export function getPageBuilderEmbedMode(
  marker: Pick<HTMLElement, "dataset">,
): PageBuilderEmbedMode | null {
  const mode = marker.dataset.embedMode;
  if (mode === "eligible-product") return mode;
  if (mode === "product-page-bundle") {
    return marker.dataset.parentProductHandle?.trim() ? mode : null;
  }
  if (mode === "full-page-bundle") {
    const value = marker.dataset.publicNumber?.trim() ?? "";
    return /^\d+$/.test(value) && Number(value) > 0 ? mode : null;
  }
  return null;
}
export function findPageBuilderEmbedMarker(
  root: ParentNode = document,
): HTMLElement | null {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-wpb-page-builder-embed]"),
  ).find((marker) => getPageBuilderEmbedMode(marker) !== null) ?? null;
}

export function suppressesAutomaticPpbEmbed(
  marker: Pick<HTMLElement, "dataset"> | null,
): boolean {
  const mode = marker ? getPageBuilderEmbedMode(marker) : null;
  return mode === "product-page-bundle" || mode === "full-page-bundle";
}

export function prepareEligiblePageBuilderMarker(
  root: ParentNode = document,
): HTMLElement | null {
  const marker = findPageBuilderEmbedMarker(root);
  if (marker && getPageBuilderEmbedMode(marker) === "eligible-product") {
    marker.setAttribute("data-wpb-ppb-embed-anchor", "");
    return marker;
  }
  return null;
}

function normalizePreset(value: unknown): FpbDesignPreset {
  const preset = String(value || "STANDARD").trim().toUpperCase();
  if (preset === "CLASSIC" || preset === "COMPACT" || preset === "HORIZONTAL") {
    return preset;
  }
  return "STANDARD";
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

function createDirectContext(
  appEmbed: HTMLElement,
  marker: HTMLElement,
): DirectContext | null {
  const mode = getPageBuilderEmbedMode(marker);
  if (mode !== "product-page-bundle" && mode !== "full-page-bundle") return null;
  const context = {
    endpointUrl: appEmbed.dataset.pageBuilderEmbedEndpoint ?? "",
    locale: appEmbed.dataset.locale ?? "",
    mode,
    parentProductHandle: marker.dataset.parentProductHandle?.trim().toLowerCase() ?? "",
    publicNumber: marker.dataset.publicNumber?.trim() ?? "",
  };
  if (!context.endpointUrl || !context.locale) return null;
  return { ...context, key: JSON.stringify(context) };
}

async function fetchDirectEmbed(context: DirectContext) {
  const url = new URL(context.endpointUrl, window.location.origin);
  url.searchParams.set(
    "bundleType",
    context.mode === "product-page-bundle" ? "product_page" : "full_page",
  );
  url.searchParams.set("locale", context.locale);
  if (context.mode === "product-page-bundle") {
    url.searchParams.set("parentProductHandle", context.parentProductHandle);
  } else {
    url.searchParams.set("publicNumber", context.publicNumber);
  }
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.embed && typeof payload.embed === "object"
    ? payload.embed as PageBuilderEmbedPayload
    : null;
}

function exposePpbTemplateAssets(appEmbed: HTMLElement) {
  const runtime = window as Window & Record<string, any>;
  runtime.__WOLFPACK_PPB_TEMPLATE_CSS_URLS__ = {
    GRID: appEmbed.dataset.ppbGridStyleUrl,
    LIST: appEmbed.dataset.ppbCascadeStyleUrl,
    HORIZONTAL_SLOTS: appEmbed.dataset.ppbModalStyleUrl,
    VERTICAL_SLOTS: appEmbed.dataset.ppbModalStyleUrl,
  };
}

function loadProductPageRuntime(appEmbed: HTMLElement) {
  const runtime = window as Window & {
    __WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__?: (root?: Document) => void;
  };
  if (runtime.__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__) {
    runtime.__WOLFPACK_INITIALIZE_PRODUCT_PAGE_WIDGET__(document);
    return;
  }
  const src = appEmbed.dataset.productPageScriptUrl;
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

function loadFullPageRuntime(appEmbed: HTMLElement) {
  const runtime = window as Window & {
    __WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__?: (root?: Document) => void;
  };
  if (runtime.__WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__) {
    runtime.__WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__(document);
    return;
  }
  const src = appEmbed.dataset.fullPageScriptUrl;
  if (!src) return;
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    existing.addEventListener("load", () =>
      runtime.__WOLFPACK_INITIALIZE_FULL_PAGE_WIDGET__?.(document),
    { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.body.append(script);
}

function createLoadingScreen(payload: PageBuilderEmbedPayload) {
  const loading = document.createElement("div");
  loading.dataset.wpbLoadingScreen = "";
  loading.setAttribute("role", "status");
  loading.setAttribute("aria-label", "Loading bundle");
  loading.style.setProperty(
    "--wpb-loading-screen-bg",
    payload.loadingScreen?.backgroundColor || "#ffffff",
  );
  if (payload.loadingScreen?.gifUrl) {
    const image = document.createElement("img");
    image.dataset.wpbLoadingGif = "";
    image.src = payload.loadingScreen.gifUrl;
    image.alt = "";
    loading.append(image);
  } else {
    const spinner = document.createElement("span");
    spinner.dataset.wpbLoadingSpinner = "";
    spinner.setAttribute("aria-hidden", "true");
    loading.append(spinner);
  }
  return loading;
}

function mountDirectEmbed(
  appEmbed: HTMLElement,
  marker: HTMLElement,
  payload: PageBuilderEmbedPayload,
) {
  let host = marker.querySelector<HTMLElement>("[data-wpb-page-builder-embed-root]");
  if (!host) {
    host = document.createElement("section");
    host.dataset.wpbPageBuilderEmbedRoot = "true";
    const container = document.createElement("div");
    container.id = "bundle-builder-app";
    container.className = "bundle-widget-container";
    Object.assign(container.dataset, {
      bundleId: String(payload.bundle.id ?? ""),
      bundleType: payload.bundleType,
      bundleConfig: JSON.stringify(payload.bundle),
      hideDefaultButtons: "false",
    });
    if (payload.bundleType === "product_page") {
      container.classList.add("bundle-widget-container--embed-source");
      Object.assign(container.dataset, {
        bundleConfigSource: "ppb-embed-endpoint",
        wpbPpbEmbedSource: "true",
        preselectBrowsedProduct: "false",
        isContainerProduct: "false",
      });
    } else {
      const preset = normalizePreset(payload.bundle.bundleDesignPresetId);
      container.classList.add(
        "bundle-widget-full-page",
        `fpb-preset-${preset.toLowerCase()}`,
      );
      Object.assign(container.dataset, {
        bundleConfigSource: "app_proxy",
        fpbTemplateType: payload.bundle.bundleDesignTemplate || "FBP_SIDE_FOOTER",
        fpbDesignPreset: preset,
        fpbTabStyle: preset === "CLASSIC" || preset === "COMPACT" ? "pill" : "underline",
        fpbLoadingGif: payload.loadingScreen?.gifUrl || "",
        fpbLoadingBackground: payload.loadingScreen?.backgroundColor || "#ffffff",
      });
      container.setAttribute("aria-busy", "true");
      container.append(createLoadingScreen(payload));
    }
    host.append(container);
    marker.append(host);
  }

  if (payload.bundleType === "product_page") {
    ensureStylesheet(appEmbed.dataset.productPageStyleUrl, "wpbPageBuilderPpbStyle");
    if (appEmbed.dataset.designSettingsStyleUrl) {
      ensureStylesheet(appEmbed.dataset.designSettingsStyleUrl, "wpbPageBuilderDesignStyle");
    }
    exposePpbTemplateAssets(appEmbed);
    loadProductPageRuntime(appEmbed);
    return;
  }

  const preset = normalizePreset(payload.bundle.bundleDesignPresetId);
  getFpbStylesheetUrls(appEmbed.dataset, preset).forEach((href) =>
    ensureStylesheet(href, "wpbPageBuilderFpbStyle"),
  );
  loadFullPageRuntime(appEmbed);
}

export async function initializePageBuilderEmbed(
  appEmbed: HTMLElement,
  root: ParentNode = document,
) {
  const marker = findPageBuilderEmbedMarker(root);
  if (!marker) return null;
  if (getPageBuilderEmbedMode(marker) === "eligible-product") {
    prepareEligiblePageBuilderMarker(root);
    return marker;
  }
  const existingPrimary = root.querySelector<HTMLElement>("#bundle-builder-app");
  if (existingPrimary && !marker.contains(existingPrimary)) return null;
  const context = createDirectContext(appEmbed, marker);
  if (!context) return null;

  let payload: PageBuilderEmbedPayload | null;
  if (directState?.key === context.key) {
    payload = directState.payload;
  } else if (directRequest?.key === context.key) {
    payload = await directRequest.promise;
  } else {
    const promise = fetchDirectEmbed(context).catch(() => null);
    directRequest = { key: context.key, promise };
    payload = await promise;
    if (directRequest?.promise === promise) directRequest = null;
    directState = { key: context.key, payload };
  }
  if (!payload) return marker;
  mountDirectEmbed(appEmbed, marker, payload);
  marker.dataset.wpbPageBuilderEmbedInitialized = "true";
  return marker;
}
