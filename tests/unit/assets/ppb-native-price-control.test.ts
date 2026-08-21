// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageDomMethods } = require('../../../app/assets/widgets/product-page/methods/dom-methods.js');

describe('PPB product-page price selector control', () => {
  it('updates the configured native price element with bundle totals', () => {
    const price = { innerHTML: '', hidden: false };
    const context = {
      config: { controlsSettings: { activeControls: { selectors: { productPagePrice: '.bundle-price' } } } },
      _getProductPageControls: () => ({ selectors: { productPagePrice: '.bundle-price' } }),
      _nativeProductPriceElement: price,
    };

    ProductPageDomMethods._updateNativeProductPrice.call(context, '$80.00', '$100.00', true);

    expect(price.innerHTML).toContain('$80.00');
    expect(price.innerHTML).toContain('$100.00');
    expect(price.hidden).toBe(false);
  });

  it('hides the configured price when the bundle has no selection', () => {
    const price = { innerHTML: '', hidden: false };
    ProductPageDomMethods._updateNativeProductPrice.call({ _nativeProductPriceElement: price }, '', '', false);
    expect(price.hidden).toBe(true);
  });
});
