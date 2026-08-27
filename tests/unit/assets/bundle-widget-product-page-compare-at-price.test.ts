import { resolveShowProductComparedAtPrice } from '../../../app/lib/bundle-config/product-page-display';
import { createSharedProductCardElement } from '../../../app/assets/widgets/shared/components/product-card';
import { JSDOM } from 'jsdom';
import { applyProductPageVariantSelection } from '../../../app/assets/widgets/product-page/methods/modal-methods';

describe('PPB compare-at price visibility contract', () => {
  it('keeps compare-at capability enabled regardless of persisted bundle settings', () => {
    expect(resolveShowProductComparedAtPrice()).toBe(true);
  });

  it('renders available product compare-at data even when a stale flag is false', () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const card = createSharedProductCardElement(
      { selectionId: 'variant-1', title: 'Sale product', price: 800, compareAtPrice: 1000 },
      0,
      { currencySymbol: '$', decimalPlaces: 2 },
      { showCompareAtPrice: false, document },
    );

    expect(card.textContent).toMatch(/\$10\.00/);
    expect(card.textContent).toMatch(/\$8\.00/);
  });

  it('does not fabricate a compare-at price for regular products', () => {
    const document = new JSDOM('<!doctype html>').window.document;
    const card = createSharedProductCardElement(
      { selectionId: 'variant-1', title: 'Regular product', price: 800 },
      0,
      { currencySymbol: '$', decimalPlaces: 2 },
      { showCompareAtPrice: true, document },
    );

    expect(card.textContent).toMatch(/\$8\.00/);
    expect(card.textContent).not.toMatch(/\$10\.00/);
  });

  it('updates compare-at text when a selected variant provides it', () => {
    const compareElement = { textContent: '', remove: jest.fn() };
    const productCard = {
      dataset: {},
      querySelectorAll: () => [],
      querySelector: (selector: string) => selector === '.product-price-strike'
        ? compareElement
        : null,
    };

    applyProductPageVariantSelection({
      product: { id: 'product-1', price: 800 },
      variantData: { id: 'variant-2', price: 800, compareAtPrice: 1000 },
      productCard,
      formatPrice: (price: number) => `$${(price / 100).toFixed(2)}`,
      showCompareAtPrice: false,
    });

    expect(compareElement.textContent).toContain('$10.00');
    expect(compareElement.remove).not.toHaveBeenCalled();
  });
});
