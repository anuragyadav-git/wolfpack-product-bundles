export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  ProductPageModalMethods,
  resolveProductPageCardButtonText,
  resolveProductPageInlineAddText,
} = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');

describe('PPB product card button copy', () => {
  it('interpolates selected quantity tokens instead of rendering raw template copy', () => {
    expect(resolveProductPageCardButtonText({
      currentQuantity: 1,
      currentStep: { addonReplaceText: 'Added x{{allowedQuantity}}' },
      outOfStock: false,
      defaultAddText: 'Add to Cart',
    })).toBe('Added x1');
  });

  it('keeps PPB modal add copy for unselected products', () => {
    expect(resolveProductPageCardButtonText({
      currentQuantity: 0,
      currentStep: {},
      outOfStock: false,
      defaultAddText: 'Add to Cart',
    })).toBe('Add to Cart');
  });

  it('uses quantity-aware selected copy when no replacement text is configured', () => {
    expect(resolveProductPageCardButtonText({
      currentQuantity: 2,
      currentStep: {},
      outOfStock: false,
      defaultAddText: 'Add to Cart',
    })).toBe('Added x2');
  });

  it('uses the configured out-of-stock copy', () => {
    expect(resolveProductPageCardButtonText({
      currentQuantity: 0,
      currentStep: {},
      outOfStock: true,
      outOfStockText: 'Sold Out Here',
      defaultAddText: 'Add to Cart',
    })).toBe('Sold Out Here');
  });

  it('resolves PPB inline product-card add copy before modal add copy', () => {
    const resolveText = jest.fn((key: string, fallback: string) => ({
      productCardAddButton: 'Modal Add',
      productCardInlineAddButton: 'Inline Add +',
    } as Record<string, string>)[key] || fallback);

    expect(resolveProductPageInlineAddText(resolveText)).toBe('Inline Add +');
  });

  it('falls back to modal product-card add copy for inline cards', () => {
    const resolveText = jest.fn((key: string, fallback: string) => ({
      productCardAddButton: 'Modal Add',
    } as Record<string, string>)[key] || fallback);

    expect(resolveProductPageInlineAddText(resolveText)).toBe('Modal Add');
  });

  it('renders the active Product Page variant label on variant selectors', () => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const originalDocument = global.document;
    global.document = dom.window.document;
    const selector = ProductPageModalMethods.renderVariantSelector.call(
      {
        _resolveText: (key: string, fallback: any) => (key === 'productVariantLabel' ? 'Choose Variant' : fallback),
        isInventoryTrackingOnAddToCartEnabled: () => false,
      },
      {
        id: 'product-1',
        variantId: 'variant-1',
        variants: [
          { id: 'variant-1', title: 'Small', available: true },
          { id: 'variant-2', title: 'Large', available: true },
        ],
      },
    );
    global.document = originalDocument;

    expect(selector.querySelector('[aria-label="Choose Variant"]')).not.toBeNull();
    expect(selector.textContent).toMatch(/Choose Variant/);
  });
});
