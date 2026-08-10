import { createBundleStep } from "../../../app/lib/bundle-config/step-defaults";

describe("createBundleStep", () => {
  it("creates a step with Shopify-valid component quantity bounds", () => {
    expect(createBundleStep(2, 123)).toMatchObject({
      id: "step-123",
      name: "Step 2",
      minQuantity: 1,
      maxQuantity: 10,
    });
  });
});
