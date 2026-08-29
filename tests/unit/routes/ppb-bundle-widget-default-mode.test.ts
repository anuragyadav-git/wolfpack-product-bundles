import { normalizeUpsellWidgetDisplayMode } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.helpers";

describe("Product Page Bundle Widget default display mode", () => {
  it("defaults to the captured EB Offer Upsell Block state when no saved value exists", () => {
    expect(normalizeUpsellWidgetDisplayMode(undefined)).toBe("block");
    expect(normalizeUpsellWidgetDisplayMode("block")).toBe("block");
    expect(normalizeUpsellWidgetDisplayMode("button")).toBe("button");
    expect(normalizeUpsellWidgetDisplayMode("unsupported-mode")).toBe(
      "block",
    );
  });
});
