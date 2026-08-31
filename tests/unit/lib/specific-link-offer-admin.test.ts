import {
  buildSpecificLinkOfferAdminState,
  resolveSpecificLinkOfferSave,
} from '../../../app/lib/specific-link-offer-admin';

const now = new Date('2026-08-31T12:00:00.000Z');

describe('specific-link offer Admin state', () => {
  it('returns only safe status metadata for a usable link', () => {
    const state = buildSpecificLinkOfferAdminState({
      specificLinkRequired: true,
      priority: 10,
      stopLowerPriority: true,
      startsAt: null,
      endsAt: null,
      ruleVersion: 4,
      conditions: [{
        expiresAt: new Date('2026-09-30T12:00:00.000Z'),
        revokedAt: null,
      }],
    }, now);

    expect(state).toEqual({
      enabled: true,
      priority: 10,
      stopLowerPriority: true,
      startsAt: null,
      endsAt: null,
      status: 'active',
      expiresAt: '2026-09-30T12:00:00.000Z',
      ruleVersion: 4,
    });
    expect(Object.keys(state)).toEqual([
      'enabled',
      'status',
      'expiresAt',
      'ruleVersion',
      'priority',
      'stopLowerPriority',
      'startsAt',
      'endsAt',
    ]);
  });

  it.each([
    [null, 'not_generated'],
    [{ specificLinkRequired: false, priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null, ruleVersion: 2, conditions: [{ expiresAt: null, revokedAt: now }] }, 'revoked'],
    [{ specificLinkRequired: false, priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null, ruleVersion: 3, conditions: [{ expiresAt: now, revokedAt: null }] }, 'expired'],
  ] as const)('reports unusable link state', (policy, status) => {
    expect(buildSpecificLinkOfferAdminState(policy, now).status).toBe(status);
  });
});

describe('specific-link offer Save Bar persistence', () => {
  const activePolicy = {
    specificLinkRequired: false,
    priority: 100,
    stopLowerPriority: false,
    startsAt: null,
    endsAt: null,
    ruleVersion: 3,
    conditions: [{ expiresAt: null, revokedAt: null }],
  };

  it('builds an atomic nested update when delivery changes', () => {
    expect(resolveSpecificLinkOfferSave('true', activePolicy, now)).toEqual({
      updateData: {
        offerPolicy: {
          update: {
            specificLinkRequired: true,
            ruleVersion: { increment: 1 },
          },
        },
      },
    });
  });

  it.each([
    null,
    { specificLinkRequired: false, priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null, ruleVersion: 1, conditions: [] },
    { specificLinkRequired: false, priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null, ruleVersion: 1, conditions: [{ expiresAt: null, revokedAt: now }] },
    { specificLinkRequired: false, priority: 100, stopLowerPriority: false, startsAt: null, endsAt: null, ruleVersion: 1, conditions: [{ expiresAt: now, revokedAt: null }] },
  ])('rejects enabling without a usable link', (policy) => {
    expect(resolveSpecificLinkOfferSave('true', policy, now)).toEqual({
      issue: {
        path: 'offerDelivery.enabled',
        message: 'Generate an active specific link before enabling link-only delivery.',
      },
    });
  });

  it('does not mutate the policy when the field is absent or unchanged', () => {
    expect(resolveSpecificLinkOfferSave(null, activePolicy, now)).toEqual({ updateData: {} });
    expect(resolveSpecificLinkOfferSave('false', activePolicy, now)).toEqual({ updateData: {} });
  });
});
