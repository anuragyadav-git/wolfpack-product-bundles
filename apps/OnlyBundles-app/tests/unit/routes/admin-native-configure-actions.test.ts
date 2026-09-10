import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import { PpbStepCategoriesCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard";
import { PpbCategoryRulesList } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList";
import { PpbStepFlowCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard";
import { PpbStepRulesList } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList";
import { PpbStepConfigCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard";
import { StepSetupSection } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupSection";
import {
  CommonConfigureSidebar,
  CommonConfigureSupplement,
} from "../../../app/routes/app/_shared/bundle-configure/CommonConfigureSidebar";
import { CommonStepCategoryAccordion } from "../../../app/routes/app/_shared/bundle-configure/CommonStepCategoryAccordion";
import {
  SelectedCollectionsPanel,
  SelectedProductsPanel,
} from "../../../app/routes/app/_shared/bundle-configure/CommonStepCategorySelectedItems";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryAccordion",
  () => ({ PpbCategoryAccordion: () => null })
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.helpers",
  () => ({ QuestionHelpTooltip: () => null })
);

jest.mock("../../../app/components/shared/AssetUpload", () => ({
  AssetUpload: () => null,
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupShared",
  () => ({
    PlusIcon: () => React.createElement("span", null, "+"),
    getStepCategories: (step: { StepCategory?: unknown[] }) =>
      step.StepCategory ?? [],
  })
);

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupCategoryCard",
  () => ({ FpbStepCategoryCard: () => null })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupConfigCard",
  () => ({ FpbStepConfigCard: () => null })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupDetailsCard",
  () => ({ FpbStepSetupDetailsCard: () => null })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRulesCard",
  () => ({ FpbStepRulesCard: () => null })
);
jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/SmallComponents",
  () => ({ QuestionHelpTooltip: () => null })
);

describe("native configure actions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      Event: dom.window.Event,
      MouseEvent: dom.window.MouseEvent,
      HTMLElement: dom.window.HTMLElement,
      IS_REACT_ACT_ENVIRONMENT: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
  });

  function clickAction(label: string) {
    const action = Array.from(
      container.querySelectorAll<HTMLElement>(
        "button, s-button, s-clickable, s-clickable-chip"
      )
    ).find(
      (element) =>
        element.textContent?.includes(label) ||
        element.getAttribute("aria-label")?.includes(label) ||
        element.getAttribute("accessibilitylabel")?.includes(label)
    );

    expect(action).toBeDefined();
    flushSync(() => {
      action?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  it("delegates Add Step to the PPB route owner", () => {
    const handleAddNewStep = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(
          PpbStepFlowCard,
          {
            activeTabIndex: 0,
            handleAddNewStep,
            navigateToStep: jest.fn(),
            stepsState: { steps: [{ id: "step-1", name: "Step 1" }] },
          } as unknown as React.ComponentProps<typeof PpbStepFlowCard>,
          React.createElement("div")
        )
      );
    });

    const addStepAction = Array.from(
      container.querySelectorAll<HTMLElement>('s-button[icon="plus"]')
    ).find((element) =>
      element.textContent?.includes("stepsetupsection.addStep")
    );
    expect(addStepAction?.getAttribute("accessibilitylabel")).toBeTruthy();
    clickAction("stepsetupsection.addStep");
    expect(handleAddNewStep).toHaveBeenCalledTimes(1);
  });

  it("delegates Add Step to the FPB route owner", () => {
    const onAddStep = jest.fn();
    const categoryAdapter: React.ComponentProps<
      typeof StepSetupSection
    >["categoryAdapter"] = {
      categoryActiveTabs: {},
      categoryOpen: {},
      draggedCatKey: null,
      dragOverCatKey: null,
      handleCatDragEnd: jest.fn(),
      handleCatDragStart: jest.fn(),
      handleCatDrop: jest.fn(),
      hidePolarisModal: jest.fn(),
      markAsDirty: jest.fn(),
      openStepCategoryMultiLanguageModal: jest.fn(),
      setCategoryActiveTabs: jest.fn(),
      setCategoryOpen: jest.fn(),
      setDragOverCatKey: jest.fn(),
      shopify: {},
      showPolarisModal: jest.fn(),
      stepsState: { updateStepField: jest.fn() },
      translationActionsDisabled: false,
      styles: {},
    };
    const ruleMode: React.ComponentProps<typeof StepSetupSection>["ruleMode"] =
      {
        rules: {
          addCategoryConditionRule: jest.fn(),
          addStepConditionRule: jest.fn(),
          categoryRulesOpen: {},
          clearCategoryConditionRules: jest.fn(),
          clearStepConditions: jest.fn(),
          removeCategoryConditionRule: jest.fn(),
          removeStepConditionRule: jest.fn(),
          setCategoryRulesOpen: jest.fn(),
          stepConditions: {},
          styles: {},
          updateCategoryAutoNextRule: jest.fn(),
          updateCategoryConditionRule: jest.fn(),
          updateStepConditionRule: jest.fn(),
        },
      };

    flushSync(() => {
      root.render(
        React.createElement(StepSetupSection, {
          activeSection: "step_setup",
          activeTabIndex: 0,
          styles: {},
          onAddStep,
          onNavigateStep: jest.fn(),
          slideDir: null,
          slideKey: 0,
          steps: [{ id: "step-1", name: "Step 1" }],
          categoryAdapter,
          details: {
            cloneStep: jest.fn(),
            deleteStep: jest.fn(),
            markAsDirty: jest.fn(),
            openTranslations: jest.fn(),
            translationsDisabled: false,
            updateStepField: jest.fn(),
            validationErrors: {},
            clearValidationError: jest.fn(),
          },
          ruleMode,
          config: {
            markAsDirty: jest.fn(),
            pickerStepId: null,
            setPickerStepId: jest.fn(),
            updateStepField: jest.fn(),
          },
        })
      );
    });

    const addStepAction = Array.from(
      container.querySelectorAll<HTMLElement>('s-button[icon="plus"]')
    ).find((element) =>
      element.textContent?.includes("stepsetupsection.addStep")
    );
    expect(addStepAction?.getAttribute("accessibilitylabel")).toBeTruthy();
    clickAction("stepsetupsection.addStep");
    expect(onAddStep).toHaveBeenCalledTimes(1);
  });

  it("delegates Add Category to the PPB step owner", () => {
    const markAsDirty = jest.fn();
    const updateStepField = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(PpbStepCategoriesCard, {
          categoryAdapter: {},
          markAsDirty,
          step: { id: "step-1", StepCategory: [] },
          stepsState: { updateStepField },
        } as unknown as React.ComponentProps<typeof PpbStepCategoriesCard>)
      );
    });

    clickAction("stepsetupcategoryfooter.addCategory");
    expect(updateStepField).toHaveBeenCalledWith("step-1", "StepCategory", [
      expect.objectContaining({ name: "", sortOrder: 0 }),
    ]);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });

  it("delegates Add Rule to the PPB category-rule owner", () => {
    const addCategoryConditionRule = jest.fn();

    flushSync(() => {
      root.render(
        React.createElement(PpbCategoryRulesList, {
          adapter: {
            addCategoryConditionRule,
            categoryRulesOpen: {},
            removeCategoryConditionRule: jest.fn(),
            setCategoryRulesOpen: jest.fn(),
            updateCategoryAutoNextRule: jest.fn(),
            updateCategoryConditionRule: jest.fn(),
          },
          step: { id: "step-1" },
          stepCategories: [
            { id: "category-1", name: "Category 1", conditions: [] },
          ],
        })
      );
    });

    clickAction("stepsetuprulemodecontent.addRule");
    expect(addCategoryConditionRule).toHaveBeenCalledWith("step-1", 0);
  });

  it("delegates Add Rule to the PPB step-rule owner", () => {
    const addConditionRule = jest.fn();
    const conditionsState = {
      addConditionRule,
      removeConditionRule: jest.fn(),
      stepConditions: { "step-1": [] },
      updateConditionRule: jest.fn(),
    };

    flushSync(() => {
      root.render(
        React.createElement(PpbStepRulesList, {
          conditionsState,
          step: { id: "step-1" },
        } as unknown as React.ComponentProps<typeof PpbStepRulesList>)
      );
    });

    clickAction("stepsetuprulemodecontent.addRule");
    expect(addConditionRule).toHaveBeenCalledWith("step-1");
  });

  it("clears a PPB step image through the route-owned draft callbacks", () => {
    const markAsDirty = jest.fn();
    const setShowIconPickerForStep = jest.fn();
    const updateStepField = jest.fn();
    flushSync(() => {
      root.render(
        React.createElement(PpbStepConfigCard, {
          markAsDirty,
          setShowIconPickerForStep,
          showIconPickerForStep: null,
          step: { id: "step-1", stepImage: "https://cdn.shopify.com/step.png" },
          stepsState: { updateStepField },
        } as unknown as React.ComponentProps<typeof PpbStepConfigCard>)
      );
    });

    clickAction("adminAttributes.removeStepIcon");
    expect(updateStepField).toHaveBeenCalledWith("step-1", "stepImage", null);
    expect(setShowIconPickerForStep).toHaveBeenCalledWith(null);
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });

  it("delegates bundle-product menu and edit actions to their route owners", () => {
    const handleBundleProductSelect = jest.fn();
    const handleSyncProduct = jest.fn();
    const handlePlaceWidget = jest.fn();
    const openProductInAdmin = jest.fn();
    const styles = new Proxy<Record<string, string>>(
      {},
      { get: (_target, property) => String(property) }
    );

    flushSync(() => {
      root.render(
        React.createElement(CommonConfigureSidebar, {
          adapter: {
            activeSection: "step_setup",
            appEmbedEnabled: true,
            bundle: { shopifyProductId: "gid://shopify/Product/123" },
            bundleProduct: null,
            bundleSetupItems: [],
            bundleVisibilityChildItems: [],
            formState: { bundleName: "Bundle" },
            handleBundleProductSelect,
            handleSectionChange: jest.fn(),
            handleSyncProduct,
            openProductInAdmin,
            openSelectTemplateModal: jest.fn(),
            parentProductStatusUi: {
              isLoading: false,
              label: "Active",
              showUnlistedBanner: false,
              tone: "success",
            },
            pricingState: { discountEnabled: false, discountType: "" },
            styles,
            VisibilityBadge: () => React.createElement("span"),
          },
        })
      );
    });

    clickAction("commonconfiguresidebar.replaceProduct");
    clickAction("commonconfiguresidebar.syncProduct");
    const editProductAction = Array.from(
      container.querySelectorAll<HTMLElement>("s-clickable")
    ).find((element) =>
      element.textContent?.includes("commonconfiguresidebar.editProduct")
    );
    expect(editProductAction).toBeDefined();
    clickAction("commonconfiguresidebar.editProduct");
    flushSync(() => {
      root.render(
        React.createElement(CommonConfigureSupplement, {
          liveCard: {
            actionLabel: "Place Widget",
            disabled: false,
            label: "Place on theme",
            loading: false,
            onAction: handlePlaceWidget,
            title: "Take your bundle live",
          },
          styles,
        })
      );
    });
    const placeWidgetAction = container.querySelector<HTMLElement>(
      's-button[icon="theme-edit"]'
    );
    expect(placeWidgetAction?.getAttribute("accessibilitylabel")).toBe(
      "Place Widget"
    );
    clickAction("Place Widget");

    expect(handleBundleProductSelect).toHaveBeenCalledTimes(1);
    expect(handleSyncProduct).toHaveBeenCalledTimes(1);
    expect(openProductInAdmin).toHaveBeenCalledWith("123");
    expect(handlePlaceWidget).toHaveBeenCalledTimes(1);
  });

  it("preserves category clone and delete updates through native row actions", () => {
    const markAsDirty = jest.fn();
    const updateStepField = jest.fn();
    const styles = new Proxy<Record<string, string>>(
      {},
      { get: (_target, property) => String(property) }
    );
    const categories = [
      { id: "category-1", name: "Category 1", products: [], collections: [] },
      { id: "category-2", name: "Category 2", products: [], collections: [] },
    ];

    flushSync(() => {
      root.render(
        React.createElement(CommonStepCategoryAccordion, {
          adapter: {
            categoryActiveTabs: {},
            categoryOpen: {},
            draggedCatKey: null,
            dragOverCatKey: null,
            handleCatDragEnd: jest.fn(),
            handleCatDragStart: jest.fn(),
            handleCatDrop: jest.fn(),
            hidePolarisModal: jest.fn(),
            markAsDirty,
            openStepCategoryMultiLanguageModal: jest.fn(),
            setCategoryActiveTabs: jest.fn(),
            setCategoryOpen: jest.fn(),
            setDragOverCatKey: jest.fn(),
            shopify: {},
            showPolarisModal: jest.fn(),
            stepsState: { updateStepField },
            translationActionsDisabled: false,
            styles,
          },
          cat: categories[0],
          catIndex: 0,
          step: { id: "step-1", StepCategory: categories },
        })
      );
    });

    clickAction("adminAttributes.clone");
    expect(updateStepField).toHaveBeenNthCalledWith(
      1,
      "step-1",
      "StepCategory",
      expect.arrayContaining([
        expect.objectContaining({ name: "Category 1 Copy", sortOrder: 2 }),
      ])
    );

    clickAction("dashboard.deleteModal.delete");
    expect(updateStepField).toHaveBeenNthCalledWith(
      2,
      "step-1",
      "StepCategory",
      [categories[1]]
    );
    expect(markAsDirty).toHaveBeenCalledTimes(2);
  });

  it("preserves selected product and collection removal callbacks", () => {
    const removeProduct = jest.fn();
    const removeCollection = jest.fn();
    const showProductsModal = jest.fn();
    const showCollectionsModal = jest.fn();
    const styles = new Proxy<Record<string, string>>(
      {},
      { get: (_target, property) => String(property) }
    );

    flushSync(() => {
      root.render(
        React.createElement(
          React.Fragment,
          null,
          React.createElement(SelectedProductsPanel, {
            products: [{ id: "product-1", title: "Product One" }],
            draggedProductIndex: null,
            handlePickProducts: jest.fn(),
            hidePolarisModal: jest.fn(),
            modalId: "products-modal",
            modalRef: React.createRef(),
            removeProduct,
            reorderProduct: jest.fn(),
            setDraggedProductIndex: jest.fn(),
            showPolarisModal: showProductsModal,
            styles,
          }),
          React.createElement(SelectedCollectionsPanel, {
            collections: [{ id: "collection-1", title: "Collection One" }],
            draggedCollectionIndex: null,
            handlePickCollections: jest.fn(),
            hidePolarisModal: jest.fn(),
            modalId: "collections-modal",
            modalRef: React.createRef(),
            removeCollection,
            reorderCollection: jest.fn(),
            setDraggedCollectionIndex: jest.fn(),
            showPolarisModal: showCollectionsModal,
            styles,
          })
        )
      );
    });

    clickAction("adminDynamic.selectedCount");
    const selectedCountActions = Array.from(
      container.querySelectorAll<HTMLElement>("s-clickable-chip, button")
    ).filter((element) =>
      element.textContent?.includes("adminDynamic.selectedCount")
    );
    flushSync(() => {
      selectedCountActions[1]?.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
      );
    });
    clickAction("Remove Product One");
    clickAction("Remove Collection One");

    expect(showProductsModal).toHaveBeenCalledTimes(1);
    expect(showCollectionsModal).toHaveBeenCalledTimes(1);
    expect(removeProduct).toHaveBeenCalledWith("product-1");
    expect(removeCollection).toHaveBeenCalledWith("collection-1");
  });
});
