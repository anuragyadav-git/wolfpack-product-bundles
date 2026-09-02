import {
  buildSpecificLinkOfferAdminState,
  resolveSpecificLinkOfferSave,
  type SpecificLinkPolicyState,
} from '../../../app/lib/specific-link-offer-admin';

const now = new Date('2026-08-31T12:00:00.000Z');
const shopTimezone = 'America/New_York';

function policy(overrides: Partial<SpecificLinkPolicyState> = {}): SpecificLinkPolicyState {
  return {
    specificLinkRequired: false,
    priority: 100,
    stopLowerPriority: false,
    scheduleMode: 'always',
    startsAt: null,
    endsAt: null,
    recurrenceFrequency: null,
    recurrenceTimezone: null,
    recurrenceAnchorDate: null,
    recurrenceWindowStartMinute: null,
    recurrenceWindowEndMinute: null,
    recurrenceTermination: 'never',
    recurrenceEndsOn: null,
    recurrenceRunCount: null,
    countryTargetingEnabled: false,
    countryTargetingMode: 'include',
    countryCodes: [],
    ruleVersion: 1,
    conditions: [],
    ...overrides,
  };
}

describe('specific-link offer Admin state', () => {
  it('returns safe link metadata with the shared operations state', () => {
    const state = buildSpecificLinkOfferAdminState(policy({
      specificLinkRequired: true,
      priority: 10,
      stopLowerPriority: true,
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: shopTimezone,
      recurrenceAnchorDate: new Date('2026-09-01T00:00:00.000Z'),
      recurrenceWindowStartMinute: 540,
      recurrenceWindowEndMinute: 1020,
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['US', 'CA'],
      ruleVersion: 4,
      conditions: [{
        expiresAt: new Date('2026-09-30T12:00:00.000Z'),
        revokedAt: null,
      }],
    }), shopTimezone, now);

    expect(state).toEqual({
      enabled: true,
      status: 'active',
      expiresAt: '2026-09-30T12:00:00.000Z',
      ruleVersion: 4,
      priority: 10,
      stopLowerPriority: true,
      scheduleMode: 'recurring',
      startsAt: null,
      endsAt: null,
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: shopTimezone,
      recurrenceAnchorDate: '2026-09-01',
      recurrenceWindowStart: '09:00',
      recurrenceWindowEnd: '17:00',
      recurrenceTermination: 'never',
      recurrenceEndsOn: null,
      recurrenceRunCount: null,
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['CA', 'US'],
    });
  });

  it.each([
    [null, 'not_generated'],
    [policy({ conditions: [{ expiresAt: null, revokedAt: now }] }), 'revoked'],
    [policy({ conditions: [{ expiresAt: now, revokedAt: null }] }), 'expired'],
  ] as const)('reports unusable link state', (input, status) => {
    expect(buildSpecificLinkOfferAdminState(input, shopTimezone, now).status).toBe(status);
  });
});

describe('specific-link offer Save Bar persistence', () => {
  const activePolicy = policy({
    ruleVersion: 3,
    conditions: [{ expiresAt: null, revokedAt: null }],
  });

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
    policy(),
    policy({ conditions: [{ expiresAt: null, revokedAt: now }] }),
    policy({ conditions: [{ expiresAt: now, revokedAt: null }] }),
  ])('rejects enabling without a usable link', (input) => {
    expect(resolveSpecificLinkOfferSave('true', input, now)).toEqual({
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
