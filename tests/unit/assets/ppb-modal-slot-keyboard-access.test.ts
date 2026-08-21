export {};

(globalThis as any).window = {
  Shopify: { currency: { active: 'USD', format: '$ {{amount}}' } },
  shopMoneyFormat: '$ {{amount}}',
};
(globalThis as any).getComputedStyle = () => ({ getPropertyValue: () => '' });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { modalSlotTemplateMethods } = require('../../../app/assets/widgets/product-page/templates/modal-slot-template.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageInpageRenderMethods } = require('../../../app/assets/widgets/product-page/methods/inpage-render-methods.js');

describe('PPB modal slot keyboard access', () => {
  let originalDocument: Document | undefined;

  beforeEach(() => {
    originalDocument = global.document;
    global.document = createFakeDocument() as unknown as Document;
  });

  afterEach(() => {
    global.document = originalDocument as Document;
  });

  it('renders empty slots as labelled native controls', () => {
    const widget = createWidget();
    const card = widget.createEmptyStateCard({ name: 'Choose earrings' }, 0, 1);

    expect(card.tagName).toBe('BUTTON');
    expect(card.type).toBe('button');
    expect(card.children.at(-1)?.textContent).toBe('Product 2');

    card.dispatch('click', {});

    expect(widget.openModal).toHaveBeenCalledWith(0, card);
  });

  it('reopens a filled slot through a labelled native replacement control', () => {
    const widget = createWidget();
    const card = widget.createSelectedProductCard({
      product: { title: 'Obsidian Earrings', imageUrl: '/earrings.jpg' },
      stepIndex: 0,
      step: { name: 'Choose earrings' },
      variantId: 'variant-1',
      instanceIndex: 0,
    }, 0);
    const replacement = card.children[0];

    expect(replacement.tagName).toBe('BUTTON');
    expect(replacement.type).toBe('button');
    expect(replacement.getAttribute('aria-label')).toBe('Obsidian Earrings');
    expect(replacement.dataset).toEqual({
      stepIndex: '0',
      cardIndex: '0',
      variantId: 'variant-1',
    });
    replacement.dispatch('click', {});

    expect(widget.openModal).toHaveBeenCalledWith(0, replacement);
  });

  it('exposes a complete selected-slot name without folding in the nested remove action', () => {
    const widget = createWidget();
    const card = widget.createSelectedProductCard({
      product: { title: 'Obsidian Earrings', imageUrl: '/earrings.jpg', price: 82900 },
      stepIndex: 0,
      step: { name: 'Choose earrings' },
      variantId: 'variant-1',
      instanceIndex: 0,
    }, 0);

    expect(card.getAttribute('aria-label')).toBeNull();
    expect(card.children[0].getAttribute('aria-label')).toBe('Obsidian Earrings');
    const identity = card.children.at(-1);
    expect(identity?.children[0]?.textContent).toBe('Obsidian Earrings');
    expect(identity?.children[1]?.children[0]?.textContent).toBe('$ 829.00');
  });

  it('exposes the filled-slot cross badge with the complete localized product-specific name', () => {
    const widget = createWidget();
    widget._resolveText = jest.fn((key: string, fallback: string) => (
      key === 'removeProductFromFooterText' ? 'Remove {{stepName}}' : fallback
    ));
    const productTitle = 'Extra Long Obsidian Earrings with Complete Product Name';
    const card = widget.createSelectedProductCard({
      product: { title: productTitle, imageUrl: '/earrings.jpg' },
      stepIndex: 0,
      step: { name: 'Choose earrings' },
      variantId: 'variant-1',
      instanceIndex: 0,
    }, 0);
    const remove = getRemoveControl(card);
    const stopPropagation = jest.fn();

    expect(remove.tagName).toBe('BUTTON');
    expect(remove.type).toBe('button');
    expect(remove.getAttribute('aria-label')).toBe(`Remove ${productTitle}`);
    expect(remove.title).toBe(`Remove ${productTitle}`);
    expect(widget._resolveText).toHaveBeenCalledWith(
      'removeProductFromFooterText',
      'Remove this product',
    );

    remove.dispatch('click', { stopPropagation });

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(widget.removeProductFromSelection).toHaveBeenCalledWith(0, 'variant-1');
  });

  it('restores focus to the same-index slot after removal rerenders the step', () => {
    const widget = createWidget();
    const originalAnimationFrame = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;

    try {
      const card = widget.createSelectedProductCard({
        product: { title: 'Obsidian Earrings', imageUrl: '/earrings.jpg' },
        stepIndex: 0,
        step: { name: 'Choose earrings' },
        variantId: 'variant-1',
        instanceIndex: 0,
      }, 1);
      const precedingSlot = { dataset: { stepIndex: '0' }, focus: jest.fn() };
      const recoveryTarget = { dataset: { stepIndex: '0' }, focus: jest.fn() };
      let renderPass = 0;
      widget.elements = {
        stepsContainer: {
          querySelectorAll: jest.fn(() => {
            renderPass += 1;
            return renderPass === 1
              ? [precedingSlot, card]
              : [precedingSlot, recoveryTarget];
          }),
        },
      };

      getRemoveControl(card).dispatch('click', { stopPropagation: jest.fn() });

      expect(recoveryTarget.focus).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.requestAnimationFrame = originalAnimationFrame;
    }
  });

  it('falls back to the previous slot when removal leaves no same-index target', () => {
    const widget = createWidget();
    const originalAnimationFrame = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;

    try {
      const card = widget.createSelectedProductCard({
        product: { title: 'Obsidian Earrings', imageUrl: '/earrings.jpg' },
        stepIndex: 0,
        step: { name: 'Choose earrings' },
        variantId: 'variant-1',
        instanceIndex: 0,
      }, 1);
      const precedingSlot = { dataset: { stepIndex: '0' }, focus: jest.fn() };
      let renderPass = 0;
      widget.elements = {
        stepsContainer: {
          querySelectorAll: jest.fn(() => {
            renderPass += 1;
            return renderPass === 1 ? [precedingSlot, card] : [precedingSlot];
          }),
        },
      };

      getRemoveControl(card).dispatch('click', { stopPropagation: jest.fn() });

      expect(precedingSlot.focus).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.requestAnimationFrame = originalAnimationFrame;
    }
  });
});

function createWidget() {
  const widget = {
    _getProductPageTemplateType: () => 'PDP_MODAL',
    _getProductPageDesignPreset: () => 'HORIZONTAL_SLOTS',
    _getProductPageTemplateContract: () => ({ templateType: 'PDP_MODAL', slots: { orientation: 'horizontal' } }),
    openModal: jest.fn(),
  } as any;
  Object.assign(widget, modalSlotTemplateMethods, ProductPageInpageRenderMethods);
  widget.removeProductFromSelection = jest.fn();
  return widget;
}

function getRemoveControl(card: any) {
  return card.children.find((child: any) => (
    child.getAttribute?.('aria-label')?.startsWith('Remove')
  ));
}

function createFakeDocument() {
  return {
    documentElement: {},
    createElement: (tagName: string) => createFakeElement(tagName),
  };
}

function createFakeElement(tagName: string) {
  const attributes = new Map<string, string>();
  const listeners = new Map<string, (event: any) => void>();
  return {
    tagName: tagName.toUpperCase(),
    type: '',
    tabIndex: -1,
    className: '',
    textContent: '',
    title: '',
    innerHTML: '',
    children: [] as any[],
    dataset: {} as Record<string, string>,
    style: { setProperty: jest.fn() },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
    appendChild(child: any) {
      this.children.push(child);
      return child;
    },
    addEventListener(name: string, listener: (event: any) => void) {
      listeners.set(name, listener);
    },
    dispatch(name: string, event: any) {
      listeners.get(name)?.({ ...event, currentTarget: this });
    },
  };
}
