export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageSelectionMethods } = require('../../../app/assets/widgets/product-page/methods/selection-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageModalMethods } = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');

class FakeClassList {
  private classes: Set<string>;

  constructor(initial = '') {
    this.classes = new Set(initial.split(/\s+/).filter(Boolean));
  }

  add(...names: string[]) {
    names.forEach(name => this.classes.add(name));
  }

  remove(...names: string[]) {
    names.forEach(name => this.classes.delete(name));
  }

  contains(name: string) {
    return this.classes.has(name);
  }

  toString() {
    return Array.from(this.classes).join(' ');
  }
}

class FakeElement {
  attributes = new Map<string, string>();
  children: FakeElement[] = [];
  classList: FakeClassList;
  dataset: Record<string, string> = {};
  disabled = false;
  parentElement: FakeElement | null = null;
  removed = false;
  style: Record<string, string> = {};
  textContent = '';
  listeners: Record<string, Array<(event: any) => void>> = {};

  constructor(public tagName = 'div', public className = '') {
    this.classList = new FakeClassList(className);
  }

  appendChild(child: FakeElement) {
    child.parentElement = this;
    this.children.push(child);
  }

  addEventListener(eventName: string, listener: (event: any) => void) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(listener);
  }

  cloneNode() {
    return this;
  }

  remove() {
    this.removed = true;
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter(child => child !== this);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  querySelector(selector: string): FakeElement | null {
    if (this.matches(selector)) return this;

    for (const child of this.children) {
      const match = child.querySelector(selector);
      if (match) return match;
    }

    return null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const matches: FakeElement[] = [];
    if (this.matches(selector)) matches.push(this);

    this.children.forEach(child => {
      matches.push(...child.querySelectorAll(selector));
    });

    return matches;
  }

  matches(selector: string): boolean {
    if (selector.startsWith('.')) {
      return this.classList.contains(selector.slice(1));
    }

    const dataProductId = selector.match(/^\[data-product-id="(.+)"\]$/);
    if (dataProductId) {
      return this.dataset.productId === dataProductId[1];
    }

    return false;
  }

  closest(selector: string): FakeElement | null {
    if (this.matches(selector)) return this;
    return this.parentElement?.closest(selector) ?? null;
  }
}

function createSharedProductCard() {
  const scope = new FakeElement('div');
  const card = new FakeElement('div', 'bw-product-card');
  card.dataset.productId = 'variant-1';
  card.setAttribute('aria-label', 'Open product details (not selected)');
  card.setAttribute('aria-pressed', 'false');

  const action = new FakeElement('div', 'bw-product-card__action product-card-action');
  const addButton = new FakeElement('button', 'bw-product-card__add-button product-add-btn');
  addButton.dataset.productId = 'variant-1';
  addButton.textContent = 'Add +';
  action.appendChild(addButton);
  card.appendChild(action);
  scope.appendChild(card);

  return { scope, card, action, addButton };
}

function containsText(element: FakeElement, text: string): boolean {
  return element.textContent === text
    || element.children.some(child => containsText(child, text));
}

function findButtonByText(element: FakeElement, text: string): FakeElement | null {
  if (element.tagName === 'button' && element.textContent === text) return element;

  for (const child of element.children) {
    const match = findButtonByText(child, text);
    if (match) return match;
  }

  return null;
}

describe('PPB shared card quantity selector state', () => {
  const originalDocument = global.document;

  afterEach(() => {
    global.document = originalDocument;
  });

  it('replaces the add button with inline quantity controls when a shared card is selected', () => {
    const { scope, card, action, addButton } = createSharedProductCard();
    global.document = {
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
    } as unknown as Document;

    ProductPageSelectionMethods.updateProductQuantityDisplay.call({
      container: scope,
      elements: {
        modal: {
          classList: { contains: () => false },
        },
      },
      selectedBundle: {},
      _resolveText: (_key: string, fallback: string) => fallback,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
    }, 0, 'variant-1', 2);

    const quantityControls = action.querySelector('.inline-quantity-controls');
    const quantityDisplay = action.querySelector('.inline-qty-display');

    expect(addButton.removed).toBe(true);
    expect(quantityControls).not.toBeNull();
    expect(quantityDisplay?.textContent).toBe('2');
    expect(card.classList.contains('bw-product-card--selected')).toBe(true);
    expect(card.attributes.get('aria-pressed')).toBeUndefined();
    expect(card.attributes.get('aria-label')).toBe('Open product details (selected)');
  });

  it('replaces a Product Grid add button with inline controls when quantity validation is disabled', () => {
    const { scope, card, action, addButton } = createSharedProductCard();
    card.classList.add('bw-ppb-grid-product-card');
    global.document = {
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
    } as unknown as Document;

    ProductPageSelectionMethods.updateProductQuantityDisplay.call({
      container: scope,
      elements: { modal: { classList: { contains: () => false } } },
      selectedBundle: {
        steps: [{}],
        validateQuantityPerProduct: { isEnabled: false, allowedQuantity: 1 },
      },
      _resolveText: (_key: string, fallback: string) => fallback,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
    }, 0, 'variant-1', 1);

    expect(addButton.removed).toBe(true);
    expect(containsText(action, '1')).toBe(true);
  });

  it('keeps Product Grid inline controls and disables increment at a maximum above one', () => {
    const { scope, card, action } = createSharedProductCard();
    card.classList.add('bw-ppb-grid-product-card');
    global.document = {
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
    } as unknown as Document;

    ProductPageSelectionMethods.updateProductQuantityDisplay.call({
      container: scope,
      elements: { modal: { classList: { contains: () => false } } },
      selectedBundle: {
        steps: [{}],
        validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 3 },
      },
      _resolveText: (_key: string, fallback: string) => fallback,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
    }, 0, 'variant-1', 3);

    const increment = findButtonByText(action, '+');
    expect(containsText(action, '3')).toBe(true);
    expect(increment?.disabled).toBe(true);
    expect(increment?.getAttribute('aria-disabled')).toBe('true');
  });

  it('replaces modal quantity controls with Added xN at a configured maximum', () => {
    const { scope, card, action } = createSharedProductCard();
    scope.classList.add('bw-bs-panel--open');
    global.document = {
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
    } as unknown as Document;

    ProductPageSelectionMethods.updateProductQuantityDisplay.call({
      container: new FakeElement('div'),
      elements: { modal: scope },
      selectedBundle: {
        steps: [{}],
        validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 3 },
      },
      _resolveText: (_key: string, fallback: string) => fallback,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
    }, 0, 'variant-1', 3);

    expect(action.querySelector('.inline-quantity-controls')).toBeNull();
    expect(action.querySelector('.product-add-btn')?.textContent).toBe('Added x3');
    expect(action.querySelector('.product-add-btn')?.getAttribute('aria-pressed')).toBe('true');
    expect(card.attributes.get('aria-pressed')).toBeUndefined();
  });

  it('restores the accessible unselected state when quantity returns to zero', () => {
    const { scope, card, addButton } = createSharedProductCard();
    card.setAttribute('aria-label', 'Open product details (selected)');
    card.setAttribute('aria-pressed', 'true');
    addButton.setAttribute('aria-pressed', 'true');

    ProductPageSelectionMethods.updateProductQuantityDisplay.call({
      container: scope,
      elements: {
        modal: {
          classList: { contains: () => false },
        },
      },
      selectedBundle: {},
      _resolveText: (_key: string, fallback: string) => fallback,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
    }, 0, 'variant-1', 0);

    expect(card.attributes.get('aria-pressed')).toBeUndefined();
    expect(card.attributes.get('aria-label')).toBe('Open product details (not selected)');
    expect(addButton.attributes.get('aria-pressed')).toBe('false');
  });

  it('delegates inline quantity button clicks to the quantity update path', () => {
    const productGrid = new FakeElement('div');
    const parent = {
      replaceChild: jest.fn(),
    };
    (productGrid as any).parentNode = parent;
    const updates: Array<[number, string, number]> = [];

    ProductPageModalMethods.attachProductEventHandlers.call({
      selectedBundle: { steps: [{}] },
      stepProductData: [[]],
      findProductBySelectionKey: () => null,
      getSelectedQuantity: () => 1,
      updateProductSelection: (stepIndex: number, productId: string, quantity: number) => {
        updates.push([stepIndex, productId, quantity]);
      },
    }, productGrid, 0);

    const increaseButton = new FakeElement('button', 'inline-qty-btn qty-increase');
    increaseButton.dataset.productId = 'variant-1';
    const clickEvent = {
      target: increaseButton,
      stopPropagation: jest.fn(),
    };

    productGrid.listeners.click[0](clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(updates).toEqual([[0, 'variant-1', 2]]);
  });

  it('applies radio swatch changes through the delegated variant update path', () => {
    const productGrid = new FakeElement('div');
    (productGrid as any).parentNode = { replaceChild: jest.fn() };
    const product = {
      id: 'product-1',
      variantId: 'variant-1',
      selectionId: 'variant-1',
      variants: [
        { id: 'variant-1', title: 'Navy', available: true, price: 10 },
        {
          id: 'variant-2',
          title: 'Soft pink',
          available: true,
          price: 12,
          quantityAvailable: 4,
          image: { src: 'https://cdn.example/pink.jpg' },
        },
      ],
    };
    const renderModalProducts = jest.fn();
    const updateModalNavigation = jest.fn();
    const updateModalFooterMessaging = jest.fn();

    ProductPageModalMethods.attachProductEventHandlers.call({
      selectedBundle: { steps: [{}] },
      stepProductData: [[product]],
      findProductBySelectionKey: () => product,
      getSelectedQuantity: () => 0,
      renderModalProducts,
      updateModalNavigation,
      updateModalFooterMessaging,
    }, productGrid, 0);

    const input = new FakeElement('input', 'ppb-variant-selector-input');
    input.dataset.baseProductId = 'product-1';
    (input as any).value = 'variant-2';
    const changeEvent = { target: input, stopPropagation: jest.fn() };
    productGrid.listeners.change[0](changeEvent);

    expect(changeEvent.stopPropagation).toHaveBeenCalled();
    expect(product).toEqual(expect.objectContaining({
      variantId: 'variant-2',
      selectionId: 'variant-2',
      variantTitle: 'Soft pink',
      price: 12,
      quantityAvailable: 4,
      imageUrl: 'https://cdn.example/pink.jpg',
    }));
    expect(renderModalProducts).toHaveBeenCalledWith(0);
    expect(updateModalNavigation).toHaveBeenCalled();
    expect(updateModalFooterMessaging).toHaveBeenCalled();
  });

  it('keeps PPB product images informational without opening product details', () => {
    const productGrid = new FakeElement('div');
    const card = new FakeElement('div', 'product-card');
    const image = new FakeElement('div', 'product-image');
    card.dataset.productId = 'variant-1';
    card.appendChild(image);
    productGrid.appendChild(card);
    (productGrid as any).parentNode = { replaceChild: jest.fn() };
    const activateCardClickAdd = jest.fn(() => true);
    const openDetails = jest.fn();
    const product = { id: 'product-1', selectionId: 'variant-1' };

    ProductPageModalMethods.attachProductEventHandlers.call({
      selectedBundle: { steps: [{}] },
      stepProductData: [[product]],
      findProductBySelectionKey: () => product,
      getSelectedQuantity: () => 0,
      _activateProductCardClickAdd: activateCardClickAdd,
      productModal: { open: openDetails },
    }, productGrid, 0);

    const clickEvent = {
      target: image,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };
    productGrid.listeners.click.forEach(listener => listener(clickEvent));

    expect(activateCardClickAdd).not.toHaveBeenCalled();
    expect(openDetails).not.toHaveBeenCalled();
  });

  it('keeps modal card backgrounds independent from Add', () => {
    const productGrid = new FakeElement('div');
    const card = new FakeElement('div', 'product-card');
    card.dataset.productId = 'variant-1';
    productGrid.appendChild(card);
    (productGrid as any).parentNode = { replaceChild: jest.fn() };
    const activateCardClickAdd = jest.fn(() => true);
    const product = { id: 'product-1', selectionId: 'variant-1' };

    ProductPageModalMethods.attachProductEventHandlers.call({
      selectedBundle: { steps: [{}] },
      stepProductData: [[product]],
      findProductBySelectionKey: () => product,
      getSelectedQuantity: () => 0,
      _activateProductCardClickAdd: activateCardClickAdd,
    }, productGrid, 0);

    const clickEvent = {
      target: card,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
    };
    productGrid.listeners.click.forEach(listener => listener(clickEvent));

    expect(activateCardClickAdd).not.toHaveBeenCalled();
  });
});
