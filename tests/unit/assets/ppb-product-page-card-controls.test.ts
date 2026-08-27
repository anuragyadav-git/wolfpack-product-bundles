export {};

const { JSDOM } = require('jsdom');

const { ProductPageConfigLifecycleMethods } = require('../../../app/assets/widgets/product-page/methods/config-lifecycle-methods.js');
const { ProductPageInpageRenderMethods } = require('../../../app/assets/widgets/product-page/methods/inpage-render-methods.js');
const { ProductPageModalMethods } = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');

function createTarget() {
  return document.createElement('div');
}

const originalDocument = global.document;

beforeEach(() => {
  global.document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
});

afterEach(() => {
  global.document = originalDocument;
});

function createBaseContext(overrides: Record<string, unknown> = {}) {
  return {
    config: {},
    container: { dataset: {} },
    selectedBundle: {
      steps: [{}],
      validateQuantityPerProduct: null,
    },
    stepProductData: [[{ id: 'variant-1', price: 1200, title: 'Card product' }]],
    selectedProducts: [{}],
    selectedProductCategoryIndexes: {},
    activeInpageCategoryIndexes: {},
    normalizeSelectionKey: (value: unknown) => String(value || ''),
    getSelectedQuantity: () => 0,
    getVariantAvailable: () => ({ available: null, outOfStock: false }),
    _filterProductsForInpageCategory: (_currentStep: Record<string, unknown>, products: unknown[]) => products,
    _isProductPageCascadeTemplate: () => false,
    _isProductPageGridTemplate: () => false,
    _usesCompactInpageProductCards: () => false,
    _shouldShowProductComparedAtPrice: () => false,
    _resolveText: (_key: string, fallback: string) => fallback,
    resolveProductPageStepText: (_step: unknown, fallback: string) => fallback,
    renderInlineCardVariantSelector: () => '',
    attachProductEventHandlers: jest.fn(),
    normalizeTitle: (value: unknown) => String(value || ''),
    ...overrides,
  };
}

describe('PPB card control setting parsing', () => {
  it('reads canonical controls for quantity-input visibility and defaults to dataset when absent', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      container: {
        dataset: {},
      },
      config: {
        controlsSettings: {
          activeControls: {
            showQuantitySelectorOnCard: 'false',
          },
        },
      },
    } as any;

    context.parseConfiguration();
    expect(context.config.showQuantitySelectorOnCard).toBe(false);

    context.config.controlsSettings.activeControls.showQuantitySelectorOnCard = 'true';
    context.parseConfiguration();
    expect(context.config.showQuantitySelectorOnCard).toBe(true);
  });

  it('reads canonical see-more and hover controls', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      container: {
        dataset: {},
      },
      config: {
        controlsSettings: {
          activeControls: {
            displaySeeMoreLink: 'true',
            expandProductCardOnHover: '1',
          },
        },
      },
    } as any;

    context.parseConfiguration();
    expect(context.config.displaySeeMoreLink).toBe(true);
    expect(context.config.expandProductCardOnHover).toBe(true);
  });

  it('falls back to dataset quantity setting when controls are absent', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      container: {
        dataset: { showQuantitySelectorOnCard: 'false' },
      },
      config: {
        controlsSettings: {},
      },
    } as any;

    context.parseConfiguration();
    expect(context.config.showQuantitySelectorOnCard).toBe(false);
  });
});

describe('PPB in-page rendering control wiring', () => {
  function renderSelectedGridCard(validateQuantityPerProduct: Record<string, unknown>) {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        selectedBundle: {
          steps: [{}],
          validateQuantityPerProduct,
        },
        selectedProducts: [{ 'variant-1': 1 }],
        _isProductPageGridTemplate: () => true,
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);
    return target.innerHTML;
  }

  it('uses the selected button for Product Grid when quantity validation is enabled at one', () => {
    const html = renderSelectedGridCard({ isEnabled: true, allowedQuantity: 1 });

    expect(html).toContain('Added x1');
    expect(html).not.toContain('Decrease quantity');
  });

  it('renders Product Grid inline quantity controls when quantity validation is disabled', () => {
    const html = renderSelectedGridCard({ isEnabled: false, allowedQuantity: 1 });

    expect(html).toContain('Remove Card product');
    expect(html).toContain('Increase quantity');
    expect(html).not.toContain('Added x1');
  });

  it('renders Product Grid inline controls and gates increment at a configured maximum above one', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        selectedBundle: {
          steps: [{}],
          validateQuantityPerProduct: { isEnabled: true, allowedQuantity: 3 },
        },
        selectedProducts: [{ 'variant-1': 3 }],
        _isProductPageGridTemplate: () => true,
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.querySelector('[aria-label^="Decrease quantity"]')).not.toBeNull();
    const increase = target.querySelector('button[aria-label^="Increase quantity"]') as HTMLButtonElement;
    expect(increase.disabled).toBe(true);
    expect(increase.getAttribute('aria-disabled')).toEqual('true');
    expect(target.textContent).not.toMatch(/Added x3/);
  });

  it.each([
    ['Product List', true],
    ['generic in-page rows', false],
  ])('omits populated product descriptions from %s', (_template, usesCascade) => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        config: {
          displaySeeMoreLink: true,
          expandProductCardOnHover: true,
        },
        stepProductData: [[{
          id: 'variant-with-description',
          price: 1200,
          title: 'Described product',
          description: 'Merchant description must stay hidden.',
          descriptionHtml: '<p>Merchant <strong>HTML</strong> description must stay hidden.</p>',
        }]],
        _isProductPageCascadeTemplate: () => usesCascade,
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).not.toContain('Merchant description must stay hidden.');
    expect(target.innerHTML).not.toContain('Merchant &lt;strong&gt;HTML&lt;/strong&gt; description');
    expect(target.innerHTML).not.toContain('bw-product-card__description');
    expect(target.innerHTML).not.toContain('bw-product-card__see-more');
  });

  it('omits empty Shopify HTML descriptions from product cards', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        config: {
          displaySeeMoreLink: true,
        },
        stepProductData: [[{
          id: 'variant-empty-description',
          price: 1200,
          title: 'Empty description product',
          description: '',
          descriptionHtml: '<p></p>',
        }]],
        _isProductPageCascadeTemplate: () => true,
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).not.toContain('bw-product-card__description');
    expect(target.innerHTML).not.toContain('&lt;p&gt;&lt;/p&gt;');
  });

  it('omits row quantity selectors when the showQuantitySelectorOnCard control is disabled', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        config: {
          showQuantitySelectorOnCard: false,
        },
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).toContain('product-add-btn');
    expect(target.innerHTML).not.toContain('product-quantity-wrapper');
  });

  it('uses shared card button flow when showQuantitySelectorOnCard is enabled', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        config: {
          showQuantitySelectorOnCard: true,
        },
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).toContain('product-add-btn');
    expect(target.innerHTML).toContain('bw-product-card--legacy');
  });

  it('disables Grid add button for out-of-stock products', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        _isProductPageGridTemplate: () => true,
        _isProductPageCascadeTemplate: () => false,
        stepProductData: [[
          {
            id: 'variant-out-of-stock',
            variantId: 'variant-001',
            price: 1200,
            title: 'Out of Stock Product',
          },
        ]],
        getVariantAvailable: () => ({ available: null, outOfStock: true }),
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).toContain('product-add-btn');
    expect(target.innerHTML).toContain('disabled');
    expect(target.innerHTML).toContain('aria-disabled="true"');
    expect(target.textContent).toMatch(/Out of Stock/);
  });

  it('uses selectionId as the shared card identity key in in-page rendering', () => {
    const target = createTarget();
    const context = {
      ...ProductPageInpageRenderMethods,
      ...createBaseContext({
        stepProductData: [[{
          id: 'product-legacy-id',
          selectionId: 'selection-id-xyz',
          variantId: 'variant-legacy-id',
          price: 1200,
          title: 'Selection-id product',
        }]],
        _isProductPageGridTemplate: () => false,
        _isProductPageCascadeTemplate: () => false,
      }),
    } as any;

    ProductPageInpageRenderMethods._renderInpageStepProducts.call(context, 0, target);

    expect(target.innerHTML).toContain('data-product-id="selection-id-xyz"');
    expect(target.innerHTML).toContain('data-current-selected-variant-id="selection-id-xyz"');
  });
});

describe('PPB modal product-card description wiring', () => {
  it('uses the shared product card markup in modal views', () => {
    const productGrid = document.createElement('div');

    const context = {
      ...ProductPageModalMethods,
      config: { showQuantitySelectorOnCard: false, displaySeeMoreLink: true, expandProductCardOnHover: true },
      selectedBundle: { steps: [{}], validateQuantityPerProduct: null },
      stepProductData: [[{
        id: 'modal-shared-card',
        imageUrl: '/shared-card.png',
        price: 1200,
        title: 'Modal shared card product',
        description: 'Hidden product description',
      }]],
      selectedProducts: [{}],
      activeInpageCategoryIndexes: {},
      elements: {
        modal: {
          querySelector: (selector: string) => {
            if (selector === '.product-grid') return productGrid;
            if (selector === '.bw-bs-body') return { querySelector: () => null };
            return null;
          },
        },
      },
      _filterProductsForInpageCategory: (_step: unknown, products: unknown[]) => products,
      expandProductsByVariant: (products: unknown[]) => products,
      getSelectedQuantity: () => 0,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
      _shouldShowProductComparedAtPrice: () => false,
      _resolveText: (_key: string, fallback: string) => fallback,
      renderVariantSelector: () => document.createElement('select'),
      attachProductEventHandlers: jest.fn(),
    } as any;

    ProductPageModalMethods.renderModalProducts.call(context, 0);

    expect(productGrid.innerHTML).toContain('data-bw-product-card="true"');
    expect(productGrid.innerHTML).toContain('bw-product-card--mode-grid');
    expect(productGrid.innerHTML).toContain('product-add-btn');
    expect(productGrid.innerHTML).not.toContain('bw-product-card__description');
  });

  it('omits populated descriptions from Horizontal and Vertical Slots product cards', () => {
    const productGrid = document.createElement('div');
    const context = {
      ...ProductPageModalMethods,
      config: { displaySeeMoreLink: true, expandProductCardOnHover: true },
      selectedBundle: { steps: [{}], validateQuantityPerProduct: null },
      stepProductData: [[{
        id: 'modal-with-description',
        imageUrl: '/described-product.png',
        price: 1200,
        title: 'Modal described product',
        description: 'Modal merchant description must stay hidden.',
        descriptionHtml: '<p>Modal merchant HTML description must stay hidden.</p>',
      }]],
      selectedProducts: [{}],
      activeInpageCategoryIndexes: {},
      elements: {
        modal: {
          querySelector: (selector: string) => {
            if (selector === '.product-grid') return productGrid;
            if (selector === '.bw-bs-body') return { querySelector: () => null };
            return null;
          },
        },
      },
      _filterProductsForInpageCategory: (_step: unknown, products: unknown[]) => products,
      expandProductsByVariant: (products: unknown[]) => products,
      getSelectedQuantity: () => 0,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
      _shouldShowProductComparedAtPrice: () => false,
      _resolveText: (_key: string, fallback: string) => fallback,
      renderVariantSelector: () => document.createElement('select'),
      attachProductEventHandlers: jest.fn(),
    } as any;

    ProductPageModalMethods.renderModalProducts.call(context, 0);

    expect(productGrid.innerHTML).not.toContain('Modal merchant description must stay hidden.');
    expect(productGrid.innerHTML).not.toContain('bw-product-card__description');
    expect(productGrid.innerHTML).not.toContain('bw-product-card__see-more');
  });

  it('omits empty Shopify HTML descriptions from modal product cards', () => {
    const productGrid = document.createElement('div');
    const context = {
      ...ProductPageModalMethods,
      config: { displaySeeMoreLink: true },
      selectedBundle: { steps: [{}], validateQuantityPerProduct: null },
      stepProductData: [[{
        id: 'modal-empty-description',
        imageUrl: '/empty-description.png',
        price: 1200,
        title: 'Modal empty description product',
        description: '',
        descriptionHtml: '<p></p>',
      }]],
      selectedProducts: [{}],
      activeInpageCategoryIndexes: {},
      elements: {
        modal: {
          querySelector: (selector: string) => {
            if (selector === '.product-grid') return productGrid;
            if (selector === '.bw-bs-body') return { querySelector: () => null };
            return null;
          },
        },
      },
      _filterProductsForInpageCategory: (_step: unknown, products: unknown[]) => products,
      expandProductsByVariant: (products: unknown[]) => products,
      getSelectedQuantity: () => 0,
      getVariantAvailable: () => ({ available: null, outOfStock: false }),
      _shouldShowProductComparedAtPrice: () => false,
      _resolveText: (_key: string, fallback: string) => fallback,
      renderVariantSelector: () => document.createElement('select'),
      attachProductEventHandlers: jest.fn(),
    } as any;

    ProductPageModalMethods.renderModalProducts.call(context, 0);

    expect(productGrid.innerHTML).not.toContain('bw-product-card__description');
    expect(productGrid.innerHTML).not.toContain('&lt;p&gt;&lt;/p&gt;');
  });
});
