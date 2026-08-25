import { loadBundleConfig } from "../../../app/assets/sdk/config-loader";

describe("SDK bundle config localization", () => {
  it("projects the active Shopify locale before exposing SDK state", () => {
    (globalThis as any).window = { Shopify: { locale: "fr-CA" } };
    const state: any = { selections: {} };
    const container = {
      dataset: {
        bundleConfig: JSON.stringify({
          id: "bundle-1",
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
  });
});
