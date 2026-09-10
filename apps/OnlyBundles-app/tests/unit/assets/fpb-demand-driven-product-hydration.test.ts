import {JSDOM} from "jsdom";

import {fullPageResponsiveLayoutMethods} from "../../../app/assets/widgets/full-page/methods/responsive-layout-methods";
import {fullPageValidationAddonsMethods} from "../../../app/assets/widgets/full-page/methods/validation-addons-methods";

describe("FPB demand-driven product hydration", () => {
  let originalDocument: Document;

  beforeEach(() => {
    originalDocument = globalThis.document;
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: dom.window.document,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
    });
  });

  it("hydrates only the active step during the initial render", async () => {
    const loadStepProducts = jest.fn().mockResolvedValue(undefined);
    const speculativeHydration = jest.fn();
    const stepsContainer = document.createElement("div");
    const context = {
      elements: {stepsContainer},
      container: document.createElement("div"),
      config: {showCategoryTabs: false, showStepTimeline: false},
      currentStepIndex: 0,
      selectedBundle: {steps: [{}, {}, {}]},
      applyFullPageDesignPresetMarker: jest.fn(),
      createBundleBanners: jest.fn(() => null),
      shouldRenderFullPageStepChrome: jest.fn(() => false),
      createStepContentHeader: jest.fn(() => null),
      createStepBannerImage: jest.fn(() => null),
      shouldRenderFullPageSearch: jest.fn(() => false),
      createSearchInput: jest.fn(),
      createCategorySectionRows: jest.fn(() => null),
      createActiveCategoryTitle: jest.fn(() => null),
      renderProductGridLoadingState: jest.fn(),
      renderSidePanel: jest.fn(),
      _observeSummaryPresentationMode: jest.fn(),
      loadStepProducts,
      createFullPageProductGrid: jest.fn(() => document.createElement("div")),
      hideLoadingOverlay: jest.fn(),
      preloadAllSteps: speculativeHydration,
      _renderMobileSummaryTray: jest.fn(),
    };

    await fullPageResponsiveLayoutMethods.renderFullPageLayout.call(context);

    expect(loadStepProducts.mock.calls).toEqual([[0]]);
    expect(speculativeHydration).not.toHaveBeenCalled();
  });

  it("hydrates only the destination step during navigation", async () => {
    const loadStepProducts = jest.fn().mockResolvedValue(undefined);
    const speculativeHydration = jest.fn();
    const stepsContainer = document.createElement("div");
    const contentSection = document.createElement("div");
    contentSection.className = "sidebar-content";
    const productGrid = document.createElement("div");
    productGrid.className = "full-page-product-grid-container";
    const sidePanel = document.createElement("div");
    sidePanel.className = "full-page-side-panel";
    contentSection.appendChild(productGrid);
    stepsContainer.append(contentSection, sidePanel);

    const context = {
      elements: {stepsContainer},
      config: {showCategoryTabs: false},
      currentStepIndex: 1,
      selectedBundle: {steps: [{}, {}, {}]},
      updateStepTimeline: jest.fn(),
      createStepContentHeader: jest.fn(() => null),
      shouldRenderFullPageSearch: jest.fn(() => false),
      createSearchInput: jest.fn(),
      createActiveCategoryTitle: jest.fn(() => null),
      createCategorySectionRows: jest.fn(() => null),
      renderProductGridLoadingState: jest.fn(),
      renderSidePanel: jest.fn(),
      loadStepProducts,
      createFullPageProductGrid: jest.fn(() => document.createElement("div")),
      hideLoadingOverlay: jest.fn(),
      preloadAllSteps: speculativeHydration,
      _renderMobileSummaryTray: jest.fn(),
      renderFullPageLayout: jest.fn(),
    };

    await fullPageValidationAddonsMethods._sidebarAdvanceToNextStep.call(
      context,
    );

    expect(loadStepProducts.mock.calls).toEqual([[1]]);
    expect(speculativeHydration).not.toHaveBeenCalled();
  });
});
