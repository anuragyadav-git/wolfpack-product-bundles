import { buildSyncBundleConfiguration } from '../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server';

describe('PPB specific-link runtime snapshot', () => {
  it('publishes only the required flag and policy revision', () => {
    const config = buildSyncBundleConfiguration({
      id: 'bundle-1',
      shopId: 'test.myshopify.com',
      name: 'Bundle',
      description: '',
      status: 'active',
      bundleType: 'product_page',
      steps: [],
      pricing: null,
      offerPolicy: {
        specificLinkRequired: true,
        startsAt: null,
        endsAt: null,
        ruleVersion: 8,
      },
    }, 'gid://shopify/Product/1');

    expect(config.offerDelivery).toEqual({
      decisionRequired: true,
      specificLinkRequired: true,
      ruleVersion: 8,
    });
  });
});
