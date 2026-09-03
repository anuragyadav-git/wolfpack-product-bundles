import { JSDOM } from "jsdom";
import { fullPageResponsiveLayoutMethods } from "../../../app/assets/widgets/full-page/methods/responsive-layout-methods";
import { fullPageValidationAddonsMethods } from "../../../app/assets/widgets/full-page/methods/validation-addons-methods";

describe("FPB category title rendering", () => {
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

  function createInitialRenderContext(showCategoryTabs: boolean) {
    const stepsContainer = document.createElement("div");
    const categoryTabs = document.createElement("nav");
    const categoryTitle = document.createElement("h3");

    return {
      elements: { stepsContainer },
      container: document.createElement("div"),
      config: { showCategoryTabs, showStepTimeline: false },
      currentStepIndex: 0,
      selectedBundle: { steps: [{}] },
      applyFullPageDesignPresetMarker: jest.fn(),
      createBundleBanners: jest.fn(() => null),
      shouldRenderFullPageStepChrome: jest.fn(() => true),
      createStepContentHeader: jest.fn(() => null),
      createCategoryTabs: jest.fn(() => categoryTabs),
      createStepBannerImage: jest.fn(() => null),
      shouldRenderFullPageSearch: jest.fn(() => false),
      createSearchInput: jest.fn(),
      createCategorySectionRows: jest.fn(() => null),
      createActiveCategoryTitle: jest.fn(() => categoryTitle),
      renderProductGridLoadingState: jest.fn(),
      renderSidePanel: jest.fn(),
      _observeSummaryPresentationMode: jest.fn(),
      loadStepProducts: jest.fn(async () => undefined),
      createFullPageProductGrid: jest.fn(() => document.createElement("div")),
      hideLoadingOverlay: jest.fn(),
      preloadNextStep: jest.fn(),
      _renderMobileSummaryTray: jest.fn(),
    };
  }

  it("uses category tabs as the sole active-category representation when tabs are enabled", async () => {
    const context = createInitialRenderContext(true);

    await fullPageResponsiveLayoutMethods.renderFullPageLayout.call(context);

    expect(context.createCategoryTabs).toHaveBeenCalledWith(0);
    expect(context.createActiveCategoryTitle).not.toHaveBeenCalled();
  });

  it("retains the standalone active-category label when category tabs are disabled", async () => {
    const context = createInitialRenderContext(false);

    await fullPageResponsiveLayoutMethods.renderFullPageLayout.call(context);

    expect(context.createCategoryTabs).not.toHaveBeenCalled();
    expect(context.createActiveCategoryTitle).toHaveBeenCalledWith(0);
  });

  it("does not recreate the standalone active-category label during tabbed step navigation", async () => {
    const stepsContainer = document.createElement("div");
    const contentSection = document.createElement("div");
    contentSection.className = "sidebar-content";
    const grid = document.createElement("div");
    grid.className = "full-page-product-grid-container";
    const sidePanel = document.createElement("div");
    sidePanel.className = "full-page-side-panel";
    contentSection.appendChild(grid);
    stepsContainer.append(contentSection, sidePanel);

    const context = {
      elements: { stepsContainer },
      config: { showCategoryTabs: true },
      currentStepIndex: 1,
      updateStepTimeline: jest.fn(),
      createStepContentHeader: jest.fn(() => null),
      createCategoryTabs: jest.fn(() => document.createElement("nav")),
      shouldRenderFullPageSearch: jest.fn(() => false),
      createSearchInput: jest.fn(),
      createActiveCategoryTitle: jest.fn(() => document.createElement("h3")),
      createCategorySectionRows: jest.fn(() => null),
      renderProductGridLoadingState: jest.fn(),
      renderSidePanel: jest.fn(),
      loadStepProducts: jest.fn(async () => undefined),
      createFullPageProductGrid: jest.fn(() => document.createElement("div")),
      hideLoadingOverlay: jest.fn(),
      preloadNextStep: jest.fn(),
      _renderMobileSummaryTray: jest.fn(),
      renderFullPageLayout: jest.fn(),
    };

    await fullPageValidationAddonsMethods._sidebarAdvanceToNextStep.call(context);

    expect(context.createCategoryTabs).toHaveBeenCalledWith(1);
    expect(context.createActiveCategoryTitle).not.toHaveBeenCalled();
  });
});
