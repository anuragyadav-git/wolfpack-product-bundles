import {
  buildOfferOperationsAdminState,
  type OfferOperationsAdminState,
} from './offer-policy-admin';
import {
  buildOfferCountryTargetingAdminState,
  type OfferCountryTargetingAdminState,
  type OfferCountryTargetingPolicyState,
} from './offer-country-targeting';

export type SpecificLinkOfferStatus =
  | 'not_generated'
  | 'active'
  | 'revoked'
  | 'expired';

export interface SpecificLinkOfferAdminState
  extends OfferOperationsAdminState, OfferCountryTargetingAdminState {
  enabled: boolean;
  status: SpecificLinkOfferStatus;
  expiresAt: string | null;
  ruleVersion: number | null;
}

interface SpecificLinkConditionState {
  expiresAt: Date | string | null;
  revokedAt: Date | string | null;
}

export interface SpecificLinkPolicyState extends OfferCountryTargetingPolicyState {
  specificLinkRequired: boolean;
  priority: number;
  stopLowerPriority: boolean;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  scheduleMode: 'always' | 'one_time' | 'recurring';
  recurrenceFrequency: 'weekly' | 'monthly' | null;
  recurrenceTimezone: string | null;
  recurrenceAnchorDate: Date | string | null;
  recurrenceWindowStartMinute: number | null;
  recurrenceWindowEndMinute: number | null;
  recurrenceTermination: 'never' | 'on_date' | 'after_runs';
  recurrenceEndsOn: Date | string | null;
  recurrenceRunCount: number | null;
  ruleVersion: number;
  conditions: ReadonlyArray<SpecificLinkConditionState>;
}

type SpecificLinkOfferSaveResult =
  | {
      updateData: {
        offerPolicy?: {
          update: {
            specificLinkRequired: boolean;
            ruleVersion: { increment: number };
          };
        };
      };
    }
  | {
      issue: {
        path: string;
        message: string;
      };
    };

function toDate(value: Date | string | null): Date | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function buildSpecificLinkOfferAdminState(
  policy: SpecificLinkPolicyState | null,
  shopIanaTimezone: string,
  now = new Date(),
): SpecificLinkOfferAdminState {
  const condition = policy?.conditions[0];
  const expiresAt = toDate(condition?.expiresAt ?? null);
  const revokedAt = toDate(condition?.revokedAt ?? null);
  let status: SpecificLinkOfferStatus = 'not_generated';

  if (condition) {
    if (revokedAt) status = 'revoked';
    else if (expiresAt && expiresAt.getTime() <= now.getTime()) status = 'expired';
    else status = 'active';
  }

  return {
    enabled: policy?.specificLinkRequired ?? false,
    status,
    expiresAt: expiresAt?.toISOString() ?? null,
    ruleVersion: policy?.ruleVersion ?? null,
    ...buildOfferOperationsAdminState(policy, shopIanaTimezone),
    ...buildOfferCountryTargetingAdminState(policy),
  };
}

export function resolveSpecificLinkOfferSave(
  rawEnabled: FormDataEntryValue | null,
  policy: SpecificLinkPolicyState | null,
  now = new Date(),
): SpecificLinkOfferSaveResult {
  if (rawEnabled === null) return { updateData: {} };

  const enabled = rawEnabled === 'true';
  const condition = policy?.conditions[0];
  const expiresAt = toDate(condition?.expiresAt ?? null);
  const revokedAt = toDate(condition?.revokedAt ?? null);
  const linkIsActive = Boolean(condition)
    && !revokedAt
    && (!expiresAt || expiresAt.getTime() > now.getTime());
  if (enabled && !linkIsActive) {
    return {
      issue: {
        path: 'offerDelivery.enabled',
        message: 'Generate an active specific link before enabling link-only delivery.',
      },
    };
  }

  if (!policy || enabled === policy.specificLinkRequired) {
    return { updateData: {} };
  }

  return {
    updateData: {
      offerPolicy: {
        update: {
          specificLinkRequired: enabled,
          ruleVersion: { increment: 1 },
        },
      },
    },
  };
}
