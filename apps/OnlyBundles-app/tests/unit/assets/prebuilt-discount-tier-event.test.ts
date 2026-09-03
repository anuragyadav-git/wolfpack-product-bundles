export {};

jest.mock('../../../app/assets/widgets/shared/toast-manager.js', () => ({
  ToastManager: { show: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageSelectionNavigationMethods } = require('../../../app/assets/widgets/full-page/methods/selection-navigation-methods.js');

class TestCustomEvent {
  type: string;
  detail: Record<string, unknown>;
  bubbles: boolean;

  constructor(type: string, init: { detail: Record<string, unknown>; bubbles: boolean }) {
    this.type = type;
    this.detail = init.detail;
    this.bubbles = init.bubbles;
  }
}

function createContext(validateStepCondition = true) {
  const calls: string[] = [];
  const events: TestCustomEvent[] = [];
  const context = {
    selectedBundle: {
      id: 'bundle-1',
      steps: [{}],
      pricing: {
        enabled: true,
        method: 'percentage_off',
        rules: [
          { id: 'tier-1', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 2 },
          { id: 'tier-2', conditionType: 'quantity', conditionOperator: 'gte', conditionValue: 4 },
        ],
      },
      validateQuantityPerProduct: { isEnabled: false, allowedQuantity: 1 },
    },
    selectedProducts: [{ 'variant-1': 1 }],
    stepProductData: [[{ selectionId: 'variant-1', price: 1000 }]],
    getVariantAvailable: jest.fn(() => ({ available: null, outOfStock: false })),
    validateStepCondition: jest.fn(() => validateStepCondition),
    updateProductQuantityDisplay: jest.fn(() => calls.push('quantity-render')),
    renderModalTabs: jest.fn(),
    updateModalNavigation: jest.fn(),
    updateModalFooterMessaging: jest.fn(),
    _emitStorefrontEvent: jest.fn((name: string) => calls.push(name)),
    _sendEngagementBeacon: jest.fn(),
    _syncFreeGiftLock: jest.fn(),
    container: {
      dataset: { bundleType: 'full_page' },
      dispatchEvent: (event: TestCustomEvent) => {
        calls.push(event.type);
        events.push(event);
        return true;
      },
    },
    elements: { stepsContainer: { querySelector: jest.fn(() => ({})) } },
    renderSidePanel: jest.fn(() => calls.push('pill-render')),
    _syncSummaryPresentationMode: jest.fn(() => 'sidebar'),
    updateStepTimeline: jest.fn(),
    currentStepIndex: 0,
  };
  return { context, calls, events };
}

describe('prebuilt widget discount tier event order', () => {
  const originalCustomEvent = global.CustomEvent;

  beforeAll(() => {
    global.CustomEvent = TestCustomEvent as any;
  });

  afterAll(() => {
    global.CustomEvent = originalCustomEvent;
  });

  it('emits after the normal selection event and pill rerender', () => {
    const { context, calls, events } = createContext();

    fullPageSelectionNavigationMethods.updateProductSelection.call(context, 0, 'variant-1', 2);

    expect(calls.indexOf('product-quantity-changed')).toBeLessThan(calls.indexOf('pill-render'));
    expect(calls.indexOf('pill-render')).toBeLessThan(calls.indexOf('wpb:discount-tier-reached'));
    expect(events[0].detail).toEqual({
      bundleId: 'bundle-1',
      tierId: 'tier-1',
      tierIndex: 0,
      tierCount: 2,
      feedbackState: 'tier',
    });
  });

  it('does not mutate, rerender, or emit when validation fails', () => {
    const { context, calls, events } = createContext(false);

    fullPageSelectionNavigationMethods.updateProductSelection.call(context, 0, 'variant-1', 2);

    expect(context.selectedProducts[0]['variant-1']).toBe(1);
    expect(calls).toEqual([]);
    expect(events).toEqual([]);
  });
});
