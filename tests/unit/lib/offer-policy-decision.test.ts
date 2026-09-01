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

  it('treats schedule mode as authoritative over inactive configured values', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'always',
      startsAt: '2030-01-01T00:00:00.000Z',
      endsAt: '2030-01-02T00:00:00.000Z',
    }, now)).toEqual({
      effective: true,
      state: 'active',
      nextTransitionAt: null,
    });
  });

  it('treats a future start as scheduled', () => {
    expect(resolveOfferSchedule({ scheduleMode: 'one_time', startsAt: '2026-09-01T00:00:00.000Z' }, now)).toEqual({
      effective: false,
      state: 'scheduled',
      nextTransitionAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('treats the start as inclusive and the end as exclusive', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'one_time',
      startsAt: now,
      endsAt: '2026-09-01T00:00:00.000Z',
    }, now)).toEqual({
      effective: true,
      state: 'active',
      nextTransitionAt: '2026-09-01T00:00:00.000Z',
    });
  });

  it('treats an end at the current instant as expired', () => {
    expect(resolveOfferSchedule({ scheduleMode: 'one_time', endsAt: now }, now)).toEqual({
      effective: false,
      state: 'expired',
      nextTransitionAt: null,
    });
  });

  it('preserves a weekly wall-clock window through a daylight-saving transition', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'America/New_York',
      recurrenceAnchorDate: '2026-03-01',
      recurrenceWindowStartMinute: 90,
      recurrenceWindowEndMinute: 210,
      recurrenceTermination: 'never',
    }, new Date('2026-03-08T06:45:00.000Z'))).toEqual({
      effective: true,
      state: 'active',
      nextTransitionAt: '2026-03-08T07:30:00.000Z',
    });
  });

  it('returns the next weekly run while between windows', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'America/New_York',
      recurrenceAnchorDate: '2026-03-01',
      recurrenceWindowStartMinute: 90,
      recurrenceWindowEndMinute: 210,
      recurrenceTermination: 'never',
    }, new Date('2026-03-09T12:00:00.000Z'))).toEqual({
      effective: false,
      state: 'scheduled',
      nextTransitionAt: '2026-03-15T05:30:00.000Z',
    });
  });

  it('skips months that do not contain the anchor day', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'monthly',
      recurrenceTimezone: 'UTC',
      recurrenceAnchorDate: '2026-01-31',
      recurrenceWindowStartMinute: 600,
      recurrenceWindowEndMinute: 660,
      recurrenceTermination: 'never',
    }, new Date('2026-02-15T12:00:00.000Z'))).toEqual({
      effective: false,
      state: 'scheduled',
      nextTransitionAt: '2026-03-31T10:00:00.000Z',
    });
  });

  it('expires after the configured number of actual runs', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'UTC',
      recurrenceAnchorDate: '2026-03-01',
      recurrenceWindowStartMinute: 600,
      recurrenceWindowEndMinute: 660,
      recurrenceTermination: 'after_runs',
      recurrenceRunCount: 2,
    }, new Date('2026-03-15T09:00:00.000Z'))).toEqual({
      effective: false,
      state: 'expired',
      nextTransitionAt: null,
    });
  });

  it('expires when the next run is beyond the inclusive termination date', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'UTC',
      recurrenceAnchorDate: '2026-03-01',
      recurrenceWindowStartMinute: 600,
      recurrenceWindowEndMinute: 660,
      recurrenceTermination: 'on_date',
      recurrenceEndsOn: '2026-03-08',
    }, new Date('2026-03-09T00:00:00.000Z'))).toEqual({
      effective: false,
      state: 'expired',
      nextTransitionAt: null,
    });
  });

  it('fails closed for a malformed recurring policy', () => {
    expect(resolveOfferSchedule({
      scheduleMode: 'recurring',
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'Not/A_Zone',
      recurrenceAnchorDate: '2026-03-01',
      recurrenceWindowStartMinute: 600,
      recurrenceWindowEndMinute: 600,
      recurrenceTermination: 'never',
    }, now)).toEqual({
      effective: false,
      state: 'invalid',
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
      scheduleMode: options.startsAt ? 'one_time' as const : 'always' as const,
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
      scheduleMode: 'one_time',
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
      scheduleMode: 'always',
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
      scheduleMode: 'always',
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
      scheduleMode: 'always',
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
      scheduleMode: 'always',
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
