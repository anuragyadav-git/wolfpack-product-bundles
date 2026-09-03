/**
 * Unit Tests — WolfpackState (SDK state module)
 */

export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ConditionValidator } = require('../../../app/assets/widgets/shared/condition-validator.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createState, addItem, removeItem, clearStep } = require('../../../app/assets/sdk/state.js');

function makeStep(id: string, operator: string, value: number) {
  return {
    id,
    name: `Step ${id}`,
    conditionType: 'quantity',
    conditionOperator: operator,
    conditionValue: value,
    isFreeGift: false,
    isDefault: false,
  };
}

function makeBundleData(steps: object[]) {
  return {
    id: 'bundle_1',
    name: 'Test Bundle',
    steps,
    pricing: { discountType: null },
  };
}

function attachHydratedProduct(state: any, overrides: Record<string, unknown> = {}) {
  const product = {
    id: 'product_100',
    parentProductId: 'product_100',
    selectionId: 'variant_100',
    variantId: 'variant_100',
    title: 'Product A',
    price: 2500,
    weight: 400,
    available: true,
    variants: [{
      id: 'variant_100',
      selectionId: 'variant_100',
      price: 2500,
      weight: 400,
      available: true,
    }],
    ...overrides,
  };
  state.stepProductData = [[product]];
  state.steps[0].products = [product];
}

describe('createState', () => {
  it('returns initial state with isReady false', () => {
    const state = createState();
    expect(state.isReady).toBe(false);
    expect(state.bundleId).toBeNull();
    expect(state.selections).toEqual({});
    expect(state.steps).toEqual([]);
  });
});

describe('addItem', () => {
  it('adds a new variant to an empty step', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'greater_than_or_equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);

    const result = addItem(state, 'step_1', 'variant_100', 1, ConditionValidator);
    expect(result.success).toBe(true);
    expect(state.selections['step_1']['variant_100']).toBe(1);
  });

  it('increments existing variant quantity', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'less_than_or_equal_to', 5)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections['step_1'] = { 'variant_100': 2 };

    const result = addItem(state, 'step_1', 'variant_100', 1, ConditionValidator);
    expect(result.success).toBe(true);
    expect(state.selections['step_1']['variant_100']).toBe(3);
  });

  it('blocks when step max condition would be exceeded', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 2)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections['step_1'] = { 'variant_100': 2 };

    const result = addItem(state, 'step_1', 'variant_200', 1, ConditionValidator);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns error for unknown stepId', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);

    const result = addItem(state, 'step_99', 'variant_100', 1, ConditionValidator);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/step_99/);
  });

  it('returns error when SDK not ready', () => {
    const state = createState();
    const result = addItem(state, 'step_1', 'variant_100', 1, ConditionValidator);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not ready/i);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid quantity %s without mutation', (quantity) => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'less_than_or_equal_to', 5)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);

    expect(addItem(state, 'step_1', 'variant_100', quantity).success).toBe(false);
    expect(state.selections).toEqual({});
  });

  it('rejects unknown and unavailable hydrated variants', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'less_than_or_equal_to', 5)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state, { available: false, variants: [{ id: 'variant_100', selectionId: 'variant_100', available: false }] });

    expect(addItem(state, 'step_1', 'missing', 1).error).toMatch(/variant/i);
    expect(addItem(state, 'step_1', 'variant_100', 1).error).toMatch(/unavailable/i);
    expect(state.selections).toEqual({});
  });

  function makeMetricRuleState(conditionType: string, conditionValue: number, product: Record<string, unknown>) {
    const state = createState();
    state.bundleData = makeBundleData([{
      ...makeStep('step_1', 'less_than_or_equal_to', conditionValue),
      conditionType,
    }]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state, product);
    return state;
  }

  it('rejects a rule-breaking amount increase using hydrated price', () => {
    const state = makeMetricRuleState('amount', 50, { price: 2500 });
    expect(addItem(state, 'step_1', 'variant_100', 2).success).toBe(true);
    expect(addItem(state, 'step_1', 'variant_100', 1).success).toBe(false);
  });

  it('rejects a rule-breaking weight increase using hydrated grams', () => {
    const state = makeMetricRuleState('weight', 500, { weight: 400 });
    expect(addItem(state, 'step_1', 'variant_100', 2).success).toBe(false);
  });

  it('rejects a category-rule increase after translating variant to parent product', () => {
    const state = createState();
    state.bundleData = makeBundleData([{
      id: 'step_1',
      isFreeGift: false,
      isDefault: false,
      categories: [{
        products: [{ selectionId: 'product_100' }],
        conditions: [{ type: 'quantity', condition: 'lessThanOrEqualTo', value: 1 }],
      }],
    }]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);

    expect(addItem(state, 'step_1', 'variant_100', 1).success).toBe(true);
    expect(addItem(state, 'step_1', 'variant_100', 1).success).toBe(false);
    expect(state.selections.step_1.variant_100).toBe(1);
  });
});

describe('removeItem', () => {
  it('decrements variant quantity', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 3)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections['step_1'] = { 'variant_100': 3 };

    const result = removeItem(state, 'step_1', 'variant_100', 1);
    expect(result.success).toBe(true);
    expect(state.selections['step_1']['variant_100']).toBe(2);
  });

  it('removes variant key when qty reaches 0', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections['step_1'] = { 'variant_100': 1 };

    const result = removeItem(state, 'step_1', 'variant_100', 1);
    expect(result.success).toBe(true);
    expect(state.selections['step_1']['variant_100']).toBeUndefined();
  });

  it('does not go below 0', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections['step_1'] = { 'variant_100': 1 };

    const result = removeItem(state, 'step_1', 'variant_100', 5);
    expect(result.success).toBe(true);
    expect(state.selections['step_1']['variant_100']).toBeUndefined();
  });

  it('returns error for unknown stepId', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;

    const result = removeItem(state, 'step_99', 'variant_100', 1);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/step_99/);
  });

  it('rejects invalid quantities and variants without mutation', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 2)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    attachHydratedProduct(state);
    state.selections.step_1 = { variant_100: 2 };

    expect(removeItem(state, 'step_1', 'variant_100', 0).success).toBe(false);
    expect(removeItem(state, 'step_1', 'missing', 1).success).toBe(false);
    expect(state.selections.step_1.variant_100).toBe(2);
  });
});

describe('clearStep', () => {
  it('clears all selections in a step', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 3)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;
    state.selections['step_1'] = { 'variant_100': 2, 'variant_200': 1 };

    const result = clearStep(state, 'step_1');
    expect(result.success).toBe(true);
    expect(state.selections['step_1']).toEqual({});
  });

  it('returns error for unknown stepId', () => {
    const state = createState();
    state.bundleData = makeBundleData([makeStep('step_1', 'equal_to', 1)]);
    state.steps = state.bundleData.steps;
    state.isReady = true;

    const result = clearStep(state, 'step_99');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/step_99/);
  });
});
