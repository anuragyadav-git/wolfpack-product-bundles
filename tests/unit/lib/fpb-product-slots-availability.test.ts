import {
  areFpbProductSlotsAvailable,
  resolveFpbProductSlotsEnabled,
} from "../../../app/lib/fpb-product-slots-availability";

describe("areFpbProductSlotsAvailable", () => {
  const step = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    enabled: true,
    StepCategory: [],
    ...extra,
  });

  it("allows quantity-based step rules for every enabled step", () => {
    expect(
      areFpbProductSlotsAvailable([step("step-1"), step("step-2")], {
        "step-1": [{ type: "quantity" }],
        "step-2": [{ type: "quantity" }, { type: "quantity" }],
      })
    ).toBe(true);
  });

  it.each(["amount", "weight"])("rejects a %s step rule", (type) => {
    expect(
      areFpbProductSlotsAvailable([step("step-1"), step("step-2")], {
        "step-1": [{ type: "quantity" }],
        "step-2": [{ type }],
      })
    ).toBe(false);
  });

  it("rejects an enabled step without a step rule", () => {
    expect(
      areFpbProductSlotsAvailable([step("step-1"), step("step-2")], {
        "step-1": [{ type: "quantity" }],
      })
    ).toBe(false);
  });

  it("rejects category-rule mode even when its rules use quantity", () => {
    expect(
      areFpbProductSlotsAvailable(
        [
          step("step-1", {
            StepCategory: [
              { id: "category-1", conditions: [{ type: "quantity" }] },
            ],
          }),
        ],
        {}
      )
    ).toBe(false);
  });

  it("ignores disabled steps when checking eligible step rules", () => {
    expect(
      areFpbProductSlotsAvailable(
        [step("step-1"), step("step-2", { enabled: false })],
        { "step-1": [{ type: "quantity" }] }
      )
    ).toBe(true);
  });

  it("rejects a bundle without enabled steps", () => {
    expect(areFpbProductSlotsAvailable([], {})).toBe(false);
    expect(
      areFpbProductSlotsAvailable([step("step-1", { enabled: false })], {})
    ).toBe(false);
  });
});

describe("resolveFpbProductSlotsEnabled", () => {
  const eligibleSteps = [{ id: "step-1", enabled: true, StepCategory: [] }];
  const quantityConditions = { "step-1": [{ type: "quantity" }] };

  it("preserves an enabled request when the step rules are eligible", () => {
    expect(
      resolveFpbProductSlotsEnabled(true, eligibleSteps, quantityConditions)
    ).toBe(true);
  });

  it("forces an enabled request off when the step rules are incompatible", () => {
    expect(
      resolveFpbProductSlotsEnabled(true, eligibleSteps, {
        "step-1": [{ type: "amount" }],
      })
    ).toBe(false);
  });

  it("preserves a disabled request for an eligible bundle", () => {
    expect(
      resolveFpbProductSlotsEnabled(false, eligibleSteps, quantityConditions)
    ).toBe(false);
  });
});
