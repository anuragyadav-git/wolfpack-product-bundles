import { syncBundleStorefrontNow } from '../../../app/services/bundles/storefront-sync.server';

jest.mock('../../../app/db.server', () => ({
  __esModule: true,
  default: {
    bundle: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'bundle-1',
        publicNumber: 1,
        shopId: 'test.myshopify.com',
        bundleType: 'full_page',
        status: 'active',
        name: 'Targeted bundle',
        shopifyProductId: null,
        steps: [],
        pricing: null,
        offerPolicy: null,
      }),
    },
  },
}));

jest.mock('../../../app/services/cart-transform-service.server', () => ({
  CartTransformService: {
    completeSetup: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('../../../app/services/bundles/metafield-sync.server', () => ({
  updateBundleProductMetafields: jest.fn(),
}));

jest.mock('../../../app/services/theme-colors.server', () => ({
  syncThemeColors: jest.fn(),
}));

jest.mock('../../../app/services/bundles/bundle-parent-product.server', () => ({
  ensureBundleParentProduct: jest.fn(),
}));

jest.mock(
  '../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server',
  () => ({ buildFullPageBundleMetafieldConfig: jest.fn() }),
);

jest.mock(
  '../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server',
  () => ({ buildSyncBundleConfiguration: jest.fn() }),
);

const db = require('../../../app/db.server').default;

describe('storefront sync offer policy projection', () => {
  it('loads every policy field consumed by storefront eligibility', async () => {
    await syncBundleStorefrontNow({
      admin: { graphql: jest.fn() } as any,
      shopDomain: 'test.myshopify.com',
      bundleId: 'bundle-1',
      bundleType: 'full_page',
      reason: 'sync_bundle',
    });

    expect(db.bundle.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        offerPolicy: {
          select: {
            specificLinkRequired: true,
            priority: true,
            stopLowerPriority: true,
            scheduleMode: true,
            startsAt: true,
            endsAt: true,
            recurrenceFrequency: true,
            recurrenceTimezone: true,
            recurrenceAnchorDate: true,
            recurrenceWindowStartMinute: true,
            recurrenceWindowEndMinute: true,
            recurrenceTermination: true,
            recurrenceEndsOn: true,
            recurrenceRunCount: true,
            countryTargetingEnabled: true,
            countryTargetingMode: true,
            countryCodes: true,
            ruleVersion: true,
          },
        },
      }),
    }));
  });
});
