export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageDomMethods } = require('../../../app/assets/widgets/product-page/methods/dom-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');

describe('PPB product-page price selector control', () => {
  it('updates the configured native price element with bundle totals', () => {
    const dom = new JSDOM('<!doctype html><html><body><div data-price></div></body></html>');
    const price = dom.window.document.querySelector('[data-price]');
    const originalDocument = global.document;
    global.document = dom.window.document;
    const context = {
      config: { controlsSettings: { activeControls: { selectors: { productPagePrice: '.bundle-price' } } } },
      _getProductPageControls: () => ({ selectors: { productPagePrice: '.bundle-price' } }),
      _nativeProductPriceElement: price,
    };

    try {
      ProductPageDomMethods._updateNativeProductPrice.call(context, '$80.00', '$100.00', true);
    } finally {
      global.document = originalDocument;
    }

    expect(price?.textContent).toContain('$80.00');
    expect(price?.textContent).toContain('$100.00');
    expect(price.hidden).toBe(false);
  });

  it('hides the configured price when the bundle has no selection', () => {
    const price = new JSDOM('<!doctype html><html><body><div data-price>stale</div></body></html>').window.document.querySelector('[data-price]');
    ProductPageDomMethods._updateNativeProductPrice.call({ _nativeProductPriceElement: price }, '', '', false);
    expect(price.hidden).toBe(true);
    expect(price.textContent).toBe("");
  });
});
