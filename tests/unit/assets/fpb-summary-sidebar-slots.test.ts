export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageValidationAddonsMethods } = require('../../../app/assets/widgets/full-page/methods/validation-addons-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageBoxSelectionSidebarMethods } = require('../../../app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageSidePanelMethods } = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageMobileSummaryMethods } = require('../../../app/assets/widgets/full-page/methods/mobile-summary-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ToastManager } = require('../../../app/assets/widgets/shared/toast-manager.js');

function makeContext(steps: any[]) {
  return Object.assign(Object.create({
    ...fullPageValidationAddonsMethods,
    ...fullPageBoxSelectionSidebarMethods,
  }), {
    selectedBundle: { steps },
    getAllSelectedProductsData: () => [],
  });
}

class FakeElement {
  tagName: string;
  className = '';
  private _innerHTML = '';
  attributes: Record<string, string> = {};
  dataset: Record<string, string> = {};
  private children: FakeElement[] = [];
  private listeners: Record<string, Array<(event?: { stopPropagation?: () => void }) => unknown>> = {};
  private parent: FakeElement | null = null;

  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
  }

  get classList() {
    return {
      add: (...classNames: string[]) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        classNames.forEach((className) => classes.add(className));
        this.className = Array.from(classes).join(' ');
      },
    };
  }

  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  getChildren() {
    return this.children;
  }

  get firstElementChild() {
    return this.children[0];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value: string) {
    this._innerHTML = value;
    this.children = [];

    if (!value.includes('data-bw-selected-slot')) return;

    const root = new FakeElement('div');
    root.setAttribute('data-bw-selected-slots', 'true');
    this.appendChild(root);

    const slotMatches = [...value.matchAll(/data-slot-id="([^"]+)"/g)];
    slotMatches.forEach((match, index) => {
      const slotId = match[1];
      const start = match.index || 0;
      const end = slotMatches[index + 1]?.index ?? value.length;
      const slotHtml = value.slice(start, end);
      const slot = new FakeElement('div');
      slot.setAttribute('data-slot-id', slotId);

      const removeMatch = slotHtml.match(/data-action="remove-selected-product"[^>]*data-variant-id="([^"]+)"/);
      if (removeMatch) {
        const removeBtn = new FakeElement('button');
        removeBtn.setAttribute('data-action', 'remove-selected-product');
        removeBtn.setAttribute('data-variant-id', removeMatch[1]);
        slot.appendChild(removeBtn);
      }

      root.appendChild(slot);
    });
  }

  getAttribute(name: string) {
    return this.attributes[name];
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
    if (name.startsWith('data-')) {
      const key = name
        .slice('data-'.length)
        .replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
      this.dataset[key] = value;
    }
  }

  addEventListener(eventName: string, handler: (event?: { stopPropagation?: () => void }) => unknown) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(handler);
  }

  dispatchEvent(event: { type?: string; bubbles?: boolean; stopPropagation?: () => void }) {
    const handlers = this.listeners[event.type || 'click'] || [];
    handlers.forEach((handler) => handler(event));
  }

  closest(selector: string) {
    if (selector !== '[data-slot-id]') return null;

    const findSlot = (node: FakeElement | null): FakeElement | null => {
      if (!node) return null;
      if (node.dataset.slotId) return node;
      return findSlot(node.parent);
    };

    return findSlot(this);
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    const walk = (node: FakeElement) => {
      if (
        selector === '[data-action="remove-selected-product"]'
        && node.dataset.action === 'remove-selected-product'
      ) {
        results.push(node);
      } else if (selector === '[data-slot-id]' && node.dataset.slotId) {
        results.push(node);
      }
      node.children.forEach((child) => walk(child));
    };

    walk(this);
    return results;
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] || null;
  }

  click() {
    this.dispatchEvent({ type: 'click', bubbles: true, stopPropagation: jest.fn() as () => void });
  }

  remove() {
    // no-op for tests
  }
}

const originalDocument = global.document;
const originalGetComputedStyle = global.getComputedStyle;
const originalShowWithUndo = ToastManager.showWithUndo;

beforeEach(() => {
  ToastManager.showWithUndo = jest.fn(() => ({} as HTMLElement));
  global.document = {
    createElement: () => new FakeElement(),
    getElementById: () => null,
    body: {
      appendChild: jest.fn(),
    },
    documentElement: {
      style: {},
    },
  } as unknown as Document;

  global.getComputedStyle = jest.fn(() => ({
    getPropertyValue: () => '',
  })) as typeof window.getComputedStyle;
});

afterEach(() => {
  global.document = originalDocument;
  global.getComputedStyle = originalGetComputedStyle as typeof window.getComputedStyle;
  ToastManager.showWithUndo = originalShowWithUndo;
});

describe('fullPageValidationAddonsMethods.getSummarySidebarMaxItemCount', () => {
  it('sums configured required quantities from step quantity conditions', () => {
    const count = fullPageValidationAddonsMethods.getSummarySidebarMaxItemCount.call(
      makeContext([
        { enabled: true, conditionType: 'QUANTITY', conditionOperator: 'greater_than_or_equal_to', conditionValue: 2 },
        { enabled: true, conditionType: 'QUANTITY', conditionOperator: 'equal_to', conditionValue: 3 },
      ]),
    );

    expect(count).toBe(5);
  });

  it('falls back to zero rows when there is no explicit required-quantity condition', () => {
    const count = fullPageValidationAddonsMethods.getSummarySidebarMaxItemCount.call(
      makeContext([
        { enabled: true, minQuantity: 1 },
        { enabled: false, minQuantity: 1, maxQuantity: 5 },
      ]),
    );

    expect(count).toBe(0);
  });

  it('keeps enough rows for selected products when selected count exceeds configured fallback', () => {
    const count = fullPageValidationAddonsMethods.getSummarySidebarMaxItemCount.call(
      makeContext([
        { enabled: true, minQuantity: 2 },
      ]),
      4,
    );

    expect(count).toBe(4);
  });

  it('uses the active bundle quantity option before step quantity fallback', () => {
    const context = makeContext([
      { enabled: true, minQuantity: 1 },
    ]);
    context.selectedBundle.boxSelection = {
      isEnabled: true,
      rules: [{
        ruleId: 'box-3',
        boxQuantity: 3,
        boxLabel: 'Box of 3',
        boxSubtext: '$10 off',
        isDefaultSelected: true,
      }],
    };

    const count = fullPageValidationAddonsMethods.getSummarySidebarMaxItemCount.call(context);

    expect(count).toBe(3);
  });
});

describe('fullPageBoxSelectionSidebarMethods.getClassicSidebarSlotCount', () => {
  it('uses the shared bundle-wide target when no box selection is active', () => {
    const context = makeContext([
      { enabled: true, conditionType: 'QUANTITY', conditionOperator: 'equal_to', conditionValue: 2 },
      { enabled: true, conditionType: 'QUANTITY', conditionOperator: 'equal_to', conditionValue: 3 },
    ]);

    const count = fullPageBoxSelectionSidebarMethods.getClassicSidebarSlotCount.call(
      context,
      [],
      context.selectedBundle.steps[0],
    );

    expect(count).toBe(5);
  });

  it('falls back without adding an extra slot when no target helper exists', () => {
    const count = fullPageBoxSelectionSidebarMethods.getClassicSidebarSlotCount.call(
      {
        getSelectedBoxSelectionQuantity: () => 3,
        getBoxSelectionRules: () => [],
        getActiveBoxSelectionRule: () => null,
        getSummarySidebarMaxItemCount: undefined,
      },
      Array(4).fill({ quantity: 1 }),
      { maxQuantity: 2 },
    );

    expect(count).toBe(4);
  });

  it('decrements one unit per classic sidebar slot remove action', () => {
    const restoredDocument = global.document;

    const updateCalls: Array<[number, string, number]> = [];
    const context: any = {
      selectedProducts: {
        0: {
          v1: 3,
        },
      },
      getClassicSidebarSlotCount: jest.fn(() => 3),
      _shouldRenderProductSlots: () => true,
      getSummarySidebarMaxItemCount: () => 0,
      getSummaryProductDisplayTitle: () => 'Product',
      _escapeHTML: (value: string) => value,
      _getSelectedProductImageSrc: () => '',
      getSummaryProductVariantDisplay: () => '',
      getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
      selectedBundle: {
        productSlotIconUrl: '',
        steps: [{ maxQuantity: 0 }],
      },
      updateProductSelection: (stepIndex: number, productId: string, quantity: number) => {
        updateCalls.push([stepIndex, productId, quantity]);
        context.selectedProducts[stepIndex][productId] = quantity;
      },
      getBoxSelectionRules: () => [],
      getActiveBoxSelectionRule: () => null,
      getSummarySidebarMaxItemCount: () => 0,
      removeSummarySelectedProduct: jest.fn(),
    };

    const slots = fullPageBoxSelectionSidebarMethods.renderClassicSidebarSlots.call(
      context,
      [{
        variantId: 'v1',
        productId: 'p1',
        selectionId: 'v1',
        title: 'Product',
        stepIndex: 0,
        quantity: 3,
      }],
      3,
    );

    const removeBtn = slots.querySelector('[data-action="remove-selected-product"]');
    removeBtn?.dispatchEvent({
      type: 'click',
      stopPropagation: () => {},
    });

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0]).toEqual([0, 'v1', 2]);

    global.document = restoredDocument;
  });
});

describe('fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles', () => {
  it('uses the shared summary target for mobile slot tiles', () => {
    const container = new FakeElement();

    fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles.call({
      selectedBundle: {},
      getSummarySidebarMaxItemCount: () => 3,
      getSummaryProductDisplayTitle: () => '',
      _getSelectedProductImageSrc: () => '',
      _escapeHTML: (value: string) => value,
    }, container, [], { minQuantity: 1 }, 0);

    expect(container.getChildren()).toHaveLength(3);
  });

  it('does not add an extra slot when the active step has no quantity limit', () => {
    const container = new FakeElement();

    fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles.call({
      selectedBundle: {},
      getSummarySidebarMaxItemCount: () => 2,
      getSummaryProductDisplayTitle: () => '',
      _getSelectedProductImageSrc: () => '',
      _escapeHTML: (value: string) => value,
    }, container, [{}, {}], { minQuantity: 0 }, 5);

    expect(container.getChildren()).toHaveLength(2);
  });

  it('renders one slot per unit when a selected item has quantity > 1', () => {
    const container = new FakeElement();

    fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles.call({
      selectedBundle: {},
      getSummarySidebarMaxItemCount: () => 2,
      getSummaryProductDisplayTitle: () => 'Product',
      _getSelectedProductImageSrc: () => '',
      _escapeHTML: (value: string) => value,
    }, container, [{ id: 'p1', variantId: 'v1', selectionId: 'v1', title: 'Product', stepIndex: 0, quantity: 3 }], { minQuantity: 1 }, 0);

    expect(container.getChildren()).toHaveLength(3);
  });
});

describe('fullPageValidationAddonsMethods.getSummarySidebarEmptyStateMode', () => {
  it('uses inline slots when Product Slots is enabled', () => {
    const mode = fullPageValidationAddonsMethods.getSummarySidebarEmptyStateMode.call({
      _shouldRenderProductSlots: () => true,
    });

    expect(mode).toBe('slots');
  });

  it('uses skeleton rows when Product Slots is disabled', () => {
    const mode = fullPageValidationAddonsMethods.getSummarySidebarEmptyStateMode.call({
      _shouldRenderProductSlots: () => false,
    });

    expect(mode).toBe('skeletons');
  });

  it('uses the custom slot icon for empty desktop inline slot tiles', () => {
    const container = new FakeElement();
    const context = {
      selectedBundle: { productSlotIconUrl: 'https://cdn.example.com/custom-slot.png' },
      getSummarySidebarMaxItemCount: () => 2,
      getSummaryProductDisplayTitle: () => 'Product',
      _getSelectedProductImageSrc: () => '',
      _escapeHTML: (value: string) => value,
      getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
      removeSummarySelectedProduct: jest.fn(),
    };

    const selectedItems = [
      { id: 'product-1', variantId: 'variant-1', selectionId: 'variant-1', title: 'Product 1', stepIndex: 0 },
    ];

    fullPageSidePanelMethods._renderStandardSidebarSlotTiles.call(
      context,
      container,
      selectedItems,
    );

    const slotContainer = container.children[0];
    const emptySlot = slotContainer?.children?.[1];
    expect(emptySlot?.innerHTML || '').toContain('slot-icon');
    expect(emptySlot?.innerHTML || '').toContain('custom-slot.png');
  });

  it('uses the custom slot icon for empty compact/horizontal mobile summary slots', () => {
    const container = new FakeElement();

    fullPageMobileSummaryMethods._renderCompactMobileSummarySlotTiles.call({
      selectedBundle: { productSlotIconUrl: 'https://cdn.example.com/custom-slot.png' },
      getSummarySidebarMaxItemCount: () => 2,
      getSummaryProductDisplayTitle: () => 'Product',
      _getSelectedProductImageSrc: () => '',
      _escapeHTML: (value: string) => value,
    }, container, [], { minQuantity: 1 }, 0);

    const emptySlot = container.children?.[1];
    expect(emptySlot?.innerHTML || '').toContain('slot-icon');
    expect(emptySlot?.innerHTML || '').toContain('custom-slot.png');
  });
});
