import { fullPageAnalyticsConfigMethods } from "../../../app/assets/widgets/full-page/methods/analytics-config-methods";

describe("FPB runtime Controls application", () => {
  it("applies the custom font, exposes selectors, and executes bundle-page script once", async () => {
    const setProperty = jest.fn();
    const runtimeWindow = {
      Shopify: { shop: "test.myshopify.com" },
      __bundleScriptRuns: 0,
    };
    const originalWindow = globalThis.window;
    const originalFetch = globalThis.fetch;
    Object.defineProperty(globalThis, "window", { configurable: true, value: runtimeWindow });
    globalThis.fetch = jest.fn(async () => new Response(JSON.stringify({
      activeControls: {
        font: { customFont: "Inter" },
        scripts: { bundlePage: "window.__bundleScriptRuns += 1" },
        selectors: { addToCartButtons: ".add", buyNowButton: ".buy" },
      },
    }), { status: 200 })) as typeof fetch;
    const context = {
      config: {},
      container: { dataset: {}, style: { setProperty, removeProperty: jest.fn() } },
      _runControlsScript: fullPageAnalyticsConfigMethods._runControlsScript,
      _getLandingPageControls: fullPageAnalyticsConfigMethods._getLandingPageControls,
    };

    try {
      await fullPageAnalyticsConfigMethods.loadControlsSettings.call(context);
      await fullPageAnalyticsConfigMethods.loadControlsSettings.call(context);
    } finally {
      globalThis.fetch = originalFetch;
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }

    expect(setProperty).toHaveBeenCalledWith("--wpb-controls-font-family", "Inter");
    expect(runtimeWindow.__bundleScriptRuns).toBe(1);
    expect((runtimeWindow as Record<string, unknown>).__WPB_BUNDLE_BUTTON_SELECTORS__).toEqual({
      addToCartButtons: ".add",
      buyNowButton: ".buy",
    });
  });
});
