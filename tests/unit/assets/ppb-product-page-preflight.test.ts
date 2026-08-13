export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageCartMethods } = require('../../../app/assets/widgets/product-page/methods/cart-methods.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PricingCalculator } = require('../../../app/assets/widgets/shared/pricing-calculator.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CurrencyManager } = require('../../../app/assets/widgets/shared/currency-manager.js');

globalThis.PricingCalculator = PricingCalculator;
globalThis.CurrencyManager = CurrencyManager;

const MONEY_FORMAT = ['$','{{amount}}'].join('');
globalThis.window = {
  Shopify: {
    currency: {
      active: 'USD',
      format: MONEY_FORMAT,
    },
  },
  shopMoneyFormat: MONEY_FORMAT,
};

function createButton() {
  return {
    disabled: false,
    textContent: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(),
    },
  } as any;
}

describe('PPB product-page preflight validation', () => {
  it('blocks add to cart when storefront preflight returns non-200 for any selected variant', async () => {
    const fetchMock = jest.fn(async (url: string) => {
      if (url === '/variants/101.js') {
        return {
          ok: false,
          status: 404,
          json: async () => ({}),
        } as any;
      }
      throw new Error(`Unexpected fetch to ${url}`);
    });
    const originalFetch = global.fetch;
    const originalWindow = global.window;
    const originalDocument = (global as any).document;
    const originalGetComputedStyle = (global as any).getComputedStyle;
    const originalSetTimeout = (global as any).setTimeout;
    global.fetch = fetchMock as any;
    (global as any).document = {
      documentElement: {},
      getElementById: () => null,
      createElement: () => ({
        id: '',
        className: '',
        innerHTML: '',
        remove: jest.fn(),
        querySelector: () => ({ addEventListener: jest.fn() }),
      }),
      body: { appendChild: jest.fn() },
    };
    (global as any).getComputedStyle = () => ({
      getPropertyValue: () => '',
    });
    (global as any).setTimeout = jest.fn();

    try {
      await ProductPageCartMethods.addToCart.call({
        ...ProductPageCartMethods,
        selectedProducts: [{
          'gid://shopify/ProductVariant/101': 1,
        }],
        stepProductData: [[{
          selectionId: 'gid://shopify/ProductVariant/101',
          variantId: 'gid://shopify/ProductVariant/101',
          id: 'gid://shopify/ProductVariant/101',
          price: 82900,
          title: 'Test variant',
          variants: [{ selectionId: 'gid://shopify/ProductVariant/101', id: 'gid://shopify/ProductVariant/101' }],
        }]],
        selectedBundle: {
          id: 'bundle-1',
          steps: [{ id: 'productsData1' }],
          pricing: { enabled: false },
        },
        elements: {
          addToCartButton: createButton(),
        },
        hideLoadingOverlay: jest.fn(),
        showLoadingOverlay: jest.fn(),
        updateAddToCartButton: jest.fn(),
        resolveProductPageOfferId: () => 'MIX-1',
        generateBundleSessionKey: () => 'K1K',
        _getProductPageControls: () => ({}),
        _resolveText: (_key: string, fallback: string) => fallback,
        _handlePostAddToCartAction: jest.fn(),
        syncBundleDetailsCartMetafield: jest.fn(),
        validateProductPageBoxSelectionCheckout: () => ({ valid: true, totalQuantity: 1, targetQuantity: null, difference: 0 }),
        validateStep: () => true,
        buildCartItems: () => [{
          id: 'gid://shopify/ProductVariant/101',
          quantity: 1,
          properties: {},
          _wpbProductId: 'gid://shopify/Product/1',
        }],
        requestCartTransformRuntimeToken: jest.fn(),
        buildProductPageCartFormData: jest.fn(),
        getDiscountInfoWithSelectedAddonDiscount(value: unknown) {
          return value;
        },
      } as any);
    } finally {
      global.fetch = originalFetch;
      global.window = originalWindow;
      (global as any).document = originalDocument;
      (global as any).getComputedStyle = originalGetComputedStyle;
      (global as any).setTimeout = originalSetTimeout;
    }

    expect(fetchMock).toHaveBeenCalledWith('/variants/101.js', expect.objectContaining({
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }));
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/apps/onlybundles/api/cart-transform-runtime-token',
      expect.any(Object),
    );
  });
});
