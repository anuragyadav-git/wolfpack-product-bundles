import {
  normalizeOfferAnalyticsDimensions,
} from "../../../app/lib/analytics/offer-dimensions";

describe("normalizeOfferAnalyticsDimensions", () => {
  it("normalizes complete privacy-safe offer dimensions", () => {
    expect(normalizeOfferAnalyticsDimensions({
      offerPolicyId: "  policy-1  ",
      offerRuleVersion: 4,
      offerTierId: "  tier-2  ",
      offerEligibilitySource: "specific_link",
    })).toEqual({
      offerPolicyId: "policy-1",
      offerRuleVersion: 4,
      offerTierId: "tier-2",
      offerEligibilitySource: "specific_link",
    });
  });

  it("keeps bundle-only analytics valid with null offer dimensions", () => {
    expect(normalizeOfferAnalyticsDimensions({})).toEqual({
      offerPolicyId: null,
      offerRuleVersion: null,
      offerTierId: null,
      offerEligibilitySource: null,
    });
  });

  it.each([0, -1, 1.5, "2", null])(
    "rejects invalid rule version %p",
    (offerRuleVersion) => {
      expect(normalizeOfferAnalyticsDimensions({ offerRuleVersion }))
        .toMatchObject({ offerRuleVersion: null });
    },
  );

  it("rejects unsupported or sensitive eligibility-source values", () => {
    expect(normalizeOfferAnalyticsDimensions({
      offerEligibilitySource: "customer_tag:vip",
    })).toMatchObject({ offerEligibilitySource: null });
  });

  it("rejects oversized offer identifiers", () => {
    const oversized = "x".repeat(129);
    expect(normalizeOfferAnalyticsDimensions({
      offerPolicyId: oversized,
      offerTierId: oversized,
    })).toMatchObject({
      offerPolicyId: null,
      offerTierId: null,
    });
  });
});
