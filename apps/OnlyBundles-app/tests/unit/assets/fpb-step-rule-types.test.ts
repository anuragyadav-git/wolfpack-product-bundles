import {
  fullPageSelectionNavigationMethods,
  getFullPageStepConditionValidationMessage,
} from "../../../app/assets/widgets/full-page/methods/selection-navigation-methods";
import { ToastManager } from "../../../app/assets/widgets/shared/toast-manager";

describe("FPB Amount and Weight step rules", () => {
  const products = [{
    id: "product-1",
    selectionId: "variant-default",
    price: 1000,
    weight: 100,
    variants: [{
      id: "variant-heavy",
      selectionId: "variant-heavy",
      price: 2500,
      weight: 400,
    }],
  }];

  it("builds condition totals from the selected nested variant", () => {
    const totals = fullPageSelectionNavigationMethods._buildConditionAwareStepSelections.call(
      {},
      products,
      { "variant-heavy": 2 },
    );

    expect(totals).toEqual({
      "variant-heavy": { quantity: 2, amount: 5000, weight: 800 },
    });
  });

  it.each([
    ["amount", 20, "Add products worth maximum of 20 on this step"],
    ["weight", 300, "Add products weighing maximum of 300 on this step"],
  ])("rejects a nested variant that exceeds a %s maximum", (conditionType, conditionValue, message) => {
    const toast = jest.spyOn(ToastManager, "show").mockImplementation(() => undefined);
    const context = {
      selectedBundle: {
        steps: [{
          conditionType,
          conditionOperator: "less_than_or_equal_to",
          conditionValue,
        }],
      },
      selectedProducts: [{}],
      stepProductData: [products],
      _getStepConditionSelections: (_stepIndex: number, selections: object) => selections,
      _getDirectDefaultSelectionQuantities: () => ({}),
      _buildConditionAwareStepSelections:
        fullPageSelectionNavigationMethods._buildConditionAwareStepSelections,
      _resolveText: (_key: string, fallback: string) => fallback,
    };

    try {
      expect(fullPageSelectionNavigationMethods.validateStepCondition.call(
        context,
        0,
        "variant-heavy",
        1,
      )).toBe(false);
      expect(toast).toHaveBeenCalledWith(message);
    } finally {
      toast.mockRestore();
    }
  });

  it("reports the violated upper bound for an Amount range", () => {
    const toast = jest.spyOn(ToastManager, "show").mockImplementation(() => undefined);
    const context = {
      selectedBundle: {
        steps: [{
          conditionType: "amount",
          conditionOperator: "greater_than_or_equal_to",
          conditionValue: 10,
          conditionOperator2: "less_than_or_equal_to",
          conditionValue2: 20,
        }],
      },
      selectedProducts: [{}],
      stepProductData: [products],
      _getStepConditionSelections: (_stepIndex: number, selections: object) => selections,
      _getDirectDefaultSelectionQuantities: () => ({}),
      _buildConditionAwareStepSelections:
        fullPageSelectionNavigationMethods._buildConditionAwareStepSelections,
      _resolveText: (_key: string, fallback: string) => fallback,
    };

    try {
      expect(fullPageSelectionNavigationMethods.validateStepCondition.call(
        context,
        0,
        "variant-heavy",
        1,
      )).toBe(false);
      expect(toast).toHaveBeenCalledWith("Add products worth maximum of 20 on this step");
    } finally {
      toast.mockRestore();
    }
  });

  it.each([
    ["amount", "conditionAmountGreaterThanOrEqualTo", "{{conditionAmount}}", "Choose products worth 25"],
    ["weight", "conditionWeightGreaterThanOrEqualTo", "{{conditionWeight}}", "Choose products weighing 500"],
  ])("uses the active %s rule message", (conditionType, key, token, expected) => {
    const resolveText = jest.fn((requestedKey: string, fallback: string) => (
      requestedKey === key ? `Choose products ${conditionType === "amount" ? "worth" : "weighing"} ${token}` : fallback
    ));

    expect(getFullPageStepConditionValidationMessage({
      conditionType,
      conditionOperator: "greater_than_or_equal_to",
      conditionValue: conditionType === "amount" ? 25 : 500,
    }, resolveText)).toBe(expected);
  });
});
