import { useEffect, useRef, useState, type RefObject } from "react";
import type { HeadersFunction } from "@remix-run/node";
import { ToastManager } from "../../../assets/widgets/shared/toast-manager";
import { replaceManagedStyle } from "../../../assets/widgets/shared/managed-style";
import { renderFpbUpsellOffers } from "../../../storefront/fpb-product-page-upsell";
import {
  buildStorefrontPreviewFixture,
  buildStorefrontPreviewUpsellFixture,
  getStorefrontPreviewStylesheetManifest,
  type StorefrontPreviewStylesheetId,
} from "../../app/app.settings/storefront-preview-fixtures";
import {
  PREVIEW_PROTOCOL_VERSION,
  isStorefrontPreviewCommand,
  isTrustedStorefrontPreviewMessage,
  type StorefrontPreviewCommand,
  type StorefrontPreviewEvent,
  type StorefrontPreviewInitializePayload,
} from "../../app/app.settings/storefront-preview-protocol";
import type {
  DesignPreviewArea,
  DesignPreviewScenario,
} from "../../app/app.settings/design-preview-model";
import {
  createStorefrontPreviewOverlayHost,
  getStorefrontPreviewRendererKey,
  mountStorefrontPreviewOverlays,
  openStorefrontPreviewProductPicker,
  setStorefrontPreviewLoadingPersistent,
} from "../../app/app.settings/storefront-preview-interactions";
import type { TemplateKey } from "../../../lib/bundle-config/template-selection";
import fpbBaseUrl from "../../../assets/widgets/full-page-css/bundle-widget-full-page.css?url";
import fpbUpsellUrl from "../../../assets/widgets/full-page-css/base/fpb-product-page-upsell.css?url";
import fpbMobileSummaryUrl from "../../../assets/widgets/full-page-css/shared/mobile-summary-footer.css?url";
import fpbResponsiveUrl from "../../../assets/widgets/full-page-css/shared/responsive-layout.css?url";
import fpbStandardUrl from "../../../assets/widgets/full-page-css/templates/side-footer-standard.css?url";
import fpbClassicUrl from "../../../assets/widgets/full-page-css/templates/side-footer-classic.css?url";
import fpbCompactUrl from "../../../assets/widgets/full-page-css/templates/side-footer-compact.css?url";
import fpbHorizontalUrl from "../../../assets/widgets/full-page-css/templates/side-footer-horizontal.css?url";
import ppbBaseUrl from "../../../assets/widgets/product-page-css/bundle-widget.css?url";
import ppbListUrl from "../../../assets/widgets/product-page-css/templates/inpage-cascade.css?url";
import ppbGridUrl from "../../../assets/widgets/product-page-css/templates/inpage-grid.css?url";
import ppbModalUrl from "../../../assets/widgets/product-page-css/templates/modal-slots.css?url";
import ppbModalProductGridUrl from "../../../assets/widgets/product-page-css/base/modal-product-grid.css?url";
import ppbModalFooterUrl from "../../../assets/widgets/product-page-css/base/modal-footer-empty-toast.css?url";
import ppbDiscountFooterUrl from "../../../assets/widgets/product-page-css/base/discount-footer-shared.css?url";
import ppbSelectionLoadingUrl from "../../../assets/widgets/product-page-css/base/footer-selection-loading.css?url";
import ppbBottomSheetUrl from "../../../assets/widgets/product-page-css/base/bottom-sheet-modal.css?url";
import ppbSlotCardsUrl from "../../../assets/widgets/product-page-css/base/slot-cards-default-products.css?url";
import ppbQuantityPillsUrl from "../../../assets/widgets/product-page-css/base/quantity-pills-skeletons.css?url";
import ppbPurchaseOptionsUrl from "../../../assets/widgets/shared-css/purchase-options.css?url";
import ppbDiscountFeedbackUrl from "../../../assets/widgets/shared-css/discount-tier-feedback.css?url";
import ppbMobileDrawersUrl from "../../../assets/widgets/product-page-css/base/mobile-drawers.css?url";
import ppbEmbedHostUrl from "../../../assets/widgets/product-page-css/base/embed-host.css?url";
import productModalShellUrl from "../../../assets/widgets/full-page-css/base/product-modal-shell.css?url";
import productModalControlsUrl from "../../../assets/widgets/full-page-css/base/product-modal-controls.css?url";
import styles from "./styles.module.css";

export const headers: HeadersFunction = () => ({
  "Cache-Control": "no-store",
  "Content-Security-Policy": "frame-ancestors 'self' https://admin.shopify.com",
});

const STYLESHEET_URLS: Record<StorefrontPreviewStylesheetId, string> = {
  "fpb-base": fpbBaseUrl,
  "fpb-mobile-summary": fpbMobileSummaryUrl,
  "fpb-responsive": fpbResponsiveUrl,
  "fpb-standard": fpbStandardUrl,
  "fpb-classic": fpbClassicUrl,
  "fpb-compact": fpbCompactUrl,
  "fpb-horizontal": fpbHorizontalUrl,
  "ppb-base": ppbBaseUrl,
  "ppb-list": ppbListUrl,
  "ppb-grid": ppbGridUrl,
  "ppb-modal": ppbModalUrl,
  "ppb-modal-product-grid": ppbModalProductGridUrl,
  "ppb-modal-footer": ppbModalFooterUrl,
  "ppb-discount-footer": ppbDiscountFooterUrl,
  "ppb-selection-loading": ppbSelectionLoadingUrl,
  "ppb-bottom-sheet": ppbBottomSheetUrl,
  "ppb-slot-cards": ppbSlotCardsUrl,
  "ppb-quantity-pills": ppbQuantityPillsUrl,
  "ppb-purchase-options": ppbPurchaseOptionsUrl,
  "ppb-discount-feedback": ppbDiscountFeedbackUrl,
  "ppb-mobile-drawers": ppbMobileDrawersUrl,
  "ppb-embed-host": ppbEmbedHostUrl,
  "product-modal-shell": productModalShellUrl,
  "product-modal-controls": productModalControlsUrl,
};

type PreviewController = Record<string, any>;

function postFrameEvent(event: StorefrontPreviewEvent) {
  window.parent.postMessage(event, window.location.origin);
}

async function syncStylesheets(templateKey: TemplateKey) {
  document.querySelectorAll("link[data-wpb-settings-preview-style]").forEach((link) => link.remove());
  const manifest = getStorefrontPreviewStylesheetManifest(templateKey);
  const stylesheets: Array<{ stylesheetId: string; url: string }> = manifest.stylesheets.map((stylesheetId) => ({
    stylesheetId,
    url: STYLESHEET_URLS[stylesheetId],
  }));
  if (manifest.bundleType === "product_page") {
    stylesheets.unshift({ stylesheetId: "fpb-upsell", url: fpbUpsellUrl });
  }
  const loads = stylesheets.map(({ stylesheetId, url }) => new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.dataset.wpbSettingsPreviewStyle = stylesheetId;
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => reject(new Error(`Unable to load ${stylesheetId}`)), { once: true });
    document.head.appendChild(link);
  }));
  const previewWindow = window as any;
  previewWindow.__WOLFPACK_PPB_TEMPLATE_CSS_URLS__ = {
    GRID: ppbGridUrl,
    LIST: ppbListUrl,
    HORIZONTAL_SLOTS: ppbModalUrl,
    VERTICAL_SLOTS: ppbModalUrl,
  };
  await Promise.all(loads);
}

function disableControllerSideEffects(controller: PreviewController) {
  controller._initializeFpbUpsellHandoff = () => {};
  controller._persistSessionSelections = () => {};
  controller._recordView = () => {};
  controller._runControlsScript = () => {};
  controller._handlePostAddToCartAction = async () => false;
  controller.addToCart = async () => false;
  controller.addBundleToCart = async () => false;
}

async function initializeController(controller: PreviewController, templateKey: TemplateKey) {
  const fixture = buildStorefrontPreviewFixture(templateKey);
  disableControllerSideEffects(controller);
  controller.config = {
    bundleId: fixture.bundle.id,
    showStepTimeline: true,
    showCategoryTabs: true,
    showSearch: true,
    showQuantitySelectorOnCard: true,
    controlsSettings: { activeControls: {} },
    languageSettings: null,
    textOverrides: {},
  };
  controller.selectedBundle = fixture.bundle;
  controller.initializeDataStructures();
  controller.stepProductData = fixture.stepProductData;
  fixture.stepProductData.forEach((products, stepIndex) => {
    const selected = products[stepIndex % products.length];
    if (!selected) return;
    const selectionId = selected.selectionId;
    if (typeof selectionId !== "string" || !selectionId) return;
    if (typeof controller.setSelectedQuantity === "function") {
      controller.setSelectedQuantity(stepIndex, selectionId, 1);
    } else {
      controller.selectedProducts[stepIndex][selectionId] = 1;
    }
  });
  controller.setupDOMElements();
  controller.applyFullPageDesignPresetMarker?.();
  controller._markProductPageTemplate?.();
  controller.applyBundleLevelCss?.(fixture.bundle);
  await controller.renderUI();
  controller.attachEventListeners?.();
  controller.container.dataset.initialized = "true";
  controller.isInitialized = true;
  return controller;
}

async function createPreviewController(
  bundleType: StorefrontPreviewInitializePayload["bundleType"],
  widgetRoot: HTMLElement,
) {
  if (bundleType === "full_page") {
    const { BundleWidgetFullPage } = await import("../../../assets/bundle-widget-full-page");
    class SettingsPreviewFullPageWidget extends BundleWidgetFullPage {
      __previewReady?: Promise<PreviewController>;

      override init() {
        const templateKey = this.container.getAttribute("data-preview-template") as TemplateKey;
        this.__previewReady = initializeController(this as unknown as PreviewController, templateKey);
        return this.__previewReady.then(() => undefined);
      }
    }
    const controller = new SettingsPreviewFullPageWidget(widgetRoot);
    await controller.__previewReady;
    return controller as unknown as PreviewController;
  }

  const { BundleWidgetProductPage } = await import("../../../assets/bundle-widget-product-page");
  class SettingsPreviewProductPageWidget extends BundleWidgetProductPage {
    __previewReady?: Promise<PreviewController>;

    override init() {
      const templateKey = this.container.getAttribute("data-preview-template") as TemplateKey;
      this.__previewReady = initializeController(this as unknown as PreviewController, templateKey);
      return this.__previewReady.then(() => undefined);
    }
  }
  const controller = new SettingsPreviewProductPageWidget(widgetRoot);
  await controller.__previewReady;
  return controller as unknown as PreviewController;
}

function renderUpsell(anchor: HTMLElement) {
  const fixture = buildStorefrontPreviewUpsellFixture();
  anchor.hidden = false;
  renderFpbUpsellOffers(anchor, [fixture.offer], fixture.context);
}

function UpsellPurchaseContext({
  upsellRef,
}: {
  upsellRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className={styles.purchaseContext} data-wpb-upsell-context>
      <div className={styles.purchaseOption}>
        <span>Size</span>
        <strong>One size</strong>
      </div>
      <form className={styles.purchaseForm} action="/cart/add" aria-label="Product purchase preview">
        <label className={styles.quantityField}>
          <span>Quantity</span>
          <input type="number" min="1" value="1" readOnly />
        </label>
        <button type="submit">Add to cart</button>
      </form>
      <div ref={upsellRef} className={styles.upsellAnchor} data-wpb-fpb-upsell-anchor hidden />
    </div>
  );
}

function getAreaSelector(area: DesignPreviewArea) {
  if (area === "bundle-header") return ".bw-ppb-inpage-step-title, .bundle-header, .bw-ppb-cascade-step-flow";
  if (area === "navigation") return ".step-timeline, .bundle-step-timeline, .bw-ppb-cascade-step-flow";
  if (area === "categories") return ".category-tabs, .fpb-category-section-rows, .bw-ppb-inpage-category-tabs";
  if (area === "product-card") return ".full-page-product-grid-container, .bw-ppb-inpage-step-grid, .product-grid";
  if (area === "product-slots") return ".bw-ppb-modal-slot-grid, .bw-selected-slots, [data-bw-selected-slots], .bw-slot-card";
  return ".full-page-side-panel, .fpb-mobile-bottom-sheet, .bundle-footer-messaging, .add-bundle-to-cart";
}

function findAreaTarget(area: DesignPreviewArea, widgetRoot: HTMLElement) {
  const candidates = Array.from(
    widgetRoot.querySelectorAll<HTMLElement>(getAreaSelector(area)),
  );
  const candidate = candidates.find((element) => element.getClientRects().length > 0)
    ?? candidates[0]
    ?? null;
  if (area !== "product-slots" || !candidate?.classList.contains("bw-slot-card")) {
    return candidate;
  }
  return candidate.closest<HTMLElement>(
    ".bw-ppb-modal-slot-grid, .bw-selected-slots, .bw-ppb-inpage-step-grid",
  ) ?? candidate;
}

function clearAreaFocus(label: HTMLElement | null) {
  document.querySelectorAll("[data-wpb-preview-focus]").forEach((element) => {
    element.removeAttribute("data-wpb-preview-focus");
  });
  if (label) label.hidden = true;
}

function focusArea(
  area: DesignPreviewArea,
  areaLabel: string,
  widgetRoot: HTMLElement,
  label: HTMLElement | null,
) {
  clearAreaFocus(label);
  const target = findAreaTarget(area, widgetRoot);
  if (!target) return false;
  target.dataset.wpbPreviewFocus = area;
  target.scrollIntoView({ block: "center", inline: "nearest" });
  if (label) {
    label.textContent = areaLabel;
    label.hidden = false;
  }
  return true;
}

function applyPreviewContext(
  area: DesignPreviewArea,
  areaLabel: string,
  scenario: DesignPreviewScenario,
  controller: PreviewController | null,
  widgetRoot: HTMLElement | null,
  upsellAnchor: HTMLElement | null,
  focusLabel: HTMLElement | null,
) {
  if (!controller || !widgetRoot) return;
  clearAreaFocus(focusLabel);
  setStorefrontPreviewLoadingPersistent(controller, scenario === "loading");
  document.getElementById("bundle-toast")?.remove();
  const modal = document.getElementById("bundle-builder-modal");
  if (modal) modal.style.removeProperty("display");
  if (scenario !== "product-picker") {
    controller.closeModal?.();
    if (modal) {
      modal.hidden = true;
      modal.style.display = "none";
    }
  }
  if (upsellAnchor) upsellAnchor.hidden = scenario !== "upsell";

  if (scenario === "loading") {
    return;
  }
  if (scenario === "validation") {
    ToastManager.show("Please meet the quantity conditions for the current step before proceeding.", 0, {
      dismissible: false,
    });
    return;
  }
  if (scenario === "product-picker") {
    if (modal) modal.style.removeProperty("display");
    openStorefrontPreviewProductPicker(controller, widgetRoot);
    return;
  }
  if (scenario === "upsell" && upsellAnchor) {
    renderUpsell(upsellAnchor);
    upsellAnchor.closest<HTMLElement>("section")?.scrollIntoView({ block: "start" });
    return;
  }

  focusArea(area, areaLabel, widgetRoot, focusLabel);
}

function selectedQuantity(controller: PreviewController | null) {
  const value = Number(controller?.getSharedSelectedQuantity?.() ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export default function SettingsDesignPreviewFrame() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const upsellRef = useRef<HTMLDivElement>(null);
  const focusLabelRef = useRef<HTMLDivElement>(null);
  const overlayHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<PreviewController | null>(null);
  const stateRef = useRef<StorefrontPreviewInitializePayload | null>(null);
  const [state, setState] = useState<StorefrontPreviewInitializePayload | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const pickerRendererState = state?.scenario === "product-picker";
  const rendererKey = getStorefrontPreviewRendererKey(state, resetVersion);
  const isUpsellPreview = state?.scenario === "upsell";

  useEffect(() => {
    const { host, cleanup } = createStorefrontPreviewOverlayHost(document);
    overlayHostRef.current = host;
    return () => {
      overlayHostRef.current = null;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const previewWindow = window as any;
    previewWindow.Shopify = {
      ...(previewWindow.Shopify ?? {}),
      shop: "settings-design-preview.myshopify.com",
      locale: state?.locale ?? "en",
      country: "US",
      currency: { active: state?.currency ?? "USD", rate: "1.0" },
      designMode: true,
    };
  }, [state?.currency, state?.locale]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isTrustedStorefrontPreviewMessage(event, window.location.origin, window.parent)) return;
      if (!isStorefrontPreviewCommand(event.data)) return;
      const command: StorefrontPreviewCommand = event.data;
      if (command.type === "RESET_INTERACTION") {
        setResetVersion((version) => version + 1);
        return;
      }
      setState((current) => {
        if (command.type === "INITIALIZE") return command.payload;
        if (!current) return current;
        if (command.type === "UPDATE_DESIGN") return { ...current, designCss: command.payload.designCss };
        if (command.type === "SET_TEMPLATE") return { ...current, ...command.payload };
        if (command.type === "SET_VIEWPORT") return { ...current, viewport: command.payload.viewport };
        if (command.type === "SET_AREA") return { ...current, ...command.payload };
        if (command.type === "SET_SCENARIO") return { ...current, scenario: command.payload.scenario };
        return current;
      });
    };
    window.addEventListener("message", onMessage);
    postFrameEvent({ version: PREVIEW_PROTOCOL_VERSION, type: "READY", payload: {} });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (!state) return;
    document.body.dataset.previewViewport = state.viewport;
    const designStyle = replaceManagedStyle(document, "settings-preview-design", state.designCss);
    if (designStyle) designStyle.id = "wpb-settings-preview-design";
  }, [state]);

  useEffect(() => {
    const activeState = stateRef.current;
    if (!activeState || !widgetRef.current) return;
    const widgetRoot = widgetRef.current;
    widgetRoot.replaceChildren();
    widgetRoot.className = styles.widgetMount;
    widgetRoot.classList.add("bundle-widget-container");
    if (activeState.bundleType === "full_page") {
      widgetRoot.classList.add("bundle-widget-full-page");
    }
    document.querySelectorAll("#bundle-builder-modal, #bw-bs-overlay, .fpb-mobile-bottom-sheet, #bundle-toast")
      .forEach((element) => element.remove());
    widgetRoot.id = "bundle-builder-app";
    widgetRoot.dataset.bundleType = activeState.bundleType;
    widgetRoot.dataset.previewTemplate = activeState.templateKey;
    widgetRoot.dataset.bundleId = "settings-design-preview";
    let cancelled = false;
    syncStylesheets(activeState.templateKey)
      .then(() => createPreviewController(activeState.bundleType, widgetRoot))
      .then((controller) => {
        if (cancelled) return;
        controllerRef.current = controller;
        if (overlayHostRef.current) {
          mountStorefrontPreviewOverlays(controller, overlayHostRef.current);
        }
        const latestState = stateRef.current ?? activeState;
        applyPreviewContext(
          latestState.area,
          latestState.areaLabel,
          latestState.scenario,
          controller,
          widgetRoot,
          upsellRef.current,
          focusLabelRef.current,
        );
        postFrameEvent({
          version: PREVIEW_PROTOCOL_VERSION,
          type: "INTERACTION_CHANGED",
          payload: { selectedQuantity: selectedQuantity(controller) },
        });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Storefront preview failed";
        postFrameEvent({ version: PREVIEW_PROTOCOL_VERSION, type: "ERROR", payload: { message } });
      });
    return () => {
      cancelled = true;
    };
  }, [rendererKey]);

  useEffect(() => {
    const announceState = () => {
      const activeState = stateRef.current;
      if (!activeState || !controllerRef.current) return;
      window.setTimeout(() => {
        postFrameEvent({
          version: PREVIEW_PROTOCOL_VERSION,
          type: "INTERACTION_CHANGED",
          payload: {
            selectedQuantity: selectedQuantity(controllerRef.current),
          },
        });
      });
    };
    const widgetRoot = widgetRef.current;
    widgetRoot?.addEventListener("click", announceState);
    widgetRoot?.addEventListener("change", announceState);
    return () => {
      widgetRoot?.removeEventListener("click", announceState);
      widgetRoot?.removeEventListener("change", announceState);
    };
  }, [state?.bundleType, state?.templateKey]);

  useEffect(() => {
    const activeState = stateRef.current;
    if (!activeState) return;
    applyPreviewContext(
      activeState.area,
      activeState.areaLabel,
      activeState.scenario,
      controllerRef.current,
      widgetRef.current,
      upsellRef.current,
      focusLabelRef.current,
    );
    postFrameEvent({
      version: PREVIEW_PROTOCOL_VERSION,
      type: "INTERACTION_CHANGED",
      payload: { selectedQuantity: selectedQuantity(controllerRef.current) },
    });
  }, [state?.area, state?.areaLabel, state?.scenario, state?.viewport]);

  useEffect(() => {
    if (state?.scenario !== "product-picker") return;
    const modal = document.getElementById("bundle-builder-modal");
    if (!modal || typeof MutationObserver === "undefined") return;
    let observedOpenState = modal.classList.contains("bw-bs-panel--open");
    const observer = new MutationObserver(() => {
      const isOpen = modal.classList.contains("bw-bs-panel--open");
      if (observedOpenState && !isOpen) {
        setState((current) => current ? { ...current, scenario: "default" } : current);
        postFrameEvent({
          version: PREVIEW_PROTOCOL_VERSION,
          type: "SCENARIO_CHANGED",
          payload: { scenario: "default" },
        });
      }
      observedOpenState = isOpen;
    });
    observer.observe(modal, { attributes: true, attributeFilter: ["class", "hidden", "aria-hidden"] });
    return () => observer.disconnect();
  }, [pickerRendererState, state?.scenario]);

  useEffect(() => {
    const blockUnsafeAction = (event: Event) => {
      const target = event.target as Element | null;
      if (!target?.closest("a, form, .add-bundle-to-cart, .wpb-fpb-upsell__cta")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    document.addEventListener("click", blockUnsafeAction, true);
    document.addEventListener("submit", blockUnsafeAction, true);
    return () => {
      document.removeEventListener("click", blockUnsafeAction, true);
      document.removeEventListener("submit", blockUnsafeAction, true);
    };
  }, []);

  return (
    <div className={styles.store} data-preview-family={state?.bundleType ?? "full_page"}>
      <div ref={focusLabelRef} className={styles.focusLabel} aria-hidden="true" hidden />
      <div className={styles.announcement} aria-hidden="true">
        <span className={styles.announcementLine} />
      </div>
      <header className={styles.header}>
        <div className={styles.wordmark}>North &amp; Pine</div>
        <nav className={styles.navigation} aria-label="Preview store navigation">
          <span>Shop</span><span>Collections</span><span>Our story</span>
        </nav>
        <div className={styles.headerActions} aria-hidden="true">
          <span className={styles.icon} /><span className={styles.icon} /><span className={styles.icon} />
        </div>
      </header>
      <main className={styles.main}>
        {state?.bundleType === "product_page" ? (
          <div className={styles.productPageMain}>
            <section className={styles.mediaColumn} aria-label="Product media">
              <div className={styles.thumbnails} aria-hidden="true">
                {[1, 2, 3].map((index) => (
                  <div className={styles.thumbnail} key={index}>
                    <img src={`/design-preview-product-${index}.png`} alt="" />
                  </div>
                ))}
              </div>
              <div className={styles.heroMedia}>
                <img src="/design-preview-product-1.png" alt="Preview product" />
              </div>
            </section>
            <section className={styles.productInfo}>
              <p className={styles.eyebrow}>Bundle collection</p>
              <div className={styles.rating} aria-label="Five star rating">★★★★★</div>
              <h1 className={styles.title}>Curated essentials</h1>
              <p className={styles.price}>$24.00</p>
              <p className={styles.subtitle}>Select the products and quantities that belong in this bundle.</p>
              <div className={styles.rule} />
              <div className={styles.bundlePreviewStage} hidden={isUpsellPreview}>
                <div ref={widgetRef} className={styles.widgetMount} />
              </div>
              {isUpsellPreview ? <UpsellPurchaseContext upsellRef={upsellRef} /> : null}
            </section>
          </div>
        ) : (
          <div className={styles.fullPageMain}>
            <header className={styles.fullPageIntro} hidden={isUpsellPreview}>
              <p className={styles.eyebrow}>Build your set</p>
              <h1 className={styles.title}>Create a bundle</h1>
              <p className={styles.subtitle}>Choose your favourites and review the complete set as you build.</p>
            </header>
            <div className={styles.bundlePreviewStage} hidden={isUpsellPreview}>
              <div ref={widgetRef} className={styles.widgetMount} />
            </div>
            {isUpsellPreview ? (
              <div className={styles.productPageMain}>
                <section className={styles.mediaColumn} aria-label="Product media">
                  <div className={styles.thumbnails} aria-hidden="true">
                    {[1, 2, 3].map((index) => (
                      <div className={styles.thumbnail} key={index}>
                        <img src={`/design-preview-product-${index}.png`} alt="" />
                      </div>
                    ))}
                  </div>
                  <div className={styles.heroMedia}>
                    <img src="/design-preview-product-1.png" alt="Preview product" />
                  </div>
                </section>
                <section className={styles.productInfo}>
                  <p className={styles.eyebrow}>New arrival</p>
                  <div className={styles.rating} aria-label="Five star rating">★★★★★</div>
                  <h1 className={styles.title}>Everyday bottle</h1>
                  <p className={styles.price}>$24.00</p>
                  <p className={styles.subtitle}>A versatile everyday essential designed for work, travel, and weekends.</p>
                  <div className={styles.rule} />
                  <UpsellPurchaseContext upsellRef={upsellRef} />
                </section>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
