// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  captureDiscountTierState,
  getDiscountTierTransition,
  installDiscountTierPillFeedback,
} = require('../../../app/assets/widgets/shared/discount-tier-feedback.js');

function makeController(quantity = 0, rules = [
  { id: 'tier-1', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 2 },
  { id: 'tier-2', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 4 },
]) {
  return {
    selectedBundle: {
      id: 'bundle-1',
      pricing: { enabled: true, method: 'percentage_off', rules },
      steps: [{}],
    },
    selectedProducts: [{ 'variant-1': quantity }],
    stepProductData: [[{ selectionId: 'variant-1', price: 1000 }]],
  };
}

describe('discount tier transition state', () => {
  it('emits only when the effective tier advances', () => {
    const before = captureDiscountTierState(makeController(1));
    const after = captureDiscountTierState(makeController(2));

    expect(getDiscountTierTransition(before, after)).toEqual({
      bundleId: 'bundle-1',
      tierId: 'tier-1',
      tierIndex: 0,
      tierCount: 2,
      feedbackState: 'tier',
    });
    expect(getDiscountTierTransition(after, captureDiscountTierState(makeController(3)))).toBeNull();
    expect(getDiscountTierTransition(after, before)).toBeNull();
  });

  it('uses completion feedback for the final tier and a single configured tier', () => {
    expect(getDiscountTierTransition(
      captureDiscountTierState(makeController(3)),
      captureDiscountTierState(makeController(4)),
    )?.feedbackState).toBe('complete');

    const oneRule = [{ id: 'only-tier', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 1 }];
    expect(getDiscountTierTransition(
      captureDiscountTierState(makeController(0, oneRule)),
      captureDiscountTierState(makeController(1, oneRule)),
    )).toMatchObject({ tierId: 'only-tier', tierIndex: 0, tierCount: 1, feedbackState: 'complete' });
  });

  it('emits once for the highest tier crossed by a multi-tier jump', () => {
    expect(getDiscountTierTransition(
      captureDiscountTierState(makeController(0)),
      captureDiscountTierState(makeController(5)),
    )).toMatchObject({ tierId: 'tier-2', tierIndex: 1, feedbackState: 'complete' });
  });

  it('allows a lost tier to be earned again', () => {
    const reached = captureDiscountTierState(makeController(2));
    const lost = captureDiscountTierState(makeController(1));

    expect(getDiscountTierTransition(reached, lost)).toBeNull();
    expect(getDiscountTierTransition(lost, reached)).toMatchObject({ tierId: 'tier-1', tierIndex: 0 });
  });

  it('stays silent when pricing is disabled', () => {
    const beforeController = makeController(1);
    const afterController = makeController(4);
    beforeController.selectedBundle.pricing.enabled = false;
    afterController.selectedBundle.pricing.enabled = false;

    expect(getDiscountTierTransition(
      captureDiscountTierState(beforeController),
      captureDiscountTierState(afterController),
    )).toBeNull();
  });
});

describe('mounted discount pill feedback', () => {
  function makeFeedbackRoot(count: number, portalCount = 0) {
    let listener: ((event: Event) => void) | null = null;
    const pills = Array.from({ length: count }, () => {
      const attributes = new Map<string, string>();
      return {
        offsetWidth: 100,
        setAttribute: (name: string, value: string) => attributes.set(name, value),
        getAttribute: (name: string) => attributes.get(name) ?? null,
        hasAttribute: (name: string) => attributes.has(name),
        removeAttribute: (name: string) => attributes.delete(name),
      };
    });
    const portalPills = Array.from({ length: portalCount }, () => {
      const attributes = new Map<string, string>();
      return {
        offsetWidth: 100,
        setAttribute: (name: string, value: string) => attributes.set(name, value),
        getAttribute: (name: string) => attributes.get(name) ?? null,
        hasAttribute: (name: string) => attributes.has(name),
        removeAttribute: (name: string) => attributes.delete(name),
      };
    });
    const root = {
      querySelectorAll: () => pills,
      ownerDocument: {
        getElementById: (id: string) => id === 'bundle-builder-modal'
          ? { querySelectorAll: () => portalPills }
          : null,
      },
      addEventListener: (_name: string, callback: (event: Event) => void) => { listener = callback; },
      removeEventListener: () => { listener = null; },
      dispatch: (detail: Record<string, unknown>) => listener?.({ detail } as unknown as Event),
    };
    return { root, pills, portalPills };
  }

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('targets every mounted eligible pill and restores normal state', () => {
    const { root, pills } = makeFeedbackRoot(2);
    const cleanup = installDiscountTierPillFeedback(root as any);

    root.dispatch({ bundleId: 'bundle-1', tierId: 'tier-1', tierIndex: 0, tierCount: 2, feedbackState: 'tier' });

    expect(pills.every((pill) => pill.getAttribute('data-wpb-discount-feedback') === 'tier')).toBe(true);
    jest.advanceTimersByTime(650);
    expect(pills.every((pill) => !pill.hasAttribute('data-wpb-discount-feedback'))).toBe(true);
    cleanup();
  });

  it('targets eligible pills mounted in the shared modal portal', () => {
    const { root, portalPills } = makeFeedbackRoot(0, 1);
    const cleanup = installDiscountTierPillFeedback(root as any);

    root.dispatch({ bundleId: 'bundle-1', tierId: 'tier-1', tierIndex: 0, tierCount: 2, feedbackState: 'tier' });

    expect(portalPills[0].getAttribute('data-wpb-discount-feedback')).toBe('tier');
    jest.advanceTimersByTime(650);
    expect(portalPills[0].hasAttribute('data-wpb-discount-feedback')).toBe(false);
    cleanup();
  });

  it('replays repeated feedback and uses the completion duration', () => {
    const { root, pills } = makeFeedbackRoot(1);
    const cleanup = installDiscountTierPillFeedback(root as any);
    const detail = { bundleId: 'bundle-1', tierId: 'tier-2', tierIndex: 1, tierCount: 2, feedbackState: 'complete' };

    root.dispatch(detail);
    jest.advanceTimersByTime(900);
    root.dispatch(detail);
    jest.advanceTimersByTime(1199);
    expect(pills[0].getAttribute('data-wpb-discount-feedback')).toBe('complete');
    jest.advanceTimersByTime(1);
    expect(pills[0].hasAttribute('data-wpb-discount-feedback')).toBe(false);
    cleanup();
  });
});
