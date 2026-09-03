/**
 * Unit tests for step-condition feasibility validation.
 */
import {
  formatStepConditionErrors,
  isOperatorSupported,
  validateStepConditionFeasibility,
} from "../../../app/lib/step-condition-validation";

describe("step condition feasibility validation", () => {
  it("accepts a single exact quantity rule without hidden quantity bounds", () => {
    expect(
      validateStepConditionFeasibility({
        stepId: "step-1",
        stepName: "Step 1",
        conditionType: "quantity",
        conditionOperator: "equal_to",
        conditionValue: 2,
        conditionOperator2: null,
        conditionValue2: null,
      }),
    ).toEqual([]);
  });

  it("accepts coherent lower and upper quantity rules", () => {
    expect(
      validateStepConditionFeasibility({
        stepId: "step-1",
        stepName: "Step 1",
        conditionType: "quantity",
        conditionOperator: "greater_than_or_equal_to",
        conditionValue: 2,
        conditionOperator2: "less_than_or_equal_to",
        conditionValue2: 4,
      }),
    ).toEqual([]);
  });

  it("rejects contradictory merchant-authored quantity rules", () => {
    const result = validateStepConditionFeasibility({
      stepId: "step-1",
      stepName: "Step 1",
      conditionType: "quantity",
      conditionOperator: "greater_than_or_equal_to",
      conditionValue: 4,
      conditionOperator2: "less_than_or_equal_to",
      conditionValue2: 2,
    });

    expect(result).toHaveLength(1);
    expect(formatStepConditionErrors(result)).toContain("cannot both be satisfied");
  });

  it("rejects a negative quantity rule", () => {
    const result = validateStepConditionFeasibility({
      stepId: "step-1",
      stepName: "Step 1",
      conditionType: "quantity",
      conditionOperator: "less_than_or_equal_to",
      conditionValue: -1,
      conditionOperator2: null,
      conditionValue2: null,
    });

    expect(result).toHaveLength(1);
    expect(result[0].message).toContain("condition (1)");
    expect(result[0].message).toContain("non-negative");
  });

  it("skips non-quantity conditions", () => {
    expect(
      validateStepConditionFeasibility({
        stepId: "step-1",
        stepName: "Step 1",
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
  });
});
