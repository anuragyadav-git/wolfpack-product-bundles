import { timingSafeEqual } from 'node:crypto';
import {
  hashSpecificLinkOfferToken,
} from './specific-link-offer-token.server';
import { resolveOfferSchedule } from './offer-policy-decision';
import type { OfferPolicyTiming } from './offer-policy-decision';
import { resolveOfferCountryEligibility } from './offer-country-eligibility';

export type SpecificLinkEligibilityReasonCode =
  | 'not_required'
  | 'schedule_not_started'
  | 'schedule_ended'
  | 'country_not_included'
  | 'country_excluded'
  | 'condition_missing'
  | 'token_missing'
  | 'token_invalid'
  | 'token_revoked'
  | 'token_expired'
  | 'matched';

interface SpecificLinkOfferCondition {
  type: string;
  tokenHash: string;
  expiresAt: Date | string | null;
  revokedAt: Date | string | null;
}

export interface SpecificLinkOfferPolicy extends OfferPolicyTiming {
  id: string;
  specificLinkRequired: boolean;
  countryTargetingEnabled?: boolean | null;
  countryTargetingMode?: 'include' | 'exclude' | null;
  countryCodes?: readonly string[] | null;
  ruleVersion: number;
  conditions: SpecificLinkOfferCondition[];
}

export interface SpecificLinkEligibilityDecision {
  eligible: boolean;
  reasonCode: SpecificLinkEligibilityReasonCode;
  offerPolicyId?: string;
  ruleVersion?: number;
}

function hashesMatch(expectedHash: string, token: string) {
  const expected = Buffer.from(expectedHash, 'hex');
  const received = Buffer.from(hashSpecificLinkOfferToken(token), 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function withPolicyContext(
  policy: SpecificLinkOfferPolicy,
  decision: Pick<SpecificLinkEligibilityDecision, 'eligible' | 'reasonCode'>,
): SpecificLinkEligibilityDecision {
  return {
    ...decision,
    offerPolicyId: policy.id,
    ruleVersion: policy.ruleVersion,
  };
}

export function resolveSpecificLinkOfferEligibility(input: {
  policy: SpecificLinkOfferPolicy | null;
  token: string | null;
  countryCode?: string | null;
  now?: Date;
}): SpecificLinkEligibilityDecision {
  if (!input.policy) {
    return { eligible: true, reasonCode: 'not_required' };
  }

  const schedule = resolveOfferSchedule(input.policy, input.now);
  if (!schedule.effective) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: schedule.state === 'scheduled'
        ? 'schedule_not_started'
        : 'schedule_ended',
    });
  }

  if (
    input.countryCode !== undefined
    && !resolveOfferCountryEligibility(input.policy, input.countryCode)
  ) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: input.policy.countryTargetingMode === 'exclude'
        ? 'country_excluded'
        : 'country_not_included',
    });
  }

  if (!input.policy.specificLinkRequired) {
    return input.policy.countryTargetingEnabled === true
      ? withPolicyContext(input.policy, { eligible: true, reasonCode: 'matched' })
      : { eligible: true, reasonCode: 'not_required' };
  }

  const condition = input.policy.conditions.find((candidate) => (
    candidate.type === 'specific_link'
  ));
  if (!condition) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: 'condition_missing',
    });
  }

  if (!input.token) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: 'token_missing',
    });
  }

  if (!hashesMatch(condition.tokenHash, input.token)) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: 'token_invalid',
    });
  }

  if (condition.revokedAt) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: 'token_revoked',
    });
  }

  const now = input.now ?? new Date();
  if (condition.expiresAt && new Date(condition.expiresAt).getTime() <= now.getTime()) {
    return withPolicyContext(input.policy, {
      eligible: false,
      reasonCode: 'token_expired',
    });
  }

  return withPolicyContext(input.policy, {
    eligible: true,
    reasonCode: 'matched',
  });
}
