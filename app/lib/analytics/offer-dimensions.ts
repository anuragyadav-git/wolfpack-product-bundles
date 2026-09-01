export const OFFER_ELIGIBILITY_SOURCES = [
  "always",
  "specific_link",
  "schedule",
  "priority",
] as const;

export type OfferEligibilitySource = typeof OFFER_ELIGIBILITY_SOURCES[number];

export type OfferAnalyticsDimensions = {
  offerPolicyId: string | null;
  offerRuleVersion: number | null;
  offerTierId: string | null;
  offerEligibilitySource: OfferEligibilitySource | null;
};

const MAX_IDENTIFIER_LENGTH = 128;

function normalizeIdentifier(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_IDENTIFIER_LENGTH) return null;
  return normalized;
}

function normalizeRuleVersion(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function normalizeEligibilitySource(value: unknown): OfferEligibilitySource | null {
  return typeof value === "string"
    && OFFER_ELIGIBILITY_SOURCES.includes(value as OfferEligibilitySource)
    ? value as OfferEligibilitySource
    : null;
}

export function normalizeOfferAnalyticsDimensions(input: {
  offerPolicyId?: unknown;
  offerRuleVersion?: unknown;
  offerTierId?: unknown;
  offerEligibilitySource?: unknown;
}): OfferAnalyticsDimensions {
  return {
    offerPolicyId: normalizeIdentifier(input.offerPolicyId),
    offerRuleVersion: normalizeRuleVersion(input.offerRuleVersion),
    offerTierId: normalizeIdentifier(input.offerTierId),
    offerEligibilitySource: normalizeEligibilitySource(
      input.offerEligibilitySource,
    ),
  };
}
