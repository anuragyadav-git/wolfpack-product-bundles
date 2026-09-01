import {
  resolveSpecificLinkOfferEligibility,
} from '../../../app/lib/specific-link-offer-eligibility.server';
import {
  createSpecificLinkOfferToken,
} from '../../../app/lib/specific-link-offer-token.server';

const baseInput = {
  now: new Date('2026-08-31T12:00:00.000Z'),
};
const TEST_TOKEN = 'a'.repeat(43);

function createPolicy(overrides: Record<string, unknown> = {}) {
  const created = createSpecificLinkOfferToken({
    token: TEST_TOKEN,
  });

  return {
    token: created.token,
    policy: {
      id: 'policy-1',
      specificLinkRequired: true,
      ruleVersion: 3,
      conditions: [{
        type: 'specific_link',
        tokenHash: created.tokenHash,
        expiresAt: new Date('2026-09-01T12:00:00.000Z'),
        revokedAt: null,
      }],
      ...overrides,
    },
  };
}

describe('specific-link offer eligibility', () => {
  it.each([null, { id: 'policy-1', specificLinkRequired: false, ruleVersion: 1, conditions: [] }])(
    'keeps the bundle eligible when no enabled policy applies',
    (policy) => {
      expect(resolveSpecificLinkOfferEligibility({ ...baseInput, policy, token: null })).toEqual({
        eligible: true,
        reasonCode: 'not_required',
      });
    },
  );

  it('rejects an enabled policy when the token is missing', () => {
    const { policy } = createPolicy();

    expect(resolveSpecificLinkOfferEligibility({ ...baseInput, policy, token: null })).toEqual({
      eligible: false,
      reasonCode: 'token_missing',
      offerPolicyId: 'policy-1',
      ruleVersion: 3,
    });
  });

  it('accepts a matching active token', () => {
    const { policy, token } = createPolicy();

    expect(resolveSpecificLinkOfferEligibility({ ...baseInput, policy, token })).toEqual({
      eligible: true,
      reasonCode: 'matched',
      offerPolicyId: 'policy-1',
      ruleVersion: 3,
    });
  });

  it('rejects invalid, revoked, expired, and missing-condition states safely', () => {
    const { policy } = createPolicy();

    expect(resolveSpecificLinkOfferEligibility({ ...baseInput, policy, token: 'bad.token' }).reasonCode)
      .toBe('token_invalid');
    expect(resolveSpecificLinkOfferEligibility({
      ...baseInput,
      policy: createPolicy({
        conditions: [{ ...policy.conditions[0], revokedAt: new Date('2026-08-31T11:00:00.000Z') }],
      }).policy,
      token: createPolicy().token,
    }).reasonCode).toBe('token_revoked');
    expect(resolveSpecificLinkOfferEligibility({
      ...baseInput,
      policy: createPolicy({
        conditions: [{ ...policy.conditions[0], expiresAt: baseInput.now }],
      }).policy,
      token: createPolicy().token,
    }).reasonCode).toBe('token_expired');
    expect(resolveSpecificLinkOfferEligibility({
      ...baseInput,
      policy: createPolicy({ conditions: [] }).policy,
      token: createPolicy().token,
    }).reasonCode).toBe('condition_missing');
  });
});
