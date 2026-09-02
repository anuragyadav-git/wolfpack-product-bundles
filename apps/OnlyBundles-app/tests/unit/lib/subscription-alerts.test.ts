import { getEntitlementAlertCopyKeys } from "../../../app/lib/subscriptions/alerts";

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
