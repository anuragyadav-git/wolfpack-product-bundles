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
      specificLinkRequired: false,
      ruleVersion: null,
    });
    expect(buildOfferDecisionMarker({
      ruleVersion: 4,
      specificLinkRequired: false,
      startsAt: now,
      endsAt: null,
    })).toEqual({
      decisionRequired: true,
      specificLinkRequired: false,
      ruleVersion: 4,
    });
    expect(buildOfferDecisionMarker({
      ruleVersion: 5,
      specificLinkRequired: true,
      startsAt: null,
      endsAt: null,
    })).toEqual({
      decisionRequired: true,
      specificLinkRequired: true,
      ruleVersion: 5,
    });
  });
});
