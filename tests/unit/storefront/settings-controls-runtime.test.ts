import {
  applyGlobalSettingsControls,
  executeMerchantCartIntegration,
  executeMerchantStorefrontScript,
  resolveBundleQuickAddTarget,
} from "../../../app/storefront/settings-controls";

function storefrontHarness() {
  const styles: Array<{ dataset: Record<string, string>; textContent: string; remove: () => void }> = [];
  const runtimeDocument = {
    head: { append: (style: typeof styles[number]) => styles.push(style) },
    querySelector: () => styles[0] ?? null,
    createElement: () => {
      const style = {
        dataset: {} as Record<string, string>,
        textContent: "",
        remove: () => {
          const index = styles.indexOf(style);
          if (index >= 0) styles.splice(index, 1);
        },
      };
      return style;
    },
  };
  const runtimeWindow = { document: runtimeDocument } as unknown as Window & Record<string, unknown>;
  return { runtimeDocument: runtimeDocument as unknown as Document, runtimeWindow, styles };
}

describe("global Settings Controls storefront runtime", () => {
  it("applies merchant theme CSS once and isolates script failures", () => {
    const { runtimeDocument, runtimeWindow, styles } = storefrontHarness();
    expect(executeMerchantStorefrontScript("throw new Error('merchant failure')", runtimeWindow)).toBe(false);
    expect(executeMerchantStorefrontScript("window.__merchantControlRuns = 1", runtimeWindow)).toBe(true);

    applyGlobalSettingsControls({
      landingPage: {
        css: { themePages: ".merchant-theme { color: red; }" },
        integrations: {
          customThemeScriptEnabled: true,
          customThemeIntegrationScript: "window.__merchantControlRuns += 1",
          cartIntegrationEnabled: false,
          customCartIntegrationScript: "",
        },
      },
    }, runtimeWindow, runtimeDocument);
    applyGlobalSettingsControls({
      landingPage: {
        css: { themePages: ".merchant-theme { color: red; }" },
        integrations: {
          customThemeScriptEnabled: false,
          customThemeIntegrationScript: "",
          cartIntegrationEnabled: false,
          customCartIntegrationScript: "",
        },
      },
    }, runtimeWindow, runtimeDocument);

    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain(".merchant-theme");
    expect(runtimeWindow.__merchantControlRuns).toBe(2);
  });

  it("runs enabled cart integration code independently of theme code", () => {
    const { runtimeDocument, runtimeWindow } = storefrontHarness();
    applyGlobalSettingsControls({
      landingPage: {
        css: { themePages: "" },
        integrations: {
          customThemeScriptEnabled: true,
          customThemeIntegrationScript: "throw new Error('theme')",
          cartIntegrationEnabled: true,
          customCartIntegrationScript: "class CartIntegration { init() { window.__merchantControlRuns = 3; } }",
        },
      },
    }, runtimeWindow, runtimeDocument);

    expect(runtimeWindow.__merchantControlRuns).toBe(3);
  });

  it("initializes the merchant cart integration class", () => {
    const { runtimeWindow } = storefrontHarness();

    expect(executeMerchantCartIntegration(`class CartIntegration {
      init() { window.__cartIntegrationRuns = (window.__cartIntegrationRuns || 0) + 1; }
    }`, runtimeWindow)).toBe(true);
    expect(runtimeWindow.__cartIntegrationRuns).toBe(1);
  });

  it("resolves enabled collection links to the matching bundle layout", () => {
    const links = [
      { bundleType: "full_page", productHandle: "fpb-parent", targetUrl: "/apps/product-bundles/wpb/12" },
      { bundleType: "product_page", productHandle: "ppb-parent", targetUrl: "/products/ppb-parent" },
    ] as const;

    expect(resolveBundleQuickAddTarget(
      "/products/fpb-parent?variant=1",
      [...links],
      { landingPage: { redirectCollectionQuickAddToBundle: true } },
    )).toBe("/apps/product-bundles/wpb/12");
    expect(resolveBundleQuickAddTarget(
      "/products/ppb-parent",
      [...links],
      { productPage: { redirectCollectionQuickAddToBundle: false } },
    )).toBeNull();
  });
});
