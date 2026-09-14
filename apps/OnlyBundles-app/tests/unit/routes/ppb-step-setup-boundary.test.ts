import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {PpbStepSetupSection} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupSection";

const mockStepFlow = jest.fn((props: Record<string, unknown>) =>
  React.createElement(React.Fragment, null, props.children as React.ReactNode),
);
const mockDetails = jest.fn((_props: Record<string, unknown>) => null);
const mockCategories = jest.fn((_props: Record<string, unknown>) => null);
const mockRules = jest.fn((_props: Record<string, unknown>) => null);
const mockConfig = jest.fn((_props: Record<string, unknown>) => null);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard",
  () => ({PpbStepFlowCard: (props: Record<string, unknown>) => mockStepFlow(props)}),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupDetailsCard",
  () => ({PpbStepSetupDetailsCard: (props: Record<string, unknown>) => mockDetails(props)}),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard",
  () => ({PpbStepCategoriesCard: (props: Record<string, unknown>) => mockCategories(props)}),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard",
  () => ({PpbRulesConfigurationCard: (props: Record<string, unknown>) => mockRules(props)}),
);
jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard",
  () => ({PpbStepConfigCard: (props: Record<string, unknown>) => mockConfig(props)}),
);

describe("PPB Step Setup composition boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("projects named feature contracts without reading aggregate context", () => {
    const step = {id: "step-1", name: "Choose products", StepCategory: []};
    const stepsState = {steps: [step]};
    const details = {marker: "details"};
    const categories = {marker: "categories"};
    const rules = {marker: "rules"};
    const config = {marker: "config"};

    renderToStaticMarkup(
      React.createElement(PpbStepSetupSection, {
        activeSection: "step_setup",
        categories,
        config,
        details,
        rules,
        slideDir: "none",
        slideKey: 0,
        stepFlow: {
          activeTabIndex: 0,
          handleAddNewStep: jest.fn(),
          navigateToStep: jest.fn(),
          stepsState,
        },
      } as unknown as React.ComponentProps<typeof PpbStepSetupSection>),
    );

    expect(mockStepFlow).toHaveBeenCalledWith(
      expect.objectContaining({activeTabIndex: 0, stepsState}),
    );
    expect(mockDetails).toHaveBeenCalledWith(
      expect.objectContaining({...details, isFirstStep: true, step}),
    );
    expect(mockCategories).toHaveBeenCalledWith(
      expect.objectContaining({...categories, step}),
    );
    expect(mockRules).toHaveBeenCalledWith(
      expect.objectContaining({...rules, step}),
    );
    expect(mockConfig).toHaveBeenCalledWith(
      expect.objectContaining({...config, step}),
    );
  });

  it("does not render Step Setup owners for another section", () => {
    renderToStaticMarkup(
      React.createElement(PpbStepSetupSection, {
        activeSection: "discount_pricing",
        categories: {},
        config: {},
        details: {},
        rules: {},
        slideDir: "none",
        slideKey: 0,
        stepFlow: {activeTabIndex: 0, stepsState: {steps: []}},
      } as unknown as React.ComponentProps<typeof PpbStepSetupSection>),
    );

    expect(mockStepFlow).not.toHaveBeenCalled();
    expect(mockDetails).not.toHaveBeenCalled();
    expect(mockCategories).not.toHaveBeenCalled();
    expect(mockRules).not.toHaveBeenCalled();
    expect(mockConfig).not.toHaveBeenCalled();
  });
});
