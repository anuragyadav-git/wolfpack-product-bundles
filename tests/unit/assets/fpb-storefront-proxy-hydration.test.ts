export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fullPageDiscountModalMethods } = require('../../../app/assets/widgets/full-page/methods/discount-modal-methods.js');

describe('FPB storefront proxy hydration', () => {
  const previousWindow = (global as any).window;

  afterEach(() => {
    if (previousWindow === undefined) {
      delete (global as any).window;
    } else {
      (global as any).window = previousWindow;
    }
  });

  it.each([
    ['/apps/product-bundles-sit/wpb/5', '/apps/product-bundles-sit'],
    ['/apps/product-bundles/wpb/5', '/apps/product-bundles'],
  ])('uses the proxy root that served %s', (pathname, expectedRoot) => {
    (global as any).window = { location: { pathname } };

    expect(fullPageDiscountModalMethods.resolveStorefrontApiBase()).toBe(expectedRoot);
  });
});
