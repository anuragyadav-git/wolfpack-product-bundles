import type { DiscountRule } from "../../../types/wolfpack-bundles";

const canonicalOperators = ["gte", "gt", "lte", "lt", "eq"] as const;

describe("public SDK pricing operator contract", () => {
  it.each(canonicalOperators)("accepts canonical operator %s", (conditionOperator) => {
    const rule: DiscountRule = {
      conditionType: "quantity",
      conditionOperator,
      conditionValue: 2,
      discountValue: 10,
    };

    expect(rule.conditionOperator).toBe(conditionOperator);
  });
});

function compileTimeRejectionForStepConditionOperator() {
  const conditionOperator = "equal_to" as const;

  const rule: DiscountRule = {
    conditionType: "quantity",
    // @ts-expect-error Step-condition operators are not valid pricing operators.
    conditionOperator,
    conditionValue: 2,
    discountValue: 10,
  };

  return rule;
}

void compileTimeRejectionForStepConditionOperator;
