import React from "react";

import {
  PpbStepRulesList,
  type PpbStepRulesListProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList";
import {
  PpbCategoryRulesList,
  type PpbCategoryRulesListProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList";
import {
  PpbRulesConfigurationCard,
  type PpbRulesConfigurationCardProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard";

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

describe("PPB rules boundaries", () => {
  it("adds a step rule through the explicit conditions owner", () => {
    const addConditionRule = jest.fn();
    const props = {
      conditionsState: {
        addConditionRule,
        stepConditions: { "step-1": [] },
      },
      step: { id: "step-1" },
    } as unknown as PpbStepRulesListProps;

    const view = PpbStepRulesList(props);
    const addButton = findElements(
      view,
      (element) => element.type === "s-button" && element.props.icon === "plus"
    )[0];
    addButton.props.onClick();
    expect(addConditionRule).toHaveBeenCalledWith("step-1");
  });

  it("toggles category-rule disclosure through the explicit category owner", () => {
    const setCategoryRulesOpen = jest.fn();
    const props = {
      adapter: {
        addCategoryConditionRule: jest.fn(),
        categoryRulesOpen: { "step-1__cat-1": true },
        removeCategoryConditionRule: jest.fn(),
        setCategoryRulesOpen,
        updateCategoryAutoNextRule: jest.fn(),
        updateCategoryConditionRule: jest.fn(),
      },
      step: { id: "step-1" },
      stepCategories: [{ id: "cat-1", conditions: [] }],
    } as unknown as PpbCategoryRulesListProps;

    const view = PpbCategoryRulesList(props);
    const disclosure = findElements(
      view,
      (element) => element.type === "s-clickable"
    )[0];
    disclosure.props.onClick();
    const updater = setCategoryRulesOpen.mock.calls[0][0];
    expect(updater({ "step-1__cat-1": true })).toEqual({
      "step-1__cat-1": false,
    });
  });

  it("switches to step rules through explicit step and category owners", () => {
    const addConditionRule = jest.fn();
    const clearCategoryConditionRules = jest.fn();
    const props = {
      addCategoryConditionRule: jest.fn(),
      categoryRulesAdapter: {
        addCategoryConditionRule: jest.fn(),
        categoryRulesOpen: {},
        removeCategoryConditionRule: jest.fn(),
        setCategoryRulesOpen: jest.fn(),
        updateCategoryAutoNextRule: jest.fn(),
        updateCategoryConditionRule: jest.fn(),
      },
      clearCategoryConditionRules,
      conditionsState: {
        addConditionRule,
        clearStepConditions: jest.fn(),
        stepConditions: { "step-1": [] },
      },
      step: { id: "step-1", StepCategory: [{ id: "cat-1" }] },
    } as unknown as PpbRulesConfigurationCardProps;

    const view = PpbRulesConfigurationCard(props);
    const radioGroups = findElements(
      view,
      (element) => element.props.role === "radiogroup"
    );
    expect(radioGroups).toHaveLength(1);
    const stepRadio = findElements(
      view,
      (element) =>
        element.type === "input" &&
        element.props.type === "radio" &&
        element.props.value === "step"
    )[0];
    stepRadio.props.onChange();

    expect(clearCategoryConditionRules).toHaveBeenCalledWith("step-1");
    expect(addConditionRule).toHaveBeenCalledWith("step-1");
  });
});
