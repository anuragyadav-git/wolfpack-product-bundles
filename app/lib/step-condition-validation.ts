export const SUPPORTED_STEP_CONDITION_OPERATORS = [
  "equal_to",
  "greater_than_or_equal_to",
  "less_than_or_equal_to",
] as const;

export type SupportedStepConditionOperator =
  (typeof SUPPORTED_STEP_CONDITION_OPERATORS)[number];

export interface StepConditionValidationContext {
  stepId: string;
  stepName?: string | null;
  minQuantity: number;
  maxQuantity: number;
  conditionType: string | null;
  conditionOperator: string | null;
  conditionValue: number | null;
  conditionOperator2: string | null;
  conditionValue2: number | null;
}

export interface StepConditionValidationResult {
  stepId: string;
  message: string;
}

export function isOperatorSupported(
  operator: string | null,
): operator is SupportedStepConditionOperator {
  return (
    typeof operator === "string" &&
    SUPPORTED_STEP_CONDITION_OPERATORS.includes(
      operator as SupportedStepConditionOperator,
    )
  );
}

export function evaluateCondition(
  operator: SupportedStepConditionOperator,
  value: number,
  minQuantity: number,
  maxQuantity: number,
): boolean {
  if (!Number.isFinite(value) || !Number.isFinite(minQuantity) || !Number.isFinite(maxQuantity)) {
    return false;
  }

  if (operator === "equal_to") {
    return value >= minQuantity && value <= maxQuantity;
  }

  if (operator === "greater_than_or_equal_to") {
    return value <= maxQuantity;
  }

  return value >= minQuantity;
}

function label(stepId: string, stepName?: string | null): string {
  return stepName ? `${stepName} (${stepId})` : stepId;
}

export function validateStepConditionFeasibility(
  stepContext: StepConditionValidationContext,
): StepConditionValidationResult[] {
  if (stepContext.conditionType !== "quantity") {
    return [];
  }

  const errors: StepConditionValidationResult[] = [];
  const stepLabel = label(stepContext.stepId, stepContext.stepName);
  const minQuantity = stepContext.minQuantity;
  const maxQuantity = stepContext.maxQuantity;

  if (
    isOperatorSupported(stepContext.conditionOperator) &&
    stepContext.conditionValue !== null
  ) {
    const isFeasible = evaluateCondition(
      stepContext.conditionOperator,
      stepContext.conditionValue,
      minQuantity,
      maxQuantity,
    );
    if (!isFeasible) {
      errors.push({
        stepId: stepContext.stepId,
        message: `Step "${stepLabel}" has an impossible condition (1): ${stepContext.conditionOperator} ${stepContext.conditionValue} outside quantity range [${minQuantity}, ${maxQuantity}]`,
      });
    }
  }

  if (
    isOperatorSupported(stepContext.conditionOperator2) &&
    stepContext.conditionValue2 !== null
  ) {
    const isFeasible = evaluateCondition(
      stepContext.conditionOperator2,
      stepContext.conditionValue2,
      minQuantity,
      maxQuantity,
    );
    if (!isFeasible) {
      errors.push({
        stepId: stepContext.stepId,
        message: `Step "${stepLabel}" has an impossible condition (2): ${stepContext.conditionOperator2} ${stepContext.conditionValue2} outside quantity range [${minQuantity}, ${maxQuantity}]`,
      });
    }
  }

  return errors;
}

export function formatStepConditionErrors(
  errors: StepConditionValidationResult[],
): string {
  return errors.map((error) => error.message).join(" | ");
}
