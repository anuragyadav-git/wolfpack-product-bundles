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
  const conditions = [
    {
      position: 1,
      operator: stepContext.conditionOperator,
      value: stepContext.conditionValue,
    },
    {
      position: 2,
      operator: stepContext.conditionOperator2,
      value: stepContext.conditionValue2,
    },
  ].filter(
    (condition): condition is {
      position: number;
      operator: SupportedStepConditionOperator;
      value: number;
    } => isOperatorSupported(condition.operator) && condition.value !== null,
  );

  for (const condition of conditions) {
    if (!Number.isFinite(condition.value) || condition.value < 0) {
      errors.push({
        stepId: stepContext.stepId,
        message: `Step "${stepLabel}" has an impossible condition (${condition.position}): quantity must be a finite non-negative number`,
      });
    }
  }

  if (errors.length > 0 || conditions.length < 2) {
    return errors;
  }

  let lowerBound = 0;
  let upperBound = Number.POSITIVE_INFINITY;
  for (const condition of conditions) {
    if (condition.operator === "equal_to") {
      lowerBound = Math.max(lowerBound, condition.value);
      upperBound = Math.min(upperBound, condition.value);
    } else if (condition.operator === "greater_than_or_equal_to") {
      lowerBound = Math.max(lowerBound, condition.value);
    } else {
      upperBound = Math.min(upperBound, condition.value);
    }
  }

  if (lowerBound > upperBound) {
    const [first, second] = conditions;
    errors.push({
      stepId: stepContext.stepId,
      message: `Step "${stepLabel}" has impossible quantity conditions: ${first.operator} ${first.value} and ${second.operator} ${second.value} cannot both be satisfied`,
    });
  }

  return errors;
}

export function formatStepConditionErrors(
  errors: StepConditionValidationResult[],
): string {
  return errors.map((error) => error.message).join(" | ");
}
