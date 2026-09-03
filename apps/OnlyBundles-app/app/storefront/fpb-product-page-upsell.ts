import { createFpbUpsellHandoff } from "./fpb-upsell-handoff.js";

type Offer = {
  bundleId: string;
  publicNumber: number;
  bundleName: string;
  targetPath: string;
  mode: "button" | "block";
  copy: { title: string; description: string; buttonText: string };
  imageUrl: string | null;
  preselectBrowsedProduct: boolean;
};

type ProductContext = {
  productId: string;
  productHandle: string;
  collectionIds: string[];
  locale: string;
  endpointUrl: string;
  selectedVariantId: string;
  countryCode?: string;
};

type ProductPageUpsellState = {
  contextKey: string;
  context: ProductContext;
  offers: Offer[];
};

let productPageUpsellState: ProductPageUpsellState | null = null;
let productPageUpsellRequest: {
  contextKey: string;
  promise: Promise<Offer[]>;
} | null = null;

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

export function findFpbUpsellAnchor(root: ParentNode = document) {
  const custom = Array.from(root.querySelectorAll<HTMLElement>("[data-wpb-fpb-upsell-anchor]"));
  return custom.find((value) => isVisible(value)) ?? null;
}

function findPrimaryProductForm(root: ParentNode = document) {
  const selectors = [
    'form[action*="/cart/add"]',
    "product-form form",
    '[data-type="add-to-cart-form"] form',
  ];
  for (const selector of selectors) {
    const form = Array.from(root.querySelectorAll<HTMLElement>(selector)).find((value) => isVisible(value));
    if (form) return form;
  }
  return null;
}

function ensureAutomaticAnchor(root: ParentNode = document) {
  const existing = root.querySelector<HTMLElement>("[data-wpb-fpb-upsell-auto-anchor]");
  if (existing) return existing;
  const form = findPrimaryProductForm(root);
  if (!form) return null;
  const anchor = document.createElement("div");
  anchor.dataset.wpbFpbUpsellAutoAnchor = "true";
  form.after(anchor);
  return anchor;
}

export function resolveCurrentVariantId(context: ProductContext, root: ParentNode = document) {
  const form = findPrimaryProductForm(root);
  const selected = form?.querySelector<HTMLInputElement | HTMLSelectElement>('[name="id"]:checked, select[name="id"], input[name="id"]');
  return String(selected?.value || context.selectedVariantId || "").trim();
}

function destinationUrl(offer: Offer) {
  const url = new URL(offer.targetPath, window.location.origin);
  url.searchParams.set("source", offer.mode === "button" ? "upsell-button" : "upsell-block");
  return url.toString();
}

function makeOffer(offer: Offer, context: ProductContext) {
  const article = document.createElement("article");
  article.className = "wpb-fpb-upsell__offer";
  article.dataset.mode = offer.mode;
  if (offer.mode === "block" && offer.imageUrl) {
    const image = document.createElement("img");
    image.className = "wpb-fpb-upsell__image";
    image.src = offer.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    article.append(image);
  }
  if (offer.mode === "block") {
    const copy = document.createElement("div");
    copy.className = "wpb-fpb-upsell__copy";
    const title = document.createElement("h2");
    title.className = "wpb-fpb-upsell__title";
    title.textContent = offer.copy.title;
    copy.append(title);
    if (offer.copy.description) {
      const description = document.createElement("p");
      description.className = "wpb-fpb-upsell__description";
      description.textContent = offer.copy.description;
      copy.append(description);
    }
    article.append(copy);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "wpb-fpb-upsell__cta";
  button.textContent = offer.copy.buttonText;
  button.dataset.label = offer.copy.buttonText;
  button.addEventListener("click", () => {
    if (button.disabled) return;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    button.replaceChildren();
    const spinner = document.createElement("span");
    spinner.className = "wpb-fpb-upsell__spinner";
    spinner.setAttribute("aria-hidden", "true");
    button.append(spinner);
    if (offer.preselectBrowsedProduct) {
      const variantId = resolveCurrentVariantId(context);
      if (context.productId && variantId) {
        createFpbUpsellHandoff(window.sessionStorage, {
          bundleId: offer.bundleId,
          productId: context.productId,
          variantId,
          productHandle: context.productHandle,
          collectionIds: context.collectionIds,
        });
      }
    }
    window.location.assign(destinationUrl(offer));
  });
  article.append(button);
  return article;
}

export function renderFpbUpsellOffers(anchor: HTMLElement, offers: Offer[], context: ProductContext) {
  if (offers.length === 0) return null;
  const existing = anchor.querySelector<HTMLElement>("[data-wpb-fpb-upsell-root]");
  if (existing) return existing;
  const list = document.createElement("div");
  list.className = "wpb-fpb-upsell";
  list.dataset.wpbFpbUpsellRoot = "true";
  offers.forEach((offer) => list.append(makeOffer(offer, context)));
  anchor.append(list);
  return list;
}

export function reconcileFpbUpsellPlacement(root: ParentNode = document) {
  const rendered = root.querySelector<HTMLElement>("[data-wpb-fpb-upsell-root]");
  const custom = findFpbUpsellAnchor(root);
  if (rendered && custom && rendered.parentElement !== custom) custom.append(rendered);
  return rendered;
}

export function restoreFpbUpsellBusyState(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>(".wpb-fpb-upsell__cta[aria-busy=true]").forEach((button) => {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = button.dataset.label ?? "";
  });
}

async function fetchOffers(context: ProductContext) {
  const url = new URL(context.endpointUrl, window.location.origin);
  url.searchParams.set("productId", context.productId);
  url.searchParams.set("locale", context.locale);
  if (context.countryCode) url.searchParams.set("country", context.countryCode);
  context.collectionIds.forEach((collectionId) => url.searchParams.append("collectionId", collectionId));
  const response = await fetch(url, { credentials: "same-origin", headers: { Accept: "application/json" } });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload.offers) ? payload.offers as Offer[] : [];
}

function createContext(embed: HTMLElement): ProductContext {
  return {
    productId: embed.dataset.productId ?? "",
    productHandle: embed.dataset.productHandle ?? "",
    collectionIds: (embed.dataset.collectionIds ?? "").split(",").map((value) => value.trim()).filter(Boolean),
    locale: embed.dataset.locale ?? "",
    endpointUrl: embed.dataset.fpbUpsellsEndpoint ?? "",
    selectedVariantId: embed.dataset.selectedVariantId ?? "",
    countryCode: embed.dataset.countryCode ?? "",
  };
}

function mountOffersWithRetry(state: ProductPageUpsellState, root: ParentNode) {
  if (state.offers.length === 0) return;
  const mount = () => {
    const anchor = findFpbUpsellAnchor(root) ?? ensureAutomaticAnchor(root);
    if (!anchor) return false;
    renderFpbUpsellOffers(anchor, state.offers, state.context);
    return true;
  };
  if (mount()) return;
  const observer = new MutationObserver(() => {
    if (mount()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 5000);
}

export async function initializeFpbProductPageUpsells(embed: HTMLElement, root: ParentNode = document) {
  const context = createContext(embed);
  if (!context.productId || !context.locale || !context.endpointUrl) return;
  const contextKey = JSON.stringify(context);
  if (productPageUpsellState?.contextKey === contextKey) {
    mountOffersWithRetry(productPageUpsellState, root);
    return;
  }

  let offers: Offer[];
  if (productPageUpsellRequest?.contextKey === contextKey) {
    offers = await productPageUpsellRequest.promise;
  } else {
    const promise = fetchOffers(context).catch(() => []);
    productPageUpsellRequest = { contextKey, promise };
    offers = await promise;
    if (productPageUpsellRequest?.promise === promise) productPageUpsellRequest = null;
  }

  productPageUpsellState = { contextKey, context, offers };
  embed.dataset.wpbFpbUpsellsInitialized = "true";
  mountOffersWithRetry(productPageUpsellState, root);
}

if (typeof window !== "undefined") window.addEventListener?.("pageshow", () => restoreFpbUpsellBusyState());
