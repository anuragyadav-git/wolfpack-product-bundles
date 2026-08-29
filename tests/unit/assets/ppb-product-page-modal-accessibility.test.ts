export {};

// Ensure global window exists for CurrencyManager/format helpers used by modal methods.
(globalThis as any).window = {
  Shopify: {
    currency: {
      active: 'USD',
      format: '$ {{amount}}',
    },
  },
  shopMoneyFormat: '$ {{amount}}',
};
if (typeof globalThis.getComputedStyle !== 'function') {
  (globalThis as any).getComputedStyle = (() => ({
    getPropertyValue: () => '',
  })) as any;
}

const {
  ProductPageModalStateMethods,
} = require('../../../app/assets/widgets/product-page/methods/modal-state-methods.js');
const {
  ProductPageWidgetMiscMethods,
} = require('../../../app/assets/widgets/product-page/methods/widget-misc-methods.js');
const { ToastManager } = require('../../../app/assets/widgets/shared/toast-manager.js');
const { JSDOM } = require('jsdom');

beforeEach(() => {
  jest.restoreAllMocks();
});

function createFocusableButton(name: string) {
  const attributes = new Map<string, string>();
  return {
    name,
    dataset: {} as Record<string, string>,
    isConnected: true,
    focus: jest.fn(),
    click: jest.fn(),
    addEventListener: jest.fn(),
    disabled: false,
    tagName: 'BUTTON',
    classList: {
      contains: () => false,
    },
    getAttribute: (attribute: string) => attributes.get(attribute) ?? null,
    setAttribute: (attribute: string, value: string) => attributes.set(attribute, value),
  } as any;
}

function createModal({
  closeButton,
  closeButtons = [closeButton],
  prevButton,
  nextButton,
  footerDiscountText,
  discountSection,
}: {
  closeButton: any;
  closeButtons?: any[];
  prevButton: any;
  nextButton: any;
  footerDiscountText: any;
  discountSection: any;
}) {
  const classes = new Set<string>();
  const contains = (node: any) => closeButtons.includes(node) || node === prevButton || node === nextButton;
  const modal = {
    classList: {
      add: (value: string) => { classes.add(value); },
      remove: (value: string) => { classes.delete(value); },
      contains: (value: string) => classes.has(value),
      toggle: (value: string, force?: boolean) => {
        if (force === true) {
          classes.add(value);
        } else if (force === false) {
          classes.delete(value);
        } else {
          if (classes.has(value)) classes.delete(value);
          else classes.add(value);
        }
      },
    },
    style: {} as Record<string, string>,
    querySelector: (selector: string) => {
      if (selector === '.modal-step-title') {
        return { innerHTML: '' };
      }
      if (selector === '.product-grid') {
        return {};
      }
      if (selector === '.prev-button') {
        return prevButton;
      }
      if (selector === '.next-button') {
        return nextButton;
      }
      if (selector === '.footer-discount-text') {
        return footerDiscountText;
      }
      if (selector === '.modal-footer-discount-messaging' || selector === '.modal-header-discount-messaging') {
        return discountSection;
      }
      return null;
    },
    querySelectorAll: (selector: string) => {
      if (selector === '.close-button') return closeButtons;
      if (selector === '.prev-button') return [prevButton];
      if (selector === '.next-button') return [nextButton];
      if (selector === 'button:not([disabled])') return [closeButton, prevButton, nextButton];
      return [];
    },
    contains: contains,
  } as any;

  return modal;
}

function createContext({
  closeButton = createFocusableButton('close'),
  closeButtons = [closeButton],
  prevButton = createFocusableButton('prev'),
  nextButton = createFocusableButton('next'),
  footerDiscountText = { textContent: '' },
  discountSection = {
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  },
}: any = {}) {
  const modal = createModal({
    closeButton,
    closeButtons,
    prevButton,
    nextButton,
    footerDiscountText,
    discountSection,
  });
  const opener = createFocusableButton('opener');

  const keyboardHandlerHolder = { handler: undefined as any };
  const createDocumentElement = () => ({
    style: {} as Record<string, string>,
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: () => false,
      toggle: jest.fn(),
    },
    _children: [] as any[],
    parentNode: null as any,
    textContent: '',
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(function(this: any, child: any) {
      this._children.push(child);
      child.parentNode = this;
      return child;
    }),
    remove: jest.fn(function(this: any) {
      if (this.parentNode && Array.isArray(this.parentNode._children)) {
        this.parentNode._children = this.parentNode._children.filter((child: any) => child !== this);
      }
    }),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
  });
  const fakeDocument = {
    body: { style: {} as Record<string, string> },
    activeElement: opener,
    getElementById: (_id: string) => null,
    createElement: (_tagName: string) => createDocumentElement(),
    addEventListener: (eventName: string, handler: any) => {
      if (eventName === 'keydown') {
        keyboardHandlerHolder.handler = handler;
      }
    },
  } as any;

  const context = {
    currentStepIndex: 0,
    selectedBundle: {
      steps: [{ name: 'Step 1' }],
    },
    stepProductData: [[], []],
    selectedProducts: [{}, {}],
    elements: {
      modal,
      bsOverlay: null,
      addToCartButton: { addEventListener: jest.fn() },
    },
    _resolveText: () => 'Next',
    resolveProductPageStepText: (step: { name?: string }, fallback: string) => step?.name || fallback,
    setBottomSheetVisibility: jest.fn(),
    renderModalTabs: jest.fn(),
    renderModalProductsLoading: jest.fn(),
    renderModalProducts: jest.fn(),
    loadStepProducts: jest.fn().mockResolvedValue(undefined),
    updateModalNavigation: jest.fn(),
    updateModalFooterMessaging: jest.fn(),
    preloadNextStep: jest.fn(),
    config: { showDiscountMessaging: true },
    validateStep: jest.fn(() => true),
    _isConditionValidationEnabled: () => true,
    renderSteps: jest.fn(),
    updateAddToCartButton: jest.fn(),
    updateFooterMessaging: jest.fn(),
    getDiscountInfoWithSelectedAddonDiscount: (value: Record<string, unknown>) => value,
    navigateModal: jest.fn(),
    keyboardHandler: keyboardHandlerHolder,
  } as any;

  Object.assign(context, ProductPageModalStateMethods, ProductPageWidgetMiscMethods);

  return { context, closeButton, prevButton, nextButton, opener, keyboardHandlerHolder, fakeDocument };
}

describe('PPB modal accessibility keyboard and focus management', () => {
  it('keeps the Next or Done accessible name equal to its visible label', () => {
    const attributes = new Map<string, string>();
    const nextButton = {
      textContent: '',
      disabled: false,
      setAttribute: (name: string, value: string) => attributes.set(name, value),
    };
    const footer = { classList: { toggle: jest.fn() } };
    const context = {
      currentStepIndex: 0,
      selectedBundle: { steps: [{}] },
      elements: {
        modal: {
          querySelector: (selector: string) => ({
            '.prev-button': { disabled: false },
            '.next-button': nextButton,
            '.bw-bs-footer': footer,
          }[selector] || null),
        },
      },
      _resolveText: (key: string, fallback: string) => key === 'doneButton' ? 'Done' : fallback,
    } as any;

    ProductPageModalStateMethods.updateModalNavigation.call(context);

    expect(nextButton.textContent).toContain('Done');
    expect(attributes.get('aria-label')).toBe('Done');
  });

  it('restores focus to the rerendered opener and focuses the modal close control on open', async () => {
    jest.spyOn(ToastManager, 'show').mockImplementation(() => {});

    const { context, opener, closeButton, fakeDocument } = createContext();
    const rerenderedOpener = createFocusableButton('rerendered-opener');
    const rerenderedCard = createFocusableButton('rerendered-card');
    rerenderedCard.tagName = 'DIV';
    opener.dataset = { stepIndex: '0', cardIndex: '0', variantId: 'variant-1' };
    rerenderedOpener.dataset = { ...opener.dataset };
    rerenderedCard.dataset = { ...opener.dataset };
    context.elements.stepsContainer = {
      querySelectorAll: jest.fn(() => [rerenderedCard, rerenderedOpener]),
    };
    context.renderSteps.mockImplementation(() => {
      opener.isConnected = false;
    });
    (globalThis as any).document = fakeDocument;
    (globalThis as any).requestAnimationFrame = (callback: () => void) => {
      callback();
    };

    context.openModal(0);
    await Promise.resolve();

    expect(closeButton.focus).toHaveBeenCalledTimes(1);
    expect(opener.focus).not.toHaveBeenCalled();

    context.closeModal();

    expect(opener.focus).not.toHaveBeenCalled();
    expect(rerenderedCard.focus).not.toHaveBeenCalled();
    expect(rerenderedOpener.focus).toHaveBeenCalledTimes(1);
    expect(context.renderSteps.mock.invocationCallOrder[0])
      .toBeLessThan(rerenderedOpener.focus.mock.invocationCallOrder[0]);
    expect(rerenderedOpener.focus.mock.invocationCallOrder[0])
      .toBeLessThan(context.setBottomSheetVisibility.mock.invocationCallOrder[1]);
  });

  it('skips a breakpoint-hidden close control and focuses the visible modal close control', async () => {
    jest.spyOn(ToastManager, 'show').mockImplementation(() => {});

    const hiddenDesktopClose = {
      ...createFocusableButton('desktop-close'),
      getClientRects: () => [],
    };
    const visibleMobileClose = {
      ...createFocusableButton('mobile-close'),
      getClientRects: () => [{ width: 44, height: 44 }],
    };
    const { context, fakeDocument } = createContext({
      closeButton: hiddenDesktopClose,
      closeButtons: [hiddenDesktopClose, visibleMobileClose],
    });
    (globalThis as any).document = fakeDocument;
    (globalThis as any).requestAnimationFrame = (callback: () => void) => {
      callback();
    };

    context.openModal(0);
    await Promise.resolve();

    expect(hiddenDesktopClose.focus).not.toHaveBeenCalled();
    expect(visibleMobileClose.focus).toHaveBeenCalledTimes(1);
  });

  it('supports Escape, ArrowLeft, and ArrowRight keyboard shortcuts while modal is open', () => {
    jest.spyOn(ToastManager, 'show').mockImplementation(() => {});

    const { context, keyboardHandlerHolder, fakeDocument } = createContext();
    (globalThis as any).document = fakeDocument;
    context.elements.modal.classList.add('bw-bs-panel--open');

    context.attachEventListeners();

    const keyboard = keyboardHandlerHolder.handler;
    expect(typeof keyboard).toBe('function');

    const closeModalSpy = jest.spyOn(context, 'closeModal');
    const preventDefault = jest.fn();

    keyboard({ key: 'Escape', target: { tagName: 'DIV' }, preventDefault });
    expect(closeModalSpy).toHaveBeenCalledTimes(1);

    context.elements.modal.classList.add('bw-bs-panel--open');

    keyboard({ key: 'ArrowLeft', target: null, preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(1);

    keyboard({ key: 'ArrowRight', target: null, preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(2);
  });

  it('wraps Tab and Shift+Tab within the topmost picker', () => {
    const { context, closeButton, nextButton, keyboardHandlerHolder, fakeDocument } = createContext();
    context._isPpbPickerDrawerTopmost = jest.fn(() => true);
    (globalThis as any).document = fakeDocument;
    context.elements.modal.classList.add('bw-bs-panel--open');
    context.attachEventListeners();

    const preventForward = jest.fn();
    fakeDocument.activeElement = nextButton;
    keyboardHandlerHolder.handler({
      key: 'Tab',
      shiftKey: false,
      target: nextButton,
      preventDefault: preventForward,
    });

    expect(preventForward).toHaveBeenCalledTimes(1);
    expect(closeButton.focus).toHaveBeenCalledTimes(1);

    const preventReverse = jest.fn();
    fakeDocument.activeElement = closeButton;
    keyboardHandlerHolder.handler({
      key: 'Tab',
      shiftKey: true,
      target: closeButton,
      preventDefault: preventReverse,
    });

    expect(preventReverse).toHaveBeenCalledTimes(1);
    expect(nextButton.focus).toHaveBeenCalledTimes(1);
  });

  it('leaves Tab handling to a nested drawer when the picker is not topmost', () => {
    const { context, nextButton, keyboardHandlerHolder, fakeDocument } = createContext();
    context._isPpbPickerDrawerTopmost = jest.fn(() => false);
    (globalThis as any).document = fakeDocument;
    context.elements.modal.classList.add('bw-bs-panel--open');
    context.attachEventListeners();

    const preventDefault = jest.fn();
    fakeDocument.activeElement = nextButton;
    keyboardHandlerHolder.handler({
      key: 'Tab',
      shiftKey: false,
      target: nextButton,
      preventDefault,
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('resolves modal discount messaging through locale-aware TemplateManager templates', async () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const footerDiscountText = runtimeDocument.createElement('div');
    const discountSection = {
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    };

    const { context, fakeDocument } = createContext({
      closeButton: null as any,
      prevButton: null as any,
      nextButton: null as any,
    } as any);
    (globalThis as any).document = runtimeDocument;
    (globalThis as any).window = {
      ...(globalThis as any).window,
      Shopify: {
        ...(globalThis as any).window.Shopify,
        locale: 'fr',
      },
    };

    const customModal = createModal({
      closeButton: context.elements.modal.querySelector('.close-button') || createFocusableButton('close'),
      prevButton: context.elements.modal.querySelector('.prev-button') || createFocusableButton('prev'),
      nextButton: context.elements.modal.querySelector('.next-button') || createFocusableButton('next'),
      footerDiscountText,
      discountSection,
    });

    context.elements.modal = customModal;
    context.selectedBundle = {
      messaging: {
        displayOptions: {
          progressBar: {
            progressText: 'Add {conditionText} more',
            successText: 'You got {discountText}',
          },
        },
        progressTemplate: 'Add {conditionText} more',
        successTemplate: 'You got {discountText}',
      },
      pricing: {
        enabled: true,
        method: 'percentage_off',
        rules: [{
          id: 'rule-1',
          conditionType: 'quantity',
          conditionOperator: 'greater_than_or_equal_to',
          conditionValue: 2,
          discountValue: 10,
        }],
        messages: {
          ruleMessagesByLocale: {
            fr: {
              'rule-1': {
                discountText: 'Ajouter {conditionText}',
                successMessage: 'Bravo, gagné {discountText}',
              },
            },
          },
          ruleMessages: {
            'rule-1': {
              discountText: 'English {conditionText}',
              successMessage: 'English success {discountText}',
            },
          },
        },
      },
    } as any;
    context.config = { showDiscountMessaging: true };
    context.selectedProducts = [{ v: 1 }];
    context.stepProductData = [[{ variantId: 'v', price: 500 }]];

    context.updateModalDiscountMessaging(
      500,
      1,
      { qualifiesForDiscount: false, discountAmount: 0, finalPrice: 500, applicableRule: null },
      {
        currency: {},
        calculation: {},
        display: { format: '$ {{amount}}', code: 'USD', symbol: '$', rate: 1 },
      },
    );

    expect(footerDiscountText.textContent).toMatch(/Ajouter/);
    expect(footerDiscountText.querySelector('span')).not.toBeNull();
    expect(discountSection.classList.remove).toHaveBeenCalled();
  });
});
