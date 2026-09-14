import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {TUTORIAL_LINKS} from "../../../app/lib/tutorial-links";
import {FpbStepRulesCard} from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRulesCard";
import {PpbRulesConfigurationCard} from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
}));

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRuleModeContent",
  () => ({FpbStepRuleModeContent: () => null}),
);

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/SmallComponents",
  () => ({QuestionHelpTooltip: () => null}),
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList",
  () => ({PpbStepRulesList: () => null}),
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList",
  () => ({PpbCategoryRulesList: () => null}),
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.helpers",
  () => ({QuestionHelpTooltip: () => null}),
);

describe("configure rule help destinations", () => {
  it("links FPB rule help to the canonical tutorial", () => {
    const view = renderToStaticMarkup(
      React.createElement(FpbStepRulesCard, {
        styles: {card: "card"},
        ruleMode: {} as never,
        step: {id: "step-1"},
      }),
    );

    expect(view).toContain(`href="${TUTORIAL_LINKS.fullPageRules}"`);
    expect(view).toContain('target="_blank"');
  });

  it("links PPB rule help to the canonical tutorial", () => {
    const view = renderToStaticMarkup(
      React.createElement(PpbRulesConfigurationCard, {
        addCategoryConditionRule: jest.fn(),
        categoryRulesAdapter: {
          addCategoryConditionRule: jest.fn(),
          categoryRulesOpen: {},
          removeCategoryConditionRule: jest.fn(),
          setCategoryRulesOpen: jest.fn(),
          updateCategoryAutoNextRule: jest.fn(),
          updateCategoryConditionRule: jest.fn(),
        },
        clearCategoryConditionRules: jest.fn(),
        conditionsState: {
          addConditionRule: jest.fn(),
          clearStepConditions: jest.fn(),
          stepConditions: {},
        },
        step: {id: "step-1", StepCategory: []},
      } as unknown as React.ComponentProps<typeof PpbRulesConfigurationCard>),
    );

    expect(view).toContain(`href="${TUTORIAL_LINKS.productPageRules}"`);
    expect(view).toContain('target="_blank"');
  });
});
