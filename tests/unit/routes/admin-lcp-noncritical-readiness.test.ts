import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const fpbFlow = {
  activeSection: "steps",
  blockConfigurationChangeWhileSaving: jest.fn(),
  bundle: {},
  fetcher: { state: "idle" },
  handleSave: jest.fn(),
  isCriticalStatusReady: false,
  isDirty: false,
  isSaveInFlight: false,
  pricingState: {},
  saveBarRef: { current: null },
  SaveBar: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  setShowDiscardModal: jest.fn(),
  shopLocales: [],
  stepsState: {},
  subscriptionConfig: {},
  subscriptionFetcher: {},
  validationErrors: {},
  validationIssues: [],
};

const ppbFlow = {
  blockConfigurationChangeWhileSaving: jest.fn(),
  isCriticalStatusReady: false,
  isSaveInFlight: false,
};

jest.mock("../../../app/routes/app/_shared/bundle-configure/CommonConfigureShell", () => ({
  CommonConfigureShell: ({ children, overlays }: { children: React.ReactNode; overlays: React.ReactNode }) =>
    React.createElement("main", null, "Configure canvas", overlays, children),
}));
jest.mock("../../../app/components/ProxyHealthBanner", () => ({
  ProxyHealthBanner: () => React.createElement("aside", null, "Proxy warning"),
}));
jest.mock("@remix-run/react", () => ({
  Await: ({ children, resolve }: { children: (value: unknown) => React.ReactNode; resolve: unknown }) =>
    React.createElement(React.Fragment, null, children(resolve)),
}));

jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleFlow", () => ({
  useConfigureBundleFlow: () => fpbFlow,
}));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader", () => ({ ConfigureCanvasHeader: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureHiddenInputs", () => ({ ConfigureHiddenInputs: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureSidebar", () => ({ ConfigureSidebar: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupSection", () => ({ StepSetupSection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonsSection", () => ({ FreeGiftAddonsSection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingSection", () => ({ DiscountPricingSection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesVisibilitySection", () => ({ ImagesVisibilitySection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSection", () => ({ BundleSettingsSection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection", () => ({ BundleWidgetSection: () => null }));
jest.mock("../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureRouteModals", () => ({ ConfigureRouteModals: () => React.createElement("div", null, "Configure overlays") }));
jest.mock("../../../app/routes/app/_shared/bundle-configure/ConfigureValidationSummary", () => ({ ConfigureValidationSummary: () => null }));
jest.mock("../../../app/routes/app/_shared/bundle-configure/BundleSubscriptionsSection", () => ({ BundleSubscriptionsSection: () => null }));

jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbConfigureFlow", () => ({
  usePpbConfigureFlow: () => ppbFlow,
}));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureContext", () => ({
  PpbConfigureProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  usePpbConfigureContext: () => ppbFlow,
}));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader", () => ({ PpbCanvasHeader: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureSidebar", () => ({ PpbConfigureSidebar: () => null, PpbConfigureSupplement: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountLanguageModals", () => ({ PpbDiscountLanguageModals: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbMainSections", () => ({ PpbMainSections: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbOverlayModals", () => ({ PpbOverlayModals: () => React.createElement("div", null, "Configure overlays") }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureOverlays", () => ({ PpbConfigureOverlays: () => React.createElement("div", null, "Configure overlays") }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbPageSelectionModal", () => ({ PpbPageSelectionModal: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm", () => ({ PpbSaveForm: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog", () => ({ PpbSelectTemplateDialog: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectedItemsModals", () => ({ PpbSelectedItemsModals: () => null }));
jest.mock("../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbUtilityModals", () => ({ PpbUtilityModals: () => null }));

describe("Admin LCP noncritical readiness", () => {
  it("defers only the inactive configure section modules", async () => {
    const { getDeferredConfigureSection } = await import(
      "../../../app/routes/app/_shared/bundle-configure/deferred-configure-sections"
    );

    expect(getDeferredConfigureSection("step_setup")).toBeNull();
    expect(getDeferredConfigureSection("discount_pricing")).toBe("discount_pricing");
    expect(getDeferredConfigureSection("bundle_visibility")).toBe("images_visibility");
    expect(getDeferredConfigureSection("images_gifs")).toBe("images_visibility");
    expect(getDeferredConfigureSection("subscriptions")).toBe("subscriptions");
  });

  it("renders FPB configure content while app-embed status is pending", async () => {
    const { default: ConfigureBundleFlow } = await import(
      "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow"
    );

    const view = renderToStaticMarkup(React.createElement(ConfigureBundleFlow));
    expect(view).toContain("Configure canvas");
    expect(view).not.toContain("Configure overlays");
  });

  it("renders PPB configure content while app-embed status is pending", async () => {
    const { default: ConfigureBundleFlow } = await import(
      "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow"
    );

    const view = renderToStaticMarkup(React.createElement(ConfigureBundleFlow));
    expect(view).toContain("Configure canvas");
    expect(view).not.toContain("Configure overlays");
  });

});
