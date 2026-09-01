import { i18n } from '../i18n/config';
import type { OfferCountryTargetingData } from './offer-country-targeting';

export type OfferOperationsAdminState = {
  priority: number;
  stopLowerPriority: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type OfferOperationsPolicyState = {
  priority: number;
  stopLowerPriority: boolean;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
};

type RawOfferOperations = {
  priority: FormDataEntryValue | null;
  stopLowerPriority: FormDataEntryValue | null;
  startsAt: FormDataEntryValue | null;
  endsAt: FormDataEntryValue | null;
};

type OfferOperationsData = {
  priority: number;
  stopLowerPriority: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

type OfferOperationsSaveResult =
  | { changed: boolean; data: OfferOperationsData }
  | { issue: { path: string; message: string } };

const DEFAULT_STATE: OfferOperationsAdminState = {
  priority: 100,
  stopLowerPriority: false,
  startsAt: null,
  endsAt: null,
};

function iso(value: Date | string | null | undefined): string | null {
  if (value == null || value === '') return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

export function buildOfferOperationsAdminState(
  policy: OfferOperationsPolicyState | null,
): OfferOperationsAdminState {
  if (!policy) return { ...DEFAULT_STATE };
  return {
    priority: policy.priority,
    stopLowerPriority: policy.stopLowerPriority,
    startsAt: iso(policy.startsAt),
    endsAt: iso(policy.endsAt),
  };
}

export function buildOfferPolicyMutation(input: {
  shopId: string;
  policyExists: boolean;
  specificLinkUpdate: { specificLinkRequired: boolean } | null;
  operations: {
    changed: boolean;
    data: {
      priority: number;
      stopLowerPriority: boolean;
      startsAt: Date | null;
      endsAt: Date | null;
    };
  };
  countryTargeting: {
    changed: boolean;
    data: OfferCountryTargetingData;
  };
}) {
  const changed = input.specificLinkUpdate !== null
    || input.operations.changed
    || input.countryTargeting.changed;
  if (!changed) return {};

  const data = {
    ...(input.specificLinkUpdate ?? {}),
    ...(input.operations.changed ? input.operations.data : {}),
    ...(input.countryTargeting.changed ? input.countryTargeting.data : {}),
  };
  if (input.policyExists) {
    return {
      offerPolicy: {
        update: {
          ...data,
          ruleVersion: { increment: 1 },
        },
      },
    };
  }
  return {
    offerPolicy: {
      create: {
        shopId: input.shopId,
        ...data,
        ruleVersion: 1,
      },
    },
  };
}

export function resolveOfferOperationsSave(
  raw: RawOfferOperations,
  currentPolicy: OfferOperationsPolicyState | null,
): OfferOperationsSaveResult {
  if (Object.values(raw).every((value) => value === null)) {
    const current = buildOfferOperationsAdminState(currentPolicy);
    return {
      changed: false,
      data: {
        priority: current.priority,
        stopLowerPriority: current.stopLowerPriority,
        startsAt: current.startsAt ? new Date(current.startsAt) : null,
        endsAt: current.endsAt ? new Date(current.endsAt) : null,
      },
    };
  }
  const priority = Number(raw.priority);
  if (!Number.isInteger(priority) || priority < 1 || priority > 9999) {
    return {
      issue: {
        path: 'offerDelivery.priority',
        message: i18n.t('offerOperations.validation.priority'),
      },
    };
  }

  const startsAtIso = iso(String(raw.startsAt ?? '').trim());
  const endsAtIso = iso(String(raw.endsAt ?? '').trim());
  if (String(raw.startsAt ?? '').trim() && !startsAtIso) {
    return {
      issue: {
        path: 'offerDelivery.startsAt',
        message: i18n.t('offerOperations.validation.startsAt'),
      },
    };
  }
  if (String(raw.endsAt ?? '').trim() && !endsAtIso) {
    return {
      issue: {
        path: 'offerDelivery.endsAt',
        message: i18n.t('offerOperations.validation.endsAt'),
      },
    };
  }
  if (startsAtIso && endsAtIso && endsAtIso <= startsAtIso) {
    return {
      issue: {
        path: 'offerDelivery.endsAt',
        message: i18n.t('offerOperations.validation.range'),
      },
    };
  }

  const data = {
    priority,
    stopLowerPriority: raw.stopLowerPriority === 'true',
    startsAt: startsAtIso ? new Date(startsAtIso) : null,
    endsAt: endsAtIso ? new Date(endsAtIso) : null,
  };
  const current = buildOfferOperationsAdminState(currentPolicy);
  const changed = current.priority !== data.priority
    || current.stopLowerPriority !== data.stopLowerPriority
    || current.startsAt !== startsAtIso
    || current.endsAt !== endsAtIso;
  return { changed, data };
}
