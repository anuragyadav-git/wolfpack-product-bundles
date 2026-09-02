export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageSidePanelMethods } = require('../../../app/assets/widgets/full-page/methods/side-panel-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ToastManager } = require('../../../app/assets/widgets/shared/toast-manager.js');

class FakeElement {
  tagName: string;
  className = '';
  innerHTML = '';
  children: FakeElement[] = [];
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  listeners: Record<string, Array<(event?: { stopPropagation?: () => void }) => unknown>> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get classList() {
    return {
      add: (className: string) => {
        const classes = this.className.split(/\s+/).filter(Boolean);
        if (!classes.includes(className)) {
          this.className = [...classes, className].join(' ');
        }
      },
    };
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  addEventListener(eventName: string, handler: (event?: { stopPropagation?: () => void }) => unknown) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(handler);
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  click() {
    const event = { stopPropagation: jest.fn() };
    (this.listeners.click || []).forEach((handler) => handler(event));
    return event;
  }
}

function collectButtons(root: FakeElement): FakeElement[] {
  const buttons = root.tagName === 'BUTTON' ? [root] : [];
  root.children.forEach((child) => {
    buttons.push(...collectButtons(child));
  });
  return buttons;
}

describe('FPB Standard sidebar slot tiles', () => {
  const originalShowWithUndo = ToastManager.showWithUndo;

  beforeEach(() => {
    (global as any).document = {
      createElement: (tagName: string) => new FakeElement(tagName),
    };
    ToastManager.showWithUndo = jest.fn(() => ({} as HTMLElement));
  });

  afterEach(() => {
    ToastManager.showWithUndo = originalShowWithUndo;
  });

  it('decrements one unit per filled standard desktop slot remove action', () => {
    const container = document.createElement('div') as unknown as FakeElement;
    const updateCalls: Array<[number, string, number]> = [];
    const selectedItem = {
      id: 'product-1',
      variantId: 'variant-1',
      selectionId: 'variant-1',
      title: 'Selected product',
      quantity: 3,
      stepIndex: 0,
    };
    const context: { selectedProducts: Record<number, Record<string, number>>; [key: string]: any } = {
      currentStepIndex: 0,
      selectedProducts: {
        0: {
          'variant-1': 3,
        },
      },
      selectedBundle: { productSlotIconUrl: '' },
      getSummarySidebarMaxItemCount: () => 2,
      getSummaryProductDisplayTitle: () => 'Selected product',
      _getSelectedProductImageSrc: () => 'https://cdn.example.com/product.jpg',
      _escapeHTML: (value: string) => value,
      getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
      updateProductSelection: (stepIndex: number, productId: string, quantity: number) => {
        updateCalls.push([stepIndex, productId, quantity]);
        context.selectedProducts[stepIndex][productId] = quantity;
      },
    };

    fullPageSidePanelMethods._renderStandardSidebarSlotTiles.call(
      context,
      container,
      [selectedItem],
    );

    const removeButton = collectButtons(container).find((button) =>
      button.attributes['data-action'] === 'remove-selected-product'
    );

    expect(removeButton).toBeDefined();
    const clickEvent = removeButton?.click();

    expect(clickEvent?.stopPropagation).toHaveBeenCalled();
    expect(updateCalls).toEqual([[0, 'variant-1', 2]]);
  });

  it('uses the configured summary target without adding an extra empty desktop slot', () => {
    const container = document.createElement('div') as unknown as FakeElement;
    const selectedItems = [
      { id: 'product-1', variantId: 'variant-1', selectionId: 'variant-1', title: 'Product 1', stepIndex: 0 },
      { id: 'product-2', variantId: 'variant-2', selectionId: 'variant-2', title: 'Product 2', stepIndex: 0 },
    ];

    fullPageSidePanelMethods._renderStandardSidebarSlotTiles.call(
      {
        selectedBundle: { productSlotIconUrl: '' },
        getSummarySidebarMaxItemCount: () => 2,
        getSummaryProductDisplayTitle: () => '',
        _getSelectedProductImageSrc: () => '',
        _escapeHTML: (value: string) => value,
        getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
        removeSummarySelectedProduct: jest.fn(),
      },
      container,
      selectedItems,
    );

    const slotsContainer = container.children[0];
    expect(slotsContainer?.children).toHaveLength(2);
  });

  it('expands a selected item into multiple summary slots when quantity is greater than one', () => {
    const container = document.createElement('div') as unknown as FakeElement;
    const selectedItems = [{
      id: 'product-1',
      variantId: 'variant-1',
      selectionId: 'variant-1',
      title: 'Product 1',
      stepIndex: 0,
      quantity: 3,
    }];

    fullPageSidePanelMethods._renderStandardSidebarSlotTiles.call(
      {
        selectedBundle: { productSlotIconUrl: '' },
        getSummarySidebarMaxItemCount: () => 2,
        getSummaryProductDisplayTitle: () => 'Product 1',
        _getSelectedProductImageSrc: () => 'https://cdn.example.com/product.jpg',
        _escapeHTML: (value: string) => value,
        getSummaryProductRemovalState: () => ({ canRemove: true, blockedMessage: '' }),
        removeSummarySelectedProduct: jest.fn(),
      },
      container,
      selectedItems,
    );

    const slotsContainer = container.children[0];
    expect(slotsContainer?.children).toHaveLength(3);
  });
});
