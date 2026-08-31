export type SpecificLinkOfferStatus =
  | 'not_generated'
  | 'active'
  | 'revoked'
  | 'expired';

export interface SpecificLinkOfferAdminState {
  enabled: boolean;
  status: SpecificLinkOfferStatus;
  expiresAt: string | null;
  ruleVersion: number | null;
}

interface SpecificLinkConditionState {
  expiresAt: Date | string | null;
  revokedAt: Date | string | null;
}

export interface SpecificLinkPolicyState {
  enabled: boolean;
  ruleVersion: number;
  conditions: ReadonlyArray<SpecificLinkConditionState>;
}

type SpecificLinkOfferSaveResult =
  | {
      updateData: {
        offerPolicy?: {
          update: {
            enabled: boolean;
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
    enabled: policy?.enabled ?? false,
    status,
    expiresAt: expiresAt?.toISOString() ?? null,
    ruleVersion: policy?.ruleVersion ?? null,
  };
}

export function resolveSpecificLinkOfferSave(
  rawEnabled: FormDataEntryValue | null,
  policy: SpecificLinkPolicyState | null,
  now = new Date(),
): SpecificLinkOfferSaveResult {
  if (rawEnabled === null) return { updateData: {} };

  const enabled = rawEnabled === 'true';
  const state = buildSpecificLinkOfferAdminState(policy, now);
  if (enabled && state.status !== 'active') {
    return {
      issue: {
        path: 'offerDelivery.enabled',
        message: 'Generate an active specific link before enabling link-only delivery.',
      },
    };
  }

  if (!policy || enabled === policy.enabled) {
    return { updateData: {} };
  }

  return {
    updateData: {
      offerPolicy: {
        update: {
          enabled,
          ruleVersion: { increment: 1 },
        },
      },
    },
  };
}
