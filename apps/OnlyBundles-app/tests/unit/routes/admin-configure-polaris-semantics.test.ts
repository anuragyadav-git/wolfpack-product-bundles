import React from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";

import { CommonConfigureSidebar } from "../../../app/routes/app/_shared/bundle-configure/CommonConfigureSidebar";
import { BundleSubscriptionConfiguration } from "../../../app/routes/app/_shared/bundle-configure/BundleSubscriptionConfiguration";
import { FpbStepCategoryFooter } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupCategoryFooter";
import { FpbStepRuleModeContent } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRuleModeContent";
import { FpbProgressBarOptions } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountProgressBarOptions";
import { PpbRulesConfigurationCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard";
import { PpbStepCategoriesCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard";
import { PpbStepConfigCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard";
import { PpbStepFlowCard } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard";
import { PpbStepRulesList } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../app/components/shared/AssetUpload", () => ({
  AssetUpload: ({
    label,
    labelAccessibilityVisibility,
  }: {
    label?: string;
    labelAccessibilityVisibility?: string;
  }) => {
    const ReactModule: typeof React = jest.requireActual("react");
    return ReactModule.createElement("s-drop-zone", {
      label,
      labelAccessibilityVisibility,
    });
  },
}));

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList",
  () => ({ PpbCategoryRulesList: () => null })
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.helpers",
  () => ({ QuestionHelpTooltip: () => null })
);

describe("configure Polaris semantics", () => {
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

  function findElements(
    node: React.ReactNode,
    predicate: (element: React.ReactElement) => boolean
  ): React.ReactElement[] {
    const matches: React.ReactElement[] = [];
    for (const child of React.Children.toArray(node)) {
      if (!React.isValidElement(child)) continue;
      if (predicate(child)) matches.push(child);
      matches.push(...findElements(child.props.children, predicate));
    }
    return matches;
  }

  function expectIconActionsNamed(view: React.ReactNode) {
    const iconActions = findElements(
      view,
      (element) => element.type === "s-button" && Boolean(element.props.icon)
    );
    expect(iconActions.length).toBeGreaterThan(0);
    for (const action of iconActions) {
      expect(action.props.accessibilityLabel).toEqual(expect.any(String));
      expect(action.props.accessibilityLabel).not.toHaveLength(0);
    }
  }

  it("delegates the FPB Add Category action to its route owner", () => {
    const onAddCategory = jest.fn();
    const view = FpbStepCategoryFooter({
      onAddCategory,
      onDisplayVariantsChange: jest.fn(),
      step: {},
    });
    const addCategoryAction = findElements(
      view,
      (element) =>
        element.type === "s-button" && element.props.icon === "plus"
    );

    expect(addCategoryAction).toHaveLength(1);
    addCategoryAction[0].props.onClick();
    expect(onAddCategory).toHaveBeenCalledTimes(1);
  });

  it("uses one FPB radio group to switch the mutually exclusive rule mode", () => {
    const addStepConditionRule = jest.fn();
    const clearCategoryConditionRules = jest.fn();

    const view = FpbStepRuleModeContent({
      step: { id: "step-1", StepCategory: [] },
      rules: {
        addCategoryConditionRule: jest.fn(),
        addStepConditionRule,
        categoryRulesOpen: {},
        clearCategoryConditionRules,
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
    });
    const radioGroups = findElements(
      view,
      (element) => element.props.role === "radiogroup"
    );

    expect(radioGroups).toHaveLength(1);
    const radios = findElements(
      view,
      (element) => element.type === "input" && element.props.type === "radio"
    );
    expect(radios).toHaveLength(2);
    expectIconActionsNamed(view);

    radios.find((radio) => radio.props.value === "step")?.props.onChange();
    expect(clearCategoryConditionRules).toHaveBeenCalledWith("step-1");
    expect(addStepConditionRule).toHaveBeenCalledWith("step-1");
  });

  it("uses one PPB radio group to switch the mutually exclusive rule mode", () => {
    const addCategoryConditionRule = jest.fn();
    const clearStepConditions = jest.fn();

    const view = PpbRulesConfigurationCard({
      addCategoryConditionRule,
      categoryRulesAdapter: {},
      clearCategoryConditionRules: jest.fn(),
      conditionsState: {
        addConditionRule: jest.fn(),
        clearStepConditions,
        stepConditions: {},
      },
      step: {
        id: "step-1",
        StepCategory: [
          { id: "category-1", conditions: [] },
          { id: "category-2", conditions: [] },
        ],
      },
    } as unknown as React.ComponentProps<typeof PpbRulesConfigurationCard>);
    const radioGroups = findElements(
      view,
      (element) => element.props.role === "radiogroup"
    );

    expect(radioGroups).toHaveLength(1);
    const radios = findElements(
      view,
      (element) => element.type === "input" && element.props.type === "radio"
    );
    expect(radios).toHaveLength(3);

    radios.find((radio) => radio.props.value === "category")?.props.onChange();
    expect(clearStepConditions).toHaveBeenCalledWith("step-1");
    expect(addCategoryConditionRule).toHaveBeenCalledWith("step-1", 0);
  });

  it("gives bundle-product menu actions explicit accessible names", () => {
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
            handleBundleProductSelect: jest.fn(),
            handleSectionChange: jest.fn(),
            handleSyncProduct: jest.fn(),
            openProductInAdmin: jest.fn(),
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

    for (const icon of ["edit", "duplicate"]) {
      const action = container.querySelector(`s-menu s-button[icon="${icon}"]`);
      expect(action?.getAttribute("accessibilitylabel")).toBeTruthy();
    }
  });

  it("gives the PPB step-image drop zone an accessible name", () => {
    flushSync(() => {
      root.render(
        React.createElement(PpbStepConfigCard, {
          markAsDirty: jest.fn(),
          step: { id: "step-1", stepImage: null },
          stepsState: { updateStepField: jest.fn() },
        } as unknown as React.ComponentProps<typeof PpbStepConfigCard>)
      );
    });

    const dropZone = container.querySelector("s-drop-zone");
    expect(dropZone?.getAttribute("label")).toBeTruthy();
    expect(dropZone?.getAttribute("labelaccessibilityvisibility")).toBe(
      "exclusive",
    );
    expect(container.querySelector('s-button[icon="replace"]')).toBeNull();
  });

  it("names the remaining FPB and PPB add and replace icon actions", () => {
    expectIconActionsNamed(
      FpbStepCategoryFooter({
        onAddCategory: jest.fn(),
        onDisplayVariantsChange: jest.fn(),
        step: {},
      })
    );
    expectIconActionsNamed(
      PpbStepFlowCard({
        activeTabIndex: 0,
        children: React.createElement("div"),
        handleAddNewStep: jest.fn(),
        navigateToStep: jest.fn(),
        stepsState: { steps: [{ id: "step-1", name: "Step 1" }] },
      } as unknown as React.ComponentProps<typeof PpbStepFlowCard>)
    );
    expectIconActionsNamed(
      PpbStepCategoriesCard({
        categoryAdapter: {},
        markAsDirty: jest.fn(),
        step: { id: "step-1", StepCategory: [] },
        stepsState: { updateStepField: jest.fn() },
      } as unknown as React.ComponentProps<typeof PpbStepCategoriesCard>)
    );
    expectIconActionsNamed(
      PpbStepRulesList({
        conditionsState: {
          addConditionRule: jest.fn(),
          stepConditions: { "step-1": [] },
        },
        step: { id: "step-1" },
      } as unknown as React.ComponentProps<typeof PpbStepRulesList>)
    );
  });

  it("uses one choice list for the mutually exclusive FPB progress type", () => {
    const setProgressBarType = jest.fn();
    const view = FpbProgressBarOptions({
      markAsDirty: jest.fn(),
      onOpenTranslations: jest.fn(),
      pricingState: {
        discountRules: [],
        pricingDisplayOptions: { progressBar: { type: "step_based" } },
        setProgressBarType,
        showDiscountProgressBar: true,
      } as never,
      setTierTextByRuleId: jest.fn(),
      styles: {},
      tierTextByRuleId: {},
      translationsAvailable: true,
    });
    const choiceLists = findElements(
      view,
      (element) => element.type === "s-choice-list"
    );

    expect(choiceLists).toHaveLength(1);
    expect(
      findElements(view, (element) => element.type === "s-choice")
    ).toHaveLength(2);
    expectIconActionsNamed(view);

    choiceLists[0].props.onChange({ currentTarget: { values: ["simple"] } });
    expect(setProgressBarType).toHaveBeenCalledWith("simple");
  });

  it("uses one choice list for the subscription discount purchase scope", () => {
    const setSubscriptionConfig = jest.fn();
    const subscriptionConfig = {
      bundleDiscountAppliesOn: "subscription" as const,
      copy: { subtitle: "", title: "", unavailableMessage: "" },
      defaultPurchaseOption: {
        kind: "selling_plan" as const,
        sellingPlanId: "plan-1",
      },
      enabled: true,
      oneTimePurchase: { description: "", enabled: true, title: "One time" },
      planCopy: {},
      recurringBundleDiscount: true,
      selectedGroup: {
        id: "group-1",
        name: "Subscribe",
        options: [],
        plans: [],
      },
      selectedPlanIds: ["plan-1"],
      showDiscountOnProductCards: true,
      translations: {},
      version: 1 as const,
    };
    const view = BundleSubscriptionConfiguration({
      onOpenTranslations: jest.fn(),
      setSubscriptionConfig,
      shopLocales: [{ locale: "en", name: "English", primary: true }],
      subscriptionConfig,
      uniquePlanRows: [],
      validationErrors: {},
    });
    const choiceLists = findElements(
      view,
      (element) => element.type === "s-choice-list"
    );

    expect(choiceLists).toHaveLength(1);
    expect(
      findElements(view, (element) => element.type === "s-choice")
    ).toHaveLength(3);
    expectIconActionsNamed(view);

    choiceLists[0].props.onChange({ currentTarget: { values: ["both"] } });
    const update = setSubscriptionConfig.mock.calls[0][0];
    expect(update(subscriptionConfig)).toEqual({
      ...subscriptionConfig,
      bundleDiscountAppliesOn: "both",
    });
  });
});
