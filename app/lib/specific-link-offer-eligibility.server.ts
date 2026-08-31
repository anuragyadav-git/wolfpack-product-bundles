import { timingSafeEqual } from 'node:crypto';
import {
  hashSpecificLinkOfferToken,
} from './specific-link-offer-token.server';

export type SpecificLinkEligibilityReasonCode =
  | 'not_required'
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

interface SpecificLinkOfferPolicy {
  id: string;
  enabled: boolean;
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
  now?: Date;
}): SpecificLinkEligibilityDecision {
  if (!input.policy?.enabled) {
    return { eligible: true, reasonCode: 'not_required' };
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
