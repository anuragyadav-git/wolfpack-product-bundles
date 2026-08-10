import { createBundleStep } from "../../../app/lib/bundle-config/step-defaults";

describe("createBundleStep", () => {
  it("creates an optional step without forcing a shopper selection", () => {
    expect(createBundleStep(2, 123)).toMatchObject({
      id: "step-123",
      name: "Step 2",
      minQuantity: 0,
      maxQuantity: 10,
    });
  });
});
