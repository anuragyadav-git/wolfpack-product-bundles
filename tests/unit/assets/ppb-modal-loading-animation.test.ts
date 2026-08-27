export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  ProductPageModalMethods,
} = require('../../../app/assets/widgets/product-page/methods/modal-methods.js');

type MockElement = {
  innerHTML: string;
  className: string;
  querySelector: (selector: string) => MockElement | null;
  querySelectorAll: (selector: string) => MockElement[];
};

function createMockModal(gridInitialHtml = ''): { modal: MockElement; productGrid: MockElement } {
  const productGrid: MockElement = {
    innerHTML: gridInitialHtml,
    className: 'product-grid bw-bs-product-grid',
    querySelector(selector: string) {
      if (selector === '.bw-bs-modal-loading' && this.innerHTML.includes('bw-bs-modal-loading')) {
        return { innerHTML: this.innerHTML, className: 'bw-bs-modal-loading', querySelector: () => null, queryAll: () => [] } as any;
      }
      if (selector === '.bundle-loading-overlay__gif' && this.innerHTML.includes('bundle-loading-overlay__gif')) {
        return { innerHTML: '', className: 'bundle-loading-overlay__gif', querySelector: () => null, queryAll: () => [] } as any;
      }
      if (selector === '.bundle-loading-overlay__spinner' && this.innerHTML.includes('bundle-loading-overlay__spinner')) {
        return { innerHTML: '', className: 'bundle-loading-overlay__spinner', querySelector: () => null, queryAll: () => [] } as any;
      }
      return null;
    },
    querySelectorAll(selector: string) {
      if (selector === '.skeleton-loading' && this.innerHTML.includes('skeleton-loading')) {
        return [{ innerHTML: '', className: 'skeleton-loading' }] as any;
      }
      return [];
    },
  };

  const modal: MockElement = {
    innerHTML: '',
    className: 'bw-bs-panel bundle-builder-modal',
    querySelector(selector: string) {
      if (selector === '.product-grid') {
        return productGrid;
      }
      return null;
    },
    querySelectorAll: () => [],
  };

  return { modal, productGrid };
}

describe('ProductPageModalMethods.renderModalProductsLoading', () => {
  it('renders merchant loading GIF inside modal when loadingGif is configured', () => {
    const customGifUrl = 'https://cdn.shopify.com/custom-spinner.gif';
    const { modal, productGrid } = createMockModal();
    const widgetContext = {
      elements: { modal },
      selectedBundle: { loadingGif: customGifUrl },
    };

    ProductPageModalMethods.renderModalProductsLoading.call(widgetContext, 0);

    expect(productGrid.innerHTML).toContain('bw-bs-modal-loading');
    expect(productGrid.innerHTML).toContain('bundle-loading-overlay__gif');
    expect(productGrid.innerHTML).toContain(customGifUrl);
    expect(productGrid.innerHTML).not.toContain('skeleton-loading');
    expect(productGrid.querySelectorAll('.skeleton-loading')).toHaveLength(0);
  });

  it('renders default CSS loading spinner inside modal when loadingGif is null/empty', () => {
    const { modal, productGrid } = createMockModal();
    const widgetContext = {
      elements: { modal },
      selectedBundle: { loadingGif: null },
    };

    ProductPageModalMethods.renderModalProductsLoading.call(widgetContext, 0);

    expect(productGrid.innerHTML).toContain('bw-bs-modal-loading');
    expect(productGrid.innerHTML).toContain('bundle-loading-overlay__spinner');
    expect(productGrid.innerHTML).not.toContain('bundle-loading-overlay__gif');
    expect(productGrid.innerHTML).not.toContain('skeleton-loading');
    expect(productGrid.querySelectorAll('.skeleton-loading')).toHaveLength(0);
  });

  it('handles missing productGrid safely without throwing an exception', () => {
    const emptyModal: MockElement = {
      innerHTML: '',
      className: 'bw-bs-panel bundle-builder-modal',
      querySelector: () => null,
      querySelectorAll: () => [],
    };
    const widgetContext = {
      elements: { modal: emptyModal },
      selectedBundle: { loadingGif: null },
    };

    expect(() => {
      ProductPageModalMethods.renderModalProductsLoading.call(widgetContext, 0);
    }).not.toThrow();
  });
});
