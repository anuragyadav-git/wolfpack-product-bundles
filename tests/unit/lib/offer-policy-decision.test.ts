import {
  applyOfferPriority,
  buildOfferDecisionMarker,
  resolveOfferSchedule,
} from '../../../app/lib/offer-policy-decision';

const now = new Date('2026-08-31T12:00:00.000Z');

describe('resolveOfferSchedule', () => {
  it('treats a policy without bounds as effective', () => {
    expect(resolveOfferSchedule({}, now)).toEqual({
      effective: true,
      state: 'active',
      nextTransitionAt: null,
    });
  });

  it('treats a future start as scheduled', () => {
    expect(resolveOfferSchedule({ startsAt: '2026-09-01T00:00:00.000Z' }, now)).toEqual({
      effective: false,
      state: 'scheduled',
      nextTransitionAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('treats the start as inclusive and the end as exclusive', () => {
    expect(resolveOfferSchedule({
      startsAt: now,
      endsAt: '2026-09-01T00:00:00.000Z',
    }, now)).toEqual({
      effective: true,
      state: 'active',
      nextTransitionAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('treats an end at the current instant as expired', () => {
    expect(resolveOfferSchedule({ endsAt: now }, now)).toEqual({
      effective: false,
      state: 'expired',
      nextTransitionAt: null,
    });
  });
});

describe('applyOfferPriority', () => {
  const offer = (
    id: string,
    priority: number,
    options: { startsAt?: string; stopLowerPriority?: boolean } = {},
  ) => ({
    id,
    offerPolicy: {
      priority,
      stopLowerPriority: options.stopLowerPriority ?? false,
      startsAt: options.startsAt ?? null,
      endsAt: null,
    },
  });

  it('uses lower numbers first and a stable ID tie breaker', () => {
    expect(applyOfferPriority([
      offer('bundle-c', 20),
      offer('bundle-b', 10),
      offer('bundle-a', 10),
    ], now).map((item) => item.id)).toEqual(['bundle-a', 'bundle-b', 'bundle-c']);
  });

  it('stops after the first effective stop-lower policy', () => {
    expect(applyOfferPriority([
      offer('first', 5),
      offer('winner', 10, { stopLowerPriority: true }),
      offer('lower', 20),
    ], now).map((item) => item.id)).toEqual(['first', 'winner']);
  });

  it('removes scheduled offers before applying priority', () => {
    expect(applyOfferPriority([
      offer('future', 1, { startsAt: '2026-09-01T00:00:00.000Z' }),
      offer('active', 20),
    ], now).map((item) => item.id)).toEqual(['active']);
  });
});

describe('buildOfferDecisionMarker', () => {
  it('requires a decision for a specific link or a bounded schedule', () => {
    expect(buildOfferDecisionMarker(null)).toEqual({
      decisionRequired: false,
      serverDecisionRequired: false,
      specificLinkRequired: false,
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: [],
      offerPolicyId: null,
      ruleVersion: null,
      eligibilitySource: null,
    });
    expect(buildOfferDecisionMarker({
      id: 'policy-scheduled',
      ruleVersion: 4,
      specificLinkRequired: false,
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: [],
      startsAt: now,
      endsAt: null,
    })).toEqual({
      decisionRequired: true,
      serverDecisionRequired: true,
      specificLinkRequired: false,
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: [],
      offerPolicyId: 'policy-scheduled',
      ruleVersion: 4,
      eligibilitySource: 'schedule',
    });
    expect(buildOfferDecisionMarker({
      id: 'policy-link',
      ruleVersion: 5,
      specificLinkRequired: true,
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: [],
      startsAt: null,
      endsAt: null,
    })).toEqual({
      decisionRequired: true,
      serverDecisionRequired: true,
      specificLinkRequired: true,
      countryTargetingEnabled: false,
      countryTargetingMode: 'include',
      countryCodes: [],
      offerPolicyId: 'policy-link',
      ruleVersion: 5,
      eligibilitySource: 'specific_link',
    });
  });

  it('exposes a country-only decision without requiring an app-proxy round trip', () => {
    expect(buildOfferDecisionMarker({
      id: 'policy-country',
      ruleVersion: 6,
      specificLinkRequired: false,
      startsAt: null,
      endsAt: null,
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['US', 'CA'],
    })).toEqual({
      decisionRequired: true,
      serverDecisionRequired: false,
      specificLinkRequired: false,
      countryTargetingEnabled: true,
      countryTargetingMode: 'exclude',
      countryCodes: ['CA', 'US'],
      offerPolicyId: 'policy-country',
      ruleVersion: 6,
      eligibilitySource: 'country',
    });
  });

  it('marks operational policies without eligibility conditions as priority or always', () => {
    expect(buildOfferDecisionMarker({
      id: 'policy-priority',
      ruleVersion: 2,
      specificLinkRequired: false,
      startsAt: null,
      endsAt: null,
      priority: 10,
      stopLowerPriority: true,
    })).toMatchObject({
      offerPolicyId: 'policy-priority',
      eligibilitySource: 'priority',
    });
    expect(buildOfferDecisionMarker({
      id: 'policy-always',
      ruleVersion: 1,
      specificLinkRequired: false,
      startsAt: null,
      endsAt: null,
      priority: 100,
      stopLowerPriority: false,
    })).toMatchObject({
      offerPolicyId: 'policy-always',
      eligibilitySource: 'always',
    });
  });
});
