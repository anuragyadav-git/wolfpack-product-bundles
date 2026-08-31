import {
  buildOfferPolicyMutation,
  buildOfferOperationsAdminState,
  resolveOfferOperationsSave,
} from '../../../app/lib/offer-policy-admin';

describe('offer operations Admin state', () => {
  it('uses explicit defaults when no policy exists', () => {
    expect(buildOfferOperationsAdminState(null)).toEqual({
      priority: 100,
      stopLowerPriority: false,
      startsAt: null,
      endsAt: null,
    });
  });

  it('serializes persisted instants for form controls', () => {
    expect(buildOfferOperationsAdminState({
      priority: 12,
      stopLowerPriority: true,
      startsAt: new Date('2026-09-01T10:00:00.000Z'),
      endsAt: new Date('2026-09-02T10:00:00.000Z'),
    })).toEqual({
      priority: 12,
      stopLowerPriority: true,
      startsAt: '2026-09-01T10:00:00.000Z',
      endsAt: '2026-09-02T10:00:00.000Z',
    });
  });
});

describe('buildOfferPolicyMutation', () => {
  const operations = {
    changed: true,
    data: {
      priority: 10,
      stopLowerPriority: true,
      startsAt: null,
      endsAt: null,
    },
  };

  it('creates a policy for operations on a bundle without one', () => {
    expect(buildOfferPolicyMutation({
      shopId: 'test.myshopify.com',
      policyExists: false,
      specificLinkUpdate: null,
      operations,
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
    })).toEqual({});
  });
});

describe('resolveOfferOperationsSave', () => {
  const current = {
    priority: 100,
    stopLowerPriority: false,
    startsAt: null,
    endsAt: null,
  };

  it('returns typed changes for a valid bounded schedule', () => {
    expect(resolveOfferOperationsSave({
      priority: '10',
      stopLowerPriority: 'true',
      startsAt: '2026-09-01T10:00:00.000Z',
      endsAt: '2026-09-02T10:00:00.000Z',
    }, current)).toEqual({
      changed: true,
      data: {
        priority: 10,
        stopLowerPriority: true,
        startsAt: new Date('2026-09-01T10:00:00.000Z'),
        endsAt: new Date('2026-09-02T10:00:00.000Z'),
      },
    });
  });

  it('accepts empty schedule bounds and reports unchanged defaults', () => {
    expect(resolveOfferOperationsSave({
      priority: '100',
      stopLowerPriority: 'false',
      startsAt: '',
      endsAt: '',
    }, current)).toEqual({ changed: false, data: current });
  });

  it('does not mutate operations when an older form omits every operations field', () => {
    expect(resolveOfferOperationsSave({
      priority: null,
      stopLowerPriority: null,
      startsAt: null,
      endsAt: null,
    }, current)).toEqual({
      changed: false,
      data: current,
    });
  });

  it.each([
    [{ priority: '0', stopLowerPriority: 'false', startsAt: '', endsAt: '' }, 'offerDelivery.priority'],
    [{ priority: '10.5', stopLowerPriority: 'false', startsAt: '', endsAt: '' }, 'offerDelivery.priority'],
    [{ priority: '10', stopLowerPriority: 'false', startsAt: 'bad', endsAt: '' }, 'offerDelivery.startsAt'],
    [{ priority: '10', stopLowerPriority: 'false', startsAt: '2026-09-02T10:00:00.000Z', endsAt: '2026-09-01T10:00:00.000Z' }, 'offerDelivery.endsAt'],
  ])('rejects invalid operations input', (raw, path) => {
    expect(resolveOfferOperationsSave(raw, current)).toEqual({
      issue: expect.objectContaining({ path }),
    });
  });
});
