import {
  PREVIEW_PROTOCOL_VERSION,
  isTrustedStorefrontPreviewMessage,
  isStorefrontPreviewCommand,
  isStorefrontPreviewEvent,
} from "../../../app/routes/app/app.settings/storefront-preview-protocol";
import {
  buildStorefrontPreviewUpsellFixture,
  buildStorefrontPreviewFixture,
  getStorefrontPreviewStylesheetManifest,
} from "../../../app/routes/app/app.settings/storefront-preview-fixtures";
import { isStorefrontPreviewFramePath } from "../../../app/root";
import {
  createStorefrontPreviewOverlayHost,
  mountStorefrontPreviewOverlays,
  openStorefrontPreviewProductPicker,
  setStorefrontPreviewLoadingPersistent,
} from "../../../app/routes/app/app.settings/storefront-preview-interactions";

describe("Settings Design production renderer preview", () => {
  it("accepts only versioned canonical preview commands", () => {
    const initialize = {
      version: PREVIEW_PROTOCOL_VERSION,
      type: "INITIALIZE",
      payload: {
        bundleType: "full_page",
        templateKey: "standard",
        viewport: "desktop",
        area: "product-card",
        areaLabel: "Product cards",
        scenario: "default",
        designCss: ":root{--bundle-global-primary-button:#123456}",
        locale: "en",
        currency: "USD",
      },
    };

    expect(isStorefrontPreviewCommand(initialize)).toBe(true);
    expect(isStorefrontPreviewCommand({ ...initialize, version: 1 })).toBe(false);
    expect(isStorefrontPreviewCommand({
      ...initialize,
      payload: { ...initialize.payload, templateKey: "legacy-template" },
    })).toBe(false);
    expect(isStorefrontPreviewCommand({
      ...initialize,
      payload: { ...initialize.payload, viewport: "tablet" },
    })).toBe(false);
    expect(isStorefrontPreviewCommand({
      ...initialize,
      payload: { ...initialize.payload, templateKey: "product-grid" },
    })).toBe(false);
    expect(isStorefrontPreviewCommand({
      version: 2,
      type: "SET_TEMPLATE",
      payload: { bundleType: "product_page", templateKey: "classic" },
    })).toBe(false);
    expect(isStorefrontPreviewCommand({ version: 2, type: "UPDATE_DESIGN", payload: {} })).toBe(false);
    expect(isStorefrontPreviewCommand({
      version: 1,
      type: "SET_SURFACE",
      payload: { surface: "validation" },
    })).toBe(false);
  });

  it("accepts the complete command and event vocabulary", () => {
    const commands = [
      { version: 2, type: "UPDATE_DESIGN", payload: { designCss: "body{}" } },
      { version: 2, type: "SET_TEMPLATE", payload: { bundleType: "product_page", templateKey: "product-grid" } },
      { version: 2, type: "SET_VIEWPORT", payload: { viewport: "mobile" } },
      { version: 2, type: "SET_AREA", payload: { area: "cart-summary", areaLabel: "Cart / summary" } },
      { version: 2, type: "SET_SCENARIO", payload: { scenario: "validation" } },
      { version: 2, type: "RESET_INTERACTION", payload: {} },
    ];
    commands.forEach((command) => expect(isStorefrontPreviewCommand(command)).toBe(true));

    expect(isStorefrontPreviewEvent({ version: 2, type: "READY", payload: {} })).toBe(true);
    expect(isStorefrontPreviewEvent({
      version: 2,
      type: "INTERACTION_CHANGED",
      payload: { selectedQuantity: 2 },
    })).toBe(true);
    expect(isStorefrontPreviewEvent({
      version: 2,
      type: "SCENARIO_CHANGED",
      payload: { scenario: "default" },
    })).toBe(true);
    expect(isStorefrontPreviewEvent({
      version: 2,
      type: "ERROR",
      payload: { message: "Preview failed" },
    })).toBe(true);
    expect(isStorefrontPreviewEvent({ version: 1, type: "READY", payload: {} })).toBe(false);
  });

  it.each([
    ["standard", "full_page", "STANDARD"],
    ["classic", "full_page", "CLASSIC"],
    ["compact", "full_page", "COMPACT"],
    ["horizontal", "full_page", "HORIZONTAL"],
    ["product-list", "product_page", "LIST"],
    ["product-grid", "product_page", "GRID"],
    ["horizontal-slots", "product_page", "HORIZONTAL_SLOTS"],
    ["vertical-slots", "product_page", "VERTICAL_SLOTS"],
  ] as const)("maps %s to the production stylesheet and bundle contract", (templateKey, bundleType, preset) => {
    const manifest = getStorefrontPreviewStylesheetManifest(templateKey);
    const fixture = buildStorefrontPreviewFixture(templateKey);

    expect(manifest.bundleType).toBe(bundleType);
    expect(manifest.stylesheets.length).toBeGreaterThanOrEqual(4);
    expect(new Set(manifest.stylesheets).size).toBe(manifest.stylesheets.length);
    expect(fixture.bundle.bundleType).toBe(bundleType);
    expect(fixture.bundle.bundleDesignPresetId).toBe(preset);
    expect(fixture.bundle.steps).toHaveLength(2);
    expect(fixture.stepProductData).toHaveLength(2);
    expect(fixture.stepProductData.every((products) => products.length >= 2)).toBe(true);
    expect(fixture.bundle.steps.every((step) => (
      step.categories.every((category) => category.products.every((product) => product.selectionId))
    ))).toBe(true);
  });

  it("loads every production PPB base module needed by the picker drawer", () => {
    expect(getStorefrontPreviewStylesheetManifest("vertical-slots").stylesheets).toEqual([
      "ppb-base",
      "ppb-modal-product-grid",
      "ppb-modal-footer",
      "ppb-discount-footer",
      "ppb-selection-loading",
      "ppb-bottom-sheet",
      "ppb-slot-cards",
      "ppb-quantity-pills",
      "ppb-purchase-options",
      "ppb-discount-feedback",
      "ppb-mobile-drawers",
      "ppb-embed-host",
      "ppb-modal",
      "product-modal-shell",
      "product-modal-controls",
    ]);
  });

  it("keeps the renderer fixture local, hydrated, and side-effect free", () => {
    const fixture = buildStorefrontPreviewFixture("vertical-slots");

    expect(fixture.capabilities).toEqual({
      analytics: false,
      cart: false,
      externalNavigation: false,
      network: false,
      persistence: false,
    });
    for (const products of fixture.stepProductData) {
      for (const product of products) {
        expect(product.selectionId).toMatch(/^\d+$/);
        expect(product.imageUrl).toMatch(/^\/design-preview-product-[1-4]\.png$/);
        expect(product.variants).not.toHaveLength(0);
      }
    }
    expect(buildStorefrontPreviewFixture("standard").stepProductData[0][0].selectionId)
      .toMatch(/^gid:\/\/shopify\/ProductVariant\//);
  });

  it("provides one production-shaped FPB block offer beside a local product form", () => {
    const fixture = buildStorefrontPreviewUpsellFixture();

    expect(fixture.offer).toEqual(expect.objectContaining({
      bundleId: "settings-design-preview",
      mode: "block",
      imageUrl: "/design-preview-product-4.png",
      preselectBrowsedProduct: false,
    }));
    expect(fixture.offer.copy).toEqual({
      title: "Complete the set",
      description: "Build a curated bundle with this product and complementary essentials.",
      buttonText: "Build this bundle",
    });
    expect(fixture.context).toEqual(expect.objectContaining({
      productId: "9000000000001",
      productHandle: "preview-product-1",
      endpointUrl: "",
    }));
  });

  it("isolates only the dedicated preview-frame document", () => {
    expect(isStorefrontPreviewFramePath("/settings-design-preview-frame")).toBe(true);
    expect(isStorefrontPreviewFramePath("/settings-design-preview-frame/")).toBe(true);
    expect(isStorefrontPreviewFramePath("/app/settings")).toBe(false);
    expect(isStorefrontPreviewFramePath("/settings-design-preview-frame/child")).toBe(false);
  });

  it("accepts frame messages only from the expected same-origin window", () => {
    const expectedSource = {} as Window;
    expect(isTrustedStorefrontPreviewMessage(
      { origin: "https://preview.example", source: expectedSource },
      "https://preview.example",
      expectedSource,
    )).toBe(true);
    expect(isTrustedStorefrontPreviewMessage(
      { origin: "https://other.example", source: expectedSource },
      "https://preview.example",
      expectedSource,
    )).toBe(false);
    expect(isTrustedStorefrontPreviewMessage(
      { origin: "https://preview.example", source: {} as Window },
      "https://preview.example",
      expectedSource,
    )).toBe(false);
  });

  it("opens the product picker through the rendered storefront trigger", () => {
    const openModal = jest.fn();
    const setBottomSheetVisibility = jest.fn();
    const renderedTrigger = { dataset: { stepIndex: "1" } };
    const widgetRoot = {
      querySelector: jest.fn(() => renderedTrigger),
    } as unknown as HTMLElement;

    expect(openStorefrontPreviewProductPicker({ openModal, setBottomSheetVisibility }, widgetRoot)).toBe(true);
    expect(openModal).toHaveBeenCalledWith(1, renderedTrigger);
    expect(setBottomSheetVisibility).toHaveBeenCalledWith(true);
  });

  it("falls back to the production controller when no picker trigger is rendered", () => {
    const openModal = jest.fn();
    const widgetRoot = {
      querySelector: jest.fn(() => null),
    } as unknown as HTMLElement;

    expect(openStorefrontPreviewProductPicker({ openModal }, widgetRoot)).toBe(false);
    expect(openModal).toHaveBeenCalledWith(0);
  });

  it("keeps production overlays inside the stable preview-frame host", () => {
    const modal = {} as HTMLElement;
    const bsOverlay = {} as HTMLElement;
    const append = jest.fn();
    const host = { append } as unknown as HTMLElement;

    mountStorefrontPreviewOverlays({ elements: { modal, bsOverlay } }, host);

    expect(append).toHaveBeenNthCalledWith(1, bsOverlay);
    expect(append).toHaveBeenNthCalledWith(2, modal);
  });

  it("owns the production overlay host outside the renderer tree and removes it on cleanup", () => {
    const host = { remove: jest.fn() } as unknown as HTMLElement;
    const append = jest.fn();
    const documentRef = {
      body: { append },
      createElement: jest.fn(() => host),
    } as unknown as Document;

    const result = createStorefrontPreviewOverlayHost(documentRef);

    expect(append).toHaveBeenCalledWith(host);

    result.cleanup();

    expect(host.remove).toHaveBeenCalledTimes(1);
  });

  it("keeps loading visible until the preview leaves the loading state", () => {
    const showLoadingOverlay = jest.fn();
    const hideLoadingOverlay = jest.fn();
    const controller = { showLoadingOverlay, hideLoadingOverlay };

    setStorefrontPreviewLoadingPersistent(controller, true);

    expect(showLoadingOverlay).toHaveBeenCalledWith(null, { bootstrap: true });
    controller.hideLoadingOverlay();
    expect(hideLoadingOverlay).not.toHaveBeenCalled();

    setStorefrontPreviewLoadingPersistent(controller, false);

    expect(hideLoadingOverlay).toHaveBeenCalledTimes(1);
    controller.hideLoadingOverlay();
    expect(hideLoadingOverlay).toHaveBeenCalledTimes(2);
  });

  it("guards the loading controller only once across repeated preview updates", () => {
    const showLoadingOverlay = jest.fn();
    const hideLoadingOverlay = jest.fn();
    const controller = { showLoadingOverlay, hideLoadingOverlay };

    setStorefrontPreviewLoadingPersistent(controller, true);
    const guardedHide = controller.hideLoadingOverlay;
    setStorefrontPreviewLoadingPersistent(controller, true);

    expect(controller.hideLoadingOverlay).toBe(guardedHide);
    controller.hideLoadingOverlay();
    expect(hideLoadingOverlay).not.toHaveBeenCalled();
  });
});
