type FpbStepRule = {
  type?: unknown;
};

type FpbStepCategory = {
  conditions?: unknown;
};

type FpbProductSlotsStep = {
  id?: unknown;
  enabled?: unknown;
  isDefault?: unknown;
  isFreeGift?: unknown;
  StepCategory?: unknown;
};

export function areFpbProductSlotsAvailable(
  steps: unknown,
  stepConditions: unknown
): boolean {
  if (
    !Array.isArray(steps) ||
    !stepConditions ||
    typeof stepConditions !== "object"
  ) {
    return false;
  }

  const eligibleSteps = (steps as FpbProductSlotsStep[]).filter(
    (step) =>
      step?.enabled !== false &&
      step?.isDefault !== true &&
      step?.isFreeGift !== true
  );
  if (eligibleSteps.length === 0) return false;

  return eligibleSteps.every((step) => {
    if (typeof step.id !== "string" || step.id.length === 0) return false;

    const categories = Array.isArray(step.StepCategory)
      ? (step.StepCategory as FpbStepCategory[])
      : [];
    const hasCategoryRules = categories.some(
      (category) =>
        Array.isArray(category?.conditions) && category.conditions.length > 0
    );
    if (hasCategoryRules) return false;

    const rules = (stepConditions as Record<string, unknown>)[step.id];
    if (!Array.isArray(rules) || rules.length === 0) return false;

    return (rules as FpbStepRule[]).every((rule) => rule?.type === "quantity");
  });
}

export function resolveFpbProductSlotsEnabled(
  requestedEnabled: boolean,
  steps: unknown,
  stepConditions: unknown
): boolean {
  return requestedEnabled && areFpbProductSlotsAvailable(steps, stepConditions);
}
