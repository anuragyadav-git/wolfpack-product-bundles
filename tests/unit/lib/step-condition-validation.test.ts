/**
 * Unit tests for step-condition feasibility validation.
 */
import {
  evaluateCondition,
  formatStepConditionErrors,
  isOperatorSupported,
  validateStepConditionFeasibility,
} from "../../../app/lib/step-condition-validation";

describe("step condition feasibility validation", () => {
  it("accepts equal_to when condition value is in range", () => {
    expect(
      validateStepConditionFeasibility({
        stepId: "step-1",
        stepName: "Step 1",
        minQuantity: 1,
        maxQuantity: 5,
        conditionType: "quantity",
        conditionOperator: "equal_to",
        conditionValue: 3,
        conditionOperator2: null,
        conditionValue2: null,
      }),
    ).toEqual([]);
  });

  it("rejects equal_to when value exceeds maxQuantity", () => {
    const result = validateStepConditionFeasibility({
      stepId: "step-1",
      stepName: "Step 1",
      minQuantity: 1,
      maxQuantity: 2,
      conditionType: "quantity",
      conditionOperator: "equal_to",
      conditionValue: 4,
      conditionOperator2: null,
      conditionValue2: null,
    });

    expect(result).toHaveLength(1);
    expect(formatStepConditionErrors(result)).toContain("outside quantity range [1, 2]");
  });

  it("rejects greater_than_or_equal_to when value exceeds maxQuantity", () => {
    const result = validateStepConditionFeasibility({
      stepId: "step-1",
      stepName: "Step 1",
      minQuantity: 1,
      maxQuantity: 2,
      conditionType: "quantity",
      conditionOperator: "greater_than_or_equal_to",
      conditionValue: 4,
      conditionOperator2: null,
      conditionValue2: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].message).toContain("condition (1)");
    expect(result[0].message).toContain("4");
  });

  it("rejects less_than_or_equal_to when value is below minQuantity", () => {
    const result = validateStepConditionFeasibility({
      stepId: "step-1",
      stepName: "Step 1",
      minQuantity: 3,
      maxQuantity: 5,
      conditionType: "quantity",
      conditionOperator: "less_than_or_equal_to",
      conditionValue: 1,
      conditionOperator2: null,
      conditionValue2: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].message).toContain("outside quantity range [3, 5]");
  });

  it("skips non-quantity conditions", () => {
    expect(
      validateStepConditionFeasibility({
        stepId: "step-1",
        stepName: "Step 1",
        minQuantity: 1,
        maxQuantity: 2,
        conditionType: "amount",
        conditionOperator: "equal_to",
        conditionValue: 10,
        conditionOperator2: null,
        conditionValue2: null,
      }),
    ).toEqual([]);
  });

  it("supports the exported helper operators", () => {
    expect(isOperatorSupported("equal_to")).toBe(true);
    expect(isOperatorSupported("less_than_or_equal_to")).toBe(true);
    expect(isOperatorSupported("greater_than_or_equal_to")).toBe(true);
    expect(isOperatorSupported("gt")).toBe(false);
    expect(evaluateCondition("equal_to", 3, 1, 5)).toBe(true);
    expect(evaluateCondition("equal_to", 0, 1, 5)).toBe(false);
  });
});
