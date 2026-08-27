export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { VariantSelectorComponent } = require('../../../app/assets/widgets/shared/variant-selector.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');

describe('FPB Standard mobile variant drawer', () => {
  it('renders drawer content from variant data and formatted prices', () => {
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const view = VariantSelectorComponent.createStandardMobileDrawerElement({
      title: 'Keto Fresh Meal Subscription',
      imageUrl: 'https://cdn.example.com/product.jpg',
      variantId: 'variant-6',
      price: 9540,
      variants: [
        {
          id: 'variant-6',
          title: '6 meals',
          option1: '6 meals',
          price: 9540,
          available: true,
          imageUrl: 'https://cdn.example.com/6.jpg',
        },
        {
          id: 'variant-7',
          title: '7 meals',
          option1: '7 meals',
          price: 11130,
          available: false,
          imageUrl: 'https://cdn.example.com/7.jpg',
        },
      ],
    }, {
      placeholder: 'Choose Options',
      formatPrice: (value: number) => `$${(value / 100).toFixed(2)}`,
      document: runtimeDocument,
    });

    expect(view.textContent).toMatch(/Keto Fresh Meal Subscription/);
    expect(view.textContent).toMatch(/Choose Options/);
    expect(view.textContent).toMatch(/6 meals/);
    expect(view.textContent).toMatch(/\$95\.40/);
    expect(view.textContent).toMatch(/7 meals/);
    expect(view.textContent).toMatch(/\$111\.30/);
    expect(view.querySelector('[aria-disabled="true"]')).not.toBeNull();
    expect(view.querySelector('[aria-label="Close variant selector"]')).not.toBeNull();
    expect(view.textContent).not.toMatch(/undefined/);
  });
});
