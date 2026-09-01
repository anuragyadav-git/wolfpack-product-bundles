import {
  buildOfferPolicyMutation,
  buildOfferOperationsAdminState,
  resolveOfferOperationsSave,
} from '../../../app/lib/offer-policy-admin';

describe('offer operations Admin state', () => {
  it('uses explicit defaults when no policy exists', () => {
    expect(buildOfferOperationsAdminState(null, 'Asia/Kolkata')).toEqual({
      priority: 100,
      stopLowerPriority: false,
      scheduleMode: 'always',
      startsAt: null,
      endsAt: null,
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'Asia/Kolkata',
      recurrenceAnchorDate: null,
      recurrenceWindowStart: '09:00',
      recurrenceWindowEnd: '17:00',
      recurrenceTermination: 'never',
      recurrenceEndsOn: null,
      recurrenceRunCount: null,
    });
  });

  it('serializes persisted one-shot and local recurrence values for form controls', () => {
    expect(buildOfferOperationsAdminState({
      priority: 12,
      stopLowerPriority: true,
      scheduleMode: 'recurring',
      startsAt: new Date('2026-09-01T10:00:00.000Z'),
      endsAt: new Date('2026-09-02T10:00:00.000Z'),
      recurrenceFrequency: 'monthly',
      recurrenceTimezone: 'America/New_York',
      recurrenceAnchorDate: new Date('2026-01-31T00:00:00.000Z'),
      recurrenceWindowStartMinute: 570,
      recurrenceWindowEndMinute: 1050,
      recurrenceTermination: 'after_runs',
      recurrenceEndsOn: null,
      recurrenceRunCount: 4,
    }, 'Asia/Kolkata')).toEqual({
      priority: 12,
      stopLowerPriority: true,
      scheduleMode: 'recurring',
      startsAt: '2026-09-01T10:00:00.000Z',
      endsAt: '2026-09-02T10:00:00.000Z',
      recurrenceFrequency: 'monthly',
      recurrenceTimezone: 'America/New_York',
      recurrenceAnchorDate: '2026-01-31',
      recurrenceWindowStart: '09:30',
      recurrenceWindowEnd: '17:30',
      recurrenceTermination: 'after_runs',
      recurrenceEndsOn: null,
      recurrenceRunCount: 4,
    });
  });

  it('materializes recurrence defaults for a policy that has not configured them yet', () => {
    expect(buildOfferOperationsAdminState({
      priority: 100,
      stopLowerPriority: false,
      scheduleMode: 'one_time',
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
    }, 'America/New_York')).toEqual(expect.objectContaining({
      recurrenceFrequency: 'weekly',
      recurrenceTimezone: 'America/New_York',
      recurrenceWindowStart: '09:00',
      recurrenceWindowEnd: '17:00',
    }));
  });
});

describe('buildOfferPolicyMutation', () => {
  const operations = {
    changed: true,
    data: {
      priority: 10,
      stopLowerPriority: true,
      scheduleMode: 'always' as const,
      startsAt: null,
      endsAt: null,
      recurrenceFrequency: 'weekly' as const,
      recurrenceTimezone: 'UTC',
      recurrenceAnchorDate: null,
      recurrenceWindowStartMinute: 540,
      recurrenceWindowEndMinute: 1020,
      recurrenceTermination: 'never' as const,
      recurrenceEndsOn: null,
      recurrenceRunCount: null,
    },
  };
  const countryTargeting = {
    changed: false,
    data: {
      countryTargetingEnabled: false,
      countryTargetingMode: 'include' as const,
      countryCodes: [],
    },
  };

  it('creates a policy for operations on a bundle without one', () => {
    expect(buildOfferPolicyMutation({
      shopId: 'test.myshopify.com',
      policyExists: false,
      specificLinkUpdate: null,
      operations,
      countryTargeting,
    })).toEqual({
      offerPolicy: {
        create: {
          shopId: 'test.myshopify.com',
          ...operations.data,
          ruleVersion: 1,
        },
      },
    });
  });

  it('combines link and operations changes into one revision increment', () => {
    expect(buildOfferPolicyMutation({
      shopId: 'test.myshopify.com',
      policyExists: true,
      specificLinkUpdate: { specificLinkRequired: true },
      operations,
      countryTargeting,
    })).toEqual({
      offerPolicy: {
        update: {
          specificLinkRequired: true,
          ...operations.data,
          ruleVersion: { increment: 1 },
        },
      },
    });
  });

  it('does not write an unchanged policy', () => {
    expect(buildOfferPolicyMutation({
      shopId: 'test.myshopify.com',
      policyExists: true,
      specificLinkUpdate: null,
      operations: { ...operations, changed: false },
      countryTargeting,
    })).toEqual({});
  });

  it('combines country targeting with other policy changes under one revision', () => {
    expect(buildOfferPolicyMutation({
      shopId: 'test.myshopify.com',
      policyExists: true,
      specificLinkUpdate: null,
      operations: { ...operations, changed: false },
      countryTargeting: {
        changed: true,
        data: {
          countryTargetingEnabled: true,
          countryTargetingMode: 'exclude',
          countryCodes: ['CA', 'US'],
        },
      },
    })).toEqual({
      offerPolicy: {
        update: {
          countryTargetingEnabled: true,
          countryTargetingMode: 'exclude',
          countryCodes: ['CA', 'US'],
          ruleVersion: { increment: 1 },
        },
      },
    });
  });
});

describe('resolveOfferOperationsSave', () => {
  const current = {
    priority: 100,
    stopLowerPriority: false,
    scheduleMode: 'always' as const,
    startsAt: null,
    endsAt: null,
    recurrenceFrequency: null,
    recurrenceTimezone: null,
    recurrenceAnchorDate: null,
    recurrenceWindowStartMinute: null,
    recurrenceWindowEndMinute: null,
    recurrenceTermination: 'never' as const,
    recurrenceEndsOn: null,
    recurrenceRunCount: null,
  };

  it('returns typed changes for a valid bounded schedule', () => {
    expect(resolveOfferOperationsSave({
      priority: '10',
      stopLowerPriority: 'true',
      scheduleMode: 'one_time',
      startsAt: '2026-09-01T10:00:00.000Z',
      endsAt: '2026-09-02T10:00:00.000Z',
      recurrenceFrequency: 'weekly',
      recurrenceAnchorDate: '',
      recurrenceWindowStart: '09:00',
      recurrenceWindowEnd: '17:00',
      recurrenceTermination: 'never',
      recurrenceEndsOn: '',
      recurrenceRunCount: '',
    }, current, 'Asia/Kolkata')).toEqual({
      changed: true,
      data: {
        priority: 10,
        stopLowerPriority: true,
        scheduleMode: 'one_time',
        startsAt: new Date('2026-09-01T10:00:00.000Z'),
        endsAt: new Date('2026-09-02T10:00:00.000Z'),
        recurrenceFrequency: 'weekly',
        recurrenceTimezone: 'Asia/Kolkata',
        recurrenceAnchorDate: null,
        recurrenceWindowStartMinute: 540,
        recurrenceWindowEndMinute: 1020,
        recurrenceTermination: 'never',
        recurrenceEndsOn: null,
        recurrenceRunCount: null,
      },
    });
  });

  it('returns normalized data for a recurring schedule', () => {
    expect(resolveOfferOperationsSave({
      priority: '20',
      stopLowerPriority: 'false',
      scheduleMode: 'recurring',
      startsAt: '',
      endsAt: '',
      recurrenceFrequency: 'monthly',
      recurrenceAnchorDate: '2026-01-31',
      recurrenceWindowStart: '09:30',
      recurrenceWindowEnd: '17:30',
      recurrenceTermination: 'after_runs',
      recurrenceEndsOn: '',
      recurrenceRunCount: '4',
    }, current, 'America/New_York')).toEqual({
      changed: true,
      data: {
        priority: 20,
        stopLowerPriority: false,
        scheduleMode: 'recurring',
        startsAt: null,
        endsAt: null,
        recurrenceFrequency: 'monthly',
        recurrenceTimezone: 'America/New_York',
        recurrenceAnchorDate: new Date('2026-01-31T00:00:00.000Z'),
        recurrenceWindowStartMinute: 570,
        recurrenceWindowEndMinute: 1050,
        recurrenceTermination: 'after_runs',
        recurrenceEndsOn: null,
        recurrenceRunCount: 4,
      },
    });
  });

  it('accepts empty schedule bounds and reports unchanged defaults', () => {
    expect(resolveOfferOperationsSave({
      priority: '100',
      stopLowerPriority: 'false',
      scheduleMode: 'always',
      startsAt: '',
      endsAt: '',
      recurrenceFrequency: '',
      recurrenceAnchorDate: '',
      recurrenceWindowStart: '',
      recurrenceWindowEnd: '',
      recurrenceTermination: 'never',
      recurrenceEndsOn: '',
      recurrenceRunCount: '',
    }, current, 'UTC')).toEqual({ changed: false, data: current });
  });

  it('does not mutate operations when an older form omits every operations field', () => {
    expect(resolveOfferOperationsSave({
      priority: null,
      stopLowerPriority: null,
      scheduleMode: null,
      startsAt: null,
      endsAt: null,
      recurrenceFrequency: null,
      recurrenceAnchorDate: null,
      recurrenceWindowStart: null,
      recurrenceWindowEnd: null,
      recurrenceTermination: null,
      recurrenceEndsOn: null,
      recurrenceRunCount: null,
    }, current, 'UTC')).toEqual({
      changed: false,
      data: current,
    });
  });

  it.each([
    [{ priority: '0', stopLowerPriority: 'false', scheduleMode: 'always', startsAt: '', endsAt: '', recurrenceFrequency: '', recurrenceAnchorDate: '', recurrenceWindowStart: '', recurrenceWindowEnd: '', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.priority'],
    [{ priority: '10.5', stopLowerPriority: 'false', scheduleMode: 'always', startsAt: '', endsAt: '', recurrenceFrequency: '', recurrenceAnchorDate: '', recurrenceWindowStart: '', recurrenceWindowEnd: '', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.priority'],
    [{ priority: '10', stopLowerPriority: 'false', scheduleMode: 'one_time', startsAt: 'bad', endsAt: '', recurrenceFrequency: '', recurrenceAnchorDate: '', recurrenceWindowStart: '', recurrenceWindowEnd: '', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.startsAt'],
    [{ priority: '10', stopLowerPriority: 'false', scheduleMode: 'one_time', startsAt: '2026-09-02T10:00:00.000Z', endsAt: '2026-09-01T10:00:00.000Z', recurrenceFrequency: '', recurrenceAnchorDate: '', recurrenceWindowStart: '', recurrenceWindowEnd: '', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.endsAt'],
    [{ priority: '10', stopLowerPriority: 'false', scheduleMode: 'recurring', startsAt: '', endsAt: '', recurrenceFrequency: 'weekly', recurrenceAnchorDate: '', recurrenceWindowStart: '09:00', recurrenceWindowEnd: '17:00', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.recurrenceAnchorDate'],
    [{ priority: '10', stopLowerPriority: 'false', scheduleMode: 'recurring', startsAt: '', endsAt: '', recurrenceFrequency: 'weekly', recurrenceAnchorDate: '2026-01-01', recurrenceWindowStart: '17:00', recurrenceWindowEnd: '09:00', recurrenceTermination: 'never', recurrenceEndsOn: '', recurrenceRunCount: '' }, 'offerDelivery.recurrenceWindowEnd'],
    [{ priority: '10', stopLowerPriority: 'false', scheduleMode: 'recurring', startsAt: '', endsAt: '', recurrenceFrequency: 'weekly', recurrenceAnchorDate: '2026-01-01', recurrenceWindowStart: '09:00', recurrenceWindowEnd: '17:00', recurrenceTermination: 'after_runs', recurrenceEndsOn: '', recurrenceRunCount: '0' }, 'offerDelivery.recurrenceRunCount'],
  ])('rejects invalid operations input', (raw, path) => {
    expect(resolveOfferOperationsSave(raw, current, 'UTC')).toEqual({
      issue: expect.objectContaining({ path }),
    });
  });
});
