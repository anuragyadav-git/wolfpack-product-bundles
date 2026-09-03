import type { EntitlementFailureCode } from "./entitlements";

export interface EntitlementAlertCopyKeys {
  heading: string;
  message: string;
}

export function getEntitlementAlertCopyKeys(
  code: EntitlementFailureCode | null | undefined,
): EntitlementAlertCopyKeys {
  if (code === "LIMIT_REACHED") {
    return {
      heading: "common.upgradePrompt.limitReachedTitle",
      message: "common.upgradePrompt.limitReachedBody",
    };
  }
  if (code === "ENTITLEMENT_REQUIRED") {
    return {
      heading: "common.alerts.bundleNotSaved",
      message: "billing.cta.body",
    };
  }
  if (code === "BILLING_UNVERIFIED") {
    return {
      heading: "billing.error.heading",
      message: "billing.error.verificationFailed",
    };
  }
  return {
    heading: "common.alerts.bundleNotSaved",
    message: "common.alerts.operationFailed",
  };
}
