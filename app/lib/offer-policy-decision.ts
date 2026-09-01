import type { OfferEligibilitySource } from './analytics/offer-dimensions';

export type OfferScheduleState = 'active' | 'scheduled' | 'expired';

export type OfferPolicyTiming = {
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
};

export type OfferScheduleDecision = {
  effective: boolean;
  state: OfferScheduleState;
  nextTransitionAt: string | null;
};

type OfferPriorityPolicy = OfferPolicyTiming & {
  priority?: number | null;
  stopLowerPriority?: boolean | null;
};

type PrioritizedOffer = {
  id: string;
  offerPolicy?: OfferPriorityPolicy | null;
};

type OfferDecisionPolicy = OfferPolicyTiming & {
  id: string;
  ruleVersion: number;
  specificLinkRequired: boolean;
  priority?: number | null;
  stopLowerPriority?: boolean | null;
  countryTargetingEnabled?: boolean | null;
  countryTargetingMode?: 'include' | 'exclude' | null;
  countryCodes?: readonly string[] | null;
};

export type OfferDecisionMarker = {
  decisionRequired: boolean;
  serverDecisionRequired: boolean;
  specificLinkRequired: boolean;
  countryTargetingEnabled: boolean;
  countryTargetingMode: 'include' | 'exclude';
  countryCodes: string[];
  offerPolicyId: string | null;
  ruleVersion: number | null;
  eligibilitySource: OfferEligibilitySource | null;
};

function instant(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function resolveOfferSchedule(
  policy: OfferPolicyTiming,
  now = new Date(),
): OfferScheduleDecision {
  const startsAt = instant(policy.startsAt);
  const endsAt = instant(policy.endsAt);
  const current = now.getTime();

  if (startsAt && current < startsAt.getTime()) {
    return {
      effective: false,
      state: 'scheduled',
      nextTransitionAt: startsAt.toISOString(),
    };
  }

  if (endsAt && current >= endsAt.getTime()) {
    return {
      effective: false,
      state: 'expired',
      nextTransitionAt: null,
    };
  }

  return {
    effective: true,
    state: 'active',
    nextTransitionAt: endsAt?.toISOString() ?? null,
  };
}

export function applyOfferPriority<T extends PrioritizedOffer>(
  offers: readonly T[],
  now = new Date(),
): T[] {
  const ordered = offers
    .filter((offer) => resolveOfferSchedule(offer.offerPolicy ?? {}, now).effective)
    .sort((left, right) => {
      const priority = (left.offerPolicy?.priority ?? 100)
        - (right.offerPolicy?.priority ?? 100);
      return priority || left.id.localeCompare(right.id);
    });
  const stopIndex = ordered.findIndex(
    (offer) => offer.offerPolicy?.stopLowerPriority === true,
  );
  return stopIndex === -1 ? ordered : ordered.slice(0, stopIndex + 1);
}

export function buildOfferDecisionMarker(
  policy: OfferDecisionPolicy | null,
): OfferDecisionMarker {
  const specificLinkRequired = policy?.specificLinkRequired === true;
  const countryTargetingEnabled = policy?.countryTargetingEnabled === true;
  const serverDecisionRequired = specificLinkRequired
    || policy?.startsAt != null
    || policy?.endsAt != null;
  const countryCodes = [...new Set((policy?.countryCodes ?? [])
    .map((countryCode) => countryCode.trim().toUpperCase())
    .filter((countryCode) => /^[A-Z]{2}$/.test(countryCode)))]
    .sort();
  const eligibilitySource: OfferEligibilitySource | null = !policy
    ? null
    : specificLinkRequired
      ? 'specific_link'
      : policy.startsAt != null || policy.endsAt != null
        ? 'schedule'
        : countryTargetingEnabled
          ? 'country'
        : (policy.priority ?? 100) !== 100 || policy.stopLowerPriority === true
          ? 'priority'
          : 'always';
  return {
    decisionRequired: serverDecisionRequired || countryTargetingEnabled,
    serverDecisionRequired,
    specificLinkRequired,
    countryTargetingEnabled,
    countryTargetingMode: policy?.countryTargetingMode === 'exclude' ? 'exclude' : 'include',
    countryCodes,
    offerPolicyId: policy?.id ?? null,
    ruleVersion: policy?.ruleVersion ?? null,
    eligibilitySource,
  };
}
