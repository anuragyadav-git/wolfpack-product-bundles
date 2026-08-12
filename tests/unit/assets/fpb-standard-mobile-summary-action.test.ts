export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageMobileSummaryMethods } = require('../../../app/assets/widgets/full-page/methods/mobile-summary-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PricingCalculator } = require('../../../app/assets/widgets/shared/pricing-calculator.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ToastManager } = require('../../../app/assets/widgets/shared/toast-manager.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  shouldUseFluidMobileSummaryFooter,
  shouldUseMobileSummarySlotTiles,
  getMobileAdditionalOffersStatus,
  shouldDismissMobileSummarySwipe,
} = require('../../../app/assets/widgets/full-page/methods/mobile-summary-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { shouldUseSharedDesktopSummarySlotTiles } = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { shouldCategoryTabActivateProducts } = require('../../../app/assets/widgets/full-page/methods/product-grid-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fullPageProductProcessingMethods,
  filterFullPageProductsByInvalidDefaultVariants,
  normalizeFullPageDirectDefaultProduct,
  reconcileFullPageDirectDefaultProducts,
} = require('../../../app/assets/widgets/full-page/methods/product-processing-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  shouldAutoAdvanceFullPageStep,
  getFullPageStepConditionValidationMessage,
} = require('../../../app/assets/widgets/full-page/methods/selection-navigation-methods.js');

class FakeElement {
  tagName = '';
  className = '';
  disabled = false;
  innerHTML = '';
  attributes: Record<string, string> = {};
  private ownText = '';
  private children: FakeElement[] = [];
  private listeners: Record<string, Array<(event?: { preventDefault?: () => void; key?: string }) => void | Promise<void>>> = {};

  get childElementCount() {
    return this.children.length;
  }

  get classList() {
    return {
      add: (...classNames: string[]) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        classNames.forEach((className) => classes.add(className));
        this.className = Array.from(classes).join(' ');
      },
      remove: (...classNames: string[]) => {
        const removeSet = new Set(classNames);
        this.className = this.className
          .split(/\s+/)
          .filter((className) => className && !removeSet.has(className))
          .join(' ');
      },
      toggle: (className: string, force?: boolean) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        const shouldHaveClass = force ?? !classes.has(className);
        if (shouldHaveClass) {
          classes.add(className);
        } else {
          classes.delete(className);
        }
        this.className = Array.from(classes).join(' ');
      },
      contains: (className: string) => this.className.split(/\s+/).includes(className),
    };
  }

  get textContent() {
    return [this.ownText, ...this.children.map((child) => child.textContent)].join('');
  }

  set textContent(value: string) {
    this.ownText = value;
  }

  append(...children: FakeElement[]) {
    this.children.push(...children);
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  getChildren() {
    return this.children;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  addEventListener(type: string, listener: (event?: { preventDefault?: () => void; key?: string }) => void | Promise<void>) {
    this.listeners[type] ||= [];
    this.listeners[type].push(listener);
  }

  async click() {
    for (const listener of this.listeners.click || []) {
      await listener({});
    }
  }
}

function locateFakeElementByClass(root: FakeElement, className: string): FakeElement | null {
  if (root.classList.contains(className)) return root;
  for (const child of root.getChildren()) {
    const match = locateFakeElementByClass(child, className);
    if (match) return match;
  }
  return null;
}

function locateInteractiveElements(root: FakeElement): FakeElement[] {
  const matches = root.tagName === 'BUTTON' || root.attributes.role === 'button'
    ? [root]
    : [];
  return [
    ...matches,
    ...root.getChildren().flatMap((child) => locateInteractiveElements(child)),
  ];
}

const originalDocument = global.document;

beforeEach(() => {
  const shopMoneyFormat = ['$', '{{amount}}'].join('');
  (global as any).window = {
    Shopify: {
      currency: {
        active: 'USD',
        format: shopMoneyFormat,
      },
    },
    shopMoneyFormat,
  };
  global.document = {
    createElement: (tagName: string) => {
      const element = new FakeElement();
      element.tagName = tagName.toUpperCase();
      return element;
    },
  } as unknown as Document;
});

afterAll(() => {
  global.document = originalDocument;
});

function createContext() {
  return {
    freeGiftStepIndex: -1,
    _resolveText: (key: string, fallback: string) => {
      if (key === 'addToCartButton') return 'Add To Cart';
      if (key === 'nextButton') return 'Next';
      return fallback;
    },
    canCheckoutWithBoxSelection: () => true,
    canNavigateToStep: () => false,
    canProceedToNextStep: () => false,
    areBundleConditionsMet: () => false,
    getFullPageDesignPreset: () => 'STANDARD',
    getStepConditionValidationMessage: () => 'Add exactly 2 products on this step',
    addBundleToCart: jest.fn(),
    showBoxSelectionValidationMessage: jest.fn(),
    _emitStorefrontEvent: jest.fn(),
    _withWidgetActionBusy: jest.fn(),
    renderFullPageLayout: jest.fn(),
    _renderCompactMobileSummaryBundleItems: () => new FakeElement(),
  };
}

const currencyInfo = {
  calculation: { code: 'USD', symbol: '$', format: ['$', '{{amount}}'].join('') },
  display: { code: 'USD', symbol: '$', format: ['$', '{{amount}}'].join(''), rate: 1 },
  isMultiCurrency: false,
};

describe('FPB Standard mobile summary action', () => {
  it('renders merchant-authored step page titles as the content subtitle', () => {
    const context = {
      ...createContext(),
      selectedBundle: {
        steps: [{ pageTitle: 'Choose your product' }, { pageTitle: 'Next step' }],
      },
      getCurrentStepContentText: fullPageMobileSummaryMethods.getCurrentStepContentText,
      shouldRenderFullPageStepChrome: () => true,
    };

    const header = fullPageMobileSummaryMethods.createStepContentHeader.call(context, 0);

    expect(header?.textContent).toBe('Choose your product');
  });

  it('suppresses accidental Chrome async debug text from the content subtitle', () => {
    const context = {
      ...createContext(),
      selectedBundle: {
        steps: [{ pageTitle: 'Chrome async text' }, { pageTitle: 'Next step' }],
      },
      getCurrentStepContentText: fullPageMobileSummaryMethods.getCurrentStepContentText,
      shouldRenderFullPageStepChrome: () => true,
    };

    expect(fullPageMobileSummaryMethods.getCurrentStepContentText.call(context, 0)).toEqual({
      subtext: '',
    });
    expect(fullPageMobileSummaryMethods.createStepContentHeader.call(context, 0)).toBeNull();
  });

  it('suppresses timestamped Chrome async debug text from the content subtitle', () => {
    const context = {
      ...createContext(),
      selectedBundle: {
        steps: [{ pageTitle: 'Chrome async 08:17:02' }, { pageTitle: 'Next step' }],
      },
      getCurrentStepContentText: fullPageMobileSummaryMethods.getCurrentStepContentText,
      shouldRenderFullPageStepChrome: () => true,
    };

    expect(fullPageMobileSummaryMethods.getCurrentStepContentText.call(context, 0)).toEqual({
      subtext: '',
    });
    expect(fullPageMobileSummaryMethods.createStepContentHeader.call(context, 0)).toBeNull();
  });

  it('does not force compact mobile summary progress when discount progress is disabled', () => {
    const sheet = new FakeElement();
    const renderProgress = jest.fn(() => new FakeElement());
    const context = {
      ...createContext(),
      selectedProducts: [{}],
      stepProductData: [[]],
      selectedBundle: {
        bundleDesignPresetId: 'CLASSIC',
        steps: [{ id: 'step-1', enabled: true }],
        pricing: {
          enabled: true,
          method: 'fixed_amount',
          rules: [
            {
              id: 'rule-1',
              conditionType: 'quantity',
              conditionOperator: 'gte',
              conditionValue: 2,
              discountValue: 5,
            },
          ],
        },
      },
      config: {
        showDiscountMessaging: false,
        showDiscountProgressBar: false,
        discountTextTemplate: 'Add {{conditionText}} to save {{discountText}}',
      },
      compactMobileSummaryTrayExpanded: false,
      currentStepIndex: 0,
      getDiscountInfoWithSelectedAddonDiscount: (discountInfo: unknown) => discountInfo,
      getAllSelectedProductsData: () => [],
      _shouldRenderProductSlots: () => false,
      _syncCompactMobileSummaryScrollLock: jest.fn(),
      _renderDiscountProgress: renderProgress,
      _createMobileSummaryActionButton: fullPageMobileSummaryMethods._createMobileSummaryActionButton,
      bundleHasNoConditions: () => false,
    };

    fullPageMobileSummaryMethods._populateCompactMobileSummaryTray.call(context, sheet);

    expect(renderProgress).not.toHaveBeenCalled();
  });

  it('uses the qualified Classic fixed bundle price in compact mobile action display', () => {
    const sheet = new FakeElement();
    const context = {
      ...createContext(),
      selectedProducts: [{}, {}],
      stepProductData: [[]],
      selectedBundle: {
        bundleDesignPresetId: 'CLASSIC',
        steps: [{ id: 'step-1', enabled: true }],
        pricing: {
          enabled: true,
          method: 'fixed_bundle_price',
          rules: [
            {
              id: 'rule-1',
              conditionType: 'quantity',
              conditionOperator: 'gte',
              conditionValue: 2,
              discountValue: 5,
              method: 'fixed_bundle_price',
            },
          ],
        },
      },
      config: {
        showDiscountMessaging: false,
        showDiscountProgressBar: false,
      },
      compactMobileSummaryTrayExpanded: false,
      currentStepIndex: 0,
      getDiscountInfoWithSelectedAddonDiscount: (discountInfo: unknown) => discountInfo,
      getAllSelectedProductsData: () => [{}, {}],
      _shouldRenderProductSlots: () => false,
      _syncCompactMobileSummaryScrollLock: jest.fn(),
      _renderDiscountProgress: jest.fn(),
      _createMobileSummaryActionButton: fullPageMobileSummaryMethods._createMobileSummaryActionButton,
      bundleHasNoConditions: () => false,
      getFullPageDesignPreset: () => 'CLASSIC',
    };
    const totalSpy = jest.spyOn(PricingCalculator, 'calculateBundleTotal').mockReturnValue({
      totalPrice: 144800,
      totalQuantity: 2,
      unitPrices: [82900, 61900],
    });
    const discountSpy = jest.spyOn(PricingCalculator, 'calculateDiscount').mockReturnValue({
      hasDiscount: true,
      finalPrice: 500,
      discountAmount: 144300,
      applicableRule: { method: 'fixed_bundle_price' },
    });

    try {
      fullPageMobileSummaryMethods._populateCompactMobileSummaryTray.call(context, sheet);
    } finally {
      totalSpy.mockRestore();
      discountSpy.mockRestore();
    }

    expect(sheet.textContent).toContain('Add To Cart');
    expect(sheet.textContent).toContain('$5.00');
  });

  it('renders qualified BOGO success copy when pricing qualifies without hasDiscount', () => {
    const sheet = new FakeElement();
    const context = {
      ...createContext(),
      selectedProducts: [{}, {}, {}],
      stepProductData: [[]],
      selectedBundle: {
        bundleDesignPresetId: 'HORIZONTAL',
        steps: [{ id: 'step-1', enabled: true }],
        pricing: {
          enabled: true,
          method: 'buy_x_get_y',
          rules: [{
            id: 'rule-1',
            conditionType: 'quantity',
            conditionOperator: 'gte',
            conditionValue: 3,
            discountValue: 100,
          }],
          messages: {
            ruleMessages: {
              'rule-1': {
                successMessage: 'Success! You got 1 product(s) at 100% off',
              },
            },
          },
        },
      },
      config: {
        showDiscountMessaging: true,
        showDiscountProgressBar: false,
      },
      compactMobileSummaryTrayExpanded: false,
      currentStepIndex: 0,
      getDiscountInfoWithSelectedAddonDiscount: (discountInfo: unknown) => discountInfo,
      getAllSelectedProductsData: () => [{}, {}, {}],
      _shouldRenderProductSlots: () => false,
      _syncCompactMobileSummaryScrollLock: jest.fn(),
      _renderDiscountProgress: jest.fn(),
      _createMobileSummaryActionButton: fullPageMobileSummaryMethods._createMobileSummaryActionButton,
      bundleHasNoConditions: () => false,
      getFullPageDesignPreset: () => 'HORIZONTAL',
    };
    const totalSpy = jest.spyOn(PricingCalculator, 'calculateBundleTotal').mockReturnValue({
      totalPrice: 177700,
      totalQuantity: 3,
      unitPrices: [82900, 61900, 32900],
    });
    const discountSpy = jest.spyOn(PricingCalculator, 'calculateDiscount').mockReturnValue({
      hasDiscount: false,
      finalPrice: 144800,
      discountAmount: 32900,
      discountPercentage: 19,
      qualifiesForDiscount: true,
      applicableRule: context.selectedBundle.pricing.rules[0],
    });

    try {
      fullPageMobileSummaryMethods._populateCompactMobileSummaryTray.call(context, sheet);
    } finally {
      totalSpy.mockRestore();
      discountSpy.mockRestore();
    }

    expect(locateFakeElementByClass(sheet, 'fpb-mobile-summary-discount-text')?.innerHTML)
      .toContain('Success! You got 1 product(s) at 100% off');
  });

  it('keeps the final-step action as add to cart even when conditions are not complete', () => {
    const button = fullPageMobileSummaryMethods._createMobileSummaryActionButton.call(
      createContext(),
      {
        finalPrice: 829,
        currencyInfo,
        conditionlessMobile: false,
        hasSelectionMobile: false,
        isLastStep: true,
        isComplete: false,
      },
    );

    expect(button.textContent?.includes('Add To Cart')).toBe(true);
    expect(button.textContent?.includes('Next')).toBe(false);
    expect(button.disabled).toBe(true);
  });

  it('keeps Classic final-step underfilled add-to-cart clickable and validates on press', async () => {
    const toastSpy = jest.spyOn(ToastManager, 'show').mockImplementation(() => {});
    const context = {
      ...createContext(),
      getFullPageDesignPreset: () => 'CLASSIC',
      areBundleConditionsMet: jest.fn(() => false),
      getStepConditionValidationMessage: jest.fn(() => 'Add exactly 2 products on this step'),
    };

    const button = fullPageMobileSummaryMethods._createMobileSummaryActionButton.call(
      context,
      {
        finalPrice: 829,
        currencyInfo,
        conditionlessMobile: false,
        hasSelectionMobile: false,
        isLastStep: true,
        isComplete: false,
      },
    );

    expect(button.textContent?.includes('Add To Cart')).toBe(true);
    expect(button.disabled).toBe(false);

    await button.click();

    expect(context.areBundleConditionsMet).toHaveBeenCalledTimes(1);
    expect(context.getStepConditionValidationMessage).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith('Add exactly 2 products on this step');
    expect(context.addBundleToCart).not.toHaveBeenCalled();

    toastSpy.mockRestore();
  });

  it('uses next for non-final steps without an add-on step', () => {
    const button = fullPageMobileSummaryMethods._createMobileSummaryActionButton.call(
      createContext(),
      {
        finalPrice: 0,
        currencyInfo,
        conditionlessMobile: false,
        hasSelectionMobile: false,
        isLastStep: false,
        isComplete: false,
      },
    );

    expect(button.textContent?.includes('Next')).toBe(true);
    expect(button.textContent?.includes('Add To Cart')).toBe(false);
  });

  it('advances the compact summary one step at a time before an add-on step', async () => {
    const context = {
      ...createContext(),
      currentStepIndex: 0,
      freeGiftStepIndex: 2,
      canNavigateToStep: jest.fn((stepIndex: number) => stepIndex === 1),
      canProceedToNextStep: jest.fn(() => true),
      _withWidgetActionBusy: jest.fn(async (callback: () => Promise<void>) => {
        await callback();
      }),
    };

    const button = fullPageMobileSummaryMethods._createMobileSummaryActionButton.call(
      context,
      {
        finalPrice: 829,
        currencyInfo,
        conditionlessMobile: false,
        hasSelectionMobile: false,
        isLastStep: false,
        isComplete: false,
      },
    );

    await button.click();

    expect(context.canNavigateToStep).toHaveBeenCalledWith(1);
    expect(context.currentStepIndex).toBe(1);
    expect(context._emitStorefrontEvent).toHaveBeenCalledWith('step-changed', {
      previousStepIndex: 0,
      currentStepIndex: 1,
      direction: 'next',
    });
    expect(context.renderFullPageLayout).toHaveBeenCalledTimes(1);
  });

  it('allows the compact mobile summary tray to expand with no selected products', () => {
    const classList = { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() };
    const countBadge = {
      setAttribute: jest.fn(),
      focus: jest.fn(),
    };
    const dialogPanel = { focus: jest.fn() };
    const dialog = {
      open: false,
      showModal: jest.fn(function showModal(this: { open: boolean }) { this.open = true; }),
      close: jest.fn(function close(this: { open: boolean }) { this.open = false; }),
      querySelector: jest.fn((selector: string) => (
        selector === '.fpb-mobile-summary-dialog-panel' ? dialogPanel : null
      )),
    };
    const tray = {
      classList,
      querySelector: jest.fn((selector: string) => {
        if (selector === '.fpb-mobile-summary-count-badge') return countBadge;
        if (selector === '.fpb-mobile-summary-dialog') return dialog;
        return null;
      }),
    };
    const context = {
      compactMobileSummaryTrayExpanded: false,
    };
    const bodyClassList = { add: jest.fn(), remove: jest.fn() };
    global.document = { body: { classList: bodyClassList } } as unknown as Document;

    fullPageMobileSummaryMethods._toggleCompactMobileSummaryTray.call(
      context,
      tray,
    );

    expect(context.compactMobileSummaryTrayExpanded).toBe(true);
    expect(countBadge.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
    expect(dialog.showModal).toHaveBeenCalledTimes(1);
    expect(bodyClassList.add).toHaveBeenCalledWith('fpb-mobile-summary-scroll-locked');
    expect(dialogPanel.focus).toHaveBeenCalledTimes(1);

    fullPageMobileSummaryMethods._toggleCompactMobileSummaryTray.call(
      context,
      tray,
    );

    expect(context.compactMobileSummaryTrayExpanded).toBe(false);
    expect(countBadge.setAttribute).toHaveBeenLastCalledWith('aria-expanded', 'false');
    expect(dialog.close).toHaveBeenCalledTimes(1);
    expect(bodyClassList.remove).toHaveBeenCalledWith('fpb-mobile-summary-scroll-locked');
    expect(countBadge.focus).toHaveBeenCalledTimes(1);
  });

  it('keeps collapsed compact-summary details out of the accessibility tree', () => {
    const bundleItems = {
      inert: false,
      removeAttribute: jest.fn(),
      setAttribute: jest.fn(),
    };
    const sheet = {
      querySelector: jest.fn(() => bundleItems),
    };

    fullPageMobileSummaryMethods._syncCompactMobileSummaryDisclosureState.call(
      {},
      sheet,
      false,
    );

    expect(bundleItems.inert).toBe(true);
    expect(bundleItems.setAttribute).toHaveBeenCalledWith('aria-hidden', 'true');

    fullPageMobileSummaryMethods._syncCompactMobileSummaryDisclosureState.call(
      {},
      sheet,
      true,
    );

    expect(bundleItems.inert).toBe(false);
    expect(bundleItems.removeAttribute).toHaveBeenCalledWith('aria-hidden');
  });

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'uses the shared fluid mobile summary footer for %s',
    (preset) => {
      expect(shouldUseFluidMobileSummaryFooter(preset)).toBe(true);
    },
  );

  it('renders one Classic compact-summary toggle using the shared interaction path', async () => {
    const sheet = new FakeElement();
    const toggleTray = jest.fn();
    const context = {
      ...createContext(),
      selectedProducts: [],
      stepProductData: [[]],
      selectedBundle: {
        bundleDesignPresetId: 'CLASSIC',
        steps: [{ id: 'step-1', enabled: true }],
        pricing: { enabled: false },
      },
      config: {},
      compactMobileSummaryTrayExpanded: false,
      currentStepIndex: 0,
      getDiscountInfoWithSelectedAddonDiscount: (discountInfo: unknown) => discountInfo,
      getAllSelectedProductsData: () => [],
      _shouldRenderProductSlots: () => false,
      _syncCompactMobileSummaryScrollLock: jest.fn(),
      _renderDiscountProgress: jest.fn(),
      _createMobileSummaryActionButton: fullPageMobileSummaryMethods._createMobileSummaryActionButton,
      _toggleCompactMobileSummaryTray: toggleTray,
      bundleHasNoConditions: () => false,
      getFullPageDesignPreset: () => 'CLASSIC',
    };

    fullPageMobileSummaryMethods._populateCompactMobileSummaryTray.call(context, sheet);
    const summaryToggles = locateInteractiveElements(sheet)
      .filter((element) => element.attributes['aria-expanded'] !== undefined);
    await summaryToggles[0].click();

    expect(summaryToggles).toHaveLength(1);
    expect(summaryToggles[0].tagName).toBe('BUTTON');
    expect(toggleTray).toHaveBeenCalledWith(sheet);
  });

  it('returns a stable mobile additional-offers status for mixed eligible tiers', () => {
    const paidStep = { id: 'paid-step' };
    const addonStep = { id: 'addon-step', isFreeGift: true };
    const mixedState = getMobileAdditionalOffersStatus({
      designPreset: 'CLASSIC',
      currentStepIndex: 0,
      steps: [paidStep, addonStep],
      addonStates: [
        { tier: { tierId: 'tier-1' }, isEligible: true },
        { tier: { tierId: 'tier-2' }, isEligible: false },
      ],
    });

    expect(mixedState.visible).toBe(true);
    expect(mixedState.message).toBe('Additional offers to be unlocked');

    expect(getMobileAdditionalOffersStatus({
      designPreset: 'STANDARD',
      currentStepIndex: 0,
      steps: [paidStep, addonStep],
      addonStates: [
        { tier: { tierId: 'tier-1' }, isEligible: true },
        { tier: { tierId: 'tier-2' }, isEligible: false },
      ],
    }).visible).toBe(true);

    expect(getMobileAdditionalOffersStatus({
      designPreset: 'CLASSIC',
      currentStepIndex: 0,
      steps: [paidStep, addonStep],
      addonStates: [
        { tier: { tierId: 'tier-1' }, isEligible: true },
        { tier: { tierId: 'tier-2' }, isEligible: true },
      ],
    }).visible).toBe(false);

    expect(getMobileAdditionalOffersStatus({
      designPreset: 'CLASSIC',
      currentStepIndex: 1,
      steps: [paidStep, addonStep],
      addonStates: [
        { tier: { tierId: 'tier-1' }, isEligible: true },
        { tier: { tierId: 'tier-2' }, isEligible: false },
      ],
    }).visible).toBe(false);

    expect(getMobileAdditionalOffersStatus({
      designPreset: 'COMPACT',
      currentStepIndex: 0,
      steps: [paidStep, addonStep],
      addonStates: [
        { tier: { tierId: 'tier-1' }, isEligible: true },
        { tier: { tierId: 'tier-2' }, isEligible: false },
      ],
    }).visible).toBe(false);
  });

  it('dismisses the mobile summary only for an intentional downward swipe', () => {
    expect(shouldDismissMobileSummarySwipe({ distanceY: 110, distanceX: 8, velocityY: 0.2 })).toBe(true);
    expect(shouldDismissMobileSummarySwipe({ distanceY: 42, distanceX: 4, velocityY: 0.7 })).toBe(true);
    expect(shouldDismissMobileSummarySwipe({ distanceY: 60, distanceX: 8, velocityY: 0.2 })).toBe(false);
    expect(shouldDismissMobileSummarySwipe({ distanceY: 110, distanceX: 140, velocityY: 0.8 })).toBe(false);
    expect(shouldDismissMobileSummarySwipe({ distanceY: -120, distanceX: 0, velocityY: -0.8 })).toBe(false);
  });

  it('uses slot tiles for every slot-enabled FPB summary preset', () => {
    expect(shouldUseMobileSummarySlotTiles({
      designPreset: 'CLASSIC',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseMobileSummarySlotTiles({
      designPreset: 'STANDARD',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseMobileSummarySlotTiles({
      designPreset: 'COMPACT',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseMobileSummarySlotTiles({
      designPreset: 'HORIZONTAL',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseMobileSummarySlotTiles({
      designPreset: 'CLASSIC',
      productSlotsEnabled: false,
    })).toBe(false);

    expect(shouldUseSharedDesktopSummarySlotTiles({
      designPreset: 'COMPACT',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseSharedDesktopSummarySlotTiles({
      designPreset: 'HORIZONTAL',
      productSlotsEnabled: true,
    })).toBe(true);

    expect(shouldUseFluidMobileSummaryFooter('COMPACT')).toBe(true);
    expect(shouldUseFluidMobileSummaryFooter('HORIZONTAL')).toBe(true);
    expect(shouldUseFluidMobileSummaryFooter('STANDARD')).toBe(true);
    expect(shouldUseFluidMobileSummaryFooter('CLASSIC')).toBe(true);

    expect(shouldUseSharedDesktopSummarySlotTiles({
      designPreset: 'CLASSIC',
      productSlotsEnabled: true,
    })).toBe(false);
  });

  it('keeps Classic mobile slot tiles free of per-slot remove controls', () => {
    const container = new FakeElement();
    const context = {
      getFullPageDesignPreset: () => 'CLASSIC',
      getSummaryProductDisplayTitle: () => 'Selected product',
      _getSelectedProductImageSrc: () => 'https://cdn.example.test/product.jpg',
      _escapeHTML: (value: string) => value,
      selectedBundle: {},
    };

    fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles.call(
      context,
      container,
      [{ quantity: 1 }],
      { minQuantity: 1 },
      1,
    );

    expect(container.getChildren()[0].getChildren()).toHaveLength(0);
  });

  it('uses the normal category-switching path for Standard mobile tabs', () => {
    expect(shouldCategoryTabActivateProducts({
      designPreset: 'STANDARD',
      viewportWidth: 390,
      hasCategoryEntries: true,
    })).toBe(true);
  });

  it('keeps desktop and non-Standard category tabs on the normal switching path', () => {
    expect(shouldCategoryTabActivateProducts({
      designPreset: 'STANDARD',
      viewportWidth: 1280,
      hasCategoryEntries: true,
    })).toBe(true);

    expect(shouldCategoryTabActivateProducts({
      designPreset: 'COMPACT',
      viewportWidth: 390,
      hasCategoryEntries: true,
    })).toBe(true);
  });

  it('normalizes direct default products for full-page first-load selection', () => {
    const product = normalizeFullPageDirectDefaultProduct({
      title: '14k Dangling Obsidian Earrings',
      handle: '14k-dangling-obsidian-earrings',
      images: [{ originalSrc: 'https://cdn.shopify.com/default.jpg' }],
      graphqlId: 'gid://shopify/Product/9506413773059',
      requiredQuantity: 1,
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091075',
        price: '829.00',
        inventoryQuantity: 0,
      }],
    });

    expect(product).toEqual(expect.objectContaining({
      id: '9506413773059',
      title: '14k Dangling Obsidian Earrings',
      variantId: '48720141091075',
      price: 82900,
      available: true,
      quantityAvailable: 0,
      defaultRequiredQuantity: 1,
    }));
  });

  it('preserves missing direct default inventory as unbounded for full-page first-load selection', () => {
    const product = normalizeFullPageDirectDefaultProduct({
      title: 'Inventory Unknown Earrings',
      graphqlId: 'gid://shopify/Product/9506413773059',
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091075',
        price: '829.00',
      }],
    });

    expect(product).toEqual(expect.objectContaining({
      variantId: '48720141091075',
      available: true,
      quantityAvailable: null,
    }));
  });

  it('drops direct defaults that are absent from Storefront API hydration', () => {
    const directDefault = normalizeFullPageDirectDefaultProduct({
      title: 'Draft Earrings',
      graphqlId: 'gid://shopify/Product/9506413773059',
      requiredQuantity: 1,
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091075',
        price: '829.00',
      }],
    });

    expect(reconcileFullPageDirectDefaultProducts([directDefault], [{
      id: '9506413773060',
      selectionId: '48720141091076',
      variantId: '48720141091076',
      title: 'Published Earrings',
      available: true,
    }])).toEqual([]);
  });

  it('removes stale direct-default cards from cached step products', () => {
    expect(filterFullPageProductsByInvalidDefaultVariants([{
      selectionId: 'gid://shopify/Product/9506413773059',
      title: 'Draft Earrings',
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091075',
      }],
    }, {
      selectionId: 'gid://shopify/Product/9506413773060',
      title: 'Published Earrings',
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091076',
      }],
    }], new Set(['48720141091075']))).toEqual([{
      selectionId: 'gid://shopify/Product/9506413773060',
      title: 'Published Earrings',
      variants: [{
        variantGraphqlId: 'gid://shopify/ProductVariant/48720141091076',
      }],
    }]);
  });

  it('preserves direct default metadata on matching grid products', () => {
    const directDefault = {
      variantId: '48720141091075',
      selectionId: '48720141091075',
      defaultRequiredQuantity: 1,
      isDirectDefaultProduct: true,
    };
    const context = {
      directDefaultProducts: [directDefault],
    };

    const products = fullPageProductProcessingMethods._mergeDirectDefaultProductsIntoStep.call(
      context,
      0,
      [{
        id: '9506413773059',
        variantId: '48720141091075',
        selectionId: '48720141091075',
        title: '14k Dangling Obsidian Earrings',
      }],
    );

    expect(products).toEqual([
      expect.objectContaining({
        title: '14k Dangling Obsidian Earrings',
        variantId: '48720141091075',
        isDirectDefaultProduct: true,
        defaultRequiredQuantity: 1,
      }),
    ]);
  });

  it('auto-advances when a step rule opts into auto-next and the quantity is positive', () => {
    expect(shouldAutoAdvanceFullPageStep({
      quantity: 1,
      step: {
        autoNextStepOnConditionMet: true,
        conditionType: 'quantity',
        conditionOperator: 'equal_to',
        conditionValue: 2,
      },
    })).toBe(true);
  });

  it('formats exact step-rule validation like EB', () => {
    expect(getFullPageStepConditionValidationMessage({
      conditionType: 'quantity',
      conditionOperator: 'equal_to',
      conditionValue: 2,
    })).toBe('Add exactly 2 products on this step');
  });
});
