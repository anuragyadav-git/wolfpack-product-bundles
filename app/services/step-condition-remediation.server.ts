import {
  isOperatorSupported,
} from "../lib/step-condition-validation";

type RemediationMode = "apply";

export interface StepConditionRemediationSummary {
  mode: RemediationMode;
  scannedBundles: number;
  scannedSteps: number;
  impossibleSteps: number;
  fixedSteps: number;
  updatedBundles: number;
  failures: Array<{
    bundleId: string;
    stepId: string;
    error: string;
  }>;
}

interface StepRecord {
  id: string;
  name: string | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  conditionType: string | null;
  conditionOperator: string | null;
  conditionValue: number | null;
  conditionOperator2: string | null;
  conditionValue2: number | null;
}

interface BundleStepRecord {
  id: string;
  shopId: string;
  steps: StepRecord[];
}

interface PrismaClientLike {
  bundle: {
    findMany: (args: unknown) => Promise<BundleStepRecord[]>;
  };
  bundleStep: {
    update: (args: unknown) => Promise<unknown>;
  };
}

export interface StepConditionRemediationDependencies {
  prisma: PrismaClientLike;
  logger?: Pick<Console, "info" | "warn" | "error">;
}

function normalizeInteger(value: number | null | undefined): number {
  if (!Number.isFinite(value ?? NaN)) {
    return 0;
  }
  return Number(value);
}

function resolveStepFixes(step: StepRecord): {
  minQuantity: number;
  maxQuantity: number;
  hasFix: boolean;
} {
  let minQuantity = normalizeInteger(step.minQuantity);
  let maxQuantity = normalizeInteger(step.maxQuantity);

  if (step.conditionType !== "quantity") {
    return { minQuantity, maxQuantity, hasFix: false };
  }

  const fixFirst = calculateFixForCondition(
    minQuantity,
    maxQuantity,
    step.conditionOperator,
    step.conditionValue,
  );
  minQuantity = fixFirst.minQuantity;
  maxQuantity = fixFirst.maxQuantity;

  const fixSecond = calculateFixForCondition(
    minQuantity,
    maxQuantity,
    step.conditionOperator2,
    step.conditionValue2,
  );
  minQuantity = fixSecond.minQuantity;
  maxQuantity = fixSecond.maxQuantity;

  return {
    minQuantity,
    maxQuantity,
    hasFix: minQuantity !== normalizeInteger(step.minQuantity) || maxQuantity !== normalizeInteger(step.maxQuantity),
  };
}

function calculateFixForCondition(
  minQuantity: number,
  maxQuantity: number,
  operator: string | null,
  value: number | null,
): { minQuantity: number; maxQuantity: number; hasFix: boolean } {
  if (!isOperatorSupported(operator) || value === null) {
    return { minQuantity, maxQuantity, hasFix: false };
  }

  if (operator === "equal_to") {
    if (value > maxQuantity) return { minQuantity, maxQuantity: value, hasFix: true };
    if (value < minQuantity) return { minQuantity: value, maxQuantity, hasFix: true };
    return { minQuantity, maxQuantity, hasFix: false };
  }

  if (operator === "greater_than_or_equal_to") {
    if (value > maxQuantity) return { minQuantity, maxQuantity: value, hasFix: true };
    return { minQuantity, maxQuantity, hasFix: false };
  }

  if (value < minQuantity) return { minQuantity: value, maxQuantity, hasFix: true };
  return { minQuantity, maxQuantity, hasFix: false };
}

export async function runStepConditionRemediation(
  deps: StepConditionRemediationDependencies,
): Promise<StepConditionRemediationSummary> {
  const mode: RemediationMode = "apply";

  const bundles = await deps.prisma.bundle.findMany({
    select: {
      id: true,
      shopId: true,
      steps: {
        select: {
          id: true,
          name: true,
          minQuantity: true,
          maxQuantity: true,
          conditionType: true,
          conditionOperator: true,
          conditionValue: true,
          conditionOperator2: true,
          conditionValue2: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const summary: StepConditionRemediationSummary = {
    mode,
    scannedBundles: bundles.length,
    scannedSteps: 0,
    impossibleSteps: 0,
    fixedSteps: 0,
    updatedBundles: 0,
    failures: [],
  };

  deps.logger?.info?.("[STEP_CONDITION_REMEDIATION] Starting scan.", {
    mode,
    bundles: summary.scannedBundles,
  });

  for (const bundle of bundles) {
    let didUpdateBundle = false;

    for (const step of bundle.steps) {
      summary.scannedSteps += 1;

      const { minQuantity, maxQuantity, hasFix } = resolveStepFixes(step);
      const minBefore = normalizeInteger(step.minQuantity);
      const maxBefore = normalizeInteger(step.maxQuantity);

      if (!hasFix) {
        continue;
      }

      summary.impossibleSteps += 1;
      deps.logger?.warn?.("[STEP_CONDITION_REMEDIATION] Fix candidate found.", {
        bundleId: bundle.id,
        bundleShopId: bundle.shopId,
        stepId: step.id,
        stepName: step.name,
        before: `${minBefore}-${maxBefore}`,
        after: `${minQuantity}-${maxQuantity}`,
      });

      try {
        await deps.prisma.bundleStep.update({
          where: { id: step.id },
          data: {
            minQuantity,
            maxQuantity,
          },
        });
        summary.fixedSteps += 1;
        didUpdateBundle = true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Step condition remediation failed";
        summary.failures.push({ bundleId: bundle.id, stepId: step.id, error: message });
        deps.logger?.error?.("[STEP_CONDITION_REMEDIATION] Step repair failed.", {
          bundleId: bundle.id,
          stepId: step.id,
          error: message,
        });
      }
    }

    if (didUpdateBundle) {
      summary.updatedBundles += 1;
    }
  }

  return summary;
}
