import {
  getEntitlementAlertCopyKeys,
  getEntitlementModalContentKeys,
} from "../../../app/lib/subscriptions/alerts";

describe("getEntitlementAlertCopyKeys", () => {
  it("maps the public-bundle limit to localized upgrade guidance", () => {
    expect(getEntitlementAlertCopyKeys("LIMIT_REACHED")).toEqual({
      heading: "common.upgradePrompt.limitReachedTitle",
      message: "common.upgradePrompt.limitReachedBody",
    });
  });

  it("maps a Growth-only feature to the localized Growth proposition", () => {
    expect(getEntitlementAlertCopyKeys("ENTITLEMENT_REQUIRED")).toEqual({
      heading: "common.alerts.bundleNotSaved",
      message: "billing.cta.body",
    });
  });

  it("maps unverified billing to retry-safe billing guidance", () => {
    expect(getEntitlementAlertCopyKeys("BILLING_UNVERIFIED")).toEqual({
      heading: "billing.error.heading",
      message: "billing.error.verificationFailed",
    });
  });

  it("uses localized generic save feedback when no typed failure exists", () => {
    expect(getEntitlementAlertCopyKeys(undefined)).toEqual({
      heading: "common.alerts.bundleNotSaved",
      message: "common.alerts.operationFailed",
    });
  });
});

describe("getEntitlementModalContentKeys", () => {
  it("maps public bundle limit failure to polite modal copy keys", () => {
    expect(
      getEntitlementModalContentKeys({
        code: "LIMIT_REACHED",
        entitlement: "bundle.public.limit",
      }),
    ).toEqual({
      heading: "billing.entitlements.publicLimitHeading",
      description: "billing.entitlements.publicLimitDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    });
  });

  it("maps premium template failure to specific template copy keys", () => {
    expect(
      getEntitlementModalContentKeys({
        code: "ENTITLEMENT_REQUIRED",
        entitlement: "bundle.template.premium",
      }),
    ).toEqual({
      heading: "billing.entitlements.premiumTemplateHeading",
      description: "billing.entitlements.premiumTemplateDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    });
  });

  it("maps advanced design failure to design copy keys", () => {
    expect(
      getEntitlementModalContentKeys({
        code: "ENTITLEMENT_REQUIRED",
        entitlement: "design.advanced",
      }),
    ).toEqual({
      heading: "billing.entitlements.advancedDesignHeading",
      description: "billing.entitlements.advancedDesignDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    });
  });

  it("maps step limit failure to step copy keys", () => {
    expect(
      getEntitlementModalContentKeys({
        code: "LIMIT_REACHED",
        entitlement: "bundle.steps.limit",
      }),
    ).toEqual({
      heading: "billing.entitlements.stepsLimitHeading",
      description: "billing.entitlements.stepsLimitDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    });
  });

  it("provides fallback keys for generic entitlement requirement", () => {
    expect(
      getEntitlementModalContentKeys({
        code: "ENTITLEMENT_REQUIRED",
      }),
    ).toEqual({
      heading: "billing.entitlements.growthRequiredHeading",
      description: "billing.entitlements.growthRequiredDescription",
      primaryAction: "billing.actions.viewPlans",
      secondaryAction: "billing.actions.saveAsDraft",
    });
  });
});
