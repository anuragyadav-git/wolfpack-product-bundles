// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageConfigLifecycleMethods } = require('../../../app/assets/widgets/product-page/methods/config-lifecycle-methods.js');

function makeContext(productPageControls: Record<string, any> = {}) {
  return {
    config: {
      controlsSettings: {
        settingsControls: {
          productPage: productPageControls,
        },
      },
    },
    _getProductPageControls: ProductPageConfigLifecycleMethods._getProductPageControls,
    _runControlsScript: ProductPageConfigLifecycleMethods._runControlsScript,
    _refreshConfiguredCartSection: jest.fn(async () => false),
  };
}

function resetUrl(path = '/products/test-bundle') {
  (global as any).window.location.href = `https://example.test${path}`;
}

function currentPathname() {
  return new URL((global as any).window.location.href, 'https://example.test').pathname;
}

describe('Product Page post-add redirect handling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (global as any).window = {
      location: { href: 'https://example.test/products/test-bundle' },
    };
    (global as any).document = {
      querySelector: jest.fn(),
    };
    resetUrl();
    delete (global as any).window.__ppbRedirectScript;
    delete (global as any).window.__ppbCustomScript;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    delete (global as any).window;
    delete (global as any).document;
  });

  it('redirects to checkout when the saved Product Page redirect mode is checkout', () => {
    ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      makeContext(),
      { action: 'checkout' },
    );

    expect(currentPathname()).toBe('/products/test-bundle');

    jest.advanceTimersByTime(1000);

    expect(currentPathname()).toBe('/checkout');
  });

  it('redirects to cart when the saved Product Page redirect mode is cart', async () => {
    await ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      makeContext(),
      { action: 'cart' },
    );

    jest.advanceTimersByTime(1000);

    expect(currentPathname()).toBe('/cart');
  });

  it('clicks the configured side-cart trigger when the saved Product Page redirect mode is side_cart', async () => {
    const clickSpy = jest.fn();
    (global as any).document.querySelector.mockReturnValue({ click: clickSpy });

    await ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      makeContext(),
      {
        action: 'side_cart',
        selectors: { sideCartOpenButton: '.open-cart' },
      },
    );

    jest.advanceTimersByTime(300);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect((global as any).document.querySelector).toHaveBeenCalledWith('.open-cart');
    expect(currentPathname()).toBe('/products/test-bundle');
  });

  it('uses Shopify standard actions before selector-based side-cart handling', async () => {
    const updateCart = jest.fn(async () => ({ cart: { id: 'cart-1' } }));
    const openCart = jest.fn(async () => undefined);
    (global as any).window.Shopify = {
      actions: {
        updateCart,
        openCart,
      },
    };

    await ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      makeContext(),
      { action: 'side_cart' },
      'ppb-session-1',
    );

    expect(updateCart).toHaveBeenCalledTimes(1);
    expect(openCart).toHaveBeenCalledTimes(1);
    expect((global as any).document.querySelector).not.toHaveBeenCalled();
  });

  it('runs only the redirect script during the post-add action', async () => {
    await ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      makeContext({
        scripts: {
          executeCustomScript: 'window.__ppbCustomScript = (window.__ppbCustomScript || 0) + 1;',
        },
      }),
      {
        action: 'cart',
        executeScript: 'window.__ppbRedirectScript = (window.__ppbRedirectScript || 0) + 1;',
      },
    );

    expect((global as any).window.__ppbRedirectScript).toBe(1);
    expect((global as any).window.__ppbCustomScript).toBeUndefined();

    jest.advanceTimersByTime(1000);

    expect(currentPathname()).toBe('/cart');
  });

  it('runs the product-page load script once', () => {
    const context = makeContext({
      scripts: { executeCustomScript: 'window.__ppbCustomScript = (window.__ppbCustomScript || 0) + 1;' },
    });

    ProductPageConfigLifecycleMethods._runProductPageLoadScriptOnce.call(context);
    ProductPageConfigLifecycleMethods._runProductPageLoadScriptOnce.call(context);

    expect((global as any).window.__ppbCustomScript).toBe(1);
  });

  it('refreshes configured side-cart markup before opening it', async () => {
    const context = makeContext({ selectors: { sideCartOpenButton: '.open-cart' } });
    context._refreshConfiguredCartSection.mockResolvedValue(true);
    (global as any).document.querySelector.mockReturnValue({ click: jest.fn() });

    await ProductPageConfigLifecycleMethods._handlePostAddToCartAction.call(
      context,
      { action: 'side_cart' },
    );

    expect(context._refreshConfiguredCartSection).toHaveBeenCalledWith('side_cart');
  });
});
export {};
