export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require('jsdom');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageModalProductMethods } = require('../../../app/assets/widgets/full-page/methods/modal-product-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageProductCardFooterMethods } = require('../../../app/assets/widgets/full-page/methods/product-card-footer-methods.js');

describe('FPB low-stock alert rendering', () => {
  it('renders merchant low-stock copy on the full-page product card', () => {
    const previousDocument = global.document;
    const runtimeDocument = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    global.document = runtimeDocument;

    try {
      const card = fullPageProductCardFooterMethods.createProductCard.call(
        {
          selectedProducts: [{}],
          selectedBundle: {
            variantSelectorEnabled: false,
            steps: [{}],
            lowStockAlert: {
              enabled: true,
              threshold: 5,
              message: 'Only {{stock}} remaining',
            },
          },
          getFullPageDesignPreset: () => 'STANDARD',
          buildPaidAddonProductDisplayData: (product: unknown) => product,
          isVariantOutOfStock: () => false,
          getProductCardAddButtonText: () => 'Add',
          applyStandardExpandedVariantTitle: () => undefined,
          attachProductCardListeners: () => undefined,
        },
        {
          id: 'variant-low-stock',
          selectionId: 'variant-low-stock',
          title: 'Low stock product',
          price: 1200,
          imageUrl: 'https://cdn.example.test/product.jpg',
          available: true,
          quantityAvailable: 3,
          currentlyNotInStock: false,
        },
        0,
      );

      expect(card.textContent).toContain('Only 3 remaining');
    } finally {
      global.document = previousDocument;
    }
  });

  it('renders the normalized Shopify variant quantity for a grouped product card', () => {
    const previousDocument = global.document;
    const runtimeDocument = new JSDOM('<!doctype html><html><body><div id="modal"><div class="product-grid"></div></div></body></html>').window.document;
    global.document = runtimeDocument;
    const modal = runtimeDocument.querySelector('#modal');

    const context = {
      selectedBundle: {
        steps: [{}],
        lowStockAlert: {
          enabled: true,
          threshold: 5,
          message: 'Only {{stock}} remaining',
        },
      },
      stepProductData: [[{
        id: 'gid://shopify/Product/1',
        selectionId: 'gid://shopify/ProductVariant/2',
        title: 'Grouped product',
        price: 1200,
        available: true,
        quantityAvailable: 3,
        currentlyNotInStock: false,
        variants: [{
          id: 'gid://shopify/ProductVariant/2',
          selectionId: 'gid://shopify/ProductVariant/2',
          title: 'Default Title',
          available: true,
        }],
      }]],
      selectedProducts: [{}],
      elements: { modal },
      renderVariantSelector: () => null,
      getVariantAvailable: () => ({ available: 3, outOfStock: false }),
      getProductAddButtonText: () => 'Add',
      attachProductEventHandlers: jest.fn(),
    };

    try {
      fullPageModalProductMethods.renderModalProducts.call(context, 0);

      expect(modal?.textContent).toContain('Only 3 remaining');
    } finally {
      global.document = previousDocument;
    }
  });
});
