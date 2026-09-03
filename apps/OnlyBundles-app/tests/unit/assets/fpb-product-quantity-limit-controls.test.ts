export {};

jest.mock('../../../app/assets/widgets/shared/toast-manager.js', () => ({
  ToastManager: { show: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageSelectionNavigationMethods } = require('../../../app/assets/widgets/full-page/methods/selection-navigation-methods.js');

class FakeButton {
  disabled = false;
  attributes = new Map<string, string>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

describe('FPB per-product quantity-limit controls', () => {
  it('disables the increment control at the configured limit without hardcoding the limit', () => {
    const button = new FakeButton();
    const context = {
      selectedBundle: {
        validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 3 },
      },
    };

    fullPageSelectionNavigationMethods.syncProductQuantityIncreaseState.call(context, button, 3);

    expect(button.disabled).toBe(true);
    expect(button.attributes.get('aria-disabled')).toBe('true');
  });

  it('re-enables the increment control when quantity drops below the configured limit', () => {
    const button = new FakeButton();
    const context = {
      selectedBundle: {
        validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 2 },
      },
    };

    fullPageSelectionNavigationMethods.syncProductQuantityIncreaseState.call(context, button, 2);
    fullPageSelectionNavigationMethods.syncProductQuantityIncreaseState.call(context, button, 1);

    expect(button.disabled).toBe(false);
    expect(button.attributes.has('aria-disabled')).toBe(false);
  });

  it('leaves the increment control enabled when per-product validation is disabled', () => {
    const button = new FakeButton();
    const context = {
      selectedBundle: {
        validateQuantityPerProduct: { isEnabled: false, allowedQuantity: 1 },
      },
    };

    fullPageSelectionNavigationMethods.syncProductQuantityIncreaseState.call(context, button, 9);

    expect(button.disabled).toBe(false);
    expect(button.attributes.has('aria-disabled')).toBe(false);
  });
});

function createSelectionContext(validateQuantityPerProduct: { isEnabled: boolean; allowedQuantity: number }) {
  return {
    selectedBundle: {
      steps: [{}],
      validateQuantityPerProduct,
    },
    selectedProducts: [{ 'variant-1': 1 }],
    getVariantAvailable: jest.fn(() => ({ available: null, outOfStock: false })),
    validateStepCondition: jest.fn(() => true),
    updateProductQuantityDisplay: jest.fn(),
    renderModalTabs: jest.fn(),
    updateModalNavigation: jest.fn(),
    updateModalFooterMessaging: jest.fn(),
    _emitStorefrontEvent: jest.fn(),
    _sendEngagementBeacon: jest.fn(),
    _syncFreeGiftLock: jest.fn(),
    container: { dataset: { bundleType: 'full_page' } },
    elements: { stepsContainer: { querySelector: jest.fn(() => null) } },
    renderSidePanel: jest.fn(),
    _syncSummaryPresentationMode: jest.fn(() => 'sidebar'),
    updateStepTimeline: jest.fn(),
    currentStepIndex: 0,
  };
}

describe('FPB per-product quantity-limit selection mutations', () => {
  it('rejects an increase above an enabled maximum before changing selection state', () => {
    const context = createSelectionContext({ isEnabled: true, allowedQuantity: 1 });

    fullPageSelectionNavigationMethods.updateProductSelection.call(context, 0, 'variant-1', 2);

    expect(context.selectedProducts[0]['variant-1']).toBe(1);
    expect(context.updateProductQuantityDisplay).not.toHaveBeenCalled();
  });

  it('allows an increase up to an enabled maximum greater than one', () => {
    const context = createSelectionContext({ isEnabled: true, allowedQuantity: 3 });
    context.selectedProducts[0]['variant-1'] = 2;

    fullPageSelectionNavigationMethods.updateProductSelection.call(context, 0, 'variant-1', 3);

    expect(context.selectedProducts[0]['variant-1']).toBe(3);
    expect(context.updateProductQuantityDisplay).toHaveBeenCalledWith(0, 'variant-1', 3);
  });

  it('allows an increase above the saved maximum when validation is disabled', () => {
    const context = createSelectionContext({ isEnabled: false, allowedQuantity: 1 });

    fullPageSelectionNavigationMethods.updateProductSelection.call(context, 0, 'variant-1', 2);

    expect(context.selectedProducts[0]['variant-1']).toBe(2);
    expect(context.updateProductQuantityDisplay).toHaveBeenCalledWith(0, 'variant-1', 2);
  });
});
