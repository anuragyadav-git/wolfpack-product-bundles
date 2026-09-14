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
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({
      activeControls: {
        font: { customFont: "Inter" },
        scripts: { bundlePage: "window.__bundleScriptRuns += 1" },
        selectors: { addToCartButtons: ".add", buyNowButton: ".buy" },
      },
    }), { status: 200 }));
    globalThis.fetch = fetchMock as typeof fetch;
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
    expect(fetchMock).toHaveBeenCalledWith(
      "/apps/product-bundles/api/controls-settings?bundleType=full_page",
      { credentials: "same-origin" },
    );
  });

  it("requests language settings without a caller-controlled shop path", async () => {
    const originalWindow = globalThis.window;
    const originalFetch = globalThis.fetch;
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({
      activeLanguageData: { addBundle: "Ajouter" },
      sharedCartLabels: {},
      textOverrides: {},
    }), { status: 200 }));
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { Shopify: { shop: "caller-controlled.myshopify.com", locale: "fr-CA" } },
    });
    globalThis.fetch = fetchMock as typeof fetch;
    const context = { config: {} };

    try {
      await fullPageAnalyticsConfigMethods.loadLanguageSettings.call(context);
    } finally {
      globalThis.fetch = originalFetch;
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/apps/product-bundles/api/language-settings?bundleType=full_page&locale=fr-CA",
      { credentials: "same-origin" },
    );
  });

  it("mounts bundle-builder CSS on the FPB surface", async () => {
    const styles: any[] = [];
    const runtimeDocument = {
      head: { appendChild: (style: any) => styles.push(style) },
      querySelector: () => styles[0] ?? null,
      createElement: () => ({ dataset: {}, textContent: "", remove: jest.fn() }),
    };
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    const originalFetch = globalThis.fetch;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { Shopify: { shop: "test.myshopify.com" } },
    });
    Object.defineProperty(globalThis, "document", { configurable: true, value: runtimeDocument });
    globalThis.fetch = jest.fn(async () => new Response(JSON.stringify({
      activeControls: {
        css: { bundleBuilderPages: ".builder-marker { color: red; }" },
        font: {}, scripts: {}, selectors: {},
      },
    }), { status: 200 })) as typeof fetch;
    const context = {
      config: {},
      container: { dataset: {}, style: { setProperty: jest.fn(), removeProperty: jest.fn() } },
      _runControlsScript: fullPageAnalyticsConfigMethods._runControlsScript,
      _getLandingPageControls: fullPageAnalyticsConfigMethods._getLandingPageControls,
    };

    try {
      await fullPageAnalyticsConfigMethods.loadControlsSettings.call(context);
    } finally {
      globalThis.fetch = originalFetch;
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
      Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    }

    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toBe(".builder-marker { color: red; }");
  });
});
