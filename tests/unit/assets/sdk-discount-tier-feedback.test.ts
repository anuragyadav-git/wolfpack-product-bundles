export {};

const emitted: Array<{ name: string; detail: Record<string, unknown> }> = [];

jest.mock('../../../app/assets/sdk/events.js', () => ({
  emit: (name: string, detail: Record<string, unknown>) => emitted.push({ name, detail }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createSdk } = require('../../../app/storefront/sdk');

function makeState() {
  const step = {
    id: 'step-1',
    conditionType: 'quantity',
    conditionOperator: 'equal_to',
    conditionValue: 5,
    isDefault: false,
    isFreeGift: false,
  };
  const bundleData = {
    id: 'bundle-1',
    steps: [step],
    pricing: {
      enabled: true,
      method: 'percentage_off',
      rules: [
        { id: 'tier-1', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 2 },
        { id: 'tier-2', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 4 },
      ],
    },
  };
  return {
    isReady: true,
    bundleId: bundleData.id,
    bundleName: 'Bundle',
    bundleData,
    steps: [step],
    stepProductData: [[{ selectionId: 'variant-1', price: 1000 }]],
    selections: { 'step-1': { 'variant-1': 1 } },
    discountConfiguration: bundleData.pricing,
  };
}

describe('SDK discount tier feedback event', () => {
  beforeEach(() => emitted.splice(0));

  it('emits the normal mutation event before the exact tier detail', () => {
    const sdk = createSdk(makeState());

    expect(sdk.addItem('step-1', 'variant-1', 1)).toEqual({ success: true });
    expect(emitted.map((event) => event.name)).toEqual([
      'wbp:item-added',
      'wbp:discount-tier-reached',
    ]);
    expect(emitted[1].detail).toEqual({
      bundleId: 'bundle-1',
      tierId: 'tier-1',
      tierIndex: 0,
      tierCount: 2,
      feedbackState: 'tier',
    });
  });

  it('does not emit feedback after a failed mutation', () => {
    const state = makeState();
    state.selections['step-1']['variant-1'] = 5;
    const sdk = createSdk(state);

    expect(sdk.addItem('step-1', 'variant-1', 1).success).toBe(false);
    expect(emitted).toEqual([]);
  });
});
