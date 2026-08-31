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
  ruleVersion: number;
  specificLinkRequired: boolean;
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

export function buildOfferDecisionMarker(policy: OfferDecisionPolicy | null) {
  const specificLinkRequired = policy?.specificLinkRequired === true;
  return {
    decisionRequired: specificLinkRequired
      || policy?.startsAt != null
      || policy?.endsAt != null,
    specificLinkRequired,
    ruleVersion: policy?.ruleVersion ?? null,
  };
}
