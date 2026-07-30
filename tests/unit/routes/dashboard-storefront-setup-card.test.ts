import { getStorefrontSetupSummary } from "../../../app/routes/app/app.dashboard/DashboardStatusGrid";

describe("dashboard storefront setup card", () => {
  it("keeps loading and failed checks distinct from a completed setup", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 0,
      totalCoreCount: 3,
      loading: true,
      error: false,
    })).toMatchObject({
      state: "loading",
      titleKey: "dashboard.storefrontSetup.loadingTitle",
    });

    expect(getStorefrontSetupSummary({
      enabledCoreCount: 0,
      totalCoreCount: 3,
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
      totalCoreCount: 3,
      loading: false,
      error: false,
    })).toEqual({
      state: "incomplete",
      titleKey: "dashboard.storefrontSetup.incompleteTitle",
      descriptionKey: "dashboard.storefrontSetup.incompleteDescription",
      actionKey: "dashboard.storefrontSetup.finishSetup",
      remainingCoreCount: 2,
    });
  });

  it("reports readiness only when every core component is enabled", () => {
    expect(getStorefrontSetupSummary({
      enabledCoreCount: 3,
      totalCoreCount: 3,
      loading: false,
      error: false,
    })).toEqual({
      state: "complete",
      titleKey: "dashboard.storefrontSetup.completeTitle",
      descriptionKey: "dashboard.storefrontSetup.completeDescription",
      actionKey: "dashboard.storefrontSetup.viewDetails",
      remainingCoreCount: 0,
    });
  });
});
