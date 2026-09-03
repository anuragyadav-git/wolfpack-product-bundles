import { fullPageAnalyticsConfigMethods } from '../../../app/assets/widgets/full-page/methods/analytics-config-methods';

describe("FPB runtime config surface", () => {
  it("parses only supported storefront display settings", () => {
    const originalWindow = global.window;
    global.window = {} as Window & typeof globalThis;
    const context = {
      container: {
        dataset: {
          bundleId: 'bundle-1',
          promoBannerSubtitle: 'unsupported',
          promoBannerTagline: 'unsupported',
          promoBannerNote: 'unsupported',
          showQuantitySelectorInModal: 'true',
          productCardSpacing: '24',
          productCardsPerRow: '6',
        },
      },
      config: {},
      parseTierConfig: jest.fn(() => []),
    };

    try {
      fullPageAnalyticsConfigMethods.parseConfiguration.call(context);

      expect(context.config).not.toHaveProperty('promoBannerSubtitle');
      expect(context.config).not.toHaveProperty('promoBannerTagline');
      expect(context.config).not.toHaveProperty('promoBannerNote');
      expect(context.config).not.toHaveProperty('showQuantitySelectorInModal');
      expect(context.config).not.toHaveProperty('productCardSpacing');
      expect(context.config).not.toHaveProperty('productCardsPerRow');
    } finally {
      global.window = originalWindow;
    }
  });
});
