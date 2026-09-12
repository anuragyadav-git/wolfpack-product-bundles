import React from "react";
import { PpbStepRulesList } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList";
import { FpbStepRuleModeContent } from "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRuleModeContent";
import { PpbDiscountRulesPanel } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel";

jest.mock("../../../app/i18n/config", () => ({
  translateAdmin: (key: string) => key,
  translateAdminCopy: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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

describe("Dropdown Polaris compliance", () => {
  it("does not render placeholder or label as dummy s-option in PPB step condition rules", () => {
    const updateConditionRule = jest.fn();
    const view = PpbStepRulesList({
      conditionsState: {
        addConditionRule: jest.fn(),
        removeConditionRule: jest.fn(),
        stepConditions: {
          "step-1": [
            {
              id: "rule-1",
              type: "quantity",
              operator: "equal_to",
              value: "2",
            },
          ],
        },
        updateConditionRule,
      },
      step: { id: "step-1" },
    } as never);

    const selects = findElements(view, (el) => el.type === "s-select");
    expect(selects.length).toBeGreaterThanOrEqual(2);

    const [typeSelect, operatorSelect] = selects;
    expect(typeSelect.props.placeholder).toBe("dashboard.table.type");
    expect(operatorSelect.props.placeholder).toBe(
      "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
    );

    // Verify no dummy empty/disabled options exist in children
    const options = findElements(view, (el) => el.type === "s-option");
    const dummyOptions = options.filter(
      (opt) => opt.props.value === "" || opt.props.disabled === true
    );
    expect(dummyOptions).toHaveLength(0);
  });

  it("does not render placeholder or label as dummy s-option in FPB step condition rules", () => {
    const updateStepConditionRule = jest.fn();
    const view = FpbStepRuleModeContent({
      rules: {
        addCategoryConditionRule: jest.fn(),
        addStepConditionRule: jest.fn(),
        categoryRulesOpen: {},
        clearCategoryConditionRules: jest.fn(),
        clearStepConditions: jest.fn(),
        removeCategoryConditionRule: jest.fn(),
        removeStepConditionRule: jest.fn(),
        setCategoryRulesOpen: jest.fn(),
        stepConditions: {
          "step-1": [
            {
              id: "rule-1",
              type: "quantity",
              operator: "equal_to",
              value: "2",
            },
          ],
        },
        styles: {} as never,
        updateCategoryAutoNextRule: jest.fn(),
        updateCategoryConditionRule: jest.fn(),
        updateStepConditionRule,
      },
      step: {
        id: "step-1",
        stepRuleType: "steps",
      } as never,
    });

    const selects = findElements(view, (el) => el.type === "s-select");
    expect(selects.length).toBeGreaterThanOrEqual(2);

    const [typeSelect, operatorSelect] = selects;
    expect(typeSelect.props.placeholder).toBe("dashboard.table.type");
    expect(operatorSelect.props.placeholder).toBe(
      "adminExtracted.appBundlesFullPageBundleConfigure.sections.stepsetuprulemodecontent.condition"
    );

    // Verify no dummy empty/disabled options exist in children
    const options = findElements(view, (el) => el.type === "s-option");
    const dummyOptions = options.filter(
      (opt) => opt.props.value === "" || opt.props.disabled === true
    );
    expect(dummyOptions).toHaveLength(0);
  });

  it("uses native label on PPB discount type s-select", () => {
    const view = PpbDiscountRulesPanel({
      pricingState: {
        currencySymbol: "$",
        discountEnabled: true,
        discountRules: [],
        discountType: "percentage_off",
        replaceDiscountMethod: jest.fn(),
        setDiscountEnabled: jest.fn(),
      } as never,
      setGlobalSuccessMessage: jest.fn(),
      setRuleMessages: jest.fn(),
      setRuleMessagesByLocale: jest.fn(),
      setSuccessMessageByLocale: jest.fn(),
      validationErrors: {},
    });

    const selects = findElements(view, (el) => el.type === "s-select");
    const discountTypeSelect = selects.find(
      (s) =>
        s.props.label ===
        "adminExtracted.appBundlesProductPageBundleConfigure.ppbdiscountrulespanel.discountType"
    );
    expect(discountTypeSelect).toBeDefined();
  });
});
