import {
  getStorefrontSetupSummary,
  getStorefrontStatusRows,
} from "../../../app/routes/app/app.dashboard/DashboardStatusGrid";

const APP_EMBED_RESOURCE = {
  handle: "bundle-app-embed",
  label: "Wolfpack Bundle",
  kind: "embed",
  status: "unavailable" as const,
  enabled: false,
  target: null,
} as const;

const AVAILABLE_RESOURCE = {
  handle: "bundle-product-page",
  label: "Bundle Builder",
  kind: "block",
  status: "available" as const,
  enabled: true,
  target: null,
} as const;

describe("dashboard storefront setup card", () => {
  it("keeps loading and failed checks distinct from a completed setup", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 0,
      totalCoreCount: 2,
      loading: true,
      error: false,
    })).toMatchObject({
      state: "loading",
      titleKey: "dashboard.storefrontSetup.loadingTitle",
    });

    expect(getStorefrontSetupSummary({
      enabledCoreCount: 0,
      totalCoreCount: 2,
      loading: false,
      error: true,
    })).toMatchObject({
      state: "error",
      titleKey: "dashboard.storefrontSetup.errorTitle",
    });
  });

  it("reports the exact remaining core setup work", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 1,
      totalCoreCount: 2,
      loading: false,
      error: false,
    })).toEqual({
      state: "incomplete",
      titleKey: "dashboard.storefrontSetup.incompleteTitle",
      descriptionKey: "dashboard.storefrontSetup.incompleteDescription",
      remainingCoreCount: 1,
    });
  });

  it("reports readiness only when every core component is enabled", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 2,
      totalCoreCount: 2,
      loading: false,
      error: false,
    })).toEqual({
      state: "complete",
      titleKey: "dashboard.storefrontSetup.completeTitle",
      descriptionKey: "dashboard.storefrontSetup.completeDescription",
      remainingCoreCount: 0,
    });
  });

  it("keeps summary output coupled only to core completion state", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 2,
      totalCoreCount: 2,
      loading: false,
      error: false,
    })).toEqual({
      state: "complete",
      titleKey: "dashboard.storefrontSetup.completeTitle",
      descriptionKey: "dashboard.storefrontSetup.completeDescription",
      remainingCoreCount: 0,
    });

    const { core } = getStorefrontStatusRows([APP_EMBED_RESOURCE]);
    expect(core).toHaveLength(1);
  });

  it("returns only core storefront rows from configured status resources", () => {
    expect(getStorefrontStatusRows([APP_EMBED_RESOURCE, AVAILABLE_RESOURCE]))
      .toEqual({
        core: [APP_EMBED_RESOURCE, AVAILABLE_RESOURCE],
      });
  });
});
