export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageModalMethods } = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');

function createModal() {
  const dom = new JSDOM('<!doctype html><html><body><div role="dialog"><div data-product-grid></div></div></body></html>');
  const productGrid = dom.window.document.querySelector('[data-product-grid]');
  const originalDocument = (global as { document?: unknown }).document;
  (global as { document?: unknown }).document = dom.window.document;
  return {
    modal: { querySelector: (selector: string) => selector === '.product-grid' ? productGrid : null },
    productGrid,
    restore: () => { (global as { document?: unknown }).document = originalDocument; },
  };
}

describe('ProductPageModalMethods.renderModalProductsLoading', () => {
  it('renders merchant loading media as a status when configured', () => {
    const customGifUrl = 'https://cdn.shopify.com/custom-spinner.gif';
    const { modal, productGrid, restore } = createModal();
    try {
      ProductPageModalMethods.renderModalProductsLoading.call({ elements: { modal }, selectedBundle: { loadingGif: customGifUrl } }, 0);
      expect(productGrid.querySelector('[role="status"]')).not.toBeNull();
      expect(productGrid.querySelector('img')?.src).toBe(customGifUrl);
    } finally {
      restore();
    }
  });

  it('renders the default accessible loading status when media is absent', () => {
    const { modal, productGrid, restore } = createModal();
    try {
      ProductPageModalMethods.renderModalProductsLoading.call({ elements: { modal }, selectedBundle: { loadingGif: null } }, 0);
      expect(productGrid.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe('Loading products');
      expect(productGrid.querySelector('img')).toBeNull();
    } finally {
      restore();
    }
  });

  it('handles a missing product grid safely', () => {
    expect(() => ProductPageModalMethods.renderModalProductsLoading.call({
      elements: { modal: { querySelector: () => null } },
      selectedBundle: { loadingGif: null },
    }, 0)).not.toThrow();
  });
});
