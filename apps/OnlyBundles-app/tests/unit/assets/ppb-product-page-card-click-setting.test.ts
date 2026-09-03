// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageConfigLifecycleMethods } = require('../../../app/assets/widgets/product-page/methods/config-lifecycle-methods.js');

describe('PPB product page card click setting', () => {
  it('defaults to disabled when controls settings are missing', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: {},
    };

    expect(context._isProductCardClickAddEnabled()).toBe(false);
  });

  it('reads the active controls card-click toggle', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: {
        controlsSettings: {
          activeControls: {
            addToCartWhenProductCardClicked: true,
          },
        },
      },
    };

    expect(context._isProductCardClickAddEnabled()).toBe(true);
  });

  it('falls back to settings-controls product-page path', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: {
        controlsSettings: {
          settingsControls: {
            productPage: {
              addToCartWhenProductCardClicked: true,
            },
          },
        },
      },
    };

    expect(context._isProductCardClickAddEnabled()).toBe(true);
  });

  it('parses validateConditionsBeforeAddToCart string flags correctly', () => {
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: {
        controlsSettings: {
          activeControls: {
            validateConditionsBeforeAddToCart: 'false',
          },
        },
      },
    };

    expect(context._isConditionValidationEnabled()).toBe(false);
  });

  it('activates the existing add action for a non-interactive card click', () => {
    const click = jest.fn();
    const card = { querySelector: jest.fn(() => ({ click })) };
    const target = { closest: jest.fn((selector: string) => selector === '.product-card' ? card : null) };
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: { controlsSettings: { activeControls: { addToCartWhenProductCardClicked: true } } },
    };

    expect(context._activateProductCardClickAdd(target)).toBe(true);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('does not hijack form-control clicks', () => {
    const target = { closest: jest.fn((selector: string) => selector.includes('button') ? {} : null) };
    const context = {
      ...ProductPageConfigLifecycleMethods,
      config: { controlsSettings: { activeControls: { addToCartWhenProductCardClicked: true } } },
    };

    expect(context._activateProductCardClickAdd(target)).toBe(false);
  });
});
export {};
