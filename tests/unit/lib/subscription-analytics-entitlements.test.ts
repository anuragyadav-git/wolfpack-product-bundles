import {
  assertAdvancedAnalyticsAllowed,
  getAnalyticsAccessMode,
} from "../../../app/lib/subscriptions/analytics-entitlements";
import {
  EntitlementDeniedError,
  getPlanEntitlements,
} from "../../../app/lib/subscriptions/entitlements";

describe("analytics entitlements", () => {
  it("returns SUMMARY for Free", () => {
    expect(getAnalyticsAccessMode(getPlanEntitlements("FREE", "NONE"))).toBe("SUMMARY");
  });

  it.each(["MONTHLY", "ANNUAL"] as const)("returns ADVANCED for Growth %s", (interval) => {
    expect(getAnalyticsAccessMode(getPlanEntitlements("GROWTH", interval))).toBe("ADVANCED");
  });

  it("blocks advanced actions for Free", () => {
    expect(() => assertAdvancedAnalyticsAllowed(getPlanEntitlements("FREE", "NONE")))
      .toThrow(EntitlementDeniedError);
  });

  it("fails closed when billing is unknown", () => {
    try {
      assertAdvancedAnalyticsAllowed(null);
      throw new Error("Expected denial");
    } catch (error) {
      expect(error).toMatchObject({ code: "BILLING_UNVERIFIED", status: 503 });
    }
  });
});
