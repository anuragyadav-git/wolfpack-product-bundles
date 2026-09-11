import React from "react";
import { AssetUpload } from "../../../app/components/shared/AssetUpload";

import {
  PpbStepFlowCard,
  type PpbStepFlowCardProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard";
import {
  PpbStepSetupDetailsCard,
  type PpbStepSetupDetailsCardProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupDetailsCard";
import {
  PpbStepConfigCard,
  type PpbStepConfigCardProps,
} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard";

function findElement(
  node: React.ReactNode,
  predicate: (element: React.ReactElement) => boolean,
): React.ReactElement | null {
  for (const child of React.Children.toArray(node)) {
    if (!React.isValidElement(child)) continue;
    if (predicate(child)) return child;
    const nested = findElement(child.props.children, predicate);
    if (nested) return nested;
  }
  return null;
}

const step = { id: "step-1", name: "Choose products", enabled: true };

describe("PPB Step Setup shell leaves", () => {
  it("navigates through the explicit Step Flow owner", () => {
    const navigateToStep = jest.fn();
    const props = {
      activeTabIndex: 0,
      children: null,
      handleAddNewStep: jest.fn(),
      navigateToStep,
      stepsState: { steps: [step] },
    } as unknown as PpbStepFlowCardProps;

    const view = PpbStepFlowCard(props);
    const stepButton = findElement(
      view,
      (element) => element.type === "button",
    );
    stepButton!.props.onClick();
    expect(navigateToStep).toHaveBeenCalledWith(0);
  });

  it("updates enablement through the explicit step-details owner", () => {
    const updateStepField = jest.fn();
    const props = {
      clearValidationError: jest.fn(),
      cloneStep: jest.fn(),
      deleteStep: jest.fn(),
      isFirstStep: false,
      markAsDirty: jest.fn(),
      openStepMultiLanguageModal: jest.fn(),
      shopLocales: [],
      step,
      stepsState: { steps: [step, { id: "step-2", name: "Second" }], updateStepField },
      validationErrors: {},
    } as unknown as PpbStepSetupDetailsCardProps;

    const view = PpbStepSetupDetailsCard(props);
    const enabledSwitch = findElement(
      view,
      (element) => element.type === "s-switch",
    );
    enabledSwitch!.props.onChange({ target: { checked: false } });
    expect(updateStepField).toHaveBeenCalledWith("step-1", "enabled", false);
  });

  it("updates the step title through the explicit Step Config owner", () => {
    const updateStepField = jest.fn();
    const props = {
      markAsDirty: jest.fn(),
      step,
      stepsState: { steps: [step], updateStepField },
    } as unknown as PpbStepConfigCardProps;

    const view = PpbStepConfigCard(props);
    const titleField = findElement(
      view,
      (element) => element.type === "s-text-field",
    );
    titleField!.props.onInput({ target: { value: "Bundle step" } });
    expect(updateStepField).toHaveBeenCalledWith(
      "step-1",
      "pageTitle",
      "Bundle step",
    );
  });

  it("updates the step image through the native upload owner", () => {
    const markAsDirty = jest.fn();
    const updateStepField = jest.fn();
    const props = {
      markAsDirty,
      step,
      stepsState: { steps: [step], updateStepField },
    } as unknown as PpbStepConfigCardProps;

    const view = PpbStepConfigCard(props);
    const upload = findElement(
      view,
      (element) => element.type === AssetUpload,
    );
    upload!.props.onChange("https://cdn.shopify.com/step.png");

    expect(updateStepField).toHaveBeenCalledWith(
      "step-1",
      "stepImage",
      "https://cdn.shopify.com/step.png",
    );
    expect(markAsDirty).toHaveBeenCalledTimes(1);
  });
});
