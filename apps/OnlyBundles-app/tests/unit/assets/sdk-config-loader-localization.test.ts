import { loadBundleConfig } from "../../../app/assets/sdk/config-loader";

describe("SDK bundle config localization", () => {
  it("projects the active Shopify locale before exposing SDK state", () => {
    (globalThis as any).window = { Shopify: { locale: "fr-CA" } };
    const state: any = { selections: {} };
    const container = {
      dataset: {
        bundleConfig: JSON.stringify({
          id: "bundle-1",
          schemaVersion: 3,
          bundleType: "product_page",
          runtimeAuthorization: { version: 2 },
          steps: [{
            id: "step-1",
            name: "Choose products",
            multiLangData: {
              fr: { productPageStepText: "Choisir des produits" },
            },
          }],
        }),
      },
    } as unknown as HTMLElement;

    expect(loadBundleConfig(container, state)).toEqual({ success: true });
    expect(state.steps[0].name).toBe("Choisir des produits");
    expect(state.isReady).toBe(false);
  });

  it.each([
    [{ id: "bundle-1", bundleType: "product_page", runtimeAuthorization: { version: 2 }, steps: [] }],
    [{ id: "bundle-1", schemaVersion: 3, bundleType: "full_page", runtimeAuthorization: { version: 2 }, steps: [] }],
    [{ id: "bundle-1", schemaVersion: 3, bundleType: "product_page", steps: [] }],
  ])("rejects a snapshot outside the schema-v3 Product Page contract", (bundleConfig) => {
    const state: any = { selections: {} };
    const container = { dataset: { bundleConfig: JSON.stringify(bundleConfig) } } as unknown as HTMLElement;

    expect(loadBundleConfig(container, state)).toEqual({
      success: false,
      error: expect.stringMatching(/schema-v3 Product Page/i),
    });
  });
});
