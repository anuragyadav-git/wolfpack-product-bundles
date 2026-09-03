export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  createSummaryClearButton,
  fullPageSidePanelMethods,
  shouldUseSharedDesktopSummaryRows,
} = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageMobileSummaryMethods } = require('../../../app/assets/widgets/full-page/methods/mobile-summary-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageTierFloatingRuntimeMethods } = require('../../../app/assets/widgets/full-page/methods/tier-floating-runtime-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PricingCalculator } = require('../../../app/assets/widgets/shared/pricing-calculator.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ToastManager } = require('../../../app/assets/widgets/shared/toast-manager.js');

class FakeElement {
  tagName: string;
  className = '';
  textContent = '';
  innerHTML = '';
  children: FakeElement[] = [];
  dataset: Record<string, string> = {};
  style = { setProperty: jest.fn(), removeProperty: jest.fn() };
  attributes: Record<string, string> = {};
  width = 0;
  listeners: Record<string, Array<() => unknown>> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get classList() {
    return {
      contains: (className: string) => this.className.split(/\s+/).includes(className),
      add: (className: string) => {
        if (!this.className.split(/\s+/).includes(className)) {
          this.className = [this.className, className].filter(Boolean).join(' ');
        }
      },
      toggle: (className: string, force?: boolean) => {
        const classes = this.className.split(/\s+/).filter(Boolean);
        const hasClass = classes.includes(className);
        const shouldHaveClass = force ?? !hasClass;
        this.className = shouldHaveClass
          ? Array.from(new Set([...classes, className])).join(' ')
          : classes.filter((item) => item !== className).join(' ');
      },
    };
  }

  appendChild(child: FakeElement) {
    if (child.tagName === '#FRAGMENT') {
      child.children.forEach((fragmentChild) => this.appendChild(fragmentChild));
      return child;
    }
    this.children.push(child);
    return child;
  }

  append(...children: FakeElement[]) {
    children.forEach((child) => this.appendChild(child));
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [];
    this.textContent = '';
    this.append(...children);
  }

  addEventListener(eventName: string, handler: () => unknown) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(handler);
  }

  async click() {
    const handlers = this.listeners.click || [];
    for (const handler of handlers) {
      await handler();
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  getAttribute(name: string) {
    return this.attributes[name] ?? null;
  }

  getBoundingClientRect() {
    return { width: this.width };
  }

  querySelector(selector: string): FakeElement | null {
    const attributeMatch = selector.match(/^\[([^=]+)="([^"]+)"\]$/);
    const selectorClasses = selector.startsWith('.')
      ? selector.split('.').filter(Boolean).map((part) => part.trim()).filter(Boolean)
      : [];
    const matches = attributeMatch
      ? this.getAttribute(attributeMatch[1]) === attributeMatch[2]
      : selectorClasses.length > 0
        && selectorClasses.every((className) => this.className.split(/\s+/).includes(className));
    if (matches) return this;

    for (const child of this.children) {
      const match = child.querySelector(selector);
      if (match) return match;
    }

    return null;
  }
}

function collectButtons(root: FakeElement): FakeElement[] {
  const buttons: FakeElement[] = [];
  if (root.tagName === 'BUTTON') buttons.push(root);
  for (const child of root.children) {
    buttons.push(...collectButtons(child));
  }
  return buttons;
}

function collectText(root: any): string {
  if (!root) return '';
  return String(root.textContent || '') + Array.from<any>(root.children || []).map(child => collectText(child)).join('');
}

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
  (global as any).document = {
    createElement: (tagName: string) => new FakeElement(tagName),
    createElementNS: (_namespace: string, tagName: string) => new FakeElement(tagName),
    createTextNode: (value: string) => {
      const node = new FakeElement('#text');
      node.textContent = value;
      return node;
    },
    createDocumentFragment: () => new FakeElement('#fragment'),
  };
});

function makeContext(preset: string, progressType: 'simple' | 'step_based'): any {
  return {
    selectedProducts: [{}],
    stepProductData: [[]],
    selectedBundle: {
      bundleDesignPresetId: preset,
      steps: [{ id: 'step-1', enabled: true }],
      pricing: {
        enabled: true,
        method: 'percentage_off',
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
      showDiscountMessaging: true,
      showDiscountProgressBar: true,
      discountProgressBarType: progressType,
      discountTextTemplate: 'Add {{conditionText}} to get {{discountText}}',
    },
    currentStepIndex: 0,
    _isStandardDesktopSidebar: (panel: FakeElement) => {
      return ['STANDARD', 'CLASSIC'].includes(preset)
        && !panel.classList.contains('fpb-mobile-bottom-sheet');
    },
    getDiscountInfoWithSelectedAddonDiscount: (discountInfo: unknown) => discountInfo,
    getAllSelectedProductsData: () => [],
    getSummaryProductDisplayTitle: () => '',
    getSummaryProductVariantDisplay: () => '',
    createStandardSidebarSelectedRow: () => document.createElement('div'),
    getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
    removeSummarySelectedProduct: () => undefined,
    getBundleSummaryText: () => ({ title: 'Your Bundle', subTitle: 'Review your bundle' }),
    getFullPageDesignPreset: () => preset,
    resolveFullPageLayout: () => 'footer_side',
    createSidebarTierCta: () => null,
    getSelectedBoxSelectionQuantity: () => 0,
    renderBoxSelectionOptions: () => null,
    getSummarySidebarEmptyStateMode: () => 'skeletons',
    getClassicSidebarSlotCount: () => 0,
    renderClassicSidebarSlots: () => document.createElement('div'),
    _renderStandardSidebarEmptySlots: () => undefined,
    _shouldRenderProductSlots: () => false,
    _renderSidebarProductSkeletons: () => undefined,
    _renderFreeGiftSection: () => undefined,
    _formatSidebarDiscountMessage: (message: string) => message,
    createStandardSidebarDiscountProgress: () => {
      const el = document.createElement('div');
      el.className = 'bw-discount-progress bw-discount-progress--standard-sidebar fpb-dp-sidebar';
      return el;
    },
    _renderDiscountProgress: () => {
      const el = document.createElement('div');
      el.className = `fpb-discount-progress fpb-dp-${progressType} fpb-dp-sidebar`;
      return el;
    },
    canProceedToNextStep: () => true,
    bundleHasNoConditions: () => false,
    getSidebarTierCtaContent: () => null,
    _resolveText: (_key: string, fallback: string) => fallback,
    _escapeHTML: (value: string) => value,
    areBundleConditionsMet: () => false,
    canCheckoutWithBoxSelection: () => true,
    showBoxSelectionValidationMessage: () => undefined,
    addBundleToCart: () => undefined,
    canNavigateToStep: () => true,
    renderFullPageLayout: () => undefined,
  };
}

describe('FPB summary sidebar discount progress', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'requests step-based progress rendering in the %s summary sidebar',
    (preset) => {
      const panel = document.createElement('aside') as unknown as FakeElement;
      let renderProgressCount = 0;
      const context = makeContext(preset, 'step_based');
      context._renderDiscountProgress = () => {
        renderProgressCount += 1;
        return document.createElement('div');
      };

      fullPageSidePanelMethods.renderSidePanel.call(context, panel);

      expect(renderProgressCount).toBe(1);
    },
  );

  it('passes the visible Simple Bar fill into the replacement render', () => {
    const panel = document.createElement('aside') as unknown as FakeElement;
    const previousProgress = document.createElement('div') as unknown as FakeElement;
    previousProgress.className = 'fpb-discount-progress fpb-dp-simple';
    const track = document.createElement('div') as unknown as FakeElement;
    track.setAttribute('role', 'progressbar');
    track.width = 200;
    const fill = document.createElement('div') as unknown as FakeElement;
    fill.setAttribute('data-bw-discount-progress-fill', 'true');
    fill.width = 50;
    previousProgress.append(track, fill);
    panel.appendChild(previousProgress);

    const context = makeContext('STANDARD', 'simple');
    const renderProgress = jest.fn(() => document.createElement('div'));
    context._renderDiscountProgress = renderProgress;

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    expect(renderProgress).toHaveBeenCalledWith(expect.objectContaining({
      previousProgressPercent: 25,
    }));
  });

  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'requests simple progress rendering in the %s summary sidebar',
    (preset) => {
      const panel = document.createElement('aside');
      let renderProgressCount = 0;
      const context = makeContext(preset, 'simple');
      context._renderDiscountProgress = () => {
        renderProgressCount += 1;
        return document.createElement('div');
      };

      fullPageSidePanelMethods.renderSidePanel.call(context, panel);

      expect(renderProgressCount).toBe(1);
    },
  );

  it('does not format a sidebar discount message when discount messaging is disabled', () => {
    const panel = document.createElement('aside');
    const context = makeContext('CLASSIC', 'simple');
    context.config.showDiscountMessaging = false;
    context.config.showDiscountProgressBar = false;
    context._formatSidebarDiscountMessage = jest.fn((message: string) => message);

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    expect(context._formatSidebarDiscountMessage).not.toHaveBeenCalled();
  });

  it.each(['STANDARD', 'CLASSIC'])(
    'renders the next locked tier message in the %s sidebar after the first discount tier is reached',
    (preset) => {
      const panel = document.createElement('aside');
      const context = makeContext(preset, 'simple');
      context.config.showDiscountProgressBar = false;
      context.selectedBundle.pricing.rules = [
        {
          id: 'rule-1',
          conditionType: 'quantity',
          conditionOperator: 'gte',
          conditionValue: 1,
          discountValue: 10,
        },
        {
          id: 'rule-6',
          conditionType: 'quantity',
          conditionOperator: 'gte',
          conditionValue: 6,
          discountValue: 20,
        },
      ];
      context.selectedBundle.pricing.messages = {
        ruleMessages: {
          'rule-1': {
            discountText: 'Add {{discountConditionDiff}} product to save {{discountValue}}{{discountValueUnit}}',
            successMessage: 'Rule one reached',
          },
          'rule-6': {
            discountText: 'Add {{discountConditionDiff}} more to save {{discountValue}}{{discountValueUnit}}',
            successMessage: 'Rule six reached',
          },
        },
      };

      const totalSpy = jest.spyOn(PricingCalculator, 'calculateBundleTotal').mockReturnValue({
        totalPrice: 10000,
        totalQuantity: 1,
        unitPrices: [10000],
      });
      const discountSpy = jest.spyOn(PricingCalculator, 'calculateDiscount').mockReturnValue({
        hasDiscount: true,
        finalPrice: 9000,
        discountAmount: 1000,
        discountPercentage: 10,
        qualifiesForDiscount: true,
        applicableRule: context.selectedBundle.pricing.rules[0],
      });

      try {
        fullPageSidePanelMethods.renderSidePanel.call(context, panel);
      } finally {
        totalSpy.mockRestore();
        discountSpy.mockRestore();
      }

      const message = panel.querySelector('.side-panel-discount-message');
      expect(collectText(message)).toContain('Add 5 more to save 20%');
      expect(collectText(message)).not.toContain('Rule one reached');
    },
  );

  it('renders qualified BOGO success copy when pricing qualifies without hasDiscount', () => {
    const panel = document.createElement('aside');
    const context = makeContext('HORIZONTAL', 'step_based');
    context.config.showDiscountProgressBar = false;
    context.selectedBundle.pricing.messages = {
      ruleMessages: {
        'rule-1': {
          successMessage: 'Success! You got 1 product(s) at 100% off',
        },
      },
    };
    const totalSpy = jest.spyOn(PricingCalculator, 'calculateBundleTotal').mockReturnValue({
      totalPrice: 177700,
      totalQuantity: 2,
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
      fullPageSidePanelMethods.renderSidePanel.call(context, panel);
    } finally {
      totalSpy.mockRestore();
      discountSpy.mockRestore();
    }

    expect(collectText(panel.querySelector('.side-panel-discount-message')))
      .toContain('Success! You got 1 product(s) at 100% off');
  });

  it('shows the qualified Classic fixed bundle price in the desktop summary', () => {
    const panel = document.createElement('aside');
    const context = makeContext('CLASSIC', 'simple');
    context.selectedBundle.pricing.method = 'fixed_bundle_price';
    context.selectedBundle.pricing.rules[0].method = 'fixed_bundle_price';
    context.config.showDiscountMessaging = false;
    context.config.showDiscountProgressBar = false;
    context.getAllSelectedProductsData = () => [{}, {}];
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
      fullPageSidePanelMethods.renderSidePanel.call(context, panel);
    } finally {
      totalSpy.mockRestore();
      discountSpy.mockRestore();
    }

    const total = panel.querySelector('.side-panel-total');
    expect(total?.querySelector('.side-panel-total-final')?.textContent).toBe('$5.00');
    expect(total?.querySelector('.side-panel-total-original')?.textContent).toBe('$1448.00');
  });
});

describe('FPB shared desktop summary line items', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'uses shared rows for the %s desktop summary when product slots are disabled',
    (preset) => {
      expect(shouldUseSharedDesktopSummaryRows({
        designPreset: preset,
        isMobileSheet: false,
        productSlotsEnabled: false,
      })).toBe(true);
    },
  );

  it('keeps mobile sheets, product-slot summaries, and unknown presets off the desktop row path', () => {
    expect(shouldUseSharedDesktopSummaryRows({
      designPreset: 'COMPACT',
      isMobileSheet: true,
      productSlotsEnabled: false,
    })).toBe(false);
    expect(shouldUseSharedDesktopSummaryRows({
      designPreset: 'HORIZONTAL',
      isMobileSheet: false,
      productSlotsEnabled: true,
    })).toBe(false);
    expect(shouldUseSharedDesktopSummaryRows({
      designPreset: 'UNKNOWN',
      isMobileSheet: false,
      productSlotsEnabled: false,
    })).toBe(false);
  });
});

describe('FPB configured summary header', () => {
  it('resolves localized bundle copy before store-level copy', () => {
    const context = makeContext('STANDARD', 'simple');
    context.selectedBundle.textOverrides = {
      reviewBundle: 'Translated Review Evidence',
    };
    context.config.textOverrides = {
      reviewBundle: 'Store-level review copy',
    };

    expect(fullPageTierFloatingRuntimeMethods._resolveText.call(
      context,
      'reviewBundle',
      'Review your bundle',
    )).toBe('Translated Review Evidence');
  });

  it('creates one shared clear action for desktop and mobile summaries', async () => {
    const showClearCartConfirmation = jest.fn();
    const desktopButton = createSummaryClearButton(showClearCartConfirmation);
    const mobileButton = createSummaryClearButton(showClearCartConfirmation);

    await desktopButton.click();
    await mobileButton.click();

    expect(desktopButton.innerHTML).toBe(mobileButton.innerHTML);
    expect(showClearCartConfirmation).toHaveBeenCalledTimes(2);
  });

  it('renders the configured summary title in the desktop sidebar', () => {
    const panel = document.createElement('aside') as unknown as FakeElement;
    const context = makeContext('CLASSIC', 'simple');
    context.selectedBundle.name = 'Daily Essentials';
    context.selectedBundle.bundleTextConfig = {
      bundleSummary: {
        title: 'Daily kit',
        subTitle: 'Review your bundle',
      },
    };
    context.getBundleSummaryText = fullPageMobileSummaryMethods.getBundleSummaryText;

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    expect(panel.querySelector('.side-panel-title')?.textContent).toBe('Daily kit');
  });

  it('renders the configured summary title in the mobile footer', () => {
    const context = makeContext('CLASSIC', 'simple');
    context.selectedBundle.name = 'Daily Essentials';
    context.selectedBundle.bundleTextConfig = {
      bundleSummary: {
        title: 'Daily kit',
        subTitle: 'Review your bundle',
      },
    };
    context.getBundleSummaryText = fullPageMobileSummaryMethods.getBundleSummaryText;

    const bundleItems = fullPageMobileSummaryMethods._renderCompactMobileSummaryBundleItems.call(
      context,
      { display: { format: '${{amount}}' } },
      0,
    );

    expect(bundleItems.querySelector('.fpb-mobile-summary-bundle-title')?.textContent).toBe('Daily kit');
  });

  it('falls back to the bundle name when the configured summary title is empty', () => {
    const context = makeContext('CLASSIC', 'simple');
    context.selectedBundle.name = 'Daily Essentials';
    context.selectedBundle.bundleTextConfig = {
      bundleSummary: {
        title: '   ',
        subTitle: 'Review your bundle',
      },
    };

    expect(fullPageMobileSummaryMethods.getBundleSummaryText.call(context)).toEqual({
      title: 'Daily Essentials',
      subTitle: 'Review your bundle',
    });
  });

  it('projects localized Bundle Cart copy onto the visible summary surface', () => {
    const context = makeContext('STANDARD', 'simple');
    context.selectedBundle.name = 'Daily Essentials';
    context.selectedBundle.bundleTextConfig = {
      bundleSummary: {
        title: '',
        subTitle: '',
      },
    };
    context._resolveText = (key: string, fallback: string) => ({
      yourBundle: 'Translated Bundle Evidence',
      reviewBundle: 'Translated Review Evidence',
    }[key] || fallback);

    expect(fullPageMobileSummaryMethods.getBundleSummaryText.call(context)).toEqual({
      title: 'Translated Bundle Evidence',
      subTitle: 'Translated Review Evidence',
    });
  });
});

describe('FPB mobile bundle quantity options', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'renders saved bundle quantity options in the %s mobile summary',
    (preset) => {
      const context = makeContext(preset, 'simple');
      const boxSelection = document.createElement('div') as unknown as FakeElement;
      context.renderBoxSelectionOptions = jest.fn(() => boxSelection);

      const bundleItems = fullPageMobileSummaryMethods._renderCompactMobileSummaryBundleItems.call(
        context,
        { display: { format: '${{amount}}' } },
        0,
      ) as FakeElement;

      expect(context.renderBoxSelectionOptions).toHaveBeenCalledWith(0);
      expect(bundleItems.children).toContain(boxSelection);
    },
  );

  it('omits mobile bundle quantity options when none are configured', () => {
    const context = makeContext('STANDARD', 'simple');
    context.renderBoxSelectionOptions = jest.fn(() => null);

    const bundleItems = fullPageMobileSummaryMethods._renderCompactMobileSummaryBundleItems.call(
      context,
      { display: { format: '${{amount}}' } },
      0,
    ) as FakeElement;

    expect(context.renderBoxSelectionOptions).toHaveBeenCalledWith(0);
    expect(bundleItems.children).toHaveLength(2);
  });
});

describe('FPB desktop bundle quantity options', () => {
  it.each(['STANDARD', 'CLASSIC', 'COMPACT', 'HORIZONTAL'])(
    'renders saved bundle quantity options in the %s desktop summary',
    (preset) => {
      const panel = document.createElement('aside') as unknown as FakeElement;
      const context = makeContext(preset, 'simple');
      const boxSelection = document.createElement('div') as unknown as FakeElement;
      context.renderBoxSelectionOptions = jest.fn(() => boxSelection);

      fullPageSidePanelMethods.renderSidePanel.call(context, panel);

      expect(context.renderBoxSelectionOptions).toHaveBeenCalledWith(0);
      expect(panel.children).toContain(boxSelection);
    },
  );

  it('omits desktop bundle quantity options when none are configured', () => {
    const panelWithoutOptions = document.createElement('aside') as unknown as FakeElement;
    const contextWithoutOptions = makeContext('STANDARD', 'simple');
    contextWithoutOptions.renderBoxSelectionOptions = jest.fn(() => null);

    const panelWithOptions = document.createElement('aside') as unknown as FakeElement;
    const contextWithOptions = makeContext('STANDARD', 'simple');
    contextWithOptions.renderBoxSelectionOptions = jest.fn(() => document.createElement('div'));

    fullPageSidePanelMethods.renderSidePanel.call(contextWithoutOptions, panelWithoutOptions);
    fullPageSidePanelMethods.renderSidePanel.call(contextWithOptions, panelWithOptions);

    expect(contextWithoutOptions.renderBoxSelectionOptions).toHaveBeenCalledWith(0);
    expect(panelWithoutOptions.children).toHaveLength(panelWithOptions.children.length - 1);
  });
});

describe('FPB shared bundle quantity option state', () => {
  it('passes the same live selected quantity to desktop and mobile summary renderers', () => {
    const desktopPanel = document.createElement('aside') as unknown as FakeElement;
    const desktopContext = makeContext('STANDARD', 'simple');
    desktopContext.getSelectedBoxSelectionQuantity = jest.fn(() => 3);
    desktopContext.renderBoxSelectionOptions = jest.fn(() => document.createElement('div'));

    const mobileContext = makeContext('STANDARD', 'simple');
    mobileContext.getSelectedBoxSelectionQuantity = jest.fn(() => 3);
    mobileContext.renderBoxSelectionOptions = jest.fn(() => document.createElement('div'));

    fullPageSidePanelMethods.renderSidePanel.call(desktopContext, desktopPanel);
    fullPageMobileSummaryMethods._renderCompactMobileSummaryBundleItems.call(
      mobileContext,
      { display: { format: '${{amount}}' } },
      3,
    );

    expect(desktopContext.renderBoxSelectionOptions).toHaveBeenCalledWith(3);
    expect(mobileContext.renderBoxSelectionOptions).toHaveBeenCalledWith(3);
  });
});

describe('FPB summary removal accessibility', () => {
  it.each([
    ['14k Dangling Pendant Earrings', 'Delete 14k Dangling Pendant Earrings'],
    ['', 'Delete product'],
  ])('builds an action-oriented removal label for %p', (title, expected) => {
    expect(fullPageSidePanelMethods.getSummaryProductRemoveButtonLabel(title)).toBe(expected);
  });
});

describe('FPB Standard summary sidebar add-ons', () => {
  it('renders the add-on summary block before the active add-on step', () => {
    const panel = document.createElement('aside');
    const context = makeContext('STANDARD', 'simple');
    let renderCount = 0;
      context._renderFreeGiftSection = (container: FakeElement) => {
      renderCount += 1;
      const addon = document.createElement('div') as unknown as FakeElement;
      addon.className = 'side-panel-addon-message side-panel-free-gift';
      addon.textContent = 'Add 1 more product(s) to claim 100% off on Add ons';
      container.appendChild(addon);
    };

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    expect(renderCount).toBe(1);
  });

  it('does not render the add-on summary block when the active step is the add-on step', () => {
      const panel = document.createElement('aside') as unknown as FakeElement;
    const context = makeContext('STANDARD', 'simple');
    let renderCount = 0;
    context.currentStepIndex = 1;
    context.selectedBundle.steps = [
      { id: 'step-1', enabled: true },
      { id: 'personalization-addons', name: 'Add On', isFreeGift: true },
    ];
    context._renderFreeGiftSection = () => {
      renderCount += 1;
    };

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);
    expect(renderCount).toBe(0);
  });
});

describe('FPB sidebar add-on CTA copy', () => {
  it('keeps Classic final-step add-to-cart copy when box tier text is configured', () => {
    const panel = document.createElement('aside') as unknown as FakeElement;
    const context = makeContext('CLASSIC', 'simple');
    context.selectedProducts = [[{}], [{}]];
    context.resolveFullPageLayout = () => 'sidebar';
    context.areBundleConditionsMet = () => true;
    context.getSidebarTierCtaContent = () => ({ label: 'Box of 2', subtext: '$5 off' });
    context._resolveText = (key: string, fallback: string) => (
      key === 'addToCartButton' ? 'Add To Cart' : fallback
    );

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    const buttons = collectButtons(panel);
    expect(buttons.some((button) => button.textContent === 'Add To Cart')).toBe(true);
    expect(buttons.some((button) => button.textContent === 'Box of 2 $5 off')).toBe(false);
  });

  it('validates Classic final-step quantity before desktop add-to-cart', async () => {
    const toastSpy = jest.spyOn(ToastManager, 'show').mockImplementation(() => {});
    const panel = document.createElement('aside') as unknown as FakeElement;
    const context = makeContext('CLASSIC', 'simple');
    context.selectedProducts = [[]];
    context.resolveFullPageLayout = () => 'sidebar';
    context.areBundleConditionsMet = jest.fn(() => false);
    context.getStepConditionValidationMessage = jest.fn(() => 'Add exactly 2 products on this step');
    context.addBundleToCart = jest.fn();
    context._resolveText = (key: string, fallback: string) => (
      key === 'addToCartButton' ? 'Add To Cart' : fallback
    );

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    const addToCartButton = collectButtons(panel).find((button) => button.textContent === 'Add To Cart');
    expect(addToCartButton).toBeDefined();
    await addToCartButton?.click();

    expect(context.areBundleConditionsMet).toHaveBeenCalledTimes(1);
    expect(context.getStepConditionValidationMessage).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith('Add exactly 2 products on this step');
    expect(context.addBundleToCart).not.toHaveBeenCalled();

    toastSpy.mockRestore();
  });

  it('keeps add-to-cart copy on the active add-on step when tier CTA text is configured', () => {
    const panel = document.createElement('aside') as unknown as FakeElement;
    const context = makeContext('CLASSIC', 'simple');
    context.currentStepIndex = 1;
    context.selectedProducts = [[{}], [{}]];
    context.selectedBundle.steps = [
      { id: 'step-1', enabled: true },
      { id: 'personalization-addons', name: 'Add On', enabled: true, isFreeGift: true },
    ];
    context.areBundleConditionsMet = () => true;
    context.getSidebarTierCtaContent = () => ({ label: 'Box of 2', subtext: '$5 off' });
    context._resolveText = (key: string, fallback: string) => (
      key === 'addToCartButton' ? 'Add To Cart' : fallback
    );

    fullPageSidePanelMethods.renderSidePanel.call(context, panel);

    const cta = panel.querySelector('.side-panel-btn-next');
    expect(cta?.textContent).toBe('Add To Cart');
    expect(cta?.className).not.toContain('side-panel-btn-has-tier-cta');
  });
});
