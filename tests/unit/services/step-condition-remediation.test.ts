import {
  runStepConditionRemediation,
} from "../../../app/services/step-condition-remediation.server";

function makeDeps(overrides: {
  bundles?: any[];
  updateShouldThrow?: boolean;
} = {}) {
  const bundleFindMany = jest.fn().mockResolvedValue(
    overrides.bundles ?? [
      {
        id: "bundle-1",
        shopId: "shop-a",
        steps: [
          {
            id: "step-1",
            name: "Bad Equal",
            minQuantity: 1,
            maxQuantity: 5,
            conditionType: "quantity",
            conditionOperator: "equal_to",
            conditionValue: 8,
            conditionOperator2: null,
            conditionValue2: null,
          },
          {
            id: "step-2",
            name: "Healthy",
            minQuantity: 1,
            maxQuantity: 10,
            conditionType: "amount",
            conditionOperator: "equal_to",
            conditionValue: 3,
            conditionOperator2: null,
            conditionValue2: null,
          },
        ],
      },
      {
        id: "bundle-2",
        shopId: "shop-b",
        steps: [
          {
            id: "step-3",
            name: "Bad LTE",
            minQuantity: 4,
            maxQuantity: 8,
            conditionType: "quantity",
            conditionOperator: "less_than_or_equal_to",
            conditionValue: 2,
            conditionOperator2: null,
            conditionValue2: null,
          },
        ],
      },
    ],
  );

  const bundleStepUpdate = jest.fn().mockImplementation(() => {
    if (overrides.updateShouldThrow) {
      throw new Error("update failed");
    }
    return Promise.resolve({});
  });

  return {
    prisma: {
      bundle: { findMany: bundleFindMany },
      bundleStep: { update: bundleStepUpdate },
    },
    logger: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
}

describe("step condition remediation", () => {
  it("scans and applies fixes in one pass", async () => {
    const deps = makeDeps();
    const result = await runStepConditionRemediation(deps);

    expect(result).toMatchObject({
      mode: "apply",
      scannedBundles: 2,
      scannedSteps: 3,
      impossibleSteps: 2,
      fixedSteps: 2,
      updatedBundles: 2,
      failures: [],
    });
    expect(deps.prisma.bundle.findMany).toHaveBeenCalledTimes(1);
    expect(deps.prisma.bundleStep.update).toHaveBeenCalledTimes(2);
  });

  it("leaves healthy steps unchanged", async () => {
    const deps = makeDeps({
      bundles: [
        {
          id: "bundle-1",
          shopId: "shop-a",
          steps: [
            {
              id: "step-1",
              name: "Healthy",
              minQuantity: 1,
              maxQuantity: 5,
              conditionType: "quantity",
              conditionOperator: "equal_to",
              conditionValue: 4,
              conditionOperator2: null,
              conditionValue2: null,
            },
          ],
        },
      ],
    });

    const result = await runStepConditionRemediation(deps);

    expect(result).toMatchObject({
      mode: "apply",
      scannedBundles: 1,
      scannedSteps: 1,
      impossibleSteps: 0,
      fixedSteps: 0,
      updatedBundles: 0,
      failures: [],
    });
    expect(deps.prisma.bundleStep.update).not.toHaveBeenCalled();
  });

  it("applies fixes and updates only bad steps", async () => {
    const deps = makeDeps();

    const result = await runStepConditionRemediation(deps);

    expect(result).toMatchObject({
      fixedSteps: 2,
      impossibleSteps: 2,
    });
    expect(deps.prisma.bundleStep.update).toHaveBeenCalledTimes(2);
    expect(deps.prisma.bundleStep.update).toHaveBeenNthCalledWith(1, {
      where: { id: "step-1" },
      data: {
        minQuantity: 1,
        maxQuantity: 8,
      },
    });
    expect(deps.prisma.bundleStep.update).toHaveBeenNthCalledWith(2, {
      where: { id: "step-3" },
      data: {
        minQuantity: 2,
        maxQuantity: 8,
      },
    });
  });

  it("captures failed updates and continues other repairs", async () => {
    const deps = makeDeps({ updateShouldThrow: true });
    const result = await runStepConditionRemediation(deps);

    expect(result.mode).toBe("apply");
    expect(result.fixedSteps).toBe(0);
    expect(result.updatedBundles).toBe(0);
    expect(result.failures).toEqual([
      { bundleId: "bundle-1", stepId: "step-1", error: "update failed" },
      { bundleId: "bundle-2", stepId: "step-3", error: "update failed" },
    ]);
    expect(deps.prisma.bundleStep.update).toHaveBeenCalledTimes(2);
  });
});
