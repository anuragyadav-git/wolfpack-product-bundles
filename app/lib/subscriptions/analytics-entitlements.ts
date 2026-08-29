import {
  EntitlementDeniedError,
  type PlanEntitlements,
} from "./entitlements";

export type AnalyticsAccessMode = "SUMMARY" | "ADVANCED";

export function getAnalyticsAccessMode(
  entitlements: PlanEntitlements,
): AnalyticsAccessMode {
  return entitlements.capabilities.advancedAnalytics ? "ADVANCED" : "SUMMARY";
}

export function assertAdvancedAnalyticsAllowed(
  entitlements: PlanEntitlements | null,
): void {
  if (!entitlements) {
    throw new EntitlementDeniedError({
      code: "BILLING_UNVERIFIED",
      entitlement: "analytics.advanced",
      remediation: "RETRY",
    });
  }
  if (!entitlements.capabilities.advancedAnalytics) {
    throw new EntitlementDeniedError({
      code: "ENTITLEMENT_REQUIRED",
      entitlement: "analytics.advanced",
      remediation: "UPGRADE",
    });
  }
}
